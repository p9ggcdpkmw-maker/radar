"""Dalga kanallarını test eder (BASE + CAND, index.html'den okunur).

Her URL'den ilk baytlar okunur; HTTP kodu, içerik türü ve m3u8 başlığı kontrol
edilir. Sonuç: OK / ÖLÜ (DNS, bağlantı reddi, 404/410) / ŞÜPHELİ (403, zaman
aşımı, ses dışı içerik; coğrafi engel olabilir). GitHub Actions'ta çıktı job
özetine de yazılır. Kullanım: python tools/radio_probe.py
"""
import os, re, sys
import requests

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36"}


def stations(html):
    out = []
    for var in ("BASE", "CAND"):
        i = html.find(f"var {var}=[")
        blk = html[i:html.find("];", i)]
        for m in re.finditer(r"\{n:'([^']+)'.*?urls:\[([^\]]*)\]", blk):
            out.append((var, m.group(1), re.findall(r"'(https?://[^']+)'", m.group(2))))
    return out


def probe(url):
    try:
        with requests.get(url, headers=UA, stream=True, timeout=(8, 12), allow_redirects=True) as r:
            if r.status_code in (404, 410):
                return "ÖLÜ", f"HTTP {r.status_code}"
            if r.status_code != 200:
                return "ŞÜPHELİ", f"HTTP {r.status_code}"
            head = next(r.iter_content(4096), b"")
            ct = r.headers.get("content-type", "").lower()
            if b"#EXTM3U" in head[:200] or "audio" in ct or "mpeg" in ct or "octet-stream" in ct or "aac" in ct:
                return "OK", ct or "m3u8"
            return "ŞÜPHELİ", f"içerik türü: {ct or '?'}"
    except requests.exceptions.ConnectionError as e:
        msg = str(e)
        if "Name or service not known" in msg or "NameResolutionError" in msg or "nodename nor servname" in msg:
            return "ÖLÜ", "DNS çözülmedi"
        if "Connection refused" in msg:
            return "ÖLÜ", "bağlantı reddedildi"
        return "ŞÜPHELİ", "bağlantı hatası"
    except requests.exceptions.Timeout:
        return "ŞÜPHELİ", "zaman aşımı"
    except Exception as e:
        return "ŞÜPHELİ", type(e).__name__


def main():
    html = open(os.path.join(os.path.dirname(__file__), "..", "index.html"), encoding="utf-8").read()
    rows = ["| Liste | Kanal | Sonuç | Detay | URL |", "|---|---|---|---|---|"]
    for var, name, urls in stations(html):
        for u in urls:
            res, det = probe(u)
            rows.append(f"| {var} | {name} | {res} | {det} | {u} |")
            print(f"{res:8} {var:4} {name:16} {det:28} {u}")
    summ = os.environ.get("GITHUB_STEP_SUMMARY")
    if summ:
        with open(summ, "a", encoding="utf-8") as f:
            f.write("## 📻 Dalga kanal testi\n\n" + "\n".join(rows) + "\n")


if __name__ == "__main__":
    main()
