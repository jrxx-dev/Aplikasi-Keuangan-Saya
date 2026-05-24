# 💰 Financemy Workspace

Workspace ini berisi kumpulan aplikasi yang berhubungan dengan sistem keuangan.

## 📁 Struktur Folder

```
financemy/
├── finance-app/        → Aplikasi keuangan utama (Next.js + Drizzle ORM) [port 3000]
├── main-dashboard/     → Dashboard utama (Next.js) [port 2146]
├── telegram-bot/       → Telegram bot pencatatan keuangan
├── dashboard/          → (Legacy - tidak aktif)
├── start-dev.js        → Script untuk menjalankan semua app
├── .gitignore          → Git ignore rules
├── .editorconfig       → Editor configuration
└── README.md           → Dokumentasi workspace ini
```

## 🚀 Aplikasi

### `finance-app/`
Aplikasi web keuangan berbasis **Next.js 15** dengan fitur:
- Dashboard analitik keuangan
- Manajemen transaksi (pemasukan & pengeluaran)
- Multi akun & kategori
- Laporan & akumulasi bisnis
- Integrasi AI (OpenRouter)
- Docker support

### `main-dashboard/`
Dashboard utama berbasis **Next.js 16** dengan fitur:
- Overview multi-project
- Integrasi Supabase Auth
- Responsive design dengan Tailwind CSS

### `telegram-bot/`
Bot Telegram untuk pencatatan keuangan melalui chat. Terintegrasi dengan database `finance-app`.

## 🛠️ Setup

### 1. Clone & Install
```bash
git clone https://github.com/jrxx-dev/financemy.git
cd financemy
npm run install:all
```

### 2. Environment Variables
Setiap app memiliki file `.env.example`. Copy dan isi nilainya:
```bash
# Finance App
cp finance-app/.env.example finance-app/.env

# Main Dashboard
cp main-dashboard/.env.example main-dashboard/.env
```

### 3. Menjalankan Semua App
```bash
npm run dev
```
Atau jalankan masing-masing:
```bash
cd finance-app && npm run dev    # Port 3000
cd main-dashboard && npm run dev # Port 2146
cd telegram-bot && npm run dev   # Telegram polling
```

## 🔒 Keamanan
- **JANGAN** commit file `.env` yang berisi credential asli
- Gunakan `.env.example` sebagai template
- File sensitif seperti `db_ids.json`, `webhook.json` sudah di-gitignore
- Selalu review `.gitignore` sebelum push

---
> Dibuat dengan ❤️ untuk manajemen keuangan yang lebih baik.
