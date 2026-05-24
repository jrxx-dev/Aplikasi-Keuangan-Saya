"use client";

import { useState, useEffect } from "react";
import { FadeIn, ScaleIn } from "@/components/ui/motion-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, CreditCard, CalendarClock, Trash2, Pencil, ShieldCheck, ShieldAlert, Bot, Sparkles, BrainCircuit, Loader2, Banknote, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDebtJson as createDebt, updateDebt, deleteDebtJson as deleteDebt, payDebtInstallment } from "@/lib/actions/debts";
import { CurrencyInput } from "@/components/ui/currency-input";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Debt {
    id: string;
    name: string;
    provider?: string | null;
    limitAmount: number;
    currentBalance: number;
    monthlyInstallment?: number;
    dueDate: Date | null;
    color: string | null;
}

interface Account {
    id: string;
    name: string;
    balance: string;
    type: string;
}

const colorMap: Record<string, string> = {
    blue: "bg-blue-500", red: "bg-red-500", green: "bg-emerald-500", orange: "bg-orange-500",
    purple: "bg-violet-500", pink: "bg-pink-500", cyan: "bg-cyan-500", yellow: "bg-amber-500",
    indigo: "bg-indigo-500", slate: "bg-slate-500"
};

const COLORS = ["blue", "red", "orange", "green", "purple", "cyan", "indigo"];

export default function DebtsPageClient({ initialDebts, accounts }: { initialDebts: Debt[], accounts: any[] }) {
    const router = useRouter();
    const [isThinking, setIsThinking] = useState(true);
    const [aiAnalysis, setAiAnalysis] = useState("");

    // CRUD States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Payment States
    const [isPayOpen, setIsPayOpen] = useState(false);
    const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
    const [payAmount, setPayAmount] = useState("");
    const [paySourceAccountId, setPaySourceAccountId] = useState("");

    // Success Dialog State
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [successTitle, setSuccessTitle] = useState("Berhasil!");

    // Form
    const [formName, setFormName] = useState("");
    const [formProvider, setFormProvider] = useState("");
    const [formLimit, setFormLimit] = useState("");
    const [formBalance, setFormBalance] = useState("");
    const [formMonthlyInstallment, setFormMonthlyInstallment] = useState("");
    const [formDate, setFormDate] = useState("");
    const [formColor, setFormColor] = useState("red");

    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

    // AI Analysis Logic
    useEffect(() => {
        setIsThinking(true);
        const timer = setTimeout(() => {
            const totalLimit = initialDebts.reduce((acc, d) => acc + d.limitAmount, 0);
            const totalUsed = initialDebts.reduce((acc, d) => acc + d.currentBalance, 0);
            const totalMonthly = initialDebts.reduce((acc, d) => acc + (d.monthlyInstallment || 0), 0);
            const usageRatio = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
            const nearDueItems = initialDebts.filter(d => d.dueDate && new Date(d.dueDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000);

            // Notify near due
            if (nearDueItems.length > 0) {
                toast.warning(`⚠️ Peringatan: Ada ${nearDueItems.length} tagihan yang akan jatuh tempo minggu ini. Siapkan dana!`, {
                    duration: 5000,
                });
            }

            let msg = "";
            let strategy = "";

            if (initialDebts.length === 0) {
                msg = "💡 Data kosong. Tambahkan akun Hutang/Paylater untuk mulai monitoring kesehatan kreditmu.";
            } else {
                if (usageRatio > 80) strategy = "STOP penggunaan kredit baru. Fokus lunasi hutang dengan bunga tertinggi dulu (Avalanche Method).";
                else if (usageRatio > 50) strategy = "Mulai berhati-hati. Pertimbangkan metode Snowball (lunasi yang terkecil dulu) untuk motivasi.";
                else strategy = "Pertahankan pembayaran tepat waktu untuk menjaga skor kredit.";

                const monthlyStr = totalMonthly > 0 ? ` Beban cicilanmu ${formatCurrency(totalMonthly)}/bulan.` : "";

                if (usageRatio > 80) {
                    msg = `🚨 STATUS: KRITIS! Rasio utang ${usageRatio.toFixed(0)}%.${monthlyStr} AI menyarankan: ${strategy}`;
                } else if (usageRatio > 50) {
                    msg = `⚠️ STATUS: WASPADA. Rasio utang ${usageRatio.toFixed(0)}%.${monthlyStr} AI menyarankan: ${strategy}`;
                } else {
                    msg = `✅ STATUS: AMAN. Rasio utang seha t(${usageRatio.toFixed(0)}%).${monthlyStr} ${strategy}`;
                }
            }
            setAiAnalysis(msg);
            setIsThinking(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [initialDebts]);

    // Handlers
    const resetForm = () => {
        setFormName(""); setFormProvider(""); setFormLimit(""); setFormBalance(""); setFormMonthlyInstallment(""); setFormDate(""); setFormColor("red");
    };

    const handleCreate = async () => {
        if (!formName || !formLimit) { toast.error("Nama dan Limit wajib diisi"); return; }
        setIsSubmitting(true);
        const res = await createDebt({
            name: formName,
            provider: formProvider,
            limitAmount: parseFloat(formLimit),
            currentBalance: parseFloat(formBalance || "0"),
            monthlyInstallment: parseFloat(formMonthlyInstallment || "0"),
            dueDate: formDate ? new Date(formDate) : undefined,
            color: formColor
        });
        setIsSubmitting(false);
        if (res.success) {
            setSuccessTitle("Hutang Tercatat!");
            setSuccessMessage(`Data hutang "${formName}" berhasil disimpan.`);
            setSuccessOpen(true);
            setIsCreateOpen(false);
            resetForm();
            router.refresh();
        } else {
            toast.error(res?.error || "Gagal menyimpan");
        }
    };

    const openEdit = (d: Debt) => {
        setEditingDebt(d);
        setFormName(d.name);
        setFormProvider(d.provider || "");
        setFormLimit(d.limitAmount.toString());
        setFormBalance(d.currentBalance.toString());
        setFormMonthlyInstallment((d.monthlyInstallment || 0).toString());
        setFormDate(d.dueDate ? format(new Date(d.dueDate), "yyyy-MM-dd") : "");
        setFormColor(d.color || "red");
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingDebt || !formName) return;
        setIsSubmitting(true);
        const res = await updateDebt({
            id: editingDebt.id,
            name: formName,
            provider: formProvider,
            limitAmount: parseFloat(formLimit),
            currentBalance: parseFloat(formBalance || "0"),
            monthlyInstallment: parseFloat(formMonthlyInstallment || "0"),
            dueDate: formDate ? new Date(formDate) : undefined,
            color: formColor
        });
        setIsSubmitting(false);
        if (res.success) {
            setSuccessTitle("Data Diupdate!");
            setSuccessMessage(`Perubahan pada "${formName}" berhasil disimpan.`);
            setSuccessOpen(true);
            setIsEditOpen(false);
            setEditingDebt(null);
            resetForm();
            router.refresh();
        } else {
            toast.error(res?.error || "Gagal update");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus data ini?")) return;
        const res = await deleteDebt(id);
        if (res.success) {
            toast.success("Data dihapus");
            router.refresh();
        } else {
            toast.error(res?.error || "Gagal hapus");
        }
    };

    const openPay = (d: Debt) => {
        setPayingDebt(d);
        // Default pay amount to monthly installment, or full balance if small
        setPayAmount(d.monthlyInstallment ? d.monthlyInstallment.toString() : d.currentBalance.toString());
        setIsPayOpen(true);
    };

    const handlePay = async () => {
        if (!payingDebt || !payAmount || !paySourceAccountId) {
            toast.error("Mohon lengkapi data pembayaran");
            return;
        }
        setIsSubmitting(true);
        const res = await payDebtInstallment({
            debtId: payingDebt.id,
            amount: parseFloat(payAmount),
            accountId: paySourceAccountId,
            date: new Date()
        });
        setIsSubmitting(false);
        if (res.success) {
            toast.success("Pembayaran berhasil dicatat!");
            setIsPayOpen(false);
            setPayingDebt(null);
            setPayAmount("");
            router.refresh();
        } else {
            toast.error(res?.error || "Pembayaran gagal");
        }
    };

    const totalLimit = initialDebts.reduce((acc, d) => acc + d.limitAmount, 0);
    const totalUsed = initialDebts.reduce((acc, d) => acc + d.currentBalance, 0);

    return (
        <div className="min-h-screen font-sans bg-transparent pb-20">
            {/* Background Decor */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[30%] w-[30%] h-[30%] bg-slate-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
                <FadeIn>
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent filter drop-shadow-sm">
                                Debt Manager.
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-light">
                                Kelola kewajiban, paylater, dan cicilan bulanan.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/30 gap-2 transition-transform hover:scale-105 h-12 px-6">
                                <PlusIcon className="w-5 h-5" /> Tambah Hutang
                            </Button>
                        </div>
                    </header>
                </FadeIn>

                {/* AI & STATS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <FadeIn delay={0.1} className="lg:col-span-2">
                        <Card className="glass-card border-rose-200/50 dark:border-rose-900/50 shadow-2xl relative overflow-hidden bg-gradient-to-r from-rose-500/5 to-slate-900/5 backdrop-blur-xl h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="w-48 h-48 text-rose-500" /></div>
                            <CardContent className="p-8 relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 shrink-0 shadow-inner backdrop-blur-md">
                                    <Bot className="w-10 h-10 text-rose-600 dark:text-rose-400 animate-pulse" />
                                </div>
                                <div className="space-y-3 flex-1">
                                    <h3 className="text-rose-600 dark:text-rose-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4" /> AI Debt Analyst
                                    </h3>
                                    <div className="min-h-[50px] flex items-center">
                                        {isThinking ? (
                                            <div className="flex items-center gap-3 text-rose-400 dark:text-rose-300 text-lg italic">
                                                <Sparkles className="w-5 h-5 animate-spin" /> Menganalisis cashflow...
                                            </div>
                                        ) : (
                                            <p className="text-slate-700 dark:text-slate-100 text-lg font-medium leading-relaxed">
                                                {aiAnalysis}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <div className="grid grid-cols-1 gap-4 h-full">
                            <Card className="glass-card bg-white/40 dark:bg-zinc-900/40 border-slate-200/50 dark:border-slate-800/50 hover:bg-white/60 dark:hover:bg-zinc-900/60 transition-colors">
                                <CardContent className="p-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Total Limit</p>
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(totalLimit)}</h3>
                                    </div>
                                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass-card bg-white/40 dark:bg-zinc-900/40 border-rose-200/50 dark:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-colors">
                                <CardContent className="p-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider mb-1">Total Hutang</p>
                                        <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(totalUsed)}</h3>
                                    </div>
                                    <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </FadeIn>
                </div>

                {/* DEBT LIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {initialDebts.map((debt, i) => {
                        const usage = (debt.currentBalance / debt.limitAmount) * 100;
                        const isDanger = usage > 80;
                        const isWarning = usage > 50;
                        const dueDays = debt.dueDate ? Math.ceil((new Date(debt.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

                        return (
                            <ScaleIn key={debt.id} delay={i * 0.1}>
                                <div className={`group relative glass-card rounded-[2rem] p-6 transition-all duration-500 hover:translate-y-[-5px] hover:shadow-2xl border flex flex-col justify-between h-full
                                    ${isDanger ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 shadow-rose-500/10' :
                                        isWarning ? 'bg-orange-50/80 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' :
                                            'bg-white/60 dark:bg-zinc-900/60 border-white/40 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-700'}`}>

                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${debt.color || "rose"}-500/20 to-transparent rounded-bl-full opacity-50 blur-xl`} />

                                    {/* HEADER */}
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div>
                                            <h3 className="text-xl font-bold truncate text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{debt.name}</h3>
                                            <p className="text-sm text-muted-foreground font-medium">{debt.provider || "Credit Provider"}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-zinc-700/50" onClick={() => openEdit(debt)}>
                                                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-rose-100/50 dark:hover:bg-rose-900/20" onClick={() => handleDelete(debt.id)}>
                                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* BODY */}
                                    <div className="space-y-4 relative z-10 flex-1">
                                        <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 border border-white/20 dark:border-white/5 shadow-sm">
                                            {/* Progress / Balance */}
                                            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                                <span>Terpakai</span>
                                                <span className={isDanger ? "text-rose-600" : isWarning ? "text-orange-500" : "text-emerald-500"}>{usage.toFixed(0)}%</span>
                                            </div>
                                            <div className="flex items-baseline gap-1 mb-3">
                                                <span className={`text-2xl font-black ${isDanger ? "text-rose-600" : "text-slate-800 dark:text-slate-200"}`}>{formatCurrency(debt.currentBalance)}</span>
                                                <span className="text-xs text-muted-foreground">/ {formatCurrency(debt.limitAmount)}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isDanger ? "bg-rose-600 animate-pulse" : isWarning ? "bg-orange-500" : "bg-emerald-500"}`}
                                                    style={{ width: `${Math.min(usage, 100)}%` }}
                                                />
                                            </div>

                                            {/* Monthly Installment - NEW FEATURE */}
                                            {debt.monthlyInstallment && debt.monthlyInstallment > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                                        <CalendarClock className="w-3.5 h-3.5" /> Cicilan/bln
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {formatCurrency(debt.monthlyInstallment)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Due Date Info */}
                                        <div className={`p-3 rounded-xl flex items-center gap-3 border ${dueDays !== null && dueDays <= 3 ? 'bg-rose-100/50 border-rose-200 text-rose-800 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300' : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                            <div className={`p-2 rounded-full ${dueDays !== null && dueDays <= 3 ? 'bg-rose-200 dark:bg-rose-800' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                <CalendarClock className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase font-bold opacity-70">Jatuh Tempo</p>
                                                <p className="text-sm font-bold">
                                                    {debt.dueDate ? format(new Date(debt.dueDate), "dd MMM yyyy", { locale: idLocale }) : "-"}
                                                </p>
                                            </div>
                                            {dueDays !== null && dueDays <= 7 && dueDays >= 0 && (
                                                <div className="px-2 py-1 bg-rose-600 text-white text-[10px] rounded-lg font-bold animate-bounce shadow-lg shadow-rose-500/30">
                                                    H-{dueDays}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* FOOTER - PAY BUTTON */}
                                    <div className="mt-6">
                                        <Button
                                            onClick={() => openPay(debt)}
                                            variant="outline"
                                            className="w-full rounded-xl border-dashed border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-solid transition-all group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 shadow-sm"
                                        >
                                            <Banknote className="w-4 h-4 mr-2" />
                                            Bayar Sekarang
                                        </Button>
                                    </div>
                                </div>
                            </ScaleIn>
                        );
                    })}
                    {initialDebts.length === 0 && !isThinking && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center glass-card rounded-[3rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-full mb-4">
                                <ShieldCheck className="w-16 h-16 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Bebas Hutang!</h3>
                            <p className="text-muted-foreground">Tidak ada hutang aktif. Pertahankan kesehatan finansial ini.</p>
                        </div>
                    )}
                </div>

                {/* CREATE / EDIT DIALOG */}
                <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setIsEditOpen(false); } }}>
                    <DialogContent className="glass-card sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-center">{isEditOpen ? "Edit Hutang" : "Tambah Hutang Baru"}</DialogTitle>
                            <DialogDescription className="text-center">Masukkan detail limit, saldo, dan cicilan.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Akun</Label>
                                    <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. KPR / Kartu Kredit" className="bg-white/50 dark:bg-black/20" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Provider</Label>
                                    <Input value={formProvider} onChange={e => setFormProvider(e.target.value)} placeholder="e.g. Bank ABC" className="bg-white/50 dark:bg-black/20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Total Limit (Rp)</Label>
                                    <CurrencyInput value={formLimit} onValueChange={setFormLimit} className="bg-white/50 dark:bg-black/20 font-mono font-bold" placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sisa Hutang (Rp)</Label>
                                    <CurrencyInput value={formBalance} onValueChange={setFormBalance} className="bg-white/50 dark:bg-black/20 font-mono font-bold text-rose-600" placeholder="0" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-rose-600 font-bold">Nominal Tagihan / Cicilan Perbulan (Rp)</Label>
                                <CurrencyInput value={formMonthlyInstallment} onValueChange={setFormMonthlyInstallment} className="bg-rose-50/50 dark:bg-rose-900/10 font-mono font-bold border-rose-200" placeholder="Optional" />
                                <p className="text-[10px] text-muted-foreground">Isi jika ada pembayaran rutin bulanan.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Jatuh Tempo Berikutnya</Label>
                                    <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="bg-white/50 dark:bg-black/20" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Warna Card</Label>
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
                            <Button disabled={isSubmitting} onClick={isEditOpen ? handleUpdate : handleCreate} className="w-full rounded-full h-12 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20 text-md font-bold">
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                {isEditOpen ? "Simpan Perubahan" : "Simpan Data"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* PAY DIALOG - NEW */}
                <Dialog open={isPayOpen} onOpenChange={(open) => { if (!open) setIsPayOpen(false); }}>
                    <DialogContent className="glass-card sm:max-w-[420px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-center">Bayar Hutang/Cicilan</DialogTitle>
                            <DialogDescription className="text-center">Pembayaran akan dicatat sebagai Pengeluaran.</DialogDescription>
                        </DialogHeader>
                        {payingDebt && (
                            <div className="py-4 space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed text-center">
                                    <p className="text-sm text-muted-foreground">Membayar untuk:</p>
                                    <p className="font-bold text-lg text-rose-600">{payingDebt.name}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Jumlah Pembayaran (Rp)</Label>
                                    <CurrencyInput value={payAmount} onValueChange={setPayAmount} className="h-12 text-lg font-bold text-center" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Sumber Dana (Akun)</Label>
                                    <Select value={paySourceAccountId} onValueChange={setPaySourceAccountId}>
                                        <SelectTrigger className="h-12 bg-white/50 dark:bg-black/20">
                                            <SelectValue placeholder="Pilih Akun..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts && accounts.length > 0 ? (
                                                accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        <div className="flex justify-between w-full min-w-[200px]">
                                                            <span>{acc.name}</span>
                                                            <span className="font-mono text-muted-foreground">{formatCurrency(parseFloat(acc.balance))}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-center text-muted-foreground">Tidak ada akun tersedia</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button disabled={isSubmitting} onClick={handlePay} className="w-full rounded-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg text-white font-bold">
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Banknote className="w-4 h-4 mr-2" />}
                                Konfirmasi Pembayaran
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
