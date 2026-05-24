"use server";

import { db } from "@/db";
import { goals } from "@/db/schema/finance";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";
// import { generateId } from "@/lib/utils"; // Not strictly needed if we use crypto.randomUUID()
import { revalidatePath } from "next/cache";

export async function getGoals() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return [];

    const data = await db.query.goals.findMany({
        where: eq(goals.userId, session.user.id),
        orderBy: [desc(goals.createdAt)],
    });

    // Map 'amount' string to number for frontend convenience
    return data.map(g => ({
        ...g,
        targetAmount: parseFloat(g.targetAmount),
        currentAmount: parseFloat(g.currentAmount)
    }));
}

export async function createGoal(data: {
    name: string;
    targetAmount: number;
    deadline?: Date;
    icon?: string;
    color?: string;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.insert(goals).values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            name: data.name,
            targetAmount: data.targetAmount.toString(),
            currentAmount: "0",
            deadline: data.deadline || null,
            icon: data.icon || "🏠",
            color: data.color || "blue",
        });

        revalidatePath("/goals");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Create goal error:", error);
        return { success: false, error: "Gagal membuat tujuan keuangan." };
    }
}

export async function updateGoal(data: {
    id: string;
    name: string;
    targetAmount: number;
    deadline?: Date;
    icon?: string;
    color?: string;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.update(goals)
            .set({
                name: data.name,
                targetAmount: data.targetAmount.toString(),
                deadline: data.deadline || null,
                icon: data.icon,
                color: data.color,
                updatedAt: new Date()
            })
            .where(and(eq(goals.id, data.id), eq(goals.userId, session.user.id)));

        revalidatePath("/goals");
        return { success: true };
    } catch (error) {
        console.error("Update goal error:", error);
        return { success: false, error: "Gagal mengupdate tujuan." };
    }
}

export async function updateGoalAmount(goalId: string, amount: number) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // Get current amount first
        const goal = await db.query.goals.findFirst({
            where: and(eq(goals.id, goalId), eq(goals.userId, session.user.id))
        });

        if (!goal) return { success: false, error: "Goal not found" };

        const newAmount = parseFloat(goal.currentAmount) + amount;

        await db.update(goals)
            .set({ currentAmount: String(newAmount), updatedAt: new Date() })
            .where(eq(goals.id, goalId));

        revalidatePath("/goals");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Add savings error:", error);
        return { success: false, error: "Gagal menambahkan tabungan." };
    }
}

export async function deleteGoal(goalId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.delete(goals).where(and(eq(goals.id, goalId), eq(goals.userId, session.user.id)));
        revalidatePath("/goals");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Delete goal error:", error);
        return { success: false, error: "Gagal menghapus tujuan." };
    }
}
