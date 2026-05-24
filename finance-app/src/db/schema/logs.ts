import { pgTable, text, timestamp, json, boolean } from "drizzle-orm/pg-core";

export const logs = pgTable("logs", {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    level: text("level").notNull(), // 'info', 'warning', 'error', 'success'
    action: text("action").notNull(), // 'create_transaction', 'delete_account', 'update_balance', etc.
    message: text("message").notNull(),
    metadata: json("metadata"), // Additional data (account name, amount, etc.)
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at")
        .$defaultFn(() => new Date())
        .notNull(),
    resolved: boolean("resolved").default(false).notNull(), // Track if error/issue is resolved
    resolvedAt: timestamp("resolved_at"), // When it was resolved
    resolvedBy: text("resolved_by"), // User ID who resolved it
});
