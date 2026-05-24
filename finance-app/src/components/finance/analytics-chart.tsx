"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";

const incomeConfig = {
    income: {
        label: "Income",
        color: "hsl(var(--chart-1))",
    },
    expense: {
        label: "Expense",
        color: "hsl(var(--chart-2))",
    },
    net: {
        label: "Net",
        color: "#10b981", // Emerald-500
    }
} satisfies ChartConfig;

export function AnalyticsChart({ data = [] }: { data?: any[] }) {
    const isMobile = useIsMobile();
    const displayData = data.length > 0 ? data : [];

    // Calculate totals for header summary
    const totalIncome = displayData.reduce((acc, curr) => acc + (curr.income || 0), 0);
    const totalExpense = displayData.reduce((acc, curr) => acc + (curr.expense || 0), 0);
    const net = totalIncome - totalExpense;

    const formatDate = (value: string) => {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return value;
            return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        } catch (e) {
            return value;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="w-full h-full min-h-[300px]">
            <ChartContainer config={incomeConfig} className="aspect-auto h-full w-full">
                <AreaChart data={displayData} margin={{ top: 10, right: 0, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={true} horizontal={true} strokeDasharray="3 3" opacity={0.15} stroke="#888" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        tickFormatter={(value) => {
                            const d = new Date(value);
                            return d.getDate().toString();
                        }}
                        stroke="#888"
                        fontSize={10}
                        interval="preserveStartEnd"
                        minTickGap={10}
                    />
                    <ChartTooltip
                        content={
                            <ChartTooltipContent
                                indicator="dot"
                                labelFormatter={formatDate}
                                formatter={(value, name) => (
                                    <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
                                        <span className={`${name === 'income' ? 'text-violet-500' : 'text-pink-500'} font-bold mr-2 capitalize`}>
                                            {name === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                            {formatCurrency(Number(value))}
                                        </div>
                                    </div>
                                )}
                            />
                        }
                        cursor={{ stroke: '#888', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />

                    <Area
                        type="monotone"
                        dataKey="expense"
                        name="expense"
                        stroke="#ec4899"
                        strokeWidth={3}
                        fill="url(#expenseGradient)"
                        fillOpacity={1}
                        animationDuration={1000}
                    />

                    <Area
                        type="monotone"
                        dataKey="income"
                        name="income"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fill="url(#incomeGradient)"
                        fillOpacity={1}
                        animationDuration={1000}
                    />
                    {/* Added Net Line (Invisible fill, just stroke) */}
                    {/* <Line
                        type="monotone"
                        dataKey="net" // Ensure your data processor adds this!
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#10b981" }}
                    /> */}
                </AreaChart>
            </ChartContainer>
        </div>
    );
}
