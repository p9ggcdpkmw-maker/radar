"""
RADAR - Haber Motoru, Piyasa Takipçisi ve Akıllı Bildirim Sistemi
"""
import json, os, re, sys, time
import difflib
from datetime import datetime, timezone, timedelta
from email.utils import format_datetime
from urllib.parse import urlparse
from xml.sax.saxutils import escape as _xml_escape
import concurrent.futures
import re
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
AI_MODEL_GEMINI = os.environ.get("AI_MODEL_GEMINI", "gemini-3.5-flash-lite").strip()
CF_KEY  = os.environ.get("CF_API_TOKEN", "").strip()
CF_ACCT = os.environ.get("CF_ACCOUNT_ID", "").strip()
AI_MODEL_CF = os.environ.get("AI_MODEL_CF", "@cf/qwen/qwen3-30b-a3b-fp8").strip()
AI_TEMPERATURE  = float(os.environ.get("AI_TEMPERATURE", "0.2"))
AI_PROMPT_VER   = os.environ.get("AI_PROMPT_VER", "v1.3").strip()
SITE_URL        = os.environ.get("SITE_URL", "https://p9ggcdpkmw-maker.github.io/radar/").strip().rstrip("/") + "/"
RSS_LIMIT       = int(os.environ.get("RSS_LIMIT", "60"))
BRIEFING_TTL_H  = float(os.environ.get("BRIEFING_TTL_HOURS", "6"))
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
    {"id": "ekonomi", "label": "Ekonomi", "feeds": ["https://www.bloomberght.com/rss", "https://www.ekonomim.com/rss"]},
    {"id": "dunya", "label": "Dünya", "feeds": ["https://www.ntv.com.tr/son-dakika.rss", "https://www.trthaber.com/sondakika.rss", "https://feeds.bbci.co.uk/turkce/rss.xml"]},
    {"id": "gundem", "label": "Gündem", "feeds": ["https://www.ntv.com.tr/son-dakika.rss", "https://www.trthaber.com/sondakika.rss", "https://www.aa.com.tr/tr/rss/default?cat=guncel", "https://t24.com.tr/rss/anasayfa", "https://www.diken.com.tr/feed/", "https://www.hurriyet.com.tr/rss/anasayfa"]},
]

MAX_AGE_DAYS = 1.0
MAX_TEXT_LENGTH = 3500
WEATHER_DESC = {0:"Açık",1:"Az bulutlu",2:"Parçalı bulutlu",3:"Kapalı",45:"Sisli",48:"Kırağı sisi",51:"Hafif çisenti",53:"Çisenti",55:"Yoğun çisenti",61:"Hafif yağmur",63:"Yağmur",65:"Şiddetli yağmur",71:"Hafif kar",73:"Kar",75:"Yoğun kar",80:"Sağanak",81:"Sağanak",82:"Şiddetli sağanak",95:"Gök gürültülü sağanak",96:"Dolu",99:"Şiddetli dolu"}


def tr_lower(text):
    return text.replace('İ', 'i').replace('I', 'ı').lower()


def source_name(feed_url):
    """feeds.bbci.co.uk gibi alt alan adlarını atlayıp gerçek kaynağı bulur."""
    host = urlparse(feed_url).netloc.lower()
    parts = [p for p in host.split('.') if p and p not in ("www", "feeds", "rss", "m", "api")]
    for p in parts:
        if p in SOURCE_NAMES:
            return SOURCE_NAMES[p]
    return parts[0].capitalize() if parts else "Haber"


def clamp_int(val, lo, hi, default=None):
    try:
        n = int(float(val))
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, n))


def xe(value):
    """XML metnini ve atribütünü güvenli hale getirir (kontrol karakterleri dahil)."""
    s = str(value if value is not None else "")
    s = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F]', '', s)
    return _xml_escape(s, {'"': "&quot;", "'": "&apos;"})


def write_atomic(path, text):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(text)
    os.replace(tmp, path)


NTFY_TOKEN = os.environ.get("NTFY_TOKEN", "").strip()


def ntfy(topic, title, msg, tags="", priority=3):
    if not topic: return
    payload = {
        "topic": topic, "title": title, "message": msg,
        "tags": tags.split(",") if tags else [], "priority": priority
    }
    headers = {"Authorization": f"Bearer {NTFY_TOKEN}"} if NTFY_TOKEN else {}
    try:
        res = requests.post("https://ntfy.sh/", json=payload, headers=headers, timeout=10)
        if res.status_code in (401, 403) and NTFY_TOKEN:
            print(f"  ! Ntfy token reddetti ({topic}) — güvenlik nedeniyle tokensiz deneme YAPILMADI.", file=sys.stderr)
            return
        res.raise_for_status()
    except Exception as e:
        print(f"  ! Ntfy hatası ({topic}): {e}", file=sys.stderr)


TG_TOKEN = os.environ.get("TELEGRAM_TOKEN", "").strip()
TG_CHAT = os.environ.get("TELEGRAM_CHAT", "").strip()
BTDN_TOKEN = os.environ.get("BUTTONDOWN_TOKEN", "").strip()
TG_SESSIZ = os.environ.get("TG_SESSIZ", "1").strip() == "1"


def bd_send(subject, body):
    if not BTDN_TOKEN: return
    try:
        resp = requests.post("https://api.buttondown.com/v1/emails",
                             json={"subject": subject, "body": body, "type": "regular"},
                             headers={"Authorization": f"Token {BTDN_TOKEN}"}, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"  ! Buttondown hatası: {e}", file=sys.stderr)


def tg_send(text, retry=2, silent=False):
    if not TG_TOKEN or not TG_CHAT: return
    for attempt in range(retry):
        try:
            requests.post(f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
                          json={"chat_id": TG_CHAT, "text": text[:4000],
                                "disable_web_page_preview": True,
                                "disable_notification": silent}, timeout=10)
            return
        except Exception as e:
            err_msg = str(e).replace(TG_TOKEN, "***TOKEN***") if TG_TOKEN else str(e)
            print(f"  ! Telegram hatası ({attempt+1}/{retry}): {err_msg}", file=sys.stderr)
            if attempt < retry-1: time.sleep(3)


def clean_json_response(text):
    """AI'nın JSON cevabını temizler; iç içe veya birden fazla JSON varsa sadece ilk geçerli nesneyi döndürür."""
    text = text.strip()
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    text = text.strip()
    # İlk { ... } bloğunu bul
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        return text
    json_str = match.group(0)
    # İç içe JSON varsa sadece ilkini al
    try:
        json.loads(json_str)
        return json_str
    except json.JSONDecodeError:
        # Geçersizse, ilk geçerli JSON nesnesini bul
        depth = 0
        for i, char in enumerate(json_str):
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth == 0:
                    return json_str[:i+1]
        return json_str
    
def extractive_summary(text, max_chars=280):
    """AI hiç yanıt vermezse: gövdenin ilk cümlelerini tarafsız özet olarak kullan."""
    t = re.sub(r"\s+", " ", (text or "")).strip()
    if len(t) < 40:
        return ""
    sentences = re.split(r"(?<=[.!?…])\s+", t)
    out = sentences[0]
    if len(sentences) > 1 and len(out) + len(sentences[1]) + 1 <= max_chars:
        out += " " + sentences[1]
    if len(out) > max_chars:
        out = out[:max_chars].rsplit(" ", 1)[0] + "…"
    return out
    
def fetch_category(cat, cache):
    items = []
    now_utc = datetime.now(timezone.utc)
    for feed_url in cat["feeds"]:
        try:
            r = requests.get(feed_url, headers=HEADERS, timeout=15)
            r.raise_for_status()
            feed = feedparser.parse(r.content)
            for entry in feed.entries:
                title = entry.get("title", "")
                source = source_name(feed_url)
                if cat["id"] == "oyun":
                    t_lower = tr_lower(title)
                    if not any(kw in t_lower for kw in cat["keywords"]): continue
                pub_dt = now_utc
                if getattr(entry, "published_parsed", None):
                    pub_dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                if pub_dt > now_utc: pub_dt = now_utc  # ileri tarihli girişler üste çıkmasın
                if (now_utc - pub_dt).total_seconds() > (MAX_AGE_DAYS * 86400): continue
                img = None
                if getattr(entry, "media_content", None): img = entry.media_content[0].get("url")
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
    return deduped[:20]

import time as _time
_last_fetch = 0


def fetch_text_and_image(url, timeout=15):
    global _last_fetch
    now = _time.time()
    if now - _last_fetch < 0.5:
        _time.sleep(0.5 - (now - _last_fetch))
    _last_fetch = _time.time()
    text, og_image = "", None

    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        r.raise_for_status()
        text = trafilatura.extract(r.content, include_comments=False) or ""
        soup = BeautifulSoup(r.content, "html.parser")
        og = (soup.find("meta", property="og:image")
              or soup.find("meta", attrs={"name": "twitter:image"})
              or soup.find("meta", attrs={"name": "twitter:image:src"})
              or soup.find("meta", attrs={"itemprop": "image"})
              or soup.find("meta", attrs={"name": "image"}))
        if og is None:
            ld = soup.find("script", type="application/ld+json")
            if ld:
                try:
                    data = json.loads(ld.string or "")
                    if isinstance(data, list): data = data[0] if data else {}
                    img = data.get("image") if isinstance(data, dict) else None
                    if isinstance(img, list): img = img[0] if img else None
                    if isinstance(img, dict): img = img.get("url")
                    if isinstance(img, str) and img.startswith("http"):
                        og_image = img
                except Exception:
                    pass
        if og and og.get("content"):
            og_image = og["content"].strip()
            parsed = urlparse(url)
            if og_image.startswith("//"):
                og_image = f"{parsed.scheme}:{og_image}"
            elif og_image.startswith("/"):
                og_image = f"{parsed.scheme}://{parsed.netloc}{og_image}"
            elif not og_image.startswith("http"):
                og_image = None
    except Exception:
        pass
    return text[:MAX_TEXT_LENGTH], og_image

def generate_daily_briefings(all_news):
    if not all_news: return {}
    ranked = sorted(
        [n for n in all_news if n.get("summary")],
        key=lambda x: (x.get("score", 0), -(x.get("bias_score") or 0)),
        reverse=True
    )[:10]
    haber_metni = "\n".join([f"- {h['cat']} | {h['title']}: {h.get('summary', '')}" for h in ranked])
    prompt = (
        "Sen RADAR adında bir haber asistanısın. Aşağıdaki haberleri okuyup 4 farklı alanda analiz yaz. "
        "Spekülasyon yapma, sadece verilen metinlere dayan. "
        'Çıktıyı KESİNLİKLE şu JSON formatında ver: {"genel": "...", "teknoloji": "...", "ekonomi": "...", "gundem": "..."}\n'
        "Haberler:\n" + haber_metni
    )
    try:
        raw = ask_ai(prompt)
        data = json.loads(clean_json_response(raw))
        return {k: data.get(k, "Analiz yok.") for k in ["genel", "teknoloji", "ekonomi", "gundem"]}
    except Exception:
        return {}


def build_rss(items, title, description, self_path, limit=RSS_LIMIT):
    now_rfc = format_datetime(datetime.now(timezone.utc))
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '<channel>',
        f'<title>{xe(title)}</title>',
        f'<link>{xe(SITE_URL)}</link>',
        f'<description>{xe(description)}</description>',
        '<language>tr</language>',
        f'<lastBuildDate>{now_rfc}</lastBuildDate>',
        f'<atom:link href="{xe(SITE_URL + self_path)}" rel="self" type="application/rss+xml" />',
    ]
    for it in items[:limit]:
        link = it.get("link", "")
        if not link.startswith("http"): continue
        try:
            dt = datetime.fromisoformat(it.get("pubDate", ""))
            if dt.tzinfo is None: dt = dt.replace(tzinfo=timezone.utc)
            pub_rfc = format_datetime(dt)
        except Exception:
            pub_rfc = now_rfc
        body = it.get("summary") or ""
        why = it.get("why_important") or ""
        if why: body += f"\n\nNeden önemli? {why}"
        parts.append("<item>")
        parts.append(f"<title>{xe(it.get('title'))}</title>")
        parts.append(f"<link>{xe(link)}</link>")
        parts.append(f'<guid isPermaLink="true">{xe(link)}</guid>')
        parts.append(f"<pubDate>{pub_rfc}</pubDate>")
        parts.append(f"<category>{xe(it.get('cat'))}</category>")
        parts.append(f"<description>{xe(body)}</description>")
        parts.append("</item>")
    parts.append("</channel>")
    parts.append("</rss>")
    return "\n".join(parts)


def write_feeds(all_items):
    usable = [i for i in all_items
              if i.get("summary")
              and "ulaşılamadı" not in i["summary"]
              and "oluşturulamadı" not in i["summary"]]
    write_atomic("feed.xml", build_rss(
        usable, "RADAR — Tüm Haberler",
        "Yapay zeka ile özetlenmiş, önem puanlı güncel haber akışı.", "feed.xml"))
    count = 1
    for cat in CATEGORIES:
        cat_items = [i for i in usable if i.get("catId") == cat["id"]]
        if not cat_items: continue
        fname = f"feed-{cat['id']}.xml"
        write_atomic(fname, build_rss(cat_items, f"RADAR — {cat['label']}",
                                      f"{cat['label']} kategorisindeki özetlenmiş haberler.", fname))
        count += 1
    print(f"{count} RSS dosyası yazıldı.")

    # --- HAREMALTIN: detay sayfaları (ID'ler sabit: priceAlis/priceSatis) ---

def fetch_market(old_market=None):
    usdtry = eurtry = gold_usd_oz = None
    try:
        r = requests.get("https://open.er-api.com/v6/latest/USD", timeout=10)
        rates = r.json().get("rates", {})
        usdtry = rates.get("TRY")
        if usdtry and rates.get("EUR"): eurtry = usdtry / rates.get("EUR")
    except Exception:
        if old_market: return old_market
    try:
        r = requests.get("https://api.gold-api.com/price/XAU", timeout=10)
        gold_usd_oz = r.json().get("price")
    except Exception:
        if old_market and not gold_usd_oz: return old_market
    old_market = old_market or {}

    # --- HAREMALTIN: ANA SAYFA (tek istek, tüm metaller) ---
    ist = timezone(timedelta(hours=3))
    now_ist = datetime.now(ist)
    market_open = (now_ist.weekday() < 5 and 9.5 <= now_ist.hour + now_ist.minute / 60 <= 18)
    updated_at = now_ist.strftime("%H:%M")

    METAL_MAP = {
        "gram altin": "gram_altin",
        "ceyrek altin": "ceyrek_altin",
        "yarim altin": "yarim_altin",
        "tam altin": "tam_altin",
        "cumhuriyet": "cumhuriyet_altin",
        "ons altin": "ons_altin",
        "gram gumus": "gram_gumus"
    }

    metals = {}
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        r = requests.get("https://www.haremaltin.com/", headers=headers, timeout=8)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        
        for tr in soup.find_all("tr"):
            tds = tr.find_all("td")
            if len(tds) < 4:
                continue
            name = tds[0].get_text(strip=True).lower().replace("ı", "i").replace("ü", "u")
            key = None
            for keyword, metal_key in METAL_MAP.items():
                if keyword in name:
                    key = metal_key
                    break
            if not key or key in metals:
                continue
            
            alis_str = tds[1].get_text(strip=True).replace(".", "").replace(",", ".").replace("₺", "").replace("TL", "")
            satis_str = tds[2].get_text(strip=True).replace(".", "").replace(",", ".").replace("₺", "").replace("TL", "")
            
            # '-' veya boş kontrolü
            if alis_str == '-' or satis_str == '-' or not alis_str or not satis_str:
                continue
            
            try:
                alis = float(alis_str)
                satis = float(satis_str)
            except ValueError:
                continue
            
            # Değişim yüzdesi
            change_pct = 0.0
            for td in tds[3:]:
                txt = td.get_text(strip=True)
                m = re.search(r"%\s*(-?\d+[.,]\d+)", txt)
                if m:
                    change_pct = float(m.group(1).replace(",", "."))
                    break
            
            metals[key] = {"alis": alis, "satis": satis, "change_pct": change_pct}
    except Exception as e:
        print(f"  ! Haremaltın ana sayfa hatası: {e}", file=sys.stderr)

    def mval(k): 
        val = metals.get(k)
        return val if val else (old_market.get(k) if isinstance(old_market.get(k), dict) else {})

    g = mval("gram_altin")
    return {"usdtry": round(usdtry, 2) if usdtry else old_market.get("usdtry"),
            "eurtry": round(eurtry, 2) if eurtry else old_market.get("eurtry"),
            "gold_gram_try": (g.get("satis") if g else old_market.get("gold_gram_try")),
            "gram_altin": g,
            "ceyrek_altin": mval("ceyrek_altin"),
            "yarim_altin": mval("yarim_altin"),
            "tam_altin": mval("tam_altin"),
            "cumhuriyet_altin": mval("cumhuriyet_altin"),
            "ons_altin": mval("ons_altin"),
            "gram_gumus": mval("gram_gumus"),
            "market_open": market_open,
            "updated_at": updated_at}
    # ---------------------------------------------------------------------------

    g = mval("gram_altin")
    return {"usdtry": round(usdtry, 2) if usdtry else old_market.get("usdtry"),
            "eurtry": round(eurtry, 2) if eurtry else old_market.get("eurtry"),
            "gold_gram_try": (g.get("satis") if (g and g.get("satis")) else (old_market.get("gold_gram_try") if not isinstance(old_market.get("gold_gram_try"), dict) else None)),
            "gram_altin": g,
            "ceyrek_altin": mval("ceyrek_altin"),
            "yarim_altin": mval("yarim_altin"),
            "tam_altin": mval("tam_altin"),
            "cumhuriyet_altin": mval("cumhuriyet_altin"),
            "ons_altin": mval("ons_altin"),
            "gram_gumus": mval("gram_gumus"),
            "market_open": market_open,
            "updated_at": updated_at}

def fetch_crypto(old_crypto=None):
    cryptos = []
    try:
        r = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=try&include_24hr_change=true", timeout=10)
        data = r.json()
        if "bitcoin" in data: cryptos.append({"label": "Bitcoin", "price": data["bitcoin"]["try"], "change_pct": data["bitcoin"].get("try_24h_change", 0)})
        if "ethereum" in data: cryptos.append({"label": "Ethereum", "price": data["ethereum"]["try"], "change_pct": data["ethereum"].get("try_24h_change", 0)})
    except Exception:
        return old_crypto or []
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
        except Exception:
            pass
    return results if results else (old_stocks or [])


def fetch_weather():
    try:
        r = requests.get("https://api.open-meteo.com/v1/forecast?latitude=41.1601&longitude=27.8055&current=temperature_2m,weather_code", timeout=10)
        r.raise_for_status()
        cw = r.json().get("current", {})
        return {"temp": cw.get("temperature_2m"), "desc": WEATHER_DESC.get(cw.get("weather_code"), "Bilinmiyor"), "city": "Çorlu"}
    except Exception:
        return None


def load_cache():
    cache, briefings, alerts, old_market, old_crypto, old_stocks = {}, {}, {}, None, None, None
    briefings_at = None
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            old = json.load(f)
        for it in old.get("items", []):
            if it.get("link"):
                s = it.get("summary", "")
                if s and "ulaşılamadı" not in s and "oluşturulamadı" not in s:
                    cache[it["link"]] = {
                        "summary": s, "image": it.get("image"), "score": it.get("score", 5),
                        "ai": it.get("ai"), "tone": it.get("tone"),
                        "why_important": it.get("why_important"),
                        "bias_score": it.get("bias_score"),
                    }
        briefings = old.get("briefings", {})
        briefings_at = old.get("briefings_generated_at")
        alerts = old.get("alerts_sent", {})
        old_market = old.get("market")
        old_crypto = old.get("crypto")
        old_stocks = old.get("stocks")
    except Exception:
        pass
    return cache, briefings, alerts, old_market, old_crypto, old_stocks, briefings_at

def main():
    global LAST_AI_MODEL
    cache, old_briefings, alerts_sent, old_market, old_crypto, old_stocks, old_briefings_at = load_cache()
    all_items = []
    print("Kategoriler çekiliyor...")
    for cat in CATEGORIES:
        all_items.extend(fetch_category(cat, cache))
    if not all_items:
        print("HATA: Hiç haber çekilemedi. news.json korunuyor.", file=sys.stderr)
        sys.exit(1)

    print("Haberler kümeleniyor (Benzer başlıklar birleştiriliyor)...")
    all_items = cluster_items(all_items)

    need_summary, need_image = [], []
    for it in all_items:
        c = cache.get(it["link"])
        if c and c.get("summary"):
            it["summary"] = c["summary"]
            it["score"] = c.get("score", 5)
            if c.get("ai"): it["ai"] = c["ai"]
            if c.get("tone"): it["tone"] = c["tone"]
            if c.get("why_important"): it["why_important"] = c["why_important"]
            if c.get("bias_score") is not None: it["bias_score"] = c["bias_score"]
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

    MAX_AI_SUMMARIES = int(os.environ.get("MAX_AI_SUMMARIES", "40"))
    if need_summary:
        if len(need_summary) > MAX_AI_SUMMARIES:
            need_summary.sort(key=lambda x: x.get("pubDate", ""), reverse=True)
            print(f"  ! AI kota koruması: {len(need_summary)} haberden sadece en yeni {MAX_AI_SUMMARIES} tanesi özetlenecek.")
            need_summary = need_summary[:MAX_AI_SUMMARIES]
        print(f"Özetleniyor ve Puanlanıyor ({len(need_summary)} haber)...")
        for i in range(0, len(need_summary), 3):
            chunk = need_summary[i:i+3]
            summaries = summarize_batch(chunk)
            batch_generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
            
            for it in chunk:
                res = summaries.get(it["id"], {})
                summ = (res.get("summary") or "").strip()
                if not summ or "oluşturulamadı" in summ:
                    fb = extractive_summary(it.get("text") or it.get("rss_desc", ""))
                    if fb:
                        it["summary"], it["score"], it["tone"] = fb, 5, "nötr"
                        it["why_important"], it["bias_score"] = "", None
                        it["ai"] = {
                            "model": "extractive",
                            "temperature": AI_TEMPERATURE,
                            "prompt_version": AI_PROMPT_VER,
                            "generated_at": batch_generated_at,
                            "method": "extractive-fallback (AI yanıt vermedi)",
                            "source_urls": [it["link"]],
                        }
                        continue
                    summ = "Bu haberin tam metnine ulaşılamadı."
                it["summary"] = summ
                it["score"] = res.get("score", 5)
                it["tone"] = res.get("tone", "nötr")
                it["why_important"] = res.get("why_important", "")
                it["bias_score"] = res.get("bias_score")  # yoksa None: arayüz rozet göstermez
                it["ai"] = {
                    "model": LAST_AI_MODEL or "unknown",
                    "temperature": AI_TEMPERATURE,
                    "prompt_version": AI_PROMPT_VER,
                    "generated_at": batch_generated_at,
                    "method": "summary+score+tone+why+bias",
                    "source_urls": [it["link"]],
                }
            time.sleep(1)

    for it in all_items:
        it.pop("text", None); it.pop("rss_desc", None)

    all_items.sort(key=lambda x: (x.get("score", 0), -(x.get("bias_score") or 0), x.get("pubDate", "")), reverse=True)

    # --- Briefing: yeni haber yoksa ve tazeyse yeniden üretme (kota tasarrufu) ---
    fresh_count = sum(1 for it in need_summary
                      if it.get("summary") and "tam metnine ulaşılamadı" not in it["summary"])
    briefings, briefings_at = old_briefings, old_briefings_at
    age_hours = None
    if briefings_at:
        try:
            age_hours = (datetime.now(timezone.utc) - datetime.fromisoformat(briefings_at)).total_seconds() / 3600.0
        except Exception:
            age_hours = None
    if (not briefings) or fresh_count > 0 or age_hours is None or age_hours >= BRIEFING_TTL_H:
        print(f"Günün analizi üretiliyor (yeni haber: {fresh_count})...")
        generated = generate_daily_briefings(all_items)
        if generated:
            briefings = generated
            briefings_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    else:
        print("Günün analizi taze, yeniden üretilmedi.")
    if not briefings: briefings = {}

    final_generated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    for it in all_items:
        if not it.get("ai"):
            it["ai"] = {
                "model": LAST_AI_MODEL or "unknown",
                "temperature": AI_TEMPERATURE,
                "prompt_version": AI_PROMPT_VER,
                "generated_at": final_generated_at,
                "method": "summary+score+tone+why+bias",
                "source_urls": [it["link"]],
            }

    m_data = fetch_market(old_market)
    c_data = fetch_crypto(old_crypto)
    s_data = fetch_stocks(old_stocks)
    w_data = fetch_weather()

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    alarm_lines = []
    for asset in (c_data + s_data):
        if abs(asset.get("change_pct", 0) or 0) >= 2.0:
            asset_name = asset["label"]
            if alerts_sent.get(asset_name) != today:
                yon = "yükseldi" if asset["change_pct"] > 0 else "düştü"
                alerts_sent[asset_name] = today
                alarm_lines.append(f"{asset_name} %{abs(asset['change_pct']):.2f} {yon}")
    if alarm_lines:
        ntfy("radar-piyasa-x8f2", "📈 Piyasa Alarmı",
             f"{len(alarm_lines)} enstrüman ±%2 eşiğinde:\n" + "\n".join(alarm_lines),
             "chart_with_upwards_trend")
        tg_send(f"📈 Piyasa Alarmı — {len(alarm_lines)} hareket\n" + "\n".join(alarm_lines))
    new_by_cat = {}
    for it in need_summary:
        if it.get("summary") and "tam metnine ulaşılamadı" not in it["summary"]:
            new_by_cat.setdefault(it["catId"], []).append(it)
    if new_by_cat:
        total = sum(len(v) for v in new_by_cat.values())
        parts = " · ".join(f"{v[0]['cat']}: {len(v)}" for v in new_by_cat.values())
        tg_send(f"📰 RADAR Güncelleme — {total} yeni haber\n{parts}", silent=TG_SESSIZ)
    for cat_id, items in new_by_cat.items():
        ntfy(f"radar-{cat_id}-x8f2", f"📰 {items[0]['cat']} Gündemi",
             f"{len(items)} yeni haber eklendi.", "newspaper")
    bd_date = ""
    if new_by_cat:
        try:
            with open("news.json", "r", encoding="utf-8") as f:
                bd_date = (json.load(f).get("meta") or {}).get("bd_sent_date", "")
        except Exception:
            bd_date = ""
        if bd_date != today:
            flat = [it for items in new_by_cat.values() for it in items]
            flat.sort(key=lambda x: x.get("score", 5), reverse=True)
            body = ("<h2>📰 RADAR Günlük Özet</h2><ul>" + "".join(
                "<li><b>%s</b>: %s — %s</li>" % (
                    _xml_escape(it.get("cat", "")), _xml_escape(it.get("title", "")),
                    _xml_escape(it.get("summary", "")[:140]))
                for it in flat[:10]) + "</ul>")
            bd_send("📰 RADAR Günlük Özet", body)
            bd_date = today
    out = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "meta": {
            "generated_at": final_generated_at,
            "model": LAST_AI_MODEL or "unknown",
            "temperature": AI_TEMPERATURE,
            "prompt_version": AI_PROMPT_VER,
            "item_count": len(all_items),
            "bd_sent_date": bd_date,
            "groq_calls": AI_STATS["groq"],
            "gemini_calls": AI_STATS["gemini"],
            "cf_calls": AI_STATS["cf"],
        },
        "briefings": briefings,
        "briefings_generated_at": briefings_at,
        "items": all_items,
        "weather": w_data, "market": m_data, "crypto": c_data, "stocks": s_data,
        "alerts_sent": alerts_sent,
    }
    write_atomic("news.json", json.dumps(out, ensure_ascii=False, indent=2))
    print("news.json başarıyla yazıldı.")
    write_feeds(all_items)

# ================= RADAR EK PAKET v2 (kota korumalı) =================
# ask_ai, summarize_batch ve cluster_items güncellenir. Eski kod silinmez.
import atexit

AI_PACE = float(os.environ.get("AI_PACE_SECONDS", "10"))
AI_TEXT_LIMIT = int(os.environ.get("AI_TEXT_LIMIT", "700"))
EVENT_CLUSTER = os.environ.get("EVENT_CLUSTER", "0").strip() == "1"
AI_STATS = {"groq": 0, "gemini": 0, "cf": 0, "bos": 0, "groq429": 0, "bekleme": 0.0, "_uyari": 0}
GROQ_KAPALI = False


def _radar_ai_ozeti():
        print("AI özeti → Groq: {} · Gemini: {} · Cloudflare: {} · boş cevap: {} · Groq 429: {} · beklenen: {:.0f} sn".format(
        AI_STATS["groq"], AI_STATS["gemini"], AI_STATS["cf"], AI_STATS["bos"],
        AI_STATS["groq429"], AI_STATS["bekleme"]))


atexit.register(_radar_ai_ozeti)


def _gunluk_limit_mi(resp):
    try:
        msg = json.dumps(resp.json(), ensure_ascii=False).lower()
    except Exception:
        msg = (getattr(resp, "text", "") or "").lower()
    return ("per day" in msg) or ("tpd" in msg) or ("rpd" in msg)


def _bekleme_suresi(resp, varsayilan):
    ra = resp.headers.get("retry-after") or resp.headers.get("Retry-After")
    try:
        w = float(ra)
    except (TypeError, ValueError):
        w = float(varsayilan)
    return max(1.0, min(w, 90.0))


def ask_ai(prompt, is_json=True):
    """Groq önce; 429'da bekleyip tekrar dener, günlük kotada o tur için kapanır."""
    global LAST_AI_MODEL, GROQ_KAPALI

    if not GROQ_KEY and not AI_STATS["_uyari"]:
        print("  ! GROQ_API_KEY tanımsız — Gemini kullanılıyor.", file=sys.stderr)
        AI_STATS["_uyari"] = 1

    if GROQ_KEY and not GROQ_KAPALI:
        for attempt in range(4):
            try:
                body = {"model": AI_MODEL_GROQ, "max_tokens": 1600, "temperature": AI_TEMPERATURE,
                        "messages": [{"role": "user", "content": prompt}], "reasoning_effort": "low"}
                if is_json: body["response_format"] = {"type": "json_object"}
                resp = requests.post("https://api.groq.com/openai/v1/chat/completions",
                                     headers={"Authorization": f"Bearer {GROQ_KEY}"}, json=body, timeout=45)
                if resp.status_code == 429:
                    AI_STATS["groq429"] += 1
                    if _gunluk_limit_mi(resp):
                        GROQ_KAPALI = True
                        print("  ! Groq GÜNLÜK kota doldu — bu turda Groq kapatıldı, Gemini deneniyor.", file=sys.stderr)
                        break
                    w = _bekleme_suresi(resp, 12 + attempt * 10)
                    AI_STATS["bekleme"] += w
                    print(f"  ! Groq 429 (hız limiti) — {w:.0f} sn bekleniyor, tekrar denenecek ({attempt + 1}/4)", file=sys.stderr)
                    time.sleep(w)
                    continue
                resp.raise_for_status()
                LAST_AI_MODEL = AI_MODEL_GROQ
                AI_STATS["groq"] += 1
                time.sleep(AI_PACE)
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"  ! Groq hatası: {e}", file=sys.stderr)
                time.sleep(2)

    if GEMINI_KEY:
        for attempt in range(2):
            try:
                body = {"model": AI_MODEL_GEMINI, "max_tokens": 1600, "temperature": AI_TEMPERATURE,
                        "messages": [{"role": "user", "content": prompt}]}
                if is_json: body["response_format"] = {"type": "json_object"}
                resp = requests.post("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                                     headers={"Authorization": f"Bearer {GEMINI_KEY}"}, json=body, timeout=60)
                if resp.status_code == 429:
                    w = _bekleme_suresi(resp, 15)
                    print(f"  ! Gemini 429 — {w:.0f} sn bekleniyor.", file=sys.stderr)
                    time.sleep(w); continue
                resp.raise_for_status()
                LAST_AI_MODEL = AI_MODEL_GEMINI
                AI_STATS["gemini"] += 1
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"  ! Gemini hatası: {e}", file=sys.stderr)
                time.sleep(3)
    if CF_KEY and CF_ACCT:
        for attempt in range(2):
            try:
                body = {"model": AI_MODEL_CF, "max_tokens": 1600,
                        "messages": [{"role": "user", "content": prompt}]}
                resp = requests.post(
                    f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCT}/ai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {CF_KEY}"}, json=body, timeout=90)
                if resp.status_code == 429:
                    time.sleep(10); continue
                resp.raise_for_status()
                LAST_AI_MODEL = AI_MODEL_CF
                AI_STATS["cf"] += 1
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"  ! Cloudflare hatası: {e}", file=sys.stderr)
                time.sleep(3)

    AI_STATS["bos"] += 1
    print("  ! AI yanıt vermedi — bu parti özetlenemedi (sonraki turda tekrar denenecek).", file=sys.stderr)
    return ""


def summarize_batch(items):
    """Metni olmayan haberi AI'a göndermez; içeriği kısaltarak token tasarrufu yapar."""
    if not items: return {}
    lines, bos = [], []
    for it in items:
        content = it.get("text") or BeautifulSoup(it.get("rss_desc", ""), "html.parser").get_text()
        content = (content or "").strip()
        if len(content) < 40:
            bos.append(it["id"])
            continue
        lines.append(f"ID: {it['id']} | Başlık: {it['title']} | İçerik: {content[:AI_TEXT_LIMIT]}")
    if not lines:
        return {}
    if bos:
        print(f"  · Metni olmayan {len(bos)} haber AI'a gönderilmedi (kota tasarrufu).")

    prompt = (
        "Aşağıdaki haberleri Türkçe, 2 cümlelik tarafsız bir dille özetle. "
        "Her haber için 5 alan doldur:\n"
        "1. 'summary': tarafsız özet\n"
        "2. 'score': 1-10 önem puanı\n"
        "3. 'tone': 'pozitif' / 'nötr' / 'negatif'\n"
        "4. 'why_important': neden okumalıyız (1 kısa cümle)\n"
        "5. 'bias_score': 0-10 dil abartısı (0 tarafsız, 10 tık tuzağı)\n"
        "Sadece şu JSON'u ver, başka metin yazma:\n"
        '{"summaries":[{"id":"haber_id","summary":"özet","score":8,"tone":"nötr","why_important":"cümle","bias_score":3}]}\n\n'
        + "\n".join(lines)
    )
    raw = ask_ai(prompt)
    if not raw:
        return {}
    try:
        arr = json.loads(clean_json_response(raw)).get("summaries", [])
        result = {}
        for item in arr:
            iid = item.get("id")
            if not iid: continue
            tone = item.get("tone")
            if tone not in ("pozitif", "nötr", "negatif"): tone = "nötr"
            result[iid] = {
                "summary": item.get("summary") or "Özet oluşturulamadı.",
                "score": clamp_int(item.get("score"), 1, 10, 5),
                "tone": tone,
                "why_important": item.get("why_important", ""),
                "bias_score": clamp_int(item.get("bias_score"), 0, 10, None),
            }
        return result
    except Exception as e:
        print(f"JSON Ayrıştırma Hatası: {e}", file=sys.stderr)
        return {}


def _ai_olay_gruplari(clusters):
    lines = [f"{i}: {c['members'][0]['title']}" for i, c in enumerate(clusters[:120])]
    prompt = (
        "Numaralı haber başlıklarında SADECE aynı somut olayı anlatanları grupla. "
        "Emin değilsen gruplama. Her grupta en az 2 numara olsun. Gruplanmayanları yazma.\n"
        'Sadece şu JSON: {"groups":[{"event":"olayın kısa adı","idx":[3,7]}]}\n\n' + "\n".join(lines)
    )
    raw = ask_ai(prompt)
    if not raw: return []
    try:
        out = []
        for g in json.loads(clean_json_response(raw)).get("groups", []):
            idx = []
            for x in g.get("idx", []):
                try: idx.append(int(x))
                except (TypeError, ValueError): pass
            if len(idx) >= 2:
                out.append({"event": str(g.get("event", ""))[:120], "idx": idx})
        return out
    except Exception as e:
        print(f"  ! Olay kümeleme atlandı: {e}", file=sys.stderr)
        return []


def cluster_items(all_items):
    seen, clusters = set(), []
    for it in all_items:
        if it["link"] in seen: continue
        norm = " ".join(re.sub(r'[^\w\s]', '', tr_lower(it["title"])).split())
        found = None
        for c in clusters:
            sm = difflib.SequenceMatcher(None, norm, c["norm"])
            if sm.real_quick_ratio() > 0.75 and sm.quick_ratio() > 0.75 and sm.ratio() > 0.75:
                found = c; break
        if found:
            found["members"].append(it)
        else:
            clusters.append({"norm": norm, "members": [it], "event": ""})
        seen.add(it["link"])

    n0 = len(clusters)
    if EVENT_CLUSTER and n0 > 3:
        groups = _ai_olay_gruplari(clusters)
        if groups:
            merged, used = [], set()
            for g in groups:
                idxs = [i for i in dict.fromkeys(g["idx"]) if 0 <= i < n0 and i not in used]
                if len(idxs) < 2: continue
                base = clusters[idxs[0]]
                for i in idxs[1:]:
                    base["members"].extend(clusters[i]["members"]); used.add(i)
                used.add(idxs[0]); base["event"] = g.get("event", "")
                merged.append(base)
            for i, c in enumerate(clusters):
                if i not in used: merged.append(c)
            clusters = merged
            print(f"Olay kümeleme: {n0} başlık → {len(clusters)} olay")

    final = []
    for c in clusters:
        it = c["members"][0]
        others = c["members"][1:]
        if others:
            others.sort(key=lambda x: x.get("pubDate", ""))
            it["other_sources"] = [{"source": o["source"], "link": o["link"], "pubDate": o.get("pubDate")} for o in others]
            it["event_count"] = len(c["members"])
            if c.get("event"): it["event_title"] = c["event"]
        final.append(it)
    return final
# ================= /RADAR EK PAKET v2 =================

if __name__ == "__main__":
    main()
