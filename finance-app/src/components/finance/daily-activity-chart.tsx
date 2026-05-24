"use client";

import { useMemo, useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar, Filter } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const chartConfig = {
    income: {
        label: "Pemasukan",
        color: "#10b981", // Emerald-500
    },
    expense: {
        label: "Pengeluaran",
        color: "#f43f5e", // Rose-500
    },
} satisfies ChartConfig;

interface DailyActivityProps {
    data: { date: string; type: "income" | "expense"; total: number }[];
}

export function DailyActivityChart({ data = [] }: DailyActivityProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current selection from URL or default to today
    const currentMonthParam = searchParams.get('month');
    const today = new Date();
    // Default to current month if no param
    const defaultMonth = currentMonthParam || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

    // Update local state if URL changes
    useEffect(() => {
        if (currentMonthParam) {
            setSelectedMonth(currentMonthParam);
        }
    }, [currentMonthParam]);

    const handleMonthChange = (value: string) => {
        setSelectedMonth(value);
        // Update URL to trigger server-side data refresh
        const params = new URLSearchParams(searchParams.toString());
        params.set("month", value);
        router.push(`?${params.toString()}`);
        router.refresh();
    };

    // Generate options: Current Year and Previous Year (Full list)
    const monthOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [currentYear, currentYear - 1];

        const options = years.map(year => {
            const months = [];
            for (let m = 0; m < 12; m++) {
                // Construct date manually to avoid timezone jumps
                const date = new Date(year, m, 1);
                // Value format: YYYY-MM
                const value = `${year}-${String(m + 1).padStart(2, '0')}`;
                // Label format: Januari 2026
                const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                months.push({ value, label });
            }
            // Return months in reverse order (Dec -> Jan)
            return { year, months: months.reverse() };
        });

        return options;
    }, []);

    // Process data: Group by date AND fill gaps for the full month
    const processedData = useMemo(() => {
        // Parse selected month for timeline generation
        const [yearStr, monthStr] = selectedMonth.split('-');
        const year = parseInt(yearStr);
        const month = parseInt(monthStr) - 1; // 0-indexed

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dataMap = new Map<string, { income: number; expense: number }>();

        if (data) {
            data.forEach(item => {
                const d = new Date(item.date);
                // Only map data matching our selected view to prevent weird overlaps
                if (d.getMonth() === month && d.getFullYear() === year) {
                    const dateStr = d.toISOString().split('T')[0];
                    if (!dataMap.has(dateStr)) {
                        dataMap.set(dateStr, { income: 0, expense: 0 });
                    }
                    const entry = dataMap.get(dateStr)!;
                    if (item.type === 'income') entry.income += Number(item.total);
                    else entry.expense += Number(item.total);
                }
            });
        }

        const fullMonthData = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);

            // Construct YYYY-MM-DD safely
            const currentYear = dateObj.getFullYear();
            const currentMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
            const currentDay = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${currentYear}-${currentMonth}-${currentDay}`;

            const entry = dataMap.get(dateStr) || { income: 0, expense: 0 };

            fullMonthData.push({
                date: dateStr,
                dayNumber: day,
                income: entry.income,
                expense: entry.expense
            });
        }

        return fullMonthData;
    }, [data, selectedMonth]);

    const totalIncome = processedData.reduce((acc, curr) => acc + curr.income, 0);
    const totalExpense = processedData.reduce((acc, curr) => acc + curr.expense, 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (value: string) => {
        return new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="col-span-12"
        >
            <Card className="shadow-lg bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl transition-all h-[250px] ring-1 ring-black/5 dark:ring-white/5">
                <CardHeader className="flex flex-row items-center justify-between py-3 px-5 border-b border-black/5 dark:border-white/5 h-[60px]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur opacity-20 animate-pulse"></div>
                            <div className="relative p-1.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20">
                                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                Aktivitas Harian
                            </CardTitle>
                            <CardDescription className="text-[10px] font-medium opacity-80">
                                Timeline {new Date(selectedMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden sm:flex items-center gap-4 mr-2"
                        >
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Masuk</span>
                                <span className="text-xs font-bold text-emerald-500 drop-shadow-sm">{formatCurrency(totalIncome)}</span>
                            </div>
                            <div className="h-6 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Keluar</span>
                                <span className="text-xs font-bold text-rose-500 drop-shadow-sm">{formatCurrency(totalExpense)}</span>
                            </div>
                        </motion.div>

                        <Select value={selectedMonth} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-[130px] h-7 text-[10px] font-medium bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/10 shadow-sm rounded-lg transition-colors hover:bg-white/80">
                                <Filter className="w-3 h-3 mr-2 opacity-50" />
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent align="end" className="max-h-[300px]">
                                {monthOptions.map((group) => (
                                    <SelectGroup key={group.year}>
                                        <SelectLabel className="bg-muted/50 px-2 py-1 text-[10px] font-bold text-muted-foreground sticky top-0 backdrop-blur-sm">
                                            {group.year}
                                        </SelectLabel>
                                        {group.months.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0 h-[190px] w-full relative">
                    <ChartContainer config={chartConfig} className="w-full h-full absolute inset-0">
                        <BarChart data={processedData} margin={{ top: 15, right: 15, left: 15, bottom: 5 }} barGap={2}>
                            <defs>
                                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                                </linearGradient>
                                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.06} stroke="currentColor" />
                            <XAxis
                                dataKey="dayNumber"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                stroke="#888"
                                fontSize={10}
                                minTickGap={10}
                                interval="preserveStartEnd"
                                padding={{ left: 10, right: 10 }}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'currentColor', opacity: 0.04, radius: 6 }}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        className="w-[200px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl z-50 ring-1 ring-black/5"
                                        labelFormatter={(label) => {
                                            const item = processedData.find(p => p.dayNumber === Number(label));
                                            return (
                                                <span className="font-semibold text-foreground/80 mb-3 block border-b border-border/50 pb-2 text-xs tracking-wide uppercase">
                                                    {item ? formatDate(item.date) : `Tanggal ${label}`}
                                                </span>
                                            );
                                        }}
                                        formatter={(value, name) => (
                                            <div className="flex items-center text-xs w-full justify-between py-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-black",
                                                        name === 'income' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                                                    )} />
                                                    <span className="capitalize text-muted-foreground font-medium">
                                                        {name === 'income' ? 'Masuk' : 'Keluar'}
                                                    </span>
                                                </div>
                                                <span className={cn(
                                                    "font-mono font-bold tracking-tight text-sm",
                                                    name === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                )}>
                                                    {formatCurrency(Number(value))}
                                                </span>
                                            </div>
                                        )}
                                    />
                                }
                            />
                            <Bar
                                dataKey="income"
                                name="income"
                                fill="url(#incomeGradient)"
                                radius={[3, 3, 0, 0]}
                                maxBarSize={14}
                                animationDuration={1000}
                                animationEasing="ease-out"
                            />
                            <Bar
                                dataKey="expense"
                                name="expense"
                                fill="url(#expenseGradient)"
                                radius={[3, 3, 0, 0]}
                                maxBarSize={14}
                                animationDuration={1000}
                                animationEasing="ease-out"
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </motion.div>
    );
}
