import { Suspense } from "react";
import { getAnalyticsData } from "@/lib/actions/analytics";
import PlannerClient from "./page-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Budget Planner Impian | FinanceMy",
    description: "Simulasikan belanja impian Anda dan lihat dampaknya pada keuangan."
};

export default async function PlannerPage() {
    // Kita reuse getAnalyticsData karena datanya lengkap (Income, Expense, Cash)
    const financialData = await getAnalyticsData();

    if (!financialData) {
        return <div>Please log in.</div>;
    }

    return (
        <div className="container max-w-[1920px] mx-auto p-0">
            <Suspense fallback={<PlannerSkeleton />}>
                <PlannerClient financialData={financialData} />
            </Suspense>
        </div>
    );
}

function PlannerSkeleton() {
    return (
        <div className="p-8 space-y-8">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Skeleton className="h-[500px] md:col-span-2 rounded-xl" />
                <Skeleton className="h-[500px] rounded-xl" />
            </div>
        </div>
    );
}
