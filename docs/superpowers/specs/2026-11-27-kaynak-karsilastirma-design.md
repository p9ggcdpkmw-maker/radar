# Kaynak karşılaştırma + tıklama tuzağı filtresi

**Neden:** RADAR'ın değeri haber özetleri + piyasa; reklamsız ve "gereksiz kaynak yok" iddiası öne çıkarılacak.

**Yaklaşım (seçilen: 1):** 1) Kalite filtresi + etiketli karşılaştırma. 2) Yalnız seçilmiş "dürüst" liste — reddedildi: karşılaştırma zayıflar, taraf seçmiş görünür.

**Tasarım**
- Bot kümelemede diğer kaynakların başlığını ve sahiplik etiketini saklar (`other_sources[].title/owner`, `item.owner`).
- Etiket = sahiplik türü (Kamu · Özel · Uluslararası), yorum değil (`SOURCE_OWNER`).
- Tuzak başlık kalıplarla ölçülür (`is_bait`), akışa girmez. Kaynak başına 7 günlük oran `news.json: sources`, günlük sayım `source_stats`. %15 üstü ⚠️; kaynak çıkarma kararı elle.
- Arayüz: kartta "N kaynak", detayda "Bu haberi N kaynak verdi" (başlık + etiket + zaman), Konsol'da "Kaynaklarımız".
- AI yok, ek maliyet yok.

**Kapsam dışı:** AI çerçeve yorumu, kullanıcının kaynak seçmesi.
