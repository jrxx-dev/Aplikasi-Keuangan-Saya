"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { WidgetColorPicker } from "./widget-color-picker";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";

interface AverageExpenseChartWidgetProps {
    data?: {
        history: { month: string; income: number; expense: number }[];
        dailyHistory?: { date: string; type: "income" | "expense"; total: number }[];
    };
}

export function AverageExpenseChartWidget({ data }: AverageExpenseChartWidgetProps) {
    const { themes } = useWidgetTheme();
    const theme = themes["average-expense"] || { primary: "#db2777", secondary: "#f472b6", accent: "#be185d", gradient: "from-pink-400 to-pink-600" };

    const dailyHistory = data?.dailyHistory || [];
    const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

    // Navigation handlers
    const nextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
    const prevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));

    // Filter data for current week
    const weeklyData = useMemo(() => {
        const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
        const days = [];

        // Generate all 7 days for the week
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(currentWeekStart.getDate() + i);
            const dateStr = format(dayDate, "yyyy-MM-dd");

            // Find existing data for this day
            const dayData = dailyHistory.find(d => d.date === dateStr && d.type === "expense");

            days.push({
                date: dateStr,
                dayName: format(dayDate, "EEE", { locale: id }), // Mon, Tue, etc.
                fullDate: format(dayDate, "d MMM", { locale: id }),
                expense: dayData ? dayData.total : 0
            });
        }
        return days;
    }, [currentWeekStart, dailyHistory]);

    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(val);

    const weekRangeLabel = `${format(currentWeekStart, "d MMM", { locale: id })} - ${format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "d MMM", { locale: id })}`;

    return (
        <Card
            className="h-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg group hover:scale-[1.01] transition-all rounded-3xl relative overflow-hidden flex flex-col"
            style={{
                borderColor: `${theme.primary}20`,
            }}
        >
            <CardHeader className="pb-2 relative z-10 shrink-0">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Grafik Pengeluaran Harian</CardTitle>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prevWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-[10px] font-medium min-w-[80px] text-center">{weekRangeLabel}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={nextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <WidgetColorPicker widgetId="average-expense" widgetName="Grafik Pengeluaran" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 flex-1 min-h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                        <XAxis
                            dataKey="dayName"
                            hide={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#888' }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: theme.primary, opacity: 0.1 }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-muted-foreground">{payload[0].payload.fullDate}</span>
                                                <span className="font-bold text-rose-500">{formatCurrency(payload[0].value as number)}</span>
                                            </div>
                                        </div>
                                    )
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="expense"
                            fill={theme.primary}
                            radius={[4, 4, 4, 4]}
                            fillOpacity={0.8}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>

            <CardFooter className="pt-0 text-[10px] text-muted-foreground flex justify-between items-center relative z-10 mt-auto shrink-0">
                <span>{weeklyData.reduce((acc, curr) => acc + curr.expense, 0) > 0 ? `Total: ${formatCurrency(weeklyData.reduce((acc, curr) => acc + curr.expense, 0))}` : "Tidak ada data"}</span>
            </CardFooter>
        </Card>
    );
}
