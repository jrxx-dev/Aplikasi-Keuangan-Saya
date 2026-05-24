import { getReportData } from "@/lib/actions/reports";
import ReportsPageClient from "./page-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
    // Fetch default data (This Month) for server-side rendering
    const initialData = await getReportData("this-month", "all");

    // Pass data to client component for interactivity
    return <ReportsPageClient initialData={initialData} />;
}
