import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createTables() {
    const client = await pool.connect();

    try {
        console.log('🔧 Creating tables...');

        // Create accounts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS accounts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                balance DECIMAL(12,2) NOT NULL DEFAULT 0,
                currency TEXT NOT NULL DEFAULT 'IDR',
                theme TEXT DEFAULT 'blue',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ accounts table created');

        // Create categories table
        await client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                icon TEXT,
                color TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ categories table created');

        // Create transactions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
                category_id TEXT NOT NULL REFERENCES categories(id),
                amount DECIMAL(12,2) NOT NULL,
                date TIMESTAMP NOT NULL,
                description TEXT,
                type TEXT NOT NULL,
                source TEXT DEFAULT 'manual',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ transactions table created');

        // Create other tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS goals (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                target_amount DECIMAL(12,2) NOT NULL,
                current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
                deadline TIMESTAMP,
                icon TEXT,
                color TEXT DEFAULT 'blue',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ goals table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS debts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                provider TEXT,
                limit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
                current_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
                due_date TIMESTAMP,
                color TEXT DEFAULT 'red',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ debts table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS paylater_debts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                provider TEXT NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                due_date TIMESTAMP,
                status TEXT NOT NULL DEFAULT 'unpaid',
                description TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ paylater_debts table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS budgets (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                color TEXT DEFAULT 'blue',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ budgets table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                cost DECIMAL(12,2) NOT NULL,
                billing_cycle TEXT NOT NULL,
                next_payment_date TIMESTAMP NOT NULL,
                category TEXT,
                provider TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                icon TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ subscriptions table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                level TEXT NOT NULL,
                action TEXT NOT NULL,
                message TEXT NOT NULL,
                metadata JSON,
                ip_address TEXT,
                user_agent TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                resolved BOOLEAN NOT NULL DEFAULT false,
                resolved_at TIMESTAMP,
                resolved_by TEXT
            );
        `);
        console.log('✅ logs table created');

        console.log('\n🎉 All tables created successfully!');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

createTables();
