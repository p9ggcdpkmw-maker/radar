import os
import json
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = os.environ.get("TELEGRAM_TOKEN")

async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        meta = data.get("meta", {})
        items = data.get("items", [])
        msg = "📊 *RADAR İstatistikleri*\n\n"
        msg += f"📰 Toplam haber: `{len(items)}`\n"
        msg += f"🕒 Son güncelleme: `{meta.get('generated_at', 'Bilinmiyor')}`\n"
        msg += f"🤖 Model: `{meta.get('model', 'Bilinmiyor')}`\n"
        msg += f"📡 AI çağrıları: Groq `{meta.get('groq_calls', 0)}` · Gemini `{meta.get('gemini_calls', 0)}`\n"
        msg += f"💾 Dosya boyutu: `{os.path.getsize('news.json') // 1024} KB`\n"
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Hata: {e}")

async def categories(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        with open("news.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        items = data.get("items", [])
        cats = {}
        for it in items:
            cats[it.get('cat', 'Bilinmiyor')] = cats.get(it.get('cat', 'Bilinmiyor'), 0) + 1
        msg = "📂 *Kategori Dağılımı*\n\n"
        for cat, count in sorted(cats.items(), key=lambda x: x[1], reverse=True):
            msg += f"• {cat}: `{count}`\n"
        await update.message.reply_text(msg, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Hata: {e}")

def main():
    if not TOKEN:
        print("HATA: TELEGRAM_TOKEN bulunamadı!")
        return
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("stats", stats))
    app.add_handler(CommandHandler("categories", categories))
    print("✅ Dashboard bot başlatıldı")
    app.run_polling()

if __name__ == "__main__":
    main()
