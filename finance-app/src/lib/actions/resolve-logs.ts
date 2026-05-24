import { db } from "@/db";
import { logs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function markLogAsResolved(logId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { success: false, message: "Unauthorized" };
        }

        await db.update(logs)
            .set({
                resolved: true,
                resolvedAt: new Date(),
                resolvedBy: session.user.id
            })
            .where(eq(logs.id, logId));

        return { success: true, message: "Log marked as resolved" };
    } catch (error) {
        console.error("Failed to mark log as resolved:", error);
        return { success: false, message: String(error) };
    }
}

export async function markLogAsUnresolved(logId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { success: false, message: "Unauthorized" };
        }

        await db.update(logs)
            .set({
                resolved: false,
                resolvedAt: null,
                resolvedBy: null
            })
            .where(eq(logs.id, logId));

        return { success: true, message: "Log marked as unresolved" };
    } catch (error) {
        console.error("Failed to mark log as unresolved:", error);
        return { success: false, message: String(error) };
    }
}

export async function bulkMarkAsResolved(logIds: string[]) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { success: false, message: "Unauthorized" };
        }

        for (const logId of logIds) {
            await db.update(logs)
                .set({
                    resolved: true,
                    resolvedAt: new Date(),
                    resolvedBy: session.user.id
                })
                .where(eq(logs.id, logId));
        }

        return { success: true, message: `${logIds.length} logs marked as resolved` };
    } catch (error) {
        console.error("Failed to bulk mark as resolved:", error);
        return { success: false, message: String(error) };
    }
}
