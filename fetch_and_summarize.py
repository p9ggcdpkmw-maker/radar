"""
RADAR - Haber Motoru, Piyasa Takipçisi ve Akıllı Bildirim Sistemi
"""
import json, os, re, sys, time
import difflib
from datetime import datetime, timezone
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

AI_MODEL_GROQ   = os.environ.get("AI_MODEL_GROQ", "openai/gpt-oss-120b").strip()
AI_MODEL_GEMINI = os.environ.get("AI_MODEL_GEMINI", "gemini-3.8-flash").strip()
AI_TEMPERATURE  = float(os.environ.get("AI_TEMPERATURE", "0.2"))
AI_PROMPT_VER   = os.environ.get("AI_PROMPT_VER", "v1.2").strip() # Sürüm güncellendi

LAST_AI_MODEL = None

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

SOURCE_NAMES = {
    "webtekno": "Webtekno", "shiftdelete": "ShiftDelete", "donanimhaber": "DonanımHaber",
    "webrazzi": "Webrazzi", "chip": "CHIP Online",
    "bbci": "BBC Türkçe", "bbc": "BBC", "ntv": "NTV", "sozcu": "Sözcü", "hurriyet": "Hürriyet",
    "milliyet": "Milliyet", "cnnturk": "CNN Türk", "mhahaber": "MHA Haber",
    "aa": "Anadolu Ajansı", "trthaber": "TRT Haber", "haberturk": "Habertürk", "dw": "DW Türkçe",
    "t24": "T24", "diken": "Diken", "bloomberght": "Bloomberg HT", "ekonomim": "Ekonomim", "bigpara": "Bigpara"
}

CATEGORIES = [
    {"id": "oyun", "label": "Ücretsiz Oyun", "feeds": ["https://shiftdelete.net/feed", "https://www.webtekno.com/rss.xml"], "keywords": ["ücretsiz", "bedava", "promosyon", "hediye", "oyun", "steam", "epic", "gog"]},
    {"id": "teknoloji", "label": "Teknoloji", "feeds": ["https://www.donanimhaber.com/rss/tum/", "https://shiftdelete.net/feed", "https://www.webtekno.com/rss.xml", "https://webrazzi.com/feed/"]},
    {"id": "bilim", "label": "Bilim", "feeds": ["https://www.ntv.com.tr/son-dakika.rss", "https://feeds.bbci.co.uk/turkce/rss.xml"]},
    {"id": "ekonomi", "label": "Ekonomi", "feeds": ["https://www.bloomberght.com/rss", "https://www.bigpara.com/rss/", "https://www.ekonomim.com/rss"]},
    {"id": "dunya", "label": "Dünya", "feeds": ["https://www.ntv.com.tr/son-dakika.rss", "https://www.trthaber.com/sondakika.rss", "https://feeds.bbci.co.uk/turkce/rss.xml"]},
    {"id": "gundem", "label": "Gündem", "feeds": ["https://www.ntv.com.tr/son-dakika.rss", "https://www.trthaber.com/sondakika.rss", "https://www.aa.com.tr/tr/rss/default?cat=guncel", "https://t24.com.tr/rss/anasayfa", "https://www.diken.com.tr/feed/", "https://www.hurriyet.com.tr/rss/anasayfa"]},
]

MAX_AGE_DAYS = 1.0
MAX_TEXT_LENGTH = 3500
WEATHER_DESC = {0:"Açık",1:"Az bulutlu",2:"Parçalı bulutlu",3:"Kapalı",45:"Sisli",48:"Kırağı sisi",51:"Hafif çisenti",53:"Çisenti",55:"Yoğun çisenti",61:"Hafif yağmur",63:"Yağmur",65:"Şiddetli yağmur",71:"Hafif kar",73:"Kar",75:"Yoğun kar",80:"Sağanak",81:"Sağanak",82:"Şiddetli sağanak",95:"Gök gürültülü sağanak",96:"Dolu",99:"Şiddetli dolu"}

def tr_lower(text):
    return text.replace('İ', 'i').replace('I', 'ı').lower()

def ntfy(topic, title, msg, tags="", priority=3):
    if not topic: return
    try:
        res = requests.post("https://ntfy.sh/", json={
            "topic": topic, "title": title, "message": msg,
            "tags": tags.split(",") if tags else [], "priority": priority
        }, timeout=10)
        res.raise_for_status()
    except Exception as e:
        print(f"  ! Ntfy hatası ({topic}): {e}", file=sys.stderr)

def clean_json_response(text):
    text = text.strip()
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    text = text.strip()
    match = re.search(r'\{.*\}', text, re.DOTALL)
    return match.group(0) if match else text

def ask_ai(prompt, is_json=True):
    global LAST_AI_MODEL
    if GROQ_KEY:
        for attempt in range(2):
            try:
                body = {"model": AI_MODEL_GROQ, "max_tokens": 4000, "temperature": AI_TEMPERATURE, "messages": [{"role": "user", "content": prompt}], "reasoning_effort": "low"}
                if is_json: body["response_format"] = {"type": "json_object"}
                resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers={"Authorization": f"Bearer {GROQ_KEY}"}, json=body, timeout=45)
                if resp.status_code == 429: break
                resp.raise_for_status()
                LAST_AI_MODEL = AI_MODEL_GROQ
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"  ! Groq hatası: {e}", file=sys.stderr)
                time.sleep(1)

    if GEMINI_KEY:
        for attempt in range(2):
            try:
                body = {"model": AI_MODEL_GEMINI, "max_tokens": 4000, "temperature": AI_TEMPERATURE, "messages": [{"role": "user", "content": prompt}]}
                if is_json: body["response_format"] = {"type": "json_object"}
                resp = requests.post("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", headers={"Authorization": f"Bearer {GEMINI_KEY}"}, json=body, timeout=60)
                if resp.status_code == 429: time.sleep(10); continue
                resp.raise_for_status()
                LAST_AI_MODEL = AI_MODEL_GEMINI
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"  ! Gemini hatası: {e}", file=sys.stderr)
                time.sleep(3)
    return ""

def fetch_category(cat, cache):
    items = []
    for feed_url in cat["feeds"]:
        try:
            r = requests.get(feed_url, headers=HEADERS, timeout=15)
            r.raise_for_status()
            feed = feedparser.parse(r.content)
            
            for entry in feed.entries:
                title = entry.get("title", "")
                source = SOURCE_NAMES.get(urlparse(feed_url).netloc.replace("www.", "").split('.')[0], "Haber")
                
                if cat["id"] == "oyun":
                    t_lower = tr_lower(title)
                    if not any(kw in t_lower for kw in cat["keywords"]): continue
                
                pub_dt = datetime.now(timezone.utc)
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub_dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                
                if (datetime.now(timezone.utc) - pub_dt).total_seconds() > (MAX_AGE_DAYS * 86400): continue
                
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
    return deduped[:20] # Kaynak başına limit biraz artırıldı

def fetch_text_and_image(url):
    text, og_image = "", None
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        r.raise_for_status()
        text = trafilatura.extract(r.content, include_comments=False) or ""
        soup = BeautifulSoup(r.content, "html.parser")
        og = soup.find("meta", property="og:image")
        if og and og.get("content"):
            og_image = og.get("content")
            if og_image.startswith("/"):
                parsed = urlparse(url)
                og_image = f"{parsed.scheme}://{parsed.netloc}{og_image}"
    except: pass
    return text[:MAX_TEXT_LENGTH], og_image

def summarize_batch(items):
    if not items: return {}
    lines = []
    for it in items:
        content = it.get("text") or BeautifulSoup(it.get("rss_desc", ""), "html.parser").get_text()
        if not content:
            lines.append(f"ID: {it['id']} | Başlık: {it['title']} | Durum: METİN YOK.")
        else:
            lines.append(f"ID: {it['id']} | Başlık: {it['title']} | İçerik: {content[:1500]}") # Token tasarrufu için kırpıldı
    
    prompt = (
        "Aşağıdaki haberleri Türkçe, 2-3 cümlelik tarafsız bir dille özetle. "
        "Her haber için şu 4 alanı doldur:\n"
        "1. 'summary': Tarafsız özet.\n"
        "2. 'tone': 'pozitif', 'nötr' veya 'negatif'.\n"
        "3. 'why_important': Bu haberi neden okumalıyız? (1 çarpıcı cümle).\n"
        "4. 'bias_score': 0 ile 10 arasında bir sayı. 0: Tamamen tarafsız/bilgilendirici, 10: Aşırı sansasyonel, manipülatif veya tık tuzağı (clickbait).\n"
        "Çıktıyı KESİNLİKLE şu JSON formatında ver:\n"
        "{'summaries': [{'id': 'haber_id', 'summary': 'özet', 'tone': 'nötr', 'why_important': 'cümle', 'bias_score': 3}]}\n"
        "Metin yoksa ekleme.\n\n" + "\n".join(lines)
    )
    
    raw = ask_ai(prompt)
    try:
        arr = json.loads(clean_json_response(raw)).get("summaries", [])
        result = {}
        for item in arr:
            score = item.get("score", 5) # Eski uyumluluk için
            bias = item.get("bias_score", 5)
            try:
                bias = int(float(bias))
                if bias < 0: bias = 0
                if bias > 10: bias = 10
            except: bias = 5
            
            result[item["id"]] = {
                "summary": item.get("summary", "Özet oluşturulamadı."),
                "score": score,
                "tone": item.get("tone", "nötr"),
                "why_important": item.get("why_important", ""),
                "bias_score": bias
            }
        return result
    except Exception as e:
        print(f"JSON Ayrıştırma Hatası: {e}", file=sys.stderr)
        return {}


def generate_daily_briefings(all_news):
    if not all_news: return {}
    top_news = sorted([n for n in all_news if n.get("summary")], key=lambda x: x.get("score", 0), reverse=True)[:10]
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

def fetch_market(old_market=None):
    usdtry = eurtry = gold_usd_oz = None
    try:
        r = requests.get("https://open.er-api.com/v6/latest/USD", timeout=10)
        rates = r.json().get("rates", {})
        usdtry = rates.get("TRY")
        if usdtry and rates.get("EUR"): eurtry = usdtry / rates.get("EUR")
    except: 
        if old_market: return old_market
    try:
        r = requests.get("https://api.gold-api.com/price/XAU", timeout=10)
        gold_usd_oz = r.json().get("price")
    except: 
        if old_market and not gold_usd_oz: return old_market
    gold_gram_try = round(gold_usd_oz / 31.1034768 * usdtry, 2) if (usdtry and gold_usd_oz) else (old_market.get("gold_gram_try") if old_market else None)
    return {"usdtry": round(usdtry, 2) if usdtry else (old_market.get("usdtry") if old_market else None), 
            "eurtry": round(eurtry, 2) if eurtry else (old_market.get("eurtry") if old_market else None), 
            "gold_gram_try": gold_gram_try}

def fetch_crypto(old_crypto=None):
    cryptos = []
    try:
        r = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=try&include_24hr_change=true", timeout=10)
        data = r.json()
        if "bitcoin" in data: cryptos.append({"label": "Bitcoin", "price": data["bitcoin"]["try"], "change_pct": data["bitcoin"].get("try_24h_change", 0)})
        if "ethereum" in data: cryptos.append({"label": "Ethereum", "price": data["ethereum"]["try"], "change_pct": data["ethereum"].get("try_24h_change", 0)})
    except: 
        if old_crypto: return old_crypto
    return cryptos

def fetch_stocks(old_stocks=None):
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
    return results if results else old_stocks

def fetch_weather():
    try:
        r = requests.get("https://api.open-meteo.com/v1/forecast?latitude=41.1601&longitude=27.8055&current_weather=true", timeout=10)
        r.raise_for_status()
        cw = r.json().get("current_weather", {})
        return {"temp": cw.get("temperature"), "desc": WEATHER_DESC.get(cw.get("weathercode"), "Bilinmiyor")}
    except: return None

def load_cache():
    cache, briefings, alerts, old_market, old_crypto, old_stocks = {}, {}, {}, None, None, None
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            old = json.load(f)
            for it in old.get("items", []):
                if it.get("link"):
                    s = it.get("summary", "")
                    if s and "ulaşılamadı" not in s and "oluşturulamadı" not in s:
                        cache[it["link"]] = {"summary": s, "image": it.get("image"), "score": it.get("score", 5), "ai": it.get("ai"), "tone": it.get("tone"), "why_important": it.get("why_important")}
            briefings = old.get("briefings", {})
            alerts = old.get("alerts_sent", {})
            old_market = old.get("market")
            old_crypto = old.get("crypto")
            old_stocks = old.get("stocks")
    except: pass
    return cache, briefings, alerts, old_market, old_crypto, old_stocks

def main():
    global LAST_AI_MODEL
    cache, old_briefings, alerts_sent, old_market, old_crypto, old_stocks = load_cache()
    all_items = []
    
    print("Kategoriler çekiliyor...")
    for cat in CATEGORIES:
        all_items.extend(fetch_category(cat, cache))

    if not all_items:
        print("HATA: Hiç haber çekilemedi. news.json korunuyor.", file=sys.stderr)
        sys.exit(1)

    # --- YENİ: AI HABER KÜMELEME (CLUSTERING) ---
    print("Haberler kümeleniyor (Benzer başlıklar birleştiriliyor)...")
    seen_urls = set()
    clusters = []

    for it in all_items:
        if it["link"] in seen_urls: continue
        
        norm_title = " ".join(re.sub(r'[^\w\s]', '', tr_lower(it["title"])).split())
        found_cluster = None
        
        for cluster in clusters:
            # %75 benzerlik varsa aynı kümede topla
            if difflib.SequenceMatcher(None, norm_title, cluster["norm_title"]).ratio() > 0.75:
                found_cluster = cluster
                break
                
        if found_cluster:
            found_cluster["sources"].append({"source": it["source"], "link": it["link"]})
            seen_urls.add(it["link"])
        else:
            clusters.append({
                "item": it,
                "norm_title": norm_title,
                "sources": [{"source": it["source"], "link": it["link"]}]
            })
            seen_urls.add(it["link"])

    final_items = []
    for c in clusters:
        it = c["item"]
        if len(c["sources"]) > 1:
            it["other_sources"] = c["sources"][1:]
        final_items.append(it)
    all_items = final_items
    # --------------------------------------------

    need_summary = []
    need_image = []
    for it in all_items:
        c = cache.get(it["link"])
        if c and c.get("summary"): 
            it["summary"] = c["summary"]
            it["score"] = c.get("score", 5)
            if c.get("ai"): it["ai"] = c["ai"]
            if c.get("tone"): it["tone"] = c["tone"]
            if c.get("why_important"): it["why_important"] = c["why_important"]
        else: 
            need_summary.append(it)
        if not it.get("image") and c: it["image"] = c.get("image")
        if not it.get("image"): need_image.append(it)

    unique_items = {i["link"]: i for i in (need_summary + need_image)}
    to_fetch = list(unique_items.values())

    if to_fetch:
        print(f"Metin/Görsel çekiliyor ({len(to_fetch)} haber)...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
            res = list(ex.map(lambda i: fetch_text_and_image(i["link"]), to_fetch))
            for it, (txt, img) in zip(to_fetch, res):
                it["text"] = txt
                if img and not it.get("image"): it["image"] = img

    if need_summary:
        print(f"Özetleniyor ve Puanlanıyor ({len(need_summary)} haber)...")
        for i in range(0, len(need_summary), 3):
            chunk = need_summary[i:i+3]
            summaries = summarize_batch(chunk)
            batch_generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
            for it in chunk:
                res = summaries.get(it["id"], {})
                it["summary"] = res.get("summary", "Bu haberin tam metnine ulaşılamadı.")
                it["score"] = res.get("score", 5)
                it["tone"] = res.get("tone", "nötr")
                it["why_important"] = res.get("why_important", "")
                it["ai"] = {
                    "model": LAST_AI_MODEL or "unknown",
                    "temperature": AI_TEMPERATURE,
                    "prompt_version": AI_PROMPT_VER,
                    "generated_at": batch_generated_at,
                    "method": "summary+score+tone+why",
                    "source_urls": [it["link"]],
                }
            time.sleep(1)

    for it in all_items: it.pop("text", None); it.pop("rss_desc", None)

    all_items.sort(key=lambda x: (x.get("score", 0), x.get("pubDate", "")), reverse=True)

    if old_briefings and not any("tam metnine ulaşılamadı" not in it.get("summary", "") for it in all_items):
        briefings = old_briefings
    else:
        briefings = generate_daily_briefings(all_items)
        if not briefings: briefings = old_briefings

    final_generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    for it in all_items:
        if "ai" not in it or not it.get("ai"):
            it["ai"] = {
                "model": LAST_AI_MODEL or "unknown",
                "temperature": AI_TEMPERATURE,
                "prompt_version": AI_PROMPT_VER,
                "generated_at": final_generated_at,
                "method": "summary+score+tone+why",
                "source_urls": [it["link"]],
            }

    m_data = fetch_market(old_market)
    c_data = fetch_crypto(old_crypto)
    s_data = fetch_stocks(old_stocks)
    w_data = fetch_weather()

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for asset in (c_data + s_data):
        if abs(asset.get("change_pct", 0)) >= 2.0:
            asset_name = asset["label"]
            if alerts_sent.get(asset_name) != today:
                yon = "yükseldi" if asset["change_pct"] > 0 else "düştü"
                ntfy("radar-piyasa-x8f2", "📈 Piyasa Alarmı", f"{asset_name} %{abs(asset['change_pct']):.2f} {yon}!", "chart_with_upwards_trend")
                alerts_sent[asset_name] = today

    new_by_cat = {}
    for it in need_summary:
        if it.get("summary") and "tam metnine ulaşılamadı" not in it["summary"]:
            new_by_cat.setdefault(it["catId"], []).append(it)
            
    for cat_id, items in new_by_cat.items():
        ntfy(f"radar-{cat_id}-x8f2", f"📰 {items[0]['cat']} Gündemi", f"{len(items)} yeni haber eklendi.", "newspaper")

    out = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "meta": {
            "generated_at": final_generated_at,
            "model": LAST_AI_MODEL or "unknown",
            "temperature": AI_TEMPERATURE,
            "prompt_version": AI_PROMPT_VER,
            "item_count": len(all_items),
        },
        "briefings": briefings, "items": all_items,
        "weather": w_data, "market": m_data, "crypto": c_data, "stocks": s_data,
        "alerts_sent": alerts_sent
    }
    
    with open("news.json.tmp", "w", encoding="utf-8") as f: json.dump(out, f, ensure_ascii=False, indent=2)
    os.replace("news.json.tmp", "news.json")
    print("news.json başarıyla yazıldı.")

if __name__ == "__main__":
    main()