/* Once the elapsed timer is ON, does the presenter chrome ever hide again?
   bump() reads: if(t0 || hold===true) return;  -- which skips arming the
   auto-hide timeout. Test it for real: timer on, advance slides, no mouse. */
const { chromium } = require('D:/Ai_Sandbox/agentsHQ/node_modules/playwright');
const path = require('path');
const REPO = 'D:/Ai_Sandbox/cw-site-worktrees/wt-deck-judge-0729';
const OUT = path.join(REPO, 'docs/audits/deck-present-0729/shots');
const FILE_URL = 'file:///' + path.join(REPO, 'kit/deck-present.html').replace(/\\/g, '/');

const chromeState = (page) => page.evaluate(() => {
  const c = document.getElementById('ptchrome');
  const cs = c ? getComputedStyle(c) : null;
  const r = c ? c.getBoundingClientRect() : null;
  return {
    shown: c ? c.classList.contains('show') : null,
    opacity: cs ? cs.opacity : null,
    clock: (document.getElementById('ptclock') || {}).textContent,
    clockHidden: (document.getElementById('ptclock') || {}).className,
    count: (document.getElementById('ptcount') || {}).textContent,
    box: r ? { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) } : null,
  };
});

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, offline: true });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  console.log('BASELINE, timer off:');
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(4000);
  console.log('  after advance + 4s idle:', JSON.stringify(await chromeState(page)));
  await page.mouse.move(800, 450); await page.waitForTimeout(300);
  console.log('  right after mouse move :', JSON.stringify(await chromeState(page)));
  await page.waitForTimeout(4000);
  console.log('  4s after mouse move    :', JSON.stringify(await chromeState(page)));

  console.log('TIMER ON:');
  await page.keyboard.press('t'); await page.waitForTimeout(1000);
  console.log('  1s after pressing t    :', JSON.stringify(await chromeState(page)));
  for (let i = 0; i < 4; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1500); }
  console.log('  after 4 advances, 6s   :', JSON.stringify(await chromeState(page)));
  await page.waitForTimeout(8000);
  console.log('  + 8s more idle, no mouse:', JSON.stringify(await chromeState(page)));
  await page.screenshot({ path: path.join(OUT, 'timer-pinned-after-idle.png') });

  await page.keyboard.press('t'); await page.waitForTimeout(3500);
  console.log('  timer OFF + 3.5s idle  :', JSON.stringify(await chromeState(page)));
  await page.screenshot({ path: path.join(OUT, 'timer-off-after-idle.png') });

  await b.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
