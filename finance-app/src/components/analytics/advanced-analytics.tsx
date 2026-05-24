"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
    PieChart,
    BarChart3,
    AlertCircle,
    CheckCircle2,
    Target,
    Zap
} from "lucide-react";

interface SpendingPattern {
    category: string;
    avgAmount: number;
    frequency: number;
    trend: "up" | "down" | "stable";
    percentage: number;
}

interface BudgetItem {
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
    status: "over" | "under" | "on-track";
}

interface CashFlowForecast {
    month: string;
    projected: number;
    confidence: number;
}

export function AdvancedAnalytics({
    topCategories = [],
    monthlyExpense = 0,
    budgetComparison = [],
    cashFlowForecast = []
}: {
    topCategories?: { name: string, amount: number }[],
    monthlyExpense?: number,
    budgetComparison?: BudgetItem[],
    cashFlowForecast?: CashFlowForecast[]
}) {
    const [activeTab, setActiveTab] = useState("patterns");

    // Dynamic Data for Spending Patterns
    const spendingPatterns: SpendingPattern[] = topCategories.length > 0 ? topCategories.map((cat) => ({
        category: cat.name,
        avgAmount: cat.amount,
        frequency: Math.floor(cat.amount / 50000) || 1, // Estimate
        trend: "stable",
        percentage: monthlyExpense > 0 ? Math.round((cat.amount / monthlyExpense) * 100) : 0
    })) : [];

    const getTrendIcon = (trend: string) => {
        if (trend === "up") return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (trend === "down") return <TrendingDown className="w-4 h-4 text-green-500" />;
        return <div className="w-4 h-4 rounded-full bg-slate-300" />;
    };

    const getStatusBadge = (status: string) => {
        if (status === "over") return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Over Budget</Badge>;
        if (status === "under") return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Under Budget</Badge>;
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">On Track</Badge>;
    };

    return (
        <Card className="border-none shadow-xl bg-white dark:bg-zinc-900">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-indigo-500" />
                            Advanced Analytics
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Deep insights into your financial behavior and trends
                        </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Powered
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-3 w-full bg-slate-100 dark:bg-slate-800 p-1">
                        <TabsTrigger value="patterns" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                            <PieChart className="w-4 h-4 mr-2" />
                            Spending Patterns
                        </TabsTrigger>
                        <TabsTrigger value="budget" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                            <Target className="w-4 h-4 mr-2" />
                            Budget vs Actual
                        </TabsTrigger>
                        <TabsTrigger value="forecast" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                            <Calendar className="w-4 h-4 mr-2" />
                            Cash Flow Forecast
                        </TabsTrigger>
                    </TabsList>

                    {/* Spending Patterns Tab */}
                    <TabsContent value="patterns" className="space-y-4">
                        <div className="grid gap-4">
                            {spendingPatterns.map((pattern, index) => (
                                <Card key={index} className="border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">{pattern.category}</h4>
                                                    <p className="text-xs text-slate-500">{pattern.frequency} transactions/month</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold">Rp {pattern.avgAmount.toLocaleString('id-ID')}</p>
                                                <div className="flex items-center gap-1 justify-end">
                                                    {getTrendIcon(pattern.trend)}
                                                    <span className="text-xs text-slate-500">{pattern.trend}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Percentage of total</span>
                                                <span className="font-medium">{pattern.percentage}%</span>
                                            </div>
                                            <Progress value={pattern.percentage} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">AI Insight</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Your food expenses have increased by 25% compared to last month. Consider meal planning to reduce costs.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Budget vs Actual Tab */}
                    <TabsContent value="budget" className="space-y-4">
                        <div className="grid gap-4">
                            {budgetComparison.map((item, index) => (
                                <Card key={index} className="border border-slate-200 dark:border-slate-800">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-sm">{item.category}</h4>
                                                {getStatusBadge(item.status)}
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${item.variance > 0 ? 'text-red-600' : item.variance < 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                                    {item.variance > 0 ? '+' : ''}{item.variance.toLocaleString('id-ID')}
                                                </p>
                                                <p className="text-xs text-slate-500">variance</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Budgeted</p>
                                                <p className="text-sm font-semibold">Rp {item.budgeted.toLocaleString('id-ID')}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Actual</p>
                                                <p className="text-sm font-semibold">Rp {item.actual.toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                        <Progress
                                            value={(item.actual / item.budgeted) * 100}
                                            className="h-2"
                                            indicatorColor={item.status === "over" ? "bg-red-500" : item.status === "under" ? "bg-green-500" : "bg-blue-500"}
                                        />
                                        <p className="text-xs text-slate-500 mt-1 text-right">
                                            {((item.actual / item.budgeted) * 100).toFixed(1)}% of budget
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Budget Performance</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            You're doing well! 60% of categories are under budget. Keep up the good work.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Cash Flow Forecast Tab */}
                    {/* Cash Flow Forecast Tab */}
                    <TabsContent value="forecast" className="space-y-4">
                        {/* Visual Chart */}
                        <div className="h-[200px] flex items-end justify-between gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            {cashFlowForecast.map((forecast, i) => {
                                const maxVal = Math.max(...cashFlowForecast.map(f => f.projected), 1);
                                const height = Math.max(10, (forecast.projected / maxVal) * 100);
                                return (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                                        <div className="text-[10px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white dark:bg-zinc-800 px-1 rounded shadow-sm z-10">
                                            {forecast.projected.toLocaleString('id-ID')}
                                        </div>
                                        <div
                                            className="w-full bg-purple-500/20 hover:bg-purple-500/40 rounded-t-md transition-all relative overflow-hidden"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute bottom-0 left-0 w-full bg-purple-500" style={{ height: '4px' }} />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground truncate w-full text-center">{forecast.month.split(" ")[0]}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="grid gap-3">
                            {cashFlowForecast.map((forecast, index) => (
                                <Card key={index} className="border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                    <Calendar className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">{forecast.month}</h4>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-purple-600">
                                                    Rp {forecast.projected.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                <span>Akurasi Prediksi</span>
                                                <span>{forecast.confidence}%</span>
                                            </div>
                                            <Progress value={forecast.confidence} className="h-1.5" indicatorColor={forecast.confidence > 85 ? "bg-green-500" : forecast.confidence > 75 ? "bg-yellow-500" : "bg-orange-500"} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Forecast Insight</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Estimasi total surplus 6 bulan ke depan: <span className="font-bold text-purple-600">Rp {(cashFlowForecast.reduce((acc, curr) => acc + curr.projected, 0) / 1000000).toFixed(1)} Juta</span>.
                                            Angka ini dihitung berdasarkan rata-rata cashflow 3 bulan terakhir dengan asumsi inflasi 2%.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
