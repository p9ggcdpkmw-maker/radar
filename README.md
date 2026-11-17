# 📡 RADAR

**Yapay zekâ ile özetlenmiş, puanlanmış ve sansasyonel dili işaretlenmiş kişisel haber akışı.**

Sunucu yok, veritabanı yok, aylık fatura yok. GitHub Actions saat başı haberleri toplar, Groq ile özetler, sonucu statik dosyalar olarak GitHub Pages'e yazar.

[![Haber Botu](https://github.com/p9ggcdpkmw-maker/radar/actions/workflows/update-news.yml/badge.svg)](https://github.com/p9ggcdpkmw-maker/radar/actions/workflows/update-news.yml)

🔗 **Canlı:** https://p9ggcdpkmw-maker.github.io/radar/

---

## Özellikler

### Haber
- 6 kategoride Türkçe RSS taraması (gündem, ekonomi, teknoloji, bilim, dünya, ücretsiz oyun)
- Her habere **özet**, **önem puanı (1-10)**, **duygu tonu** ve **"Neden önemli?"** cümlesi
- **Sansasyonel dil skoru (0-10)** — tık tuzağı haberler rozetle işaretlenir, istersen gizlenir
- **Olay kümeleme**: aynı olayı veren kaynaklar tek kartta toplanır
- **Olay örgüsü**: haberi ilk kim verdi, diğerleri kaç dakika sonra geçti — zaman çizelgesi
- Sonsuz kaydırma, arama, kategori/ton filtreleri, trend kelimeler, günlük arşiv

### Kişisel
- İlgi alanı seçimi, kaydet / beğen / okundu işaretleme (tarayıcıda saklanır)
- Filtreli bağlantı kopyalama ve kaydedilenleri JSON olarak dışa aktarma
- Gece modu (sistem temasına otomatik uyar), görselleri gizleme
- **Bayat veri uyarısı**: bot çalışmazsa site sessizce eski haberi göstermez

### Ekstra
- 📈 Piyasa: USD/TRY, gram altın, Bitcoin, Ethereum, BIST 100, S&P 500, Nasdaq + 7 hisse
- ☀️ Hava durumu (Çorlu)
- 📻 Canlı radyo (7 istasyon, HLS proxy ile)
- 🌐 Çeviri (MyMemory → Lingva yedeği)
- 🔊 Sesli okuma: tek haber veya günün analizi
- 📱 PWA: ana ekrana kurulur, internetsizken son akışı gösterir
- 🔔 ntfy ile kategori ve piyasa bildirimleri

### Şeffaflık
Her haberin **✦ AI** rozetine tıkla: hangi model, hangi sıcaklık, hangi prompt sürümü, ne zaman üretildi, hangi kaynaktan — hepsi görünür.

---

## RSS abonelikleri

| Kategori | Adres |
|---|---|
| Tümü | `https://p9ggcdpkmw-maker.github.io/radar/feed.xml` |
| Teknoloji | `.../feed-teknoloji.xml` |
| Gündem | `.../feed-gundem.xml` |
| Ekonomi | `.../feed-ekonomi.xml` |
| Bilim | `.../feed-bilim.xml` |
| Dünya | `.../feed-dunya.xml` |
| Ücretsiz Oyun | `.../feed-oyun.xml` |

---

## Nasıl çalışıyor?

