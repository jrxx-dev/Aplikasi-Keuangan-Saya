import { db } from "@/db";
import { sql } from "drizzle-orm";

async function fixLogsTable() {
    try {
        console.log("🔧 Adding columns to logs table...");

        // Add columns one by one
        try {
            await db.execute(sql`ALTER TABLE logs ADD COLUMN IF NOT EXISTS resolved boolean DEFAULT false NOT NULL`);
            console.log("✅ Added 'resolved' column");
        } catch (e) {
            console.log("ℹ️  'resolved' column already exists");
        }

        try {
            await db.execute(sql`ALTER TABLE logs ADD COLUMN IF NOT EXISTS resolved_at timestamp`);
            console.log("✅ Added 'resolved_at' column");
        } catch (e) {
            console.log("ℹ️  'resolved_at' column already exists");
        }

        try {
            await db.execute(sql`ALTER TABLE logs ADD COLUMN IF NOT EXISTS resolved_by text`);
            console.log("✅ Added 'resolved_by' column");
        } catch (e) {
            console.log("ℹ️  'resolved_by' column already exists");
        }

        console.log("✅ Migration completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

fixLogsTable();
