"use client";

import { motion } from "framer-motion";
import { SpendingPieChart } from "./spending-pie-chart";
import { IncomeExpenseBar } from "./income-expense-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Gem, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardClientProps {
    data: {
        pieChartData: any[];
        barChartData: any[];
        summary: {
            totalIncome: number;
            totalExpense: number;
            savingsRate: number;
            wellnessScore: number;
        };
    } | null;
}

export function AnalyticsDashboardClient({ data }: AnalyticsDashboardClientProps) {
    if (!data) return null;

    const { pieChartData, barChartData, summary } = data;

    // Score Color Logic
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        Financial Insights
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Analisis mendalam kondisi keuangan Anda.
                    </p>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Financial Wellness</CardTitle>
                        <Activity className={cn("h-4 w-4", getScoreColor(summary.wellnessScore))} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", getScoreColor(summary.wellnessScore))}>
                            {summary.wellnessScore}/100
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Skor kesehatan finansial Anda.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                        <Gem className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.savingsRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Rasio tabungan bulan ini.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalIncome)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pemasukan bulan ini.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalExpense)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pengeluaran bulan ini.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-12 gap-6">
                <IncomeExpenseBar data={barChartData} />
                <SpendingPieChart data={pieChartData} />
            </div>
        </div>
    );
}
