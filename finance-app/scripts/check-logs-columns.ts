import { db } from "@/db";
import { sql } from "drizzle-orm";

async function checkColumns() {
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'logs'
      ORDER BY ordinal_position
    `);

        console.log("📋 Columns in 'logs' table:");
        console.table(result.rows);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

checkColumns();
