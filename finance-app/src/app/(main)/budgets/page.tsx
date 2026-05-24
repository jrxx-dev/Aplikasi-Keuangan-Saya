import { getBudgetOverview } from "@/lib/actions/finance";
import BudgetsPageClient from "./page-client";

export const dynamic = 'force-dynamic';

export default async function BudgetsPage() {
    const budgetData = await getBudgetOverview();
    return <BudgetsPageClient initialData={budgetData} />;
}
