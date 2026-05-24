"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BudgetRadarProps {
    categories: any[]; // Expecting categoryBreakdown data
    totalBudget?: number;
}

export function BudgetRadar({ categories = [], totalBudget = 0 }: BudgetRadarProps) {
    // 1. Filter only expenses
    const expenses = categories.filter(c => c.type === 'expense');

    // 2. Sort by value (highest first) and take top 4
    const topExpenses = [...expenses].sort((a, b) => b.value - a.value).slice(0, 4);

    // 3. Helper to format currency
    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(val);

    return (
        <Card className="flex flex-col bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-3xl overflow-hidden h-full">
            <CardHeader className="pb-2 pt-5 border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                            <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-foreground">
                                Budget Radar
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Monitor Pos Pengeluaran Utama
                            </CardDescription>
                        </div>
                    </div>
                    {/* Simulated Alert Badge */}
                    <div className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-[10px] font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Cek Limit
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-5 space-y-5">
                {topExpenses.length > 0 ? (
                    topExpenses.map((item, index) => {
                        // SIMULATION: Assume "Budget" is 120% of current spend (just for demo visual)
                        // In real app, this would come from DB
                        const estimatedLimit = item.value * (1 + (0.2 + (index * 0.1)));
                        const percentage = Math.min(100, Math.round((item.value / estimatedLimit) * 100));

                        // Status Logic
                        let statusColor = "bg-emerald-500";
                        if (percentage > 85) statusColor = "bg-rose-500";
                        else if (percentage > 60) statusColor = "bg-amber-500";

                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-2 group"
                            >
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                                        <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-foreground">
                                            {formatCurrency(item.value)}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            dari limit {new Intl.NumberFormat("id-ID", { notation: "compact" }).format(estimatedLimit)}
                                        </div>
                                    </div>
                                </div>
                                <div className="relative h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn("h-full rounded-full relative overflow-hidden", statusColor)}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium">
                                    <span>{percentage}% Terpakai</span>
                                    {percentage > 80 ? (
                                        <span className="text-rose-500 flex items-center gap-1">
                                            <AlertTriangle className="w-2.5 h-2.5" /> Boros
                                        </span>
                                    ) : (
                                        <span className="text-emerald-500 flex items-center gap-1">
                                            <CheckCircle2 className="w-2.5 h-2.5" /> Aman
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-xs">
                        <Target className="w-8 h-8 opacity-20 mb-2" />
                        <p>Belum ada data pengeluaran</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
