-- ============================================================
-- MIGRATION: Tambah kolom receipt_url pada tabel transactions
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tambah kolom receipt_url (opsional / nullable)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS receipt_url TEXT DEFAULT NULL;

-- 2. Buat Supabase Storage bucket untuk menyimpan foto bukti
-- (Jalankan via Supabase Dashboard > Storage > New Bucket)
-- Nama bucket: "receipts"
-- Public: FALSE (private, hanya bisa diakses dengan token)

-- 3. Storage Policy: User hanya bisa upload ke folder miliknya sendiri
-- (Jalankan di Supabase Dashboard > Storage > receipts > Policies)

-- Policy: INSERT (Upload)
CREATE POLICY "Users can upload their own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: SELECT (View)
CREATE POLICY "Users can view their own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: DELETE
CREATE POLICY "Users can delete their own receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Verifikasi kolom berhasil ditambahkan
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
  AND column_name = 'receipt_url';
