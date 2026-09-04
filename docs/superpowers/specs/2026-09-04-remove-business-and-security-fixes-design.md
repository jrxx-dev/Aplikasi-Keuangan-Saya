# Hapus Modul Business + Fix Keamanan Kritis

Tanggal: 2026-09-04
Branch: `chore/remove-business-and-security-fixes`

## Tujuan

1. Aplikasi jadi **personal finance murni** — hapus total modul "Business" (pelanggan ISP, aset, income/expense bisnis, hutang bisnis, akumulasi laba, OCR KTP).
2. Terapkan fix keamanan #2–#6 dari panduan keamanan (akses lintas-user + hak akses admin).

Fix #1, #7, #8 dari panduan **dilewati** karena file targetnya (`business-customer.ts`, `business.ts`, `api/upload/route.ts`) dihapus total di langkah ini — `api/upload` hanya dipakai form pelanggan business.

## Fase A — Hapus Business

### File dihapus
- `finance-app/src/actions/business.ts`
- `finance-app/src/actions/business-customer.ts`
- `finance-app/src/actions/ocr-ktp.ts`
- `finance-app/src/db/schema/business.ts`
- `finance-app/src/app/(main)/business/` (page.tsx, akumulasi/page.tsx, customers/page.tsx)
- `finance-app/src/components/business/` (20 file)

### File diedit (buang referensi)
| File | Perubahan |
|------|-----------|
| `src/db/schema/index.ts` | hapus `export * from "./business"` |
| `src/components/app-sidebar.tsx` | hapus blok SidebarGroup "Business Management"; hapus import ikon nganggur (`Briefcase`, `Info`) |
| `src/app/(main)/dashboard/page.tsx` | hapus import + call `getBusinessData`, field `businessDebts` |
| `src/app/(mobile)/mobile/dashboard/page.tsx` | hapus import + call `getBusinessData`, section "Kasbon Bisnis Aktif", `activeKasbon`/`totalKasbon`, tipe `'receivable'` di `getCategoryIcon`, ikon `BadgeDollarSign` bila nganggur |
| `src/components/finance/dashboard-wrapper.tsx` | hapus import + pemakaian `KasbonWidget`, field `businessDebts` di interface |
| `src/components/mobile/mobile-input-client.tsx` | hapus import `saveDebt`; hapus opsi `"kasbon"` dari union tipe (balik grid ke 2 kolom); hapus state `debtorName`/`kasbonCategory`; hapus cabang kasbon di `handleSubmit` + form kasbon |

### Database (manual — dijalankan user)
- `finance-app/drizzle/drop-business-tables.sql`: `DROP TABLE IF EXISTS ... CASCADE` untuk `business_clients`, `business_assets`, `business_incomes`, `business_expenses`, `business_debts`, `business_settings`.
- User backup dulu (Supabase Dashboard → Database → Backups), lalu jalankan di SQL Editor.
- User hapus isi `finance-app/public/uploads/customers/` (foto KTP lama).

Tabel business tidak ada di migrasi drizzle (`drizzle/*.sql`) — dibuat lewat `drizzle-kit push`. Jadi cukup file SQL manual, tidak perlu migrasi baru.

## Fase B — Fix Keamanan #2–#6

Semua verifikasi terhadap sumber: teks `CARI` di panduan cocok. `and` + `inArray` sudah ke-import di `finance.ts`. `auth.api.getSession` (`src/lib/auth.ts`) mengembalikan `session.user.role` dari `user_metadata.role` (default `"user"`), jadi cek `!== "superadmin"` valid.

| Fix | File | Perubahan |
|-----|------|-----------|
| #2 | `src/lib/actions/developer.ts` | helper `requireAdmin()` (throw kalau `role !== "superadmin"`); panggil di awal `resetDatabase` + `clearUserData` |
| #3 | `src/lib/actions/user-management.ts` | helper `requireSuperAdmin()`; panggil di awal `getUsers`/`createUser`/`updateUserRole`/`deleteUser`; import `headers` dari `next/headers`; buang blok komentar + `getSession` bohongan di `getUsers` |
| #4 | `src/lib/actions/finance.ts` `handleAIAction` | delete & update bulk: fetch transaksi via `innerJoin(accounts)` + filter `accounts.userId = session.user.id`; hanya hapus/ubah `ownedIds` |
| #5 | `src/lib/actions/finance.ts` | `createTransaction`: cek akun milik user (`and(eq(id), eq(userId))`). `createSavingTransaction`: cek goal + akun milik user |
| #6 | `src/lib/actions/finance.ts` `deleteAccount` | cek kepemilikan akun sebelum `db.delete(transactions)` |

## Fase C — Verifikasi
- Baseline `npm run build` sebelum perubahan (deteksi kerusakan lama).
- `npm run build` sesudah; harus lolos TypeScript.

## Prasyarat sebelum deploy (SUDAH SELESAI)
Akun `jefriafriansyahm@gmail.com` sudah di-set `raw_user_meta_data.role = "superadmin"` di Supabase. Tanpa ini, user tersebut ke-lock dari User Management + Reset DB setelah fix #2/#3 dideploy.

Caveat: `user_metadata` masih bisa diubah user sendiri via Supabase SDK. Penutup penuh = pindah `role` ke `app_metadata` (langkah opsional, tidak di scope ini).

## Di luar scope
- Migrasi `role` ke `app_metadata`.
- Fix opsional lain di panduan (pairing bot Telegram, `/logs`, scraper planner, endpoint info DB, `NODE_TLS_REJECT_UNAUTHORIZED`, `rejectUnauthorized: true`).
- Pruning dependency nganggur (`leaflet`, `react-leaflet`, `@types/leaflet`, `xlsx`) — dibiarkan.
