"use server";

import { db } from "@/db";
import { accounts, transactions, categories } from "@/db/schema/finance";
import { auth } from "@/lib/auth";
import { eq, and, gte, lte, desc, sql, sum } from "drizzle-orm";
import { headers } from "next/headers";

export async function getReportData(period: string = "this-month", type: string = "all") {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;

    // 1. Determine Date Range
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    if (period === "last-month") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === "this-year") {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (period === "all") {
        startDate = new Date(2000, 0, 1); // Way back
    }

    // 2. Fetch User Accounts (to filter transactions)
    const userAccounts = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.userId, session.user.id));
    const accountIds = userAccounts.map(a => a.id);
    if (accountIds.length === 0) return null;

    // 3. Fetch Transactions
    let conditions = and(
        sql`${transactions.accountId} IN ${accountIds}`,
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
    );

    if (type === "income") conditions = and(conditions, eq(transactions.type, "income"));
    if (type === "expense") conditions = and(conditions, eq(transactions.type, "expense"));

    const txDocs = await db
        .select({
            id: transactions.id,
            date: transactions.date,
            amount: transactions.amount,
            description: transactions.description,
            type: transactions.type,
            category: categories.name,
            account: accounts.name
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(conditions)
        .orderBy(desc(transactions.date));

    // 4. Calculate Summary
    const totalIncome = txDocs.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = txDocs.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const netCashFlow = totalIncome - totalExpense;

    // 5. Generate AI Analysis (Rule-Based)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    // Group expenses by category for insight
    const expByCategory = new Map<string, number>();
    txDocs.filter(t => t.type === 'expense').forEach(t => {
        const cat = t.category || "Lainnya";
        expByCategory.set(cat, (expByCategory.get(cat) || 0) + Number(t.amount));
    });
    const sortedCats = Array.from(expByCategory.entries()).sort((a, b) => b[1] - a[1]);
    const topExpense = sortedCats.length > 0 ? sortedCats[0] : null;

    let aiAnalysis = "";
    if (netCashFlow > 0) {
        aiAnalysis += `✅ **Cashflow Positif**: Anda berhasil surplus Rp ${new Intl.NumberFormat('id-ID').format(netCashFlow)} periode ini. `;
        if (savingsRate > 20) aiAnalysis += `Savings Rate Anda ${savingsRate.toFixed(1)}% sangat sehat! Pertahankan. `;
        else aiAnalysis += `Coba tingkatkan tabungan hingga 20% bulan depan. `;
    } else {
        aiAnalysis += `⚠️ **Defisit**: Pengeluaran melebihi pemasukan sebesar Rp ${new Intl.NumberFormat('id-ID').format(Math.abs(netCashFlow))}. `;
        aiAnalysis += `Perlu evaluasi ketat pada pos pengeluaran. `;
    }

    if (topExpense) {
        aiAnalysis += `🔍 **Sorotan Utama**: Pengeluaran terbesar adalah '${topExpense[0]}' senilai Rp ${new Intl.NumberFormat('id-ID').format(topExpense[1])}. Pastikan ini adalah kebutuhan esensial.`;
    }

    return {
        periodLabel: period === 'this-month' ? 'Bulan Ini' : (period === 'last-month' ? 'Bulan Lalu' : 'Tahun Ini'),
        startDate,
        endDate,
        summary: {
            totalIncome,
            totalExpense,
            netCashFlow
        },
        transactions: txDocs.map(t => ({ ...t, amount: Number(t.amount) })),
        aiAnalysis
    };
}
