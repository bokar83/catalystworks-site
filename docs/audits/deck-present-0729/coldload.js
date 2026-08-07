/* Cold-load test: brand new browser + brand new profile dir, offline from the
   first byte, no cache. This is the venue-wifi-is-down scenario. */
const { chromium } = require('D:/Ai_Sandbox/agentsHQ/node_modules/playwright');
const path = require('path'); const fs = require('fs'); const os = require('os');

const REPO = 'D:/Ai_Sandbox/cw-site-worktrees/wt-deck-judge-0729';
const OUT = path.join(REPO, 'docs/audits/deck-present-0729/shots');
const FILE_URL = 'file:///' + path.join(REPO, 'kit/deck-present.html').replace(/\\/g, '/');
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'deckcold-'));

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    headless: true, viewport: { width: 1600, height: 900 }, offline: true,
  });
  await ctx.setOffline(true);
  const escaped = [];
  await ctx.route('**/*', (r) => {
    const u = r.request().url();
    if (!/^(file|data|blob):/i.test(u)) { escaped.push(u); return r.abort(); }
    return r.continue();
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('request', (r) => { const u = r.url(); if (!/^(file|data|blob):/i.test(u)) escaped.push('REQ ' + u); });
  const errs = []; page.on('pageerror', (e) => errs.push(String(e)));

  const t0 = Date.now();
  await page.goto(FILE_URL, { waitUntil: 'load' });
  const tLoad = Date.now() - t0;
  await page.waitForFunction(() => document.querySelectorAll('#deck section.s.live').length > 0,
                             null, { timeout: 15000 }).catch(() => {});
  const tReady = Date.now() - t0;
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'coldload-first-paint.png') });

  const info = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const res = performance.getEntriesByType('resource').map((r) => r.name.slice(0, 70));
    // are the embedded webfonts actually applied, or did it silently fall back?
    const h1 = document.querySelector('#deck section.s h1, #deck section.s .h, #deck section.s');
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
      loadEvent: Math.round(nav.loadEventEnd || 0),
      resources: res,
      fontsStatus: document.fonts ? document.fonts.status : 'n/a',
      fontsLoaded: document.fonts ? document.fonts.size : 'n/a',
      sampleFont: h1 ? getComputedStyle(h1).fontFamily.slice(0, 80) : null,
      sections: document.querySelectorAll('#deck section.s').length,
      deckReady: document.getElementById('deck').className,
    };
  });

  // last slide directly, cold
  await page.keyboard.press('End'); await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'coldload-last-slide.png') });

  console.log('cold load ms (load event):', tLoad, '| first live slide ms:', tReady);
  console.log('escaped network:', escaped.length, escaped.slice(0, 5));
  console.log('pageerrors:', errs.length, errs.slice(0, 3));
  console.log('perf dcl/load:', info.domContentLoaded, info.loadEvent);
  console.log('resource entries (should be none/self only):', info.resources.length, info.resources.slice(0, 8));
  console.log('fonts:', info.fontsStatus, 'count:', info.fontsLoaded, 'sample family:', info.sampleFont);
  console.log('sections:', info.sections, 'deck class:', info.deckReady);

  await ctx.close();
  fs.rmSync(PROFILE, { recursive: true, force: true });
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
