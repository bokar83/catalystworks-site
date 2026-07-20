/* Behavior proof for the /seat awaited-capture fix.
   Serves the real seat/index.html, stubs the capture endpoint + Stripe, and
   asserts the ordering guarantees the fix exists to provide. */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.SEAT_ROOT || 'D:/Ai_Sandbox/catalystworks-site';
const CAPTURE = 'https://agentshq.boubacarbarry.com/api/orc/workshop-register';

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { console.log('  PASS  ' + name); pass++; }
  else { console.log('  FAIL  ' + name + (extra ? ' :: ' + extra : '')); fail++; }
}

function serve() {
  return new Promise(res => {
    const s = http.createServer((req, rep) => {
      const f = path.join(ROOT, 'seat', 'index.html');
      rep.writeHead(200, { 'Content-Type': 'text/html' });
      rep.end(fs.readFileSync(f));
    });
    s.listen(0, '127.0.0.1', () => res(s));
  });
}

async function scenario(browser, base, opts) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const events = [];
  let captureBody = null;

  await page.route(CAPTURE, async route => {
    captureBody = JSON.parse(route.request().postData() || '{}');
    events.push('capture:start');
    await new Promise(r => setTimeout(r, opts.captureDelayMs));
    events.push('capture:done');
    if (opts.captureStatus === 0) return route.abort();
    await route.fulfill({ status: opts.captureStatus, contentType: 'application/json', body: '{"ok":true}' });
  });

  await page.route('https://buy.stripe.com/**', async route => {
    events.push('stripe:nav ' + route.request().url());
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>stripe stub</body></html>' });
  });

  await page.route('https://connect.facebook.net/**', r => r.abort());
  // Pixel calls must survive the navigation to Stripe, so they are pushed OUT to
  // node rather than kept on window (which the navigation destroys).
  const pixels = [];
  await page.exposeFunction('__pixelSink', (...a) => { pixels.push(a); });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  // Wrap fbq AFTER the page's own pixel snippet has defined it, else it clobbers us.
  await page.evaluate(() => {
    const prev = window.fbq;
    window.fbq = function () { try { window.__pixelSink.apply(null, Array.from(arguments)); } catch (e) {} if (prev) try { prev.apply(this, arguments); } catch (e) {} };
  });
  await page.fill('#seatEmail', 'buyer@example.com');
  await page.check('#agreeRefund');

  const t0 = Date.now();
  await page.click('#buyCta');

  // aria-busy must be visible while the capture is in flight
  let busySeen = false;
  for (let i = 0; i < 40; i++) {
    try { if (await page.locator('#buyCta').getAttribute('aria-busy', { timeout: 200 }) === 'true') { busySeen = true; break; } } catch (e) { break; }
    await page.waitForTimeout(25);
  }

  await page.waitForURL(/buy\.stripe\.com/, { timeout: 8000 }).catch(() => {});
  const elapsed = Date.now() - t0;
  const finalUrl = page.url();
  await page.waitForTimeout(150);
  await ctx.close();
  return { events, captureBody, busySeen, elapsed, finalUrl, pixels };
}

(async () => {
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();

  console.log('\n[1] Slow capture (1.2s) -- capture must COMPLETE before Stripe navigation');
  let r = await scenario(browser, base, { captureDelayMs: 1200, captureStatus: 200 });
  const iDone = r.events.indexOf('capture:done'), iNav = r.events.findIndex(e => e.startsWith('stripe:nav'));
  check('capture POST was sent', r.captureBody !== null);
  check('capture completed BEFORE navigation', iDone > -1 && iNav > -1 && iDone < iNav, JSON.stringify(r.events));
  check('email in POST body', r.captureBody && r.captureBody.email === 'buyer@example.com');
  check('seat_kind=paid preserved', r.captureBody && r.captureBody.seat_kind === 'paid');
  check('aria-busy shown during flight', r.busySeen);
  check('prefilled_email on Stripe URL', /prefilled_email=buyer%40example\.com/.test(r.finalUrl), r.finalUrl);
  check('attribution preserved on Stripe URL',
    /client_reference_id=ic_workshop_0730/.test(r.finalUrl) && /utm_campaign=ic_workshop_0730/.test(r.finalUrl), r.finalUrl);
  check('InitiateCheckout pixel fired', r.pixels.some(p => p[1] === 'InitiateCheckout'), JSON.stringify(r.pixels));

  console.log('\n[2] Hung capture (6s) -- 3s timeout backstop must still deliver the seat');
  r = await scenario(browser, base, { captureDelayMs: 6000, captureStatus: 200 });
  check('navigated to Stripe despite hung capture', /buy\.stripe\.com/.test(r.finalUrl), r.finalUrl);
  check('navigated within ~3s backstop (not 6s)', r.elapsed < 5000, r.elapsed + 'ms');
  check('prefilled_email still present on timeout path', /prefilled_email=/.test(r.finalUrl));

  console.log('\n[3] Failing capture (500 twice) -- seat must NOT be blocked, failure must be LOUD');
  r = await scenario(browser, base, { captureDelayMs: 30, captureStatus: 500 });
  check('navigated to Stripe despite capture failure', /buy\.stripe\.com/.test(r.finalUrl), r.finalUrl);
  check('LeadCaptureFailed pixel fired', r.pixels.some(p => p[1] === 'LeadCaptureFailed'), JSON.stringify(r.pixels));
  check('retried once (2 capture attempts)', r.events.filter(e => e === 'capture:start').length === 2, JSON.stringify(r.events));

  console.log('\n[4] Guards still hold');
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    let posted = false;
    await page.route(CAPTURE, r2 => { posted = true; r2.fulfill({ status: 200, body: '{}' }); });
    await page.route('https://buy.stripe.com/**', r2 => r2.fulfill({ status: 200, body: 'stub' }));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    // unticked refund box
    await page.fill('#seatEmail', 'buyer@example.com');
    await page.click('#buyCta', { force: true }); await page.waitForTimeout(400);
    check('refund-consent gate still blocks', !posted && !/stripe/.test(page.url()));
    // invalid email
    await page.check('#agreeRefund');
    await page.fill('#seatEmail', 'not-an-email');
    await page.click('#buyCta', { force: true }); await page.waitForTimeout(400);
    check('invalid email still hard-stops', !posted && !/stripe/.test(page.url()));
    check('resting href carries no email', !/prefilled_email/.test(await page.locator('#buyCta').getAttribute('href') || ''));
    await ctx.close();
  }

  await browser.close(); server.close();
  console.log('\n=== ' + pass + ' passed, ' + fail + ' failed ===');
  process.exit(fail ? 1 : 0);
})();
