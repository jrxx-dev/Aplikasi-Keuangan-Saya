import { db } from "@/db";
import { sql } from "drizzle-orm";

async function addMissingColumns() {
    try {
        console.log("🔧 Adding missing columns...\n");

        // Try to add resolved_at
        try {
            await db.execute(sql`ALTER TABLE logs ADD COLUMN resolved_at timestamp`);
            console.log("✅ Added 'resolved_at' column");
        } catch (e: any) {
            if (e.message?.includes("already exists")) {
                console.log("ℹ️  'resolved_at' already exists");
            } else {
                console.error("❌ Error adding resolved_at:", e.message);
            }
        }

        // Try to add resolved_by
        try {
            await db.execute(sql`ALTER TABLE logs ADD COLUMN resolved_by text`);
            console.log("✅ Added 'resolved_by' column");
        } catch (e: any) {
            if (e.message?.includes("already exists")) {
                console.log("ℹ️  'resolved_by' already exists");
            } else {
                console.error("❌ Error adding resolved_by:", e.message);
            }
        }

        console.log("\n✅ Done!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    }
}

addMissingColumns();
