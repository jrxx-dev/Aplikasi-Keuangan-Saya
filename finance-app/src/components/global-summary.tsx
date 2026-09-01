import { getFinancialSummary, getAccounts, getRecentTransactions } from "@/lib/actions/finance";
import GlobalSummaryClient from "./global-summary-client";

export default async function GlobalSummary() {
    try {
        const [summary, accounts, transactions] = await Promise.all([
            getFinancialSummary().catch(() => ({ balance: 0, income: 0, expense: 0, incomeTrend: [], expenseTrend: [] })),
            getAccounts().catch(() => []),
            getRecentTransactions().catch(() => [])
        ]);

        return <GlobalSummaryClient summary={summary} accounts={accounts} transactions={transactions} />;
    } catch (error) {
        console.error("GlobalSummary error:", error);
        return <div className="h-12 bg-gray-900/50 rounded" />;
    }
}
