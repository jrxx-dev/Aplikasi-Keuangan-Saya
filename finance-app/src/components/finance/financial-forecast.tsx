"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Target, Wallet, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForecastProps {
    currentBalance: number;
    dailyData: { date: string; type: "income" | "expense"; total: number }[];
}

export function FinancialForecastWidget({ currentBalance = 0, dailyData = [] }: ForecastProps) {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - currentDay;

    // Filter current month expenses
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const thisMonthExpenses = dailyData
        .filter(d => d.type === 'expense' && d.date >= startOfMonth)
        .reduce((sum, item) => sum + item.total, 0);

    // Avg Daily Burn
    const avgDailySpend = Math.round(thisMonthExpenses / Math.max(1, currentDay));

    // Calculated "Safe Limit" logic
    // Assumption: User wants to save at least 20% of remaining balance? Or just break even > 0.
    // Let's say Safe Limit is what keeps balance > 0 at end of month.
    const safeDailyLimit = Math.floor(currentBalance / Math.max(1, daysLeft));

    // Status
    const isSafe = avgDailySpend <= safeDailyLimit;
    const usagePercent = Math.min(100, Math.round((avgDailySpend / safeDailyLimit) * 100)) || 0;

    const formatShort = (val: number) => new Intl.NumberFormat("id-ID", {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(val);

    return (
        <Card className="flex flex-col bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-3xl overflow-hidden h-full">
            <CardHeader className="pb-2 pt-4 px-5 border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 ring-1 ring-indigo-500/10">
                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-foreground/90">Prediksi Saldo</CardTitle>
                            <div className="text-[10px] text-muted-foreground font-medium">Monitoring Akhir Bulan</div>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        Sisa {daysLeft} Hari
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-5 flex flex-col justify-between">

                {/* Main Gauge Visual (CSS Based) */}
                <div className="relative pt-2 pb-4 text-center">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Kecepatan Belanja Kamu</div>
                    <div className={cn(
                        "text-3xl font-black tracking-tight",
                        isSafe ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {usagePercent}% <span className="text-base font-medium text-muted-foreground">dari Batas Aman</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden relative">
                        {/* Safe Zone Marker (e.g. up to 100%) */}
                        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-red-500 z-10" />
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000", isSafe ? "bg-emerald-500" : "bg-rose-500")}
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium mt-1 px-1">
                        <span>Aman</span>
                        <span>Bahaya</span>
                    </div>
                </div>

                {/* Compare Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 dark:bg-black/30 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                        <div className="text-[10px] text-muted-foreground mb-0.5">Aktual (Rate)</div>
                        <div className="text-sm font-bold text-foreground">Rp {formatShort(avgDailySpend)}<span className="text-[9px] font-normal">/hari</span></div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/30 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                        <div className="text-[10px] text-muted-foreground mb-0.5">Batas Aman</div>
                        <div className="text-sm font-bold text-teal-600 dark:text-teal-400">Rp {formatShort(safeDailyLimit)}<span className="text-[9px] font-normal">/hari</span></div>
                    </div>
                </div>

                {/* Recommendation */}
                <div className={cn(
                    "text-[10px] text-center font-medium mt-1 leading-tight",
                    isSafe ? "text-emerald-600" : "text-rose-600"
                )}>
                    {isSafe
                        ? "🎉 Bagus! Kamu belanja di bawah batas aman."
                        : "⚠️ Pelan-pelan! Kamu belanja terlalu cepat."}
                </div>

            </CardContent>
        </Card>
    );
}
