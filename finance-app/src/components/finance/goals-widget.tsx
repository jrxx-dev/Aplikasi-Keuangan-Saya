"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from "lucide-react";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { WidgetColorPicker } from "./widget-color-picker";
import { motion } from "framer-motion";
import Link from "next/link";

interface GoalData {
    name: string;
    targetAmount: number;
    currentAmount: number;
    percentage: number;
}

export function GoalsWidget({ data }: { data?: any[] }) {
    const { themes } = useWidgetTheme();
    const theme = themes["goals-widget"];

    // Process data to get priority goal
    const goalData: GoalData | null = data && data.length > 0 ? (() => {
        const priorityGoal = data[0];
        const percentage = priorityGoal.targetAmount > 0
            ? Math.round((priorityGoal.currentAmount / priorityGoal.targetAmount) * 100)
            : 0;
        return {
            name: priorityGoal.name,
            targetAmount: priorityGoal.targetAmount,
            currentAmount: priorityGoal.currentAmount,
            percentage
        };
    })() : null;


    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
        notation: "compact",
        compactDisplay: "short"
    }).format(val);

    return (
        <Link href="/goals" className="block h-full cursor-pointer">
            <Card
                className="h-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg group hover:scale-[1.01] transition-all rounded-3xl relative overflow-hidden"
                style={{
                    borderColor: `${theme.primary}20`,
                }}
            >
                {/* Animated background */}
                <motion.div
                    className="absolute inset-0 opacity-5 dark:opacity-10"
                    style={{
                        background: `radial-gradient(circle at 30% 50%, ${theme.secondary}, transparent 70%)`,
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Floating particles effect */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            backgroundColor: theme.secondary,
                            opacity: 0.3,
                            left: `${20 + i * 30}%`,
                            bottom: 0,
                        }}
                        animate={{
                            y: [0, -100],
                            x: [0, Math.random() * 50 - 25],
                            opacity: [0, 0.6, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 1,
                            ease: "easeOut",
                        }}
                    />
                ))}

                <CardHeader className="pb-2 relative z-10">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tujuan Prioritas</CardTitle>
                        <div className="flex items-center gap-1">
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <Target
                                    className="h-4 w-4 transition-colors"
                                    style={{ color: theme.primary }}
                                />
                            </motion.div>
                            <WidgetColorPicker widgetId="goals-widget" widgetName="Tujuan Prioritas" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    {goalData ? (
                        <>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-lg font-bold truncate">{goalData.name}</span>
                            </div>
                            <div className="relative">
                                <Progress
                                    value={goalData.percentage}
                                    className="h-2 bg-slate-100 dark:bg-slate-800"
                                />
                                <motion.div
                                    className="absolute top-0 left-0 h-2 rounded-full overflow-hidden"
                                    style={{
                                        width: `${goalData.percentage}%`,
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${goalData.percentage}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                >
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            background: `linear-gradient(90deg, ${theme.secondary}, ${theme.primary})`,
                                        }}
                                    />
                                    {/* Shimmer on progress bar */}
                                    <motion.div
                                        className="absolute inset-0"
                                        animate={{
                                            x: ["-100%", "200%"],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                            repeatDelay: 1,
                                        }}
                                    >
                                        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                    </motion.div>
                                </motion.div>
                            </div>
                            <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                                <span suppressHydrationWarning>Terkumpul: {formatCurrency(goalData.currentAmount)}</span>
                                <motion.span
                                    style={{ color: theme.primary }}
                                    className="font-semibold"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                >
                                    {goalData.percentage}%
                                </motion.span>
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-muted-foreground py-2">Belum ada tujuan aktif</div>
                    )}
                </CardContent>
                <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-end items-center relative z-10 mt-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent transition-colors"
                        style={{
                            color: theme.primary,
                        }}
                    >
                        Detail <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}
