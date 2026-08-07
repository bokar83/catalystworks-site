import asyncio, pathlib, sys, http.server, socketserver, threading, functools, os, json

ROOT = r"D:/Ai_Sandbox/cw-site-worktrees/wt-kit-house/kit"
OUT  = pathlib.Path(r"D:/Ai_Sandbox/cw-site-worktrees/wt-kit-house/docs/kit-house-style-0730/shots")
OUT.mkdir(parents=True, exist_ok=True)
PORT = 8791

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(socketserver.TCPServer):
    allow_reuse_address = True
httpd = Q(("127.0.0.1", PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

URL = f"http://127.0.0.1:{PORT}/index.html"

STATIONS = [
    ("masthead",  "header.masthead"),
    ("vault",     ".vault"),
    ("start",     "#start"),
    ("brain",     "#brain"),
    ("council",   "#council"),
    ("simplicity","#simplicity"),
    ("keepit",    "#keepit"),
    ("recipes",   "#recipes"),
    ("principles",".principles-sheet"),
    ("close",     ".close-sheet"),
    ("next",      "#next"),
    ("foot",      ".foot"),
]

async def main():
    from playwright.async_api import async_playwright
    report = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()

        for label, w, h in (("desktop", 1440, 900), ("mobile", 375, 780)):
            ctx = await b.new_context(viewport={"width": w, "height": h},
                                      device_scale_factor=2,
                                      permissions=["clipboard-read", "clipboard-write"])
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.on("console", lambda m: errs.append("console:" + m.type + ":" + m.text)
                  if m.type == "error" else None)
            reqs = []
            pg.on("request", lambda r: reqs.append(r.url))
            await pg.goto(URL, wait_until="networkidle")
            await pg.wait_for_timeout(700)

            # horizontal scroll check
            hscroll = await pg.evaluate(
                "()=>({doc:document.documentElement.scrollWidth,win:window.innerWidth})")
            report[label + "_hscroll"] = hscroll

            await pg.screenshot(path=str(OUT / f"{label}-full.png"), full_page=True)
            await pg.screenshot(path=str(OUT / f"{label}-top.png"))

            for name, sel in STATIONS:
                el = await pg.query_selector(sel)
                if not el:
                    report.setdefault("missing", []).append(f"{label}:{sel}")
                    continue
                await el.scroll_into_view_if_needed()
                await pg.wait_for_timeout(220)
                try:
                    await el.screenshot(path=str(OUT / f"{label}-{name}.png"))
                except Exception as e:
                    report.setdefault("shot_err", []).append(f"{label}:{name}:{e}")

            report[label + "_requests"] = sorted(set(
                r for r in reqs if not r.startswith(f"http://127.0.0.1:{PORT}")))
            report[label + "_errors"] = errs

            if label == "mobile":
                # back-to-top must not sit on body text
                await pg.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await pg.wait_for_timeout(600)
                await pg.screenshot(path=str(OUT / "mobile-foot-backtotop.png"))
                overlap = await pg.evaluate("""()=>{
                  const t=document.getElementById('top');
                  if(!t) return 'no #top';
                  const r=t.getBoundingClientRect();
                  const cx=r.left+r.width/2, cy=r.top+r.height/2;
                  const hits=document.elementsFromPoint(cx,cy).map(e=>e.tagName+'.'+(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className));
                  // what is directly under the four corners of the button
                  const probe=[[r.left-6,cy],[r.left-6,r.top-6],[cx,r.top-6]].map(([x,y])=>{
                    const el=document.elementFromPoint(x,y);
                    return el? (el.tagName+'|'+(el.textContent||'').trim().slice(0,60)) : null;
                  });
                  return {onClass:t.className, rect:{t:r.top,l:r.left,w:r.width,h:r.height},
                          stack:hits.slice(0,4), behind:probe};
                }""")
                report["mobile_backtotop"] = overlap

            await ctx.close()

        # ---- functional: clipboard, empty-copy guard, nav numbers ----
        ctx = await b.new_context(viewport={"width": 1440, "height": 900},
                                  permissions=["clipboard-read", "clipboard-write"])
        pg = await ctx.new_page()
        await pg.goto(URL, wait_until="networkidle")
        await pg.wait_for_timeout(500)

        # state 1: totally blank brain form -> must REFUSE to copy
        await pg.click('button.copybar[data-copy="out-brain"]')
        await pg.wait_for_timeout(300)
        report["guard_blank_label"] = await pg.inner_text(
            'button.copybar[data-copy="out-brain"] .lbl')
        report["guard_blank_class"] = await pg.get_attribute(
            'button.copybar[data-copy="out-brain"]', "class")
        report["guard_blank_announce"] = await pg.inner_text("#announce")

        # state 2: partly filled -> copies, and says how many are blank
        await pg.fill("#b_what", "A two truck heating and air company in the south valley")
        await pg.wait_for_timeout(700)
        await pg.click('button.copybar[data-copy="out-brain"]')
        await pg.wait_for_timeout(400)
        report["guard_partial_label"] = await pg.inner_text(
            'button.copybar[data-copy="out-brain"] .lbl')
        report["guard_partial_class"] = await pg.get_attribute(
            'button.copybar[data-copy="out-brain"]', "class")
        report["clipboard_after_partial"] = (await pg.evaluate(
            "()=>navigator.clipboard.readText()"))[:180]

        # the Council premortem BONUS button must still be there and copy
        pm = await pg.query_selector('button[data-copy="out-premortem"]')
        report["premortem_button_present"] = bool(pm)
        if pm:
            await pm.scroll_into_view_if_needed()
            await pm.click()
            await pg.wait_for_timeout(350)
            report["premortem_clipboard"] = await pg.evaluate(
                "()=>navigator.clipboard.readText()")
            report["premortem_label"] = await pg.inner_text(
                'button[data-copy="out-premortem"] .lbl')

        # nav numbers 01-04
        report["nav_items"] = await pg.eval_on_selector_all(
            "#qnl a", "els=>els.map(e=>e.textContent.trim())")
        # exactly one promptbox per tool station
        report["promptboxes"] = await pg.evaluate("""()=>{
          const o={};
          ['brain','council','simplicity','keepit'].forEach(id=>{
            const s=document.getElementById(id);
            o[id]= s? s.querySelectorAll('.promptbox').length : 'MISSING';
          });
          return o;
        }""")
        # wifi wording + step zero + local-only proof
        report["wifi_line"] = await pg.evaluate(
            "()=>[...document.querySelectorAll('.vault p')].map(p=>p.textContent.trim()).find(t=>/wifi/i.test(t))")
        report["step_zero_link"] = await pg.get_attribute("#start a", "href")
        report["sw_registered"] = await pg.evaluate(
            "()=>navigator.serviceWorker.getRegistrations().then(r=>r.length)")
        report["persist_check"] = await pg.evaluate(
            "()=>localStorage.getItem('kit0730.b_what')")

        # ---- contrast audit: walk every visible text node, resolve the real
        # painted background by climbing until something is not transparent,
        # and report anything under WCAG AA for its size. This is how the
        # ink-on-indigo report block was caught; it must not hide anywhere else.
        report["contrast_fails"] = await pg.evaluate("""()=>{
          const px = c => { const m=c.match(/[\\d.]+/g); return m?m.map(Number):null; };
          const lum = ([r,g,b]) => { const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
            return .2126*f(r)+.7152*f(g)+.0722*f(b); };
          const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
          function bgOf(el){
            let n=el;
            while(n && n!==document.documentElement){
              const c=px(getComputedStyle(n).backgroundColor);
              if(c && (c.length<4 || c[3]>0.5)) return c.slice(0,3);
              n=n.parentElement;
            }
            return [22,48,94];
          }
          const out=[];
          document.querySelectorAll('body *').forEach(el=>{
            if(el.closest('.sr,#announce,.cloth,.zonerail')) return;
            const s=getComputedStyle(el);
            if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity)===0) return;
            const txt=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
            if(!txt) return;
            const r=el.getBoundingClientRect(); if(!r.width||!r.height) return;
            const fg=px(s.color); if(!fg) return;
            const size=parseFloat(s.fontSize), bold=parseInt(s.fontWeight,10)>=700;
            const large = size>=24 || (size>=18.66 && bold);
            const need = large?3.0:4.5;
            // element opacity multiplies the effective foreground
            const op=parseFloat(s.opacity);
            const bg=bgOf(el);
            const eff = op<1 ? fg.slice(0,3).map((v,i)=>v*op+bg[i]*(1-op)) : fg.slice(0,3);
            const cr=ratio(eff,bg);
            if(cr < need) out.push({sel:el.tagName+'.'+(typeof el.className==='string'?el.className:''),
                                    text:txt.slice(0,50), ratio:+cr.toFixed(2), need, size:+size.toFixed(1)});
          });
          return out;
        }""")
        await ctx.close()
        await b.close()

    (OUT / "qa-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2)[:6000])

asyncio.run(main())
httpd.shutdown()
