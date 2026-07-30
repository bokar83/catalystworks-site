import asyncio, pathlib, http.server, socketserver, threading, functools, gzip, os

ROOT = r"D:/Ai_Sandbox/cw-site-worktrees/wt-kit-house/kit"
PORT = 8795
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(socketserver.TCPServer): allow_reuse_address = True
httpd = Q(("127.0.0.1", PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

raw = open(os.path.join(ROOT, "index.html"), "rb").read()
print("index.html raw      %6.1f KB" % (len(raw)/1024))
print("index.html gzip     %6.1f KB" % (len(gzip.compress(raw, 9))/1024))
try:
    import brotli
    print("index.html brotli   %6.1f KB" % (len(brotli.compress(raw, quality=11))/1024))
except ImportError:
    print("index.html brotli   (brotli module not installed, skipped)")

async def main():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for label, kbps, latency in (("Fast 3G", 1600, 150), ("Slow 4G", 3000, 100)):
            ctx = await b.new_context(viewport={"width": 375, "height": 780})
            pg = await ctx.new_page()
            cdp = await ctx.new_cdp_session(pg)
            await cdp.send("Network.enable")
            await cdp.send("Network.emulateNetworkConditions", {
                "offline": False, "latency": latency,
                "downloadThroughput": int(kbps * 1024 / 8),
                "uploadThroughput": int(kbps * 1024 / 8)})
            await pg.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="load")
            t = await pg.evaluate("""()=>{
              const n=performance.getEntriesByType('navigation')[0];
              const fcp=performance.getEntriesByName('first-contentful-paint')[0];
              return {ttfb:Math.round(n.responseStart), domContentLoaded:Math.round(n.domContentLoadedEventEnd),
                      load:Math.round(n.loadEventEnd), fcp: fcp?Math.round(fcp.startTime):null,
                      transfer:Math.round(n.transferSize/1024)};
            }""")
            print(f"{label:9} ({kbps}kbps/{latency}ms RTT): FCP {t['fcp']}ms  DOMContentLoaded {t['domContentLoaded']}ms  load {t['load']}ms  transferred {t['transfer']}KB")
            await ctx.close()
        await b.close()
asyncio.run(main())
httpd.shutdown()
