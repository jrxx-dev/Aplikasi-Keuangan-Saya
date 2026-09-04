-- Hapus modul Business dari database.
-- Jalankan MANUAL di Supabase -> SQL Editor SETELAH backup database.
-- Tabel-tabel ini dibuat lewat `drizzle-kit push`, tidak ada di file migrasi drizzle,
-- jadi tidak perlu migrasi baru - cukup DROP di sini.
--
-- PERINGATAN: DESTRUKTIF DAN TIDAK BISA DIBATALKAN.
-- Semua data pelanggan (NIK, foto KTP, SSID/password WiFi, koordinat GPS),
-- aset bisnis, pemasukan/pengeluaran bisnis, hutang/piutang bisnis, dan
-- pengaturan bisnis akan hilang permanen.

BEGIN;

DROP TABLE IF EXISTS business_clients  CASCADE;
DROP TABLE IF EXISTS business_assets   CASCADE;
DROP TABLE IF EXISTS business_incomes  CASCADE;
DROP TABLE IF EXISTS business_expenses CASCADE;
DROP TABLE IF EXISTS business_debts    CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;

COMMIT;

-- Setelah ini, hapus juga file foto KTP yang tersimpan di server:
--   finance-app/public/uploads/customers/*
