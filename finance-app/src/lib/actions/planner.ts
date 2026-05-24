"use server";

import { db } from "@/db";
import { plannerItems } from "@/db/schema/finance";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function savePlannerItems(items: any[], goalCategory: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const userId = session.user.id;

        // 1. Delete existing items for this specific goal category
        await db.delete(plannerItems)
            .where(
                and(
                    eq(plannerItems.userId, userId),
                    eq(plannerItems.goalCategory, goalCategory)
                )
            );

        if (items.length === 0) return { success: true };

        // 2. Insert new items
        const newItems = items.map(item => ({
            id: item.id.length < 10 ? crypto.randomUUID() : item.id, // Generate proper UUID if using simple timestamp ID
            userId: userId,
            name: item.name,
            price: item.price.toString(),
            url: item.url,
            imageUrl: item.imageUrl,
            platform: item.platform,
            goalCategory: goalCategory,
            quantity: item.quantity || 1,
            description: item.description || ""
        }));

        await db.insert(plannerItems).values(newItems);
        return { success: true };

    } catch (error) {
        console.error("Save planner error:", error);
        return { error: "Failed to save planner" };
    }
}

export async function getPlannerItems(goalCategory: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const data = await db.select().from(plannerItems)
            .where(
                and(
                    eq(plannerItems.userId, session.user.id),
                    eq(plannerItems.goalCategory, goalCategory)
                )
            );

        return {
            data: data.map(item => ({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                url: item.url || "",
                imageUrl: item.imageUrl || "",
                platform: (item.platform as any) || 'other',
                goalCategory: item.goalCategory,
                quantity: item.quantity,
                description: item.description
            }))
        };

    } catch (error) {
        console.error("Get planner error:", error);
        return { error: "Failed to fetch planner" };
    }
}
