#!/usr/bin/env python3
"""Restyle kit/index.html into the house visual language.

This is a RESTYLE, not a rebuild. Every functional thing shipped today stays
exactly where it is: the markup, all three scripts, every id, every data-copy
binding, the service worker registration, the links and the QR target. What
changes is the stylesheet, the display face, and a small amount of purely
decorative markup that carries the drawing apparatus (the cloth, the selvedge
edges and the zone rail).

Idempotent: refuses to run twice on an already-converted file.
"""
import re, sys, pathlib

ROOT = pathlib.Path(r"D:/Ai_Sandbox/cw-site-worktrees/wt-kit-house/kit")
TMP  = pathlib.Path(r"D:/tmp")

src  = (ROOT / "index.html").read_text(encoding="utf-8")
deck = (ROOT / "deck.html").read_text(encoding="utf-8")

if "class=\"cloth\"" in src:
    sys.exit("ALREADY CONVERTED - refusing to run twice")

# ---------------------------------------------------------------- 1. fonts
# The house display face is Anybody: a variable width/weight draft face, and
# the single strongest carrier of the house identity. Lift its @font-face
# verbatim out of the shipped deck so the two documents are byte-identical on
# type. Anton and Gloock (the previous display + serif) come out.
#
# Deliberate trade-off, stated rather than hidden: the deck also embeds Archivo
# and Azeret Mono. Adding both here would push the page past the ~2.5s throttled
# load budget, which is a hard non-negotiable, so the body and mono faces stay
# as the already-embedded Spline Sans / Spline Sans Mono. At body and caption
# sizes the difference between two grotesks and two monos is not legible; the
# difference between Anton and Anybody in a headline is the whole style.
m = re.search(r"@font-face\{font-family:'Anybody';.*?\}", deck, re.S)
if not m:
    sys.exit("FATAL: could not find the Anybody @font-face in deck.html")
anybody = m.group(0)

faces = re.findall(r"@font-face\{.*?\}", src, re.S)
keep = [f for f in faces if "'Spline Sans'" in f or "'Spline Sans Mono'" in f]
if len(keep) != 2:
    sys.exit("FATAL: expected exactly 2 Spline faces to keep, found %d" % len(keep))

new_fonts = anybody + "\n" + "\n".join(keep) + "\n"

# ------------------------------------------------------ 2. the stylesheets
styles = list(re.finditer(r"<style[^>]*>(.*?)</style>", src, re.S))
if len(styles) != 4:
    sys.exit("FATAL: expected 4 style blocks, found %d" % len(styles))

new_main = new_fonts + (TMP / "kit-house.css").read_text(encoding="utf-8")
replacements = [
    new_main,
    (TMP / "kit-scoped-1.css").read_text(encoding="utf-8"),
    (TMP / "kit-scoped-2.css").read_text(encoding="utf-8"),
    (TMP / "kit-scoped-3.css").read_text(encoding="utf-8"),
]

out = []
last = 0
for st, rep in zip(styles, replacements):
    out.append(src[last:st.start(1)])
    out.append(rep)
    last = st.end(1)
out.append(src[last:])
src = "".join(out)

# --------------------------------------------- 3. the drawing apparatus DOM
# Six warped strips at full bleed, fixed under everything, plus the selvedge
# the cloth is finished with. Decorative and aria-hidden: a screen reader is
# told nothing new, and nothing here is focusable or clickable.
CLOTH = (
    '\n<!-- the cloth: six warped indigo strips, fixed so it does not scroll\n'
    '     away from under the drawing. Decoration only. -->\n'
    '<div class="cloth" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>\n'
    '<div class="edge" aria-hidden="true"></div>\n'
    '<div class="sheet">\n'
    '  <div class="zonerail" id="rail" aria-hidden="true"></div>\n'
)
anchor = '<div class="sr" role="status" aria-live="polite" id="announce"></div>'
if anchor not in src:
    sys.exit("FATAL: could not find the live-region anchor")
src = src.replace(anchor, anchor + CLOTH, 1)

# close .sheet before the floating control, which is fixed and belongs outside
close_anchor = '<button id="top" type="button"'
if close_anchor not in src:
    sys.exit("FATAL: could not find the back-to-top control")
src = src.replace(close_anchor,
                  '</div><!-- /.sheet -->\n<div class="edge" aria-hidden="true"></div>\n\n'
                  + close_anchor, 1)

# ------------------------------------------------------------- 4. the zones
# The rail is only worth its 34px if it tells the truth about where you are, so
# every letter is anchored to a real section. I is skipped, the way a drawing
# sheet skips it, because it reads as a 1.
ZONES = [
    ('<header class="wrap masthead">',                       'A'),
    ('<section class="wrap" aria-labelledby="vault-h">',     'B'),
    ('<section class="wrap start" id="start"',               'C'),
    ('<section class="band ink station" id="brain"',         'D'),
    ('<section class="band station" id="council"',           'E'),
    ('<section class="band ink station" id="simplicity"',    'F'),
    ('<section class="band station" id="keepit"',            'G'),
    ('<section class="band warm station" id="recipes"',      'H'),
    ('<section class="band warm station" aria-labelledby="prin-h">',  'J'),
    ('<section class="band ink station" aria-labelledby="close-h">',  'K'),
    ('<section class="band warm" id="next"',                 'L'),
]
for needle, z in ZONES:
    if needle not in src:
        sys.exit("FATAL: zone anchor not found: %s" % needle)
    new = needle
    # the two reserve/close sheets are addressed by aria-labelledby, not by id,
    # so they get an explicit class to hang the sheet treatment on
    if z == 'J':
        new = new.replace('station"', 'station principles-sheet"')
    if z == 'K':
        new = new.replace('station"', 'station close-sheet"')
    if new.endswith('>'):
        new = new[:-1].rstrip() + ' data-zone="%s">' % z
    else:
        new = new + ' data-zone="%s"' % z
    src = src.replace(needle, new, 1)

# ---------------------------------------------------------- 5. the rail JS
RAIL_JS = """
<script>
/* The zone rail is the drawing sheet's edge lettering, turned into a ruler down
   the side of a scroll. It only earns its place if it is telling the truth, so
   letters are anchored to real sections, ticked at the real boundaries, and the
   letter for the zone you are in follows you down and stops at its own. Reads
   layout, writes nothing, touches no storage and makes no network call. */
(function(){
  var rail = document.getElementById('rail');
  if(!rail) return;
  var secs = [].slice.call(document.querySelectorAll('[data-zone]'));
  if(!secs.length) return;
  function place(){
    var railTop = rail.getBoundingClientRect().top + window.scrollY;
    rail.innerHTML = secs.map(function(el){
      var top = el.getBoundingClientRect().top + window.scrollY - railTop;
      return '<i style="top:' + Math.round(top) + 'px"></i>' +
             '<span data-z="' + el.dataset.zone + '" data-home="' + Math.round(top + 26) +
             '" style="top:' + Math.round(top + 26) + 'px">' + el.dataset.zone + '</span>';
    }).join('');
    mark();
  }
  function mark(){
    var railTop = rail.getBoundingClientRect().top + window.scrollY;
    var y = window.scrollY + window.innerHeight * 0.34, cur = secs[0];
    secs.forEach(function(el){ if (el.getBoundingClientRect().top + window.scrollY <= y) cur = el; });
    [].forEach.call(rail.querySelectorAll('span'), function(sp){
      var on = sp.dataset.z === cur.dataset.zone;
      sp.classList.toggle('on', on);
      if (!on){ sp.style.top = sp.dataset.home + 'px'; return; }
      var r = cur.getBoundingClientRect();
      var top = r.top + window.scrollY - railTop, bot = top + r.height - 40;
      sp.style.top = Math.round(Math.max(top + 26, Math.min(window.scrollY - railTop + 78, bot))) + 'px';
    });
  }
  var t;
  window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(place, 120); });
  window.addEventListener('scroll', mark, {passive:true});
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  window.addEventListener('load', place);
  place();
})();
</script>
"""
src = src.replace('</body>', RAIL_JS + '</body>', 1)

# ------------------------------------- 6. strip the previous palette's inline colours
# Five inline `style="color:#..."` attributes were hardcoded against the bone
# paper palette. An inline colour beats any stylesheet, so on the woven ground
# they survived the restyle and one of them (#8C8271 under the Calendly stamp)
# measured 3.19:1, under AA. Removing the declaration lets each element inherit
# the colour its own ground already sets, which is what every other line does.
LEGACY = [
    ('style="color:#8C8271"',                  ''),
    ('style="color:#B9AE9C"',                  ''),
    ('style="color:#B9AE9C;margin-top:16px"',  'style="margin-top:16px"'),
    ('style="color:#B9AE9C;margin-top:20px"',  'style="margin-top:20px"'),
    ('style="margin-top:22px;color:#DCD3C2"',  'style="margin-top:22px"'),
]
for old, new in LEGACY:
    if old not in src:
        sys.exit("FATAL: legacy inline colour not found: %s" % old)
    src = src.replace(old, new)
import re as _re
left = _re.findall(r'style="[^"]*color:#[0-9A-Fa-f]{3,6}[^"]*"', src)
if left:
    sys.exit("FATAL: legacy inline colours remain: %s" % left)

(ROOT / "index.html").write_text(src, encoding="utf-8")
print("OK bytes=%d" % len(src.encode("utf-8")))
