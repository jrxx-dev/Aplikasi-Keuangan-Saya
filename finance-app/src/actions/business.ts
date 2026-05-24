"use server"

import { db } from "@/db"
import { businessClients, businessAssets, businessIncomes, businessDebts, businessSettings, businessExpenses } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUser() {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user
}

export async function getBusinessData() {
    const user = await getUser()
    if (!user) return null

    const [clients, assets, incomes, debts, settings, expenses] = await Promise.all([
        db.query.businessClients.findMany({
            where: eq(businessClients.userId, user.id),
            orderBy: [desc(businessClients.createdAt)]
        }),
        db.query.businessAssets.findMany({
            where: eq(businessAssets.userId, user.id),
            orderBy: [desc(businessAssets.createdAt)]
        }),
        db.query.businessIncomes.findMany({
            where: eq(businessIncomes.userId, user.id),
            orderBy: [desc(businessIncomes.date)]
        }),
        db.query.businessDebts.findMany({
            where: eq(businessDebts.userId, user.id),
            orderBy: [desc(businessDebts.createdAt)]
        }),
        db.query.businessSettings.findFirst({
            where: eq(businessSettings.userId, user.id)
        }),
        db.query.businessExpenses.findMany({
            where: eq(businessExpenses.userId, user.id),
            orderBy: [desc(businessExpenses.date)]
        })
    ])

    return {
        clients,
        assets,
        incomes,
        debts,
        settings,
        expenses
    }
}

// ... existing functions ...

export async function saveBusinessExpense(data: any) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    await db.insert(businessExpenses).values({
        id: crypto.randomUUID(),
        userId: user.id,
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
        category: data.category || "operational",
        invoiceNo: data.invoiceNo
    })
    revalidatePath("/business")
}

export async function getBusinessExpenses() {
    const user = await getUser()
    if (!user) return []

    return await db.query.businessExpenses.findMany({
        where: eq(businessExpenses.userId, user.id),
        orderBy: [desc(businessExpenses.date)]
    })
}

export async function deleteBusinessExpense(id: string) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")
    await db.delete(businessExpenses).where(eq(businessExpenses.id, id))
    revalidatePath("/business")
}

// ---- Settings ----
export async function updateBusinessSettings(data: typeof businessSettings.$inferInsert) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    await db.insert(businessSettings).values({
        ...data,
        userId: user.id
    }).onConflictDoUpdate({
        target: businessSettings.userId,
        set: data
    })

    revalidatePath("/business")
}

// ---- Clients ----
export async function saveClient(data: typeof businessClients.$inferInsert) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    if (await db.query.businessClients.findFirst({ where: eq(businessClients.id, data.id || "") })) {
        await db.update(businessClients).set(data).where(eq(businessClients.id, data.id!))
    } else {
        await db.insert(businessClients).values({ ...data, userId: user.id })
    }
    revalidatePath("/business")
}

export async function deleteClient(id: string) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")
    await db.delete(businessClients).where(eq(businessClients.id, id))
    revalidatePath("/business")
}

// ---- Assets ----
export async function saveAsset(data: typeof businessAssets.$inferInsert) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    if (await db.query.businessAssets.findFirst({ where: eq(businessAssets.id, data.id || "") })) {
        await db.update(businessAssets).set(data).where(eq(businessAssets.id, data.id!))
    } else {
        await db.insert(businessAssets).values({ ...data, userId: user.id })
    }
    revalidatePath("/business")
}

export async function deleteAsset(id: string) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")
    await db.delete(businessAssets).where(eq(businessAssets.id, id))
    revalidatePath("/business")
}

// ---- Incomes ----
export async function saveIncome(data: typeof businessIncomes.$inferInsert) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    if (await db.query.businessIncomes.findFirst({ where: eq(businessIncomes.id, data.id || "") })) {
        await db.update(businessIncomes).set(data).where(eq(businessIncomes.id, data.id!))
    } else {
        await db.insert(businessIncomes).values({ ...data, userId: user.id })
    }
    revalidatePath("/business")
}

export async function deleteIncome(id: string) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")
    await db.delete(businessIncomes).where(eq(businessIncomes.id, id))
    revalidatePath("/business")
}

// ---- Debts ----
export async function saveDebt(data: typeof businessDebts.$inferInsert) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    if (await db.query.businessDebts.findFirst({ where: eq(businessDebts.id, data.id || "") })) {
        await db.update(businessDebts).set({
            ...data,
            updatedAt: new Date()
        }).where(eq(businessDebts.id, data.id!))
    } else {
        await db.insert(businessDebts).values({ 
            ...data, 
            id: data.id || crypto.randomUUID(),
            userId: user.id 
        })
    }
    revalidatePath("/business")
}

export async function deleteDebt(id: string) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")
    await db.delete(businessDebts).where(eq(businessDebts.id, id))
    revalidatePath("/business")
}

export async function getAccumulatedRevenue() {
    const user = await getUser()
    if (!user) return 0

    const incomes = await db.query.businessIncomes.findMany({
        where: eq(businessIncomes.userId, user.id)
    })

    return incomes.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)
}

// ---- Accumulation Logic ----
import { transactions, accounts } from "@/db/schema"

export async function processMonthlyAccumulation(data: {
    date: Date; // The month we are closing
    netProfit: number;
    personalAllocation: number; // Gaji Owner
    businessRetained: number; // Sisa di Bisnis
    notes?: string;
    createPersonalTx: boolean;
    personalAccountName?: string;
}) {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")

    // 1. Save Business Retained Earnings (if any)
    if (data.businessRetained > 0) {
        await db.insert(businessIncomes).values({
            id: crypto.randomUUID(),
            userId: user.id,
            amount: data.businessRetained.toString(),
            description: `Sisa Laba Bersih (${data.date.toLocaleString('default', { month: 'long', year: 'numeric' })})`,
            date: new Date(data.date), // Use selected date
            type: "net",
            isTransferredToPersonal: false,
        })
    }

    // 2. Save Personal Allocation (if any)
    if (data.personalAllocation > 0) {
        await db.insert(businessIncomes).values({
            id: crypto.randomUUID(),
            userId: user.id,
            amount: data.personalAllocation.toString(),
            description: `Gaji Owner (${data.date.toLocaleString('default', { month: 'long', year: 'numeric' })})`,
            date: new Date(data.date),
            type: "net",
            isTransferredToPersonal: true,
        })

        // 3. Create Personal Transaction (Optional)
        if (data.createPersonalTx) {
            // Find account
            let accountId: string | null = null;
            if (data.personalAccountName) {
                const acc = await db.query.accounts.findFirst({
                    where: (accounts, { eq, and, ilike }) => and(
                        eq(accounts.userId, user.id),
                        ilike(accounts.name, `%${data.personalAccountName}%`)
                    )
                });
                if (acc) accountId = acc.id;
            }

            // Fallback to first account
            if (!accountId) {
                const acc = await db.query.accounts.findFirst({
                    where: (accounts, { eq }) => eq(accounts.userId, user.id)
                });
                if (acc) accountId = acc.id;
            }

            if (accountId) {
                // Insert Transaction
                await db.insert(transactions).values({
                    id: crypto.randomUUID(),
                    accountId: accountId,
                    amount: data.personalAllocation.toString(),
                    type: "income",
                    categoryId: "business-income", // Assumption: exists or handled
                    description: `Pencairan Profit Bisnis ${data.date.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                    date: new Date(), // Transaction happens NOW
                });

                // Update Account Balance
                // We use raw SQL for safety? Or just fetch-update. 
                // Let's use simple sql update pattern we saw in database.ts? No, handled in actions/finance.ts usually. 
                // But here we do direct DB.

                // For safety vs sql injection, we use parameters or ORM.
                const acc = await db.query.accounts.findFirst({ where: eq(accounts.id, accountId) });
                if (acc) {
                    const newBalance = parseFloat(acc.balance) + data.personalAllocation;
                    await db.update(accounts)
                        .set({ balance: newBalance.toString() })
                        .where(eq(accounts.id, accountId));
                }
            }
        }
    }

    revalidatePath("/business")
    return { success: true }
}
