"use client";

import { useMemo, useState } from "react";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsChart } from "@/components/finance/analytics-chart";
import { WealthSimulator } from "@/components/finance/wealth-simulator";
import { NetWorthCard } from "@/components/finance/net-worth-card";
import { SmartAdvisor } from "@/components/finance/smart-advisor";
import { AIInsightsWidget } from "@/components/analytics/ai-insights-widget";
import { AdvancedAnalytics } from "@/components/analytics/advanced-analytics";
import { FinancialHealthScore } from "@/components/analytics/financial-health-score";
import { SpendingHeatmap } from "@/components/analytics/spending-heatmap";
import { GoalsTrackerWidget } from "@/components/analytics/goals-tracker-widget";
import { SubscriptionTrackerWidget } from "@/components/analytics/subscription-tracker-widget";
import { AchievementsWidget } from "@/components/analytics/achievements-widget";
import { CategoryTrendWidget } from "@/components/analytics/category-trend-widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    ShieldCheck,
    TrendingUp,
    CalendarClock,
    Gem,
    Target,
    Activity,
    ArrowUpRight,
    ArrowDownLeft,
    AlertOctagon,
    Download,
    Calendar as CalendarIcon,
    Filter,
    Bot,
    Sparkles,
    Plus
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

// --- TYPES ---
interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: Date;
    category: string;
}

interface FinancialData {
    name: string;
    monthlyIncome: number;
    monthlyExpense: number;
    monthlyDebtPayment: number;
    totalCash: number;
    totalDebt: number;
    lastMonthExpense: number;
    history: { date: string, income: number, expense: number }[];
    topExpenseCategories: { name: string, amount: number, color?: string }[];
    anomalies: any[];
    dailySpending?: { day: string, amount: number }[];
    spendingPatterns?: any[];
    budgetComparison?: any[];
    cashFlowForecast?: any[];
    goals?: any[];
    subscriptions?: any[];
    categoryTrends?: any[];
}

export default function AnalyticsPageClient({
    financialData,
    currentMonth = new Date().getMonth() + 1,
    currentYear = new Date().getFullYear()
}: {
    financialData: FinancialData;
    currentMonth?: number;
    currentYear?: number;
}) {

    const [isAIAnalysisOpen, setIsAIAnalysisOpen] = useState(false);
    const router = useRouter();
    const { t, language } = useLanguage();

    const handleFilterChange = (value: string) => {
        // Value format: "MM-YYYY" or "current"
        if (value === "current") {
            router.push("/analytics");
            return;
        }
        const [m, y] = value.split("-");
        router.push(`/analytics?month=${m}&year=${y}`);
    };

    const monthNames = language === 'id'
        ? ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = monthNames[currentMonth - 1];

    const analysis = useMemo(() => {
        const { monthlyIncome, monthlyExpense, monthlyDebtPayment, totalCash, lastMonthExpense } = financialData;

        // Metrics
        const cashFlow = monthlyIncome - monthlyExpense;
        const savingsRate = monthlyIncome > 0 ? (cashFlow / monthlyIncome) * 100 : 0;
        const debtServiceRatio = monthlyIncome > 0 ? (monthlyDebtPayment / monthlyIncome) * 100 : 0;
        const emergencyCoverMonths = monthlyExpense > 0 ? totalCash / monthlyExpense : 0;
        const expenseGrowth = lastMonthExpense > 0 ? ((monthlyExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;
        const burnRateDaily = monthlyExpense / 30;

        // Logic Score
        const stamina = Math.min(100, Math.max(0, savingsRate * 3));
        const stress = Math.min(100, (debtServiceRatio * 2) + (expenseGrowth > 0 ? expenseGrowth : 0));
        const shield = Math.min(100, (emergencyCoverMonths / 6) * 100);

        let score = 100;
        if (savingsRate < 20) score -= 20;
        if (savingsRate < 10) score -= 10;
        if (debtServiceRatio > 30) score -= 15;
        if (emergencyCoverMonths < 3) score -= 15;
        if (expenseGrowth > 10) score -= 10;
        score = Math.max(0, Math.min(100, score));

        let mood: 'happy' | 'neutral' | 'sad' | 'panic' = 'neutral';
        if (score >= 80) mood = 'happy';
        else if (score >= 60) mood = 'neutral';
        else if (score >= 40) mood = 'sad';
        else mood = 'panic';

        const forecast = {
            canRetireIn: savingsRate > 50 ? "15 Tahun" : savingsRate > 20 ? "35 Tahun" : "Belum Terlihat",
            projectedSavingsYearly: cashFlow * 12
        };

        return {
            score, mood,
            metrics: { savingsRate, expenseGrowth, burnRateDaily, monthlySavings: cashFlow },
            companionMetrics: { stamina: Math.round(stamina), stress: Math.round(stress), shield: Math.round(shield) },
            forecast
        };
    }, [financialData]);

    // Extract categories name for Trends Widget
    const trendCategories = useMemo(() => {
        return financialData.categoryTrends && financialData.categoryTrends.length > 0
            ? Object.keys(financialData.categoryTrends[0]).filter(k => k !== 'month')
            : ["Makan", "Transport", "Belanja"];
    }, [financialData]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 md:p-8 font-sans">
            <div className="max-w-[1920px] mx-auto space-y-8">
                {/* HEADLINE */}
                <FadeIn>
                    <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {t('analytics.title')}
                            </h1>
                            <p className="text-muted-foreground text-sm max-w-lg mt-1">
                                {t('analytics.subtitle')} {financialData.name}.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                            <div className="flex items-center gap-2 mr-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800",
                                                !currentMonth && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {currentMonth ? `${currentMonthName} ${currentYear}` : <span>{t('common.selectMonth')}</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={new Date(currentYear, currentMonth - 1, 1)}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const m = date.getMonth() + 1;
                                                    const y = date.getFullYear();
                                                    handleFilterChange(`${m}-${y}`);
                                                }
                                            }}
                                            initialFocus
                                            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Button
                                onClick={() => setIsAIAnalysisOpen(true)}
                                variant="outline"
                                className="gap-2 h-10 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                            >
                                <Sparkles className="w-4 h-4 ml-0.5" />
                                {t('analytics.aiDeepAudit')}
                            </Button>

                            <Button
                                onClick={() => window.print()}
                                variant="outline"
                                className="gap-2 h-10 hidden sm:flex"
                            >
                                <Download className="w-4 h-4" />
                                {t('common.export')}
                            </Button>

                            <Link href="/goals">
                                <Button variant="outline" className="gap-2 h-10 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/20">
                                    <Target className="w-4 h-4 text-indigo-500" />
                                    {t('analytics.setGoals')}
                                </Button>
                            </Link>
                            <ThemeToggle />
                        </div>
                    </header>
                </FadeIn>

                {/* 1. KEY METRICS ROW */}
                <FadeIn delay={0.1}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Saldo - Main Card */}
                        <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[140px]">
                            <div className="absolute top-0 right-0 p-3 opacity-10"><Gem className="w-24 h-24" /></div>
                            <CardContent className="p-6 relative z-10">
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Total Sisa Saldo</p>
                                <h3 className="text-3xl font-black tracking-tight mb-2">
                                    Rp {(financialData.totalCash).toLocaleString('id-ID')}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                                        <ShieldCheck className="w-3 h-3" /> Protected
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Income */}
                        <Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-emerald-500/20 transition-all">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200">+12%</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pemasukan</p>
                                <h3 className="text-xl font-bold text-foreground">
                                    Rp {(financialData.monthlyIncome).toLocaleString('id-ID')}
                                </h3>
                            </CardContent>
                        </Card>

                        {/* Expense */}
                        <Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-rose-500/20 transition-all">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <Badge variant="outline" className="text-rose-600 bg-rose-50 dark:bg-rose-900/10 border-rose-200">+5%</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pengeluaran</p>
                                <h3 className="text-xl font-bold text-foreground">
                                    Rp {(financialData.monthlyExpense).toLocaleString('id-ID')}
                                </h3>
                            </CardContent>
                        </Card>

                        {/* Burn Rate */}
                        <Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:border-amber-500/20 transition-all">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                                        <CalendarClock className="w-4 h-4" />
                                    </div>
                                    <Badge variant="outline" className="text-amber-600 bg-amber-50 dark:bg-amber-900/10 border-amber-200">Daily</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Burn Rate / Hari</p>
                                <h3 className="text-xl font-bold text-foreground">
                                    Rp {(analysis.metrics.burnRateDaily / 1000).toFixed(0)}k
                                </h3>
                            </CardContent>
                        </Card>
                    </div>
                </FadeIn>

                {/* 1.5 SUMMARY DESCRIPTION */}
                <FadeIn delay={0.15}>
                    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Bot className="w-32 h-32 text-blue-600" /></div>
                        <CardContent className="p-6 relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Ringkasan Analisis Keuangan</h3>
                                <p className="text-sm md:text-base leading-relaxed text-blue-800/80 dark:text-blue-200/80">
                                    {(() => {
                                        const { monthlyIncome, monthlyExpense } = financialData;
                                        const { expenseGrowth, monthlySavings } = analysis.metrics;

                                        return `Bulan ini, Anda mencatat pemasukan sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(monthlyIncome)}. ` +
                                            `Pengeluaran Anda mencapai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(monthlyExpense)}, ` +
                                            `${expenseGrowth !== 0 ? `yang mengalami ${expenseGrowth > 0 ? 'kenaikan' : 'penurunan'} sebesar ${Math.abs(expenseGrowth).toFixed(1)}% dibandingkan bulan lalu.` : 'stabil dibandingkan bulan lalu.'} ` +
                                            `${monthlySavings >= 0 ? `Kabar baiknya, Anda memiliki surplus cash flow sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(monthlySavings)} yang bisa dialokasikan untuk tabungan atau investasi.` : `Perhatian diperlukan karena terjadi defisit sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(monthlySavings))}. Evaluasi kembali pengeluaran non-prioritas Anda.`}`
                                    })()}
                                </p>
                            </div>
                            <Button onClick={() => setIsAIAnalysisOpen(true)} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                                Lihat Detail Full
                            </Button>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* 2. MAIN SPLIT LAYOUT */}
                <FadeIn delay={0.2}>
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                        {/* --- LEFT COLUMN (MAIN CONTENT - 8 Cols) --- */}
                        <div className="xl:col-span-8 space-y-8">

                            {/* DEMO MODE BANNER - Show when no real data */}
                            {financialData.monthlyIncome === 0 && financialData.monthlyExpense === 0 && (
                                <Card className="border-2 border-amber-200 dark:border-amber-900 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Mode Preview - Data Contoh</h3>
                                                <p className="text-sm text-amber-800 dark:text-amber-200/80">
                                                    Ini adalah tampilan preview dengan data contoh. Mulai catat transaksi Anda untuk melihat analisis keuangan yang sebenarnya.
                                                </p>
                                            </div>
                                            <Link href="/transactions">
                                                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Mulai Sekarang
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* ADVANCED ANALYTICS (TABS) */}
                            <AdvancedAnalytics
                                topCategories={financialData.topExpenseCategories.length > 0 ? financialData.topExpenseCategories : [
                                    { name: "Makanan & Minuman", amount: 2500000 },
                                    { name: "Transportasi", amount: 1500000 },
                                    { name: "Belanja", amount: 1000000 }
                                ]}
                                monthlyExpense={financialData.monthlyExpense || 5000000}
                                budgetComparison={financialData.budgetComparison}
                                cashFlowForecast={financialData.cashFlowForecast}
                            />

                            {/* MAIN CHART */}
                            <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                                <CardHeader>
                                    <CardTitle>Arus Keuangan</CardTitle>
                                    <CardDescription>Visualisasi trend Pemasukan vs Pengeluaran (6 Bulan Terakhir)</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[400px]">
                                    <AnalyticsChart data={financialData.history.length > 0 ? financialData.history : [
                                        { date: "Sep 2024", income: 8000000, expense: 5000000 },
                                        { date: "Okt 2024", income: 8500000, expense: 5200000 },
                                        { date: "Nov 2024", income: 8200000, expense: 4800000 },
                                        { date: "Des 2024", income: 9000000, expense: 5500000 },
                                        { date: "Jan 2025", income: 8800000, expense: 5300000 },
                                        { date: "Feb 2025", income: 9200000, expense: 5100000 }
                                    ]} />
                                </CardContent>
                            </Card>

                            {/* CATEGORY TREND DEEP DIVE */}
                            <CategoryTrendWidget
                                data={financialData.categoryTrends}
                                categories={trendCategories}
                            />

                            {/* WEALTH SIMULATOR & NET WORTH */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <WealthSimulator
                                    recommendedSavings={Math.max(0, analysis.metrics.monthlySavings || 3000000)}
                                    initialCapital={financialData.totalCash || 10000000}
                                />
                                <NetWorthCard
                                    totalCash={financialData.totalCash || 10000000}
                                    totalDebt={financialData.totalDebt || 5000000}
                                />
                            </div>

                            {/* SMART ADVISOR IN MAIN FLOW */}
                            <SmartAdvisor financialData={{
                                monthlyIncome: financialData.monthlyIncome || 8000000,
                                monthlyExpense: financialData.monthlyExpense || 5000000,
                                totalCash: financialData.totalCash || 10000000,
                                totalDebt: financialData.totalDebt || 5000000,
                                monthlyDebtPayment: financialData.monthlyDebtPayment || 500000,
                                topExpenseCategories: financialData.topExpenseCategories.length > 0 ? financialData.topExpenseCategories : [
                                    { name: "Makanan & Minuman", amount: 2500000 },
                                    { name: "Transportasi", amount: 1500000 },
                                    { name: "Belanja", amount: 1000000 }
                                ]
                            }} />
                        </div>

                        {/* --- RIGHT COLUMN (SIDEBAR - 4 Cols) --- */}
                        <div className="xl:col-span-4 space-y-6">

                            {/* FINANCIAL HEALTH SCORE - PRIMARY WIDGET */}
                            <FinancialHealthScore />

                            {/* GAMIFICATION ACHIEVEMENTS */}
                            <AchievementsWidget />

                            {/* GOALS TRACKER */}
                            <GoalsTrackerWidget goals={financialData.goals} />

                            {/* DAILY SPENDING HEATMAP */}
                            <SpendingHeatmap data={(financialData.dailySpending && financialData.dailySpending.length > 0) ? financialData.dailySpending : [
                                { day: "1", amount: 150000 },
                                { day: "2", amount: 200000 },
                                { day: "3", amount: 180000 },
                                { day: "4", amount: 250000 },
                                { day: "5", amount: 300000 },
                                { day: "6", amount: 400000 },
                                { day: "7", amount: 350000 },
                                { day: "8", amount: 180000 },
                                { day: "9", amount: 220000 },
                                { day: "10", amount: 190000 },
                                { day: "11", amount: 280000 },
                                { day: "12", amount: 320000 },
                                { day: "13", amount: 450000 },
                                { day: "14", amount: 380000 },
                                { day: "15", amount: 200000 },
                                { day: "16", amount: 240000 },
                                { day: "17", amount: 210000 },
                                { day: "18", amount: 270000 },
                                { day: "19", amount: 310000 },
                                { day: "20", amount: 420000 },
                                { day: "21", amount: 360000 },
                                { day: "22", amount: 190000 },
                                { day: "23", amount: 230000 },
                                { day: "24", amount: 200000 },
                                { day: "25", amount: 260000 },
                                { day: "26", amount: 290000 },
                                { day: "27", amount: 410000 },
                                { day: "28", amount: 340000 }
                            ]} />

                            {/* SUBSCRIPTIONS TRACKER */}
                            <SubscriptionTrackerWidget subscriptions={financialData.subscriptions} />

                            {/* TOP EXPENSES WIDGET */}
                            <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Top Kategori</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(financialData.topExpenseCategories.length > 0 ? financialData.topExpenseCategories : [
                                        { name: "Makanan & Minuman", amount: 2500000 },
                                        { name: "Transportasi", amount: 1500000 },
                                        { name: "Belanja", amount: 1000000 }
                                    ]).map((cat, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{cat.name}</span>
                                                <span className="font-bold">Rp {(cat.amount / 1000).toFixed(0)}k</span>
                                            </div>
                                            <Progress value={(cat.amount / (financialData.monthlyExpense || 5000000)) * 100} className="h-2" indicatorColor={['bg-rose-500', 'bg-orange-500', 'bg-amber-500'][i] || 'bg-slate-500'} />
                                            <p className="text-[10px] text-muted-foreground text-right">{((cat.amount / (financialData.monthlyExpense || 5000000)) * 100).toFixed(1)}%</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* ANOMALIES WIDGET */}
                            <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-rose-600 text-base">
                                        <AlertOctagon className="w-4 h-4" />
                                        Anomali
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {financialData.anomalies.length > 0 ? (
                                        financialData.anomalies.slice(0, 3).map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between p-2.5 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/20">
                                                <div className="flex-1 min-w-0 mr-2">
                                                    <p className="font-bold text-xs text-foreground truncate">{tx.description}</p>
                                                    <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString('id-ID')}</p>
                                                </div>
                                                <p className="font-bold text-rose-600 text-xs whitespace-nowrap">Rp {(tx.amount / 1000).toFixed(0)}k</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-muted-foreground">
                                            <CheckCircle className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                                            <p className="text-xs">Aman.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </FadeIn>
            </div>

            {/* AI DEEP ANALYSIS MODAL */}
            <Dialog open={isAIAnalysisOpen} onOpenChange={setIsAIAnalysisOpen}>
                <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-zinc-950 border-zinc-800">
                    <div className="flex-1 overflow-y-auto">
                        {/* HERO HEADER */}
                        <div className="relative bg-zinc-900 border-b border-white/5 p-8 pb-12 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-zinc-950" />
                            <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl bg-indigo-500 rounded-full w-64 h-64" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                                        AI Generated Report • {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-3xl font-bold text-white mb-2">Deep Financial Audit</DialogTitle>
                                <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
                                    Berdasarkan analisis data, kondisi keuangan Anda berada di level <span className={cn("font-semibold", analysis.score >= 80 ? "text-emerald-400" : analysis.score >= 50 ? "text-amber-400" : "text-rose-400")}>
                                        {analysis.score >= 80 ? "Sangat Sehat" : analysis.score >= 50 ? "Cukup Sehat" : "Waspada"} ({analysis.score}/100)
                                    </span>.
                                    {financialData.topExpenseCategories.length > 0 ? (
                                        <> Perhatian khusus pada kategori <span className="text-white font-medium">{financialData.topExpenseCategories[0].name}</span> yang mendominasi pengeluaran.</>
                                    ) : " Belum ada data pengeluaran yang signifikan."}
                                </p>
                            </div>
                        </div>

                        {/* REPORT CONTENT */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 -mt-8 relative z-20">

                            {/* LEFT COLUMN: KEY METRICS */}
                            <div className="md:col-span-1 space-y-6">
                                <Card className="bg-zinc-900/80 backdrop-blur-md border-zinc-800 shadow-xl">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Score Card</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2 text-white">
                                                <span>Stamina (Savings)</span>
                                                <span className={analysis.companionMetrics.stamina >= 70 ? "text-emerald-400" : "text-amber-400"}>{analysis.companionMetrics.stamina}/100</span>
                                            </div>
                                            <Progress value={analysis.companionMetrics.stamina} className="h-2" indicatorColor={analysis.companionMetrics.stamina >= 70 ? "bg-emerald-500" : "bg-amber-500"} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2 text-white">
                                                <span>Stress (Debt/Exp)</span>
                                                <span className={analysis.companionMetrics.stress < 30 ? "text-emerald-400" : "text-rose-400"}>{analysis.companionMetrics.stress}/100</span>
                                            </div>
                                            <Progress value={analysis.companionMetrics.stress} className="h-2" indicatorColor={analysis.companionMetrics.stress < 30 ? "bg-emerald-500" : "bg-rose-500"} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2 text-white">
                                                <span>Shield (Emergency)</span>
                                                <span className="text-indigo-400">{analysis.companionMetrics.shield}/100</span>
                                            </div>
                                            <Progress value={analysis.companionMetrics.shield} className="h-2" indicatorColor="bg-indigo-500" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-indigo-950/30 border-indigo-500/20">
                                    <CardContent className="p-5">
                                        <h4 className="flex items-center gap-2 font-semibold text-indigo-200 mb-3">
                                            <Target className="w-4 h-4" />
                                            Fokus Utama
                                        </h4>
                                        <ul className="text-sm space-y-3 text-indigo-200/80">
                                            {financialData.topExpenseCategories.slice(0, 2).map((cat, idx) => (
                                                <li key={idx} className="flex gap-2">
                                                    <span className="text-indigo-500">•</span>
                                                    Kontrol {cat.name} ({(cat.amount / financialData.monthlyExpense * 100).toFixed(0)}%).
                                                </li>
                                            ))}
                                            {financialData.monthlyIncome - financialData.monthlyExpense < 0 && (
                                                <li className="flex gap-2 text-rose-300">
                                                    <span className="text-rose-500">•</span>
                                                    FATAL: Cashflow Negatif!
                                                </li>
                                            )}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* RIGHT COLUMN: DETAILED ANALYSIS */}
                            <div className="md:col-span-2 space-y-6">
                                {/* SECTION 1 */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-rose-500" />
                                        Analisis Pengeluaran
                                    </h3>
                                    <p className="text-zinc-400 leading-relaxed text-sm">
                                        {financialData.topExpenseCategories.length > 0 ? (
                                            <>
                                                Kategori terbesar bulan ini adalah <span className="text-white font-medium">{financialData.topExpenseCategories[0].name}</span> dengan total
                                                <span className="text-white font-medium"> Rp {(financialData.topExpenseCategories[0].amount).toLocaleString('id-ID')}</span>.
                                                Ini menghabiskan <strong>{((financialData.topExpenseCategories[0].amount / financialData.monthlyExpense) * 100).toFixed(1)}%</strong> dari total pengeluaran Anda.
                                            </>
                                        ) : "Data pengeluaran belum cukup untuk dianalisis."}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                                            <p className="text-xs text-zinc-500 mb-1">Burn Rate Harian</p>
                                            <p className="text-lg font-bold text-white">Rp {(analysis.metrics.burnRateDaily).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                                            <p className="text-xs text-zinc-500 mb-1">Status Cashflow</p>
                                            <p className={cn("text-lg font-bold", analysis.metrics.monthlySavings >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                                {analysis.metrics.monthlySavings >= 0 ? "Surplus" : "Defisit"}
                                                <span className="text-sm ml-1 opacity-70">
                                                    (Rp {Math.abs(analysis.metrics.monthlySavings).toLocaleString('id-ID')})
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-zinc-800" />

                                {/* SECTION 3 */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-indigo-500" />
                                        Rekomendasi Cerdas
                                    </h3>
                                    <div className="space-y-3">
                                        {/* Dynamic Recommendation 1: Cash Surplus */}
                                        {financialData.totalCash > financialData.monthlyExpense * 3 && (
                                            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-zinc-900 border border-emerald-500/10 flex gap-4">
                                                <div className="mt-1 bg-emerald-500/20 p-2 rounded-lg h-fit text-emerald-400">
                                                    <Gem className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-emerald-100 text-sm">Optimasi Dana Menganggur</h5>
                                                    <p className="text-xs text-zinc-400 mt-1">
                                                        Saldo kas Anda ({financialData.totalCash.toLocaleString('id-ID')}) cukup sehat (&gt;3x pengeluaran). Pertimbangkan memindahkan 40% ke instrumen investasi moderat.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dynamic Recommendation 2: Debt Warning */}
                                        {analysis.companionMetrics.stress > 50 && (
                                            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/30 to-zinc-900 border border-rose-500/10 flex gap-4">
                                                <div className="mt-1 bg-rose-500/20 p-2 rounded-lg h-fit text-rose-400">
                                                    <AlertOctagon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-rose-100 text-sm">Waspada Utang Tinggi</h5>
                                                    <p className="text-xs text-zinc-400 mt-1">
                                                        Rasio utang/stress Anda tinggi. Stop utang baru dan fokus pelunasan utang berbunga tinggi segera.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/30 to-zinc-900 border border-indigo-500/10 flex gap-4">
                                            <div className="mt-1 bg-indigo-500/20 p-2 rounded-lg h-fit text-indigo-400">
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-indigo-100 text-sm">Target Pensiun</h5>
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    {analysis.forecast.canRetireIn !== "Belum Terlihat"
                                                        ? `Dengan pola saat ini, estimasi pensiun dini dalam ${analysis.forecast.canRetireIn}.`
                                                        : "Tingkatkan rasio tabungan minimal ke 20% untuk mulai melihat proyeksi pensiun."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
