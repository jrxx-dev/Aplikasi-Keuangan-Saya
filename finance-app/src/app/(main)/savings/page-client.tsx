"use client";

import { useState, useMemo } from "react";
import { FadeIn, ScaleIn } from "@/components/ui/motion-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PiggyBank, Calendar, Bell, Wallet, TrendingUp, History, ArrowRight, Settings, CheckCircle2, AlertCircle, Brain, Sparkles, Plus, ExternalLink, ShieldCheck, AlertTriangle, BarChart3, Rocket, Target } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useRouter } from "next/navigation";
import { createSavingTransaction } from "@/lib/actions/finance"; // Check if this import works if exported from same package, else verify path.
// It seems createSavingTransaction is in @/lib/actions/finance.

interface SavingsPageClientProps {
    accounts: any[];
    transactions: any[];
    categories: any[];
}

export default function SavingsPageClient({ accounts, transactions, categories }: SavingsPageClientProps) {
    // Settings State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Habit State
    const [habitEnabled, setHabitEnabled] = useState(false);
    const [habitFrequency, setHabitFrequency] = useState("monthly");
    const [habitAmount, setHabitAmount] = useState("");
    const [habitDate, setHabitDate] = useState("1"); // Day of month

    // Impulse Saver State
    const [impulseItem, setImpulseItem] = useState("");
    const [impulseCategory, setImpulseCategory] = useState("");
    const [impulseAmount, setImpulseAmount] = useState("");
    const [isImpulseLoading, setIsImpulseLoading] = useState(false);

    // Router for refresh
    const router = useRouter();

    // Calculate Savings Stats
    const savingsTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Robust check for savings transactions
            const isExpense = t.type === 'expense';
            const categoryName = t.category?.toLowerCase() || '';
            const description = t.description?.toLowerCase() || '';

            // Check 1: Explicit Category Name
            const isTabunganCategory = categoryName === 'tabungan' || categoryName === 'saving' || categoryName === 'savings';

            // Check 2: Explicit Source (from generic form)
            const isManualSaving = t.source === 'manual_saving';

            // Check 3: Keywords in Description (fallback)
            const hasKeywords = description.includes('tabungan') ||
                description.includes('simpanan') ||
                description.includes('nabung') ||
                description.includes('saving');

            return isExpense && (isTabunganCategory || isManualSaving || hasKeywords);
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    const totalSavedThisMonth = useMemo(() => {
        const now = new Date();
        return savingsTransactions
            .filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((acc, t) => acc + parseFloat(t.amount), 0);
    }, [savingsTransactions]);

    const liquidAssets = useMemo(() => {
        return accounts
            .filter(a => a.type === 'bank' || a.type === 'wallet' || a.type === 'cash')
            .reduce((acc, a) => acc + parseFloat(a.balance), 0);
    }, [accounts]);

    const saveHabit = () => {
        toast.success("Pengingat menabung telah diaktifkan!");

        // Google Calendar Logic
        const title = encodeURIComponent("Waktunya Menabung! 💰");
        const details = encodeURIComponent(`Target tabungan bulan ini: Rp ${habitAmount}. Konsistensi adalah kunci kebebasan finansial!`);
        const location = encodeURIComponent("FinanceMy App");

        // Generate Date String (YYYYMMDD) for next occurrence
        const now = new Date();
        let targetDate = new Date();

        if (habitFrequency === 'monthly') {
            // Set to the specific day of this month
            targetDate.setDate(parseInt(habitDate));
            // If that day has passed, move to next month
            if (targetDate < now) {
                targetDate.setMonth(targetDate.getMonth() + 1);
            }
        } else {
            // Weekly logic (simplified for immediate next occurrence or just start tomorrow)
            targetDate.setDate(targetDate.getDate() + 1);
        }

        // Format Date String to YYYYMMDD using local time to avoid timezone shifts
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const dateString = `${year}${month}${day}`;
        const dates = `${dateString}/${dateString}`; // All day event

        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}&recur=RRULE:FREQ=${habitFrequency.toUpperCase()}`;

        window.open(calendarUrl, '_blank');
        router.refresh();
    };

    const handleImpulseSave = async () => {
        if (!impulseAmount || parseFloat(impulseAmount) <= 0) {
            toast.error("Masukkan nominal yang valid");
            return;
        }
        if (!impulseItem) {
            toast.error("Masukkan nama barang");
            return;
        }

        // Find a default account (Bank/Wallet) to deduct from
        const sourceAccount = accounts.find(a => a.type === 'bank' || a.type === 'wallet' || a.type === 'cash');

        if (!sourceAccount) {
            toast.error("Tidak ada akun ditemukan untuk sumber dana");
            return;
        }

        setIsImpulseLoading(true);
        try {
            const cleanAmount = impulseAmount.replace(/\D/g, "");

            const selectedCat = categories.find(c => c.id === impulseCategory);
            const categoryLabel = selectedCat ? `${selectedCat.name} ${selectedCat.icon || ''}` : 'Lainnya';

            const result = await createSavingTransaction({
                amount: cleanAmount,
                accountId: sourceAccount.id,
                date: new Date(),
                description: `Batal ${categoryLabel}: ${impulseItem}`
            });

            if (result.success) {
                toast.success(`Berhasil menabung Rp ${parseInt(cleanAmount).toLocaleString('id-ID')}!`, {
                    description: `Uang untuk ${categoryLabel} berhasil diamankan.`
                });
                setImpulseItem("");
                setImpulseAmount("");
                setImpulseCategory("");
                router.refresh(); // Realtime update
            } else {
                toast.error("Gagal menyimpan transaksi");
            }
        } catch (error) {
            console.error("Impulse save error:", error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsImpulseLoading(false);
        }
    };

    // Analysis Logic
    const analysis = useMemo(() => {
        // Simple surplus calculation from ALL transactions (simplified for this view)
        // Ideally we filter by this month only
        const now = new Date();
        const thisMonthTx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const income = thisMonthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const expense = thisMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const surplus = income - expense;
        const savingsRate = income > 0 ? (totalSavedThisMonth / income) * 100 : 0;
        const potentialSavings = surplus * 0.2; // Recommend saving 20% of surplus

        return { income, expense, surplus, savingsRate, potentialSavings };
        return { income, expense, surplus, savingsRate, potentialSavings };
    }, [transactions, totalSavedThisMonth]);

    // 1. Savings Trend (Last 6 Months)
    const savingsTrend = useMemo(() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = format(d, "yyyy-MM"); // key for filtering
            const label = format(d, "MMM", { locale: idLocale });

            const total = savingsTransactions
                .filter(t => format(new Date(t.date), "yyyy-MM") === key)
                .reduce((acc, t) => acc + parseFloat(t.amount), 0);

            months.push({ label, total });
        }
        return months;
    }, [savingsTransactions]);

    // 2. Emergency Fund Stats
    const emergencyStats = useMemo(() => {
        // Calculate average monthly expense based on all transaction history
        const expenseTx = transactions.filter(t => t.type === 'expense');
        const monthsFound = new Set(expenseTx.map(t => format(new Date(t.date), "yyyy-MM"))).size || 1;
        const totalExpense = expenseTx.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const avgExpense = totalExpense / monthsFound;

        const target = avgExpense * 6; // 6 Months Rule
        const current = liquidAssets;
        const coverage = avgExpense > 0 ? current / avgExpense : 0;
        const progress = target > 0 ? (current / target) * 100 : 0;

        return { target, current, coverage, progress, avgExpense };
    }, [transactions, liquidAssets]);

    // 3. Future Projection Stats
    const projection = useMemo(() => {
        // Avg savings last 3 months
        const recentMonths = savingsTrend.slice(0, 3); // Month 0 is this month, 1 is prev, etc. or based on how savingsTrend is built.
        // Actually savingsTrend is built 5..0, so 0 is 5 months ago, 5 is NOW.
        // So we want indices 3, 4, 5.
        const last3Months = savingsTrend.slice(-3).map(m => m.total);
        const avgSavings = last3Months.reduce((a, b) => a + b, 0) / (last3Months.length || 1);

        // Compound Interest Calculation (Assume 5% conservative investment return)
        const calculateFV = (years: number) => {
            const r = 0.05 / 12; // Monthly rate
            const n = years * 12;
            const PMT = avgSavings;
            const PV = liquidAssets;

            // FV = PV * (1+r)^n + PMT * [ ((1+r)^n - 1) / r ]
            const fvOfPrincipal = PV * Math.pow(1 + r, n);
            const fvOfSeries = PMT * ((Math.pow(1 + r, n) - 1) / r);
            return fvOfPrincipal + fvOfSeries;
        };

        return {
            avgSavings,
            year1: calculateFV(1),
            year5: calculateFV(5),
            year10: calculateFV(10)
        };
    }, [savingsTrend, liquidAssets]);

    return (
        <div className="min-h-screen font-sans bg-transparent pb-20">
            {/* Background Decor */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-teal-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
                {/* HEADER */}
                <FadeIn>
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                                Tabungan Rutin
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-light">
                                Bangun kebiasaan menabung, sedikit demi sedikit.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full w-10 h-10 border-slate-200 dark:border-slate-800">
                                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </Button>
                            <ThemeToggle />
                        </div>
                    </header>
                </FadeIn>

                {/* SETTINGS DIALOG */}
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogContent className="glass-card sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Pengaturan Tabungan</DialogTitle>
                            <DialogDescription>Konfigurasi pengingat dan target rutinmu.</DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-bold">Pengingat Otomatis</Label>
                                        <p className="text-xs text-muted-foreground">Notifikasi rutin via Kalender</p>
                                    </div>
                                </div>
                                <Switch checked={habitEnabled} onCheckedChange={setHabitEnabled} />
                            </div>

                            {habitEnabled && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Frekuensi</Label>
                                            <Select value={habitFrequency} onValueChange={setHabitFrequency}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="weekly">Mingguan</SelectItem>
                                                    <SelectItem value="monthly">Bulanan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Waktu</Label>
                                            <Select value={habitDate} onValueChange={setHabitDate}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {habitFrequency === 'monthly'
                                                        ? Array.from({ length: 28 }, (_, i) => i + 1).map(d => <SelectItem key={d} value={d.toString()}>Tanggal {d}</SelectItem>)
                                                        : ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((d, i) => <SelectItem key={i} value={d}>{d}</SelectItem>)
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Target Nominal</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">Rp</span>
                                            <CurrencyInput
                                                value={habitAmount}
                                                onValueChange={setHabitAmount}
                                                className="pl-10 h-12 font-bold bg-white/50 dark:bg-black/20"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setHabitAmount((analysis.income * 0.1).toFixed(0))} className="text-xs h-7">10% Income</Button>
                                            <Button variant="outline" size="sm" onClick={() => setHabitAmount((analysis.surplus * 0.2).toFixed(0))} className="text-xs h-7">20% Surplus</Button>
                                            <Button variant="outline" size="sm" onClick={() => setHabitAmount(analysis.potentialSavings.toFixed(0))} className="text-xs h-7 border-indigo-200 text-indigo-600"><Sparkles className="w-3 h-3 mr-1" /> Saran AI</Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button onClick={() => setIsSettingsOpen(false)} variant="ghost">Batal</Button>
                            {habitEnabled && (
                                <Button onClick={() => { saveHabit(); setIsSettingsOpen(false); }} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-full">
                                    <Calendar className="w-4 h-4" /> Simpan & Buka Kalender
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* LAYOUT REORDERED BASED ON USER REQUEST */}
                {/* PRIORITY 1: TOTAL SAVINGS & HISTORY (TOP) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* TOTAL SAVINGS (Left Big Card) */}
                    <div className="lg:col-span-12 xl:col-span-5">
                        <FadeIn delay={0.1}>
                            <Card className="glass-card bg-emerald-600 text-white border-none shadow-2xl relative overflow-hidden h-full min-h-[180px] flex flex-col justify-center">
                                <div className="absolute -right-6 -bottom-6 opacity-20"><TrendingUp className="w-40 h-40" /></div>
                                <CardContent className="p-6 relative z-10">
                                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2"><PiggyBank className="w-4 h-4" /> Total Ditabung (Bulan Ini)</p>
                                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalSavedThisMonth)}
                                    </h2>
                                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 max-w-sm">
                                        <div className="p-2 bg-emerald-500/50 rounded-lg">
                                            <Wallet className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-50">Total Aset Cair</p>
                                            <p className="text-sm font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(liquidAssets)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeIn>
                    </div>

                    {/* HISTORY (Right Scrollable List) */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <FadeIn delay={0.2}>
                            <div className="glass-card p-5 rounded-2xl h-[280px] flex flex-col">
                                <h3 className="font-bold flex items-center gap-2 text-lg mb-3 text-slate-800 dark:text-slate-100"><History className="w-4 h-4 text-indigo-500" /> Riwayat Menabung</h3>
                                <div className="relative flex-1 overflow-hidden">
                                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
                                    {/* Scrollable Container for History */}
                                    <div className="absolute inset-0 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 pt-1">
                                        {savingsTransactions.map((t, i) => (
                                            <div key={t.id} className="relative pl-6 hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-lg transition-colors group">
                                                <div className="absolute left-0 top-3.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[3px] border-white dark:border-zinc-900 group-hover:scale-110 transition-transform" />
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.description || "Menabung"}</p>
                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {format(new Date(t.date), "dd MMM HH:mm", { locale: idLocale })}
                                                        </p>
                                                    </div>
                                                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                                        +{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parseFloat(t.amount))}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {savingsTransactions.length === 0 && (
                                            <div className="text-center py-12 text-muted-foreground text-sm italic flex flex-col items-center justify-center h-full">
                                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-full mb-3">
                                                    <PiggyBank className="w-8 h-8 opacity-30" />
                                                </div>
                                                Belum ada riwayat menabung.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>

                {/* PRIORITY 2: INSIGHTS & UTILITIES */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                    {/* LEFT (Assets & Emergency) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* ASET LIQUIDITAS */}
                        <FadeIn delay={0.3}>
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-indigo-500" /> Rincian Aset
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {accounts
                                        .filter(a => ['bank', 'wallet', 'cash'].includes(a.type))
                                        .map((account, i) => (
                                            <motion.div
                                                key={account.id}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                className="glass-card p-4 rounded-2xl flex flex-col justify-between border-t-4 border-indigo-500 hover:shadow-lg transition-all cursor-pointer h-full min-h-[100px]"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-lg">
                                                        {account.type === 'bank' ? '🏦' : account.type === 'wallet' ? '👛' : '💵'}
                                                    </div>
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{account.type}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate" title={account.name}>{account.name}</p>
                                                    <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parseFloat(account.balance))}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            </div>
                        </FadeIn>

                        {/* IMPULSE SAVER (GODAAN BELANJA) */}
                        <FadeIn delay={0.35}>
                            <Card className="glass-card border-none shadow-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <CardHeader className="pb-2 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                            <Brain className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold">Impulse Saver</CardTitle>
                                            <CardDescription className="text-rose-100">Batal beli sesuatu? Tabung uangnya!</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1 md:col-span-2">
                                            <Label className="text-rose-50 text-xs uppercase font-bold tracking-wider">Kategori Pengeluaran</Label>
                                            <Select value={impulseCategory} onValueChange={setImpulseCategory}>
                                                <SelectTrigger className="bg-white/20 border-white/30 text-white focus:ring-offset-0 focus:ring-0 font-medium">
                                                    <SelectValue placeholder="Pilih Kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories
                                                        .filter(c => c.type === 'expense')
                                                        .map(c => (
                                                            <SelectItem key={c.id} value={c.id}>
                                                                {c.name} {c.icon}
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-rose-50 text-xs uppercase font-bold tracking-wider">Barang / Hal</Label>
                                            <Input
                                                placeholder="Contoh: Sepatu Baru"
                                                value={impulseItem}
                                                onChange={(e) => setImpulseItem(e.target.value)}
                                                className="bg-white/20 border-white/30 text-white placeholder:text-rose-200 focus:bg-white/30 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-rose-50 text-xs uppercase font-bold tracking-wider">Harga Selamat</Label>
                                            <CurrencyInput
                                                value={impulseAmount}
                                                onValueChange={setImpulseAmount}
                                                placeholder="0"
                                                className="bg-white/20 border-white/30 text-white placeholder:text-rose-200 focus:bg-white/30 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleImpulseSave}
                                        disabled={isImpulseLoading || !impulseAmount}
                                        className="w-full bg-white text-rose-600 hover:bg-rose-50 font-bold shadow-lg transform hover:scale-[1.02] transition-all"
                                    >
                                        {isImpulseLoading ? "Menyimpan..." : "Amankan Uang Ini Sekarang!"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </FadeIn>

                        {/* DANA DARURAT */}
                        <FadeIn delay={0.4}>
                            <Card className="glass-card border-none shadow-lg relative overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-2xl text-amber-600 dark:text-amber-500">
                                            {emergencyStats.coverage >= 6 ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold">Dana Darurat Monitor</CardTitle>
                                            <CardDescription>Target Keamanan: 6x Pengeluaran Bulanan</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Ketahanan Finansial</p>
                                                <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
                                                    {emergencyStats.coverage.toFixed(1)}x <span className="text-lg font-medium text-muted-foreground">Bulan</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-slate-500">Avg Pengeluaran/bln</p>
                                                <p className="font-bold text-slate-700 dark:text-slate-300">~{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(emergencyStats.avgExpense)}</p>
                                            </div>
                                        </div>

                                        <div className="relative pt-2">
                                            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(emergencyStats.progress, 100)}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${emergencyStats.coverage >= 6 ? 'bg-emerald-500' :
                                                        emergencyStats.coverage >= 3 ? 'bg-amber-500' : 'bg-rose-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800 flex gap-3">
                                            <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                            <p>
                                                {emergencyStats.coverage >= 6
                                                    ? "Posisi sangat aman! Kamu punya bantalan dana yang kuat."
                                                    : emergencyStats.coverage >= 3
                                                        ? "Cukup aman (3+ bulan), tapi terus tingkatkan hingga 6 bulan untuk ketenangan maksimal."
                                                        : "Perlu perhatian. Prioritaskan mengisi dana darurat sebelum konsumsi keinginan."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeIn>
                    </div>

                    {/* RIGHT (AI & Tools) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* AI CARD (Compact) */}
                        <FadeIn delay={0.4}>
                            <Card className="glass-card bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-none shadow-xl relative overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                            <Sparkles className="w-5 h-5 text-yellow-300" />
                                        </div>
                                        <h3 className="font-bold">Analisis Cerdas</h3>
                                    </div>
                                    <div className="space-y-3 text-indigo-50 text-sm">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span>Surplus Bulan Ini</span>
                                            <span className="font-bold text-white">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(analysis.surplus)}</span>
                                        </div>
                                        <p className="leading-snug opacity-90">
                                            {analysis.surplus > 0
                                                ? `Saran: Tabung minimal Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(analysis.potentialSavings)} (20% surplus).`
                                                : "Pastikan pemasukan lebih besar dari pengeluaran bulan depan."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeIn>

                        {/* HABIT CARD COMPACT */}
                        <FadeIn delay={0.5}>
                            <Card className="glass-card border-none shadow-md">
                                <CardHeader className="pb-3 pt-5 px-5">
                                    <CardTitle className="text-base font-bold flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Bell className="w-4 h-4 text-emerald-600" /> Reminder Rutin</span>
                                        <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)} className="h-6 w-6 p-0 rounded-full"><Settings className="w-3 h-3" /></Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5">
                                    {habitEnabled ? (
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                            <p className="text-xs text-muted-foreground uppercase mb-1">JADWAL NEXT</p>
                                            <p className="font-bold text-emerald-700 dark:text-emerald-400">
                                                {habitFrequency === 'monthly' ? `Tgl ${habitDate} Bulan In/Depan` : `Setiap ${habitDate}`}
                                            </p>
                                            <div className="mt-2 h-px bg-emerald-200 dark:bg-emerald-800/50 w-full" />
                                            <p className="text-right font-bold text-lg mt-2 text-slate-800 dark:text-white">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parseFloat(habitAmount || "0"))}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center text-sm text-muted-foreground py-4">
                                            Belum ada pengingat aktif.
                                            <Button size="sm" variant="outline" onClick={() => setIsSettingsOpen(true)} className="w-full mt-2 h-8 text-xs border-emerald-200 text-emerald-700">Setup Sekarang</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </FadeIn>

                        {/* PROJECTION */}
                        <FadeIn delay={0.6}>
                            <Card className="glass-card bg-slate-900 text-white border-none shadow-xl">
                                <CardContent className="p-5">
                                    <h3 className="font-bold text-sm mb-4 text-slate-400 uppercase tracking-wider flex items-center gap-2"><Rocket className="w-4 h-4" /> Proyeksi 5 Tahun</h3>
                                    <p className="text-3xl font-black text-emerald-400 mb-1">
                                        {(projection.year5 / 1000000).toFixed(1)} Juta
                                    </p>
                                    <p className="text-xs text-slate-500">Jika konsisten menabung rutin.</p>
                                </CardContent>
                            </Card>
                        </FadeIn>
                    </div>
                </div>

                {/* BOTTOM: CHARTS */}
                <div className="pt-8 transition-opacity">
                    <FadeIn delay={0.7}>
                        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-500" /> Tren 6 Bulan Terakhir</h3>
                            </div>

                            <div className="h-[200px] w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
                                {savingsTrend.map((item, i) => {
                                    const maxVal = Math.max(...savingsTrend.map(t => t.total)) || 1;
                                    const heightPercent = Math.max(5, (item.total / maxVal) * 100); // Min 5% height for visual

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                            <div className="w-full max-w-[60px] bg-slate-100 dark:bg-slate-800 rounded-t-xl relative h-full flex items-end overflow-hidden">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${heightPercent}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                                                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-all relative"
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', compactDisplay: "short", maximumFractionDigits: 0 }).format(item.total)}
                                                    </div>
                                                </motion.div>
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase">{item.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </FadeIn>
                </div>

                {/* Removed old layout to avoid duplication */}
            </div>
        </div >
    );
}
