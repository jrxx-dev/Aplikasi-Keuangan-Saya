"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Scale, AlertCircle, CheckCircle2 } from "lucide-react";

export function BudgetTopology({ data }: { data: { income: number, expense: number } }) {
    // 50/30/20 Rule Logic
    // Needs (50%), Wants (30%), Savings (20%)

    // We mock the breakdown of "Expense" into Needs/Wants for now
    // In a real app, this comes from transaction tags.
    const perceivedNeeds = data.expense * 0.6; // Assuming 60% of expense is Needs
    const perceivedWants = data.expense * 0.4; // Assuming 40% of expense is Wants
    const actualSavings = data.income - data.expense;

    const allocation = [
        { name: "Needs (Kebutuhan)", value: perceivedNeeds, ideal: 0.50, color: "#6366f1" }, // Indigo
        { name: "Wants (Keinginan)", value: perceivedWants, ideal: 0.30, color: "#ec4899" }, // Pink
        { name: "Savings (Tabungan)", value: actualSavings, ideal: 0.20, color: "#10b981" }, // Emerald 
    ];

    const total = data.income;

    return (
        <Card className="h-full border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-500" />
                    Struktur Anggaran (50/30/20)
                </CardTitle>
                <CardDescription>Analisis kesehatan alokasi gaji bulanan</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                {/* CHART */}
                <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={allocation}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {allocation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)} JT`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs text-muted-foreground">Total Income</span>
                        <span className="text-lg font-bold font-mono">{(total / 1000000).toFixed(1)} JT</span>
                    </div>
                </div>

                {/* LEGEND & ANALYSIS */}
                <div className="space-y-4">
                    {allocation.map((item, i) => {
                        const actualPct = (item.value / total) * 100;
                        const idealPct = item.ideal * 100;
                        const diff = actualPct - idealPct;
                        const status = Math.abs(diff) < 5 ? "Ideal" : diff > 0 ? "Over" : "Under";

                        return (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-medium">{item.name.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{actualPct.toFixed(0)}%</span>
                                        <span className="text-xs text-muted-foreground">/ {idealPct}%</span>
                                    </div>
                                </div>

                                {/* Status Indicator */}
                                <div className="flex items-center gap-2 text-[10px]">
                                    {status === "Ideal" && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sehat</span>}
                                    {status === "Over" && <span className="text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Terlalu Besar ({diff.toFixed(0)}%)</span>}
                                    {status === "Under" && <span className="text-amber-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Terlalu Kecil</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>

            </CardContent>
        </Card>
    );
}
