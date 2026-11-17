#!/usr/bin/env python3
"""
RADAR - PWA ikon uretici (bagimlilik yok, sadece standart kutuphane).
Calistir:  python icons.py
Uretilenler: icon-192.png, icon-512.png, icon-maskable-512.png,
             apple-touch-icon.png, favicon-32.png
Ayni ayarlar her calistirmada ayni baytlari uretir; git diff sessiz kalir.
"""
import math
import struct
import zlib

# --- AYARLAR (icon-uret.html ile ayni varsayilanlar) ---
COLOR_1  = (59, 130, 246)     # #3B82F6
COLOR_2  = (139, 92, 246)     # #8B5CF6
SYMBOL   = (255, 255, 255)
GRAD_DEG = 135.0
RADIUS   = 0.22               # kose yuvarlakligi (0..0.5)
SYMBOL_K = 0.78               # sembol olcegi
STROKE_K = 0.050              # cizgi kalinligi
RINGS    = 2
DOT_K    = 0.078
GLOW_K   = 0.10

TARGETS = [
    ("icon-192.png",          192, RADIUS, SYMBOL_K),
    ("icon-512.png",          512, RADIUS, SYMBOL_K),
    ("icon-maskable-512.png", 512, 0.0,    0.60),
    ("apple-touch-icon.png",  180, 0.0,    SYMBOL_K),
    ("favicon-32.png",         32, RADIUS, 0.86),
]


def _render(size, radius_k, symbol_k, ss):
    """Supersample ile ciz, kutu filtreyle kucult (kenar yumusatma)."""
    W = size * ss
    cx = cy = W / 2.0
    half = W / 2.0
    rad = radius_k * W
    inner = half - rad
    a = math.radians(GRAD_DEG)
    gx, gy = math.cos(a), math.sin(a)
    span = abs(gx) + abs(gy) or 1.0

    ratio = symbol_k / SYMBOL_K
    lw = STROKE_K * W * ratio
    dot_r = DOT_K * W * ratio
    base = 0.19 * W * ratio
    step = 0.09 * W * ratio
    rings = [(base + i * step, max(0.10, 0.58 - i * 0.14)) for i in range(RINGS)]
    glow_r = dot_r + GLOW_K * W * ratio * 2.2
    r_lo = min(r for r, _ in rings) - lw
    r_hi = max(r for r, _ in rings) + lw

    buf = bytearray(W * W * 4)
    sr, sg, sb = SYMBOL
    c1r, c1g, c1b = COLOR_1
    c2r, c2g, c2b = COLOR_2
    dr, dg, db = c2r - c1r, c2g - c1g, c2b - c1b

    for y in range(W):
        dy = (y + 0.5) - cy
        ady = abs(dy) - inner
        oy = ady if ady > 0 else 0.0
        row = y * W * 4
        gy_part = (dy / W) * gy
        for x in range(W):
            dx = (x + 0.5) - cx
            adx = abs(dx) - inner
            ox = adx if adx > 0 else 0.0
            if adx > 0 and ady > 0:
                if ox * ox + oy * oy > rad * rad:
                    continue
            elif rad <= 0 and (adx > 0 or ady > 0):
                continue

            t = ((dx / W) * gx + gy_part) / span + 0.5
            if t < 0.0:
                t = 0.0
            elif t > 1.0:
                t = 1.0
            r = c1r + dr * t
            g = c1g + dg * t
            b = c1b + db * t

            dist = math.sqrt(dx * dx + dy * dy)

            if dist < glow_r:
                k = (1.0 - dist / glow_r) ** 2 * 0.42
                r += (sr - r) * k
                g += (sg - g) * k
                b += (sb - b) * k

            hit = 0.0
            if dist <= dot_r:
                hit = 1.0
            elif r_lo <= dist <= r_hi:
                deg = math.degrees(math.atan2(dy, dx))
                if (deg >= 135.0 or deg <= -135.0) or (-45.0 <= deg <= 45.0):
                    for rr, alpha in rings:
                        d = abs(dist - rr)
                        if d <= lw / 2.0:
                            edge = 1.0 - (d / (lw / 2.0)) * 0.30
                            v = alpha * edge
                            if v > hit:
                                hit = v
            if hit > 0.0:
                r += (sr - r) * hit
                g += (sg - g) * hit
                b += (sb - b) * hit

            i = row + x * 4
            buf[i]     = 255 if r > 255 else int(r)
            buf[i + 1] = 255 if g > 255 else int(g)
            buf[i + 2] = 255 if b > 255 else int(b)
            buf[i + 3] = 255

    if ss == 1:
        return buf

    out = bytearray(size * size * 4)
    n = ss * ss
    for y in range(size):
        for x in range(size):
            tr = tg = tb = ta = 0
            for sy in range(ss):
                bi = ((y * ss + sy) * W + x * ss) * 4
                for sx in range(ss):
                    i = bi + sx * 4
                    tr += buf[i]
                    tg += buf[i + 1]
                    tb += buf[i + 2]
                    ta += buf[i + 3]
            o = (y * size + x) * 4
            out[o]     = tr // n
            out[o + 1] = tg // n
            out[o + 2] = tb // n
            out[o + 3] = ta // n
    return out


def write_png(path, size, rgba):
    stride = size * 4
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        raw += rgba[y * stride:(y + 1) * stride]

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
           + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)


def main():
    for name, size, radius_k, symbol_k in TARGETS:
        ss = 3 if size <= 192 else 2
        write_png(name, size, _render(size, radius_k, symbol_k, ss))
        print(f"{name} ({size}x{size}) yazildi")
    print("Tum ikonlar hazir. Commit et; GitHub Pages ~1 dk icinde yayinlar.")


if __name__ == "__main__":
    main()
