"""
RADAR - Haber Motoru, Piyasa Takipçisi ve Akıllı Bildirim Sistemi
"""
import json, os, re, sys, time
import difflib
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import urlparse
import concurrent.futures

import requests
import trafilatura
from bs4 import BeautifulSoup
import feedparser

# --- YAPILANDIRMA ---
GROQ_KEY = os.environ.get("GROQ_API_KEY", "").strip()
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

if not GROQ_KEY and not GEMINI_KEY:
    print("HATA: Hiçbir API anahtarı bulunamadı!", file=sys.stderr)
    sys.exit(1)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

SOURCE_NAMES = {
    "webtekno": "Webtekno", "shiftdelete": "ShiftDelete", "donanimhaber": "DonanımHaber",
    "bbci": "BBC Türkçe", "bbc": "BBC", "ntv": "NTV", "sozcu": "Sözcü", "hurriyet": "Hürriyet",
    "milliyet": "Milliyet", "cnnturk": "CNN Türk", "mhahaber": "MHA Haber",
    "aa": "Anadolu Ajansı", "trthaber": "TRT Haber", "haberturk": "Habertürk", "dw": "DW Türkçe"
}

CATEGORIES = [
    {"id": "oyun", "label": "Ücretsiz Oyun", "feeds": ["https://shiftdelete.net/feed", "https://www.webtekno.com/rss.xml"], "keywords": ["ücretsiz", "bedava", "dağıtıyor", "promosyon", "hediye", "fırsat"]},
    {"id": "teknoloji", "label": "Teknoloji", "feeds": ["https://www.donanimhaber.com/rss/tum/", "https://shiftdelete.net/feed", "https://www.webtekno.com/rss.xml"]},
    {"id": "bilim", "label": "Bilim", "feeds": ["https://www.ntv.com.tr/bilim.rss", "https://www.aa.com.tr/tr/rss/default?cat=bilim-teknoloji"]},
    {"id": "sanat", "label": "Sanat", "feeds": ["https://www.hurriyet.com.tr/rss/kultur-sanat", "https://www.milliyet.com.tr/rss/rssNew/kultursanat.xml"]},
    {"id": "doga", "label": "Doğa", "feeds": ["https://www.ntv.com.tr/doga.rss", "https://www.aa.com.tr/tr/rss/default?cat=cevre"]},
    {"id": "dunya", "label": "Dünya", "feeds": ["https://www.ntv.com.tr/dunya.rss", "https://www.trthaber.com/dunya.rss"]},
    {"id": "gundem", "label": "Gündem", "feeds": ["https://www.ntv.com.tr/son-dakika.rss", "https://www.trthaber.com/sondakika.rss", "https://www.aa.com.tr/tr/rss/default?cat=guncel", "https://www.mhahaber.com/rss", "https://www.hurriyet.com.tr/rss/anasayfa"]},
]

MAX_AGE_DAYS = 1.0
MAX_TEXT_LENGTH = 3500

def ntfy(topic, title, msg, tags="", priority=3):
    if not topic: return
    try:
        requests.post("https://ntfy.sh/", json={
            "topic": topic, "title": title, "message": msg,
            "tags": tags.split(",") if tags else [], "priority": priority
        }, timeout=10)
    except Exception as e:
        print(f"  ! Ntfy hatası: {e}", file=sys.stderr)

def clean_json_response(text):
    text = text.strip()
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    text = text.strip()
    match = re.search(r'\{.*\}', text, re.DOTALL)
    return match.group(0) if match else text

def ask_ai(prompt, is_json=True):
    if GROQ_KEY:
        for attempt in range(2):
            try:
                body = {"model": "openai/gpt-oss-120b", "max_tokens": 3000, "temperature": 0.2, "messages": [{"role": "user", "content": prompt}], "reasoning_effort": "low"}
                if is_json: body["response_format"] = {"type": "json_object"}
                resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers={"Authorization": f"Bearer {GROQ_KEY}"}, json=body, timeout=45)
                if resp.status_code == 429: break
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"  ! Groq hatası: {e}", file=sys.stderr)
                time.sleep(2)

    if GEMINI_KEY:
        for attempt in range(3):
            try:
                body = {"model": "gemini-3.8-flash", "max_tokens": 3000, "temperature": 0.2, "messages": [{"role": "user", "content": prompt}]}
                if is_json: body["response_format"] = {"type": "json_object"}
                resp = requests.post("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", headers={"Authorization": f"Bearer {GEMINI_KEY}"}, json=body, timeout=45)
                if resp.status_code == 429: time.sleep(15); continue
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"  ! Gemini hatası: {e}", file=sys.stderr)
                time.sleep(5)
    return ""

def fetch_category(cat, cache):
    items = []
    for feed_url in cat["feeds"]:
        try:
            feed = feedparser.parse(feed_url, request_headers=HEADERS)
            for entry in feed.entries:
                title = entry.get("title", "")
                source = SOURCE_NAMES.get(urlparse(feed_url).netloc.replace("www.", "").split('.')[0], "Haber")
                
                if cat["id"] == "oyun":
                    t_lower = title.lower()
                    if not any(kw in t_lower for kw in cat["keywords"]): continue
                
                pub_dt = datetime.now(timezone.utc)
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub_dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                
                if (datetime.now(timezone.utc) - pub_dt).days > MAX_AGE_DAYS: continue
                
                img = None
                if hasattr(entry, "media_content") and entry.media_content: img = entry.media_content[0].get("url")
                elif hasattr(entry, "links"):
                    for l in entry.links:
                        if "image" in l.get("type", ""): img = l.get("href")

                link = entry.get("link", "")
                if not link.startswith("http"): continue

                items.append({
                    "id": f"{cat['id']}_{len(items)}", "cat": cat["label"], "catId": cat["id"],
                    "title": title, "source": source, "link": link,
                    "pubDate": pub_dt.isoformat(), "image": img,
                    "rss_desc": entry.get("summary", "")
                })
        except Exception as e:
            print(f"  ! Feed alınamadı ({feed_url}): {e}", file=sys.stderr)

    seen, deduped = set(), []
    for it in items:
        if it["link"] in seen: continue
        seen.add(it["link"]); deduped.append(it)
    
    deduped.sort(key=lambda i: i["pubDate"], reverse=True)
    return deduped[:15]

def fetch_text_and_image(url):
    text, og_image = "", None
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        r.raise_for_status()
        text = trafilatura.extract(r.text, include_comments=False) or ""
        soup = BeautifulSoup(r.content, "html.parser")
        og = soup.find("meta", property="og:image")
        og_image = og.get("content") if og else None
    except Exception as e:
        print(f"  ! Metin çekilemedi ({url[:30]}): {e}", file=sys.stderr)
    return text[:MAX_TEXT_LENGTH], og_image

def summarize_batch(items):
    if not items: return {}
    lines = []
    for it in items:
        content = it.get("text") or BeautifulSoup(it.get("rss_desc", ""), "html.parser").get_text()
        if not content:
            lines.append(f"ID: {it['id']} | Başlık: {it['title']} | Durum: METİN YOK, özet yazma.")
        else:
            lines.append(f"ID: {it['id']} | Başlık: {it['title']} | İçerik: {content}")
    
    prompt = (
        "Aşağıdaki haberleri Türkçe, 2-3 cümlelik tarafsız bir dille özetle. "
        "Çıktıyı KESİNLİKLE şu JSON formatında ver: {\"summaries\": [{\"id\": \"haber_id\", \"summary\": \"özet\"}]}. "
        "Metin yoksa o haberi JSON'a ekleme.\n\n" + "\n".join(lines)
    )
    
    raw = ask_ai(prompt)
    try:
        arr = json.loads(clean_json_response(raw)).get("summaries", [])
        return {item["id"]: item["summary"] for item in arr}
    except: return {}

def generate_daily_briefings(all_news):
    if not all_news: return {}
    top_news = []
    for cat_id in ["teknoloji", "gundem", "bilim", "oyun"]:
        cat_items = [n for n in all_news if n["catId"] == cat_id][:3]
        top_news.extend(cat_items)
    
    haber_metni = "\n".join([f"- {h['cat']} | {h['title']}: {h.get('summary', '')}" for h in top_news])
    prompt = (
        "Sen RADAR adında bir haber asistanısın. Aşağıdaki haberleri okuyup 4 farklı alanda analiz yaz. "
        "Spekülasyon yapma, sadece verilen metinlere dayan. "
        "Çıktıyı KESİNLİKLE şu JSON formatında ver: {'genel': '...', 'teknoloji': '...', 'ekonomi': '...', 'gundem': '...'}\n\nHaberler:\n" + haber_metni
    )
    try:
        raw = ask_ai(prompt)
        data = json.loads(clean_json_response(raw))
        return {k: data.get(k, "Analiz yok.") for k in ["genel", "teknoloji", "ekonomi", "gundem"]}
    except: return {}

def fetch_market():
    usdtry = eurtry = gold_usd_oz = None
    try:
        r = requests.get("https://open.er-api.com/v6/latest/USD", timeout=10)
        rates = r.json().get("rates", {})
        usdtry = rates.get("TRY")
        if usdtry and rates.get("EUR"): eurtry = usdtry / rates.get("EUR")
    except: pass
    try:
        r = requests.get("https://api.gold-api.com/price/XAU", timeout=10)
        gold_usd_oz = r.json().get("price")
    except: pass
    gold_gram_try = round(gold_usd_oz / 31.1034768 * usdtry, 2) if (usdtry and gold_usd_oz) else None
    return {"usdtry": round(usdtry, 2) if usdtry else None, "eurtry": round(eurtry, 2) if eurtry else None, "gold_gram_try": gold_gram_try}

def fetch_crypto():
    cryptos = []
    try:
        r = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=try&include_24hr_change=true", timeout=10)
        data = r.json()
        if "bitcoin" in data: cryptos.append({"label": "Bitcoin", "price": data["bitcoin"]["try"], "change_pct": data["bitcoin"].get("try_24h_change", 0)})
        if "ethereum" in data: cryptos.append({"label": "Ethereum", "price": data["ethereum"]["try"], "change_pct": data["ethereum"].get("try_24h_change", 0)})
    except: pass
    return cryptos

def fetch_stocks():
    results = []
    for symbol, label in [("XU100.IS", "BIST 100"), ("^GSPC", "S&P 500"), ("^IXIC", "Nasdaq"), ("THYAO.IS", "THY"), ("ASELS.IS", "Aselsan"), ("GARAN.IS", "Garanti BBVA"), ("BIMAS.IS", "BİM"), ("AAPL", "Apple"), ("MSFT", "Microsoft"), ("NVDA", "Nvidia")]:
        try:
            r = requests.get(f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=1d&interval=1d", headers=HEADERS, timeout=10)
            meta = r.json()["chart"]["result"][0]["meta"]
            prev = meta.get("chartPreviousClose") or meta.get("previousClose")
            price = meta.get("regularMarketPrice") or prev
            change_pct = round((price - prev) / prev * 100, 2) if (prev and price != prev) else 0.0
            results.append({"label": label, "price": round(price, 2), "change_pct": change_pct})
        except: pass
    return results

def fetch_weather():
    try:
        r = requests.get("https://api.open-meteo.com/v1/forecast?latitude=41.1601&longitude=27.8055&current_weather=true", timeout=10)
        r.raise_for_status(); cw = r.json().get("current_weather", {})
        return {"temp": cw.get("temperature", 20), "desc": "Açık"}
    except: return {"temp": 20, "desc": "Bilinmiyor"}

def load_cache():
    cache, briefings, alerts = {}, {}, {}
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            old = json.load(f)
            for it in old.get("items", []):
                if it.get("link"):
                    s = it.get("summary", "")
                    if s and "ulaşılamadı" not in s and "oluşturulamadı" not in s:
                        cache[it["link"]] = {"summary": s, "image": it.get("image")}
            briefings = old.get("briefings", {})
            alerts = old.get("alerts_sent", {})
    except: pass
    return cache, briefings, alerts

def main():
    cache, old_briefings, alerts_sent = load_cache()
    all_items = []
    
    print("Kategoriler çekiliyor...")
    for cat in CATEGORIES:
        all_items.extend(fetch_category(cat, cache))

    if not all_items:
        print("HATA: Hiç haber çekilemedi. news.json korunuyor.", file=sys.stderr)
        sys.exit(0)

    seen_urls, seen_titles, deduped = set(), [], []
    for it in all_items:
        if it["link"] in seen_urls: continue
        norm_title = " ".join(re.sub(r'[^\w\s]', '', it["title"].lower()).split())
        if any(difflib.SequenceMatcher(None, norm_title, t).ratio() > 0.85 for t in seen_titles): continue
        seen_urls.add(it["link"]); seen_titles.append(norm_title); deduped.append(it)
    all_items = deduped

    need_summary = []
    need_image = []
    for it in all_items:
        c = cache.get(it["link"])
        if c and c.get("summary"): it["summary"] = c["summary"]
        else: need_summary.append(it)
        if not it.get("image") and c: it["image"] = c.get("image")
        if not it.get("image"): need_image.append(it)

    # 🚀 HATA DÜZELTİLDİ: Dict'leri set'e atamayız, link'e göre kontrol ediyoruz.
    seen_links = set()
    to_fetch = []
    for it in need_summary + need_image:
        if it["link"] not in seen_links:
            seen_links.add(it["link"])
            to_fetch.append(it)

    if to_fetch:
        print(f"Metin/Görsel çekiliyor ({len(to_fetch)} haber)...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
            res = list(ex.map(lambda i: fetch_text_and_image(i["link"]), to_fetch))
            for it, (txt, img) in zip(to_fetch, res):
                it["text"] = txt
                if img and not it.get("image"): it["image"] = img

    if need_summary:
        print(f"Özetleniyor ({len(need_summary)} haber)...")
        for i in range(0, len(need_summary), 3):
            chunk = need_summary[i:i+3]
            summaries = summarize_batch(chunk)
            for it in chunk:
                it["summary"] = summaries.get(it["id"], "Bu haberin tam metnine ulaşılamadı.")

    for it in all_items: it.pop("text", None); it.pop("rss_desc", None)

    briefings = old_briefings if not need_summary and old_briefings else generate_daily_briefings(all_items)
    m_data, c_data, s_data, w_data = fetch_market(), fetch_crypto(), fetch_stocks(), fetch_weather()

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for asset in (c_data or []):
        if abs(asset.get("change_pct", 0)) >= 2.0:
            asset_name = asset["label"]
            if alerts_sent.get(asset_name) != today:
                yon = "yükseldi" if asset["change_pct"] > 0 else "düştü"
                ntfy("radar-piyasa-x8f2", "📈 Piyasa Alarmı", f"{asset_name} %{abs(asset['change_pct']):.2f} {yon}!", "chart_with_upwards_trend")
                alerts_sent[asset_name] = today

    out = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "briefings": briefings, "items": all_items,
        "weather": w_data, "market": m_data, "crypto": c_data, "stocks": s_data,
        "alerts_sent": alerts_sent
    }
    
    with open("news.json.tmp", "w", encoding="utf-8") as f: json.dump(out, f, ensure_ascii=False, indent=2)
    os.replace("news.json.tmp", "news.json")
    print("news.json başarıyla yazıldı.")

if __name__ == "__main__":
    main()