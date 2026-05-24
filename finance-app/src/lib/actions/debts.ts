"use server";

import { db } from "@/db";
import { debts, accounts, transactions, categories } from "@/db/schema/finance";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// --- EXISTING ACTIONS (For DebtForm) ---

export async function getDebts() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return [];

    const data = await db.query.debts.findMany({
        where: eq(debts.userId, session.user.id),
        orderBy: [desc(debts.currentBalance)],
    });

    return data.map(d => ({
        ...d,
        limitAmount: parseFloat(d.limitAmount),
        currentBalance: parseFloat(d.currentBalance),
        monthlyInstallment: parseFloat(d.monthlyInstallment || "0"),
    }));
}

export async function createDebt(formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const provider = formData.get("provider") as string;
    const limitAmount = formData.get("limitAmount") as string;
    const currentBalance = formData.get("currentBalance") as string;
    const monthlyInstallment = formData.get("monthlyInstallment") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const color = formData.get("color") as string || "red";

    if (!name || !limitAmount) throw new Error("Missing required fields");

    await db.insert(debts).values({
        id: generateId(),
        userId: session.user.id,
        name,
        provider,
        limitAmount,
        currentBalance,
        monthlyInstallment: monthlyInstallment || "0",
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        color,
    });

    revalidatePath("/debts");
    revalidatePath("/paylater");
    revalidatePath("/dashboard");
}

export async function updateDebtBalance(debtId: string, newBalance: number) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.update(debts)
        .set({ currentBalance: String(newBalance), updatedAt: new Date() })
        .where(and(eq(debts.id, debtId), eq(debts.userId, session.user.id)));

    revalidatePath("/debts");
    revalidatePath("/paylater");
}

export async function deleteDebt(debtId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.delete(debts).where(and(eq(debts.id, debtId), eq(debts.userId, session.user.id)));
    revalidatePath("/debts");
    revalidatePath("/paylater");
}

// --- NEW ACTIONS (For PaylaterPageClient - Object/JSON based) ---

export async function createDebtJson(data: any) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.insert(debts).values({
            id: generateId(),
            userId: session.user.id,
            name: data.name,
            provider: data.provider,
            limitAmount: String(data.limitAmount),
            currentBalance: String(data.currentBalance),
            monthlyInstallment: String(data.monthlyInstallment || 0),
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            color: data.color || "red",
        });

        revalidatePath("/debts");
        revalidatePath("/paylater");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Create Debt Error:", error);
        return { success: false, error: "Failed to create debt" };
    }
}

export async function updateDebt(data: any) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.update(debts)
            .set({
                name: data.name,
                provider: data.provider,
                limitAmount: String(data.limitAmount),
                currentBalance: String(data.currentBalance),
                monthlyInstallment: String(data.monthlyInstallment || 0),
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                color: data.color,
                updatedAt: new Date(),
            })
            .where(and(eq(debts.id, data.id), eq(debts.userId, session.user.id)));

        revalidatePath("/debts");
        revalidatePath("/paylater");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Update Debt Error:", error);
        return { success: false, error: "Failed to update debt" };
    }
}

export async function deleteDebtJson(id: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        await db.delete(debts).where(and(eq(debts.id, id), eq(debts.userId, session.user.id)));
        revalidatePath("/debts");
        revalidatePath("/paylater");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Delete Debt Error:", error);
        return { success: false, error: "Failed to delete debt" };
    }
}

export async function payDebtInstallment(data: {
    debtId: string;
    amount: number;
    accountId: string;
    date: Date;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        // 1. Get Debt Details
        const debt = await db.query.debts.findFirst({
            where: and(eq(debts.id, data.debtId), eq(debts.userId, session.user.id))
        });
        if (!debt) return { success: false, error: "Debt not found" };

        // 2. Get Account Details
        const account = await db.query.accounts.findFirst({
            where: and(eq(accounts.id, data.accountId), eq(accounts.userId, session.user.id))
        });
        if (!account) return { success: false, error: "Source account not found" };

        if (parseFloat(account.balance) < data.amount) {
            return { success: false, error: "Saldo akun tidak mencukupi" };
        }

        // 3. Find or Create 'Cicilan/Debt' Category
        let category = await db.query.categories.findFirst({
            where: and(
                eq(categories.type, 'expense'),
                eq(categories.name, 'Cicilan')
            )
        });

        if (!category) {
            // Check for 'Debt'
            category = await db.query.categories.findFirst({
                where: and(
                    eq(categories.type, 'expense'),
                    eq(categories.name, 'Debt')
                )
            });
        }

        let categoryId = category?.id;

        if (!categoryId) {
            // Create one if absolutely missing
            const newId = generateId();
            await db.insert(categories).values({
                id: newId,
                name: "Cicilan",
                type: "expense",
                icon: "CreditCard",
                color: "bg-orange-500"
            });
            categoryId = newId;
        }

        // 4. Create Transaction (Expense)
        await db.insert(transactions).values({
            id: generateId(),
            accountId: data.accountId,
            categoryId: categoryId as string,
            amount: String(data.amount),
            date: data.date,
            description: `Bayar Cicilan: ${debt.name}`,
            type: "expense",
            source: "manual"
        });

        // 5. Update Account Balance
        const newAccountBalance = parseFloat(account.balance) - data.amount;
        await db.update(accounts)
            .set({ balance: String(newAccountBalance), updatedAt: new Date() })
            .where(eq(accounts.id, data.accountId));

        // 6. Update Debt Balance (Reduce the Owed Amount)
        // Ensure we don't go below 0
        const currentDebtBalance = parseFloat(debt.currentBalance);
        const newDebtBalance = Math.max(0, currentDebtBalance - data.amount);

        await db.update(debts)
            .set({ currentBalance: String(newDebtBalance), updatedAt: new Date() })
            .where(eq(debts.id, data.debtId));

        revalidatePath("/debts");
        revalidatePath("/paylater");
        revalidatePath("/dashboard");
        revalidatePath("/transactions");

        return { success: true };

    } catch (error) {
        console.error("Pay Debt Error:", error);
        return { success: false, error: "Failed to process payment" };
    }
}
