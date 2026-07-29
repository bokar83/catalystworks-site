/* Presenter-deck rehearsal readiness check.
   Opens kit/deck-present.html from a real file:// URL with the context offline
   and every non-file request blocked, walks all 37 slides, and writes one
   1600x900 screenshot per slide. Evidence, not a source read. */
const { chromium } = require('D:/Ai_Sandbox/agentsHQ/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const REPO = 'D:/Ai_Sandbox/cw-site-worktrees/wt-deck-judge-0729';
const OUT = path.join(REPO, 'docs/audits/deck-present-0729/shots');
const FILE_URL = 'file:///' + path.join(REPO, 'kit/deck-present.html').replace(/\\/g, '/');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    offline: true,
  });
  await ctx.setOffline(true);

  const escaped = [];
  const consoleErrs = [];
  const pageErrs = [];

  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (!/^(file|data|blob):/i.test(u)) { escaped.push('ROUTE ' + u); return route.abort(); }
    return route.continue();
  });

  const page = await ctx.newPage();
  page.on('request', (r) => {
    const u = r.url();
    if (!/^(file|data|blob):/i.test(u)) escaped.push('REQ ' + u);
  });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', (e) => pageErrs.push(String(e)));

  await page.goto(FILE_URL, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const total = await page.$$eval('#deck section.s', (n) => n.length);

  const state = async () => page.evaluate(() => {
    const secs = Array.from(document.querySelectorAll('#deck section.s'));
    const liveIdx = secs.findIndex((s) => s.classList.contains('live'));
    const chrome = document.getElementById('ptchrome');
    const bar = document.getElementById('ptbar');
    const vis = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { display: cs.display, opacity: cs.opacity, visibility: cs.visibility,
               w: Math.round(r.width), h: Math.round(r.height),
               top: Math.round(r.top), left: Math.round(r.left) };
    };
    let overflow = null;
    if (liveIdx >= 0) {
      const s = secs[liveIdx];
      const sr = s.getBoundingClientRect();
      let worstR = 0, worstB = 0, worstEl = '';
      Array.from(s.querySelectorAll('*')).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        const ovR = r.right - sr.right, ovB = r.bottom - sr.bottom;
        if (ovR > worstR) { worstR = ovR; worstEl = el.tagName + '.' + String(el.className || '').slice(0, 40); }
        if (ovB > worstB) { worstB = ovB; worstEl = el.tagName + '.' + String(el.className || '').slice(0, 40); }
      });
      overflow = { right: Math.round(worstR), bottom: Math.round(worstB), el: worstEl,
                   scrollW: s.scrollWidth, clientW: s.clientWidth,
                   scrollH: s.scrollHeight, clientH: s.clientHeight };
    }
    const imgs = Array.from(document.querySelectorAll('#deck section.s.live img')).map((i) => ({
      src: String(i.currentSrc || i.src || '').slice(0, 50), nw: i.naturalWidth, nh: i.naturalHeight,
      w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height),
    }));
    const head = (secs[liveIdx] ? (secs[liveIdx].textContent || '') : '').replace(/\s+/g, ' ').trim().slice(0, 70);
    return { liveIdx,
             count: (document.getElementById('ptcount') || {}).textContent,
             clock: (document.getElementById('ptclock') || {}).textContent,
             chromeShown: chrome ? chrome.classList.contains('show') : null,
             chromeStyle: vis(chrome), barStyle: vis(bar), overflow, imgs, head };
  });

  const seen = [];
  for (let i = 1; i <= total + 2; i++) {
    const st = await state();
    if (i <= total) {
      await page.screenshot({ path: path.join(OUT, `slide-${String(i).padStart(2, '0')}.png`) });
    }
    seen.push({ step: i, live: st.liveIdx, count: st.count, ov: st.overflow, imgs: st.imgs, head: st.head });
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
  }

  await page.keyboard.press('End'); await page.waitForTimeout(700);
  const atEnd = await state();
  await page.screenshot({ path: path.join(OUT, 'nav-end.png') });
  await page.keyboard.press('Home'); await page.waitForTimeout(700);
  const atHome = await state();

  await page.mouse.click(1200, 450); await page.waitForTimeout(700);
  const afterClick1 = await state();
  await page.mouse.click(1200, 450); await page.waitForTimeout(700);
  const afterClick2 = await state();
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(600);
  const afterLeft = await state();
  await page.keyboard.press('Space'); await page.waitForTimeout(600);
  const afterSpace = await state();
  await page.keyboard.press('PageDown'); await page.waitForTimeout(600);
  const afterPgDn = await state();

  await page.keyboard.press('t'); await page.waitForTimeout(2600);
  const timerOn = await state();
  await page.screenshot({ path: path.join(OUT, 'chrome-timer-on.png') });

  await page.keyboard.press('g'); await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'chrome-jump-g.png') });
  const jumpG = await page.evaluate(() => {
    const j = document.getElementById('ptjump');
    return j ? { cls: j.className, disp: getComputedStyle(j).display, op: getComputedStyle(j).opacity } : null;
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);

  await page.keyboard.press('b'); await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'chrome-blank-b.png') });
  const blankB = await page.evaluate(() => {
    const b = document.getElementById('ptblank');
    return b ? { cls: b.className, op: getComputedStyle(b).opacity, disp: getComputedStyle(b).display } : null;
  });
  await page.keyboard.press('b'); await page.waitForTimeout(400);

  await page.keyboard.press('?'); await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'chrome-help.png') });

  fs.writeFileSync(path.join(OUT, '..', 'report.json'), JSON.stringify(
    { fileUrl: FILE_URL, total, escaped, consoleErrs, pageErrs, walk: seen,
      atEnd, atHome, afterClick1, afterClick2, afterLeft, afterSpace, afterPgDn,
      timerOn, jumpG, blankB }, null, 2));

  console.log('FILE:', FILE_URL);
  console.log('sections:', total, '| escaped network reqs:', escaped.length, escaped.slice(0, 5));
  console.log('pageerrors:', pageErrs.length, pageErrs.slice(0, 3));
  console.log('consoleerrors:', consoleErrs.length, consoleErrs.slice(0, 3));
  console.log('--- walk: step | liveIdx | counter | overflow | head ---');
  seen.forEach((s) => console.log(
    `  ${s.step}\t${s.live}\t${s.count}\tr=${s.ov ? s.ov.right : '-'} b=${s.ov ? s.ov.bottom : '-'}` +
    `${s.ov && (s.ov.right > 2 || s.ov.bottom > 2) ? ' OVERFLOW ' + s.ov.el : ''}` +
    `${s.imgs && s.imgs.length ? ' imgs=' + JSON.stringify(s.imgs) : ''}\t${s.head}`));
  console.log('END:', atEnd.count, '| HOME:', atHome.count);
  console.log('click1:', afterClick1.count, 'click2:', afterClick2.count,
              'left:', afterLeft.count, 'space:', afterSpace.count, 'pgdn:', afterPgDn.count);
  console.log('timer ~2.6s:', timerOn.clock, 'chromeShown:', timerOn.chromeShown,
              'chromeStyle:', JSON.stringify(timerOn.chromeStyle), 'barStyle:', JSON.stringify(timerOn.barStyle));
  console.log('jump(g):', JSON.stringify(jumpG), 'blank(b):', JSON.stringify(blankB));

  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
