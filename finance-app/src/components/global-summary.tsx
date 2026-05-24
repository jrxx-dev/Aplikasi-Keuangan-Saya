import { getFinancialSummary, getAccounts, getRecentTransactions } from "@/lib/actions/finance";
import GlobalSummaryClient from "./global-summary-client";

export default async function GlobalSummary() {
    // Fetch summary, accounts, and transactions in parallel
    const [summary, accounts, transactions] = await Promise.all([
        getFinancialSummary(),
        getAccounts(),
        getRecentTransactions()
    ]);

    // Pass to client component for rendering
    return <GlobalSummaryClient summary={summary} accounts={accounts} transactions={transactions} />;
}
