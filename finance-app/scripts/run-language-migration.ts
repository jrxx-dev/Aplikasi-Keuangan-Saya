import { db } from "../db/index";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function runMigration() {
    try {
        console.log("🔄 Running migration: add_language_column.sql");

        const migrationSQL = fs.readFileSync(
            path.join(process.cwd(), "migrations", "add_language_column.sql"),
            "utf-8"
        );

        await db.execute(sql.raw(migrationSQL));

        console.log("✅ Migration completed successfully!");
        console.log("   - Added 'language' column to user_settings table");

        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
