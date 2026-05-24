import { db } from "@/db";
import { logs } from "@/db/schema";
import { eq, desc, lt } from "drizzle-orm";
import crypto from "crypto";

export type LogLevel = "info" | "warning" | "error" | "success";

interface CreateLogParams {
    userId?: string;
    level: LogLevel;
    action: string;
    message: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Create a log entry in the database
 */
// ... imports

export async function createLog(params: CreateLogParams) {
    try {
        const logId = crypto.randomUUID();

        // Auto-resolve logic: Success and Info are considered "resolved" by default
        // Error and Warning require attention (unresolved)
        const isAutoResolved = params.level === "success" || params.level === "info";

        await db.insert(logs).values({
            id: logId,
            userId: params.userId || null,
            level: params.level,
            action: params.action,
            message: params.message,
            metadata: params.metadata || null,
            ipAddress: params.ipAddress || null,
            userAgent: params.userAgent || null,
            resolved: isAutoResolved,
            resolvedAt: isAutoResolved ? new Date() : null,
            resolvedBy: isAutoResolved ? "system" : null,
        });

        // Also log to console for development
        const emoji = {
            info: "ℹ️",
            warning: "⚠️",
            error: "❌",
            success: "✅",
        }[params.level];

        console.log(`${emoji} [LOG] ${params.action}: ${params.message}`, params.metadata || "");

        return { success: true, logId };
    } catch (error) {
        console.error("Failed to create log:", error);
        return { success: false, error };
    }
}

/**
 * Get all logs for a user
 */
export async function getUserLogs(userId: string, limit = 100) {
    try {
        const userLogs = await db
            .select()
            .from(logs)
            .where(eq(logs.userId, userId))
            .orderBy(desc(logs.createdAt))
            .limit(limit);

        return { success: true, logs: userLogs };
    } catch (error) {
        console.error("Failed to get user logs:", error);
        return { success: false, logs: [], error };
    }
}

/**
 * Get all logs (admin only)
 */
export async function getAllLogs(limit = 1000) {
    try {
        const allLogs = await db
            .select()
            .from(logs)
            .orderBy(desc(logs.createdAt))
            .limit(limit);

        return { success: true, logs: allLogs };
    } catch (error) {
        console.error("Failed to get all logs:", error);
        return { success: false, logs: [], error };
    }
}

/**
 * Delete old logs (cleanup)
 */
export async function deleteOldLogs(daysOld = 30) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        await db
            .delete(logs)
            .where(lt(logs.createdAt, cutoffDate));

        return { success: true };
    } catch (error) {
        console.error("Failed to delete old logs:", error);
        return { success: false, error };
    }
}
