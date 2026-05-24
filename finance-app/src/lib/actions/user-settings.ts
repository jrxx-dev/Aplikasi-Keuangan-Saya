"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { userSettings } from "@/db/schema/finance";
import { eq } from "drizzle-orm";

export async function updateLanguagePreference(language: 'id' | 'en') {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        // Check if user settings exist
        const existing = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, session.user.id)
        });

        if (existing) {
            // Update existing
            await db.update(userSettings)
                .set({
                    language,
                    updatedAt: new Date()
                })
                .where(eq(userSettings.userId, session.user.id));
        } else {
            // Create new
            await db.insert(userSettings).values({
                userId: session.user.id,
                language,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating language preference:", error);
        return { success: false, error: "Failed to update language preference" };
    }
}

export async function getLanguagePreference() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return { language: 'id' as const }; // Default
    }

    try {
        const settings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, session.user.id)
        });

        return { language: (settings?.language as 'id' | 'en') || 'id' };
    } catch (error) {
        console.error("Error fetching language preference:", error);
        return { language: 'id' as const };
    }
}
