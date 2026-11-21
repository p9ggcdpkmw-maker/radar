import os
import json
import logging
import requests
from telegram import Update, BotCommand
from telegram.ext import Application, CommandHandler, ContextTypes

# GitHub Secrets'tan gelen token
TOKEN = os.environ.get("TELEGRAM_TOKEN")
SITE_URL = "https://p9ggcdpkmw-maker.github.io/radar/"

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)


def md(t):
    """Telegram Markdown için güvenli escape: _ * ` [ ] \\ """
    return str(t or "").replace("\\", "\\\\").replace("_", "\\_").replace("*", "\\*").replace("`", "\\`").replace("[", "\\[").replace("]", "\\]")


def load_data():
    """Önce canlı siteden taze veri; olmazsa yerel news.json (yedek)."""
    try:
        r = requests.get(SITE_URL + "news.json", timeout=10)
        if r.ok:
            return r.json()
    except Exception:
        pass
    with open("news.json", "r", encoding="utf-8") as f:
        return json.load(f)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🚀 *RADAR'a hoş geldin!*\n\n"
        "Ben sunucusuz haber ve piyasa takip asistanınım. "
        "Aşağıdaki komutları kullanarak güncel bilgilere anında ulaşabilirsin:\n\n"
        "/help - ❓ Yardım ve komutlar"
    , parse_mode="Markdown")


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "❓ *RADAR Komut Listesi*\n\n"
        "/news - 📰 Güncel haberleri gör\n"
        "/markets - 📈 Piyasa verilerini görüntüle\n"
        "/weather - 🌤️ Hava durumunu öğren\n"
        "/games - 🎮 Ücretsiz oyun fırsatları\n"
        "/corlu - 📍 Çorlu haberlerini gör\n"
        "/stats - 📊 Bot ve veri istatistikleri\n"
        "/categories - 📂 Kategori dağılımı\n"
        "/about - ℹ️ RADAR hakkında"
    )
    await update.message.reply_text(text, parse_mode="Markdown")


async def news(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        data = load_data()
        items = data.get("items", [])[:5]
        if not items:
            await update.message.reply_text("Şu an haber bulunamadı.")
            return
        msg = "📰 *Son Haberler*\n\n"
        for i, item in enumerate(items, 1):
            msg += f"{i}. *{md(item.get('title'))}*\n"
            msg += f"   _{md(item.get('source'))} · {md(item.get('cat'))}_\n"
            summary = item.get('summary', '')
            msg += f"   {md(summary[:120])}{'...' if len(summary)>120 else ''}\n"
            msg += f"   🔗 [Kaynakta Oku]({item.get('link')})\n\n"
        await update.message.reply_text(msg, parse_mode="Markdown", disable_web_page_preview=True)
    except Exception as e:
        await update.message.reply_text(f"Haberler yüklenirken hata oluştu: {e}")


async def markets(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        data = load_data()
        m = data.get("market", {})
        c = data.get("crypto", [])
        msg = "📈 *Piyasa Özeti*\n\n"
        if m.get("usdtry"): msg += f"💵 *USD/TRY:* `{m['usdtry']}`\n"
        if m.get("gold_gram_try"): msg += f"🥇 *Gram Altın:* `{m['gold_gram_try']}` ₺\n"
        if c:
            msg += "\n*Kripto*\n"
            for coin in c[:2]:
                change = f"+{coin['change_pct']:.2f}" if coin['change_pct'] > 0 else f"{coin['change_pct']:.2f}"
                msg += f"🪙 *{md(coin['label'])}:* `{coin['price']}` ₺ (`{change}%`)\n"
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Piyasa verisi yüklenirken hata oluştu: {e}")


async def weather(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        data = load_data()
        w = data.get("weather", {})
        if w:
            msg = f"🌤️ *Hava Durumu ({md(w.get('city', 'Çorlu'))})*\n\n"
            msg += f"🌡️ Sıcaklık: `{w.get('temp')}`°C\n"
            msg += f"📝 Durum: {md(w.get('desc'))}"
            await update.message.reply_text(msg, parse_mode="Markdown")
        else:
            await update.message.reply_text("Hava durumu verisi şu an mevcut değil.")
    except Exception as e:
        await update.message.reply_text(f"Hava durumu yüklenirken hata oluştu: {e}")


async def games(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        data = load_data()
        items = [i for i in data.get("items", []) if i.get("catId") == "oyun"][:3]
        if not items:
            await update.message.reply_text("Şu an ücretsiz oyun fırsatı bulunamadı.")
            return
        msg = "🎮 *Ücretsiz Oyun Fırsatları*\n\n"
        for i, item in enumerate(items, 1):
            msg += f"{i}. *{md(item.get('title'))}*\n"
            msg += f"   🔗 [Detay]({item.get('link')})\n\n"
        await update.message.reply_text(msg, parse_mode="Markdown", disable_web_page_preview=True)
    except Exception as e:
        await update.message.reply_text(f"Oyun haberleri yüklenirken hata oluştu: {e}")


async def corlu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        data = load_data()
        items = [i for i in data.get("items", []) if "çorlu" in i.get("title", "").lower() or "çorlu" in i.get("summary", "").lower() or "tekirdağ" in i.get("title", "").lower()][:3]
        if items:
            msg = "📍 *Çorlu / Tekirdağ Haberleri*\n\n"
            for i, item in enumerate(items, 1):
                msg += f"{i}. *{md(item.get('title'))}*\n"
                msg += f"   _{md(item.get('source'))}_\n"
                msg += f"   🔗 [Kaynak]({item.get('link')})\n\n"
            await update.message.reply_text(msg, parse_mode="Markdown", disable_web_page_preview=True)
        else:
            await update.message.reply_text(
                "📍 *Çorlu Bilgileri*\n\n"
                "Şu an Çorlu ile ilgili spesifik bir haber yok. "
                "Ancak Çorlu hava durumu ve namaz vakitleri için `/weather` komutunu kullanabilirsin.\n\n"
                "🌐 Web Arayüzü: " + SITE_URL
            )
    except Exception as e:
        await update.message.reply_text(f"Çorlu bilgileri yüklenirken hata oluştu: {e}")


async def about(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        data = load_data()
        meta = data.get("meta", {})
        msg = "ℹ️ *RADAR Hakkında*\n\n"
        msg += "Sunucusuz (serverless) haber ve piyasa takip terminali.\n\n"
        msg += f"🤖 Model: `{md(meta.get('model', 'Bilinmiyor'))}`\n"
        msg += f"📰 Toplam Haber: `{meta.get('item_count', 0)}`\n"
        msg += f"🕒 Son Güncelleme: `{md(meta.get('generated_at', 'Bilinmiyor'))}`\n\n"
        msg += "🌐 Web: " + SITE_URL
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Bilgi yüklenirken hata oluştu: {e}")


async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        data = load_data()
        meta = data.get("meta", {})
        items = data.get("items", [])
        size_kb = len(json.dumps(data, ensure_ascii=False)) // 1024
        msg = "📊 *RADAR İstatistikleri*\n\n"
        msg += f"📰 Toplam haber: `{len(items)}`\n"
        msg += f"🕒 Son güncelleme: `{md(meta.get('generated_at', 'Bilinmiyor'))}`\n"
        msg += f"🤖 Model: `{md(meta.get('model', 'Bilinmiyor'))}`\n"
        msg += f"📡 AI çağrıları: Groq `{meta.get('groq_calls', 0)}` · Gemini `{meta.get('gemini_calls', 0)}`\n"
        msg += f"💾 Veri boyutu: `{size_kb} KB`\n"
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Hata: {e}")


async def categories(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        data = load_data()
        items = data.get("items", [])
        cats = {}
        for it in items:
            k = it.get('cat', 'Bilinmiyor')
            cats[k] = cats.get(k, 0) + 1
        msg = "📂 *Kategori Dağılımı*\n\n"
        for cat, count in sorted(cats.items(), key=lambda x: x[1], reverse=True):
            msg += f"• {md(cat)}: `{count}`\n"
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Hata: {e}")


async def set_commands(application: Application):
    commands = [
        BotCommand("start", "🚀 RADAR'ı başlat"),
        BotCommand("help", "❓ Yardım ve komutlar"),
        BotCommand("news", "📰 Güncel haberleri gör"),
        BotCommand("markets", "📈 Piyasa verilerini görüntüle"),
        BotCommand("weather", "🌤️ Hava durumunu öğren"),
        BotCommand("games", "🎮 Ücretsiz oyun fırsatları"),
        BotCommand("corlu", "📍 Çorlu haberlerini gör"),
        BotCommand("stats", "📊 Bot ve veri istatistikleri"),
        BotCommand("categories", "📂 Kategori dağılımı"),
        BotCommand("about", "ℹ️ RADAR hakkında"),
    ]
    await application.bot.set_my_commands(commands)


def main():
    if not TOKEN:
        print("HATA: TELEGRAM_TOKEN ortam değişkeninde bulunamadı!")
        return

    application = Application.builder().token(TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_cmd))
    application.add_handler(CommandHandler("news", news))
    application.add_handler(CommandHandler("markets", markets))
    application.add_handler(CommandHandler("weather", weather))
    application.add_handler(CommandHandler("games", games))
    application.add_handler(CommandHandler("corlu", corlu))
    application.add_handler(CommandHandler("stats", stats))
    application.add_handler(CommandHandler("categories", categories))
    application.add_handler(CommandHandler("about", about))

    application.post_init = set_commands

    print("✅ Bot başlatılıyor ve komutlar dinleniyor...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
