"use client";

import { useState, useEffect } from "react";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Printer, ArrowUpRight, ArrowDownRight, ArrowRight,
    Filter, Wallet, Sparkles, TrendingUp, TrendingDown,
    Calendar, Download, Bot, History, X, CheckCircle2, FileText
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getReportData } from "@/lib/actions/reports";
import { toast } from "sonner";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ReportsPageClient({ initialData }: { initialData: any }) {
    const [data, setData] = useState(initialData);
    const [period, setPeriod] = useState("this-month");
    const [reportType, setReportType] = useState("all");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(6);

    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(val);

    const formatShort = (val: number) => new Intl.NumberFormat("id-ID", {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(val);

    // Fetch data when filters change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const newData = await getReportData(period, reportType);
                setData(newData);
            } catch (err) {
                toast.error("Gagal memuat data laporan");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period, reportType]);

    // Data Processing for Chart
    const chartData = data?.transactions?.reduce((acc: any[], curr: any) => {
        const date = new Date(curr.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const existing = acc.find(item => item.date === date);
        if (existing) {
            existing[curr.type] = (existing[curr.type] || 0) + curr.amount;
        } else {
            acc.push({ date, income: curr.type === 'income' ? curr.amount : 0, expense: curr.type === 'expense' ? curr.amount : 0, fullDate: curr.date });
        }
        return acc;
    }, []).sort((a: any, b: any) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()) || [];

    const handlePrint = () => window.print();

    if (!data) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    const { summary, transactions, aiAnalysis } = data;

    return (
        <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0A0A0B] p-6 lg:p-10 font-sans selection:bg-indigo-500/30">
            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body * { visibility: hidden; }
                    #printable-overlay, #printable-overlay * { visibility: visible !important; }
                    #printable-overlay { position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; z-index: 99999; background: white; padding: 0; margin: 0; display: block !important; }
                    #printable-paper { position: absolute; left: 0; top: 0; width: 210mm; min-height: 297mm; margin: 0; padding: 20mm; box-shadow: none !important; transform: none !important; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className={`max-w-[1400px] mx-auto space-y-8 no-print ${isPreviewOpen ? 'hidden' : ''}`}>

                {/* 1. HERO SECTION & CONTROLS */}
                <FadeIn>
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" /> Financial Intelligence
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                                Monthly<br /><span className="text-indigo-600 dark:text-indigo-400">Insights.</span>
                            </h1>
                        </div>

                        {/* Floater Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white dark:bg-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-2 px-2">
                                <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-full">
                                    <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </div>
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger className="w-[140px] border-none bg-transparent shadow-none focus:ring-0 font-bold text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="this-month">Bulan Ini</SelectItem>
                                        <SelectItem value="last-month">Bulan Lalu</SelectItem>
                                        <SelectItem value="this-year">Tahun Ini</SelectItem>
                                        <SelectItem value="all">Semua Waktu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-[1px] h-10 bg-slate-100 dark:bg-white/10 hidden sm:block" />
                            <div className="flex items-center gap-2 px-2">
                                <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-full">
                                    <Filter className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </div>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger className="w-[130px] border-none bg-transparent shadow-none focus:ring-0 font-bold text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tipe</SelectItem>
                                        <SelectItem value="income">Pemasukan</SelectItem>
                                        <SelectItem value="expense">Pengeluaran</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => setIsPreviewOpen(true)} className="rounded-2xl h-10 px-6 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black">
                                <Printer className="w-4 h-4 mr-2" />
                                Report
                            </Button>
                        </div>
                    </div>
                </FadeIn>

                {/* 2. BENTO GRID DASHBOARD */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* MAIN STATS CARD (Large) */}
                    <FadeIn delay={0.1} className="md:col-span-8 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2.5rem] blur-3xl opacity-50 dark:opacity-20 group-hover:opacity-75 transition-opacity" />
                        <Card className="h-full border-none shadow-none bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] relative overflow-hidden ring-1 ring-white/20 dark:ring-white/10">
                            <CardContent className="p-8 h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Net Cashflow</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Periode terpilih</p>
                                        </div>
                                    </div>
                                    <h2 className={cn("text-6xl font-black tracking-tighter", summary.netCashFlow >= 0 ? "text-slate-900 dark:text-white" : "text-rose-500")}>
                                        {formatShort(summary.netCashFlow)}
                                    </h2>
                                    <p className="mt-2 text-lg font-medium text-slate-500 dark:text-slate-400">
                                        Total Saldo Bersih
                                    </p>
                                </div>

                                {/* Chart within the card for sleek look */}
                                <div className="h-[200px] w-full mt-6 -mb-4 -mx-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-slate-900 text-white text-xs rounded-lg py-1 px-3 font-bold shadow-xl">
                                                                {payload[0].payload.date}: {formatShort(payload[0].value as number)}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey={summary.netCashFlow >= 0 ? "income" : "expense"}
                                                stroke="#6366f1"
                                                strokeWidth={4}
                                                fill="url(#chartGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>

                    {/* SECONDARY STATS (Column) */}
                    <div className="md:col-span-4 flex flex-col gap-6">
                        <FadeIn delay={0.2}>
                            <Card className="border-none bg-emerald-500 text-white rounded-[2.5rem] shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-20"><ArrowUpRight className="w-24 h-24 -mr-8 -mt-8" /></div>
                                <CardContent className="p-8 relative z-10">
                                    <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-1">Pemasukan</p>
                                    <p className="text-3xl font-black">{formatShort(summary.totalIncome)}</p>
                                </CardContent>
                            </Card>
                        </FadeIn>
                        <FadeIn delay={0.3}>
                            <Card className="border-none bg-rose-500 text-white rounded-[2.5rem] shadow-xl shadow-rose-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-20"><ArrowDownRight className="w-24 h-24 -mr-8 -mt-8" /></div>
                                <CardContent className="p-8 relative z-10">
                                    <p className="text-rose-100 font-bold uppercase tracking-widest text-xs mb-1">Pengeluaran</p>
                                    <p className="text-3xl font-black">{formatShort(summary.totalExpense)}</p>
                                </CardContent>
                            </Card>
                        </FadeIn>
                        <FadeIn delay={0.4} className="flex-1">
                            <Card className="h-full border-none bg-indigo-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden flex items-center p-6">
                                <div className="flex gap-4 items-center">
                                    <div className="p-3 bg-white/10 rounded-full">
                                        <Bot className="w-6 h-6 text-indigo-300" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">AI Assistant</p>
                                        <p className="text-sm font-medium leading-snug line-clamp-2">
                                            {aiAnalysis ? "Analisis siap! Klik cetak untuk detail." : "Data belum cukup."}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </FadeIn>
                    </div>

                </div>

                {/* 3. MODERN LIST SECTION */}
                <FadeIn delay={0.5}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* LEFT: CHART DETAIL */}
                        <div className="lg:col-span-2 p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-500" /> Activity Trend
                                </h3>
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Income</Badge>
                                    <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-200">Expense</Badge>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradInc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(v) => formatShort(v)} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }}
                                            itemStyle={{ color: 'white' }}
                                        />
                                        <Area type="natural" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#gradInc)" />
                                        <Area type="natural" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fill="url(#gradExp)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* RIGHT: TIMELINE FEED */}
                        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                            <h3 className="text-lg font-bold mb-6 px-2 flex items-center justify-between">
                                <span>Recent <span className="text-slate-400">Feed</span></span>
                                <History className="w-4 h-4 text-slate-400" />
                            </h3>

                            <div className="space-y-6 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-100 dark:bg-zinc-800 rounded-full" />

                                {transactions.slice(0, displayLimit).map((tx: any, i: number) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={i}
                                        className="relative flex gap-4 items-start group"
                                    >
                                        <div className={cn(
                                            "z-10 w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                            tx.type === 'income' ? "bg-emerald-500 text-white" : "bg-white text-rose-500 border-rose-100"
                                        )}>
                                            {tx.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{tx.description}</p>
                                                <span className={cn("text-sm font-black whitespace-nowrap", tx.type === 'income' ? "text-emerald-600" : "text-slate-900 dark:text-slate-400")}>
                                                    {tx.type === 'income' ? '+' : ''}{formatShort(tx.amount)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {displayLimit < transactions.length && (
                                <Button variant="ghost" className="w-full mt-6 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800" onClick={() => setDisplayLimit(p => p + 5)}>
                                    View More
                                </Button>
                            )}
                        </div>
                    </div>
                </FadeIn>

            </div>

            {/* PRINT OVERLAY (PRESERVED) */}
            {(isPreviewOpen || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
                <div id="printable-overlay" className="fixed inset-0 z-[9999] bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-start overflow-auto animate-in fade-in duration-200">
                    {/* Header Toolbar */}
                    <div className="sticky top-0 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center no-print z-50">
                        <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}><X className="mr-2 h-4 w-4" /> Close</Button>
                        <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white"><Printer className="mr-2 h-4 w-4" /> Print to PDF</Button>
                    </div>

                    <div id="printable-paper" className="bg-white text-black shadow-2xl m-8 p-[8mm] w-[210mm] min-h-[297mm] mx-auto origin-top transition-transform scale-100 xl:scale-95">

                        {/* HEADER - SIDE BY SIDE */}
                        <div className="flex justify-between items-start pb-2 mb-3 border-b-2 border-black">
                            <div>
                                <h1 className="text-lg font-bold mb-0">FINANCEMY</h1>
                                <p className="text-xs font-bold">Laporan Keuangan</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-600">Periode:</p>
                                <p className="text-xs font-bold">{period.replace('-', ' ').toUpperCase()}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Tanggal: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* SUMMARY BOXES */}
                        <div className="mb-3">
                            <h3 className="text-[11px] font-bold mb-1.5 uppercase">Ringkasan</h3>
                            <div className="grid grid-cols-4 gap-1.5">
                                <div className="border-2 border-gray-300 p-1.5 bg-gray-50">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-0.5">Periode</p>
                                    <p className="text-xs font-bold capitalize">{period.replace('-', ' ')}</p>
                                </div>
                                <div className="border-2 border-green-400 p-1.5 bg-green-50">
                                    <p className="text-[9px] font-bold text-green-700 uppercase mb-0.5">Pemasukan</p>
                                    <p className="text-xs font-bold text-green-700">{formatCurrency(summary.totalIncome)}</p>
                                </div>
                                <div className="border-2 border-red-400 p-1.5 bg-red-50">
                                    <p className="text-[9px] font-bold text-red-700 uppercase mb-0.5">Pengeluaran</p>
                                    <p className="text-xs font-bold text-red-700">{formatCurrency(summary.totalExpense)}</p>
                                </div>
                                <div className="border-2 border-black p-1.5 bg-gray-200">
                                    <p className="text-[9px] font-bold uppercase mb-0.5">Saldo Bersih</p>
                                    <p className="text-xs font-bold">{formatCurrency(summary.netCashFlow)}</p>
                                </div>
                            </div>
                        </div>

                        {/* FINANCIAL OVERVIEW */}
                        {aiAnalysis && (
                            <div className="mb-3 p-1.5 border-2 border-gray-400 bg-gray-50">
                                <p className="text-[10px] font-bold mb-1 uppercase">Catatan:</p>
                                <p className="text-[10px] leading-relaxed text-justify">
                                    {aiAnalysis.replace(/[*_#`]/g, '').trim()}
                                </p>
                            </div>
                        )}

                        {/* TRANSACTION TABLE */}
                        <div className="mb-3">
                            <h3 className="text-[11px] font-bold mb-1.5 uppercase">Rincian Transaksi</h3>
                            <table className="w-full text-[9px] border-collapse border-2 border-black">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-black p-1 text-left font-bold w-10">No.</th>
                                        <th className="border border-black p-1 text-left font-bold w-18">Tanggal</th>
                                        <th className="border border-black p-1 text-left font-bold">Keterangan</th>
                                        <th className="border border-black p-1 text-left font-bold w-20">Kategori</th>
                                        <th className="border border-black p-1 text-right font-bold w-22">Pemasukan</th>
                                        <th className="border border-black p-1 text-right font-bold w-22">Pengeluaran</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, 12).map((tx: any, i: number) => (
                                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                            <td className="border border-black p-1 text-center">{i + 1}</td>
                                            <td className="border border-black p-1 font-mono text-[8px]">
                                                {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                            </td>
                                            <td className="border border-black p-1">
                                                {tx.description}
                                            </td>
                                            <td className="border border-black p-1 text-[8px] uppercase">
                                                {tx.category}
                                            </td>
                                            <td className="border border-black p-1 text-right font-mono">
                                                {tx.type === 'income' ? formatCurrency(tx.amount) : '-'}
                                            </td>
                                            <td className="border border-black p-1 text-right font-mono">
                                                {tx.type === 'expense' ? formatCurrency(tx.amount) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* TOTAL ROW */}
                                    <tr className="bg-gray-200 font-bold">
                                        <td colSpan={4} className="border-2 border-black p-1 text-right uppercase text-[9px]">
                                            TOTAL
                                        </td>
                                        <td className="border-2 border-black p-1 text-right font-mono text-green-700 text-[9px]">
                                            {formatCurrency(summary.totalIncome)}
                                        </td>
                                        <td className="border-2 border-black p-1 text-right font-mono text-red-700 text-[9px]">
                                            {formatCurrency(summary.totalExpense)}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-300 font-bold">
                                        <td colSpan={4} className="border-2 border-black p-1 text-right uppercase text-[9px]">
                                            SALDO BERSIH
                                        </td>
                                        <td colSpan={2} className="border-2 border-black p-1 text-right font-mono text-xs">
                                            {formatCurrency(summary.netCashFlow)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>



                        {/* FOOTER */}
                        <div className="mt-3 pt-2 border-t border-gray-400">
                            <div className="flex justify-between items-end">
                                <div className="text-[8px] text-gray-500">
                                    <p>Dokumen ini dibuat secara otomatis oleh sistem</p>
                                    <p className="font-mono mt-0.5">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] mb-4">Mengetahui,</p>
                                    <div className="border-t-2 border-black w-24 pt-0.5">
                                        <p className="text-[8px] font-bold">Tanda Tangan & Nama</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
