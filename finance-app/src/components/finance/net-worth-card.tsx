"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Landmark, Car, Gem, TrendingUp, Home } from "lucide-react";

export function NetWorthCard({ totalCash = 0, totalDebt = 0 }: { totalCash?: number, totalDebt?: number }) {
    // Real Data Integration
    const assets = {
        liquid: totalCash,
        fixed: 0, // Not tracked yet
        investments: 0, // Not tracked yet
        total: totalCash
    };

    const liabilities = {
        shortTerm: totalDebt, // Assumed short term for now
        longTerm: 0,
        total: totalDebt
    };

    const netWorth = assets.total - liabilities.total;
    const ratio = (netWorth / assets.total) * 100; // Solvency Ratio

    return (
        <Card className="h-full border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-emerald-500" />
                    Net Worth (Kekayaan Bersih)
                </CardTitle>
                <CardDescription>Aset dikurangi Kewajiban</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* BIG NUMBER */}
                <div className="text-center py-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-sm font-medium text-emerald-600 uppercase tracking-widest mb-1">Total Net Worth</p>
                    <h2 className="text-4xl font-black text-emerald-700 dark:text-emerald-400">
                        Rp {(netWorth / 1000000).toLocaleString('id-ID')} JT
                    </h2>
                </div>

                {/* BREAKDOWN BARS */}
                <div className="space-y-4">
                    {/* ASSETS */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Total Aset</span>
                            <span className="text-emerald-600 font-mono">Rp {(assets.total / 1000000).toFixed(0)} JT</span>
                        </div>
                        <div className="flex h-3 w-full overflow-hidden rounded-full">
                            <div className="bg-blue-400 h-full" style={{ width: `${(assets.liquid / assets.total) * 100}%` }} title="Liquid" />
                            <div className="bg-violet-500 h-full" style={{ width: `${(assets.investments / assets.total) * 100}%` }} title="Investments" />
                            <div className="bg-slate-400 h-full" style={{ width: `${(assets.fixed / assets.total) * 100}%` }} title="Fixed" />
                        </div>
                        <div className="flex gap-4 text-[10px] text-muted-foreground justify-center">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /> Cash</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-500" /> Invests</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400" /> Fixed</div>
                        </div>
                    </div>

                    {/* LIABILITIES */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold flex items-center gap-2"><Gem className="w-4 h-4 text-rose-500" /> Total Hutang</span>
                            <span className="text-rose-600 font-mono">Rp {(liabilities.total / 1000000).toFixed(0)} JT</span>
                        </div>
                        <Progress value={(liabilities.shortTerm / liabilities.total) * 100} className="h-3 bg-rose-200" indicatorColor="bg-rose-500" />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Jangka Pendek (CC/Paylater)</span>
                            <span>Jangka Panjang (KPR/KKB)</span>
                        </div>
                    </div>
                </div>

                {/* ASSET LIST */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-muted/50 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Gem className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Liquid Cash</p>
                            <p className="text-sm font-bold">12.5 JT</p>
                        </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg">
                            <Car className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Vehicle</p>
                            <p className="text-sm font-bold">450 JT</p>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
