
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Dropping budgets table...");
    try {
        await db.execute(sql`DROP TABLE IF EXISTS "budgets" CASCADE`);
        console.log("Table budgets dropped successfully.");
    } catch (err) {
        console.error("Error dropping table:", err);
    }
    process.exit(0);
}

main();
