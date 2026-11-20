import os
import json
import logging
from telegram import Update, BotCommand
from telegram.ext import Application, CommandHandler, ContextTypes

# GitHub Secrets'tan gelen token
TOKEN = os.environ.get("TELEGRAM_TOKEN")

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🚀 *RADAR’a hoş geldin!*\n\n"
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
        "/about - ℹ️ RADAR hakkında"
    )
    await update.message.reply_text(text, parse_mode="Markdown")

async def news(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        items = data.get("items", [])[:5] # Son 5 haber
        if not items:
            await update.message.reply_text("Şu an haber bulunamadı.")
            return
        
        msg = "📰 *Son Haberler*\n\n"
        for i, item in enumerate(items, 1):
            msg += f"{i}. *{item.get('title')}*\n"
            msg += f"   _{item.get('source')} · {item.get('cat')}_\n"
            summary = item.get('summary', '')
            msg += f"   {summary[:120]}{'...' if len(summary)>120 else ''}\n"
            msg += f"   🔗 [Kaynakta Oku]({item.get('link')})\n\n"
        await update.message.reply_text(msg, parse_mode="Markdown", disable_web_page_preview=True)
    except Exception as e:
        await update.message.reply_text(f"Haberler yüklenirken hata oluştu: {e}")

async def markets(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        m = data.get("market", {})
        c = data.get("crypto", [])
        
        msg = "📈 *Piyasa Özeti*\n\n"
        if m.get("usdtry"): msg += f"💵 *USD/TRY:* `{m['usdtry']}`\n"
        if m.get("gold_gram_try"): msg += f"🥇 *Gram Altın:* `{m['gold_gram_try']}` ₺\n"
        
        if c:
            msg += "\n*Kripto*\n"
            for coin in c[:2]:
                change = f"+{coin['change_pct']:.2f}" if coin['change_pct'] > 0 else f"{coin['change_pct']:.2f}"
                msg += f"🪙 *{coin['label']}:* `{coin['price']}` ₺ (`{change}%`)\n"
                
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Piyasa verisi yüklenirken hata oluştu: {e}")

async def weather(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        w = data.get("weather", {})
        if w:
            msg = f"🌤️ *Hava Durumu (Çorlu)*\n\n"
            msg += f"🌡️ Sıcaklık: `{w.get('temp')}`°C\n"
            msg += f"📝 Durum: {w.get('desc')}"
            await update.message.reply_text(msg, parse_mode="Markdown")
        else:
            await update.message.reply_text("Hava durumu verisi şu an mevcut değil.")
    except Exception as e:
        await update.message.reply_text(f"Hava durumu yüklenirken hata oluştu: {e}")

async def games(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        items = [i for i in data.get("items", []) if i.get("catId") == "oyun"][:3]
        if not items:
            await update.message.reply_text("Şu an ücretsiz oyun fırsatı bulunamadı.")
            return
        
        msg = "🎮 *Ücretsiz Oyun Fırsatları*\n\n"
        for i, item in enumerate(items, 1):
            msg += f"{i}. *{item.get('title')}*\n"
            msg += f"   🔗 [Detay]({item.get('link')})\n\n"
        await update.message.reply_text(msg, parse_mode="Markdown", disable_web_page_preview=True)
    except Exception as e:
        await update.message.reply_text(f"Oyun haberleri yüklenirken hata oluştu: {e}")

async def corlu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        # Başlık veya özetinde Çorlu/Tekirdağ geçen haberleri filtrele
        items = [i for i in data.get("items", []) if "çorlu" in i.get("title", "").lower() or "çorlu" in i.get("summary", "").lower() or "tekirdağ" in i.get("title", "").lower()][:3]
        if items:
            msg = "📍 *Çorlu / Tekirdağ Haberleri*\n\n"
            for i, item in enumerate(items, 1):
                msg += f"{i}. *{item.get('title')}*\n"
                msg += f"   _{item.get('source')}_\n"
                msg += f"   🔗 [Kaynak]({item.get('link')})\n\n"
            await update.message.reply_text(msg, parse_mode="Markdown", disable_web_page_preview=True)
        else:
            await update.message.reply_text(
                "📍 *Çorlu Bilgileri*\n\n"
                "Şu an Çorlu ile ilgili spesifik bir haber yok. "
                "Ancak Çorlu hava durumu ve namaz vakitleri için `/weather` komutunu kullanabilirsin.\n\n"
                "🌐 Web Arayüzü: https://p9ggcdpkmw-maker.github.io/radar/"
            )
    except Exception as e:
        await update.message.reply_text(f"Çorlu bilgileri yüklenirken hata oluştu: {e}")

async def about(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        meta = data.get("meta", {})
        msg = "ℹ️ *RADAR Hakkında*\n\n"
        msg += "Sunucusuz (serverless) haber ve piyasa takip terminali.\n\n"
        msg += f"🤖 Model: `{meta.get('model', 'Bilinmiyor')}`\n"
        msg += f"📰 Toplam Haber: `{meta.get('item_count', 0)}`\n"
        msg += f"🕒 Son Güncelleme: `{meta.get('generated_at', 'Bilinmiyor')}`\n\n"
        msg += "🌐 Web: https://p9ggcdpkmw-maker.github.io/radar/"
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Bilgi yüklenirken hata oluştu: {e}")

async def set_commands(application: Application):
    # BotFather'a eklediğin listeyi koda da buradan register ediyoruz
    commands = [
        BotCommand("start", "🚀 RADAR’ı başlat"),
        BotCommand("help", "❓ Yardım ve komutlar"),
        BotCommand("news", "📰 Güncel haberleri gör"),
        BotCommand("markets", "📈 Piyasa verilerini görüntüle"),
        BotCommand("weather", "🌤️ Hava durumunu öğren"),
        BotCommand("games", "🎮 Ücretsiz oyun fırsatları"),
        BotCommand("corlu", "📍 Çorlu haberlerini gör"),
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
    application.add_handler(CommandHandler("about", about))

    # Bot başlarken komutları otomatik ayarla
    application.post_init = set_commands

    print("✅ Bot başlatılıyor ve komutlar dinleniyor...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
