"use server";

import { db } from "@/db";
import { accounts, transactions, categories, budgets, goals } from "@/db/schema/finance";
import { auth } from "@/lib/auth";
import { eq, sum, desc, and, gte, lte, sql, ne, ilike, inArray, SQL } from "drizzle-orm";
import { cache } from "react";
import { createLog } from "./logs";

// ... existing code ...

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ... (imports)

// Helper to deduplicate account fetching
const getUserAccounts = cache(async (userId: string) => {
    return await db
        .select({ id: accounts.id, name: accounts.name, balance: accounts.balance })
        .from(accounts)
        .where(eq(accounts.userId, userId));
});

function getUsableBalance(acc: { name: string, balance: string }): number {
    const bal = parseFloat(acc.balance || "0");
    if (acc.name && acc.name.toLowerCase().includes("bri")) {
        return Math.max(0, bal - 50000);
    }
    return bal;
}

export async function getFinancialSummary() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return {
            balance: 0,
            income: 0,
            expense: 0,
            incomeTrend: [],
            expenseTrend: []
        };
    }

    const userAccounts = await getUserAccounts(session.user.id);
    const balanceResult = { total: userAccounts.reduce((sum, acc) => sum + getUsableBalance(acc), 0) };

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);



    const accountIds = userAccounts.map(a => a.id);

    if (accountIds.length === 0) {
        return { balance: 0, income: 0, expense: 0, incomeTrend: [], expenseTrend: [] };
    }

    // --- AGGREGATE TOTALS ---
    const [incomeResult] = await db
        .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(Number) })
        .from(transactions)
        .where(
            and(
                inArray(transactions.accountId, accountIds),
                eq(transactions.type, "income"),
                gte(transactions.date, firstDayOfMonth),
                lte(transactions.date, lastDayOfMonth)
            )
        );

    const [expenseResult] = await db
        .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(Number) })
        .from(transactions)
        .where(
            and(
                inArray(transactions.accountId, accountIds),
                eq(transactions.type, "expense"),
                gte(transactions.date, firstDayOfMonth),
                lte(transactions.date, lastDayOfMonth)
            )
        );

    // --- AGGREGATE TRENDS (Daily for current month) ---
    // Fetch all transactions for this month to aggregate in JS (easier than complex SQL grouping for now)
    const monthTransactions = await db
        .select({
            amount: transactions.amount,
            date: transactions.date,
            type: transactions.type
        })
        .from(transactions)
        .where(
            and(
                inArray(transactions.accountId, accountIds),
                gte(transactions.date, firstDayOfMonth),
                lte(transactions.date, lastDayOfMonth)
            )
        )
        .orderBy(transactions.date);

    // Helper to group by date
    const groupByDay = (type: "income" | "expense") => {
        const dailyMap = new Map<number, number>();
        // Init all days in month with 0
        const daysInMonth = lastDayOfMonth.getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            dailyMap.set(i, 0);
        }

        monthTransactions.forEach(t => {
            if (t.type === type) {
                const day = new Date(t.date).getDate();
                const amount = Number(t.amount);
                dailyMap.set(day, (dailyMap.get(day) || 0) + amount);
            }
        });

        return Array.from(dailyMap.entries()).map(([day, amount]) => ({
            params: day.toString(), // or date string
            value: amount
        }));
    };

    // --- AVERAGES (Last 3 Months) ---
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    const monthlyStats = await db
        .select({
            month: sql<string>`to_char(${transactions.date}, 'YYYY-MM')`,
            type: transactions.type,
            total: sql<number>`SUM(${transactions.amount})`.mapWith(Number)
        })
        .from(transactions)
        .where(
            and(
                inArray(transactions.accountId, accountIds),
                gte(transactions.date, threeMonthsAgo),
                lte(transactions.date, lastDayOfMonth) // Up to now
            )
        )
        .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM')`, transactions.type);

    // Daily Stats for Graph (Last 3 Months)
    const dailyStats = await db
        .select({
            date: sql<string>`to_char(${transactions.date}, 'YYYY-MM-DD')`, // Ensure consistent date format
            type: transactions.type,
            total: sql<number>`SUM(${transactions.amount})`.mapWith(Number)
        })
        .from(transactions)
        .where(
            and(
                inArray(transactions.accountId, accountIds),
                gte(transactions.date, threeMonthsAgo),
                lte(transactions.date, lastDayOfMonth)
            )
        )
        .groupBy(sql`to_char(${transactions.date}, 'YYYY-MM-DD')`, transactions.type)
        .orderBy(sql`to_char(${transactions.date}, 'YYYY-MM-DD')`);

    // Calculate Averages and History
    let totalIncome3M = 0;
    let totalExpense3M = 0;
    const incomeMonths = new Set<string>();
    const expenseMonths = new Set<string>();

    // Map to aggregate by month for chart
    const historyMap = new Map<string, { month: string, income: number, expense: number }>();

    monthlyStats.forEach(stat => {
        const monthKey = stat.month;
        if (!historyMap.has(monthKey)) {
            historyMap.set(monthKey, { month: monthKey, income: 0, expense: 0 });
        }
        const entry = historyMap.get(monthKey)!;

        // Add to totals for average calc
        if (stat.type === 'income') {
            totalIncome3M += stat.total;
            incomeMonths.add(stat.month);
            entry.income += stat.total;
        } else if (stat.type === 'expense') {
            totalExpense3M += stat.total;
            expenseMonths.add(stat.month);
            entry.expense += stat.total;
        }
    });

    const avgIncome = incomeMonths.size > 0 ? totalIncome3M / incomeMonths.size : 0;
    const avgExpense = expenseMonths.size > 0 ? totalExpense3M / expenseMonths.size : 0;

    // Sort history by month
    const history = Array.from(historyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    return {
        balance: Number(balanceResult?.total || 0),
        income: Number(incomeResult?.total || 0),
        expense: Number(expenseResult?.total || 0),
        incomeTrend: groupByDay("income"),
        expenseTrend: groupByDay("expense"),
        averages: {
            income: avgIncome,
            expense: avgExpense,
            history,
            dailyHistory: dailyStats
        }
    };
}

export async function getCategoryBreakdown() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user) return [];

    const userAccounts = await getUserAccounts(session.user.id);
    const accountIds = userAccounts.map(a => a.id);
    if (accountIds.length === 0) return [];

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const breakdown = await db
        .select({
            name: categories.name,
            value: sum(transactions.amount),
            color: categories.color,
            icon: categories.icon,
            type: transactions.type
        })
        .from(transactions)
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
            and(
                sql`${transactions.accountId} IN ${accountIds}`,
                ne(transactions.type, "transfer"), // Exclude transfers
                gte(transactions.date, firstDayOfMonth),
                lte(transactions.date, lastDayOfMonth)
            )
        )
        .groupBy(categories.name, categories.color, categories.icon, transactions.type)
        .orderBy(desc(sum(transactions.amount)));

    return breakdown.map(item => ({
        ...item,
        value: Number(item.value)
    }));
}

export async function getLargestTransactions() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user) return [];

    const userAccounts = await getUserAccounts(session.user.id);
    const accountIds = userAccounts.map(a => a.id);
    if (accountIds.length === 0) return [];

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const largest = await db
        .select({
            id: transactions.id,
            amount: transactions.amount,
            description: transactions.description,
            date: transactions.date,
            type: transactions.type,
            categoryName: categories.name,
            categoryIcon: categories.icon
        })
        .from(transactions)
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
            and(
                inArray(transactions.accountId, accountIds),
                gte(transactions.date, firstDayOfMonth),
                lte(transactions.date, lastDayOfMonth)
            )
        )
        .orderBy(desc(transactions.amount))
        .limit(10); // Fetched slightly more to allow filtering by type on client side if needed

    return largest;
}

export async function getRecentTransactions() {
    // ... existing implementation remains mostly same, maybe ensure updated joins if needed
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return [];

    const userAccounts = await getUserAccounts(session.user.id);
    const accountIds = userAccounts.map(a => a.id);
    if (accountIds.length === 0) return [];

    return await db
        .select({
            id: transactions.id,
            amount: transactions.amount,
            description: transactions.description,
            date: transactions.date,
            type: transactions.type,
            category: categories.name,
            categoryIcon: categories.icon,
            accountName: accounts.name,
            source: transactions.source,
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(inArray(transactions.accountId, accountIds))
        .orderBy(desc(transactions.date), desc(transactions.createdAt))
        .limit(10);
}

export async function getAllTransactions() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return [];

    const userAccounts = await getUserAccounts(session.user.id);
    const accountIds = userAccounts.map(a => a.id);
    if (accountIds.length === 0) return [];

    return await db
        .select({
            id: transactions.id,
            amount: transactions.amount,
            description: transactions.description,
            date: transactions.date,
            type: transactions.type,
            category: categories.name,
            categoryIcon: categories.icon,
            accountName: accounts.name,
            source: transactions.source,
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(inArray(transactions.accountId, accountIds))
        .orderBy(desc(transactions.date), desc(transactions.createdAt));
}


export async function getFinancialAnalytics() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;

    // 1. Get Accounts & Total Balance
    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, session.user.id));
    const accountIds = userAccounts.map(a => a.id);

    // Default Data Schema
    const defaultData = {
        name: session.user.name || "Pengguna",
        monthlyIncome: 0,
        monthlyExpense: 0,
        monthlyDebtPayment: 0,
        totalCash: 0,
        totalDebt: 0,
        lastMonthExpense: 0,
    };

    if (accountIds.length === 0) return defaultData;

    const totalCash = userAccounts.reduce((sum, acc) => sum + getUsableBalance(acc), 0);

    // 2. Fetch Transactions for Analysis
    // We fetch all transactions for the user to be flexible with time ranges in JS (easier than complex SQL grouping for this scale)
    // For production with massive data, move aggregations to SQL.
    const txs = await db
        .select({
            id: transactions.id,
            description: transactions.description,
            amount: transactions.amount,
            date: transactions.date,
            type: transactions.type,
            category: categories.name
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(sql`${transactions.accountId} IN ${accountIds}`);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Logic for "This Month"
    const thisMonthTxs = txs.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Logic for "Last Month"
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const lastMonthTxs = txs.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    // Aggregations
    const monthlyIncome = thisMonthTxs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyExpense = thisMonthTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const lastMonthExpense = lastMonthTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Heuristic for Debt: Look for category keywords
    // 'Cicilan', 'Hutang', 'Pinjaman', 'Kredit'
    const debtKeywords = ['cicilan', 'hutang', 'pinjaman', 'kredit', 'paylater'];
    const monthlyDebtPayment = thisMonthTxs
        .filter(t => t.type === 'expense' && t.category && debtKeywords.some(k => t.category!.toLowerCase().includes(k)))
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // 3. Last 30 Days History for Charts
    const dailyMap = new Map<string, { date: string, income: number, expense: number }>();
    const historyDays = 30;

    // Initialize last 30 days with 0
    for (let i = historyDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        dailyMap.set(dateStr, { date: dateStr, income: 0, expense: 0 });
    }

    // Fill with actual data
    txs.forEach(t => {
        // Adjust date to local string simply by taking split (approximation is fine for daily chart)
        // Better: use exact Date object matching if timezone is critical, but ISO split is usually okay for visual trend
        const tDate = new Date(t.date);
        const dateStr = tDate.toISOString().split('T')[0];

        if (dailyMap.has(dateStr)) {
            const entry = dailyMap.get(dateStr)!;
            const amt = parseFloat(t.amount);
            if (t.type === 'income') entry.income += amt;
            else if (t.type === 'expense') entry.expense += amt;
        }
    });

    const history = Array.from(dailyMap.values());

    // 4. Advanced Insights (Anomaly & Category)
    // Average Daily Expense (Total 30 days / 30)
    const totalExpense30Days = history.reduce((sum, day) => sum + day.expense, 0);
    const avgDailyExpense = totalExpense30Days / 30;
    const anomalyThreshold = Math.max(50000, avgDailyExpense * 2.5); // Min threshold Rp 50k

    const anomalies = txs
        .filter(t => t.type === 'expense' && parseFloat(t.amount) > anomalyThreshold)
        .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
        .slice(0, 5)
        .map(t => ({
            id: t.id,
            description: t.description || "Pengeluaran Besar",
            amount: parseFloat(t.amount),
            date: t.date,
            category: t.category || "Umum"
        }));

    // Top Expense Categories (This Month)
    const catMap = new Map<string, number>();
    thisMonthTxs.filter(t => t.type === 'expense').forEach(t => {
        const cat = t.category || "Lainnya";
        catMap.set(cat, (catMap.get(cat) || 0) + parseFloat(t.amount));
    });

    const topExpenseCategories = Array.from(catMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, amount]) => ({ name, amount }));

    return {
        ...defaultData,
        monthlyIncome,
        monthlyExpense,
        monthlyDebtPayment,
        totalCash,
        lastMonthExpense,
        history,
        topExpenseCategories,
        anomalies,
    };
}

export async function getAccounts() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        console.error("Debug: No session found in getAccounts");
        throw new Error("Debug: No session found in getAccounts");
    }

    const userAccounts = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, session.user.id));

    if (userAccounts.length === 0) {
        try {
            const newId = crypto.randomUUID();
            await db.insert(accounts).values({
                id: newId,
                userId: session.user.id,
                name: "Tunai",
                type: "cash",
                balance: "0",
            });
            return [{
                id: newId,
                userId: session.user.id,
                name: "Tunai",
                type: "cash",
                balance: "0",
                currency: "IDR",
                createdAt: new Date(),
                updatedAt: new Date()
            }];
        } catch (e) {
            console.error("Failed to create default account:", e);
            throw e;
        }
    }

    return userAccounts;
}

export async function createAccount(data: {
    name: string;
    type: "bank" | "cash" | "wallet";
    balance: string;
    theme?: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.insert(accounts).values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            name: data.name,
            type: data.type,
            balance: data.balance,
            currency: "IDR",
            theme: data.theme || "blue",
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to create account:", error);
        return { success: false, error: "Failed to create account" };
    }
}

export async function deleteAccount(accountId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        // Delete related transactions first to avoid FK constraints if cascade isn't set
        await db.delete(transactions).where(eq(transactions.accountId, accountId));

        await db.delete(accounts)
            .where(
                and(
                    eq(accounts.id, accountId),
                    eq(accounts.userId, session.user.id)
                )
            );

        revalidatePath("/dashboard");
        revalidatePath("/accounts");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete account:", error);
        return { success: false, error: "Failed to delete account" };
    }
}

export async function updateAccount(
    accountId: string,
    data: { name: string; type: "bank" | "cash" | "wallet"; balance: string; theme?: string }
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.update(accounts)
            .set({
                name: data.name,
                type: data.type,
                balance: data.balance,
                theme: data.theme,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(accounts.id, accountId),
                    eq(accounts.userId, session.user.id)
                )
            );

        revalidatePath("/dashboard");
        revalidatePath("/accounts");
        return { success: true };
    } catch (error) {
        console.error("Failed to update account:", error);
        return { success: false, error: "Failed to update account" };
    }
}

export async function getCategories() {
    return await db.select().from(categories);
}

const DEFAULT_CATEGORIES = {
    expense: {
        food: { name: "Makanan & Minuman", icon: "🍔" },
        transport: { name: "Transportasi", icon: "🚌" },
        shopping: { name: "Belanja", icon: "🛍️" },
        bills: { name: "Tagihan & Utilitas", icon: "💡" },
        entertainment: { name: "Hiburan", icon: "🎬" },
        health: { name: "Kesehatan", icon: "🏥" },
        misc: { name: "Lainnya", icon: "📦" },
    },
    income: {
        salary: { name: "Gaji", icon: "💰" },
        bonus: { name: "Bonus", icon: "🎁" },
        investment: { name: "Investasi", icon: "📈" },
        freelance: { name: "Freelance", icon: "💻" },
        gift: { name: "Hadiah", icon: "🎀" },
    },
    transfer: {
        bank_transfer: { name: "Transfer Bank", icon: "🏦" },
        ewallet: { name: "Topup E-Wallet", icon: "📱" },
    }
};

export async function createTransaction(data: {
    amount: string;
    description: string;
    accountId: string;
    categoryId: string;
    type: "income" | "expense" | "transfer";
    date: Date;
    source?: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.transaction(async (tx) => {
            // 1. Ensure Category Exists (Auto-seed)
            // Check if category exists in DB
            const existingCategory = await tx.select().from(categories).where(eq(categories.id, data.categoryId)).limit(1);

            if (existingCategory.length === 0) {
                // Try to find it in defaults
                let defaultCat: { name: string, icon: string } | undefined;
                let catType = data.type;

                // Search in default map
                if (data.type === 'income' && data.categoryId in DEFAULT_CATEGORIES.income) {
                    defaultCat = DEFAULT_CATEGORIES.income[data.categoryId as keyof typeof DEFAULT_CATEGORIES.income];
                } else if (data.type === 'expense' && data.categoryId in DEFAULT_CATEGORIES.expense) {
                    defaultCat = DEFAULT_CATEGORIES.expense[data.categoryId as keyof typeof DEFAULT_CATEGORIES.expense];
                } else if (data.type === 'transfer' && data.categoryId in DEFAULT_CATEGORIES.transfer) {
                    defaultCat = DEFAULT_CATEGORIES.transfer[data.categoryId as keyof typeof DEFAULT_CATEGORIES.transfer];
                    // Transfers are technically expenses/income but let's categorize them as expense type in DB for simplicity or specific transfer type if schema supports
                    // Schema says type is text. Let's start with 'expense' flow for transfer logic or keep 'transfer' if UI handles it.
                }

                if (defaultCat) {
                    await tx.insert(categories).values({
                        id: data.categoryId,
                        name: defaultCat.name,
                        type: data.type === 'transfer' ? 'expense' : data.type,
                        icon: defaultCat.icon,
                        color: "blue"
                    });
                } else {
                    // Fallback check: If not in default map, maybe it's a custom UUID? 
                    // But if length is 0, it means it's not in DB.
                    // If we are here, we are trying to insert with an ID that doesn't exist and we don't know its details.
                    // This might fail FK. But let's assume frontend sends valid default keys.
                    // We could create a generic one if desperate.
                    console.warn(`Category ${data.categoryId} not found in DB or defaults. Transaction might fail.`);
                }
            }

            // 2. Create Transaction
            await tx
                .insert(transactions)
                .values({
                    id: Math.random().toString(36).substring(2, 11),
                    accountId: data.accountId,
                    categoryId: data.categoryId,
                    amount: data.amount,
                    description: data.description,
                    date: data.date,
                    type: data.type,
                    source: data.source || "manual",
                });

            // 3. Update Account Balance
            const account = await tx.select().from(accounts).where(eq(accounts.id, data.accountId)).limit(1);
            if (!account || account.length === 0) throw new Error("Account not found");

            const currentBalance = Number(account[0].balance);
            const amount = Number(data.amount);

            let newBalance = currentBalance;
            if (data.type === 'income') {
                newBalance += amount;
            } else {
                newBalance -= amount;
            }

            await tx.update(accounts)
                .set({ balance: String(newBalance) })
                .where(eq(accounts.id, data.accountId));
        });

        revalidatePath("/dashboard");
        revalidatePath("/transactions");
        return { success: true };
    } catch (error) {
        console.error("Failed to create transaction:", error);
        return { success: false, error: "Failed to create transaction" };
    }
}

export async function getBudgetOverview() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return [];
    }

    const userId = session.user.id;
    let allCategories = await db.select().from(categories);

    // AUTO-SEED: Fix for new users with no categories
    if (allCategories.length === 0) {
        const toInsert: any[] = [];
        if (DEFAULT_CATEGORIES.expense) {
            Object.entries(DEFAULT_CATEGORIES.expense).forEach(([key, val]) => toInsert.push({ id: key, name: val.name, type: 'expense', icon: val.icon, color: 'blue' }));
        }
        if (DEFAULT_CATEGORIES.income) {
            Object.entries(DEFAULT_CATEGORIES.income).forEach(([key, val]) => toInsert.push({ id: key, name: val.name, type: 'income', icon: val.icon, color: 'emerald' }));
        }
        if (toInsert.length > 0) {
            try {
                await db.insert(categories).values(toInsert);
                allCategories = await db.select().from(categories);
            } catch (e) { console.error("Auto-seed error", e); }
        }
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Expenses this month
    const monthlyExpenses = await db
        .select({
            categoryId: transactions.categoryId,
            amount: transactions.amount
        })
        .from(transactions)
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
            and(
                eq(accounts.userId, userId),
                eq(transactions.type, 'expense'),
                gte(transactions.date, startOfMonth)
            )
        );

    const expenseMap = new Map<string, number>();
    monthlyExpenses.forEach(t => {
        if (t.categoryId) {
            expenseMap.set(t.categoryId, (expenseMap.get(t.categoryId) || 0) + parseFloat(t.amount));
        }
    });

    // Fetch User Budgets
    const userBudgets = await db
        .select()
        .from(budgets)
        .where(eq(budgets.userId, userId));

    const budgetMap = new Map<string, number>();
    userBudgets.forEach(b => {
        if (b.categoryId) {
            budgetMap.set(b.categoryId, parseFloat(b.amount));
        }
    });

    const budgetData = allCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || "📦",
        color: cat.color || "slate",
        type: cat.type,
        spent: expenseMap.get(cat.id) || 0,
        // Budget Limit from DB
        limit: budgetMap.get(cat.id) || 0
    }));

    // Filter: Show only 'expense' type categories OR categories with spending
    return budgetData
        .filter(c => c.type === 'expense' || c.spent > 0)
        .sort((a, b) => b.spent - a.spent);
}

export async function getBudgetSummary() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return {
            totalBudget: 0,
            totalSpent: 0,
            percentage: 0,
            remaining: 0,
            status: "Aman"
        };
    }

    const userId = session.user.id;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Get all budgets
    const userBudgets = await db
        .select()
        .from(budgets)
        .where(eq(budgets.userId, userId));

    if (userBudgets.length === 0) {
        return {
            totalBudget: 0,
            totalSpent: 0,
            percentage: 0,
            remaining: 0,
            status: "Belum Ada Anggaran"
        };
    }

    const categoryIds = userBudgets.map(b => b.categoryId).filter((id): id is string => id !== null);
    const totalBudget = userBudgets.reduce((acc, b) => acc + parseFloat(b.amount), 0);

    if (categoryIds.length === 0) {
        return {
            totalBudget,
            totalSpent: 0,
            percentage: 0,
            remaining: totalBudget,
            status: "Aman"
        };
    }

    // 2. Get expenses for these categories in current month
    const expenses = await db
        .select({
            amount: transactions.amount
        })
        .from(transactions)
        .where(
            and(
                eq(transactions.type, 'expense'),
                inArray(transactions.categoryId, categoryIds),
                gte(transactions.date, firstDayOfMonth),
                lte(transactions.date, lastDayOfMonth)
            )
        );

    const totalSpent = expenses.reduce((acc, t) => acc + parseFloat(t.amount), 0);

    // 3. Calculate Stats
    const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const remaining = totalBudget - totalSpent;

    let status = "Aman";
    if (percentage >= 100) status = "Over Budget!";
    else if (percentage >= 80) status = "Kritis";
    else if (percentage >= 60) status = "Waspada";

    return {
        totalBudget,
        totalSpent,
        percentage,
        remaining,
        status
    };
}

export async function updateCategoryBudgetLimit(categoryId: string, amount: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const userId = session.user.id;

        // Check if budget exists
        const existingBudget = await db
            .select()
            .from(budgets)
            .where(
                and(
                    eq(budgets.userId, userId),
                    eq(budgets.categoryId, categoryId)
                )
            )
            .limit(1);

        if (existingBudget.length > 0) {
            // Update
            await db
                .update(budgets)
                .set({
                    amount: amount.toString(),
                    updatedAt: new Date()
                })
                .where(eq(budgets.id, existingBudget[0].id));
        } else {
            // Insert
            await db.insert(budgets).values({
                id: crypto.randomUUID(),
                userId: userId,
                categoryId: categoryId,
                amount: amount.toString(),
                period: "monthly",
                color: "blue"
            });
        }

        revalidatePath("/budgets");
        return { success: true };
    } catch (error) {
        console.error("Failed to update budget limit:", error);
        return { success: false, error: "Failed to update budget limit" };
    }
}

export async function handleAIAction(payload: {
    action: "create" | "delete" | "update" | "update_balance" | "delete_account" | "update_account";
    data?: any;
    targetIds?: string[];
    source?: string;
}) {
    console.log('🔧 [SERVER] handleAIAction called with:', JSON.stringify(payload, null, 2));

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        console.error('❌ [SERVER] Unauthorized - no session');
        return { success: false, message: "Unauthorized" };
    }

    console.log('✅ [SERVER] Session valid, user:', session.user.email);

    // 0. Resolve Criteria to Target IDs if not provided
    if ((!payload.targetIds || payload.targetIds.length === 0) && (payload as any).criteria) {
        const criteria = (payload as any).criteria;

        const conditions: SQL[] = [eq(accounts.userId, session.user.id)];

        if (criteria.description) {
            conditions.push(ilike(transactions.description, `%${criteria.description}%`));
        }
        if (criteria.date) {
            const startOfDay = new Date(criteria.date);
            if (!isNaN(startOfDay.getTime())) {
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(criteria.date);
                endOfDay.setHours(23, 59, 59, 999);
                conditions.push(and(gte(transactions.date, startOfDay), lte(transactions.date, endOfDay)) as SQL<unknown>);
            } else {
                console.warn("Skipping invalid date criteria:", criteria.date);
            }
        }
        if (criteria.amount) {
            conditions.push(eq(transactions.amount, criteria.amount.toString()));
        }

        // Apply search
        // Apply search
        const matchedTxs = await db
            .select({ id: transactions.id })
            .from(transactions)
            .leftJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(and(...conditions) as SQL<unknown>)
            .orderBy(desc(transactions.createdAt));
        // Removed limit(1) to allow bulk actions as requested by user

        if (matchedTxs.length > 0) {
            payload.targetIds = matchedTxs.map(t => t.id);
        } else {
            return { success: false, message: `Tidak ditemukan transaksi dengan kriteria: ${criteria.description || 'N/A'}` };
        }
    }

    // 1. HANDLE CREATE
    if (payload.action === "create" && payload.data) {
        const result = await quickAddTransaction({
            ...payload.data,
            accountName: (payload.data as any).account, // Map "account" from JSON to "accountName"
            source: payload.source || "ai"
        } as any);
        return result;
    }

    // 2. Validate targetIds for bulk actions
    const targetIds = payload.targetIds;
    if (!targetIds || targetIds.length === 0) {
        return { success: false, message: "Tidak ada ID transaksi yang ditargetkan." };
    }

    // 3. HANDLE DELETE (Bulk)
    if (payload.action === "delete") {
        // Fetch transactions to restore balance
        const txs = await db.select().from(transactions).where(inArray(transactions.id, targetIds));

        for (const tx of txs) {
            const amount = parseFloat(tx.amount);
            if (tx.type === 'expense') {
                await db.update(accounts)
                    .set({ balance: sql`${accounts.balance} + ${amount}` })
                    .where(eq(accounts.id, tx.accountId));
            } else {
                await db.update(accounts)
                    .set({ balance: sql`${accounts.balance} - ${amount}` })
                    .where(eq(accounts.id, tx.accountId));
            }
        }

        await db.delete(transactions).where(inArray(transactions.id, targetIds));
        revalidatePath("/dashboard");
        revalidatePath("/transactions");
        return { success: true, message: `${targetIds.length} transaksi berhasil dihapus dan saldo dikembalikan.` };
    }

    // 4. HANDLE UPDATE (Bulk)
    if (payload.action === "update" && payload.data) {
        // Handle Transactions Update
        if (targetIds && targetIds.length > 0) {
            const updateData: any = {};
            if (payload.data.amount) updateData.amount = payload.data.amount.toString();
            if (payload.data.description) updateData.description = payload.data.description;
            if (payload.data.type) updateData.type = payload.data.type;
            if (payload.data.date) updateData.date = new Date(payload.data.date);

            // Fetch originals to adjust balance
            const originalTxs = await db.select().from(transactions).where(inArray(transactions.id, targetIds));

            for (const tx of originalTxs) {
                // Only adjust balance if amount or type changed and we have valid account
                if ((payload.data.amount || payload.data.type) && tx.accountId) {
                    const oldAmount = parseFloat(tx.amount);
                    const newAmount = payload.data.amount ? parseFloat(payload.data.amount) : oldAmount;
                    const oldType = tx.type;
                    const newType = payload.data.type || oldType;

                    // Revert old effect
                    const revertVal = oldType === 'income' ? -oldAmount : oldAmount;
                    // Apply new effect
                    const applyVal = newType === 'income' ? newAmount : -newAmount;

                    const diff = revertVal + applyVal;

                    if (diff !== 0) {
                        await db.update(accounts)
                            .set({ balance: sql`${accounts.balance} + ${diff}` })
                            .where(eq(accounts.id, tx.accountId));
                    }
                }
            }

            await db.update(transactions)
                .set(updateData)
                .where(inArray(transactions.id, targetIds));

            revalidatePath("/dashboard");
            return { success: true, message: `${targetIds.length} transaksi berhasil diubah.` };
        }
    }

    // 5. HANDLE DIRECT BALANCE UPDATE (Penyesuaian Saldo)
    if (payload.action === "update_balance" && payload.data) {
        console.log('💰 [SERVER] Processing update_balance');
        const accountRef = payload.data.id || payload.data.account || payload.data.accountName;
        const balance = payload.data.balance;

        if (balance === undefined || balance === null) {
            return { success: false, message: "Saldo baru tidak valid." };
        }

        let targetAccount = [];
        if (payload.data.id) {
            targetAccount = await db.select().from(accounts).where(and(eq(accounts.id, payload.data.id), eq(accounts.userId, session.user.id))).limit(1);
        } else if (accountRef) {
            targetAccount = await db.select().from(accounts).where(and(eq(accounts.userId, session.user.id), ilike(accounts.name, `%${accountRef}%`))).limit(1);
        } else {
            targetAccount = await db.select().from(accounts).where(eq(accounts.userId, session.user.id)).limit(1);
        }

        if (targetAccount.length > 0) {
            await db.update(accounts)
                .set({ balance: balance.toString(), updatedAt: new Date() })
                .where(eq(accounts.id, targetAccount[0].id));

            await createLog({
                userId: session.user.id,
                level: "success",
                action: "update_balance",
                message: `Saldo akun "${targetAccount[0].name}" berhasil diubah`,
                metadata: { accountId: targetAccount[0].id, newBalance: balance.toString() }
            });

            revalidatePath("/dashboard");
            return { success: true, message: `Saldo akun ${targetAccount[0].name} berhasil diubah menjadi ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(balance)}` };
        }

        return { success: false, message: `Akun "${accountRef || 'Default'}" tidak ditemukan.` };
    }

    // 6. HANDLE DELETE ACCOUNT
    if (payload.action === "delete_account" && payload.data) {
        const accountRef = payload.data.id || payload.data.account || payload.data.accountName;
        if (!accountRef) return { success: false, message: "Informasi akun tidak lengkap." };

        let targetAccount = [];
        if (payload.data.id) {
            targetAccount = await db.select().from(accounts).where(and(eq(accounts.id, payload.data.id), eq(accounts.userId, session.user.id))).limit(1);
        } else {
            targetAccount = await db.select().from(accounts).where(and(eq(accounts.userId, session.user.id), ilike(accounts.name, `%${accountRef}%`))).limit(1);
        }

        if (targetAccount.length === 0) return { success: false, message: `Akun "${accountRef}" tidak ditemukan.` };

        // Delete dependencies and account
        await db.delete(transactions).where(eq(transactions.accountId, targetAccount[0].id));
        await db.delete(accounts).where(eq(accounts.id, targetAccount[0].id));

        await createLog({
            userId: session.user.id,
            level: "warning",
            action: "delete_account",
            message: `Akun "${targetAccount[0].name}" dihapus`,
            metadata: { accountId: targetAccount[0].id }
        });

        revalidatePath("/dashboard");
        revalidatePath("/accounts");
        return { success: true, message: `Akun "${targetAccount[0].name}" dan semua transaksinya berhasil dihapus.` };
    }

    // 7. HANDLE UPDATE ACCOUNT
    if (payload.action === "update_account" && payload.data) {
        console.log('✏️ [SERVER] Processing update_account');
        const accountRef = payload.data.id || payload.data.account || payload.data.accountName;
        if (!accountRef) return { success: false, message: "Informasi akun tidak lengkap." };

        let targetAccount = [];
        if (payload.data.id) {
            targetAccount = await db.select().from(accounts).where(and(eq(accounts.id, payload.data.id), eq(accounts.userId, session.user.id))).limit(1);
        } else {
            targetAccount = await db.select().from(accounts).where(and(eq(accounts.userId, session.user.id), ilike(accounts.name, `%${accountRef}%`))).limit(1);
        }

        if (targetAccount.length === 0) return { success: false, message: `Akun "${accountRef}" tidak ditemukan.` };

        const newName = payload.data.name || payload.data.newName;
        const newBalance = payload.data.balance || payload.data.newBalance;

        const upData: any = { updatedAt: new Date() };
        if (newName) upData.name = newName;
        if (newBalance !== undefined) upData.balance = newBalance.toString();
        if (payload.data.type) upData.type = payload.data.type;

        await db.update(accounts).set(upData).where(eq(accounts.id, targetAccount[0].id));

        console.log('✅ [SERVER] Account updated successfully');

        // Log successful update
        await createLog({
            userId: session.user.id,
            level: "success",
            action: "update_account",
            message: `Akun "${targetAccount[0].name}" diperbarui`,
            metadata: {
                accountId: targetAccount[0].id,
                newName: newName || targetAccount[0].name,
                newBalance: newBalance !== undefined ? newBalance.toString() : targetAccount[0].balance
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/accounts");

        return { success: true, message: `Akun "${targetAccount[0].name}" berhasil diperbarui.` };
    }

    console.error('❌ [SERVER] Unknown action:', payload.action);
    return { success: false, message: "Aksi tidak dikenali." };
}

export async function quickAddTransaction(data: {
    amount: number;
    description: string;
    type: "income" | "expense";
    date?: string;
    accountName?: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    let targetAccountId = "";

    // 1. Account Selection - IMPROVED MATCHING WITH AUTO-CREATE
    if (data.accountName) {
        // Try EXACT match first (case-insensitive)
        const exactMatch = await db
            .select()
            .from(accounts)
            .where(and(
                eq(accounts.userId, session.user.id),
                sql`LOWER(${accounts.name}) = LOWER(${data.accountName})`
            ))
            .limit(1);

        if (exactMatch.length > 0) {
            targetAccountId = exactMatch[0].id;
            console.log(`✅ Exact match found: ${exactMatch[0].name} for "${data.accountName}"`);
        } else {
            // Try fuzzy match (partial)
            const fuzzyMatch = await db
                .select()
                .from(accounts)
                .where(and(
                    eq(accounts.userId, session.user.id),
                    ilike(accounts.name, `%${data.accountName}%`)
                ))
                .limit(1);

            if (fuzzyMatch.length > 0) {
                targetAccountId = fuzzyMatch[0].id;
                console.log(`✅ Fuzzy match found: ${fuzzyMatch[0].name} for "${data.accountName}"`);
            } else {
                // AUTO-CREATE ACCOUNT if not found
                console.log(`🆕 Auto-creating account: "${data.accountName}"`);

                // Determine account type based on name
                const accountNameLower = data.accountName.toLowerCase();
                let accountType: "bank" | "wallet" | "cash" = "cash";

                // Bank keywords
                const bankKeywords = ['bca', 'bri', 'bni', 'mandiri', 'cimb', 'permata', 'btn', 'bank', 'atm'];
                // E-wallet keywords
                const walletKeywords = ['gopay', 'dana', 'ovo', 'shopeepay', 'linkaja', 'jenius', 'wallet', 'digital'];
                // Cash keywords
                const cashKeywords = ['tunai', 'cash', 'dompet', 'kas'];

                if (bankKeywords.some(keyword => accountNameLower.includes(keyword))) {
                    accountType = "bank";
                } else if (walletKeywords.some(keyword => accountNameLower.includes(keyword))) {
                    accountType = "wallet";
                } else if (cashKeywords.some(keyword => accountNameLower.includes(keyword))) {
                    accountType = "cash";
                } else {
                    // Default: if contains number or specific patterns, assume bank
                    if (/\d/.test(accountNameLower)) {
                        accountType = "bank";
                    }
                }

                // Create new account
                const newAccountId = crypto.randomUUID();
                await db.insert(accounts).values({
                    id: newAccountId,
                    userId: session.user.id,
                    name: data.accountName,
                    type: accountType,
                    balance: "0",
                    currency: "IDR",
                    theme: accountType === "bank" ? "blue" : accountType === "wallet" ? "purple" : "emerald"
                });

                targetAccountId = newAccountId;
                console.log(`✅ Created new ${accountType} account: ${data.accountName}`);
            }
        }
    }

    // Fallback if not found or not specified: Get Default Account (First one) or Create Cash
    if (!targetAccountId) {
        const userAccounts = await db
            .select()
            .from(accounts)
            .where(eq(accounts.userId, session.user.id))
            .limit(1);

        if (userAccounts.length === 0) {
            // Create default "Tunai" account
            console.log(`🆕 Creating default "Tunai" account`);
            const newAccountId = crypto.randomUUID();
            await db.insert(accounts).values({
                id: newAccountId,
                userId: session.user.id,
                name: "Tunai",
                type: "cash",
                balance: "0",
                currency: "IDR",
                theme: "emerald"
            });
            targetAccountId = newAccountId;
            console.log(`✅ Created default cash account: Tunai`);
        } else {
            targetAccountId = userAccounts[0].id;
            console.log(`ℹ️ Using default account: ${userAccounts[0].name}`);
        }
    }

    // 2. Determine Category (Simple keyword matching or default)
    // keywords mapping
    const keywordMap: Record<string, string> = {
        'makan': 'food', 'minum': 'food', 'kopi': 'food', 'restoran': 'food',
        'bensin': 'transport', 'ojek': 'transport', 'grab': 'transport', 'gojek': 'transport', 'parkir': 'transport', 'tol': 'transport',
        'belanja': 'shopping', 'baju': 'shopping', 'celana': 'shopping', 'sepatu': 'shopping', 'market': 'shopping', 'indomaret': 'shopping', 'alfamart': 'shopping',
        'listrik': 'bills', 'air': 'bills', 'internet': 'bills', 'pulsa': 'bills', 'paket data': 'bills',
        'gaji': 'salary', 'bonus': 'bonus', 'thr': 'bonus',
        'investasi': 'investment', 'saham': 'investment', 'reksadana': 'investment',
    };

    const lowerDesc = data.description.toLowerCase();
    let categoryKey = 'misc'; // Default

    for (const [key, catId] of Object.entries(keywordMap)) {
        if (lowerDesc.includes(key)) {
            categoryKey = catId;
            break;
        }
    }

    const safeType = data.type === 'income' || data.type === 'expense' ? data.type : 'expense';

    return await createTransaction({
        amount: data.amount.toString(),
        description: data.description,
        accountId: targetAccountId,
        categoryId: categoryKey, // e.g. "food"
        type: safeType,
        date: data.date ? new Date(data.date) : new Date(),
        source: "ai",
    });
}

// Delete Transaction Function
export async function deleteTransaction(transactionId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        // Get transaction details first to reverse the balance
        const [transaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, transactionId))
            .limit(1);

        if (!transaction) {
            return { success: false, error: "Transaction not found" };
        }

        // Verify user owns this transaction's account
        const [account] = await db
            .select()
            .from(accounts)
            .where(
                and(
                    eq(accounts.id, transaction.accountId),
                    eq(accounts.userId, session.user.id)
                )
            )
            .limit(1);

        if (!account) {
            return { success: false, error: "Unauthorized to delete this transaction" };
        }

        await db.transaction(async (tx) => {
            // Reverse the balance change
            const currentBalance = Number(account.balance);
            const amount = Number(transaction.amount);
            let newBalance = currentBalance;

            if (transaction.type === 'income') {
                newBalance -= amount; // Remove the income
            } else {
                newBalance += amount; // Add back the expense
            }

            // Update account balance
            await tx.update(accounts)
                .set({ balance: String(newBalance) })
                .where(eq(accounts.id, transaction.accountId));

            // Delete the transaction
            await tx.delete(transactions)
                .where(eq(transactions.id, transactionId));
        });

        await createLog({
            level: "info",
            action: "delete_transaction",
            message: `Deleted transaction: ${transaction.description || 'No description'}`,
        });

        revalidatePath("/dashboard");
        revalidatePath("/transactions");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete transaction:", error);
        return { success: false, error: "Failed to delete transaction" };
    }
}

// Update Transaction Function
export async function updateTransaction(
    transactionId: string,
    data: {
        amount: string;
        description: string;
        categoryId: string;
        type: "income" | "expense" | "transfer";
        date: Date;
    }
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        // Get old transaction details
        const [oldTransaction] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, transactionId))
            .limit(1);

        if (!oldTransaction) {
            return { success: false, error: "Transaction not found" };
        }

        // Verify user owns this transaction's account
        const [account] = await db
            .select()
            .from(accounts)
            .where(
                and(
                    eq(accounts.id, oldTransaction.accountId),
                    eq(accounts.userId, session.user.id)
                )
            )
            .limit(1);

        if (!account) {
            return { success: false, error: "Unauthorized to update this transaction" };
        }

        await db.transaction(async (tx) => {
            // Reverse old balance change
            const currentBalance = Number(account.balance);
            const oldAmount = Number(oldTransaction.amount);
            const newAmount = Number(data.amount);

            let balanceAfterReversal = currentBalance;

            // Reverse old transaction
            if (oldTransaction.type === 'income') {
                balanceAfterReversal -= oldAmount;
            } else {
                balanceAfterReversal += oldAmount;
            }

            // Apply new transaction
            let finalBalance = balanceAfterReversal;
            if (data.type === 'income') {
                finalBalance += newAmount;
            } else {
                finalBalance -= newAmount;
            }

            // Update account balance
            await tx.update(accounts)
                .set({ balance: String(finalBalance) })
                .where(eq(accounts.id, oldTransaction.accountId));

            // Update the transaction
            await tx.update(transactions)
                .set({
                    amount: data.amount,
                    description: data.description,
                    categoryId: data.categoryId,
                    type: data.type,
                    date: data.date,
                    updatedAt: new Date(),
                })
                .where(eq(transactions.id, transactionId));
        });

        await createLog({
            level: "info",
            action: "update_transaction",
            message: `Updated transaction: ${data.description}`,
        });

        revalidatePath("/dashboard");
        revalidatePath("/transactions");
        return { success: true };
    } catch (error) {
        console.error("Failed to update transaction:", error);
        return { success: false, error: "Failed to update transaction" };
    }
}

// --- GOALS ACTIONS ---

export async function getGoals() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return [];
    }

    const userGoals = await db
        .select()
        .from(goals)
        .where(eq(goals.userId, session.user.id))
        .orderBy(desc(goals.createdAt));

    return userGoals;
}

export async function createGoal(data: {
    name: string;
    targetAmount: string;
    deadline?: Date;
    color?: string;
    icon?: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.insert(goals).values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            name: data.name,
            targetAmount: data.targetAmount,
            currentAmount: "0",
            deadline: data.deadline,
            color: data.color || "blue",
            icon: data.icon || "🎯",
        });

        revalidatePath("/savings");
        revalidatePath("/goals");
        return { success: true };
    } catch (error) {
        console.error("Failed to create goal:", error);
        return { success: false, error: "Failed to create goal" };
    }
}

export async function updateGoal(
    goalId: string,
    data: {
        name?: string;
        targetAmount?: string;
        currentAmount?: string;
        deadline?: Date;
        color?: string;
        icon?: string;
    }
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.update(goals)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(goals.id, goalId),
                    eq(goals.userId, session.user.id)
                )
            );

        revalidatePath("/savings");
        revalidatePath("/goals");
        return { success: true };
    } catch (error) {
        console.error("Failed to update goal:", error);
        return { success: false, error: "Failed to update goal" };
    }
}

export async function deleteGoal(goalId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.delete(goals)
            .where(
                and(
                    eq(goals.id, goalId),
                    eq(goals.userId, session.user.id)
                )
            );

        revalidatePath("/savings");
        revalidatePath("/goals");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete goal:", error);
        return { success: false, error: "Failed to delete goal" };
    }
}

export async function createSavingTransaction(data: {
    amount: string;
    goalId?: string; // Optional now
    accountId: string;
    date: Date;
    description?: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        const result = await db.transaction(async (tx) => {
            // 1. Get Goal (if provided)
            let goal: any[] = [];
            if (data.goalId) {
                goal = await tx.select().from(goals).where(eq(goals.id, data.goalId)).limit(1);
                if (goal.length === 0) throw new Error("Goal not found");
            }

            // 2. Get Account
            const account = await tx.select().from(accounts).where(eq(accounts.id, data.accountId)).limit(1);
            if (account.length === 0) throw new Error("Account not found");

            // 3. Ensure "Tabungan" Category Exists
            let savingsCat = await tx.select().from(categories).where(and(eq(categories.name, "Tabungan"), eq(categories.type, "expense"))).limit(1);
            let savingsCatId = "";

            if (savingsCat.length === 0) {
                const newId = crypto.randomUUID();
                await tx.insert(categories).values({
                    id: newId,
                    name: "Tabungan",
                    type: "expense",
                    icon: "PiggyBank", // Using lucid icon name or emoji? Emoji used in previous code. Let's stick to emoji "🐖" or make sure it matches default. Previous was "🐖".
                    color: "emerald"
                });
                savingsCatId = newId;
            } else {
                savingsCatId = savingsCat[0].id;
            }

            // 4. Create Transaction (Expense)
            await tx.insert(transactions).values({
                id: crypto.randomUUID(),
                accountId: data.accountId,
                categoryId: savingsCatId,
                amount: data.amount,
                description: data.description || (goal.length > 0 ? `Tabungan untuk ${goal[0].name}` : "Tabungan Rutin"),
                date: data.date,
                type: "expense", // Logic: Money leaves account to savings (if savings is not an account type). If user considers savings an "expense" from daily cash.
                source: "manual_saving",
            });

            // 5. Update Account Balance (Decrease)
            const currentBalance = Number(account[0].balance);
            const amount = Number(data.amount);
            await tx.update(accounts)
                .set({ balance: String(currentBalance - amount), updatedAt: new Date() })
                .where(eq(accounts.id, data.accountId));

            // 6. Update Goal Amount (Increase) - ONLY IF GOAL EXISTS
            if (goal.length > 0 && data.goalId) {
                const currentGoalAmount = Number(goal[0].currentAmount);
                await tx.update(goals)
                    .set({ currentAmount: String(currentGoalAmount + amount), updatedAt: new Date() })
                    .where(eq(goals.id, data.goalId));
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/savings");
        revalidatePath("/transactions");
        return { success: true };
    } catch (error) {
        console.error("Failed to create saving transaction:", error);
        return { success: false, error: "Failed to create saving transaction" };
    }
}
