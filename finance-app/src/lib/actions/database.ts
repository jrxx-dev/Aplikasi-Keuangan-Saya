"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function pingDatabase() {
    const startTime = Date.now();

    try {
        // Simple ping query
        await db.execute(sql`SELECT 1`);

        const latency = Date.now() - startTime;

        return {
            status: "connected",
            latency,
            timestamp: new Date().toISOString()
        };
    } catch (error: any) {
        return {
            status: "disconnected",
            latency: null,
            error: error.message || "Connection failed",
            timestamp: new Date().toISOString()
        };
    }
}

export async function getDatabaseInfo() {
    try {
        const result = await db.execute(sql`
            SELECT 
                version() as version,
                current_database() as database,
                current_user as user
        `);

        return {
            success: true,
            data: (result as any).rows?.[0] || (result as any)[0]
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getDatabaseMetrics() {
    try {
        // Get active connections
        const connectionsResult = await db.execute(sql`
            SELECT count(*) as active_connections 
            FROM pg_stat_activity 
            WHERE state = 'active'
        `);

        // Get database size
        const sizeResult = await db.execute(sql`
            SELECT pg_database_size(current_database()) as size_bytes
        `);

        // Get total connections
        const totalConnectionsResult = await db.execute(sql`
            SELECT count(*) as total_connections 
            FROM pg_stat_activity
        `);

        // Get cache hit ratio
        const cacheResult = await db.execute(sql`
            SELECT 
                sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) * 100 as cache_hit_ratio
            FROM pg_statio_user_tables
        `);

        // Get transaction stats
        const transactionResult = await db.execute(sql`
            SELECT 
                xact_commit as commits,
                xact_rollback as rollbacks
            FROM pg_stat_database 
            WHERE datname = current_database()
        `);

        const connections = (connectionsResult as any).rows?.[0] || (connectionsResult as any)[0];
        const size = (sizeResult as any).rows?.[0] || (sizeResult as any)[0];
        const totalConns = (totalConnectionsResult as any).rows?.[0] || (totalConnectionsResult as any)[0];
        const cache = (cacheResult as any).rows?.[0] || (cacheResult as any)[0];
        const transactions = (transactionResult as any).rows?.[0] || (transactionResult as any)[0];

        return {
            success: true,
            data: {
                activeConnections: Number(connections?.active_connections || 0),
                totalConnections: Number(totalConns?.total_connections || 0),
                sizeBytes: Number(size?.size_bytes || 0),
                sizeMB: Math.round(Number(size?.size_bytes || 0) / 1024 / 1024 * 100) / 100,
                cacheHitRatio: Math.round(Number(cache?.cache_hit_ratio || 0) * 100) / 100,
                commits: Number(transactions?.commits || 0),
                rollbacks: Number(transactions?.rollbacks || 0)
            }
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Query Performance Metrics (Update every 15 seconds)
export async function getQueryPerformance() {
    try {
        // Get slow queries
        const slowQueries = await db.execute(sql`
            SELECT 
                calls,
                total_exec_time,
                mean_exec_time,
                max_exec_time,
                query
            FROM pg_stat_statements
            WHERE mean_exec_time > 100
            ORDER BY mean_exec_time DESC
            LIMIT 5
        `);

        // Get query statistics
        const queryStats = await db.execute(sql`
            SELECT 
                count(*) as total_queries,
                sum(calls) as total_calls,
                avg(mean_exec_time) as avg_time
            FROM pg_stat_statements
        `);

        const stats = (queryStats as any).rows?.[0] || (queryStats as any)[0];

        return {
            success: true,
            data: {
                slowQueries: (slowQueries as any).rows || slowQueries || [],
                totalQueries: Number(stats?.total_queries || 0),
                totalCalls: Number(stats?.total_calls || 0),
                avgTime: Math.round(Number(stats?.avg_time || 0) * 100) / 100
            }
        };
    } catch (error: any) {
        // pg_stat_statements might not be enabled
        return {
            success: false,
            error: "Query stats not available (pg_stat_statements extension may not be enabled)"
        };
    }
}

// Table Statistics (Update every 30 seconds)
export async function getTableStatistics() {
    try {
        const tableStats = await db.execute(sql`
            SELECT 
                schemaname,
                tablename,
                n_live_tup as row_count,
                n_dead_tup as dead_rows,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                last_vacuum,
                last_autovacuum
            FROM pg_stat_user_tables
            ORDER BY n_live_tup DESC
            LIMIT 10
        `);

        return {
            success: true,
            data: (tableStats as any).rows || tableStats || []
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

// System Health (Update every 60 seconds)
export async function getSystemHealth() {
    try {
        // Get replication status
        const replicationResult = await db.execute(sql`
            SELECT 
                CASE WHEN pg_is_in_recovery() THEN 'replica' ELSE 'primary' END as role,
                pg_last_wal_receive_lsn() as receive_lsn,
                pg_last_wal_replay_lsn() as replay_lsn
        `);

        // Get locks
        const locksResult = await db.execute(sql`
            SELECT count(*) as lock_count
            FROM pg_locks
            WHERE NOT granted
        `);

        // Get database age
        const ageResult = await db.execute(sql`
            SELECT 
                age(datfrozenxid) as transaction_age
            FROM pg_database
            WHERE datname = current_database()
        `);

        const replication = (replicationResult as any).rows?.[0] || (replicationResult as any)[0];
        const locks = (locksResult as any).rows?.[0] || (locksResult as any)[0];
        const age = (ageResult as any).rows?.[0] || (ageResult as any)[0];

        return {
            success: true,
            data: {
                role: replication?.role || 'primary',
                activeLocks: Number(locks?.lock_count || 0),
                transactionAge: Number(age?.transaction_age || 0),
                needsVacuum: Number(age?.transaction_age || 0) > 1000000000
            }
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}
