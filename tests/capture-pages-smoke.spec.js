/* Behavioral proof that the awaited-capture fix is LIVE on the three sibling
   capture pages. Runs against the HTML actually served by catalystworks.consulting
   (fetched from the VPS), not against the repo. */
const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs');
const CAPTURE = 'https://agentshq.boubacarbarry.com/api/orc/workshop-register';
let pass = 0, fail = 0;
const check = (n, c, e) => { c ? (console.log('  PASS  ' + n), pass++) : (console.log('  FAIL  ' + n + (e ? ' :: ' + e : '')), fail++); };

(async () => {
  const browser = await chromium.launch();
  for (const p of ['ai-checklist', 'workshop', 'workshop-b']) {
    console.log('\n===== LIVE /' + p + '/ =====');
    const file = process.env.LIVE_DIR + '/' + p + '/index.html';
    const srv = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'text/html' }); r.end(fs.readFileSync(file)); });
    await new Promise(r => srv.listen(0, '127.0.0.1', r));
    const base = 'http://127.0.0.1:' + srv.address().port + '/';
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    const events = []; let body = null;
    await page.route(CAPTURE, async route => {
      body = JSON.parse(route.request().postData() || '{}');
      events.push('capture:start');
      await new Promise(r => setTimeout(r, 1200));          // slow connection
      events.push('capture:done');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.route('https://buy.stripe.com/**', route => {
      events.push('stripe:nav ' + route.request().url());
      route.fulfill({ status: 200, contentType: 'text/html', body: 'stub' });
    });
    await page.route('https://connect.facebook.net/**', r => r.abort());
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const form = page.locator('.cta-form').first();
    await form.locator('.cta-email').fill('buyer@example.com');
    const agree = form.locator('.agree-refund');
    if (await agree.count()) await agree.check();          // paid pages gate on refund consent
    await page.waitForTimeout(120);
    await form.locator('button[type=submit]').click();
    let busy = false;
    for (let i = 0; i < 40; i++) {
      try { if (await form.locator('button[type=submit]').getAttribute('aria-busy', { timeout: 200 }) === 'true') { busy = true; break; } } catch (e) { break; }
      await page.waitForTimeout(25);
    }
    await page.waitForURL(/buy\.stripe\.com/, { timeout: 9000 }).catch(() => {});
    const iDone = events.indexOf('capture:done'), iNav = events.findIndex(e => e.startsWith('stripe:nav'));
    check('capture POST sent', body !== null);
    check('capture COMPLETED before Stripe navigation', iDone > -1 && iNav > -1 && iDone < iNav, JSON.stringify(events));
    check('email in POST body', body && body.email === 'buyer@example.com');
    check('busy state shown during flight', busy);
    check('prefilled_email on Stripe URL', /prefilled_email=buyer%40example\.com/.test(page.url()), page.url());
    // Back-navigation: a buyer who bounced off Stripe and returns must still be
    // able to click Pay. Checks the same restore-ordering defect found on /seat.
    if (/buy\.stripe\.com/.test(page.url())) {
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      const f2 = page.locator('.cta-form').first();
      const btn2 = f2.locator('button[type=submit]');
      const dis = await btn2.isDisabled();
      const agreeChecked = (await f2.locator('.agree-refund').count()) ? await f2.locator('.agree-refund').isChecked() : null;
      check('pay button usable after back-navigation', !dis,
        'disabled=' + dis + ' consentBoxChecked=' + agreeChecked + ' busy=' + await btn2.getAttribute('aria-busy'));
    }
    await ctx.close(); srv.close();
  }
  await browser.close();
  console.log('\n=== ' + pass + ' passed, ' + fail + ' failed ===');
  process.exit(fail ? 1 : 0);
})();
