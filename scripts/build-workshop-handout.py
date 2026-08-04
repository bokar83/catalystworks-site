#!/usr/bin/env python3
"""Render the one-page workshop handout to a print-ready PDF.

    python scripts/build-workshop-handout.py

Reads  docs/handouts/workshop-one-pager.html
Writes docs/handouts/workshop-one-pager.pdf

Two things get spliced into the source before rendering, so the source file
stays readable instead of carrying 200KB of base64 in the middle of it:

  /*FONTFACE*/    the three house faces, lifted from second-opinion/index.html
                  so the handout and the site render identically and the
                  faces never drift apart across two copies.
  /*QRDATAURI*/   the QR code, generated here at ECC level H and embedded as
                  a data URI, so the HTML source has no external asset to
                  lose track of.

Then it verifies what it made rather than assuming it:
  - the PDF is exactly one page
  - the QR inside the RENDERED PDF still decodes to the intended URL

Both checks raise on failure. A handout whose QR does not survive rendering
is worse than no handout, because it fails silently in somebody's hand.
"""

from __future__ import annotations

import base64
import io
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "handouts" / "workshop-one-pager.html"
OUT = ROOT / "docs" / "handouts" / "workshop-one-pager.pdf"
QR_PNG = ROOT / "docs" / "handouts" / "workshop-qr.png"
FONT_SRC = ROOT / "second-opinion" / "index.html"

TARGET_URL = "https://catalystworks.consulting/workshop/"

# The four @font-face blocks in second-opinion/index.html, 1-indexed and
# inclusive. Pulled by slice rather than by regex because each block's src
# line is a single ~75KB base64 string and a greedy pattern over that is
# both slow and easy to get subtly wrong.
FONT_LINES = (18, 28)


def house_fontface() -> str:
    lines = FONT_SRC.read_text(encoding="utf-8").split("\n")
    block = "\n".join(lines[FONT_LINES[0] - 1:FONT_LINES[1]])
    if not block.startswith("@font-face{font-family:'Anybody'"):
        raise SystemExit(
            f"{FONT_SRC} no longer starts its font block at line {FONT_LINES[0]}. "
            "Re-find the block before trusting this build."
        )
    for face in ("Anybody", "Archivo", "Azeret Mono"):
        if f"font-family:'{face}'" not in block:
            raise SystemExit(f"house font block is missing {face}")
    return block


def qr_datauri() -> str:
    import qrcode

    qr = qrcode.QRCode(
        version=None,
        # H tolerates the most damage. This gets printed on a home printer,
        # folded into a bag, and scanned in bad light.
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(TARGET_URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#16305E", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png = buf.getvalue()
    QR_PNG.write_bytes(png)
    return "data:image/png;base64," + base64.b64encode(png).decode()


# Letter, 14mm margins, in points. The WIDTH matters as much as the height:
# a narrower column makes the sheet taller, so measuring fit at the browser's
# default viewport says "fits" for a layout that actually spills onto a second
# page. Measure at the real printable width or do not measure at all.
MARGIN_PT = 14 / 25.4 * 72
AVAIL_H_PT = 792 - 2 * MARGIN_PT
PRINT_W_PX = round((612 - 2 * MARGIN_PT) * 96 / 72)


def render(html: str) -> None:
    from playwright.sync_api import sync_playwright

    staged = ROOT / "docs" / "handouts" / ".build.html"
    staged.write_text(html, encoding="utf-8")
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_page(viewport={"width": PRINT_W_PX, "height": 1000})
            pg.goto(staged.as_uri(), wait_until="networkidle")
            pg.emulate_media(media="print")
            pg.wait_for_timeout(400)

            h_pt = pg.evaluate("() => document.body.scrollHeight") * 72 / 96
            spare = AVAIL_H_PT - h_pt
            if spare < 0:
                raise SystemExit(
                    f"content is {-spare:.0f}pt taller than one Letter side. "
                    "Scale the type sizes down before rendering."
                )
            print(f"    fit: {h_pt:.0f}pt of {AVAIL_H_PT:.0f}pt, {spare:.0f}pt spare at the foot")

            pg.pdf(
                path=str(OUT),
                format="Letter",
                # Margins live in @page in the source; print_background is what
                # keeps the indigo panel and the woven edge from dropping out.
                print_background=True,
                prefer_css_page_size=True,
            )
            b.close()
    finally:
        staged.unlink(missing_ok=True)


def verify() -> None:
    import cv2
    import numpy as np
    import pypdfium2 as pdfium

    doc = pdfium.PdfDocument(str(OUT))
    pages = len(doc)
    if pages != 1:
        raise SystemExit(f"handout must be exactly 1 page, rendered {pages}")

    # Rasterise the rendered page and decode the QR out of the PDF itself,
    # not out of the PNG we generated. The PNG decoding proves nothing about
    # what actually landed on the sheet after scaling.
    bitmap = doc[0].render(scale=300 / 72)
    arr = np.array(bitmap.to_pil().convert("RGB"))[:, :, ::-1]
    text, _, _ = cv2.QRCodeDetector().detectAndDecode(arr)
    if text != TARGET_URL:
        raise SystemExit(f"QR in the rendered PDF decoded to {text!r}, expected {TARGET_URL!r}")

    print(f"OK  {OUT.relative_to(ROOT)}")
    print(f"    pages: {pages}")
    print(f"    QR decoded from rendered PDF: {text}")
    print(f"    size: {OUT.stat().st_size:,} bytes")


def main() -> int:
    html = SRC.read_text(encoding="utf-8")
    for token in ("/*FONTFACE*/", "/*QRDATAURI*/"):
        if token not in html:
            raise SystemExit(f"{SRC} is missing the {token} placeholder")
    html = html.replace("/*FONTFACE*/", house_fontface())
    html = html.replace("/*QRDATAURI*/", qr_datauri())
    render(html)
    verify()
    return 0


if __name__ == "__main__":
    sys.exit(main())
