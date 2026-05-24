"use server";

import { db } from "@/db";
import { subscriptions } from "@/db/schema/finance";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, and, asc } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getSubscriptions() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return [];

    const data = await db.query.subscriptions.findMany({
        where: eq(subscriptions.userId, session.user.id),
        orderBy: [asc(subscriptions.nextPaymentDate)],
    });

    return data;
}

export async function createSubscription(formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const cost = formData.get("cost") as string;
    const billingCycle = formData.get("billingCycle") as string;
    const nextPaymentStr = formData.get("nextPaymentDate") as string;
    const provider = formData.get("provider") as string;
    const category = formData.get("category") as string;

    if (!name || !cost || !nextPaymentStr) throw new Error("Missing required fields");

    await db.insert(subscriptions).values({
        id: generateId(),
        userId: session.user.id,
        name,
        cost,
        billingCycle,
        nextPaymentDate: new Date(nextPaymentStr),
        provider,
        category,
        status: "active",
        icon: provider?.toLowerCase().includes("netflix") ? "netflix" : "default" // Simplified icon logic
    });

    revalidatePath("/subscriptions");
    revalidatePath("/dashboard");
}

export async function updateSubscription(id: string, formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const cost = formData.get("cost") as string;
    const nextPaymentStr = formData.get("nextPaymentDate") as string;

    await db.update(subscriptions)
        .set({
            name,
            cost,
            nextPaymentDate: nextPaymentStr ? new Date(nextPaymentStr) : undefined,
            updatedAt: new Date()
        })
        .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, session.user.id)));

    revalidatePath("/subscriptions");
}

export async function deleteSubscription(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.delete(subscriptions).where(and(eq(subscriptions.id, id), eq(subscriptions.userId, session.user.id)));
    revalidatePath("/subscriptions");
}
