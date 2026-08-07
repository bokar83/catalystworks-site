import asyncio, pathlib, http.server, socketserver, threading, functools

ROOT = r"D:/Ai_Sandbox/cw-site-worktrees/wt-kit-house/kit"
OUT  = pathlib.Path(r"D:/Ai_Sandbox/cw-site-worktrees/wt-kit-house/docs/kit-house-style-0730/shots")
OUT.mkdir(parents=True, exist_ok=True)
PORT = 8793
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(socketserver.TCPServer): allow_reuse_address = True
httpd = Q(("127.0.0.1", PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

async def main():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await (await b.new_context(viewport={"width":1100,"height":900},
                                        device_scale_factor=2)).new_page()
        await pg.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
        await pg.wait_for_timeout(500)
        # what a laser printer is actually handed
        await pg.pdf(path=str(OUT/"print.pdf"), format="Letter",
                     print_background=True, margin={"top":"14mm","bottom":"14mm",
                                                    "left":"14mm","right":"14mm"})
        # and what it looks like, in the print stylesheet, on screen
        await pg.emulate_media(media="print")
        await pg.wait_for_timeout(400)
        for i, y in enumerate([0, 1600, 3400]):
            await pg.evaluate(f"window.scrollTo(0,{y})")
            await pg.wait_for_timeout(250)
            await pg.screenshot(path=str(OUT/f"print-view-{i}.png"))
        # measure how much ink a laser actually lays down: sample the rendered
        # page and report how many pixels are dark. A grey smear shows up here.
        stats = await pg.evaluate("""()=>{
          const bg = getComputedStyle(document.body).backgroundColor;
          const q = s => { const e=document.querySelector(s); return e? getComputedStyle(e).backgroundColor+' / '+getComputedStyle(e).color : 'n/a'; };
          return {
            body: bg,
            station_wrap: q('#brain > .wrap'),
            reserve_sheet: q('#start'),
            promptbox: q('.promptbox'),
            promptpre: q('.promptbox pre'),
            input: q('#b_what'),
            cloth_display: getComputedStyle(document.querySelector('.cloth')).display,
            rail_display: getComputedStyle(document.querySelector('.zonerail')).display,
            nav_display: getComputedStyle(document.querySelector('#qn')).display,
            top_display: getComputedStyle(document.querySelector('#top')).display,
            copybar_display: getComputedStyle(document.querySelector('.copybar')).display,
            seam_display: getComputedStyle(document.querySelector('.seam')).display,
            h2_color: getComputedStyle(document.querySelector('#brain h2')).color,
            eyebrow_color: getComputedStyle(document.querySelector('#brain .eyebrow')).color,
            label_color: getComputedStyle(document.querySelector('#brain label')).color,
          };
        }""")
        for k,v in stats.items(): print(f"{k:18} {v}")
        await b.close()
asyncio.run(main())
httpd.shutdown()
