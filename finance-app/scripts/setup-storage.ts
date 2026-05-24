
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
    console.log('📦 Setting up Storage Bucket: avatars...');

    // 1. Cek apakah bucket sudah ada
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('❌ Failed to list buckets:', listError.message);
        process.exit(1);
    }

    const avatarBucket = buckets.find(b => b.name === 'avatars');

    if (avatarBucket) {
        console.log('✅ Bucket "avatars" already exists.');
    } else {
        // 2. Buat bucket baru jika belum ada
        console.log('🔨 Creating bucket "avatars"...');
        const { data, error: createError } = await supabase.storage.createBucket('avatars', {
            public: true, // PENTING: Supaya bisa diakses publik
            fileSizeLimit: 2097152, // 2MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

        if (createError) {
            console.error('❌ Failed to create bucket:', createError.message);
            console.log('👉 Please create it manually in Supabase Dashboard > Storage > New Bucket > "avatars" (Public).');
        } else {
            console.log('✅ Bucket "avatars" created successfully!');
        }
    }

    // 3. Tambahkan Policy (Opsional, tapi penting agar user bisa upload)
    // Catatan: Membuat policy via API JS tidak selalu didukung penuh, biasanya perlu SQL.
    // Tapi dengan public: true, read access aman. Upload access authenticated user biasanya butuh RLS policy SQL.

    console.log('\n⚠️ IMPORTANT: If upload still fails, you function requires RLS Policies.');
    console.log('   Run this SQL in Supabase SQL Editor if needed:');
    console.log(`
    -- Allow public read access
    create policy "Public Access"
    on storage.objects for select
    using ( bucket_id = 'avatars' );

    -- Allow authenticated uploads
    create policy "Authenticated Uploads"
    on storage.objects for insert
    to authenticated
    with check ( bucket_id = 'avatars' );
  `);
}

main();
