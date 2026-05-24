"use client";

import { useState, useEffect, useMemo } from "react";
import { FadeIn, ScaleIn } from "@/components/ui/motion-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Target, Trophy, TrendingUp, PiggyBank, Calendar, Trash2, Rocket, Sparkles, Pencil, Bot, Zap, BrainCircuit, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGoal, deleteGoal, updateGoal } from "@/lib/actions/goals";
import { createSavingTransaction } from "@/lib/actions/finance";
import { CurrencyInput } from "@/components/ui/currency-input";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion } from "framer-motion";

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: Date | null;
    icon: string | null;
    color: string | null;
}

const colorMap: Record<string, string> = {
    blue: "bg-blue-500", red: "bg-red-500", green: "bg-emerald-500", orange: "bg-orange-500",
    purple: "bg-violet-500", pink: "bg-pink-500", cyan: "bg-cyan-500", yellow: "bg-amber-500",
    indigo: "bg-indigo-500", slate: "bg-slate-500"
};

const ICONS = ["🏠", "🚗", "✈️", "💻", "💍", "🎓", "🏥", "📱", "🎸", "🚲", "🏝️", "👶", "💰", "⌚", "📷"];
const COLORS = ["blue", "green", "purple", "orange", "pink", "cyan", "red", "indigo"];

export default function GoalsPageClient({ initialGoals, accounts }: { initialGoals: Goal[], accounts: any[] }) {
    const router = useRouter();
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Insight State
    const [aiAnalysis, setAiAnalysis] = useState("");
    const [isThinking, setIsThinking] = useState(true);

    // Deposit State
    const [depositAmount, setDepositAmount] = useState("");
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<Goal | null>(null);
    const [depositAccountId, setDepositAccountId] = useState<string>("");

    // Success Dialog State
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [successTitle, setSuccessTitle] = useState("Berhasil!");

    // Create/Edit State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false); // New Edit State
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    // Form Fields (Reusable for Create & Edit)
    const [formName, setFormName] = useState("");
    const [formTarget, setFormTarget] = useState("");
    const [formDate, setFormDate] = useState("");
    const [formIcon, setFormIcon] = useState("🏠");
    const [formColor, setFormColor] = useState("blue");

    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

    // Function to calculate monthly needed
    const calculateMonthly = (target: number, current: number, deadline: Date | null) => {
        if (!deadline) return 0;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const remaining = target - current;
        if (remaining <= 0) return 0;
        if (deadlineDate <= now) return remaining; // Overdue, need all now

        const months = (deadlineDate.getFullYear() - now.getFullYear()) * 12 + (deadlineDate.getMonth() - now.getMonth());
        return months > 0 ? remaining / months : remaining;
    };

    // AI Analysis Generator
    useEffect(() => {
        setIsThinking(true);
        const timer = setTimeout(() => {
            const activeGoals = initialGoals.filter(g => g.currentAmount < g.targetAmount);
            const totalMonthlyNeeded = activeGoals.reduce((acc, g) => acc + calculateMonthly(g.targetAmount, g.currentAmount, g.deadline), 0);
            const nearDeadline = activeGoals.filter(g => g.deadline && new Date(g.deadline).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000).length; // < 3 months

            let msg = "";
            if (activeGoals.length === 0 && initialGoals.length > 0) {
                msg = "🎉 Luar biasa! Semua targetmu sudah tercapai. Keuanganmu sangat sehat. Saatnya merencanakan investasi atau aset pasif!";
            } else if (initialGoals.length === 0) {
                msg = "💡 Mulailah dengan target kecil. Data menunjukkan orang yang menuliskan tujuan keuangannya 42% lebih mungkin mencapainya.";
            } else {
                if (totalMonthlyNeeded > 10000000) {
                    msg = `⚠️ Beban Berat: Kamu perlu menyisihkan ${formatCurrency(totalMonthlyNeeded)}/bulan untuk semua target. Ini mungkin terlalu agresif. Saran AI: Tunda deadline untuk target jangka panjang agar cashflow bulanan lebih lega.`;
                } else if (totalMonthlyNeeded > 5000000) {
                    msg = `📊 Analisis: Komitmen bulananmu adalah ${formatCurrency(totalMonthlyNeeded)}. Pastikan ini di bawah 30% pendapatanmu. Jika tidak, coba kurangi target nominal 'Liburan' atau 'Hobi'.`;
                } else if (nearDeadline > 0) {
                    msg = `⚡ Fokus Tinggi: Ada ${nearDeadline} target yang jatuh tempo dalam 3 bulan. Prioritaskan alokasi dana ke sana agar tidak meleset!`;
                } else {
                    msg = `✅ Sehat & Stabil: Target bulananmu ${formatCurrency(totalMonthlyNeeded)} terlihat sangat realistis. Pertahankan konsistensi ini dan kamu akan sukses!`;
                }
            }
            setAiAnalysis(msg);
            setIsThinking(false);
        }, 1500); // Simulate thinking time
        return () => clearTimeout(timer);
    }, [initialGoals]);

    // HANDLERS

    const resetForm = () => {
        setFormName(""); setFormTarget(""); setFormDate(""); setFormIcon("🏠"); setFormColor("blue");
    };

    const handleCreate = async () => {
        if (!formName || !formTarget) { toast.error("Data tidak lengkap"); return; }
        setIsSubmitting(true);
        const res = await createGoal({
            name: formName,
            targetAmount: parseFloat(formTarget),
            deadline: formDate ? new Date(formDate) : undefined,
            icon: formIcon,
            color: formColor
        });
        setIsSubmitting(false);
        if (res.success) {
            setSuccessTitle("Goal Dibuat!");
            setSuccessMessage(`Target "${formName}" berhasil ditambahkan.`);
            setSuccessOpen(true);
            setIsCreateOpen(false);
            resetForm();
            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    const openEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setFormName(goal.name);
        setFormTarget(goal.targetAmount.toString());
        setFormDate(goal.deadline ? format(new Date(goal.deadline), "yyyy-MM-dd") : "");
        setFormIcon(goal.icon || "🏠");
        setFormColor(goal.color || "blue");
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingGoal || !formName || !formTarget) return;
        setIsSubmitting(true);
        const res = await updateGoal({
            id: editingGoal.id,
            name: formName,
            targetAmount: parseFloat(formTarget),
            deadline: formDate ? new Date(formDate) : undefined,
            icon: formIcon,
            color: formColor
        });
        setIsSubmitting(false);
        if (res.success) {
            toast.success("Goal updated updated!");
            setIsEditOpen(false);
            setEditingGoal(null);
            resetForm();
            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    const handleDeposit = async () => {
        if (!selectedGoalForDeposit || !depositAmount) return;
        if (!depositAccountId) { toast.error("Pilih sumber dana dahulu"); return; }

        // Clean amount
        let cleanAmount = depositAmount;
        if (typeof depositAmount === 'string') {
            cleanAmount = depositAmount.replace(/[^0-9]/g, '');
        }

        const amount = parseInt(cleanAmount || "0");
        if (amount <= 0) return;

        setIsSubmitting(true);
        try {
            const res = await createSavingTransaction({
                amount: amount.toString(),
                goalId: selectedGoalForDeposit.id,
                accountId: depositAccountId,
                date: new Date(),
                description: `Tabungan ke: ${selectedGoalForDeposit.name}`
            });
            setIsSubmitting(false);
            if (res.success) {
                setSuccessTitle("Tabungan Bertambah!");
                setSuccessMessage(`Berhasil menabung Rp ${amount.toLocaleString('id-ID')} ke "${selectedGoalForDeposit.name}"`);
                setSuccessOpen(true);
                setIsDepositOpen(false);
                setDepositAmount("");
                setDepositAccountId("");
                setSelectedGoalForDeposit(null);
                router.refresh();
            } else {
                toast.error(res.error || "Gagal menabung");
            }
        } catch (error) {
            setIsSubmitting(false);
            toast.error("Terjadi kesalahan");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin hapus? Data tidak bisa dikembalikan.")) return;
        const res = await deleteGoal(id);
        if (res.success) {
            toast.success("Goal dihapus");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    const totalTarget = initialGoals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalCollected = initialGoals.reduce((acc, g) => acc + g.currentAmount, 0);
    const goalsReached = initialGoals.filter(g => g.currentAmount >= g.targetAmount).length;

    return (
        <div className="min-h-screen font-sans bg-transparent pb-20">
            {/* Background Decor */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[30%] w-[30%] h-[30%] bg-pink-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">

                {/* HEADER */}
                <FadeIn>
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent filter drop-shadow-sm">
                                Dream Big.
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-light">
                                Wujudkan setiap impian finansialmu, satu langkah setiap hari.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 gap-2 transition-transform hover:scale-105 px-6 h-12 text-md">
                                <PlusIcon className="w-5 h-5" /> Buat Tujuan Baru
                            </Button>
                        </div>
                    </header>
                </FadeIn>

                {/* ANALYTICS SECTION */}
                <div className="space-y-8">

                    {/* 1. AI FINANCIAL ADVISOR (FULL WIDTH) */}
                    <FadeIn delay={0.1}>
                        <Card className="glass-card border-indigo-200/50 dark:border-indigo-800/50 shadow-2xl relative overflow-hidden bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10 md:opacity-20"><BrainCircuit className="w-64 h-64 text-indigo-500" /></div>
                            <CardContent className="p-8 relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                                <div className="p-5 bg-indigo-500/20 rounded-3xl border border-indigo-500/30 shrink-0 shadow-[0_0_30px_rgba(99,102,241,0.2)] backdrop-blur-md">
                                    <Bot className="w-12 h-12 text-indigo-600 dark:text-indigo-300 animate-pulse" />
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-indigo-600 dark:text-indigo-300 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> AI Financial Advisor
                                        </h3>
                                        <span className="px-3 py-1 bg-indigo-500/10 text-[10px] text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-500/20 font-bold">BETA</span>
                                    </div>
                                    <div className="min-h-[40px] flex items-center">
                                        {isThinking ? (
                                            <div className="flex items-center gap-3 text-indigo-400 dark:text-indigo-300 text-lg italic">
                                                <Sparkles className="w-5 h-5 animate-spin" /> Menganalisis pola tabunganmu...
                                            </div>
                                        ) : (
                                            <p className="text-slate-700 dark:text-slate-100 text-xl font-medium leading-relaxed">
                                                &quot;{aiAnalysis}&quot;
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>

                    {/* 2. STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FadeIn delay={0.2}>
                            <Card className="glass-card bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-200/50 dark:border-indigo-800/50 p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Target className="w-32 h-32 text-indigo-500" /></div>
                                <div className="relative z-10">
                                    <p className="text-indigo-600 dark:text-indigo-400 text-xs uppercase font-bold tracking-widest mb-2">Total Target Dana</p>
                                    <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1">{formatCurrency(totalTarget)}</h3>
                                    <div className="h-1 w-12 bg-indigo-500 rounded-full mt-4" />
                                </div>
                            </Card>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <Card className="glass-card bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-200/50 dark:border-emerald-800/50 p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><PiggyBank className="w-32 h-32 text-emerald-500" /></div>
                                <div className="relative z-10">
                                    <p className="text-emerald-600 dark:text-emerald-400 text-xs uppercase font-bold tracking-widest mb-2">Dana Terkumpul</p>
                                    <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1">{formatCurrency(totalCollected)}</h3>
                                    <div className="mt-4 flex items-center gap-3">
                                        <Progress value={totalTarget > 0 ? (totalCollected / totalTarget) * 100 : 0} className="h-2 flex-1 bg-emerald-100 dark:bg-emerald-900/40" indicatorColor="bg-emerald-500" />
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0}%</span>
                                    </div>
                                </div>
                            </Card>
                        </FadeIn>

                        <FadeIn delay={0.4}>
                            <Card className="glass-card bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border-amber-200/50 dark:border-amber-800/50 p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Trophy className="w-32 h-32 text-amber-500" /></div>
                                <CardContent className="p-0 relative z-10 flex items-center gap-6 h-full">
                                    <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400 shadow-sm">
                                        <Trophy className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-amber-600 dark:text-amber-400 text-xs uppercase font-bold tracking-widest mb-1">Goals Tercapai</p>
                                        <h3 className="text-4xl font-black text-slate-800 dark:text-white leading-none">
                                            {goalsReached} <span className="text-lg text-muted-foreground font-light">/ {initialGoals.length}</span>
                                        </h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeIn>
                    </div>
                </div>

                {/* EMPTY STATE */}
                {initialGoals.length === 0 && !isThinking && (
                    <div className="text-center py-20 flex flex-col items-center justify-center min-h-[400px] glass-card rounded-[3rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-full mb-6">
                            <Rocket className="w-16 h-16 text-indigo-400 animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Mulai Perjalananmu</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-8">Belum ada tujuan finansial. Buat satu sekarang dan lihat keajaiban tabunganmu berkembang!</p>
                        <Button onClick={() => setIsCreateOpen(true)} size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700">Buat Tujuan Pertama</Button>
                    </div>
                )}

                {/* GOALS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {initialGoals.map((goal, i) => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const monthlyNeeded = calculateMonthly(goal.targetAmount, goal.currentAmount, goal.deadline ? new Date(goal.deadline) : null);
                        const isReached = goal.currentAmount >= goal.targetAmount;

                        return (
                            <ScaleIn key={goal.id} delay={i * 0.05}>
                                <div className={`group relative glass-card rounded-[2rem] p-6 transition-all duration-500 hover:translate-y-[-5px] hover:shadow-2xl border
                                    ${isReached
                                        ? 'bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-900/20 dark:to-yellow-900/10 border-amber-200 dark:border-amber-800'
                                        : 'bg-white/60 dark:bg-zinc-900/60 border-white/40 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>

                                    {isReached && (
                                        <div className="absolute top-0 right-0 p-3">
                                            <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                                                <Trophy className="w-3 h-3" /> TERCAPAI
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-3xl shadow-sm border border-slate-100 dark:border-zinc-700 group-hover:scale-110 transition-transform duration-300">
                                            {goal.icon}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-200/50 dark:hover:bg-zinc-700/50" onClick={() => openEdit(goal)}>
                                                <Pencil className="w-4 h-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-rose-100/50 dark:hover:bg-rose-900/20" onClick={() => handleDelete(goal.id)}>
                                                <Trash2 className="w-4 h-4 text-rose-500" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold truncate mb-1 text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{goal.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {goal.deadline ? format(new Date(goal.deadline), "dd MMMM yyyy", { locale: idLocale }) : "No Deadline"}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-slate-50/80 dark:bg-zinc-800/50 rounded-2xl p-4">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Terkumpul</span>
                                                <span className={`text-xs font-bold ${isReached ? 'text-amber-600' : 'text-indigo-600'}`}>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="flex items-baseline gap-1 mb-3">
                                                <span className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(goal.currentAmount)}</span>
                                                <span className="text-xs text-muted-foreground font-medium">/ {formatCurrency(goal.targetAmount)}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isReached ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {!isReached && monthlyNeeded > 0 && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/30">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400">
                                                    <Zap className="w-3 h-3" />
                                                </div>
                                                <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-tight">
                                                    Perlu <span className="font-bold">{formatCurrency(monthlyNeeded)}/bln</span> untuk tercapai tepat waktu.
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            className={`w-full h-11 text-md font-bold rounded-xl shadow-lg transition-transform active:scale-95 
                                                ${isReached
                                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                                                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white hover:shadow-indigo-500/20"}`}
                                            onClick={() => { setSelectedGoalForDeposit(goal); setIsDepositOpen(true); }}
                                            disabled={isReached}
                                        >
                                            {isReached ? "Tercapai! 🎉" : "Tabung Sekarang (+)"}
                                        </Button>
                                    </div>
                                </div>
                            </ScaleIn>
                        );
                    })}
                </div>

                {/* --- DIALOGS --- */}

                {/* CREATE & EDIT DIALOG (GLASS) */}
                <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setIsEditOpen(false); } }}>
                    <DialogContent className="glass-card sm:max-w-[450px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-center">{isEditOpen ? "Edit Tujuan" : "Buat Tujuan Baru"}</DialogTitle>
                            <DialogDescription className="text-center">Sesuaikan detail impian finansialmu.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-6">
                            <div className="space-y-2">
                                <Label>Nama Tujuan</Label>
                                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Contoh: Beli Gadget Impian" className="bg-white/50 dark:bg-black/20 h-11" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Target (Rp)</Label>
                                    <CurrencyInput value={formTarget} onValueChange={setFormTarget} className="bg-white/50 dark:bg-black/20" placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deadline</Label>
                                    <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="bg-white/50 dark:bg-black/20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Icon</Label>
                                    <Select value={formIcon} onValueChange={setFormIcon}>
                                        <SelectTrigger className="bg-white/50 dark:bg-black/20"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <div className="grid grid-cols-5 gap-1 p-2">
                                                {ICONS.map(ic => <SelectItem key={ic} value={ic} className="justify-center flex cursor-pointer rounded-md hover:bg-black/5">{ic}</SelectItem>)}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Warna</Label>
                                    <Select value={formColor} onValueChange={setFormColor}>
                                        <SelectTrigger className="bg-white/50 dark:bg-black/20"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {COLORS.map(c => <SelectItem key={c} value={c}><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${colorMap[c]}`} /> <span className="capitalize">{c}</span></div></SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button disabled={isSubmitting} onClick={isEditOpen ? handleUpdate : handleCreate} className="w-full rounded-full h-12 text-md bg-indigo-600 hover:bg-indigo-700">
                                {isEditOpen ? "Simpan Perubahan" : "Mulai Petualangan Ini"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* DEPOSIT DIALOG (ATM STYLE) */}
                <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                    <DialogContent className="glass-card sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-center flex flex-col items-center gap-2">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
                                    <PiggyBank className="w-8 h-8" />
                                </div>
                                <span>Menabung ke {selectedGoalForDeposit?.name}</span>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-8">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">Rp</span>
                                <CurrencyInput
                                    className="text-3xl font-bold h-16 pl-12 text-center bg-white/60 dark:bg-black/40 rounded-2xl border-2 border-transparent focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 transition-all font-mono tracking-wider"
                                    placeholder="0"
                                    value={depositAmount}
                                    onValueChange={setDepositAmount}
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                <Button variant="outline" className="rounded-xl border-dashed border-2 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => setDepositAmount("100000")}>+100k</Button>
                                <Button variant="outline" className="rounded-xl border-dashed border-2 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => setDepositAmount("500000")}>+500k</Button>
                                <Button variant="outline" className="rounded-xl border-dashed border-2 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => setDepositAmount("1000000")}>+1jt</Button>
                            </div>
                        </div>
                        <div className="px-6 pb-2">
                            <Label className="mb-2 block text-muted-foreground text-xs font-bold uppercase tracking-wider">Sumber Dana</Label>
                            <Select value={depositAccountId} onValueChange={setDepositAccountId}>
                                <SelectTrigger className="w-full h-12 bg-white/50 dark:bg-black/20 rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Pilih Akun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts?.map((acc: any) => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            <span className="flex items-center gap-2">
                                                <span>{acc.name}</span>
                                                <span className="text-muted-foreground text-xs ml-auto">
                                                    (Rp {parseInt(acc.balance).toLocaleString('id-ID')})
                                                </span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-full h-12 text-md font-bold shadow-lg shadow-emerald-500/20" onClick={handleDeposit}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Konfirmasi Setoran 💸"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <SuccessDialog
                    open={successOpen}
                    onOpenChange={setSuccessOpen}
                    title={successTitle}
                    description={successMessage}
                />
            </div>
        </div>
    );
}
