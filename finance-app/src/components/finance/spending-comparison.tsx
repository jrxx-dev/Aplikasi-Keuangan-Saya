"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Calendar, DollarSign, TrendingDown, TrendingUp, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonProps {
    dailyData: { date: string; type: "income" | "expense"; total: number }[];
}

export function SpendingComparisonWidget({ dailyData = [] }: ComparisonProps) {
    // 1. Data Processing
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Helper to get totals for a date range offset by N days
    const getTotalForRange = (startOffset: number, endOffset: number) => {
        let total = 0;
        let count = 0;
        let peak = 0;
        for (let i = startOffset; i <= endOffset; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const val = dailyData
                .filter(x => x.type === 'expense' && x.date === dateStr)
                .reduce((a, b) => a + b.total, 0);
            total += val;
            if (val > 0) count++;
            if (val > peak) peak = val;
        }
        return { total, count, peak };
    };

    const currentStr = getTotalForRange(0, 6);
    const prevStr = getTotalForRange(7, 13);

    const diff = currentStr.total - prevStr.total;
    const isSaving = diff <= 0;

    // Average Daily (Active Days)
    const currAvg = currentStr.total / Math.max(1, currentStr.count);
    const prevAvg = prevStr.total / Math.max(1, prevStr.count);

    const formatShort = (val: number) => new Intl.NumberFormat("id-ID", {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(val);

    return (
        <Card className="flex flex-col bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-3xl overflow-hidden h-full">
            <CardHeader className="pb-2 pt-4 px-5 border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 ring-1 ring-violet-500/10">
                            <Swords className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-foreground/90">Versus Mode</CardTitle>
                            <div className="text-[10px] text-muted-foreground font-medium">Minggu Ini vs Minggu Lalu</div>
                        </div>
                    </div>
                    {/* Badge */}
                    <div className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                        isSaving ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20" : "bg-rose-100 text-rose-700 dark:bg-rose-500/20"
                    )}>
                        {isSaving ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {isSaving ? "Hemat" : "Boros"}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col justify-center">

                {/* Comparison Grid */}
                <div className="grid grid-cols-2 divide-x divide-black/5 dark:divide-white/5 h-full">

                    {/* THIS WEEK */}
                    <div className="p-4 space-y-3">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Minggu Ini</div>

                        <div>
                            <div className="text-lg font-black text-foreground">Rp {formatShort(currentStr.total)}</div>
                            <div className="text-[10px] text-muted-foreground">Total Keluar</div>
                        </div>

                        <div>
                            <div className="text-sm font-bold text-foreground">Rp {formatShort(currAvg)}</div>
                            <div className="text-[10px] text-muted-foreground">Rata-rata/hari</div>
                        </div>

                        <div>
                            <div className="text-xs font-bold text-foreground">Rp {formatShort(currentStr.peak)}</div>
                            <div className="text-[10px] text-muted-foreground">Tertinggi</div>
                        </div>
                    </div>

                    {/* LAST WEEK */}
                    <div className="p-4 space-y-3 bg-black/5 dark:bg-white/5">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Minggu Lalu</div>

                        <div>
                            <div className="text-lg font-bold text-muted-foreground">Rp {formatShort(prevStr.total)}</div>
                            <div className="text-[10px] text-muted-foreground">Total Keluar</div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Rp {formatShort(prevAvg)}</div>
                            <div className="text-[10px] text-muted-foreground">Rata-rata/hari</div>
                        </div>

                        <div>
                            <div className="text-xs font-medium text-muted-foreground">Rp {formatShort(prevStr.peak)}</div>
                            <div className="text-[10px] text-muted-foreground">Tertinggi</div>
                        </div>
                    </div>
                </div>

                {/* Insight Footer */}
                <div className="px-4 py-3 bg-white/30 dark:bg-white/5 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                            isSaving ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        )}>
                            {isSaving ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="text-[10px] leading-tight text-muted-foreground">
                            <span className={cn("font-bold", isSaving ? "text-emerald-600" : "text-rose-600")}>
                                {isSaving ? "Turun" : "Naik"} Rp {formatShort(Math.abs(diff))}
                            </span> dibanding minggu lalu. {isSaving ? "Pertahankan!" : "Coba kurangi jajan."}
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
