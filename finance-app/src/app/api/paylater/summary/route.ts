import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { paylaterDebts } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all unpaid paylater debts
        const debts = await db
            .select()
            .from(paylaterDebts)
            .where(
                and(
                    eq(paylaterDebts.userId, userId),
                    eq(paylaterDebts.status, "unpaid")
                )
            );

        if (debts.length === 0) {
            return NextResponse.json({
                totalAmount: 0,
                daysUntilDue: -1,
                providerCount: 0
            });
        }

        // Calculate total amount
        const totalAmount = debts.reduce((sum, debt) => sum + Number(debt.amount), 0);

        // Find nearest due date
        const sortedDebts = debts
            .filter(debt => debt.dueDate)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

        let daysUntilDue = -1;
        if (sortedDebts.length > 0) {
            const nearestDueDate = new Date(sortedDebts[0].dueDate!);
            nearestDueDate.setHours(0, 0, 0, 0);
            const diffTime = nearestDueDate.getTime() - today.getTime();
            daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Count unique providers
        const uniqueProviders = new Set(debts.map(debt => debt.provider));
        const providerCount = uniqueProviders.size;

        return NextResponse.json({
            totalAmount,
            daysUntilDue,
            providerCount
        });

    } catch (error) {
        console.error("Error fetching paylater summary:", error);
        return NextResponse.json(
            { error: "Failed to fetch paylater summary" },
            { status: 500 }
        );
    }
}
