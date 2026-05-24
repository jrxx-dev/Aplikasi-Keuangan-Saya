
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../db/schema/finance';
import 'dotenv/config';
import { eq } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool, { schema });

async function main() {
    console.log("Checking user data...");

    // 1. Get User
    const email = 'jefriafriansyahm@gmail.com';
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error listing users:", error);
        process.exit(1);
    }

    const user = users?.find(u => u.email === email);

    if (!user) {
        console.log(`User with email ${email} not found!`);
        // List all users to debug
        console.log("Available users:", users?.map(u => u.email));
        process.exit(0);
    }

    console.log(`User Found: ${user.id} (${user.email})`);

    // 2. Check Accounts
    const accounts = await db.query.accounts.findMany({
        where: (accounts, { eq }) => eq(accounts.userId, user.id)
    });

    console.log(`Found ${accounts.length} accounts.`);

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    console.log(`Total Balance across all accounts: ${totalBalance}`);

    if (totalBalance === 0 && accounts.length > 0) {
        console.log("Total balance is 0. Injecting initial funds for demo...");

        // Update first account
        const firstAccount = accounts[0];
        await db.update(schema.accounts)
            .set({
                balance: "10000000.00",
                updatedAt: new Date()
            }) // 10 Juta
            .where(eq(schema.accounts.id, firstAccount.id));

        console.log(`SUCCESS: Updated account '${firstAccount.name}' balance to IDR 10,000,000`);
    } else if (accounts.length === 0) {
        console.log("Creating default accounts...");

        // Create default accounts
        const newAccounts = await db.insert(schema.accounts).values([
            {
                id: `acc_${Date.now()}_1`,
                userId: user.id,
                name: "Bank BCA",
                type: "bank",
                balance: "15000000.00", // 15 Juta
                currency: "IDR",
                theme: "blue"
            },
            {
                id: `acc_${Date.now()}_2`,
                userId: user.id,
                name: "GoPay",
                type: "wallet",
                balance: "250000.00", // 250rb
                currency: "IDR",
                theme: "green"
            },
            {
                id: `acc_${Date.now()}_3`,
                userId: user.id,
                name: "Cash Wallet",
                type: "cash",
                balance: "500000.00", // 500rb
                currency: "IDR",
                theme: "amber"
            }
        ]).returning();

        console.log("Created accounts:", newAccounts);
    } else {
        accounts.forEach(acc => {
            console.log(`- [${acc.type}] ${acc.name}: ${acc.currency} ${acc.balance}`);
        });
    }

    process.exit(0);
}

main().catch(console.error);
