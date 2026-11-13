#!/usr/bin/env python3
"""Ultra HDR versions of the logo, for the README.

A JPEG with a gain map (Adobe hdrgm XMP + MPF, read by Chrome, Edge and
Safari): on an HDR screen the mark's white goes past the page's white, while
the base image stays plain sRGB, so Firefox or an SDR screen shows the normal
logo, never a washed-out one. Written into docs/images/epc-logo/ as
<name>-<sha256:6>.jpg, like gen-logo.js: a changed setting writes new files.

Needs Pillow and numpy, and Playwright in $PW_DIR (see the screenshot-ha
skill) to render the SVGs:

    python3 scripts/gen-logo-hdr.py
"""
import hashlib
import io
import os
import re
import struct
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "images" / "epc-logo"
SIZE = 480  # four times the README's 120 px
STOPS = 3  # the mark's white up to 2^3 times SDR white
# A JPEG has no transparency: the corners take the page's background.
# "self": the render finds the mark on its own; the tile takes the page's
# background too, so no frame shows around it.
# "tile-black": a light page is white too, so the mark is found on a copy
# with the tile and the page turned black.
VERSIONS = {
    "epc-icon-hdr": ("epc-icon-dc8ccf.svg", "#ffffff", "tile-black"),
    "epc-icon-black-hdr": ("epc-icon-black-6f3254.svg", "#0d1117", "self"),
}

RENDER_JS = """
const { chromium } = require(process.argv[1]);
const [svg, bg, size, out] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +size, height: +size } });
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  await page.setContent(`<body style="margin:0;background:${bg}"><img src="${src}" width="${size}" height="${size}" style="display:block"></body>`);
  await page.waitForFunction(() => document.images[0].complete);
  await page.screenshot({ path: out });
  await browser.close();
})();
"""


def render(svg: str, background: str) -> Image.Image:
    playwright_dir = os.environ.get("PW_DIR") or os.path.join(os.environ.get("TMPDIR", "/tmp"), "epb-playwright")
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "render.png")
        subprocess.run(
            ["node", "-e", RENDER_JS, os.path.join(playwright_dir, "node_modules", "playwright"),
             svg, background, str(SIZE), out],
            check=True)
        return Image.open(out).convert("RGB")


def jpeg(image: Image.Image) -> bytes:
    out = io.BytesIO()
    image.save(out, "JPEG", quality=95, subsampling=0)
    return out.getvalue()


def segment(marker: int, body: bytes) -> bytes:
    return struct.pack(">BBH", 0xFF, marker, len(body) + 2) + body


XMP_NS = b"http://ns.adobe.com/xap/1.0/\x00"
RDF = ('<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.1.2">'
       '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">%s</rdf:RDF></x:xmpmeta>')


def ultra_hdr(base: Image.Image, mask: Image.Image) -> bytes:
    whiteness = np.asarray(mask, dtype=np.float32).min(axis=2) / 255
    gain = np.clip((whiteness - 0.7) / 0.3, 0, 1)  # the opaque white of the mark only
    gain_xmp = RDF % (
        '<rdf:Description rdf:about="" xmlns:hdrgm="http://ns.adobe.com/hdr-gain-map/1.0/" '
        'hdrgm:Version="1.0" hdrgm:GainMapMin="0" hdrgm:GainMapMax="%g" hdrgm:Gamma="1" '
        'hdrgm:OffsetSDR="0.015625" hdrgm:OffsetHDR="0.015625" hdrgm:HDRCapacityMin="0" '
        'hdrgm:HDRCapacityMax="%g" hdrgm:BaseRenditionIsHDR="False"/>' % (STOPS, STOPS))
    gain_raw = jpeg(Image.fromarray(np.round(gain * 255).astype(np.uint8), "L"))
    gain_map = gain_raw[:2] + segment(0xE1, XMP_NS + gain_xmp.encode()) + gain_raw[2:]
    primary_xmp = RDF % (
        '<rdf:Description rdf:about="" xmlns:Container="http://ns.google.com/photos/1.0/container/" '
        'xmlns:Item="http://ns.google.com/photos/1.0/container/item/" '
        'xmlns:hdrgm="http://ns.adobe.com/hdr-gain-map/1.0/" hdrgm:Version="1.0"><Container:Directory>'
        '<rdf:Seq><rdf:li rdf:parseType="Resource"><Container:Item Item:Semantic="Primary" '
        'Item:Mime="image/jpeg"/></rdf:li><rdf:li rdf:parseType="Resource"><Container:Item '
        'Item:Semantic="GainMap" Item:Mime="image/jpeg" Item:Length="%d"/></rdf:li></rdf:Seq>'
        '</Container:Directory></rdf:Description>' % len(gain_map))
    app1 = segment(0xE1, XMP_NS + primary_xmp.encode())
    raw = jpeg(base)
    # Pillow's JFIF APP0 stays first, the XMP and the MPF index follow it.
    app0_length = struct.unpack(">H", raw[4:6])[0] + 2 if raw[2:4] == b"\xff\xe0" else 0
    app0, body = raw[2:2 + app0_length], raw[2 + app0_length:]

    def mpf(primary_size: int, gain_offset: int) -> bytes:
        tiff = b"MM\x00\x2a" + struct.pack(">I", 8) + struct.pack(">H", 3)
        tiff += struct.pack(">HHI", 0xB000, 7, 4) + b"0100"
        tiff += struct.pack(">HHII", 0xB001, 4, 1, 2)
        tiff += struct.pack(">HHII", 0xB002, 7, 32, 50) + struct.pack(">I", 0)
        tiff += struct.pack(">IIIHH", 0x20030000, primary_size, 0, 0, 0)
        tiff += struct.pack(">IIIHH", 0, len(gain_map), gain_offset, 0, 0)
        return segment(0xE2, b"MPF\x00" + tiff)

    primary_size = 2 + len(app0) + len(app1) + len(mpf(0, 0)) + len(body)
    # MPF offsets count from its TIFF header: SOI, APP0, APP1, APP2 marker and "MPF\0".
    tiff_start = 2 + len(app0) + len(app1) + 4 + 4
    primary = b"\xff\xd8" + app0 + app1 + mpf(primary_size, primary_size - tiff_start) + body
    return primary + gain_map


def main() -> None:
    for name, (svg_name, background, mask_mode) in VERSIONS.items():
        svg = (OUT_DIR / svg_name).read_text(encoding="utf-8")
        if mask_mode == "self":
            svg = re.sub(r'(<rect[^>]*fill=")[^"]*"', rf'\g<1>{background}"', svg)
        base = render(svg, background)
        mask = base if mask_mode == "self" else render(
            re.sub(r'(<rect[^>]*fill=")[^"]*"', r'\g<1>#000000"', svg), "#000000")
        content = ultra_hdr(base, mask)
        target = OUT_DIR / f"{name}-{hashlib.sha256(content).hexdigest()[:6]}.jpg"
        is_new = not target.exists()
        if is_new:
            target.write_bytes(content)
        print(f"{'written ' if is_new else 'unchanged'} {target.relative_to(Path.cwd())}")


if __name__ == "__main__":
    main()
