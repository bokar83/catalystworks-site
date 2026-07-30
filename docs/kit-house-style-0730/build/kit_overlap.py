import asyncio, http.server, socketserver, threading, functools, json
ROOT = r"D:/Ai_Sandbox/cw-site-worktrees/wt-kit-house/kit"
PORT = 8797
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class Q(socketserver.TCPServer): allow_reuse_address = True
httpd = Q(("127.0.0.1", PORT), Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

CHECK = """()=>{
  const t=document.getElementById('top');
  const r=t.getBoundingClientRect();
  if(getComputedStyle(t).opacity==='0') return {skip:'button hidden'};
  const hits=[];
  document.querySelectorAll('p,li,label,h1,h2,h3,pre,a,b,summary,button,input,textarea').forEach(el=>{
    if(el===t||t.contains(el)) return;
    const s=getComputedStyle(el);
    if(s.display==='none'||s.visibility==='hidden') return;
    // only elements that actually paint text/controls
    const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
    const isCtl=/INPUT|TEXTAREA|BUTTON/.test(el.tagName);
    if(!own&&!isCtl) return;
    for(const b of el.getClientRects()){
      if(b.width<2||b.height<2) continue;
      if(b.left<r.right&&b.right>r.left&&b.top<r.bottom&&b.bottom>r.top){
        hits.push({tag:el.tagName,cls:(typeof el.className==='string'?el.className:''),
                   text:(el.textContent||'').trim().slice(0,55)});
        break;
      }
    }
  });
  return {rect:{t:Math.round(r.top),l:Math.round(r.left)}, overlaps:hits};
}"""

async def main():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h,label in ((375,780,'375x780'),(390,844,'390x844'),(1440,900,'1440x900')):
            ctx=await b.new_context(viewport={'width':w,'height':h})
            pg=await ctx.new_page()
            await pg.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
            await pg.wait_for_timeout(500)
            total=await pg.evaluate("()=>document.body.scrollHeight")
            bad=[]
            y=0
            while y < total:
                await pg.evaluate(f"window.scrollTo(0,{y})")
                await pg.wait_for_timeout(90)
                res=await pg.evaluate(CHECK)
                if res.get('overlaps'):
                    bad.append({'scrollY':y, 'hits':res['overlaps'][:3]})
                y += int(h*0.5)
            print(f"--- {label}: {len(bad)} scroll positions where #top overlaps text/controls (of {total//int(h*0.5)+1} sampled)")
            for x in bad[:6]:
                print('   y=%d' % x['scrollY'], json.dumps(x['hits'])[:200])
            await ctx.close()
        await b.close()
asyncio.run(main())
httpd.shutdown()
