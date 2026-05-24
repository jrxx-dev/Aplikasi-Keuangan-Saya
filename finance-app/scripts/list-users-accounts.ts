
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
    console.log("--- DEBUGGING USER & ACCOUNTS ---");

    // 1. List All Auth Users
    const { data: { users } } = await supabase.auth.admin.listUsers();
    console.log(`Total Auth Users: ${users?.length}`);
    users?.forEach(u => {
        console.log(`User: ${u.email} | ID: ${u.id} | Provider: ${u.app_metadata.provider}`);
    });

    // 2. List All Accounts in DB
    const allAccounts = await db.query.accounts.findMany();
    console.log(`\nTotal DB Accounts: ${allAccounts.length}`);
    allAccounts.forEach(acc => {
        console.log(`ACC: ${acc.name} | Balance: ${acc.balance} | OwnerID: ${acc.userId}`);
    });

    process.exit(0);
}

main();
