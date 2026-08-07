/* Does "digits then enter" land where the help overlay promises?
   Help says: "digits then enter -> go to that stamped slide number".
   Test 25, since slide 25 is the one that must read "Same project. New chat." */
const { chromium } = require('D:/Ai_Sandbox/agentsHQ/node_modules/playwright');
const path = require('path');
const REPO = 'D:/Ai_Sandbox/cw-site-worktrees/wt-deck-judge-0729';
const OUT = path.join(REPO, 'docs/audits/deck-present-0729/shots');
const FILE_URL = 'file:///' + path.join(REPO, 'kit/deck-present.html').replace(/\\/g, '/');

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, offline: true });
  const page = await ctx.newPage();
  await page.goto(FILE_URL, { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  const read = () => page.evaluate(() => {
    const s = document.querySelector('#deck section.s.live');
    const foot = s ? s.querySelector('.foot, .pg, .num, [class*="stamp"]') : null;
    // grab the last small text node in the slide as the stamp, whatever its class
    let stamp = null;
    if (s) {
      const cands = Array.from(s.querySelectorAll('*')).filter((e) => {
        const t = (e.textContent || '').trim();
        return t.length <= 3 && t.length > 0 && e.children.length === 0;
      });
      stamp = cands.length ? cands[cands.length - 1].textContent.trim() : null;
    }
    return {
      counter: (document.getElementById('ptcount') || {}).textContent,
      head: (s ? s.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 60),
      stamp, footCls: foot ? foot.className : null,
    };
  });

  for (const q of ['25', '30']) {
    await page.keyboard.press('Home'); await page.waitForTimeout(500);
    for (const ch of q) { await page.keyboard.press(ch); await page.waitForTimeout(120); }
    await page.keyboard.press('Enter'); await page.waitForTimeout(900);
    const r = await read();
    console.log(`typed "${q}" + Enter  ->  counter=${r.counter}  stamp=${r.stamp}  :: ${r.head}`);
    await page.screenshot({ path: path.join(OUT, `navprobe-digits-${q}.png`) });
  }

  // lettered jump, as the help describes: O then a letter then enter
  await page.keyboard.press('Home'); await page.waitForTimeout(400);
  await page.keyboard.press('o'); await page.waitForTimeout(400);
  await page.keyboard.press('c'); await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  const rc = await read();
  console.log(`jump list "C" + Enter -> counter=${rc.counter} stamp=${rc.stamp} :: ${rc.head}`);
  await page.screenshot({ path: path.join(OUT, 'navprobe-letter-C.png') });

  await b.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
