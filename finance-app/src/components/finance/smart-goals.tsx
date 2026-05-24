"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Plane, Home, Laptop, Plus, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export function SmartGoals({ monthlySavings }: { monthlySavings: number }) {
    // Mock Goals Data
    const goals = [
        {
            id: 1,
            name: "Dana Darurat (6 Bln)",
            target: 60000000,
            saved: 8500000,
            icon: <Trophy className="w-4 h-4 text-amber-500" />,
            color: "bg-amber-500",
            priority: "High"
        },
        {
            id: 2,
            name: "Liburan ke Jepang",
            target: 25000000,
            saved: 5000000,
            icon: <Plane className="w-4 h-4 text-sky-500" />,
            color: "bg-sky-500",
            priority: "Medium"
        },
        {
            id: 3,
            name: "MacBook Pro M4",
            target: 35000000,
            saved: 2000000,
            icon: <Laptop className="w-4 h-4 text-violet-500" />,
            color: "bg-violet-500",
            priority: "Low"
        },
    ];

    // Logic: Distribute monthly savings based on priority? 
    // For simplicity, let's assume we focus on the first goal, then the second.
    // Or just show "Time to reach" if 100% of savings went there.

    return (
        <Card className="h-full border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-rose-500" />
                        Target Finansial
                    </CardTitle>
                    <CardDescription>Estimasi waktu tercapai dengan tabungan saat ini</CardDescription>
                </div>
                <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* SAVING POWER INDICATOR */}
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-emerald-600/70">Saving Power</p>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Rp {monthlySavings.toLocaleString('id-ID')} / bulan</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    {goals.map((goal, index) => {
                        const remaining = goal.target - goal.saved;
                        const monthsToReach = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : 999;
                        const progress = (goal.saved / goal.target) * 100;

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-2 group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800`}>
                                            {goal.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{goal.name}</h4>
                                            <p className="text-[10px] text-muted-foreground">
                                                Tercapai dalam <span className="font-bold text-foreground">{monthsToReach} Bulan</span> lagi
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold font-mono">{(progress).toFixed(0)}%</p>
                                        <p className="text-[10px] text-muted-foreground">Rp {(goal.saved / 1000000).toFixed(1)}jt / {(goal.target / 1000000).toFixed(1)}jt</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Progress value={progress} className="h-2" indicatorColor={goal.color} />
                                    {/* Monthly Interaction Visual */}
                                    {monthlySavings > 0 && (
                                        <div className="absolute top-0 right-0 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shadow-lg">
                                            + Rp {(monthlySavings / 1000000).toFixed(1)}jt
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </CardContent>
        </Card>
    );
}

import { TrendingUp } from "lucide-react";
