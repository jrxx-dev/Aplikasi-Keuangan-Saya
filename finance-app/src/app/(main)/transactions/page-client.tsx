"use client";

import { useState, useMemo } from "react";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { TransactionForm } from "@/components/finance/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CategoryManager } from "@/components/finance/category-manager";
import { AccountManager } from "@/components/finance/account-manager";
import { TopExpenseWidget, TopIncomeWidget } from "@/components/finance/income-expense-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft, ChevronRight, Wallet, Tag, Download, RefreshCw, Plus, Clock,
    ArrowUpRight, ArrowDownRight, Info, Brain, Keyboard, Mic, Calendar as CalendarIcon,
    Search, Filter, TrendingUp, TrendingDown, MoreHorizontal, Edit, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, subMonths, addMonths, startOfMonth, endOfMonth, isSameMonth, parseISO, isWithinInterval } from "date-fns";
import { id } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

import { deleteTransaction, updateTransaction } from "@/lib/actions/finance";

interface Transaction {
    id: string;
    description: string | null;
    amount: string;
    date: Date;
    type: "income" | "expense" | "transfer";
    category: string | null;
    categoryIcon: string | null;
    accountName?: string;
    source?: string;
}

export default function TransactionsClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
    // State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | "income" | "expense" | "saving">("all");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showFormDialog, setShowFormDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const itemsPerPage = 15; // Increased per page

    // Month Navigation
    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
    const isCurrentMonth = isSameMonth(currentMonth, new Date());

    // Filter Logic
    const filteredData = useMemo(() => {
        return initialTransactions.filter(item => {
            const itemDate = new Date(item.date);

            // Month Filter
            const matchesMonth = isSameMonth(itemDate, currentMonth);

            // Search Filter
            const matchesSearch = (item.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (item.category || "").toLowerCase().includes(searchQuery.toLowerCase());

            // Type Filter
            const matchesType = filterType === "all"
                ? true
                : filterType === "saving"
                    ? (item.source === 'manual_saving' || item.category === 'Tabungan')
                    : item.type === filterType;

            return matchesMonth && matchesSearch && matchesType;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [initialTransactions, currentMonth, searchQuery, filterType]);

    // Comparison Logic (Previous Month)
    const prevMonthData = useMemo(() => {
        const prevMonthDate = subMonths(currentMonth, 1);
        return initialTransactions.filter(item => isSameMonth(new Date(item.date), prevMonthDate));
    }, [initialTransactions, currentMonth]);

    // Summary Statistics (Current Month)
    const summary = useMemo(() => filteredData.reduce((acc, curr) => {
        const amount = parseFloat(curr.amount);
        if (curr.type === 'income') {
            acc.income += amount;
            acc.balance += amount;
        } else {
            acc.expense += amount;
            acc.balance -= amount;
        }
        return acc;
    }, { income: 0, expense: 0, balance: 0 }), [filteredData]);

    // Summary Statistics (Previous Month for Comparison)
    const prevSummary = useMemo(() => prevMonthData.reduce((acc, curr) => {
        const amount = parseFloat(curr.amount);
        if (curr.type === 'income') acc.income += amount;
        else acc.expense += amount;
        return acc;
    }, { income: 0, expense: 0 }), [prevMonthData]);

    // Calculate Percent Changes
    const expenseChange = prevSummary.expense > 0 ? ((summary.expense - prevSummary.expense) / prevSummary.expense) * 100 : 0;
    const incomeChange = prevSummary.income > 0 ? ((summary.income - prevSummary.income) / prevSummary.income) * 100 : 0;

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

    // Grouping Logic
    const groupedTransactions = currentData.reduce((groups, transaction) => {
        const date = new Date(transaction.date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let dateKey = format(date, 'EEEE, d MMMM yyyy', { locale: id });

        if (date.toDateString() === today.toDateString()) dateKey = "Hari Ini";
        else if (date.toDateString() === yesterday.toDateString()) dateKey = "Kemarin";

        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    // Export Functionality
    const handleExport = () => {
        const csvRows = [
            ["Tanggal", "Deskripsi", "Kategori", "Tipe", "Jumlah", "Akun"],
            ...filteredData.map(t => [
                format(new Date(t.date), 'yyyy-MM-dd'),
                `"${t.description || ''}"`,
                t.category || '',
                t.type,
                t.amount,
                t.accountName || ''
            ])
        ];
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        const fileName = `transaksi-${format(currentMonth, 'MMM-yyyy')}.csv`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
    };

    // Handle Delete Transaction
    const handleDelete = async () => {
        if (!selectedTransaction) return;

        setIsDeleting(true);
        try {
            const result = await deleteTransaction(selectedTransaction.id);
            if (result.success) {
                setSelectedTransaction(null);
                window.location.reload(); // Refresh to show updated data
            } else {
                alert(result.error || "Gagal menghapus transaksi");
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Terjadi kesalahan saat menghapus transaksi");
        } finally {
            setIsDeleting(false);
        }
    };


    // Handle Bulk Delete
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} transaksi?`)) return;

        setIsDeleting(true);
        try {
            // Sequential delete for now as existing action is single
            // Ideally we should have a bulk delete action
            for (const id of selectedIds) {
                await deleteTransaction(id);
            }
            setSelectedIds([]);
            window.location.reload();
        } catch (error) {
            console.error("Error/Bulk delete:", error);
            alert("Gagal menghapus beberapa transaksi");
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredData.map(t => t.id));
        }
    };

    // Handle Edit Transaction
    const handleEdit = () => {
        if (!selectedTransaction) return;
        setEditMode(true);
        setShowFormDialog(true);
        // Keep selectedTransaction open so form can access it
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-4 md:p-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/80 via-purple-50/50 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-transparent pointer-events-none" />

            <div className="max-w-[1400px] mx-auto space-y-8 relative z-10">
                {/* 1. HEADER & CONTROLS */}
                <FadeIn>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Transaksi
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                                    {format(currentMonth, 'MMMM yyyy', { locale: id })}
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">Kelola dan pantau arus kas Anda.</p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {/* Month Navigator */}
                            <div className="flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full p-1 shadow-sm mr-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={handlePrevMonth}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="px-4 font-semibold text-sm w-[140px] text-center capitalize">
                                    {format(currentMonth, 'MMMM yyyy', { locale: id })}
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={handleNextMonth} disabled={isCurrentMonth && false}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-10 gap-2 border-dashed">
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Refresh</span>
                            </Button>
                            <ThemeToggle />
                        </div>
                    </div>
                </FadeIn>

                {/* 2. OVERVIEW CARDS */}
                <FadeIn delay={0.1}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Income Card */}
                        <div className="relative group overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-zinc-900 p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                                    <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                {incomeChange !== 0 && (
                                    <Badge variant="outline" className={cn("bg-white/50 dark:bg-black/20 backdrop-blur-sm border-0", incomeChange > 0 ? "text-emerald-600" : "text-rose-600")}>
                                        {incomeChange > 0 ? "+" : ""}{incomeChange.toFixed(0)}%
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-1 relative z-10">
                                <p className="text-sm font-medium text-emerald-900/60 dark:text-emerald-200/60">Total Pemasukan</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    Rp {summary.income.toLocaleString('id-ID')}
                                </h3>
                            </div>
                        </div>

                        {/* Expense Card */}
                        <div className="relative group overflow-hidden rounded-2xl border border-rose-100 dark:border-rose-900/50 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/40 dark:to-zinc-900 p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-xl">
                                    <ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                {expenseChange !== 0 && (
                                    <Badge variant="outline" className={cn("bg-white/50 dark:bg-black/20 backdrop-blur-sm border-0", expenseChange < 0 ? "text-emerald-600" : "text-rose-600")}>
                                        {expenseChange > 0 ? "+" : ""}{expenseChange.toFixed(0)}%
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-1 relative z-10">
                                <p className="text-sm font-medium text-rose-900/60 dark:text-rose-200/60">Total Pengeluaran</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    Rp {summary.expense.toLocaleString('id-ID')}
                                </h3>
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className="relative group overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-zinc-900 p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="p-1 px-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-600 dark:text-blue-300">
                                    Net
                                </div>
                            </div>
                            <div className="space-y-1 relative z-10">
                                <p className="text-sm font-medium text-blue-900/60 dark:text-blue-200/60">Selisih Bersih</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    Rp {summary.balance.toLocaleString('id-ID')}
                                </h3>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* 3. MAIN CONTENT: LIST + SIDEBAR */}
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT: Transaction List (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                        <FadeIn delay={0.2}>
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Cari transaksi..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black/40 rounded-xl border-none text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
                                    <Button
                                        variant={filterType === 'all' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setFilterType('all')}
                                        className="rounded-lg h-9 text-xs"
                                    >
                                        Semua
                                    </Button>
                                    <Button
                                        variant={filterType === 'income' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setFilterType('income')}
                                        className="rounded-lg h-9 text-xs text-emerald-600 dark:text-emerald-400"
                                    >
                                        Pemasukan
                                    </Button>
                                    <Button
                                        variant={filterType === 'expense' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setFilterType('expense')}
                                        className="rounded-lg h-9 text-xs text-rose-600 dark:text-rose-400"
                                    >
                                        Pengeluaran
                                    </Button>
                                    <Button
                                        variant={filterType === 'saving' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setFilterType('saving')}
                                        className="rounded-lg h-9 text-xs text-teal-600 dark:text-teal-400"
                                    >
                                        Tabungan
                                    </Button>
                                </div>
                            </div>

                            {/* SELECT ALL HEADER */}
                            {filteredData.length > 0 && (
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <Checkbox
                                        checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                        onCheckedChange={handleSelectAll}
                                        id="select-all"
                                    />
                                    <label htmlFor="select-all" className="text-xs font-medium text-muted-foreground cursor-pointer">
                                        Pilih Semua ({filteredData.length} item)
                                    </label>
                                </div>
                            )}

                            {/* List */}
                            <div className="mt-4 space-y-6">
                                {Object.keys(groupedTransactions).length > 0 ? (
                                    Object.entries(groupedTransactions).map(([dateLabel, transactions]) => (
                                        <div key={dateLabel} className="space-y-3">
                                            <div className="flex items-center gap-3 pl-1">
                                                <Badge variant="outline" className="bg-transparent border-gray-200 dark:border-zinc-800 text-muted-foreground font-medium rounded-md">
                                                    {dateLabel}
                                                </Badge>
                                                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-zinc-800" />
                                            </div>

                                            <div className="grid gap-2">
                                                {transactions.map((t) => {
                                                    const isIncome = t.type === 'income';
                                                    return (
                                                        <motion.div
                                                            key={t.id}
                                                            whileHover={{ scale: 1.005, backgroundColor: "rgba(var(--bg-hover), 0.5)" }}
                                                            className={`group bg-white dark:bg-zinc-900 border ${selectedIds.includes(t.id) ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-zinc-800/60'} p-3 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3`}
                                                            onClick={(e) => {
                                                                // If clicking specifically on checkbox or actions, don't open details
                                                                // But here we want the whole row to be select-friendly?
                                                                // Let's make clicking row OPEN details, but clicking checkbox SELECT.
                                                                setSelectedTransaction(t);
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div onClick={(e) => { e.stopPropagation(); }}>
                                                                    <Checkbox
                                                                        checked={selectedIds.includes(t.id)}
                                                                        onCheckedChange={() => toggleSelect(t.id)}
                                                                    />
                                                                </div>
                                                                <div className={cn(
                                                                    "w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-colors",
                                                                    isIncome ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600" : "bg-rose-50 dark:bg-rose-900/10 text-rose-600"
                                                                )}>
                                                                    {t.categoryIcon || (isIncome ? '💰' : '💸')}
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                        {t.description || "Tanpa Keterangan"}
                                                                    </span>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <span className="bg-gray-100 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                                                            {t.category || "Umum"}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="truncate">{t.accountName}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="text-right shrink-0 pl-2">
                                                                <p className={cn(
                                                                    "font-bold font-mono text-base md:text-lg flex items-center justify-end gap-1",
                                                                    isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                                )}>
                                                                    {isIncome ? "+" : "-"} {parseFloat(t.amount).toLocaleString('id-ID')}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground font-medium">
                                                                    {format(new Date(t.date), 'HH:mm')}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                                        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="font-medium text-lg">Tidak ada transaksi ditemukan</p>
                                        <p className="text-sm text-muted-foreground">Coba ubah periode bulan atau filter pencarian Anda.</p>
                                        <Button variant="outline" className="mt-4" onClick={handlePrevMonth}>Lihat Bulan Lalu</Button>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Hal {currentPage} dari {totalPages}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </FadeIn>
                    </div>

                    {/* RIGHT: Sidebar & Actions (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <FadeIn delay={0.3}>
                            {/* BULK ACTIONS TOOLBAR (Floating or sticky) */}
                            <AnimatePresence>
                                {selectedIds.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -20, height: 0 }}
                                        className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex flex-col gap-3 mb-6"
                                    >
                                        <div className="flex justify-between items-center bg-indigo-700/50 p-3 rounded-xl">
                                            <span className="font-bold flex items-center gap-2">
                                                <div className="bg-white text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                                                    {selectedIds.length}
                                                </div>
                                                Item Dipilih
                                            </span>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="h-8 text-indigo-200 hover:text-white hover:bg-indigo-500">
                                                Batal
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedIds.length === 1 && (
                                                <Button
                                                    onClick={() => {
                                                        const t = initialTransactions.find(t => t.id === selectedIds[0]);
                                                        if (t) {
                                                            setSelectedTransaction(t);
                                                            handleEdit();
                                                        }
                                                    }}
                                                    className="bg-white/10 hover:bg-white/20 border-none text-white font-semibold"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            )}
                                            <Button
                                                onClick={handleBulkDelete}
                                                disabled={isDeleting}
                                                className={`bg-rose-500 hover:bg-rose-600 border-none text-white font-semibold ${selectedIds.length > 1 ? 'col-span-2' : ''}`}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {isDeleting ? "Menghapus..." : `Hapus ${selectedIds.length} Item`}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions List */}
                            <Card className="border-none shadow-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden mb-6">
                                <CardHeader className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-zinc-800 pb-3">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Aksi Cepat</CardTitle>
                                </CardHeader>
                                <div className="p-2 grid grid-cols-1 gap-1">
                                    <button onClick={() => setShowFormDialog(true)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left group">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Transaksi Baru</p>
                                            <p className="text-xs text-muted-foreground">Catat pemasukan/pengeluaran</p>
                                        </div>
                                    </button>

                                    <AccountManager>
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left group w-full cursor-pointer">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                                <Wallet className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Kelola Akun</p>
                                                <p className="text-xs text-muted-foreground">Tambah atau edit sumber dana</p>
                                            </div>
                                        </div>
                                    </AccountManager>

                                    <CategoryManager>
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left group w-full cursor-pointer">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Kelola Kategori</p>
                                                <p className="text-xs text-muted-foreground">Tambah atau edit kategori transaksi</p>
                                            </div>
                                        </div>
                                    </CategoryManager>

                                    <div onClick={handleExport} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left group w-full cursor-pointer">
                                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                            <Download className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Export Data</p>
                                            <p className="text-xs text-muted-foreground">Unduh laporan CSV bulan ini</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Mini Analytics */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                                        <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-bold text-sm">Analitik Singkat</h3>
                                </div>
                                <Tabs defaultValue="expense" className="w-full">
                                    <TabsList className="w-full grid grid-cols-2 h-9 p-1 bg-gray-100 dark:bg-zinc-800 mb-4 rounded-lg">
                                        <TabsTrigger value="expense" className="text-xs rounded-md">Pengeluaran</TabsTrigger>
                                        <TabsTrigger value="income" className="text-xs rounded-md">Pemasukan</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="expense">
                                        <TopExpenseWidget data={currentData.map(t => ({
                                            ...t,
                                            categoryName: t.category || "Umum",
                                            categoryIcon: t.categoryIcon || undefined,
                                            description: t.description || ""
                                        }))} />
                                    </TabsContent>
                                    <TabsContent value="income">
                                        <TopIncomeWidget data={currentData.map(t => ({
                                            ...t,
                                            categoryName: t.category || "Umum",
                                            categoryIcon: t.categoryIcon || undefined,
                                            description: t.description || ""
                                        }))} />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>

            {/* DETAIL DIALOG - Reused exact same logic but cleaned up code */}
            <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
                <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden border-none bg-zinc-50 dark:bg-zinc-950 rounded-3xl shadow-2xl">
                    {selectedTransaction && (
                        <>
                            <div className={cn(
                                "h-32 w-full flex flex-col justify-end p-8 relative overflow-hidden",
                                selectedTransaction.type === 'income'
                                    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                                    : "bg-gradient-to-br from-rose-500 to-pink-600"
                            )}>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <DialogTitle className="text-white text-3xl font-black tracking-tight drop-shadow-md relative z-10">
                                    Detail Transaksi
                                </DialogTitle>
                                <DialogDescription className="text-white/80 font-medium pb-2 relative z-10">
                                    {format(new Date(selectedTransaction.date), 'dd MMMM yyyy', { locale: id })}
                                </DialogDescription>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="flex flex-col items-center py-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                                    <div className={cn(
                                        "absolute top-0 left-0 w-2 h-full",
                                        selectedTransaction.type === 'income' ? "bg-emerald-500" : "bg-rose-500"
                                    )} />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Nominal</p>
                                    <h2 className={cn(
                                        "text-4xl font-black tracking-tighter",
                                        selectedTransaction.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                    )}>
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(parseFloat(selectedTransaction.amount))}
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-800">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Tag className="w-4 h-4" /> Kategori
                                        </span>
                                        <span className="font-semibold">{selectedTransaction.category || "Umum"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-800">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Wallet className="w-4 h-4" /> Akun
                                        </span>
                                        <span className="font-semibold">{selectedTransaction.accountName || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-800">
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            {selectedTransaction.source === 'ai' ? <Brain className="w-4 h-4" /> : <Keyboard className="w-4 h-4" />} Input
                                        </span>
                                        <span className="font-semibold capitalize">{selectedTransaction.source || "Manual"}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Catatan</p>
                                    <p className="text-sm italic text-gray-700 dark:text-gray-300">
                                        "{selectedTransaction.description || "Tidak ada deskripsi"}"
                                    </p>
                                </div>

                                <DialogFooter className="flex-row gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleEdit}
                                        className="flex-1 py-6 rounded-xl font-bold text-base text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex-1 py-6 rounded-xl font-bold text-base text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {isDeleting ? "Menghapus..." : "Hapus"}
                                    </Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={showFormDialog} onOpenChange={(open) => {
                setShowFormDialog(open);
                if (!open) {
                    setEditMode(false);
                    setSelectedTransaction(null);
                }
            }}>
                <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden border-none bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
                    <div className="p-6">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-bold">
                                {editMode ? "Edit Transaksi" : "Catat Transaksi"}
                            </DialogTitle>
                        </DialogHeader>
                        <TransactionForm
                            onClose={() => {
                                setShowFormDialog(false);
                                setEditMode(false);
                                setSelectedTransaction(null);
                            }}
                            defaultType={filterType === 'all' ? 'expense' : filterType}
                            editTransaction={editMode && selectedTransaction ? {
                                id: selectedTransaction.id,
                                description: selectedTransaction.description,
                                amount: selectedTransaction.amount,
                                date: selectedTransaction.date,
                                type: selectedTransaction.type,
                                category: selectedTransaction.category
                            } : undefined}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
