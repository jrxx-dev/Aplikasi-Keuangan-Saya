# Tema 2 Dashboard — Design

Status: Approved (no revisions requested)
Date: 2026-09-04
Project: finance-app

## Latar Belakang

Aplikasi finance-app punya sistem "Tema" (`src/contexts/widget-theme-context.tsx`) dengan dua preset: `tema-1` dan `tema-2`. Saat ini preset hanya mengganti warna widget (primary/secondary/accent/gradient) — bentuk/layout dashboard sama persis di kedua tema.

User minta: saat preset `tema-2` aktif, seluruh **bentuk/layout dashboard** berubah total, meniru desain referensi (screenshot dashboard fintech bergaya kartu — 3 stat card atas, kartu digital + total balance kanan atas, cashflow bar chart, gauge progress lingkaran, tabel transaksi, upcoming payments) — dengan animasi di bagian pemasukan, pengeluaran, dan cashflow. Semua data harus real-time dari aplikasi, tidak ada dummy/placeholder.

Dashboard yang dirender saat ini adalah `DashboardWrapper` (`src/components/finance/dashboard-wrapper.tsx`), dipanggil langsung dari `src/app/(main)/dashboard/page.tsx`. Layout ini adalah sidebar kiri (daftar akun) + bento grid kanan — sama sekali beda struktur dari referensi, dan **tidak terhubung** ke `useWidgetTheme()` sama sekali.

Ada juga sistem widget-grid terpisah yang sudah punya integrasi tema (`overview-cards.tsx` + `dashboard-grid.tsx`, drag-resize) tapi ini tidak dipakai di halaman dashboard utama — kemungkinan legacy/unused. Desain ini tidak menyentuh sistem itu.

## Keputusan yang Sudah Disepakati (lewat brainstorming)

1. **Scope**: Layout baru menggantikan tampilan dashboard saat `tema-2` aktif (bukan halaman terpisah). `tema-1` tetap pakai `DashboardWrapper` yang sekarang.
2. **Data**: Semua elemen wajib pakai data real dari aplikasi (accounts, transactions, goals, budgets, subscriptions, debts). Tidak ada kontak/avatar orang fiktif — fitur "Quick Transactions" avatar di gambar referensi **diganti total** jadi widget "Analisis Boros" (analisis rasio pengeluaran vs pemasukan + kategori paling boros), sesuai permintaan eksplisit user.
3. **Gauge lingkaran** (label "Achieved/Target" di referensi) dipetakan ke **progress goal terdekat** (`getGoals()`), bukan avatar/quick-transaction — karena semantiknya (achieved vs target) cocok dengan goal tabungan, bukan kontak.

## Arsitektur

### Komponen baru
Folder baru: `finance-app/src/components/finance/tema2/`

| File | Tanggung jawab |
|---|---|
| `tema2-dashboard.tsx` | Composer layout utama, terima props `data: DashboardData` (bentuk sama seperti yang sudah dipakai `DashboardWrapper`, ditambah `subscriptions: any[]`) |
| `tema2-stat-card.tsx` | Card Income/Savings/Expense — angka besar, trend %, sparkline |
| `tema2-virtual-card.tsx` | Kartu digital bergaya kartu bank untuk akun utama |
| `tema2-balance-progress.tsx` | Panel Total Balance + progress bar used/remaining |
| `tema2-cashflow-chart.tsx` | Bar chart income vs expense per bulan, tahun berjalan |
| `tema2-goal-gauge.tsx` | Gauge lingkaran progress goal terdekat |
| `tema2-spending-analysis.tsx` | Widget "Analisis Boros" (rasio pengeluaran + top kategori) |
| `tema2-transactions-table.tsx` | Tabel transaksi terbaru bergaya referensi |
| `tema2-upcoming-payments.tsx` | List tagihan mendatang (subscriptions + debts jatuh tempo) |

### Wiring
- `dashboard-wrapper.tsx`: import `useWidgetTheme`, baca `activePreset`. Jika `activePreset === "tema-2"` → render `<Tema2Dashboard data={data} />`. Selain itu → layout bento existing (tidak diubah). Ini aman karena `WidgetThemeProvider` sudah membungkus semua halaman `(main)` di `layout.tsx`.
- `src/app/(main)/dashboard/page.tsx`: tambah `safeFetch(() => getSubscriptions(), [])` ke `Promise.all`, teruskan sebagai `subscriptions` di `dashboardData`. Ini satu-satunya perubahan data-fetching yang dibutuhkan — semua sumber lain (`summary`, `accounts`, `recentTransactions`, `categoryBreakdown`, `debts`, `goals`, `budgetSummary`) sudah di-fetch.

### Layout grid (desktop, 4 kolom `md:grid-cols-4`; stack 1 kolom di mobile)

```
┌─────────────┬─────────────┬─────────────┬─────────────────────┐
│ Stat: Income │ Stat: Savings│ Stat: Expense│  Kartu Digital      │
├─────────────┴─────────────┴─────────────┤  (virtual card)      │
│  Cashflow Bar Chart (col-span-2)         ├─────────────────────┤
│                                           │  Total Balance       │
├───────────────────────────────────────────┤  + progress bar     │
│  Goal Gauge (col-span-1)                  │                     │
├───────────────────────────────────────────┴─────────────────────┤
│  Tabel Transaksi Terbaru (col-span-3)     │  Analisis Boros     │
│                                            ├─────────────────────┤
│                                            │  Upcoming Payments  │
└────────────────────────────────────────────┴─────────────────────┘
```

Detail responsif: di layar `md` ke bawah semua jadi 1 kolom stack sesuai urutan di atas (income → savings → expense → kartu digital → total balance → cashflow → gauge → transaksi → boros → upcoming).

## Pemetaan Data (semua real, tidak ada dummy)

| Elemen UI | Sumber data | Catatan |
|---|---|---|
| Stat card Income/Expense | `summary.income`, `summary.expense` | sudah ada |
| Stat card Savings | `summary.income - summary.expense` | dihitung, sudah ada polanya di `DashboardWrapper` |
| Trend % tiap stat card | `summary.averages.income/expense` vs actual | sudah ada logic-nya di `DashboardWrapper` (baris 602-614), akan dipindah/reuse |
| Sparkline tiap stat card | `summary.incomeTrend`, `summary.expenseTrend` | reuse komponen `MiniSparkline` dari `dashboard-wrapper.tsx` (export jika perlu dipakai lintas file) |
| Kartu digital: nama pemilik | akun bank utama dari `data.accounts` (`type === "bank"`, fallback akun pertama) | field `name` asli |
| Kartu digital: saldo | `account.balance` akun terpilih | asli, bisa toggle show/hide (pola sudah ada di `AccountCardVisual`) |
| Kartu digital: nomor kartu bertopeng | `•••• ••••` + 4 digit terakhir hasil hash deterministik dari `account.id` | **bukan nomor kartu bank asli** (aplikasi tidak menyimpan PAN) — visual dekoratif yang konsisten per akun, dijelaskan sebagai representasi digital bukan kartu fisik |
| Kartu digital: masa berlaku | `account.createdAt` + 3 tahun | derive dari data asli, bukan tanggal acak |
| Total Balance progress (used/remaining) | `budgetSummary.totalSpent / budgetSummary.totalBudget` × 100; fallback `summary.expense / summary.income` × 100 jika belum ada budget | asli |
| Cashflow bar chart | `summary.averages.history` (`{month, income, expense}[]`) | sudah dihitung server-side, tinggal divisualisasi |
| Goal gauge: Achieved/Target | goal dengan `deadline` terdekat dari `getGoals()` (fallback: goal pertama; fallback lagi: `budgetSummary.percentage` jika tidak ada goal sama sekali) | jika benar-benar tidak ada goal dan tidak ada budget → tampilkan empty state jujur ("Belum ada target"), tidak dipalsukan |
| Analisis Boros: rasio | `summary.expense / summary.income × 100` (capped 100) | status: <50% "Aman", 50-75% "Waspada", >75% "Boros" — threshold tetap (aturan umum, bukan data transaksi) |
| Analisis Boros: top kategori | `data.categoryBreakdown` filter `type === "expense"`, sort desc, ambil 3 teratas dengan % dari total expense | asli |
| Tabel transaksi | `data.recentTransactions` (sudah join `accountName`, `category`, `categoryIcon`, `source`) | kolom Status pakai label dari `source` (`manual→"Manual"`, `ai→"AI Deteksi"`, `voice→"Voice"`, `telegram→"Telegram"`) — bukan Completed/Cancelled palsu |
| Upcoming Payments | gabungan `subscriptions` (field `nextPaymentDate`, `name`, `cost`, `provider`/`icon`) + `data.debts` yang punya `dueDate` tidak null, sort tanggal terdekat, ambil 4-5 teratas | icon dipilih via string-match nama/provider (pola sama seperti `getCategoryIcon` di `dashboard-wrapper.tsx`), fallback icon generik |

## Animasi (framer-motion, konsisten dengan pola yang sudah ada di codebase)

- **Angka**: semua nilai uang pakai komponen `Counter` yang sudah ada (count-up animation).
- **Sparkline**: SVG `polyline`/`path` animasi `pathLength: 0 → 1` saat mount (pola baru, belum ada di `MiniSparkline` — akan ditambahkan sebagai varian).
- **Cashflow bar chart**: tiap bar animasi `scaleY`/`height: 0 → aktual` dengan stagger per bulan; tooltip muncul `opacity/scale` saat hover, mengikuti pola tooltip yang sudah dipakai di codebase (lihat referensi UI: tooltip "June 2029 Income $6,000 Expense $4,000").
- **Goal gauge**: `stroke-dashoffset` SVG circle animasi dari full (0%) ke target %, durasi ~1.2s ease-out, angka % di tengah count-up sinkron dengan progress arc (pola serupa sudah ada di `financial-health.tsx`, di-reuse gaya animasinya).
- **Kartu digital**: shimmer sweep loop (reuse pola dari `overview-cards.tsx` `StatCard`), transisi flip/slide saat toggle show/hide saldo (reuse pola `AccountCardVisual`).
- **Progress bar Total Balance**: `width: 0 → actual%` animate on mount.
- **Tabel transaksi & Upcoming Payments**: stagger fade-in per baris (reuse pola `TransactionTimeline` di `dashboard-wrapper.tsx`, delay `index * 0.05`).
- Semua entrance widget top-level pakai `containerVariants`/`itemVariants` stagger yang sudah ada di `dashboard-wrapper.tsx` (baris 572-593), reuse langsung.

## Reuse vs Baru

Dipakai ulang tanpa modifikasi:
- `Counter` (`src/components/ui/counter.tsx`)
- Pola animasi stagger (`containerVariants`, `itemVariants`)
- Pola icon lookup dari nama kategori/provider (`getCategoryIcon` di `dashboard-wrapper.tsx`)
- `formatIDR` helper

Perlu diekspor/direfaktor kecil agar bisa dipakai lintas file:
- `MiniSparkline`, `SubtleBackgroundPulse`, `formatIDR` saat ini tidak di-export dari `dashboard-wrapper.tsx` — akan dipindah ke file shared kecil (`src/components/finance/tema2/shared.tsx`) atau di-export langsung, supaya tidak duplikat kode antara layout tema-1 dan tema-2.

## Non-Goals

- Tidak mengubah sistem widget-grid drag-resize (`dashboard-grid.tsx`, `overview-cards.tsx`) — di luar scope, tidak dipakai di halaman dashboard aktif.
- Tidak menambah tabel/kolom database baru. Semua data dari skema yang sudah ada.
- Tidak membuat fitur kontak/rekan transfer baru — fitur avatar di gambar referensi sengaja diganti (lihat Keputusan #2).
- Tidak mengubah tema-1 sama sekali.

## Error Handling

- Semua sumber data sudah dibungkus `safeFetch()` di `page.tsx` dengan fallback array/object kosong — pola yang sama dipertahankan untuk `getSubscriptions()`.
- Widget dengan data kosong (belum ada goal, belum ada budget, belum ada subscription) menampilkan empty state yang jujur, bukan angka 0 yang menyesatkan atau data contoh.

## Testing

- Manual verification di browser: jalankan dev server, buka `/dashboard`, ganti Tema ke "Tema 2 - Modern Finance" lewat dropdown Tema (kanan atas), verifikasi:
  - Semua angka cocok dengan data akun/transaksi asli user (bandingkan dengan tema-1)
  - Animasi jalan (count-up, bar grow, gauge arc, shimmer kartu, stagger list)
  - Empty state muncul benar jika goals/budget/subscriptions kosong
  - Ganti balik ke Tema 1 → layout lama utuh, tidak rusak
  - Responsive: cek breakpoint mobile (1 kolom stack)
