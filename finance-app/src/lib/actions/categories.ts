"use server";

import { db } from "@/db";
import { categories, transactions, budgets } from "@/db/schema/finance";
import { eq, ne, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getCategories() {
    return await db.select().from(categories);
}


export async function createCategory(data: { name: string; type: "income" | "expense"; icon: string; color: string }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    try {
        await db.insert(categories).values({
            id: crypto.randomUUID(),
            name: data.name,
            type: data.type,
            icon: data.icon,
            color: data.color
        });
        revalidatePath("/budgets");
        revalidatePath("/transactions");
        return { success: true };
    } catch (e) {
        console.error("Create category failed", e);
        return { success: false, error: "Gagal membuat kategori" };
    }
}

export async function updateCategory(data: { id: string; name: string; icon: string; color: string }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    try {
        await db.update(categories)
            .set({
                name: data.name,
                icon: data.icon,
                color: data.color
            })
            .where(eq(categories.id, data.id));

        revalidatePath("/budgets");
        revalidatePath("/transactions");
        return { success: true };
    } catch (e) {
        console.error("Update category failed", e);
        return { success: false, error: "Gagal mengupdate kategori" };
    }
}

export async function deleteCategory(categoryId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    try {
        return await db.transaction(async (tx) => {
            // 1. Get info of category to be deleted
            const target = await tx.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
            if (target.length === 0) return { success: false, error: "Kategori tidak ditemukan" };

            // 1.5 Check if category is used in transactions
            // We need to know if we really need a fallback
            const usage = await tx.select({ id: transactions.id }).from(transactions).where(eq(transactions.categoryId, categoryId)).limit(1);
            const isUsed = usage.length > 0;

            if (isUsed) {
                const targetType = target[0].type;

                // 2. Find a fallback category
                const allCats = await tx.select().from(categories).where(
                    and(
                        eq(categories.type, targetType),
                        ne(categories.id, categoryId)
                    )
                );

                let fallbackId = "";

                if (allCats.length > 0) {
                    // Prefer 'Lainnya'
                    const preferred = allCats.find(c => c.name.toLowerCase().includes("lain") || c.name.toLowerCase().includes("misc") || c.name.toLowerCase().includes("umum"));
                    fallbackId = preferred ? preferred.id : allCats[0].id;
                } else {
                    // EMERGENCY FALLBACK: Create a new category if none exists
                    const newId = crypto.randomUUID();
                    await tx.insert(categories).values({
                        id: newId,
                        name: "Tanpa Kategori",
                        type: targetType,
                        icon: "📦",
                        color: "slate"
                    });
                    fallbackId = newId;
                }

                // 3. Move transactions to fallback
                await tx.update(transactions)
                    .set({ categoryId: fallbackId })
                    .where(eq(transactions.categoryId, categoryId));
            }

            // 4. Delete related budgets
            await tx.delete(budgets).where(eq(budgets.categoryId, categoryId));

            // 5. Delete the category
            await tx.delete(categories).where(eq(categories.id, categoryId));

            revalidatePath("/budgets");
            revalidatePath("/transactions");
            return { success: true, message: isUsed ? "Kategori dihapus, transaksi dipindahkan." : "Kategori berhasil dihapus." };
        });
    } catch (e) {
        console.error("Delete category failed:", e);
        // Cast error to handle potential string/object differences
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        return { success: false, error: `Gagal menghapus kategori: ${errorMsg}` };
    }
}
