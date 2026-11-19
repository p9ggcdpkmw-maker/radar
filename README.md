# 📡 RADAR

**Yapay zekâ ile özetlenmiş haber akışı + canlı piyasa terminali + radyo. Sunucu yok, aylık cost 0 ₺.**

[![Haber Botu](https://github.com/p9ggcdpkmw-maker/radar/actions/workflows/update-news.yml/badge.svg)](https://github.com/p9ggcdpkmw-maker/radar/actions/workflows/update-news.yml)
🔗 **Canlı:** https://p9ggcdpkmw-maker.github.io/radar/

GitHub Actions saatte bir değil **2 saatte bir** haberleri toplar, Groq ile özetler/puanlar, sonucu statik dosya olarak GitHub Pages'e yazar. Piyasa katmanı ise tarayıcıdan + Cloudflare worker'dan **canlı** akar. Kurulumdan sonra bakım gerektirmez; bir şey bozulursa site kendi kendini ihbar eder.

---

## ✨ Özellikler

### 📰 Haber
- 6 kategoride Türkçe RSS taraması (Gündem, Ekonomi, Teknoloji, Bilim, Dünya, Ücretsiz Oyun)
- Her habere: **özet**, **önem puanı (1-10)**, **duygu tonu**, **"Neden önemli?"**, **sansasyonel dil skoru (0-10)**
- Başlık kümelemesi: aynı olayı veren kaynaklar tek kartta (`+N kaynak`)
- **🧵 Olay örgüsü**: haberi ilk kim verdi, diğerleri kaç dakika sonra geçti
- Günün Analizi (4 sekme) + **sesli okuma** + AI şeffaflık etiketi (model/sıcaklık/prompt/zeit)
- Sonsuz kaydırma, Ctrl+K arama paleti, ton & sansasyonel filtreleri, son 12 saat filtresi
- İlgi alanı kişiselleştirme, kaydet/beğen/okundu, **günlük arşiv** (son 60 gün)
- **Bayat veri uyarısı**: bot çalışmazsa site sessizce eski haber göstermez, bağırır
- Filtreli bağlantı kopyalama, kaydedilenleri JSON dışa aktarma
- Duygu Trendi: arşivden son 7 günün olumlu/nötr/olumsuz dağılımı

### 📈 Piyasa Terminali
- **Kripto (canlı):** Binance WebSocket ile tik tik BTC/ETH + REST ile **~1.400 çift**; arama, TRY/USDT filtresi, hacim/değişim/fiyat sıralama, favoriler, canlı detay modalı
- **Hisseler:** TradingView scanner'dan **BIST + ABD hacme göre ilk 50** (Cloudflare worker üzerinden), endeksler (BIST 100, S&P 500, Dow, Nasdaq 100); pazar/yön/sıralama filtreleri, favoriler, **CSV dışa aktarma (Excel uyumlu)**
- **Döviz & Altın:** USD/EUR/GBP/CHF/JPY + 9 altın-gümüş çeşidi (gramdan hesaplanır)
- **Isı haritaları:** kripto treemap'i (hacim bazlı) + hisse ısı ızgarası, tıklayınca detay
- Küresel kapitalizasyon, BTC hakimiyeti, **Korku & Açgözlülük göstergesi**
- Piyasa saatleri: BIST/ABD/döviz/kripto açık-kapalı + kapanışa geri sayım
- Veri kaynağı etiketleri: `CANLI · tik`, `worker · 30 sn`, `~15 dk`, `bot · 2 saat` — ne izlediğini her zaman bilirsin
- Tarayıcı içi fiyat alarmı (eşik ayarlı) + ntfy push bildirimleri

### 🌤️ Yaşam Widget'ları
Hava (7 gün + saatlik), hava kalitesi (AQI/PM2.5), gün doğumu-batışı, namaz vakitleri (Diyanet), çoklu döviz çevirici — hepsi Çorlu konumuna sabit, anahtarsız açık API'ler.

### 📻 Radyo & Araçlar
- 7 istasyon, **kalıcı çalar çubuğu** (sekme değiştirsen de çalar), favoriler, uyku zamanlayıcı, HLS proxy
- Çeviri aracı (MyMemory → Lingva yedeği), gece/gündüz/otomatik tema, yoğunluk & yazı boyutu, PWA (ana ekrana kurulum + offline)

---

## 🏗️ Mimari

README'yi projenin **bugünkü haline** göre baştan yazdım — market terminali, worker'lar, filtreler, favoriler, CSV, PWA hepsi dahil. Eskisi 3 satırdı, artık projenin gerçek dokümantasyonu.

## 📄 `README.md` — komple değiştir

```markdown
# 📡 RADAR

**Yapay zekâ ile özetlenmiş haber akışı + canlı piyasa terminali + radyo. Sunucu yok, aylık cost 0 ₺.**

[![Haber Botu](https://github.com/p9ggcdpkmw-maker/radar/actions/workflows/update-news.yml/badge.svg)](https://github.com/p9ggcdpkmw-maker/radar/actions/workflows/update-news.yml)
🔗 **Canlı:** https://p9ggcdpkmw-maker.github.io/radar/

GitHub Actions saatte bir değil **2 saatte bir** haberleri toplar, Groq ile özetler/puanlar, sonucu statik dosya olarak GitHub Pages'e yazar. Piyasa katmanı ise tarayıcıdan + Cloudflare worker'dan **canlı** akar. Kurulumdan sonra bakım gerektirmez; bir şey bozulursa site kendi kendini ihbar eder.

---

## ✨ Özellikler

### 📰 Haber
- 6 kategoride Türkçe RSS taraması (Gündem, Ekonomi, Teknoloji, Bilim, Dünya, Ücretsiz Oyun)
- Her habere: **özet**, **önem puanı (1-10)**, **duygu tonu**, **"Neden önemli?"**, **sansasyonel dil skoru (0-10)**
- Başlık kümelemesi: aynı olayı veren kaynaklar tek kartta (`+N kaynak`)
- **🧵 Olay örgüsü**: haberi ilk kim verdi, diğerleri kaç dakika sonra geçti
- Günün Analizi (4 sekme) + **sesli okuma** + AI şeffaflık etiketi (model/sıcaklık/prompt/zeit)
- Sonsuz kaydırma, Ctrl+K arama paleti, ton & sansasyonel filtreleri, son 12 saat filtresi
- İlgi alanı kişiselleştirme, kaydet/beğen/okundu, **günlük arşiv** (son 60 gün)
- **Bayat veri uyarısı**: bot çalışmazsa site sessizce eski haber göstermez, bağırır
- Filtreli bağlantı kopyalama, kaydedilenleri JSON dışa aktarma
- Duygu Trendi: arşivden son 7 günün olumlu/nötr/olumsuz dağılımı

### 📈 Piyasa Terminali
- **Kripto (canlı):** Binance WebSocket ile tik tik BTC/ETH + REST ile **~1.400 çift**; arama, TRY/USDT filtresi, hacim/değişim/fiyat sıralama, favoriler, canlı detay modalı
- **Hisseler:** TradingView scanner'dan **BIST + ABD hacme göre ilk 50** (Cloudflare worker üzerinden), endeksler (BIST 100, S&P 500, Dow, Nasdaq 100); pazar/yön/sıralama filtreleri, favoriler, **CSV dışa aktarma (Excel uyumlu)**
- **Döviz & Altın:** USD/EUR/GBP/CHF/JPY + 9 altın-gümüş çeşidi (gramdan hesaplanır)
- **Isı haritaları:** kripto treemap'i (hacim bazlı) + hisse ısı ızgarası, tıklayınca detay
- Küresel kapitalizasyon, BTC hakimiyeti, **Korku & Açgözlülük göstergesi**
- Piyasa saatleri: BIST/ABD/döviz/kripto açık-kapalı + kapanışa geri sayım
- Veri kaynağı etiketleri: `CANLI · tik`, `worker · 30 sn`, `~15 dk`, `bot · 2 saat` — ne izlediğini her zaman bilirsin
- Tarayıcı içi fiyat alarmı (eşik ayarlı) + ntfy push bildirimleri

### 🌤️ Yaşam Widget'ları
Hava (7 gün + saatlik), hava kalitesi (AQI/PM2.5), gün doğumu-batışı, namaz vakitleri (Diyanet), çoklu döviz çevirici — hepsi Çorlu konumuna sabit, anahtarsız açık API'ler.

### 📻 Radyo & Araçlar
- 7 istasyon, **kalıcı çalar çubuğu** (sekme değiştirsen de çalar), favoriler, uyku zamanlayıcı, HLS proxy
- Çeviri aracı (MyMemory → Lingva yedeği), gece/gündüz/otomatik tema, yoğunluk & yazı boyutu, PWA (ana ekrana kurulum + offline)

---

## 🏗️ Mimari

```
┌─ GitHub Actions (2 saatte bir) ────────────────────────────┐
│ icons.py            → 5 PWA ikonu (bağımlılıksız)          │
│ fetch_and_summarize.py                                     │
│   RSS → kümeleme → Groq (yedek: Gemini) → özet/puan/ton    │
│   → news.json + feed*.xml + archive/YYYY-MM-DD.json        │
│   → ntfy bildirimleri (kategori + piyasa %2 eşik)          │
└──────────────────────────┬─────────────────────────────────┘
                           ▼ commit
              GitHub Pages (statik barındırma)
                           ▲
┌─ Tarayıcı ───────────────┴─────────────────────────────────┐
│ index.html (tek dosya: HTML+CSS+JS)                        │
│   ├─ Binance WebSocket  → kripto tikleri (doğrudan)        │
│   ├─ radar-market worker→ hisse/endeks/döviz/metal (30 sn) │
│   ├─ Open-Meteo/Aladhan → yaşam widget'ları (doğrudan)     │
│   └─ news.json + archive → haber, arşiv, sparkline geçmişi │
└────────────────────────────────────────────────────────────┘
Cloudflare Workers: radar-market (veri toplayıcı) · radar-hls-proxy (radyo CORS)
```

**Yedeklilik zinciri:** Groq 429 verirse `retry-after` kadar bekler → günlük kota biterse o turda kapanır → Gemini dener → o da olmazsa haber önbelleğe yazılmaz, **sonraki turda otomatik yeniden denenir**. Piyasa tarafında: TradingView ölürse Yahoo, Yahoo ölürse er-api, worker ölürse bot verisi gösterilir; etiket her zaman gerçek kaynağı yazar.

---

## 📡 Veri kaynakları ve gecikmeler

| Veri | Kaynak | Gecikme | Anahtar |
|---|---|---|---|
| Haber özetleri | Groq `gpt-oss-120b` (yedek Gemini) | 2 saatte bir | ✅ Secrets |
| Kripto fiyatları | Binance WS + REST | **~1 sn** | gerekmez |
| BIST/ABD hisseleri | TradingView scanner (worker) | ~15 dk | gerekmez |
| Endeksler | TradingView / Yahoo (worker) | ~15 dk | gerekmez |
| Döviz | Yahoo → er-api (worker) | ~1 dk / günlük | gerekmez |
| Altın | gold-api (worker) + gram hesabı | ~1 dk | gerekmez |
| Hava / AQI / gün ışığı | Open-Meteo | ~10 dk | gerekmez |
| Namaz vakitleri | Aladhan (Diyanet metodu) | günlük | gerekmez |
| Küresel kripto metrikleri | CoinGecko Global | ~1 dk | gerekmez |
| Korku & Açgözlülük | alternative.me | günlük | gerekmez |

---

## 🚀 Kurulum

1. Repoyu fork'la → **Settings → Pages → Branch: `main` / root**
2. **Settings → Secrets and variables → Actions → Secrets:**
   - `GROQ_API_KEY` (zorunlu) — [console.groq.com](https://console.groq.com)
   - `GEMINI_API_KEY` (yedek, önerilir)
   - `NTFY_TOPIC` (hata bildirimleri, isteğe bağlı)
3. **Variables** (isteğe bağlı, hepsinin kodda varsayılanı var):
   `AI_TEMPERATURE` · `AI_PROMPT_VER` · `SITE_URL` · `AI_PACE_SECONDS` (10) · `AI_TEXT_LIMIT` (700) · `EVENT_CLUSTER` (0 = kapalı)
4. Cloudflare'da iki worker kur (kodları projeye ait, panoda `radar-market` ve `radar-hls-proxy`):
   - `radar-market` → `index.html` içindeki `MKT_URL` satırına kendi worker adresini yaz (`.../market` ile bitmeli)
5. **Actions → RADAR Haber Botu → Run workflow** → 2-3 dk sonra site dolu.

> Ücretsiz Groq kotası: 8.000 token/dk · 200.000 token/gün. Bot 2 saatte bir ~15-25 bin token harcar → rahat sığar. Kota dolarsa cron'u `'0 */4 * * *'` yap.

---

## 🗂️ Dosya haritası

| Dosya | Görev |
|---|---|
| `index.html` | Tüm arayüz (tek dosya: HTML+CSS+JS) + alttaki yama blokları |
| `fetch_and_summarize.py` | Haber motoru, AI, kümeleme, RSS üretimi, bildirimler |
| `icons.py` | PWA ikonları (standart kütüphane, deterministik) |
| `sw.js` / `manifest.json` | Offline önbellek (v5) ve kurulum manifesti |
| `news.json` | Canlı akış verisi (bot yazar) |
| `archive/` | Günlük snapshot'lar, son 60 gün (otomatik budanır) |
| `feed.xml`, `feed-*.xml` | RSS çıktıları (7 adet) |
| `.github/workflows/update-news.yml` | Zamanlayıcı + commit zinciri |

---

## 🩺 Bakım / sağlık kontrolü

- **Bot logu:** en sonda `AI özeti → Groq: N · Gemini: 0 · boş cevap: 0` görmelisin. `boş cevap > 0` ise kota/sağlık sorunu var.
- **Site:** Piyasa üstündeki çipler → `hisseler: worker 30 sn` (yeşil) ve `kripto: CANLI · tik`. Griyse worker'ı kontrol et.
- **Bayat veri:** akışın üstünde `⚠️ Veri X saat önce` uyarısı çıkıyorsa Actions'a bak.
- **RSS aboneliği:** `.../radar/feed.xml` + kategori başına `feed-<id>.xml`.

---

## ⚖️ Dürüstlük & sınırlar

- Özetler ve puanlar **AI ürünüdür**, hata içerebilir; her haberin kaynak bağlantısı her zaman görünür.
- Sansasyon skoru bir **dil** değerlendirmesidir; doğruluk/güvenilirlik ölçmez.
- BIST verisi ücretsiz kaynaklarda **~15 dk gecikmelidir**; ABD kapanış sonrası son değer kalır. Bu bir yatırım tavsiyesi aracı değildir.
- Çeyrek/ata altın **gram fiyatından hesaplanır**; kuyumcu işçilik primi dahil değildir.
- Kripto `USDT` çiftleri ile aracı uygulamaların `USD` fiyatları makas/USDT farkı nedeniyle ±%0,5 sapabilir.
- Piyasa saatleri resmî tatilleri içermez.
- RSS kaynaklarının telif hakları ilgili yayıncılara aittir; RADAR yalnızca özet + bağlantı sunar. Radyo yayınları yayıncıların kamuya açık akışlarıdır.

---

*Tek kişilik bir "haber + piyasa terminali" hobisi olarak başladı; hâlâ tek dosya, hâlâ 0 ₺ sunucu. 📡*
```

---

