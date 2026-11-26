"""RSS kaynaklarını test eder: fetch_and_summarize.py'deki tüm feed'ler + argümanla verilen adaylar.

Her URL için HTTP durumu, öğe sayısı ve ilk başlık yazdırılır. Kullanım:
  python tools/feed_probe.py [ek_url ...]
"""
import os, re, sys
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36"}


def skel(o, d=0):
    """JSON'un kısa iskeleti: anahtarlar, listelerin uzunluğu + ilk öğesi, kısa değer örnekleri."""
    if d > 10:
        return "…"
    if isinstance(o, dict):
        return "{" + ", ".join(f"{k}:{skel(v, d + 1)}" for k, v in list(o.items())[:14]) + "}"
    if isinstance(o, list):
        return f"[{len(o)}x {skel(o[0], d + 1)}]" if o else "[]"
    return repr(o)[:30]


def page_text(url):
    """'page:URL' — sayfanın düz metni (RSS ise ilk öğenin linkine gider). Burç gibi kaynakların yapısını görmek için."""
    r = requests.get(url, headers=UA, timeout=15)
    m = re.search(rb"<item[\s>].*?<link>(?:<!\[CDATA\[)?\s*(.*?)\s*(?:\]\]>)?</link>", r.content, re.S)
    if m:
        url = m.group(1).decode()
        r = requests.get(url, headers=UA, timeout=15)
    h = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", r.text)
    t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h))
    i = max(t.find("KOÇ"), 0)
    return f"SAYFA HTTP {r.status_code} · {url} · KOÇ@{t.find('KOÇ')} BOĞA@{t.find('BOĞA')} BALIK@{t.find('BALIK')} · {t[i:i + 2500]}"


def probe(url):
    if url.startswith("page:"):
        try:
            return page_text(url[5:])
        except Exception as e:
            return f"ÖLÜ  {type(e).__name__}"
    try:
        r = requests.get(url, headers=UA, timeout=15)
        if r.content.lstrip()[:1] == b"{":  # JSON nesnesi: anahtar iskeletini yaz (API yapısını görmek için)
            return f"JSON HTTP {r.status_code} · {skel(r.json())[:4000]}"
        if r.content.lstrip()[:1] == b"[":  # JSON API (ör. GamerPower)
            d = r.json()
            return f"{'OK' if r.status_code == 200 and d else 'ÖLÜ':4} HTTP {r.status_code} · {len(d):3} öğe · {str(d[0].get('title', ''))[:70] if d else ''}"
        n = len(re.findall(rb"<(item|entry)[\s>]", r.content))
        t = re.search(rb"<(?:item|entry)[\s>].*?<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>", r.content, re.S)
        first = t.group(1).decode("utf-8", "replace").strip()[:70] if t else ""
        ok = "OK" if r.status_code == 200 and n > 0 else "ÖLÜ"
        d = re.search(rb"<(?:item|entry)[\s>].*?<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</description>", r.content, re.S)
        desc = re.sub(r"<[^>]+>", "", d.group(1).decode("utf-8", "replace")).strip() if d else ""
        return f"{ok:4} HTTP {r.status_code} · {n:3} öğe · {first} · açıklama {len(desc)} krk: {desc[:120]}"
    except Exception as e:
        return f"ÖLÜ  {type(e).__name__}"


def main():
    src = open(os.path.join(os.path.dirname(__file__), "..", "fetch_and_summarize.py"), encoding="utf-8").read()
    urls = list(dict.fromkeys(re.findall(r'"(https?://[^"]+)"', "".join(re.findall(r'"feeds":\s*\[([^\]]*)\]', src)))))
    for u in urls + sys.argv[1:]:
        print(probe(u), "|", u)


if __name__ == "__main__":
    main()
