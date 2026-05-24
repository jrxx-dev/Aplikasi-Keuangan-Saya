
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL is missing');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function main() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        // 1. Create Bucket via SQL (bypass JS API limits)
        await client.query(`
            INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (
                'avatars', 
                'avatars', 
                true, 
                2097152, 
                ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
            )
            ON CONFLICT (id) DO UPDATE SET 
                public = true,
                file_size_limit = 2097152;
        `);
        console.log('📦 Bucket "avatars" ensured.');

        // 2. Create Policies (Drop first to avoid conflicts)

        // --- Policy: SELECT (Public) ---
        // Warning: We need to use EXECUTE to handle conditional policy creation somewhat, 
        // or just Drop If Exists logic usually works for raw SQL scripts.

        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access Avatars'
                ) THEN
                    CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
                END IF;
            END $$;
        `);
        console.log('🔓 Policy "Public Access" ensured.');

        // --- Policy: INSERT (Authenticated) ---
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Auth Upload Avatars'
                ) THEN
                    CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
                END IF;
            END $$;
        `);
        console.log('⬆️ Policy "Auth Upload" ensured.');

        // --- Policy: UPDATE (Owner) - Simplified to Authenticated for now ---
        await client.query(`
             DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Auth Update Avatars'
                ) THEN
                     CREATE POLICY "Auth Update Avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
                END IF;
            END $$;
        `);
        console.log('✏️ Policy "Auth Update" ensured.');

        console.log('✅ Storage setup complete via Direct SQL!');

    } catch (err: any) {
        console.error('❌ Error setting up storage:', err.message);
    } finally {
        await client.end();
    }
}

main();
