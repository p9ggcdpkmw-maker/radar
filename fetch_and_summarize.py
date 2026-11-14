"""
RADAR - Haber Motoru, Piyasa Takipçisi ve Akıllı Bildirim Sistemi
(Groq + Gemini Çift Motorlu Sürüm)
"""
import json, os, re, sys, time
import difflib
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import urlparse
from xml.etree import ElementTree as ET
import concurrent.futures

import requests
import trafilatura
from bs4 import BeautifulSoup

# --- YAPILANDIRMA ---
GROQ_KEY = os.environ.get("GROQ_API_KEY", "").strip()
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

if not GROQ_KEY and not GEMINI_KEY:
    print("HATA: Hiçbir API anahtarı bulunamadı!", file=sys.stderr)
    sys.exit(1)

CATEGORIES = [
    {"id": "teknoloji", "label": "Teknoloji", "feeds": ["http://www.webtekno.com/rss.xml", "https://shiftdelete.net/feed", "https://www.donanimhaber.com/rss/tum/"]},
    {"id": "bilim", "label": "Bilim", "feeds": ["https://feeds.bbci.co.uk/turkce/rss.xml", "https://www.ntv.com.tr/son-dakika.rss", "https://rss.dw.com/rdf/rss-tur-all"]},
    {"id": "sanat", "label": "Sanat", "feeds": ["https://www.hurriyet.com.tr/rss/anasayfa", "https://www.milliyet.com.tr/rss/rssNew/anasayfa.xml"]},
    {"id": "oyun", "label": "Ücretsiz Oyun", "feeds": ["http://www.webtekno.com/rss.xml", "https://shiftdelete.net/feed", "https://www.haberturk.com/rss/manset.xml"]},
    {"id": "doga", "label": "Doğa", "feeds": ["https://feeds.bbci.co.uk/turkce/rss.xml", "https://www.ntv.com.tr/son-dakika.rss"]},
    {"id": "dunya", "label": "Dünya", "feeds": ["https://feeds.bbci.co.uk/turkce/rss.xml", "https://www.cnnturk.com/feed/rss/all/news", "https://www.trthaber.com/sondakika.rss"]},
    {"id": "gundem", "label": "Gündem", "feeds": ["https://www.ntv.com.tr/son-dakika.rss", "https://feeds.bbci.co.uk/turkce/rss.xml", "https://www.hurriyet.com.tr/rss/anasayfa", "https://www.aa.com.tr/tr/rss/default?cat=guncel", "https://www.trthaber.com/sondakika.rss", "https://www.mhahaber.com/rss"]},
]

MAX_AGE_DAYS = 1.0 
MIN_ITEMS_PER_CAT = 3
MAX_ITEMS_PER_CAT = 15
MAX_TEXT_LENGTH = 3500

def clean_json_response(text):
    text = text.strip()
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    text = text.strip()
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1: text = text[start:end+1]
    return text

# 🚀 YENİ: ÇİFT MOTORLU YAPAY ZEKA İSTEĞİ (Önce Groq, olmazsa Gemini)
def ask_ai(prompt):
    # 1. GROQ DENEMESİ
    if GROQ_KEY:
        for attempt in range(2):
            try:
                resp = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
                    json={"model": "openai/gpt-oss-120b", "max_tokens": 3000, "temperature": 0.2, "response_format": {"type": "json_object"}, "messages": [{"role": "user", "content": prompt}]},
                    timeout=45
                )
                if resp.status_code == 429:
                    print("  ! Groq limiti doldu, Gemini'ye geçiliyor...", file=sys.stderr)
                    break # Groq'u bırak, Gemini'ye geç
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"  ! Groq hatası: {e}", file=sys.stderr)
                time.sleep(2)

    # 2. GEMINI DENEMESİ (Groq çökerse veya limit dolarsa buraya düşer)
    if GEMINI_KEY:
        print("  -> Gemini API kullanılıyor...", file=sys.stderr)
        for attempt in range(3):
            try:
                # Gemini'nin OpenAI uyumlu endpointi
                resp = requests.post(
                    f"https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                    headers={"Authorization": f"Bearer {GEMINI_KEY}", "Content-Type": "application/json"},
                    json={"model": "gemini-1.5-flash-latest", "max_tokens": 3000, "temperature": 0.2, "response_format": {"type": "json_object"}, "messages": [{"role": "user", "content": prompt}]},
                    timeout=45
                )
                if resp.status_code == 429:
                    print("  ! Gemini limiti doldu, bekleniyor...", file=sys.stderr)
                    time.sleep(15)
                    continue
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"  ! Gemini hatası: {e}", file=sys.stderr)
                time.sleep(5)
    
    return "" # Her ikisi de başarısız olursa

def fetch_feed(url):
    try:
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}, timeout=15)
        res.raise_for_status()
        return ET.fromstring(res.content)
    except Exception as e:
        print(f"  ! Feed alınamadı ({url}): {e}", file=sys.stderr)
        return None

def age_days(pub_date):
    try:
        d = parsedate_to_datetime(pub_date)
        if d.tzinfo is None: d = d.replace(tzinfo=timezone.utc)
        return (datetime.now(timezone.utc) - d).total_seconds() / 86400
    except: return 999

def extract_image(it):
    media = it.find("{http://search.yahoo.com/mrss/}content")
    if media is None: media = it.find("{http://search.yahoo.com/mrss/}thumbnail")
    if media is not None and media.get("url"): return media.get("url")
    enclosure = it.find("enclosure")
    if enclosure is not None and enclosure.get("url"): return enclosure.get("url")
    desc = it.findtext("description") or ""
    m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', desc, re.I)
    return m.group(1) if m else None

def fetch_category(cat):
    items = []
    for feed_url in cat["feeds"]:
        root = fetch_feed(feed_url)
        if root is None: continue
        for it in root.findall(".//item"):
            title_raw = (it.findtext("title") or "").strip()
            source_el = it.find("source")
            source = source_el.text.strip() if source_el is not None and source_el.text else ""
            if not source:
                domain = urlparse(feed_url).netloc.replace("www.", "")
                source = domain.split('.')[0].capitalize()
            title = title_raw.replace(f" - {source}", "") if source else title_raw
            link = (it.findtext("link") or "").strip()
            pub_date = (it.findtext("pubDate") or "").strip()
            if not link: continue
            if cat["id"] == "oyun":
                keywords = ["ücretsiz", "bedava", "dağıtıyor", "veriyor", "promosyon", "hediye"]
                if not any(kw in title.lower() for kw in keywords): continue
            items.append({"cat": cat["label"], "catId": cat["id"], "title": title, "source": source, "link": link, "pubDate": pub_date, "image": extract_image(it)})
    seen, deduped = set(), []
    for it in items:
        if it["link"] in seen: continue
        seen.add(it["link"]); deduped.append(it)
    deduped.sort(key=lambda i: age_days(i["pubDate"]))
    fresh = [i for i in deduped if age_days(i["pubDate"]) <= MAX_AGE_DAYS]
    final = fresh if len(fresh) >= MIN_ITEMS_PER_CAT else deduped[:max(MIN_ITEMS_PER_CAT, len(fresh))]
    return final[:MAX_ITEMS_PER_CAT]

# --- HAVA DURUMU VE PİYASA ---
WEATHER_DESC = {0:"Açık",1:"Az bulutlu",2:"Parçalı bulutlu",3:"Kapalı",45:"Sisli",48:"Kırağı sisi",51:"Hafif çisenti",53:"Çisenti",55:"Yoğun çisenti",61:"Hafif yağmur",63:"Yağmur",65:"Şiddetli yağmur",71:"Hafif kar",73:"Kar",75:"Yoğun kar",80:"Sağanak",81:"Sağanak",82:"Şiddetli sağanak",95:"Gök gürültülü sağanak",96:"Dolu",99:"Şiddetli dolu"}
WEATHER_LAT, WEATHER_LON = 41.1601, 27.8055

def fetch_weather():
    try:
        r = requests.get(f"https://api.open-meteo.com/v1/forecast?latitude={WEATHER_LAT}&longitude={WEATHER_LON}&current_weather=true", timeout=10)
        r.raise_for_status(); cw = r.json().get("current_weather", {})
        return {"temp": cw.get("temperature"), "desc": WEATHER_DESC.get(cw.get("weathercode"), "")}
    except: return None

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

STOCKS = [("XU100.IS", "BIST 100"), ("^GSPC", "S&P 500"), ("^IXIC", "Nasdaq"), ("THYAO.IS", "THY"), ("ASELS.IS", "Aselsan"), ("GARAN.IS", "Garanti BBVA"), ("BIMAS.IS", "BİM"), ("AAPL", "Apple"), ("MSFT", "Microsoft"), ("NVDA", "Nvidia")]

def fetch_stocks():
    results = []
    for symbol, label in STOCKS:
        try:
            r = requests.get(f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}", headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
            meta = r.json()["chart"]["result"][0]["meta"]
            prev = meta.get("chartPreviousClose") or meta.get("previousClose")
            price = meta.get("regularMarketPrice") or prev
            change_pct = round((price - prev) / prev * 100, 2) if (prev and price != prev) else 0.0
            results.append({"label": label, "price": round(price, 2), "change_pct": change_pct})
        except: pass
    return results

def fetch_article_text(url):
    text = ""
    try:
        downloaded = trafilatura.fetch_url(url, no_ssl=True, timeout=10) 
        if downloaded: text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
    except: pass
    if not text:
        try:
            res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
            if res.status_code == 200:
                soup = BeautifulSoup(res.content, 'html.parser')
                article_body = soup.find('article') or soup.find('div', class_=re.compile(r'(content|post|text|entry)', re.I))
                if article_body:
                    paragraphs = article_body.find_all('p')
                    text = " ".join([p.get_text(strip=True) for p in paragraphs])
        except: pass
    return text[:MAX_TEXT_LENGTH] if text else ""

def summarize_batch(items):
    if not items: return []
    lines = []
    for i, it in enumerate(items):
        content = it.get("text")
        if not content:
            lines.append(f"--- HABER {i+1} ---\nBaşlık: {it['title']}\nDurum: TAM METNE ULAŞILAMADI. Lütfen SADECE 'Bu haberin tam metnine ulaşılamadı.' yaz.\n")
        else:
            lines.append(f"--- HABER {i+1} ---\nBaşlık: {it['title']}\nİçerik: {content}\n")
    prompt = "Aşağıdaki haberleri Türkçe, 2-3 cümlelik, tarafsız ve anlaşılır şekilde özetle. Eğer 'Durum: TAM METNE ULAŞILAMADI' ise SADECE 'Bu haberin tam metnine ulaşılamadı.' yaz. Çıktıyı tam olarak şu JSON formatında ver: {'summaries': ['özet 1', 'özet 2', ...]} Başka hiçbir şey yazma.\n\n" + "\n".join(lines)
    
    raw_content = ask_ai(prompt)
    if not raw_content:
        return [""] * len(items)
        
    try:
        cleaned_content = clean_json_response(raw_content)
        arr = json.loads(cleaned_content).get("summaries", [])
        if len(arr) == len(items): return arr
        else: return (arr + ["Özet oluşturulamadı."] * len(items))[:len(items)]
    except Exception as e:
        print(f"  ! JSON Parse hatası: {e}", file=sys.stderr)
        return [""] * len(items)

def generate_category_briefings(all_news):
    if not all_news: return {}
    top_news = all_news[:10] 
    haber_metni = "\n".join([f"- {h['cat']} | {h['title']}: {h.get('summary', '')}" for h in top_news])
    prompt = "Sen RADAR adında bir yapay zeka haber asistanısın. Aşağıdaki haberleri okuyup 4 farklı alanda analiz yaz. Her analiz 2-3 cümlelik olmalı. Her alan için MUTLAKA bir analiz cümlesi yaz. ÇIKTIN KESİNLİKLE TÜRKÇE OLACAK. Çıktıyı KESİNLİKLE şu JSON formatında ver: {'genel': '...', 'teknoloji': '...', 'ekonomi': '...', 'gundem': '...'}\n\nHaberler:\n" + haber_metni
    
    raw_content = ask_ai(prompt)
    if not raw_content:
        return {"genel": "Analiz şu an hazırlanamıyor.", "teknoloji": "Analiz şu an hazırlanamıyor.", "ekonomi": "Analiz şu an hazırlanamıyor.", "gundem": "Analiz şu an hazırlanamıyor."}

    try:
        cleaned_content = clean_json_response(raw_content)
        data = json.loads(cleaned_content)
        for key in ["genel", "teknoloji", "ekonomi", "gundem"]:
            if key not in data or not data[key]: data[key] = "Bu alan için özel bir gelişme bulunamadı."
        return data
    except Exception as e:
        print(f"  ! Briefing JSON hatası: {e}", file=sys.stderr)
        return {"genel": "Analiz şu an hazırlanamıyor.", "teknoloji": "Analiz şu an hazırlanamıyor.", "ekonomi": "Analiz şu an hazırlanamıyor.", "gundem": "Analiz şu an hazırlanamıyor."}

def load_cache():
    cache, briefings = {}, {}
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            old = json.load(f)
            for it in old.get("items", []):
                if it.get("link"): cache[it["link"]] = {"summary": it.get("summary", ""), "image": it.get("image")}
            briefings = old.get("briefings", {})
    except: pass
    return cache, briefings

def send_smart_notification(new_items, market, crypto, stocks):
    sent_special = False
    new_games = [it for it in new_items if it.get("catId") == "oyun"]
    for game in new_games:
        try:
            requests.post(f"https://ntfy.sh/radar-oyun", data=f"{game['title']}".encode("utf-8"), headers={"Title": "🎮 Yeni Oyun Fırsatı", "Tags": "video_game", "Priority": "high"}, timeout=10)
            sent_special = True; time.sleep(1)
        except: pass
    alarms = []
    if stocks:
        for s in stocks:
            if s.get("change_pct") and abs(s["change_pct"]) >= 2.0:
                alarms.append(f"{s['label']} %{abs(s['change_pct']):.2f} {'yükseldi' if s['change_pct'] > 0 else 'düştü'}!")
    if crypto:
        for c in crypto:
            if c.get("change_pct") and abs(c["change_pct"]) >= 2.0:
                alarms.append(f"{c['label']} %{abs(c['change_pct']):.2f} {'yükseldi' if c['change_pct'] > 0 else 'düştü'}!")
    for alarm in alarms:
        try:
            requests.post(f"https://ntfy.sh/radar-piyasa", data=alarm.encode("utf-8"), headers={"Title": "📈 Piyasa Alarmı", "Tags": "chart_with_upwards_trend", "Priority": "high"}, timeout=10)
            sent_special = True; time.sleep(1)
        except: pass
    new_categories = set([it["catId"] for it in new_items if it["catId"] != "oyun"])
    for cat in new_categories:
        cat_items = [it for it in new_items if it["catId"] == cat]
        try:
            requests.post(f"https://ntfy.sh/radar-{cat}", data=f"{len(cat_items)} yeni haber eklendi.".encode("utf-8"), headers={"Title": f"📰 {cat.capitalize()} Gündemi", "Tags": "newspaper"}, timeout=10)
            time.sleep(1)
        except: pass
    if new_items and not sent_special:
        try:
            requests.post(f"https://ntfy.sh/radar-haberler", data=f"RADAR: {len(new_items)} yeni haber eklendi.".encode("utf-8"), headers={"Title": "RADAR Genel", "Tags": "newspaper"}, timeout=10)
        except: pass

def main():
    cache, old_briefings = load_cache()
    all_items = []
    print("Kategoriler çekiliyor...")
    for cat in CATEGORIES:
        print(f"  -> {cat['label']}")
        all_items.extend(fetch_category(cat))

    def normalize_url(url):
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    def normalize_title(title):
        return " ".join(re.sub(r'[^\w\s]', '', title.lower()).split())

    seen_urls, seen_titles, deduped_all = set(), [], []
    for it in all_items:
        norm_url = normalize_url(it["link"])
        if norm_url in seen_urls: continue
        norm_title = normalize_title(it["title"])
        if any(difflib.SequenceMatcher(None, norm_title, t).ratio() > 0.85 for t in seen_titles): continue
        seen_urls.add(norm_url); seen_titles.append(norm_title); deduped_all.append(it)
    all_items = deduped_all

    need_summary = []
    for it in all_items:
        cached = cache.get(it["link"])
        if cached and cached.get("summary"): it["summary"] = cached["summary"]
        else: need_summary.append(it)
        if not it.get("image") and cached: it["image"] = cached.get("image")

    print(f"Toplam {len(all_items)} haber. {len(need_summary)} yeni özetlenecek.")

    if need_summary:
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            texts = list(executor.map(lambda i: fetch_article_text(i["link"]), need_summary))
            for it, txt in zip(need_summary, texts): it["text"] = txt
        CHUNK_SIZE = 3
        for i in range(0, len(need_summary), CHUNK_SIZE):
            chunk = need_summary[i : i + CHUNK_SIZE]
            for it, s in zip(chunk, summarize_batch(chunk)): it["summary"] = s
            if i + CHUNK_SIZE < len(need_summary): time.sleep(2)

    if len(need_summary) == 0 and old_briefings:
        print("Yeni haber yok, eski analizler kullanılıyor.")
        briefings = old_briefings
    else:
        briefings = generate_category_briefings(all_items)
        
    m_data, c_data, s_data = fetch_market(), fetch_crypto(), fetch_stocks()

    out = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "briefings": briefings, "items": all_items,
        "weather": fetch_weather(), "market": m_data, "crypto": c_data, "stocks": s_data,
    }
    
    tmp_file = "news.json.tmp"
    with open(tmp_file, "w", encoding="utf-8") as f: json.dump(out, f, ensure_ascii=False, indent=2)
    os.replace(tmp_file, "news.json")
    print("news.json başarıyla yazıldı.")
    send_smart_notification(need_summary, m_data, c_data, s_data)

if __name__ == "__main__":
    main()