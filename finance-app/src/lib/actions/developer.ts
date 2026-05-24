"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Test Database Connection
export async function testDatabaseConnection() {
    const startTime = Date.now();

    try {
        await db.execute(sql`SELECT 1`);
        const latency = Date.now() - startTime;

        return {
            success: true,
            message: `✓ Database connection successful (${latency}ms)`,
            latency,
            timestamp: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            message: `✗ Database connection failed: ${error.message}`,
            error: error.message
        };
    }
}

// Test Auth API
export async function testAuthAPI() {
    try {
        // Simple auth check
        const result = await db.execute(sql`
            SELECT COUNT(*) as user_count 
            FROM auth.users
        `);

        const count = (result as any).rows?.[0] || (result as any)[0];

        return {
            success: true,
            message: `✓ Auth API working (${count?.user_count || 0} users found)`,
            userCount: Number(count?.user_count || 0)
        };
    } catch (error: any) {
        return {
            success: false,
            message: `✗ Auth API test failed: ${error.message}`,
            error: error.message
        };
    }
}

// Health Check
export async function performHealthCheck() {
    try {
        const checks = [];

        // Database check
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        const dbLatency = Date.now() - dbStart;
        checks.push({ name: "Database", status: "healthy", latency: dbLatency });

        // Check active connections
        const connResult = await db.execute(sql`
            SELECT count(*) as active_connections 
            FROM pg_stat_activity
        `);
        const conn = (connResult as any).rows?.[0] || (connResult as any)[0];
        checks.push({
            name: "Connections",
            status: "healthy",
            value: Number(conn?.active_connections || 0)
        });

        // Check database size
        const sizeResult = await db.execute(sql`
            SELECT pg_database_size(current_database()) as size_bytes
        `);
        const size = (sizeResult as any).rows?.[0] || (sizeResult as any)[0];
        const sizeMB = Math.round(Number(size?.size_bytes || 0) / 1024 / 1024 * 100) / 100;
        checks.push({ name: "Database Size", status: "healthy", value: `${sizeMB} MB` });

        return {
            success: true,
            message: "✓ All systems operational",
            checks,
            timestamp: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            success: false,
            message: `✗ Health check failed: ${error.message}`,
            error: error.message
        };
    }
}

// Clear Server Cache
export async function clearServerCache() {
    try {
        // Revalidate all paths
        revalidatePath('/', 'layout');

        return {
            success: true,
            message: "✓ Server cache cleared successfully"
        };
    } catch (error: any) {
        return {
            success: false,
            message: `✗ Failed to clear cache: ${error.message}`,
            error: error.message
        };
    }
}

// Reset Database (Danger Zone)
export async function resetDatabase() {
    try {
        // Delete all user data (keep schema)
        await db.execute(sql`TRUNCATE TABLE transactions CASCADE`);
        await db.execute(sql`TRUNCATE TABLE accounts CASCADE`);
        await db.execute(sql`TRUNCATE TABLE categories CASCADE`);
        await db.execute(sql`TRUNCATE TABLE goals CASCADE`);
        await db.execute(sql`TRUNCATE TABLE debts CASCADE`);
        await db.execute(sql`TRUNCATE TABLE paylater_debts CASCADE`);
        await db.execute(sql`TRUNCATE TABLE budgets CASCADE`);
        await db.execute(sql`TRUNCATE TABLE subscriptions CASCADE`);

        return {
            success: true,
            message: "✓ Database reset successfully (all data cleared)"
        };
    } catch (error: any) {
        return {
            success: false,
            message: `✗ Database reset failed: ${error.message}`,
            error: error.message
        };
    }
}

// Clear User Data
export async function clearUserData(userId: string) {
    try {
        await db.execute(sql`
            DELETE FROM transactions WHERE user_id = ${userId}
        `);
        await db.execute(sql`
            DELETE FROM accounts WHERE user_id = ${userId}
        `);
        await db.execute(sql`
            DELETE FROM goals WHERE user_id = ${userId}
        `);
        await db.execute(sql`
            DELETE FROM debts WHERE user_id = ${userId}
        `);
        await db.execute(sql`
            DELETE FROM budgets WHERE user_id = ${userId}
        `);

        return {
            success: true,
            message: "✓ User data cleared successfully"
        };
    } catch (error: any) {
        return {
            success: false,
            message: `✗ Failed to clear user data: ${error.message}`,
            error: error.message
        };
    }
}

// Get Environment Info
export async function getEnvironmentInfo() {
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        nextVersion: '16.1.1',
        database: 'Supabase PostgreSQL',
        authProvider: 'Supabase Auth',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };
}

// Get Cache Stats
export async function getCacheStats() {
    try {
        // Get database cache stats
        const cacheResult = await db.execute(sql`
            SELECT 
                sum(heap_blks_hit) as cache_hits,
                sum(heap_blks_read) as cache_misses,
                sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100 as hit_ratio
            FROM pg_statio_user_tables
        `);

        const cache = (cacheResult as any).rows?.[0] || (cacheResult as any)[0];

        return {
            success: true,
            browserCache: Math.random() * 3, // Simulated for now
            apiCache: Math.random() * 2,
            dbCacheHits: Number(cache?.cache_hits || 0),
            dbCacheMisses: Number(cache?.cache_misses || 0),
            dbHitRatio: Math.round(Number(cache?.hit_ratio || 0) * 100) / 100
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}
