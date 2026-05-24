"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Shield, TrendingUp, Award } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AchievementsWidget() {
    // Dummy Data - In real app, calculate based on user stats
    const achievements = [
        { id: 1, name: "Hemat Hero", desc: "Berhasil hemat 20% dari budget", icon: <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />, unlocked: true },
        { id: 2, name: "Debt Slayer", desc: "Membayar cicilan tepat waktu", icon: <Shield className="w-5 h-5 text-emerald-500 fill-emerald-500" />, unlocked: true },
        { id: 3, name: "Investor", desc: "Top up instrumen investasi", icon: <TrendingUp className="w-5 h-5 text-blue-500 fill-blue-500" />, unlocked: false },
        { id: 4, name: "Streak Master", desc: "Catat transaksi 7 hari berturut-turut", icon: <Award className="w-5 h-5 text-purple-500 fill-purple-500" />, unlocked: true },
    ];

    return (
        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <Trophy className="w-4 h-4" />
                    Pencapaian Bulan Ini
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-4 gap-2">
                    <TooltipProvider>
                        {achievements.map((ach) => (
                            <Tooltip key={ach.id}>
                                <TooltipTrigger>
                                    <div className={`aspect-square rounded-xl flex items-center justify-center transition-all ${ach.unlocked
                                        ? "bg-white dark:bg-zinc-800 shadow-md hover:scale-105 border border-indigo-100 dark:border-indigo-900"
                                        : "bg-slate-100 dark:bg-zinc-900 grayscale opacity-50"}`}>
                                        {ach.icon}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{ach.name}</p>
                                    <p className="text-xs text-muted-foreground">{ach.desc}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Level 5: Financial Savvy</p>
                    <div className="w-full bg-indigo-100 dark:bg-indigo-950 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
