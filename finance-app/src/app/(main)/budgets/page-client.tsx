"use client";

import { useEffect, useState, useMemo } from "react";
import { FadeIn, ScaleIn } from "@/components/ui/motion-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    AlertCircle, TrendingUp, CheckCircle2, Wallet, PiggyBank, Edit2, Sparkles,
    Plus, Trash2, MoreVertical, LayoutGrid, Tag, Pencil, Loader2
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/categories";
import { updateCategoryBudgetLimit } from "@/lib/actions/finance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BudgetCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: string;
    spent: number;
    limit: number;
}

const colorMap: Record<string, string> = {
    blue: "bg-blue-500", red: "bg-red-500", green: "bg-emerald-500", orange: "bg-orange-500",
    purple: "bg-violet-500", pink: "bg-pink-500", cyan: "bg-cyan-500", yellow: "bg-amber-500",
    indigo: "bg-indigo-500", slate: "bg-slate-500"
};

const hexMap: Record<string, string> = {
    blue: "#3b82f6", red: "#ef4444", green: "#10b981", orange: "#f97316",
    purple: "#8b5cf6", pink: "#ec4899", cyan: "#06b6d4", yellow: "#f59e0b",
    indigo: "#6366f1", slate: "#64748b"
};

const ICONS = ["🍔", "🚌", "🛍️", "💡", "🎬", "🏥", "📦", "✈️", "🏠", "📚", "🎮", "⚽", "🎵", "📷", "💅", "🍼", "🔧", "💻", "💸"];
const COLORS = ["blue", "green", "orange", "purple", "pink", "cyan", "yellow", "red", "indigo", "slate"];

export default function BudgetsPageClient({ initialData }: { initialData: BudgetCategory[] }) {
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);

    // States
    const [editingCategoryLimit, setEditingCategoryLimit] = useState<BudgetCategory | null>(null);
    const [limitValue, setLimitValue] = useState("");

    const [isEditDetailOpen, setIsEditDetailOpen] = useState(false);
    const [editingDetail, setEditingDetail] = useState<BudgetCategory | null>(null);
    const [editName, setEditName] = useState("");
    const [editIcon, setEditIcon] = useState("");
    const [editColor, setEditColor] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createName, setCreateName] = useState("");
    const [createIcon, setCreateIcon] = useState("📦");
    const [createColor, setCreateColor] = useState("blue");

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete & Success States
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<BudgetCategory | null>(null);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        setLoaded(true);
    }, []);

    const refreshData = () => {
        router.refresh();
    };

    // --- ACTIONS ---

    const handleSaveLimit = async () => {
        if (!editingCategoryLimit) return;
        const val = parseInt(limitValue.replace(/\D/g, "") || "0");

        const toastId = toast.loading("Menyimpan limit...");
        const res = await updateCategoryBudgetLimit(editingCategoryLimit.id, val);

        if (res.success) {
            toast.success("Limit budget disimpan", { id: toastId });
            setEditingCategoryLimit(null);
            refreshData();
        } else {
            toast.error("Gagal menyimpan limit", { id: toastId });
        }
    };

    const handleCreate = async () => {
        if (!createName.trim()) {
            toast.error("Nama kategori wajib diisi");
            return;
        }
        setIsSubmitting(true);
        const res = await createCategory({
            name: createName,
            type: 'expense',
            icon: createIcon,
            color: createColor
        });
        setIsSubmitting(false);
        if (res.success) {
            setIsCreateOpen(false);
            setCreateName("");
            toast.success("Kategori berhasil dibuat");
            refreshData();
        } else {
            toast.error(res.error || "Gagal membuat kategori");
        }
    };

    const openEditDetail = (cat: BudgetCategory) => {
        setEditingDetail(cat);
        setEditName(cat.name);
        setEditIcon(cat.icon);
        setEditColor(cat.color);
        setIsEditDetailOpen(true);
    };

    const handleUpdateCategory = async () => {
        if (!editingDetail || !editName.trim()) {
            toast.error("Nama kategori tidak boleh kosong");
            return;
        }
        setIsSubmitting(true);
        const res = await updateCategory({
            id: editingDetail.id,
            name: editName,
            icon: editIcon,
            color: editColor
        });
        setIsSubmitting(false);
        if (res.success) {
            setIsEditDetailOpen(false);
            toast.success("Kategori berhasil diupdate");
            refreshData();
        } else {
            toast.error(res.error || "Gagal update kategori");
        }
    };

    const handleDelete = (cat: BudgetCategory) => {
        setCategoryToDelete(cat);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        setIsSubmitting(true);
        const res = await deleteCategory(categoryToDelete.id);
        setIsSubmitting(false);

        if (res.success) {
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
            setSuccessMessage(res.message || "Kategori berhasil dihapus");
            setSuccessDialogOpen(true);
            refreshData();
        } else {
            toast.error(res.error || "Gagal menghapus kategori");
        }
    };

    const openEditLimit = (cat: BudgetCategory) => {
        setEditingCategoryLimit(cat);
        setLimitValue((cat.limit || 0).toString());
    };

    // --- RENDER ---

    const budgetData = useMemo(() => {
        return initialData
            .filter(cat => {
                // Filter requests from user:
                // 1. Hide "Tanpa Kategori" if no limit is set (regardless of spending)
                if (cat.name === "Tanpa Kategori" && (cat.limit || 0) === 0) return false;

                // Keep other inactive categories visible so users can see/edit newly created ones

                return true;
            })
            .map(cat => {
                const limit = cat.limit || 0;
                const progress = limit > 0 ? (cat.spent / limit) * 100 : 0;
                const status = progress > 100 ? 'over' : progress > 80 ? 'warning' : 'good';
                return { ...cat, limit, progress, status };
            }).sort((a, b) => {
                if (a.status === 'over' && b.status !== 'over') return -1;
                if (b.status === 'over' && a.status !== 'over') return 1;
                if (a.limit > 0 && b.limit === 0) return -1;
                if (b.limit > 0 && a.limit === 0) return 1;
                return b.spent - a.spent;
            });
    }, [initialData]);

    const totals = useMemo(() => {
        const totalBudget = budgetData.reduce((acc, curr) => acc + curr.limit, 0);
        const totalSpent = budgetData.reduce((acc, curr) => acc + curr.spent, 0);
        const totalBudgetedSpent = budgetData.filter(c => c.limit > 0).reduce((acc, curr) => acc + curr.spent, 0);
        return { totalBudget, totalSpent, totalBudgetedSpent };
    }, [budgetData]);

    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

    const chartData = budgetData.filter(c => c.limit > 0 || c.spent > 0).slice(0, 8).map(c => ({
        name: c.name,
        Budget: c.limit,
        Actual: c.spent,
        color: hexMap[c.color] || "#64748b"
    }));

    if (!loaded) return null;

    return (
        <div className="min-h-screen font-sans bg-transparent pb-20">
            {/* Background Decor */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
                <FadeIn>
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                Anggaran & Planning
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-light">
                                Kelola alokasi dana bulanan Anda dengan bijak dan estetis.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <ThemeToggle />
                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 border-0 transition-transform hover:scale-105">
                                        <Plus className="w-5 h-5 mr-2" /> Kategori Baru
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="glass-card sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Buat Kategori Baru</DialogTitle>
                                        <DialogDescription>Tambahkan pos pengeluaran baru.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Nama Kategori</Label>
                                            <Input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Misal: Hobi & Game" className="bg-white/50 dark:bg-black/20" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Icon</Label>
                                                <Select value={createIcon} onValueChange={setCreateIcon}>
                                                    <SelectTrigger className="bg-white/50 dark:bg-black/20"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <div className="grid grid-cols-5 gap-1 p-2">
                                                            {ICONS.map(ic => <SelectItem key={ic} value={ic} className="justify-center flex cursor-pointer rounded-md hover:bg-black/5 dark:hover:bg-white/10">{ic}</SelectItem>)}
                                                        </div>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Warna</Label>
                                                <Select value={createColor} onValueChange={setCreateColor}>
                                                    <SelectTrigger className="bg-white/50 dark:bg-black/20"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {COLORS.map(c => (
                                                            <SelectItem key={c} value={c}><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${colorMap[c]}`} /> <span className="capitalize">{c}</span></div></SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button disabled={isSubmitting} onClick={handleCreate} className="rounded-full">
                                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Simpan
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </header>
                </FadeIn>

                {/* Summary Cards - Glass Panel */}
                <FadeIn delay={0.1}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-900/40 border border-emerald-100/50 dark:border-emerald-500/20 p-6 backdrop-blur-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-24 h-24 text-emerald-600" /></div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Total Target Budget</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totals.totalBudget)}</h3>
                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-xs font-bold">Bulanan</span>
                                <span>Alokasi dana Anda</span>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-500/20 dark:to-indigo-900/40 border border-blue-100/50 dark:border-blue-500/20 p-6 backdrop-blur-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-24 h-24 text-blue-600" /></div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Terpakai Real-time</p>
                            <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totals.totalSpent)}</h3>
                            <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                    style={{ width: `${totals.totalBudget > 0 ? Math.min((totals.totalSpent / totals.totalBudget) * 100, 100) : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className={`relative overflow-hidden rounded-[2rem] border p-6 backdrop-blur-xl transition-colors duration-500
                            ${totals.totalBudget - totals.totalBudgetedSpent >= 0
                                ? 'bg-gradient-to-br from-white/60 to-slate-50/60 dark:from-zinc-800/60 dark:to-zinc-900/60 border-indigo-100/50 dark:border-indigo-500/20'
                                : 'bg-gradient-to-br from-rose-500/10 to-orange-500/5 dark:from-rose-500/20 dark:to-rose-900/40 border-rose-100/50 dark:border-rose-500/20'}`}>

                            <div className="absolute top-0 right-0 p-4 opacity-10"><PiggyBank className="w-24 h-24 text-indigo-600" /></div>
                            <p className={`text-sm font-medium uppercase tracking-wider mb-1 ${totals.totalBudget - totals.totalBudgetedSpent >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {totals.totalBudget - totals.totalBudgetedSpent >= 0 ? 'Sisa Budget Tersedia' : 'Over Budget!'}
                            </p>
                            <h3 className={`text-4xl font-bold ${totals.totalBudget - totals.totalBudgetedSpent >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600 dark:text-rose-300'}`}>
                                {formatCurrency(Math.abs(totals.totalBudget - totals.totalBudgetedSpent))}
                            </h3>
                            <p className="mt-4 text-sm text-muted-foreground">
                                {totals.totalBudget - totals.totalBudgetedSpent >= 0
                                    ? "Masih aman untuk saving/investasi."
                                    : "Anda melebihi rencana pengeluaran!"}
                            </p>
                        </div>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Budget List */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h2 className="text-xl font-bold flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-emerald-500" /> Kategori Pengeluaran</h2>
                            <span className="text-sm text-muted-foreground">{budgetData.length} Kategori terdaftar</span>
                        </div>

                        {budgetData.map((cat, i) => (
                            <ScaleIn key={cat.id} delay={i * 0.05}>
                                <div className={`group relative rounded-[1.5rem] p-5 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] border backdrop-blur-md
                                    ${cat.status === 'over'
                                        ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'
                                        : 'bg-white/70 dark:bg-zinc-900/70 border-white/40 dark:border-white/10 hover:border-emerald-500/30'}`}>

                                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Icon Box */}
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110 
                                                ${cat.status === 'over' ? 'bg-rose-100 text-rose-500' : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-700 text-slate-700 dark:text-slate-200'}`}>
                                                {cat.icon}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{cat.name}</h3>
                                                    {cat.status === 'over' && <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full">OVER</span>}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-semibold text-slate-600 dark:text-slate-400">{formatCurrency(cat.spent)}</span>
                                                    <span className="text-muted-foreground">dari</span>
                                                    <span className="font-semibold text-slate-900 dark:text-white">{cat.limit > 0 ? formatCurrency(cat.limit) : "∞ (No Limit)"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pl-16 sm:pl-0">
                                            {/* Percentage Badge */}
                                            <div className={`text-right ${cat.limit === 0 ? 'opacity-50' : ''}`}>
                                                <span className={`text-2xl font-black ${cat.status === 'over' ? 'text-rose-500' : cat.status === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                    {cat.limit > 0 ? Math.round(cat.progress) : 0}<span className="text-sm font-medium">%</span>
                                                </span>
                                            </div>

                                            {/* Action Menu */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-200/50 dark:hover:bg-zinc-700/50"><MoreVertical className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass-card">
                                                    <DropdownMenuItem onSelect={() => openEditLimit(cat)} className="cursor-pointer font-medium"><TrendingUp className="w-4 h-4 mr-2" /> Atur Limit Budget</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => openEditDetail(cat)} className="cursor-pointer font-medium"><Pencil className="w-4 h-4 mr-2" /> Edit Info Kategori</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={() => handleDelete(cat)} className="text-rose-600 focus:text-rose-600 cursor-pointer font-medium"><Trash2 className="w-4 h-4 mr-2" /> Hapus Kategori</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-5 relative h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full 
                                                ${cat.status === 'over' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                                                    cat.status === 'warning' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                                        cat.limit > 0 ? `bg-gradient-to-r ${colorMap[cat.color]?.replace('bg-', 'from-') || 'from-emerald-400'} to-teal-500` : 'bg-transparent'}`}
                                            style={{ width: `${cat.limit > 0 ? Math.min(cat.progress, 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </ScaleIn>
                        ))}
                    </div>

                    {/* Sidebar / Charts */}
                    <div className="space-y-6">
                        <Card className="glass-card border-none shadow-xl h-auto">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400" /> Analisis Visual</CardTitle>
                                <CardDescription>Perbandingan Realisasi vs Budget</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }} barGap={2}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }} interval={0} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255, 255, 255, 0.8)', padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                            formatter={(value: number) => [formatCurrency(value), ""]}
                                        />
                                        <Bar dataKey="Budget" fill="#e2e8f0" barSize={8} radius={[0, 4, 4, 0]} className="fill-slate-200 dark:fill-zinc-700" />
                                        <Bar dataKey="Actual" barSize={8} radius={[0, 4, 4, 0]}>
                                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.Actual > entry.Budget && entry.Budget > 0 ? '#ef4444' : entry.color} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Dialog open={!!editingCategoryLimit} onOpenChange={(open) => !open && setEditingCategoryLimit(null)}>
                    <DialogContent className="glass-card sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl">Atur Limit Bulanan</DialogTitle>
                            <DialogDescription className="text-center">Kategori: <span className="font-bold text-foreground">{editingCategoryLimit?.name}</span></DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-6">
                            <div className="text-center p-6 bg-slate-50/50 dark:bg-zinc-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-700">
                                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Terpakai Saat Ini</span>
                                <div className="text-3xl font-black mt-2 text-slate-700 dark:text-slate-200">{editingCategoryLimit ? formatCurrency(editingCategoryLimit.spent) : 0}</div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-center block text-muted-foreground">Target Maksimal (Rp)</Label>
                                <CurrencyInput
                                    value={limitValue}
                                    onValueChange={setLimitValue}
                                    placeholder="0"
                                    className="text-3xl font-mono text-center h-16 rounded-2xl bg-white/60 dark:bg-black/40 border-slate-200/60 focus:ring-4 focus:ring-emerald-500/20 transition-all font-bold tracking-tight"
                                />
                                <div className="flex justify-center gap-2 flex-wrap">
                                    <Button variant="outline" size="sm" onClick={() => editingCategoryLimit && setLimitValue(Math.ceil(editingCategoryLimit.spent * 1.1).toString())} className="rounded-full text-xs">+10% dari spent</Button>
                                    <Button variant="outline" size="sm" onClick={() => editingCategoryLimit && setLimitValue(Math.ceil(editingCategoryLimit.spent).toString())} className="rounded-full text-xs">Samakan dgn spent</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setLimitValue("0")} className="rounded-full text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50">Reset (No Limit)</Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-center">
                            <Button size="lg" onClick={handleSaveLimit} className="w-full sm:w-auto rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20">Simpan Perubahan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDetailOpen} onOpenChange={setIsEditDetailOpen}>
                    <DialogContent className="glass-card">
                        <DialogHeader>
                            <DialogTitle>Edit Info Kategori</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Nama Kategori</Label>
                                <Input value={editName} onChange={e => setEditName(e.target.value)} className="bg-white/50 dark:bg-black/20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Icon</Label>
                                    <Select value={editIcon} onValueChange={setEditIcon}>
                                        <SelectTrigger className="bg-white/50 dark:bg-black/20"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <div className="grid grid-cols-5 gap-1 p-2">
                                                {ICONS.map(ic => <SelectItem key={ic} value={ic} className="justify-center flex">{ic}</SelectItem>)}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Warna</Label>
                                    <Select value={editColor} onValueChange={setEditColor}>
                                        <SelectTrigger className="bg-white/50 dark:bg-black/20"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {COLORS.map(c => <SelectItem key={c} value={c}><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${colorMap[c]}`} /> {c}</div></SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button disabled={isSubmitting} onClick={handleUpdateCategory} className="rounded-full">Update Info</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Alert */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent className="glass-card border-rose-200 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/90">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" /> Hapus Kategori?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
                                Anda akan menghapus kategori <span className="font-bold text-foreground">"{categoryToDelete?.name}"</span>.
                                <br /><br />
                                • Limit budget akan dihapus.
                                <br />
                                • Transaksi yang sudah ada akan dipindahkan ke kategori lain ("Lainnya" atau "Tanpa Kategori").
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white rounded-full">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                {isSubmitting ? "Menghapus..." : "Ya, Hapus Permanen"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Success Dialog Popup */}
                <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                    <DialogContent className="glass-card sm:max-w-sm text-center">
                        <DialogHeader className="hidden">
                            <DialogTitle>Notifikasi Sukses</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-xl font-bold text-center text-emerald-600 dark:text-emerald-400">Berhasil!</DialogTitle>
                                <p className="text-muted-foreground">{successMessage}</p>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-center">
                            <Button onClick={() => setSuccessDialogOpen(false)} className="rounded-full bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                                OK, Mengerti
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}
