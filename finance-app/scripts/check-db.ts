
import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("🔌 Connecting to DB...");
    try {
        const result = await db.execute(sql`select version()`);
        console.log("✅ DB Connection SUCCESS!");
        console.log("📊 Version:", (result as any)[0]?.version || (result as any).rows?.[0]?.version || "Unknown");
    } catch (e: any) {
        console.error("❌ DB Connection FAILED:");
        console.error(e.message);
    }
    process.exit(0);
}

main();
