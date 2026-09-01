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
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Server Component Fetching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  // Check auth first
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch all data with fallbacks
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
    getFinancialSummary().catch(() => ({ balance: 0, income: 0, expense: 0, incomeTrend: [], expenseTrend: [] })),
    getRecentTransactions().catch(() => []),
    getAccounts().catch(() => []),
    getCategoryBreakdown().catch(() => []),
    getLargestTransactions().catch(() => []),
    getDebts().catch(() => []),
    getGoals().catch(() => []),
    getBudgetSummary().catch(() => []),
    getBusinessData().catch(() => null)
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
