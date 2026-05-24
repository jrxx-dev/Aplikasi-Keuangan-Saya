"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema/finance";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function getNotifications() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return [];

    const data = await db.select().from(notifications)
        .where(eq(notifications.userId, session.user.id))
        .orderBy(desc(notifications.createdAt));

    // Auto-seed if empty for better UX
    if (data.length === 0) {
        await db.insert(notifications).values([
            {
                id: crypto.randomUUID(),
                userId: session.user.id,
                title: "Selamat Datang di FinanceMy! 🎉",
                message: "Mulai perjalanan finansial Anda dengan mencatat pemasukan dan pengeluaran.",
                type: "success",
                isRead: false,
            },
            {
                id: crypto.randomUUID(),
                userId: session.user.id,
                title: "Sistem Keamanan Aktif",
                message: "Akun Anda terlindungi dengan enkripsi end-to-end.",
                type: "security",
                isRead: false,
                createdAt: new Date(Date.now() - 3600000) // 1 hour ago
            },
            {
                id: crypto.randomUUID(),
                userId: session.user.id,
                title: "Tips: Atur Budget",
                message: "Coba fitur Budgeting untuk membatasi pengeluaran bulanan Anda.",
                type: "info",
                isRead: false,
                createdAt: new Date(Date.now() - 86400000) // 1 day ago
            }
        ]);

        // Return seeded data
        return await db.select().from(notifications)
            .where(eq(notifications.userId, session.user.id))
            .orderBy(desc(notifications.createdAt));
    }

    return data;
}

export async function markAllRead() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return;

    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, session.user.id));
}
