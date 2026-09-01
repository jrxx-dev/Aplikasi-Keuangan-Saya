import {
  getFinancialSummary,
  getRecentTransactions,
  getAccounts,
  getCategoryBreakdown,
  getLargestTransactions,
  getBudgetSummary
} from "@/lib/actions/finance";
import { getDebts } from "@/lib/actions/debts";
import { getGoals } from "@/lib/actions/goals";
import { getBusinessData } from "@/actions/business";
import { DashboardWrapper } from "@/components/finance/dashboard-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("Data fetch error:", error);
    return fallback;
  }
}

export default async function Page() {
  const [summary, recentTransactions, accounts, categoryBreakdown, largestTransactions, debts, goals, budgetSummary, businessData] = await Promise.all([
    safeFetch(() => getFinancialSummary(), { balance: 0, income: 0, expense: 0, incomeTrend: [], expenseTrend: [] }),
    safeFetch(() => getRecentTransactions(), []),
    safeFetch(() => getAccounts(), []),
    safeFetch(() => getCategoryBreakdown(), []),
    safeFetch(() => getLargestTransactions(), []),
    safeFetch(() => getDebts(), []),
    safeFetch(() => getGoals(), []),
    safeFetch(() => getBudgetSummary(), []),
    safeFetch(() => getBusinessData(), null)
  ]);

  const dashboardData = {
    summary,
    recentTransactions,
    accounts,
    categoryBreakdown,
    largestTransactions,
    debts,
    goals,
    budgetSummary,
    businessDebts: businessData?.debts || []
  };

  return <DashboardWrapper data={dashboardData} />;
}
