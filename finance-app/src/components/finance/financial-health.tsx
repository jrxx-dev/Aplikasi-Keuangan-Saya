"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, ShieldCheck, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialHealthProps {
    income?: number;
    expense?: number;
    balance?: number;
}

export function FinancialHealth({ income = 0, expense = 0, balance = 0 }: FinancialHealthProps) {
    // 1. Calculate Metrics
    const savings = income - expense;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Monthly Burn Rate (Expenses)
    // Runway: How many months can user survive with current balance if income stops
    // Cap runway at 12 months for scoring purposes to avoid skewing
    const runway = expense > 0 ? balance / expense : 0;

    // 2. Score Calculation (0-100)
    // Savings Rate (50% weight): Target 20% -> 100pts
    // Runway (50% weight): Target 6 months -> 100pts

    let savingsScore = 0;
    if (savingsRate >= 20) savingsScore = 100;
    else if (savingsRate > 0) savingsScore = (savingsRate / 20) * 100;
    else savingsScore = 0; // Negative or zero savings

    let runwayScore = 0;
    if (runway >= 6) runwayScore = 100;
    else runwayScore = (runway / 6) * 100;

    const overallScore = Math.round((savingsScore * 0.6) + (runwayScore * 0.4));

    // 3. Determine Status & Color
    let status = { text: "Kritis", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: AlertTriangle };
    if (overallScore >= 80) {
        status = { text: "Sangat Sehat", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: ShieldCheck };
    } else if (overallScore >= 60) {
        status = { text: "Sehat", color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20", icon: HeartPulse };
    } else if (overallScore >= 40) {
        status = { text: "Cukup", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Activity };
    }

    // 4. Generate Insight
    const getInsight = () => {
        if (savingsRate < 0) return "Pengeluaran Anda melebihi pendapatan. Segera evaluasi pos pengeluaran.";
        if (runway < 1) return "Dana darurat sangat tipis. Prioritaskan menabung untuk dana darurat minimal 3 bulan.";
        if (savingsRate < 20) return "Tingkatkan rasio tabungan hingga minimal 20% untuk kesehatan finansial jangka panjang.";
        if (runway < 3) return "Dana cadangan sudah ada, tapi usahakan mencapai 6 bulan pengeluaran.";
        return "Kondisi keuangan prima! Pertahankan gaya hidup ini dan mulai investasi.";
    };

    const StatusIcon = status.icon;

    return (
        <Card className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl h-full flex flex-col justify-between rounded-3xl overflow-hidden relative group">
            {/* Background Decoration */}
            <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500", status.bg.replace('/10', '/30'))} />

            <CardHeader className="relative z-10 pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className={cn("p-2 rounded-xl", status.bg)}>
                            <StatusIcon className={cn("w-5 h-5", status.color)} />
                        </div>
                        Skor Kesehatan
                    </CardTitle>
                    <Badge variant="outline" className={cn("font-bold backdrop-blur-md", status.bg, status.color, status.border)}>
                        {overallScore}/100
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10 flex-1 flex flex-col justify-end">
                {/* Score Circle / Visualization */}
                <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 flex-shrink-0">
                        {/* Simple CSS Circle Progress */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className="fill-none stroke-current text-black/5 dark:text-white/5"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className={cn("fill-none stroke-current transition-all duration-1000 ease-out", status.color)}
                                strokeWidth="8"
                                strokeDasharray="283" // 2 * pi * 45
                                strokeDashoffset={283 - (283 * overallScore) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                            {overallScore}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h4 className={cn("font-bold text-lg", status.color)}>{status.text}</h4>
                        <p className="text-xs text-muted-foreground leading-tight max-w-[180px]">
                            {getInsight()}
                        </p>
                    </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tabungan</p>
                        <div className="flex items-end gap-1">
                            <span className={cn("text-lg font-bold tabular-nums", savingsRate >= 20 ? "text-emerald-500" : savingsRate > 0 ? "text-yellow-500" : "text-rose-500")}>
                                {savingsRate.toFixed(0)}%
                            </span>
                            <span className="text-[10px] text-muted-foreground mb-1">vs pend</span>
                        </div>
                        <Progress value={Math.max(0, Math.min(100, savingsRate))} className="h-1" indicatorColor={savingsRate >= 20 ? "bg-emerald-500" : "bg-rose-500"} />
                    </div>

                    <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Cadangan</p>
                        <div className="flex items-end gap-1">
                            <span className={cn("text-lg font-bold tabular-nums", runway >= 6 ? "text-emerald-500" : runway >= 3 ? "text-blue-500" : "text-yellow-500")}>
                                {runway.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-muted-foreground mb-1">bulan</span>
                        </div>
                        <Progress value={Math.min(100, (runway / 6) * 100)} className="h-1" indicatorColor="bg-blue-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
