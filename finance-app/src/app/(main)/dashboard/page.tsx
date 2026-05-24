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

// Server Component Fetching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  // Fetch all data in parallel for performance
  const [
    summary,
    recentTransactions,
    accounts,
    categoryBreakdown,
    largestTransactions,
    debts,
    goals,
    budgetSummary,
    businessData
  ] = await Promise.all([
    getFinancialSummary(),
    getRecentTransactions(),
    getAccounts(),
    getCategoryBreakdown(),
    getLargestTransactions(),
    getDebts(),
    getGoals(),
    getBudgetSummary(),
    getBusinessData()
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
