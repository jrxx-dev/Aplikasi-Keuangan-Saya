import { db } from "@/db";
import { logs } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

async function autoResolveOldLogs() {
    try {
        console.log("🧹 Auto-resolving historical success/info logs...");

        // Update success logs
        await db.update(logs)
            .set({
                resolved: true,
                resolvedAt: new Date(),
                resolvedBy: "system_migration"
            })
            .where(inArray(logs.level, ["success", "info"]));

        console.log("✅ Successfully auto-resolved all historical success/info logs.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

autoResolveOldLogs();
