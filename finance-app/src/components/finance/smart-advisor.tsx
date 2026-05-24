"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    PiggyBank,
    CreditCard,
    Scissors,
    AlertTriangle,
    CheckCircle2,
    Target,
    Zap,
    Info,
    ShieldCheck
} from "lucide-react";

interface SmartAdvisorProps {
    financialData: {
        monthlyIncome: number;
        monthlyExpense: number;
        totalCash: number;
        totalDebt: number;
        monthlyDebtPayment: number;
        topExpenseCategories: { name: string, amount: number }[];
    }
}

export function SmartAdvisor({ financialData }: SmartAdvisorProps) {
    const { monthlyIncome, monthlyExpense, totalCash, totalDebt, topExpenseCategories } = financialData;

    // --- 1. SAVINGS LOGIC (50/30/20 Rule) ---
    const hasIncome = monthlyIncome > 0;
    const incomeBase = hasIncome ? monthlyIncome : 0;

    const needs = incomeBase * 0.5;
    const wants = incomeBase * 0.3;
    const savingsTarget = incomeBase * 0.2;

    // Emergency Fund status
    const hasExpense = monthlyExpense > 0;
    const expenseBase = hasExpense ? monthlyExpense : 1000000;
    const emergencyFundTarget = expenseBase * 6;

    const emergencyFundProgress = emergencyFundTarget > 0
        ? Math.min(100, (totalCash / emergencyFundTarget) * 100)
        : 0;

    // --- 2. DEBT LOGIC ---
    const [extraPayment, setExtraPayment] = useState(0);
    const estimatedInterestRate = 0.025;
    const minPayment = financialData.monthlyDebtPayment || (totalDebt * 0.1);
    const totalMonthlyPayment = minPayment + extraPayment;

    const monthsToPayOff = totalDebt > 0 && totalMonthlyPayment > (totalDebt * estimatedInterestRate)
        ? Math.ceil(Math.log(totalMonthlyPayment / (totalMonthlyPayment - totalDebt * estimatedInterestRate)) / Math.log(1 + estimatedInterestRate))
        : 0;

    const isValidDebtPayoff = totalDebt > 0 && totalMonthlyPayment > (totalDebt * estimatedInterestRate);

    // --- 3. EXPENSE DETOX LOGIC ---
    const discretionaryKeywords = ["makan", "food", "jajan", "café", "hiburan", "entertainment", "belanja", "shopping", "hobi", "game"];
    const potentialLeaks = topExpenseCategories.filter(cat =>
        discretionaryKeywords.some(keyword => cat.name.toLowerCase().includes(keyword))
    );

    const [cutPercentage, setCutPercentage] = useState(10);
    const potentialSavings = potentialLeaks.reduce((acc, curr) => acc + curr.amount, 0) * (cutPercentage / 100);

    return (
        <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                        <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold">
                            Smart Financial Advisor
                        </CardTitle>
                        <CardDescription>
                            Strategi cerdas yang dipersonalisasi untuk Anda
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue="savings" className="w-full">
                    <div className="px-6 border-b border-slate-100 dark:border-zinc-800">
                        <TabsList className="h-14 w-full justify-start gap-8 bg-transparent p-0">
                            <TabsTrigger
                                value="savings"
                                className="relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-0 pt-0 font-medium text-slate-500 hover:text-emerald-600 data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none dark:text-zinc-400 dark:hover:text-emerald-400 dark:data-[state=active]:text-emerald-400 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <PiggyBank className="w-4 h-4" />
                                    <span>Cara Menabung</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="debt"
                                className="relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-0 pt-0 font-medium text-slate-500 hover:text-rose-600 data-[state=active]:border-rose-600 data-[state=active]:text-rose-700 data-[state=active]:shadow-none dark:text-zinc-400 dark:hover:text-rose-400 dark:data-[state=active]:text-rose-400 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Lunasi Hutang</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="detox"
                                className="relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-0 pt-0 font-medium text-slate-500 hover:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none dark:text-zinc-400 dark:hover:text-blue-400 dark:data-[state=active]:text-blue-400 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <Scissors className="w-4 h-4" />
                                    <span>Detox Pengeluaran</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6 min-h-[400px]">
                        {/* === SAVINGS TAB === */}
                        <TabsContent value="savings" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
                                        <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-lg flex items-center gap-2 mb-4">
                                            <Target className="w-5 h-5" />
                                            Metode 50/30/20
                                        </h3>

                                        {!hasIncome ? (
                                            <div className="p-4 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-2xl text-sm text-emerald-800 dark:text-emerald-200 mb-4 flex items-center gap-2">
                                                <Info className="w-5 h-5 inline flex-shrink-0" />
                                                <span>Belum ada data pemasukan.</span>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-6 leading-relaxed">
                                                Berdasarkan pemasukanmu sebesar <span className="font-bold">Rp {monthlyIncome.toLocaleString('id-ID')}</span>, berikut alokasi idealnya:
                                            </p>
                                        )}

                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span>Kebutuhan (50%)</span>
                                                    <span>Rp {needs.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-emerald-200 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '50%' }}></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span>Keinginan (30%)</span>
                                                    <span>Rp {wants.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-emerald-200 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '30%' }}></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span>Tabungan/Investasi (20%)</span>
                                                    <span>Rp {savingsTarget.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-emerald-200 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '20%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-sm h-full">
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2 mb-4">
                                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                            Dana Darurat (Emergency Fund)
                                        </h3>

                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Progress Saat Ini</span>
                                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{emergencyFundProgress.toFixed(0)}%</span>
                                        </div>
                                        <Progress value={emergencyFundProgress} className="h-3 mb-6" indicatorColor="bg-indigo-500" />

                                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-zinc-900 rounded-2xl mb-4">
                                            <span className="text-muted-foreground">Target (6x Pengeluaran)</span>
                                            <span className="font-bold">Rp {emergencyFundTarget.toLocaleString('id-ID')}</span>
                                        </div>

                                        {!hasExpense && (
                                            <p className="text-xs text-amber-500 mb-3 italic">
                                                *Target estimasi default.
                                            </p>
                                        )}

                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-sm text-blue-700 dark:text-blue-300 flex gap-3 items-start leading-relaxed">
                                            <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                                            <p>Simpan dana ini di instrumen likuid & aman seperti Reksadana Pasar Uang (RDPU) atau Deposito.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* === DEBT TAB === */}
                        <TabsContent value="debt" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {totalDebt > 0 ? (
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-900/20">
                                            <h3 className="font-bold text-rose-800 dark:text-rose-300 text-lg flex items-center gap-2 mb-1">
                                                <CreditCard className="w-5 h-5" />
                                                Strategi Pelunasan
                                            </h3>
                                            <p className="text-sm text-rose-600/80 dark:text-rose-400 mb-6">Metode "Avalanche" (Bunga Tinggi Dulu).</p>

                                            <div className="space-y-6">
                                                <div>
                                                    <div className="flex justify-between mb-2 text-sm font-medium">
                                                        <span>Pembayaran Bulanan</span>
                                                        <span>Rp {totalMonthlyPayment.toLocaleString('id-ID')}</span>
                                                    </div>
                                                    <Slider
                                                        defaultValue={[0]}
                                                        max={incomeBase * 0.3 || 1000000}
                                                        step={50000}
                                                        onValueChange={(vals) => setExtraPayment(vals[0])}
                                                        className="py-2"
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-2 text-right">
                                                        + Tambah Rp {extraPayment.toLocaleString('id-ID')} ekstra/bulan
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl border border-rose-200/50 dark:border-rose-900/30 text-center">
                                                        <p className="text-xs text-rose-600 mb-1 font-semibold uppercase">Estimasi Lunas</p>
                                                        {isValidDebtPayoff ? (
                                                            <p className="text-2xl font-black text-rose-700 dark:text-rose-400">{monthsToPayOff} Bulan</p>
                                                        ) : (
                                                            <p className="text-sm font-bold text-rose-700">Tidak Terhingga</p>
                                                        )}
                                                    </div>
                                                    <div className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl border border-rose-200/50 dark:border-rose-900/30 text-center">
                                                        <p className="text-xs text-rose-600 mb-1 font-semibold uppercase">Total Hutang</p>
                                                        <p className="text-xl font-bold text-rose-700 dark:text-rose-400">Rp {(totalDebt / 1000000).toFixed(1)} Jt</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-sm h-full">
                                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Do's & Don'ts Paylater
                                            </h3>
                                            <ul className="space-y-4 text-sm">
                                                <li className="flex gap-3 items-start">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span className="text-muted-foreground leading-relaxed">Gunakan promo bunga 0% hanya jika Anda punya uang tunai untuk membayarnya saat itu juga.</span>
                                                </li>
                                                <li className="flex gap-3 items-start">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span className="text-muted-foreground leading-relaxed">Setel auto-debet 2-3 hari sebelum jatuh tempo untuk menghindari denda keterlambatan.</span>
                                                </li>
                                                <li className="flex gap-3 items-start">
                                                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                    <span className="text-muted-foreground leading-relaxed"><span className="font-bold text-rose-600">Jangan pernah</span> menarik tunai (gestun) dari limit paylater. Bunganya sangat mencekik.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                                    <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center animate-pulse">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-emerald-100">Anda Bebas Hutang!</h3>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-3 leading-relaxed">
                                            Luar biasa! Pertahankan status ini. Fokuskan alokasi dana Anda untuk mengisi tabungan darurat dan investasi masa depan.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* === DETOX TAB === */}
                        <TabsContent value="detox" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                                        <h3 className="font-bold text-blue-800 dark:text-blue-300 text-lg flex items-center gap-2 mb-2">
                                            <Scissors className="w-5 h-5" />
                                            Simulator Penghematan
                                        </h3>
                                        <p className="text-sm text-blue-600/80 dark:text-blue-400 mb-6">
                                            Geser untuk melihat potensi tabungan jika Anda memangkas pengeluaran gaya hidup.
                                        </p>

                                        <div className="px-2">
                                            <div className="flex justify-between mb-4">
                                                <span className="text-sm font-bold">Pangkas {cutPercentage}%</span>
                                                <span className="text-sm font-bold text-emerald-600">+ Rp {potentialSavings.toLocaleString('id-ID')}</span>
                                            </div>
                                            <Slider
                                                defaultValue={[10]}
                                                max={50}
                                                step={5}
                                                onValueChange={(vals) => setCutPercentage(vals[0])}
                                                className="py-2"
                                            />
                                        </div>

                                        <div className="mt-6 flex flex-col gap-3">
                                            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Kategori Terdeteksi "Keinginan"</p>
                                            {potentialLeaks.length > 0 ? (
                                                potentialLeaks.map((cat, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                                        <span className="font-medium text-sm">{cat.name}</span>
                                                        <span className="text-rose-600 font-bold text-sm">Rp {cat.amount.toLocaleString('id-ID')}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-2xl text-center text-sm text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Tidak ada kategori pengeluaran mencolok. Bagus!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-sm h-full">
                                        <h3 className="font-bold mb-5 flex items-center gap-2 text-amber-600">
                                            <AlertTriangle className="w-5 h-5" /> Area Rawan Bocor
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex gap-4 items-start">
                                                <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 text-orange-600 text-lg">
                                                    ☕
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">Latte Factor</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                                        Jajan kopi/snack 25rb/hari = 750rb/bulan. Setahun bisa beli tiket liburan ke luar negeri!
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-start">
                                                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 text-purple-600 text-lg">
                                                    📺
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">Subscription Ghost</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                                        Cek langganan aplikasi (Netflix, Spotify, Gym) yang jarang dipakai tapi terus memotong saldo.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-start">
                                                <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0 text-pink-600 text-lg">
                                                    🛒
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">Impulse Buying</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                                        Terapkan "30-Day Rule". Jika ingin beli barang non-esensial, tunggu 30 hari. Biasanya keinginan itu hilang.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
