#!/usr/bin/env python3
"""Generate app icons for Dino Island Math Adventure.

Pure-Python rasterizer (no PIL): draws a friendly long-neck dinosaur with a
small 2x supersample for anti-aliasing, then writes valid PNGs.

Outputs:
  assets/adaptive-icon.png  1024  (transparent bg, dino only)
  assets/icon.png           1024  (cream bg + dino)
  assets/splash.png         1242x2436 (cream bg + centered dino)
  assets/favicon.png        64    (cream bg + dino)
"""

import zlib, struct

# ---- palette -------------------------------------------------------------
GREEN      = (123, 201, 80)
GREEN_DARK = (96, 170, 60)
LEAF       = (168, 224, 99)
CREAM      = (255, 249, 232)
DARK       = (47, 58, 61)
WHITE      = (255, 255, 255)

# ---- low level PNG -------------------------------------------------------
def write_png(path, w, h, rgba_bytes):
    raw = bytearray()
    stride = w * 4
    for y in range(h):
        raw.append(0)  # filter type 0
        raw += rgba_bytes[y * stride:(y + 1) * stride]
    def chunk(typ, data):
        c = typ + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    with open(path, 'wb') as f:
        f.write(sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b''))
    print("wrote", path, f"{w}x{h}")

# ---- supersample canvas (hard-edged opaque draws) ------------------------
class Canvas:
    def __init__(self, w, h):
        self.w = w
        self.h = h
        self.buf = bytearray(w * h * 4)  # transparent

    def _set(self, x, y, col):
        i = (y * self.w + x) * 4
        self.buf[i] = col[0]; self.buf[i+1] = col[1]; self.buf[i+2] = col[2]; self.buf[i+3] = 255

    def ellipse(self, cx, cy, rx, ry, col):
        x0 = max(0, int(cx - rx)); x1 = min(self.w - 1, int(cx + rx) + 1)
        y0 = max(0, int(cy - ry)); y1 = min(self.h - 1, int(cy + ry) + 1)
        rx2 = rx * rx; ry2 = ry * ry
        for y in range(y0, y1 + 1):
            dy = (y - cy)
            for x in range(x0, x1 + 1):
                dx = (x - cx)
                if dx * dx / rx2 + dy * dy / ry2 <= 1.0:
                    self._set(x, y, col)

    def rrect(self, x0, y0, x1, y1, rad, col):
        for y in range(max(0, int(y0)), min(self.h - 1, int(y1)) + 1):
            for x in range(max(0, int(x0)), min(self.w - 1, int(x1)) + 1):
                cx = min(max(x, x0 + rad), x1 - rad)
                cy = min(max(y, y0 + rad), y1 - rad)
                dx = x - cx; dy = y - cy
                if dx * dx + dy * dy <= rad * rad:
                    self._set(x, y, col)

    def polygon(self, pts, col):
        ys = [p[1] for p in pts]; xs = [p[0] for p in pts]
        y0 = max(0, int(min(ys))); y1 = min(self.h - 1, int(max(ys)) + 1)
        x0 = max(0, int(min(xs))); x1 = min(self.w - 1, int(max(xs)) + 1)
        n = len(pts)
        for y in range(y0, y1 + 1):
            yc = y + 0.5
            for x in range(x0, x1 + 1):
                xc = x + 0.5
                inside = False
                j = n - 1
                for i in range(n):
                    xi, yi = pts[i]; xj, yj = pts[j]
                    if (yi > yc) != (yj > yc):
                        xint = (xj - xi) * (yc - yi) / (yj - yi) + xi
                        if xc < xint:
                            inside = not inside
                    j = i
                if inside:
                    self._set(x, y, col)

    # 2x2 box downsample -> premultiplied RGBA at half size
    def downsample2(self):
        w2 = self.w // 2; h2 = self.h // 2
        out = bytearray(w2 * h2 * 4)
        src = self.buf; W = self.w
        for y in range(h2):
            for x in range(w2):
                sx = x * 2; sy = y * 2
                r = g = b = a = 0
                for oy in range(2):
                    for ox in range(2):
                        i = ((sy + oy) * W + (sx + ox)) * 4
                        al = src[i + 3]
                        if al:
                            r += src[i]; g += src[i+1]; b += src[i+2]; a += al
                o = (y * w2 + x) * 4
                # premultiplied: average covered color over the 4 samples
                out[o] = r // 4; out[o+1] = g // 4; out[o+2] = b // 4; out[o+3] = a // 4
        return out, w2, h2

# ---- the dinosaur --------------------------------------------------------
def draw_dino(c, W, margin):
    """Draw the dino into supersample canvas c (size W) within a safe margin."""
    inset = margin * W
    span = W - 2 * inset
    s = span / 1000.0
    OFX, OFY = 25, -10

    def mx(dx): return inset + (dx + OFX) * s
    def my(dy): return inset + (dy + OFY) * s
    def r(v):   return v * s

    # back plates (peek above the body)
    for (bx, by) in [(330, 505), (400, 478), (470, 470), (545, 500)]:
        c.ellipse(mx(bx), my(by), r(46), r(46), GREEN_DARK)

    # tail
    c.polygon([(mx(270), my(600)), (mx(95), my(548)), (mx(60), my(580)),
               (mx(115), my(620)), (mx(280), my(705))], GREEN)

    # far (back) leg
    c.rrect(mx(560), my(740), mx(640), my(905), r(40), GREEN_DARK)
    c.ellipse(mx(600), my(905), r(58), r(34), GREEN_DARK)

    # body
    c.ellipse(mx(470), my(640), r(252), r(186), GREEN)
    # belly highlight
    c.ellipse(mx(470), my(700), r(180), r(120), LEAF)

    # near (front) leg
    c.rrect(mx(400), my(760), mx(484), my(915), r(42), GREEN_DARK)
    c.ellipse(mx(442), my(915), r(60), r(34), GREEN_DARK)

    # neck (thick band from body to head)
    c.polygon([(mx(520), my(560)), (mx(636), my(300)), (mx(770), my(330)),
               (mx(660), my(605))], GREEN)

    # head + rounded snout
    c.ellipse(mx(742), my(262), r(132), r(132), GREEN)
    c.ellipse(mx(852), my(300), r(78), r(70), GREEN)

    # cheek
    c.ellipse(mx(720), my(310), r(40), r(34), LEAF)

    # eye + highlight
    c.ellipse(mx(770), my(232), r(30), r(30), DARK)
    c.ellipse(mx(760), my(222), r(11), r(11), WHITE)

    # friendly nostril / mouth dot
    c.ellipse(mx(880), my(296), r(12), r(12), DARK)

# ---- tile rendering ------------------------------------------------------
def render_tile(size, margin):
    """Return (premult_rgba, size) for a transparent tile with the dino."""
    ss = 2
    c = Canvas(size * ss, size * ss)
    draw_dino(c, size * ss, margin)
    premult, w2, h2 = c.downsample2()
    return premult, w2

def tile_to_straight(premult, n):
    """Premultiplied -> straight RGBA bytes (transparent background)."""
    out = bytearray(n * n * 4)
    for i in range(0, len(premult), 4):
        a = premult[i + 3]
        if a:
            out[i]   = min(255, premult[i]   * 255 // a)
            out[i+1] = min(255, premult[i+1] * 255 // a)
            out[i+2] = min(255, premult[i+2] * 255 // a)
            out[i+3] = a
    return out

def composite_on(bg_col, tile_premult, tn, out_w, out_h, ox, oy):
    """Alpha-composite a premultiplied dino tile over a solid bg canvas."""
    out = bytearray(out_w * out_h * 4)
    br, bg_, bb = bg_col
    # fill background opaque
    for i in range(0, len(out), 4):
        out[i] = br; out[i+1] = bg_; out[i+2] = bb; out[i+3] = 255
    for y in range(tn):
        ty = oy + y
        if ty < 0 or ty >= out_h:
            continue
        for x in range(tn):
            tx = ox + x
            if tx < 0 or tx >= out_w:
                continue
            si = (y * tn + x) * 4
            a = tile_premult[si + 3]
            if not a:
                continue
            di = (ty * out_w + tx) * 4
            inv = (255 - a)
            out[di]   = tile_premult[si]   + out[di]   * inv // 255
            out[di+1] = tile_premult[si+1] + out[di+1] * inv // 255
            out[di+2] = tile_premult[si+2] + out[di+2] * inv // 255
            out[di+3] = 255
    return out

# ---- build all assets ----------------------------------------------------
# Adaptive icon: dino on transparent, generous margin for launcher masking.
adapt, an = render_tile(1024, margin=0.16)
write_png("assets/adaptive-icon.png", an, an, tile_to_straight(adapt, an))

# App icon: cream square + dino (smaller margin so it reads at small sizes).
icon_tile, itn = render_tile(1024, margin=0.12)
write_png("assets/icon.png", 1024, 1024, composite_on(CREAM, icon_tile, itn, 1024, 1024, 0, 0))

# Favicon
fav_tile, fn = render_tile(64, margin=0.10)
write_png("assets/favicon.png", 64, 64, composite_on(CREAM, fav_tile, fn, 64, 64, 0, 0))

# Splash: cream canvas with a centered dino tile.
SW, SH = 1242, 2436
spl_tile, sn = render_tile(720, margin=0.06)
write_png("assets/splash.png", SW, SH, composite_on(CREAM, spl_tile, sn, SW, SH, (SW - sn) // 2, (SH - sn) // 2))
