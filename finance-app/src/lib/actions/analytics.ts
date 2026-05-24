"use server";

import { db } from "@/db";
import { transactions, categories, accounts, debts, budgets, goals, subscriptions } from "@/db/schema/finance";
import { auth } from "@/lib/auth";
import { eq, and, gte, lte, desc, sql, ilike } from "drizzle-orm";
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay } from "date-fns";

import { headers } from "next/headers";

export async function getAnalyticsData(filterMonth?: number, filterYear?: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user?.id) return null;

    const userId = session.user.id;
    const now = new Date();
    const currentYear = filterYear || now.getFullYear();
    const currentMonth = filterMonth ? filterMonth - 1 : now.getMonth(); // 0-indexed

    // 1. Current Month Overview (Selected Month)
    const startCurrentMonth = new Date(currentYear, currentMonth, 1);
    const endCurrentMonth = endOfMonth(startCurrentMonth);

    const currentMonthData = await db
        .select({
            id: transactions.id,
            type: transactions.type,
            amount: transactions.amount,
            categoryId: transactions.categoryId,
            categoryName: categories.name,
            categoryColor: categories.color,
            date: transactions.date,
            description: transactions.description,
        })
        .from(transactions)
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
            and(
                eq(accounts.userId, userId),
                gte(transactions.date, startCurrentMonth),
                lte(transactions.date, endCurrentMonth)
            )
        );

    // Aggregate for Pie Chart (Spending by Category)
    const categorySpending: Record<string, { value: number; color: string; id: string }> = {};
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    // Anomalies
    const anomalies: any[] = [];

    // Daily Heatmap
    const dailySpendingMap: Record<number, number> = {};
    const daysInCurrentMonth = endCurrentMonth.getDate();
    for (let i = 1; i <= daysInCurrentMonth; i++) dailySpendingMap[i] = 0;

    currentMonthData.forEach((tx) => {
        const amount = Number(tx.amount);
        if (tx.type === 'expense') {
            monthlyExpense += amount;
            const catName = tx.categoryName || 'Uncategorized';
            const catColor = tx.categoryColor || '#cbd5e1';
            const catId = tx.categoryId || 'uncategorized';

            if (!categorySpending[catName]) {
                categorySpending[catName] = { value: 0, color: catColor, id: catId };
            }
            categorySpending[catName].value += amount;

            const day = tx.date.getDate();
            if (dailySpendingMap[day] !== undefined) dailySpendingMap[day] += amount;

            if (amount > 1000000) { // Higher threshold
                anomalies.push({
                    id: tx.id,
                    description: tx.description || catName,
                    amount: amount,
                    date: tx.date,
                    category: catName
                });
            }

        } else if (tx.type === 'income') {
            monthlyIncome += amount;
        }
    });

    const dailySpendingArray = Object.entries(dailySpendingMap).map(([day, amount]) => ({
        day: day,
        amount
    })).sort((a, b) => Number(a.day) - Number(b.day));

    const topExpenseCategories = Object.entries(categorySpending).map(([name, data]) => ({
        name,
        amount: data.value,
        color: data.color
    })).sort((a, b) => b.amount - a.amount).slice(0, 5);

    // --- NEW: Budget Comparison Data ---
    // Fetch user budgets (limits)
    const allBudgets = await db.select().from(budgets).where(eq(budgets.userId, userId));
    const budgetComparison = allBudgets.map(b => {
        // Find actual usage in this month's data
        // Match by categoryId if exists. Note: Budget schema uses categoryId.
        // We need category name for display. Join not easily possible here without complex query, 
        // but we can find usage from our aggregated 'categorySpending' IF we map by ID. 
        // Let's refactor categorySpending to store by Name, but we need ID lookup.
        // Simplification: We will fetch category name separately or assume local match if we had category list.
        // Better: We must join Budgets with Categories to get names.
        return b; // Placeholder, will fix below with proper join
    });

    // Valid Budget Query with Join
    const budgetsWithCategories = await db
        .select({
            categoryName: categories.name,
            categoryId: budgets.categoryId,
            limit: budgets.amount,
        })
        .from(budgets)
        .leftJoin(categories, eq(budgets.categoryId, categories.id))
        .where(eq(budgets.userId, userId));

    const budgetData = budgetsWithCategories.map(b => {
        // Calculate actual spent for this category from currentMonthData
        const actual = currentMonthData
            .filter(tx => tx.categoryId === b.categoryId && tx.type === 'expense')
            .reduce((sum, tx) => sum + Number(tx.amount), 0);

        const variance = actual - Number(b.limit);
        const status = variance > 0 ? "over" : variance < -Number(b.limit) * 0.1 ? "under" : "on-track";

        return {
            category: b.categoryName || "Uncategorized",
            budgeted: Number(b.limit),
            actual: actual,
            variance: variance,
            status: status as "over" | "under" | "on-track"
        };
    }).sort((a, b) => b.actual - a.actual).slice(0, 6); // Top 6 budget items


    // 2. Trend Analysis (Last 6 Months for History & Forecast)
    const sixMonthsAgo = startOfMonth(subMonths(startCurrentMonth, 5));

    const historicalData = await db
        .select({
            type: transactions.type,
            amount: transactions.amount,
            date: transactions.date,
        })
        .from(transactions)
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
            and(
                eq(accounts.userId, userId),
                gte(transactions.date, sixMonthsAgo),
                lte(transactions.date, endCurrentMonth)
            )
        );

    const historyMap: Record<string, { date: string; income: number; expense: number; parsedDate: Date }> = {};
    for (let i = 5; i >= 0; i--) {
        const d = subMonths(startCurrentMonth, i);
        const key = format(d, 'MMM yyyy');
        historyMap[key] = { date: format(d, 'MMM'), income: 0, expense: 0, parsedDate: d };
    }

    let lastMonthExpense = 0;
    const previousMonthStart = startOfMonth(subMonths(startCurrentMonth, 1));

    historicalData.forEach((tx) => {
        const key = format(tx.date, 'MMM yyyy');
        if (historyMap[key]) {
            const amount = Number(tx.amount);
            if (tx.type === 'income') historyMap[key].income += amount;
            else if (tx.type === 'expense') historyMap[key].expense += amount;
        }
        if (tx.type === 'expense' && tx.date >= previousMonthStart && tx.date < startCurrentMonth) {
            lastMonthExpense += Number(tx.amount);
        }
    });
    const history = Object.values(historyMap).sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    // --- NEW: Cash Flow Forecast ---
    // Simple naive forecast: Average of last 3 months + momentum
    const recentHistory = history.slice(-3);
    const avgIncome = recentHistory.reduce((acc, h) => acc + h.income, 0) / (recentHistory.length || 1);
    const avgExpense = recentHistory.reduce((acc, h) => acc + h.expense, 0) / (recentHistory.length || 1);

    // Forecast next 6 months
    const cashFlowForecast = [];
    for (let i = 1; i <= 6; i++) {
        const nextMonth = new Date(currentYear, currentMonth + i, 1);
        const projectedIncome = avgIncome; // Assume stable
        const projectedExpense = avgExpense * (1 + (i * 0.02)); // Assume 2% inflation/growth

        cashFlowForecast.push({
            month: format(nextMonth, 'MMM yyyy'),
            projected: projectedIncome - projectedExpense,
            confidence: Math.max(0, 90 - (i * 5)) // Confidence drops over time
        });
    }


    // ... (Existing code)

    // 3. Wealth & Debts
    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
    const userDebts = await db.select().from(debts).where(eq(debts.userId, userId));
    const totalCash = userAccounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
    const totalDebt = userDebts.reduce((acc, curr) => acc + Number(curr.currentBalance), 0);
    const monthlyDebtPayment = totalDebt * 0.05;

    // --- NEW: Goals & Subscriptions ---
    const goalsData = await db.select().from(goals).where(eq(goals.userId, userId));
    const subsData = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));

    // --- NEW: Category Trend Data (Pivot) ---
    // We want to see spending trends for top categories over the last 6 months
    const trendCategories = topExpenseCategories.slice(0, 3).map(c => c.name); // Top 3 categories
    const categoryTrendData: any[] = [];

    // Use historicalData to build monthly values per top category
    const trendMap: Record<string, Record<string, number>> = {};
    const monthsKeys: string[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = subMonths(startCurrentMonth, i);
        const key = format(d, 'MMM');
        monthsKeys.push(key);
        trendMap[key] = { month: key as any }; // Cast to fix type for recharts
        trendCategories.forEach(cat => trendMap[key][cat] = 0);
    }

    // Need category ID mapping to names for historical data processing
    // Since historicalData join with accounts but NOT categories properly for Names in array above...
    // We need to re-query or improve historicalData query to include category Names.
    // Let's improve the historicalData query first.

    // IMPROVED Historical Data Query to include Category Names
    const historicalDataWithCats = await db
        .select({
            type: transactions.type,
            amount: transactions.amount,
            date: transactions.date,
            categoryName: categories.name
        })
        .from(transactions)
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
            and(
                eq(accounts.userId, userId),
                gte(transactions.date, sixMonthsAgo),
                lte(transactions.date, endCurrentMonth),
                eq(transactions.type, 'expense')
            )
        );

    historicalDataWithCats.forEach(tx => {
        const monthKey = format(tx.date, 'MMM');
        const catName = tx.categoryName || 'Uncategorized';

        if (trendMap[monthKey] && trendCategories.includes(catName)) {
            trendMap[monthKey][catName] += Number(tx.amount);
        }
    });

    const categoryTrends = Object.values(trendMap);

    return {
        name: session.user.name || "User",
        monthlyIncome,
        monthlyExpense,
        monthlyDebtPayment,
        totalCash,
        totalDebt,
        lastMonthExpense,
        history,
        topExpenseCategories,
        anomalies: anomalies.sort((a, b) => b.amount - a.amount).slice(0, 5),
        dailySpending: dailySpendingArray,
        budgetComparison: budgetData,
        cashFlowForecast,
        goals: goalsData.map(g => ({
            id: g.id,
            name: g.name,
            target: Number(g.targetAmount),
            current: Number(g.currentAmount),
            color: g.color || "bg-blue-500",
            icon: g.icon || "🎯"
        })),
        subscriptions: subsData.map(s => ({
            id: s.id,
            name: s.name,
            amount: Number(s.cost),
            date: s.nextPaymentDate.getDate(),
            icon: s.icon, // Simplified: pass string, widget handles rendering
            type: s.category || "Utility"
        })),
        categoryTrends
    };
}
