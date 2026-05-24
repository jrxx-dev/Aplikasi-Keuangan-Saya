"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet } from "lucide-react";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { WidgetColorPicker } from "./widget-color-picker";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

interface BudgetData {
    totalBudget: number;
    totalSpent: number;
    percentage: number;
    remaining: number;
    status: string;
}

export function BudgetWidget({ data }: { data?: BudgetData }) {
    const { themes } = useWidgetTheme();
    const theme = themes["budget-widget"];

    // Use passed data or safe fallback
    const budgetData = data || {
        totalBudget: 0,
        totalSpent: 0,
        percentage: 0,
        remaining: 0,
        status: "Belum Ada Data"
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(val);

    const getStatusColor = () => {
        if (budgetData.percentage >= 90) return theme.accent;
        if (budgetData.percentage >= 70) return theme.primary;
        return theme.secondary;
    };

    return (
        <Link href="/budgets" className="block h-full cursor-pointer">
            <Card
                className="h-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg group hover:scale-[1.01] transition-all rounded-3xl relative overflow-hidden"
                style={{
                    borderColor: `${theme.primary}20`,
                }}
            >
                {/* Animated background gradient */}
                <motion.div
                    className="absolute inset-0 opacity-5 dark:opacity-10"
                    style={{
                        background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`,
                    }}
                    animate={{
                        opacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Shimmer effect */}
                <motion.div
                    className="absolute inset-0 z-0"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 1,
                    }}
                >
                    <div
                        className="w-1/2 h-full blur-xl opacity-20"
                        style={{
                            background: `linear-gradient(90deg, transparent, ${theme.secondary}, transparent)`,
                        }}
                    />
                </motion.div>

                <CardHeader className="pb-2 relative z-10">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Status Anggaran</CardTitle>
                        <div className="flex items-center gap-1">
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Wallet
                                    className="h-4 w-4 transition-colors"
                                    style={{ color: theme.primary }}
                                />
                            </motion.div>
                            <WidgetColorPicker widgetId="budget-widget" widgetName="Status Anggaran" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-2xl font-bold">
                            {budgetData.percentage}% <span className="text-sm font-normal text-muted-foreground">Terpakai</span>
                        </span>
                        <motion.span
                            className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                                backgroundColor: `${getStatusColor()}20`,
                                color: getStatusColor(),
                            }}
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                            }}
                        >
                            {budgetData.status}
                        </motion.span>
                    </div>
                    <div className="relative">
                        <Progress
                            value={budgetData.percentage}
                            className="h-2 bg-slate-100 dark:bg-slate-800"
                        />
                        <motion.div
                            className="absolute top-0 left-0 h-2 rounded-full"
                            style={{
                                background: `linear-gradient(90deg, ${theme.secondary}, ${theme.primary})`,
                                width: `${budgetData.percentage}%`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${budgetData.percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </CardContent>
                <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between items-center relative z-10 mt-auto">
                    <span suppressHydrationWarning>Sisa: {formatCurrency(budgetData.remaining)}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent transition-colors"
                        style={{
                            color: theme.primary,
                        }}
                    >
                        Limit <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}
