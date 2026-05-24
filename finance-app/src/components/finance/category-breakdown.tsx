"use client";

import * as React from "react";
import { Label, Pie, PieChart, Cell } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { ArrowUpCircle, ArrowDownCircle, PieChart as PieChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryData {
    name: string;
    value: number;
    color?: string;
    icon?: string;
    type?: "income" | "expense";
}

interface CategoryBreakdownProps {
    data?: CategoryData[];
    type: "income" | "expense"; // Prop Wajib
}

export function CategoryBreakdown({ data = [], type }: CategoryBreakdownProps) {

    const filteredData = React.useMemo(() => {
        if (!data) return [];
        return data.filter(item => item.type === type);
    }, [data, type]);

    const totalAmount = React.useMemo(() => {
        return filteredData.reduce((acc, curr) => acc + curr.value, 0);
    }, [filteredData]);

    // Distinct & Vibrant Color Palettes (Expanded for variety)
    // Income: Fresh Greens, Teals, Blues, Limes
    const INCOME_COLORS = [
        "#10b981", // Emerald 500
        "#3b82f6", // Blue 500
        "#84cc16", // Lime 500
        "#06b6d4", // Cyan 500
        "#6366f1", // Indigo 500
        "#14b8a6", // Teal 500
        "#22c55e", // Green 500
        "#0ea5e9", // Sky 500
        "#a3e635", // Lime 400
        "#0284c7", // Sky 600
    ];

    // Expense: Warm Reds, Oranges, Pinks, Purples, Yellows
    const EXPENSE_COLORS = [
        "#ef4444", // Red 500
        "#f59e0b", // Amber 500
        "#ec4899", // Pink 500
        "#8b5cf6", // Violet 500
        "#f97316", // Orange 500
        "#d946ef", // Fuchsia 500
        "#eab308", // Yellow 500
        "#f43f5e", // Rose 500
        "#a855f7", // Purple 500
        "#fb923c", // Orange 400
    ];

    const chartData = React.useMemo(() => {
        const colors = type === 'income' ? INCOME_COLORS : EXPENSE_COLORS;
        return filteredData.map((item, index) => ({
            category: item.name,
            amount: item.value,
            // FORCE use of palette colors to ensure distinctiveness as requested
            fill: colors[index % colors.length]
        }));
    }, [filteredData, type]);

    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            amount: { label: "Jumlah" },
        };
        chartData.forEach((item) => {
            const key = item.category.toLowerCase().replace(/\s+/g, "_");
            config[key] = {
                label: item.category,
                color: item.fill,
            };
        });
        return config;
    }, [chartData]);

    const isIncome = type === 'income';

    return (
        <Card className="flex flex-col bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl h-full transition-all hover:scale-[1.01] rounded-3xl overflow-hidden min-h-[220px]">
            <CardHeader className="items-center pb-2 pt-4 px-4 border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/20">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    {isIncome ? <ArrowUpCircle className="w-4 h-4 text-emerald-500" /> : <ArrowDownCircle className="w-4 h-4 text-rose-500" />}
                    {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                </CardTitle>
                <CardDescription className="text-[10px] hidden sm:block">Per Kategori</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 p-0 relative">
                {chartData.length > 0 ? (
                    <div className="flex items-center h-full p-2 gap-2">
                        {/* LEFT: COMPACT PIE CHART */}
                        <div className="w-[40%] flex items-center justify-center relative min-w-[120px]">
                            <div className="relative w-[120px] h-[120px] group">
                                {/* Colored Glow */}
                                <div className={`absolute inset-0 rounded-full blur-2xl transform scale-90 -z-10 opacity-30 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <ChartContainer
                                    config={chartConfig}
                                    className="mx-auto aspect-square h-full w-full"
                                >
                                    <PieChart>
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Pie
                                            data={chartData}
                                            dataKey="amount"
                                            nameKey="category"
                                            innerRadius={35}
                                            outerRadius={55}
                                            paddingAngle={3}
                                            cornerRadius={4}
                                            strokeWidth={2}
                                            stroke="transparent"
                                        >
                                            <Label
                                                content={({ viewBox }) => {
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                        return (
                                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xs font-black">
                                                                    {new Intl.NumberFormat("id-ID", { notation: "compact", compactDisplay: "short" }).format(totalAmount)}
                                                                </tspan>
                                                            </text>
                                                        );
                                                    }
                                                }}
                                            />
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            </div>
                        </div>

                        {/* RIGHT: SCROLLABLE LEGEND */}
                        <div className="w-[60%] h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            <div className="space-y-1.5 py-1">
                                {chartData.map((item, i) => {
                                    const percentage = ((item.amount / totalAmount) * 100).toFixed(0);
                                    return (
                                        <div key={item.category} className="flex items-center justify-between text-[10px] p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-black/5">
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                                                <span className="font-medium text-foreground/80 truncate max-w-[70px] leading-tight" title={item.category}>
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="font-semibold tabular-nums text-muted-foreground">
                                                    {new Intl.NumberFormat("id-ID", { notation: "compact" }).format(item.amount)}
                                                </span>
                                                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500 font-bold min-w-[24px] text-center">
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs min-h-[140px]">
                        <div className="p-3 rounded-full bg-black/5 dark:bg-white/5 mb-2">
                            <PieChartIcon className="w-6 h-6 opacity-40" />
                        </div>
                        <p>Belum ada data</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
