
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../db/schema/finance';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool, { schema });

async function main() {
    console.log("Creating Premium Bank Account...");

    // 1. Get User
    const email = 'jefriafriansyahm@gmail.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    if (!user) {
        console.log("User not found via script.");
        process.exit(0);
    }

    // 2. Create BCA Account
    await db.insert(schema.accounts).values({
        id: `acc_bca_${Date.now()}`,
        userId: user.id,
        name: "Bank BCA",
        type: "bank",
        balance: "50000000.00", // 50 Juta
        currency: "IDR",
        theme: "blue"
    });

    console.log("SUCCESS: Created Bank BCA with 50,000,000 IDR");
    process.exit(0);
}

main();
