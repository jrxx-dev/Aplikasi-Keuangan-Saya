import { db } from "@/db";
import { logs } from "@/db/schema";
import crypto from "crypto";

/**
 * Seed sample logs for testing
 * Run: node --loader ts-node/esm scripts/seed-logs.ts
 */
async function seedLogs() {
    console.log("🌱 Seeding sample logs...");

    const sampleLogs = [
        // Success logs
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "success" as const,
            action: "update_balance",
            message: "Saldo akun BRI berhasil diubah menjadi Rp 50.000.000",
            metadata: {
                accountName: "BRI",
                oldBalance: "100000",
                newBalance: "50000000"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
        },
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "success" as const,
            action: "create_transaction",
            message: "Transaksi berhasil dibuat: Gaji Bulanan",
            metadata: {
                type: "income",
                amount: 5000000,
                account: "BCA"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        },

        // Info logs
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "info" as const,
            action: "button_click",
            message: "Button clicked: Export CSV",
            metadata: {
                buttonName: "Export CSV",
                url: "/transactions"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
        },
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "info" as const,
            action: "form_submit",
            message: "Form submitted: Add Transaction",
            metadata: {
                formName: "Add Transaction"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
        },

        // Warning logs
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "warning" as const,
            action: "no_action_found",
            message: "AI tidak mengeluarkan action format yang valid",
            metadata: {
                fullText: "Baik, saya akan update saldo...",
                expectedPattern: ":::ACTION:{...}:::"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
        },
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "warning" as const,
            action: "button_no_handler",
            message: "Button 'Coming Soon' tidak memiliki fungsi onClick",
            metadata: {
                buttonName: "Coming Soon",
                url: "/dashboard"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
        },

        // Error logs
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "error" as const,
            action: "update_balance_failed",
            message: "Gagal update saldo: akun 'TIDAK_ADA' tidak ditemukan",
            metadata: {
                accountName: "TIDAK_ADA",
                balance: 50000000
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
        },
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "error" as const,
            action: "global_error",
            message: "Cannot read property 'name' of undefined",
            metadata: {
                filename: "chat-widget.tsx",
                lineno: 123,
                stack: "Error: Cannot read property 'name' of undefined\n  at ...",
                url: "/dashboard"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },

        // Yesterday's logs
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "success" as const,
            action: "delete_account",
            message: "Akun 'Gopay' berhasil dihapus",
            metadata: {
                accountName: "Gopay",
                accountType: "wallet",
                balance: "250000"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        },
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "info" as const,
            action: "button_click",
            message: "Button clicked: Add Account",
            metadata: {
                buttonName: "Add Account"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 30) // 1 day 30 min ago
        },

        // 2 days ago
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "error" as const,
            action: "form_error",
            message: "Error saat submit form 'Add Transaction': Validation failed",
            metadata: {
                formName: "Add Transaction",
                error: "Amount is required"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 days ago
        },
        {
            id: crypto.randomUUID(),
            userId: null,
            level: "success" as const,
            action: "update_account",
            message: "Akun 'BCA' berhasil diubah menjadi 'Bank BCA'",
            metadata: {
                oldName: "BCA",
                newName: "Bank BCA"
            },
            ipAddress: "192.168.1.1",
            userAgent: "Mozilla/5.0...",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48 - 1000 * 60 * 15) // 2 days 15 min ago
        }
    ];

    try {
        for (const log of sampleLogs) {
            await db.insert(logs).values(log);
        }
        console.log(`✅ Successfully seeded ${sampleLogs.length} sample logs`);
    } catch (error) {
        console.error("❌ Error seeding logs:", error);
    }
}

seedLogs();
