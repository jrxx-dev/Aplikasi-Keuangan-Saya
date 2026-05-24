"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, CalendarRange } from "lucide-react";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { WidgetColorPicker } from "./widget-color-picker";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AverageWidgetProps {
    data?: {
        income: number;
        expense: number;
    };
    currentIncome: number;
    currentExpense: number;
}

export function AverageWidget({ data, currentIncome, currentExpense }: AverageWidgetProps) {
    const { themes } = useWidgetTheme();
    // Use a default theme or allow picking. Let's reuse 'account-stats' ID or similar, or create new.
    // For now, let's use a unique ID 'average-widget'.
    const theme = themes["average-widget"] || { primary: "#10b981", secondary: "#3b82f6", accent: "#6366f1", gradient: "" };

    // Fallback if data is missing
    const averages = data || { income: 0, expense: 0 };

    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
        notation: "compact", // Use compact for space saving if needed, or standard.
    }).format(val);

    const formatFullCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val);

    // Calculate variations
    const incomeDiff = currentIncome - averages.income;
    const isIncomeHigher = incomeDiff > 0;
    const incomePercent = averages.income > 0 ? (Math.abs(incomeDiff) / averages.income) * 100 : 0;

    const expenseDiff = currentExpense - averages.expense;
    const isExpenseHigher = expenseDiff > 0;
    const expensePercent = averages.expense > 0 ? (Math.abs(expenseDiff) / averages.expense) * 100 : 0;

    return (
        <Card
            className="h-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg group hover:scale-[1.01] transition-all rounded-3xl relative overflow-hidden"
            style={{
                borderColor: `${theme.primary}20`,
            }}
        >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-white/10 dark:to-white/5 rounded-bl-full pointer-events-none" />
            <motion.div
                className="absolute -left-10 -bottom-10 w-40 h-40 blur-[60px] opacity-20"
                style={{ background: theme.secondary }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Bulanan</CardTitle>
                    <div className="flex items-center gap-1">
                        <motion.div
                            whileHover={{ rotate: 15 }}
                        >
                            <CalendarRange
                                className="h-4 w-4 transition-colors"
                                style={{ color: theme.primary }}
                            />
                        </motion.div>
                        <WidgetColorPicker widgetId="average-widget" widgetName="Rata-rata Bulanan" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
                {/* Income Stat */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-muted-foreground/80">
                        <span>Pemasukan Rata-rata</span>
                        {averages.income > 0 && (
                            <span className={cn(
                                "flex items-center gap-0.5",
                                isIncomeHigher ? "text-emerald-500" : "text-amber-500"
                            )}>
                                {isIncomeHigher ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {incomePercent.toFixed(0)}% vs Avg
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                            {formatCurrency(averages.income)}
                        </h4>
                    </div>
                    {/* Progress bar visual for context */}
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }} // Just a static bar for "Average" baseline? No, let's show current vs average.
                        // If current > average, bar is full + overflow distinct.
                        // Let's just keep it simple text for now.
                        />
                    </div>
                </div>

                <div className="h-px bg-slate-200/50 dark:bg-slate-700/50" />

                {/* Expense Stat */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-muted-foreground/80">
                        <span>Pengeluaran Rata-rata</span>
                        {averages.expense > 0 && (
                            <span className={cn(
                                "flex items-center gap-0.5",
                                isExpenseHigher ? "text-rose-500" : "text-emerald-500"
                            )}>
                                {isExpenseHigher ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {expensePercent.toFixed(0)}% vs Avg
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500 dark:from-rose-400 dark:to-pink-300">
                            {formatCurrency(averages.expense)}
                        </h4>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-0 text-[10px] text-muted-foreground flex justify-between items-center relative z-10 mt-auto">
                <span>Berdasarkan 3 bulan terakhir</span>
            </CardFooter>
        </Card>
    );
}
