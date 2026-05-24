import { Suspense } from "react";
import { getAnalyticsData } from "@/lib/actions/analytics";
import AnalyticsPageClient from "./page-client";
import { Skeleton } from "@/components/ui/skeleton";

export default async function AnalyticsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Await searchParams (Next.js 16 requirement)
    const searchParams = await props.searchParams;

    // Parse filters
    const month = typeof searchParams.month === 'string' ? parseInt(searchParams.month) : undefined;
    const year = typeof searchParams.year === 'string' ? parseInt(searchParams.year) : undefined;

    const analyticsData = await getAnalyticsData(month, year);

    if (!analyticsData) {
        return <div>Please log in to view analytics.</div>;
    }

    return (
        <div className="container max-w-[1920px] mx-auto p-0">
            <Suspense fallback={<AnalyticsSkeleton />}>
                <AnalyticsPageClient
                    financialData={analyticsData}
                    currentMonth={month || new Date().getMonth() + 1}
                    currentYear={year || new Date().getFullYear()}
                />
            </Suspense>
        </div>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-12 gap-6">
                <Skeleton className="col-span-8 h-[400px] rounded-xl" />
                <Skeleton className="col-span-4 h-[400px] rounded-xl" />
            </div>
        </div>
    );
}
