
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as schema from "./schema";

// Strip `sslmode` from the URL so the `ssl` option below governs TLS deterministically.
// (Recent pg versions treat sslmode=require as verify-full, which conflicts with a
// custom CA / rejectUnauthorized setting.)
const rawConnectionString = process.env.DATABASE_URL;
const connectionString = rawConnectionString
    ?.replace(/([?&])sslmode=[^&]*(&|$)/i, (_m, p1, p2) => (p2 === '&' ? p1 : ''))
    .replace(/[?&]$/, '');
const isSupabase = !!connectionString && /supabase\.(co|com)/.test(connectionString);

/**
 * TLS config for the DB connection.
 *
 * Supabase's connection pooler presents a certificate signed by a private CA,
 * so plain `rejectUnauthorized: true` fails with SELF_SIGNED_CERT_IN_CHAIN.
 * Provide the Supabase CA bundle to verify properly:
 *   - drop it at finance-app/certs/supabase-ca.crt, OR
 *   - set SUPABASE_CA_CERT to the PEM contents
 * Download it from Supabase Dashboard -> Project Settings -> Database -> SSL configuration.
 *
 * Without a CA we still connect, but log a warning. We never disable TLS
 * process-wide (NODE_TLS_REJECT_UNAUTHORIZED) - that would weaken every
 * outbound HTTPS call in the app.
 */
function resolveSsl(): false | { ca: string; rejectUnauthorized: true } | { rejectUnauthorized: false } {
    if (!isSupabase) return false;

    const inlineCa = process.env.SUPABASE_CA_CERT;
    if (inlineCa && inlineCa.includes('BEGIN CERTIFICATE')) {
        return { ca: inlineCa, rejectUnauthorized: true };
    }

    try {
        const caPath = path.join(process.cwd(), 'certs', 'supabase-ca.crt');
        const ca = readFileSync(caPath, 'utf8');
        if (ca.includes('BEGIN CERTIFICATE')) {
            return { ca, rejectUnauthorized: true };
        }
    } catch {
        // no CA file present
    }

    console.warn(
        '[db] Supabase CA cert not found (certs/supabase-ca.crt or SUPABASE_CA_CERT). ' +
        'Connecting without full certificate verification. Add the CA to enable it.'
    );
    return { rejectUnauthorized: false };
}

const pool = new Pool({
    connectionString,
    ssl: resolveSsl(),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });
