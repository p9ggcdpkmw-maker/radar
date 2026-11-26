"""RSS kaynaklarını test eder: fetch_and_summarize.py'deki tüm feed'ler + argümanla verilen adaylar.

Her URL için HTTP durumu, öğe sayısı ve ilk başlık yazdırılır. Kullanım:
  python tools/feed_probe.py [ek_url ...]
"""
import os, re, sys
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36"}


def probe(url):
    try:
        r = requests.get(url, headers=UA, timeout=15)
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
