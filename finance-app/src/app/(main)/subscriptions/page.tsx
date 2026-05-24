import { Suspense } from "react";
import { getSubscriptions } from "@/lib/actions/subscriptions";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { SubscriptionCalendar } from "@/components/subscriptions/subscription-calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { CalendarClock, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function SubscriptionsPage() {
    const subscriptions = await getSubscriptions();

    // Calculate stats
    const totalMonthlyCost = subscriptions.reduce((acc, sub) => {
        let cost = parseFloat(sub.cost);
        if (sub.billingCycle === 'yearly') cost = cost / 12;
        if (sub.billingCycle === 'weekly') cost = cost * 4;
        return acc + cost;
    }, 0);

    const yearlyProjection = totalMonthlyCost * 12;
    const activeSubs = subscriptions.filter(s => s.status === 'active').length;

    return (
        <div className="container max-w-7xl mx-auto p-4 lg:p-8 space-y-8 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
                        Subscriptions Manager
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Kelola langganan rutin dan jangan pernah telat bayar.
                    </p>
                </div>
                <SubscriptionForm />
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-purple-500/20">
                    <div className="flex items-center gap-3 mb-2 opacity-90">
                        <CalendarClock className="w-5 h-5" />
                        <span className="font-semibold text-sm">Tagihan Bulanan</span>
                    </div>
                    <div className="text-3xl font-black">{formatCurrency(totalMonthlyCost)}</div>
                    <p className="text-xs opacity-75 mt-1">Estimasi pengeluaran rutin</p>
                </div>

                <div className="bg-white/50 dark:bg-black/40 border p-6 rounded-3xl backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-semibold text-sm">Proyeksi Tahunan</span>
                    </div>
                    <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                        {formatCurrency(yearlyProjection)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total biaya dalam setahun</p>
                </div>

                <div className="bg-white/50 dark:bg-black/40 border p-6 rounded-3xl backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold text-sm">Langganan Aktif</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-500">
                        {activeSubs}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Layanan terdaftar</p>
                </div>
            </div>

            {/* Main Content: Calendar & List */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <Suspense fallback={<CalendarSkeleton />}>
                    <SubscriptionCalendar subscriptions={subscriptions} />
                </Suspense>
            </div>
        </div>
    );
}

function CalendarSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <Skeleton className="h-full w-full rounded-3xl" />
            <Skeleton className="h-full w-full rounded-3xl" />
        </div>
    );
}
