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

