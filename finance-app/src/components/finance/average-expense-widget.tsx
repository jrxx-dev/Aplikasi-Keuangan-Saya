"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, CalendarRange } from "lucide-react";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { WidgetColorPicker } from "./widget-color-picker";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface AverageExpenseWidgetProps {
    data?: {
        expense: number;
        history: { month: string; income: number; expense: number }[];
    };
    currentExpense: number;
}

export function AverageExpenseWidget({ data, currentExpense }: AverageExpenseWidgetProps) {
    const { themes } = useWidgetTheme();
    // Default theme for expense average: Pink/Rose spectrum
    const theme = themes["average-expense"] || { primary: "#db2777", secondary: "#f472b6", accent: "#be185d", gradient: "from-pink-400 to-pink-600" };

    // Fallback if data is missing
    const avgExpense = data?.expense || 0;
    const history = data?.history || [];

    // Format for chart: just show month name approx
    const chartData = history.map(h => ({
        ...h,
        monthLabel: new Date(h.month + "-01").toLocaleDateString('id-ID', { month: 'short' })
    }));

    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(val);

    // Calculate variations
    const expenseDiff = currentExpense - avgExpense;
    const isExpenseHigher = expenseDiff > 0;
    const expensePercent = avgExpense > 0 ? (Math.abs(expenseDiff) / avgExpense) * 100 : 0;

    return (
        <Card
            className="h-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg group hover:scale-[1.01] transition-all rounded-3xl relative overflow-hidden flex flex-col"
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

            <CardHeader className="pb-2 relative z-10 shrink-0">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Pengeluaran</CardTitle>
                    <div className="flex items-center gap-1">
                        <motion.div whileHover={{ rotate: 15 }}>
                            <CalendarRange
                                className="h-4 w-4 transition-colors"
                                style={{ color: theme.primary }}
                            />
                        </motion.div>
                        <WidgetColorPicker widgetId="average-expense" widgetName="Rata-rata Pengeluaran" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4 flex-1 flex flex-col">
                <div className="space-y-1 shrink-0 flex flex-col items-end text-right">
                    <div className="flex justify-end items-center gap-2 text-xs text-muted-foreground/80 w-full">
                        {avgExpense > 0 && (
                            <span className={cn(
                                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/50 dark:bg-black/20",
                                isExpenseHigher ? "text-rose-500" : "text-emerald-500"
                            )}>
                                {isExpenseHigher ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {expensePercent.toFixed(0)}% vs Avg
                            </span>
                        )}
                        <span>Bulanan</span>
                    </div>
                    <div className="flex items-baseline gap-2 justify-end">
                        <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500 dark:from-rose-400 dark:to-pink-300">
                            {formatCurrency(avgExpense)}
                        </h4>
                    </div>
                </div>

                {/* Removed Chart Area */}
            </CardContent>

            <CardFooter className="pt-0 text-[10px] text-muted-foreground flex justify-between items-center relative z-10 mt-auto shrink-0">
                <span>Trend 3 Bulan Terakhir</span>
            </CardFooter>
        </Card>
    );
}
