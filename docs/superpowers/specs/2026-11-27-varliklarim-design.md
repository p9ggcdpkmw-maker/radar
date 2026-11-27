# Varlıklarım

**Neden:** Çevredeki kullanıcıların en çok baktığı ikinci şey piyasa. "Elimdekiler bugün kaç TL ediyor?" tek bakışta görülsün.

**Kapsam:** gram altın (g), çeyrek (adet), dolar, euro → toplam TL.

**Kararlar**
- Değer = bozdurma (kullanıcı seçti): altında kuyumcu alış (truncgil, radar-market metal grubu).
- Dövizde piyasa kuru (kaynak alış vermiyor, fark binde birkaç) — Claude'un kararı.
- "Bugün ±X ₺": kalemlerin günlük % değişiminden — Claude'un kararı.
- Fiyatı gelmeyen kalem toplama katılmaz, not düşülür; yanlış toplam gösterilmez.
- Yer: Nabız üstü + masaüstü sağ ray. Miktarlar yalnız localStorage (`radar_varlik`).
- Varlık girilmemişse worker açılışta çağrılmaz (Nabız'a kadar ertelenir); girilmişse açılışta çekilir.

**Yaklaşımlar:** tarayıcıda hesap (seçilen) · sunucuda saklama (gereksiz: kişisel veri, hesap sistemi ister).

**Kapsam dışı:** alış fiyatı/kâr-zarar, diğer altın türleri, kripto.
