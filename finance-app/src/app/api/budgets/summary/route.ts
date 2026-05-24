import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { budgets, transactions, accounts } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get current month's budgets
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get all active budgets for current month
        const userBudgets = await db
            .select()
            .from(budgets)
            .where(
                and(
                    eq(budgets.userId, userId),
                    gte(budgets.createdAt, startOfMonth),
                    lte(budgets.createdAt, endOfMonth)
                )
            );

        if (userBudgets.length === 0) {
            return NextResponse.json({
                totalBudget: 0,
                totalSpent: 0,
                percentage: 0,
                remaining: 0,
                status: "Aman"
            });
        }

        // Calculate total budget
        const totalBudget = userBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0);

        // Get total spent for current month
        const spentResult = await db
            .select({
                total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
            })
            .from(transactions)
            .leftJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(
                and(
                    eq(accounts.userId, userId),
                    eq(transactions.type, "expense"),
                    gte(transactions.date, startOfMonth),
                    lte(transactions.date, endOfMonth)
                )
            );

        const totalSpent = Number(spentResult[0]?.total || 0);
        const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
        const remaining = totalBudget - totalSpent;

        // Determine status
        let status = "Aman";
        if (percentage >= 90) {
            status = "Bahaya";
        } else if (percentage >= 70) {
            status = "Waspada";
        }

        return NextResponse.json({
            totalBudget,
            totalSpent,
            percentage,
            remaining,
            status
        });

    } catch (error) {
        console.error("Error fetching budget summary:", error);
        return NextResponse.json(
            { error: "Failed to fetch budget summary" },
            { status: 500 }
        );
    }
}
