# 📡 RADAR

**Yapay zekâ ile özetlenmiş haber akışı + canlı piyasa terminali + canlı skorlar + radyo + Telegram bildirimleri + sabah brifingi. 
Sunucu yok, aylık maliyet 0 ₺.**

[![Haber Botu](https://github.com/p9ggcdpkmw-maker/radar/actions/workflows/update-news.yml/badge.svg)](https://github.com/p9ggcdpkmw-maker/radar/actions/workflows/update-news.yml)
🔗 **Canlı:** https://p9ggcdpkmw-maker.github.io/radar/

GitHub Actions **3 saatte bir** (`cron: 0 */3 * * *`) haberleri toplar, 
Groq ile özetler/puanlar, sonucu statik dosya olarak GitHub Pages'e yazar. 
Piyasa katmanı tarayıcıdan + Cloudflare worker'dan **canlı** akar. 
Her sabah 08:00'de sabah brifingi Telegram'a ve e-posta abonelerine gider. 
Kişisel Telegram bildirimleri (favori takım golü, favori kaynak haberi) `radar-notify` worker'ından gelir. 
Kurulumdan sonra bakım gerektirmez; bir şey bozulursa site kendi kendini ihbar eder.

---

## ✨ Özellikler

### 📰 Haber
- 6 kategoride Türkçe RSS taraması (Gündem, Ekonomi, Teknoloji, Bilim, Dünya, Ücretsiz Oyun)
- Her habere: **özet**, **önem puanı (1-10)**, **duygu tonu**, **"Neden önemli?"**, **sansasyonel dil skoru (0-10)**
- Başlık kümelemesi: aynı olayı veren kaynaklar tek kartta (`+N kaynak`) + opsiyonel **AI olay kümeleme** (`EVENT_CLUSTER=1`)
- **🧵 Olay örgüsü**: haberi ilk kim verdi, diğerleri kaç dakika sonra geçti
- Günün Analizi (4 sekme) + **sesli okuma** + AI şeffaflık etiketi (model/sıcaklık/prompt/zaman)
- **📖 Okuma modu**: haberin tam metnini proxy üzerinden çekip reklamsız/temiz okuma + **🤖 AI ile sadeleştir** (7 gün önbellek)
- **📘 Özellik Rehberi**: Konsol'da tüm özelliklerin kısa anlatımı
- Sonsuz kaydırma, **Ctrl+K arama paleti** (eşleşen metin vurgulu), ton & sansasyonel filtreleri, son 12 saat filtresi
- İlgi alanı kişiselleştirme, kaydet / beğen / okundu / **🕑 sonra oku** (okuyunca listeden kendi çıkar)
- **🗄️ Günlük arşiv: son 180 gün** (otomatik budanır) + **📊 Duygu Trendi** (son 7 günün ton dağılımı)
- **🎙️ Podcast**: günün en önemli 10 haberini tarayıcı TTS sesiyle dinle (hız/ses seçilebilir)
- **📅 Yaklaşan Etkinlikler**: başlıkta etkinlik anahtar kelimesi (konser, fuar, maç…) geçen haftalık haberler
- **📈 Kullanım İstatistikleri**: haber açma/kaydetme/podcast sayaçları (yalnızca bu cihazda)
- Bayat veri uyarısı: bot çalışmazsa site sessizce eski haber göstermez, bağırır
- Filtreli bağlantı kopyalama, kaydedilenleri JSON dışa aktarma
- Klavye kısayolları: `j/k` gez, `o/Enter` aç, `s` kaydet, `l` beğen, `t` sonra oku, `/` ara

### 📈 Piyasa Terminali
- **Kripto (canlı):** Binance WebSocket ile tik tik BTC/ETH + REST ile **~1.400 çift**; arama, TRY/USDT filtresi, hacim/değişim/fiyat sıralama, favoriler, canlı detay modalı, **1s/7g/30g değişim sütunları**
- **Hisseler:** TradingView scanner'dan **BIST + ABD hacme göre ilk 50** (Cloudflare worker üzerinden), endeksler (BIST 100, S&P 500, Dow, Nasdaq 100); pazar/yön/sıralama filtreleri, favoriler, **CSV dışa aktarma (Excel uyumlu)**
- **💼 Portföyüm**: coin/hisse + adet + alış fiyatı ekle; güncel değer ve kâr/zarar anlık hesaplanır (bu cihazda saklanır)
- **Döviz & Altın:** USD/EUR/GBP/CHF/JPY + 9 altın-gümüş çeşidi: **alış / satış / makas %** (truncgil, worker üzerinden); ons altın/gümüş spot (gold-api) + **kuyumcu primi tahmini** (ayarlanabilir işçilik yüzdesi)
- **Isı haritaları:** kripto treemap'i (hacim bazlı) + hisse ısı ızgarası, tıklayınca detay
- Küresel kapitalizasyon, BTC hakimiyeti, **Korku & Açgözlülük göstergesi**
- Piyasa saatleri: BIST/ABD/döviz/kripto açık-kapalı + kapanışa geri sayım
- Veri kaynağı etiketleri: `CANLI · tik`, `worker · 30 sn`, `~15 dk`, `bot · 3 saat` — ne izlediğini her zaman bilirsin
- Tarayıcı içi fiyat alarmı (eşik ayarlı) + ntfy push bildirimleri

### ⚽ Saha (canlı skorlar)
- Futbol (24 lig), basketbol (NBA, EuroLeague, BSL…), voleybol; ESPN + TheSportsDB, `radar-scores` worker üzerinden ~45 sn'de bir
- Maç detayı: olaylar, istatistik, **kadro sahası** (ev mavi / deplasman turuncu), form, H2H; uzatma dakikası (`90'+3'`) görünür
- Gol/durum geçişinde maç listeden düşmez (2 tur tolerans); ☆ ile takım favorile, "Takımlarım" filtresi

### 🌤️ Yaşam Widget'ları
Hava (7 gün + saatlik), hava kalitesi (AQI/PM2.5), gün doğumu-batışı, namaz vakitleri (Diyanet), çoklu döviz çevirici.
**📍 Şehir seçici:** varsayılan Çorlu; Menü'den şehir yazınca hava + AQI + namaz vakitleri birlikte taşınır (bot `/weather` Çorlu sabit kalır).

### 📻 Radyo & Araçlar
- 7 istasyon (ölüler **Dalga Kanal Testi** workflow'uyla ayıklanır), **kalıcı çalar çubuğu**, favoriler, uyku zamanlayıcı, HLS proxy, **son çalınan 5 kanal** şeridi, kanal sağlığı paneli
- Çeviri aracı (MyMemory → Lingva yedeği)
- Tema: koyu / açık / **sepia** / sistem · yoğunluk (rahat-sıkı) · yazı boyutu · görsel/hareket azaltma
- PWA: ana ekrana kurulum + **offline** (service worker: ağ öncelikli, çevrimdışı fallback, yeni sürüm bandı)

### 📬 Bot, bildirimler & bülten
- **Kategori bildirimleri:** her turda kategoriler için Telegram + ntfy mesajı; **📈 Piyasa Alarmı** %2 harekette (ntfy + Telegram)
- **ntfy güvenliği:** `NTFY_TOKEN` ile Bearer auth; token reddedilirse tokensiz dener (bildirim kopmaz)
- **📲 Kişisel Telegram bildirimleri (`radar-notify`):** Kasa → "Telegram'a bağla" ile eşleş; favori takımın başladı/gol/bitti, favori kaynak/kelimenin haberi 5 dk'da bir taranır. Mesaj tam cümleyle biter, buton doğru haberi/maçı açar. Komutlar: `/favoriler /ozet /sessiz /durdur /devam /kopar /sil /yardim`
- **🎯 Fiyat alarmı (Telegram):** `/alarm gram 6000`, `/alarm dolar 52` → fiyat eşiği geçince **bir kez** mesaj (5 dk'da bir kontrol, truncgil verisi; sessiz saatte bekler). `/alarmlar` listeler, `/alarmsil 2` / `/alarmsil hepsi` siler. Varlıklar: gram, ceyrek, yarim, tam, cumhuriyet, ata, bilezik, has, gumus, ons, dolar, euro, sterlin, bist
- **☀️ Sabah brifingi (`morning_briefing.py`, 08:00 TR):** 5 manşet + piyasa + dün/bugün maçlar (★ `FAV_TEAMS` önce) + Çorlu hava; Telegram + Buttondown. 36 saatten eski veri girmez, AI kullanmaz
- **📧 Email bülteni (Buttondown):** siteden herkese açık embed form (kullanıcı: `radarhaber`); günde 1 e-posta = sabah brifingi
- **Telegram retry:** gönderim hatasında 2 deneme + 3 sn bekleme

---

## 🏗️ Mimari

```
┌─ GitHub Actions (3 saatte bir) ───────────────────────────┐
│ fetch_and_summarize.py                                    │
│   RSS → kümeleme → Groq (yedek Gemini/CF) → özet/puan/ton │
│   → news.json + feed*.xml + archive/YYYY-MM-DD.json       │
│   → ntfy + Telegram bildirimleri                          │
├─ GitHub Actions (her gün 05:00 UTC = 08:00 TR) ───────────┤
│ morning_briefing.py → Telegram + Buttondown brifingi      │
└──────────────────────────┬────────────────────────────────┘
                           ▼ commit
              GitHub Pages (statik barındırma)
                           ▲
┌─ Tarayıcı ───────────────┴────────────────────────────────┐
│ index.html + style.css + app.js                           │
│   ├─ Binance WebSocket  → kripto tikleri (doğrudan)       │
│   ├─ radar-market worker→ hisse/endeks/döviz/metal (30 sn)│
│   ├─ Open-Meteo/Aladhan → yaşam widget'ları (şehir-aware) │
│   └─ news.json + archive → haber, arşiv, sparkline geçmişi│
└───────────────────────────────────────────────────────────┘
Cloudflare Workers (kodları workers/ klasöründe):
                                   radar-market  → döviz/altın/hisse/endeks
                                   radar-scores  → skorlar, maç detayı, /clean (AI sadeleştir)
                                   radar-notify  → kişisel TG bildirimleri, presence (KV + cron 5 dk)
                                   radar-hls-proxy → radyo/okuma modu CORS proxy
```

**Yedeklilik zinciri:** Groq 429 verirse `retry-after` kadar bekler → günlük kota biterse o turda kapanır → Gemini → Cloudflare → hiçbiri olmazsa **extractive fallback** (metnin ilk cümleleri tarafsız özet olarak) → o da olmazsa haber önbelleğe yazılmaz, sonraki turda yeniden denenir. 
Piyasa tarafında: TradingView ölürse Yahoo, Yahoo ölürse er-api, worker ölürse bot verisi; etiket her zaman gerçek kaynağı yazar. 
RSS çekiminde 0.5 sn rate-limit (ban koruması).

---

## 📡 Veri kaynakları ve gecikmeler

| Veri | Kaynak | Gecikme | Anahtar |
|---|---|---|---|
| Haber özetleri | Groq `gpt-oss-120b` (yedek Gemini/CF) | 3 saatte bir | ✅ Secrets |
| Kripto fiyatları | Binance WS + REST | **~1 sn** | gerekmez |
| BIST/ABD hisseleri | TradingView scanner (worker) | ~15 dk | gerekmez |
| Endeksler | TradingView / Yahoo (worker) | ~15 dk | gerekmez |
| Döviz | Yahoo → er-api (worker) | ~1 dk / günlük | gerekmez |
| Altın (alış/satış) | truncgil (worker) · ons: gold-api | ~30 sn | gerekmez |
| Skorlar | ESPN / TheSportsDB (worker) | ~45 sn | gerekmez |
| Hava / AQI / gün ışığı | Open-Meteo | ~10 dk | gerekmez |
| Namaz vakitleri | Aladhan (Diyanet metodu) | günlük | gerekmez |
| Küresel kripto metrikleri | CoinGecko Global | ~1 dk | gerekmez |
| Korku & Açgözlülük | alternative.me | günlük | gerekmez |
| Email bülteni | Buttondown API | anlık | ✅ Secrets |

---

## 🚀 Kurulum

1. Repoyu fork'la → **Settings → Pages → Branch: `main` / root**
2. **Settings → Secrets and variables → Actions → Secrets:**
   - `GROQ_API_KEY` (zorunlu) — [console.groq.com](https://console.groq.com)
   - `GEMINI_API_KEY` (yedek, önerilir)
   - `TELEGRAM_TOKEN` + `TELEGRAM_CHAT` (bot bildirimleri ve komut botu)
   - `NTFY_TOKEN` (push bildirimleri, opsiyonel) · `NTFY_TOPIC` (yalnızca bot hata bildirimi için özel kanal)
   - `BUTTONDOWN_TOKEN` (sabah brifingi e-postası; site aboneliği tokensiz çalışır)
3. **Variables** (isteğe bağlı, hepsinin kodda varsayılanı var):
   `AI_TEMPERATURE` · `AI_PROMPT_VER` · `SITE_URL` · `AI_PACE_SECONDS` (10) · `AI_TEXT_LIMIT` (700) · `EVENT_CLUSTER` (0 = kapalı) · `FAV_TEAMS` (brifingde ★ takımlar, virgülle) · `BOT_DAILY_EMAIL` (1 = haber botunun eski günlük e-postasını da aç)
4. Cloudflare'da `workers/` klasöründeki 4 worker'ı kur (GitHub'dan otomatik deploy edilmez; değişince panoya yapıştır):
   - `radar-market`, `radar-hls-proxy`: ek ayar yok
   - `radar-scores`: secret `GROQ_API_KEY` (AI sadeleştir için)
   - `radar-notify`: KV binding `RADAR_KV`, secret `TG_TOKEN`, cron `*/5 * * * *`, Telegram webhook → `.../tg`
   - Adresleri `index.html` içindeki `MKT_URL`, `SCORES_URL`, `NOTIFY_URL`, `PROXY` satırlarına yaz
5. **Actions → RADAR Haber Botu → Run workflow** → 2-3 dk sonra site dolu.

> Ücretsiz Groq kotası: 8.000 token/dk · 200.000 token/gün. Bot 3 saatte bir ~15-25 bin token harcar → rahat sığar. 
Kota dolarsa cron'u `'0 */6 * * *'` yap.

---

## 🗂️ Dosya haritası

| Dosya | Görev |
|---|---|
| `index.html` / `style.css` / `app.js` | Arayüz: HTML iskeleti, stiller, uygulama kodu (dosya adlarında `?v=` sürümü; değişince `sw.js` sürümüyle birlikte artırılır) |
| `fetch_and_summarize.py` | Haber motoru, AI, kümeleme, RSS, bildirimler |
| `morning_briefing.py` | Sabah brifingi (AI'sız; Telegram + Buttondown) |
| `workers/` | 4 Cloudflare worker'ın kaynak kodu |
| `tools/radio_probe.py` | Radyo kanallarını HTTP/DNS düzeyinde test eder |
| `logo.png`, `icon-*.png` | Logo ve PWA ikonları |
| `sw.js` / `manifest.json` | Offline önbellek ve kurulum manifesti |
| `news.json` | Canlı akış verisi (bot yazar) |
| `archive/` | Günlük snapshot'lar, **son 180 gün** (otomatik budanır) |
| `feed.xml`, `feed-*.xml` | RSS çıktıları (7 adet) |
| `.github/workflows/update-news.yml` | Haber botu: 3 saatte bir + commit zinciri |
| `.github/workflows/morning-briefing.yml` | Sabah brifingi: 08:00 TR (elle çalıştırmada `dry_run`) |
| `.github/workflows/radio-probe.yml` | Dalga Kanal Testi (elle) |

---

## 🩺 Bakım / sağlık kontrolü

- **Actions:** son koşu yeşil mi; log sonunda `news.json başarıyla yazıldı.` + `AI özeti → Groq: N · Gemini: 0 · boş cevap: 0` gör. `boş cevap > 0` ise kota/sağlık sorunu.
- **Bot:** `/stats` → toplam haber, son güncelleme, model, AI çağrı sayaçları; `/categories` → kategori dağılımı.
- **Site:** Piyasa üstündeki çipler → `hisseler: worker 30 sn` (yeşil) ve `kripto: CANLI · tik`. Griyse worker'ı kontrol et.
- **Bayat veri:** akışın üstünde `⚠️ Veri X saat önce` uyarısı çıkıyorsa Actions'a bak.
- **RSS aboneliği:** `.../radar/feed.xml` + kategori başına `feed-<id>.xml`.

---

## 🧭 Sırada (yol haritası)

- [x] **Service worker güncelleme banner'ı:** yeni sürüm düşünce "🔄 Yeni içerik var — Yenile" bildirimi
- [x] **Akıllı alarmlar:** mutlak eşik (`/alarm gram 6000`), tek bildirim
- [ ] **Yeni özellikler:** burç yorumları, "Yaşam" kategorisi, anonim maç yorumu
- [ ] ntfy tarafında tek özet konu seçeneği (şu an kategori kategori)

---

## ⚖️ Dürüstlük & sınırlar

- Özetler ve puanlar **AI ürünüdür**, hata içerebilir; her haberin kaynak bağlantısı her zaman görünür.
- Sansasyon skoru bir **dil** değerlendirmesidir; doğruluk/güvenilirlik ölçmez.
- BIST verisi ücretsiz kaynaklarda **~15 dk gecikmelidir**; ABD kapanış sonrası son değer kalır. Bu bir yatırım tavsiyesi aracı değildir.
- Altın fiyatları truncgil'den gelir; has/gram altın **uluslararası spot bazlıdır, Kapalıçarşı primi dahil değildir** (zaman zaman %5'i aşar). Kuyumcu primi tahminidir, gerçek kuyumcu fiyatı değildir.
- Kripto `USDT` çiftleri ile aracı uygulamaların `USD` fiyatları makas/USDT farkı nedeniyle ±%0,5 sapabilir.
- Piyasa saatleri resmî tatilleri içermez.
- Podcast/okuma sesi tarayıcının TTS motoruna bağlıdır; ses kalitesi cihaza göre değişir.
- Etkinlik listesi başlık anahtar kelimesiyle **tahmin** eder; kaçırma/yanılma olabilir.
- RSS kaynaklarının telif hakları ilgili yayıncılara aittir; RADAR yalnızca özet + bağlantı sunar. Radyo yayınları yayıncıların kamuya açık akışlarıdır.

---

*Tek kişilik bir "haber + piyasa terminali" hobisi olarak başladı; hâlâ derleme adımı yok, hâlâ 0 ₺ sunucu. 📡*
