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


**Yedeklilik:** Groq başarısız olursa Gemini devreye girer. Özetlenemeyen haber önbelleğe alınmaz, sonraki turda yeniden denenir. Piyasa API'leri ölürse son bilinen değer korunur.

---

## Kurulum

1. Repoyu fork'la, **Settings → Pages → Branch: main / root** aç
2. **Settings → Secrets and variables → Actions → Secrets:**
   - `GROQ_API_KEY` (zorunlu) — [console.groq.com](https://console.groq.com)
   - `GEMINI_API_KEY` (yedek, isteğe bağlı)
   - `NTFY_TOPIC` (hata bildirimi, isteğe bağlı)
3. **Variables** (isteğe bağlı): `AI_TEMPERATURE`, `AI_PROMPT_VER`, `SITE_URL`
4. `icons.py` içindeki `SITE_URL` varsayılanını ve `index.html`'deki alan adını kendi adresinle değiştir
5. **Actions → RADAR Haber Botu → Run workflow**

---

## Dosyalar

| Dosya | Görevi |
|---|---|
| `index.html` | Tüm arayüz (HTML + CSS + JS, tek dosya) |
| `fetch_and_summarize.py` | Haber motoru, AI, piyasa, RSS üretimi |
| `icons.py` | PWA ikonları (sadece standart kütüphane) |
| `sw.js` / `manifest.json` | Offline önbellek ve kurulum |
| `news.json` | Canlı akış verisi |
| `archive/` | Günlük snapshot'lar (son 60 gün) |
| `feed*.xml` | RSS çıktıları |

---

## Sınırlar

- Özetler yapay zekâ ürünüdür, hata içerebilir; kaynak bağlantısı her zaman verilir.
- Sansasyonel dil skoru bir **dil** değerlendirmesidir, doğruluk veya güvenilirlik ölçmez.
- Duygu trendi günlük arşiv snapshot'larına dayanır; birkaç gün veri birikmesi gerekir.
- RSS kaynaklarının telif hakları ilgili yayıncılara aittir; RADAR yalnızca özet ve bağlantı sunar.
