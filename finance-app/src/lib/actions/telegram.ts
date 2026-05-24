'use server'

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userSettings } from "@/db/schema/finance";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function disconnectTelegram() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Option 1: Delete the settings row completely (simpler if table only stores telegram info)
        // Option 2: Update columns to null (if table has other user settings)

        // Let's check table structure first. It seems userSettings might store other preferences later.
        // But for now, disconnecting means wiping the telegram link.

        // We will Update telegramChatId and telegramUsername to NULL or DELETE the row.
        // Given current usage, DELETE is fine, but UPDATE is safer if we add more columns later.

        // UPDATE approach:
        await db.update(userSettings)
            .set({
                telegramChatId: null,
                telegramUsername: null
            })
            .where(eq(userSettings.userId, session.user.id));

        revalidatePath("/settings");
        return { success: true };

    } catch (error) {
        console.error("Disconnect Telegram Error:", error);
        return { error: "Failed to disconnect Telegram" };
    }
}
