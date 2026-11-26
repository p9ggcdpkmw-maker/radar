"""RADAR sabah brifingi — her gün 08:00 TR (Actions cron 0 5 * * *).

AI çağrısı yok. Kaynaklar: news.json (+ dünkü arşiv), radar-market ve
radar-scores worker'ları, open-meteo. 36 saatten eski veri brifinge girmez.
Gönderim: Telegram (TELEGRAM_CHAT) + Buttondown. DRY_RUN=1 ise sadece yazdırır.
"""
import json, os, sys
from datetime import datetime, timedelta, timezone
from xml.sax.saxutils import escape as xesc

import requests

TR = timezone(timedelta(hours=3))
MAX_AGE = timedelta(hours=36)
SITE = os.environ.get("SITE_URL", "https://p9ggcdpkmw-maker.github.io/radar/")
MKT_URL = "https://radar-market.69sygknn4y.workers.dev/market"
SC_URL = "https://radar-scores.69sygknn4y.workers.dev/scores"
TG_TOKEN = os.environ.get("TELEGRAM_TOKEN", "").strip()
TG_CHAT = os.environ.get("TELEGRAM_CHAT", "").strip()
BTDN_TOKEN = os.environ.get("BUTTONDOWN_TOKEN", "").strip()
DRY_RUN = os.environ.get("DRY_RUN", "").strip() == "1"
# Favori takımlar: repo değişkeni FAV_TEAMS, virgülle ayrılmış (ör. "Galatasaray,Fenerbahçe").
FAV_TEAMS = {t.strip().lower() for t in os.environ.get("FAV_TEAMS", "").split(",") if t.strip()}
# index.html scWeight ile aynı öncelikler.
LEAGUE_W = {"uefa.champions": 10, "tur.1": 9, "eng.1": 9, "esp.1": 9, "nba": 9, "ita.1": 8, "ger.1": 8,
            "euroleague": 8, "uefa.europa": 8, "fra.1": 7, "uefa.europa.conf": 7, "tur.cup": 6, "tur.2": 5}
WEATHER_DESC = {0: "Açık", 1: "Az bulutlu", 2: "Parçalı bulutlu", 3: "Kapalı", 45: "Sisli", 48: "Kırağı sisi",
                51: "Hafif çisenti", 53: "Çisenti", 55: "Yoğun çisenti", 61: "Hafif yağmur", 63: "Yağmur",
                65: "Şiddetli yağmur", 71: "Hafif kar", 73: "Kar", 75: "Yoğun kar", 80: "Sağanak", 81: "Sağanak",
                82: "Şiddetli sağanak", 95: "Gök gürültülü sağanak", 96: "Dolu", 99: "Şiddetli dolu"}


def get_json(url, timeout=15):
    try:
        r = requests.get(url, headers={"User-Agent": "RADAR-brifing"}, timeout=timeout)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"  ! {url.split('?')[0]}: {e}", file=sys.stderr)
        return None


def parse_dt(s):
    try:
        d = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    except Exception:
        return None


def fresh(d, now):
    return d is not None and now - d <= MAX_AGE


def headlines(now, n=5):
    """Son 24 saatin en yüksek puanlı 5 haberi (news.json + dünkü arşiv)."""
    pool = {}
    yday = (now - timedelta(days=1)).astimezone(timezone.utc).strftime("%Y-%m-%d")
    for path in ("news.json", f"archive/{yday}.json"):
        try:
            with open(path, encoding="utf-8") as f:
                for it in json.load(f).get("items") or []:
                    if it.get("link"):
                        pool.setdefault(it["link"], it)
        except Exception:
            pass
    since = now - timedelta(hours=24)
    items = [it for it in pool.values() if (parse_dt(it.get("pubDate")) or since) > since and it.get("summary")]
    items.sort(key=lambda it: (int(it.get("score") or 0), it.get("pubDate") or ""), reverse=True)
    out, seen = [], set()
    for it in items:
        key = it["title"].lower()[:40]
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
        if len(out) == n:
            break
    return out


def market(now):
    d = get_json(MKT_URL + "?g=fx,metal,idx")
    if not d:
        return []
    as_of = d.get("as_of")
    if not isinstance(as_of, (int, float)) or not fresh(datetime.fromtimestamp(as_of / 1000, timezone.utc), now):
        return []
    q = {x.get("k"): x for x in d.get("quotes") or [] if x.get("k")}
    rows = []
    for k, label, unit in (("USD/TRY", "USD/TRY", "₺"), ("EUR/TRY", "EUR/TRY", "₺"), ("Gram Altın", "Gram Altın", "₺"),
                           ("BIST 100", "BIST 100", ""), ("S&P 500", "S&P 500", ""), ("Nasdaq 100", "Nasdaq 100", "")):
        x = q.get(k)
        if not x or not isinstance(x.get("v"), (int, float)):
            continue
        p = x.get("p")
        rows.append((label, x["v"], unit, p if isinstance(p, (int, float)) else None))
    return rows


def matches(day, state):
    """Gün için futbol+basketbol maçları; favori önce, sonra lig önceliği."""
    out = []
    for sport in ("football", "basketball"):
        d = get_json(f"{SC_URL}?sport={sport}&date={day.strftime('%Y%m%d')}")
        for lg in (d or {}).get("leagues") or []:
            for m in lg.get("matches") or []:
                if m.get("state") != state:
                    continue
                fav = (m.get("home", "").lower() in FAV_TEAMS) or (m.get("away", "").lower() in FAV_TEAMS)
                w = LEAGUE_W.get(lg.get("id"), 0)
                if not fav and w < 7:
                    continue
                out.append((not fav, -w, m.get("start") or "", lg, m, fav))
    out.sort(key=lambda t: t[:3])
    return [(lg, m, fav) for _, _, _, lg, m, fav in out[:8]]


def weather():
    d = get_json("https://api.open-meteo.com/v1/forecast?latitude=41.1601&longitude=27.8055"
                 "&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max"
                 "&timezone=Europe%2FIstanbul&forecast_days=1")
    try:
        dl = d["daily"]
        return {"max": dl["temperature_2m_max"][0], "min": dl["temperature_2m_min"][0],
                "desc": WEATHER_DESC.get(dl["weather_code"][0], "—"),
                "rain": (dl.get("precipitation_probability_max") or [None])[0]}
    except Exception:
        return None


def fmt_num(v):
    s = f"{v:,.2f}" if v < 1000 else f"{v:,.0f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def fmt_pct(p):
    return "" if p is None else f" ({'▲' if p >= 0 else '▼'} %{abs(p):.2f})".replace(".", ",")


def generate_morning_briefing(now=None):
    """(başlık, telegram_metni, html) döndürür. Boş bölümler atlanır."""
    now = now or datetime.now(timezone.utc)
    tr_now = now.astimezone(TR)
    today, yday = tr_now.date(), (tr_now - timedelta(days=1)).date()
    title = f"☀️ RADAR Sabah Brifingi · {tr_now.strftime('%d.%m.%Y')}"
    tg, html = [title], [f"<h2>{xesc(title)}</h2>"]

    def section(head, lines_tg, lines_html):
        if not lines_tg:
            return
        tg.extend(["", head] + lines_tg)
        html.append(f"<h3>{xesc(head)}</h3><ul>" + "".join(f"<li>{h}</li>" for h in lines_html) + "</ul>")

    hs = headlines(now)
    section("📰 Manşetler",
            [f"• {it['title']} ({it.get('source', '')})" for it in hs],
            [f"<a href=\"{xesc(it['link'])}\"><b>{xesc(it['title'])}</b></a> — {xesc(it.get('source', ''))}"
             f"<br>{xesc(it['summary'][:220])}" for it in hs])

    mk = market(now)
    section("📈 Piyasa",
            [f"• {lb}: {fmt_num(v)}{(' ' + u) if u else ''}{fmt_pct(p)}" for lb, v, u, p in mk],
            [f"<b>{xesc(lb)}</b>: {fmt_num(v)}{(' ' + u) if u else ''}{xesc(fmt_pct(p))}" for lb, v, u, p in mk])

    def mline(lg, m, fav, score):
        star = "★ " if fav else ""
        mid = f" {m.get('hs', '-')}-{m.get('as', '-')} " if score else " – "
        when = ""
        if not score and parse_dt(m.get("start")):
            when = parse_dt(m["start"]).astimezone(TR).strftime("%H:%M") + " · "
        return f"{star}{when}{m.get('home', '?')}{mid}{m.get('away', '?')} · {lg.get('name', '')}"

    dun = [mline(lg, m, f, True) for lg, m, f in matches(yday, "post")]
    section("⚽ Dün", ["• " + s for s in dun], [xesc(s) for s in dun])
    bugun = [mline(lg, m, f, False) for lg, m, f in matches(today, "pre")]
    section("🗓 Bugün", ["• " + s for s in bugun], [xesc(s) for s in bugun])

    w = weather()
    if w:
        rain = f" · yağış %{w['rain']}" if w.get("rain") is not None else ""
        line = f"{w['desc']}, {round(w['min'])}° / {round(w['max'])}°{rain}"
        section("🌤 Çorlu", ["• " + line], [xesc(line)])

    tg += ["", f"📡 {SITE}"]
    html.append(f"<p><a href=\"{xesc(SITE)}\">RADAR'da aç</a></p>")
    return title, "\n".join(tg), "".join(html), len(tg) > 3


def send(title, text, html):
    if DRY_RUN:
        print(text)
        print("\n--- HTML ---\n" + html)
        return
    if TG_TOKEN and TG_CHAT:
        try:
            requests.post(f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
                          json={"chat_id": TG_CHAT, "text": text[:4000], "disable_web_page_preview": True},
                          timeout=10).raise_for_status()
            print("Telegram gönderildi.")
        except Exception as e:
            print(f"  ! Telegram: {str(e).replace(TG_TOKEN, '***')}", file=sys.stderr)
    if BTDN_TOKEN:
        try:
            r = requests.post("https://api.buttondown.com/v1/emails",
                              # Varsayılan 'draft'; abonelere gitmesi için about_to_send gerekir.
                              json={"subject": title, "body": html, "status": "about_to_send"},
                              headers={"Authorization": f"Token {BTDN_TOKEN}",
                                       "X-Buttondown-Live-Dangerously": "true"}, timeout=15)
            if r.ok:
                d = r.json() if "json" in r.headers.get("content-type", "") else {}
                print(f"Buttondown: HTTP {r.status_code}, status={d.get('status')}, id={d.get('id')}")
            else:  # Hata gövdesi sebebi söyler (422 vb.); token içermez.
                print(f"  ! Buttondown HTTP {r.status_code}: {r.text[:500]}", file=sys.stderr)
        except Exception as e:
            print(f"  ! Buttondown: {e}", file=sys.stderr)


if __name__ == "__main__":
    title, text, html, has_content = generate_morning_briefing()
    if not has_content:
        print("Brifing boş (tüm kaynaklar bayat/erişilemez); gönderilmedi.", file=sys.stderr)
        sys.exit(1)
    send(title, text, html)
