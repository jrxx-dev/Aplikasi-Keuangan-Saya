# Telegram Bot - Financemy

Bot Telegram untuk pencatatan keuangan yang terintegrasi dengan aplikasi `finance-app`.

## Fitur
- Catat pemasukan & pengeluaran melalui chat
- Pilih akun dan kategori transaksi
- Upload bukti foto struk
- Analisis keuangan via AI

## Setup
1. Copy `.env` dari `finance-app/` atau buat baru dengan variabel:
   ```
   TELEGRAM_BOT_TOKEN=
   DATABASE_URL=
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Jalankan bot:
   ```bash
   npm run dev
   ```

## File Utama
- `kode-telegram-bot.ts` — Kode utama bot
- `scripts/` — Script utilitas (webhook, testing)
