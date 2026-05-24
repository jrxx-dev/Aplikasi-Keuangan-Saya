"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Coins, Calculator } from "lucide-react";

export function WealthSimulator({
    recommendedSavings = 2000000,
    initialCapital = 0
}: {
    recommendedSavings?: number,
    initialCapital?: number
}) {
    const [monthlyContribution, setMonthlyContribution] = useState(recommendedSavings > 0 ? recommendedSavings : 2000000);
    const [annualReturn, setAnnualReturn] = useState(7); // 7%
    const [years, setYears] = useState(10); // 10 Years

    const data = useMemo(() => {
        const result = [];
        let currentWealth = initialCapital;
        let totalPrincipal = initialCapital;
        const monthlyRate = annualReturn / 100 / 12;

        for (let year = 1; year <= years; year++) {
            for (let month = 1; month <= 12; month++) {
                currentWealth = (currentWealth + monthlyContribution) * (1 + monthlyRate);
                totalPrincipal += monthlyContribution;
            }
            result.push({
                year: `Year ${year}`,
                wealth: Math.round(currentWealth),
                principal: totalPrincipal
            });
        }
        return result;
    }, [monthlyContribution, annualReturn, years, initialCapital]);

    const finalAmount = data[data.length - 1]?.wealth || 0;
    const finalPrincipal = data[data.length - 1]?.principal || 0;
    const interestEarned = finalAmount - finalPrincipal;

    return (
        <Card className="h-full border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-violet-500" />
                    Simulator Kekayaan
                </CardTitle>
                <CardDescription>Mainkan angka untuk melihat masa depanmu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* CONTROLS */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Investasi Bulanan</span>
                            <span className="text-violet-600 font-bold">Rp {monthlyContribution.toLocaleString('id-ID')}</span>
                        </div>
                        <Slider
                            value={[monthlyContribution]}
                            onValueChange={(val) => setMonthlyContribution(val[0])}
                            max={20000000}
                            step={100000}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Return Per Tahun (%)</span>
                            <span className="text-pink-600 font-bold">{annualReturn}%</span>
                        </div>
                        <Slider
                            value={[annualReturn]}
                            onValueChange={(val) => setAnnualReturn(val[0])}
                            max={20}
                            step={0.5}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground text-right">*7% = Rata-rata Saham/Reksadana</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Durasi (Tahun)</span>
                            <span className="text-blue-600 font-bold">{years} Tahun</span>
                        </div>
                        <Slider
                            value={[years]}
                            onValueChange={(val) => setYears(val[0])}
                            max={40}
                            step={1}
                            min={1}
                            className="cursor-pointer"
                        />
                    </div>
                </div>

                {/* RESULTS SUMMARY */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Hasil</p>
                        <p className="text-2xl font-black bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                            Rp {(finalAmount / 1000000).toFixed(1)} JT
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Bunga Berbunga</p>
                        <p className="text-xl font-bold text-emerald-500">
                            + Rp {(interestEarned / 1000000).toFixed(1)} JT
                        </p>
                    </div>
                </div>

                {/* CHART */}
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)} JT`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="wealth" stroke="#8b5cf6" fillOpacity={1} fill="url(#wealthGradient)" strokeWidth={3} />
                            <Area type="monotone" dataKey="principal" stroke="#94a3b8" fillOpacity={0} strokeWidth={2} strokeDasharray="4 4" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
