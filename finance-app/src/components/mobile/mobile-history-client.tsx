"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { 
    Clock,
    X,
    ChevronRight,
    CheckCircle2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format, isSameDay, isSameWeek, isSameMonth, isSameYear } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MobileHistoryClientProps {
    transactions: any[];
}

export function MobileHistoryClient({ transactions }: MobileHistoryClientProps) {
    const [search, setSearch] = useState("");
    const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month" | "year">("month");
    const [typeFilter, setFilter] = useState<"all" | "income" | "expense">("all");
    const [selectedTx, setSelectedTx] = useState<any | null>(null);

    const filtered = useMemo(() => {
        console.log("Filtering with:", { typeFilter, timeFilter, search });
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            const now = new Date();

            const matchSearch = !search || (t.description?.toLowerCase() || "").includes(search.toLowerCase());
            
            // Normalize type comparison (handle potentially different casing from DB)
            const txType = t.type?.toLowerCase();
            const matchType = typeFilter === "all" ? true : txType === typeFilter.toLowerCase();
            
            let matchTime = true;
            if (timeFilter === 'day') matchTime = isSameDay(txDate, now);
            else if (timeFilter === 'week') matchTime = isSameWeek(txDate, now, { weekStartsOn: 1 });
            else if (timeFilter === 'month') matchTime = isSameMonth(txDate, now);
            else if (timeFilter === 'year') matchTime = isSameYear(txDate, now);

            return matchSearch && matchType && matchTime;
        });
    }, [transactions, search, typeFilter, timeFilter]);

    // Group by date
    const grouped = useMemo(() => {
        return filtered.reduce((acc, t) => {
            const date = new Date(t.date);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let dateKey = format(date, 'dd MMM yyyy', { locale: id });
            if (isSameDay(date, today)) dateKey = "Hari Ini";
            else if (isSameDay(date, yesterday)) dateKey = "Kemarin";

            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(t);
            return acc;
        }, {} as Record<string, any[]>);
    }, [filtered]);

    return (
        <div className="space-y-6 pb-20">
            {/* Search and Filters Area */}
            <section className="space-y-stack-md px-1">
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                    </div>
                    <Input 
                        placeholder="Cari transaksi..." 
                        className="block w-full pl-10 pr-3 py-6 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm transition-all focus:ring-primary focus:border-primary"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Chips Filter (Time Period) */}
                <div className="flex overflow-x-auto no-scrollbar gap-base pb-1">
                    {[
                        { id: 'day', label: 'Hari' },
                        { id: 'week', label: 'Minggu' },
                        { id: 'month', label: 'Bulan' },
                        { id: 'year', label: 'Tahun' }
                    ].map((chip) => (
                        <button 
                            key={chip.id}
                            onClick={() => setTimeFilter(chip.id as any)}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm border",
                                timeFilter === chip.id 
                                    ? "bg-primary text-white border-primary" 
                                    : "bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary border-outline-variant/30 dark:border-outline/50"
                            )}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>

                {/* Chips Filter 2 (Types) */}
                <div className="flex overflow-x-auto no-scrollbar gap-base py-1">
                    <button 
                        onClick={() => setFilter("all")} 
                        className={cn(
                            "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-sm",
                            typeFilter === 'all' ? "bg-primary text-white border-primary" : "bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary border-outline-variant/30 dark:border-outline/50"
                        )}
                    >
                        Semua
                    </button>
                    <button 
                        onClick={() => setFilter("income")} 
                        className={cn(
                            "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-sm flex items-center gap-1.5",
                            typeFilter === 'income' ? "bg-emerald-500 text-white border-emerald-500" : "bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary border-outline-variant/30 dark:border-outline/50"
                        )}
                    >
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_circle_down</span> Pemasukan
                    </button>
                    <button 
                        onClick={() => setFilter("expense")} 
                        className={cn(
                            "whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-sm flex items-center gap-1.5",
                            typeFilter === 'expense' ? "bg-rose-500 text-white border-rose-500" : "bg-surface-container dark:bg-inverse-surface text-on-surface dark:text-on-secondary border-outline-variant/30 dark:border-outline/50"
                        )}
                    >
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_circle_up</span> Pengeluaran
                    </button>
                </div>
            </section>

            {/* Transaction List */}
            <section className="space-y-stack-lg">
                {Object.entries(grouped).map(([date, txs], gi) => (
                    <div key={date} className="space-y-stack-md">
                        <h2 className="text-[12px] font-bold text-on-surface-variant dark:text-outline-variant px-2">{date}</h2>
                        <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl ambient-shadow p-2 space-y-1">
                            {(txs as any[]).map((tx: any, ti: number) => {
                                const isIncome = tx.type === 'income';
                                return (
                                    <React.Fragment key={tx.id}>
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: ti * 0.05 }}
                                            onClick={() => setSelectedTx(tx)}
                                            className="p-3 flex items-center justify-between rounded-lg hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center relative",
                                                    isIncome ? 'bg-primary-container/20 text-primary' : 'bg-rose-100 text-rose-600'
                                                )}>
                                                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
                                                        {isIncome ? 'account_balance_wallet' : (tx.category === 'KULINER' ? 'restaurant_menu' : 'shopping_cart')}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm text-on-surface dark:text-on-secondary truncate max-w-[140px] leading-tight">
                                                        {tx.description || "Transaksi"}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant dark:text-outline-variant font-medium">
                                                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'wght' 300" }}>schedule</span>
                                                        <span>{format(new Date(tx.date), 'HH:mm')}</span>
                                                        <span className="mx-0.5 opacity-30">•</span>
                                                        <span>{tx.accountName || "Cash"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={cn(
                                                    "font-black text-sm tabular-nums",
                                                    isIncome ? "text-primary dark:text-inverse-primary" : "text-on-surface dark:text-on-secondary"
                                                )}>
                                                    {isIncome ? '+' : '-'}{formatCurrency(Number(tx.amount), true)}
                                                </span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                                    isIncome ? "bg-primary-container/20 text-primary" : "bg-surface-variant dark:bg-secondary-container text-on-surface-variant dark:text-on-secondary"
                                                )}>
                                                    {tx.category || "Umum"}
                                                </span>
                                            </div>
                                        </motion.div>
                                        {(ti < (txs as any[]).length - 1) && (
                                            <div className="h-[1px] w-full bg-outline-variant/20 dark:bg-outline/20 mx-auto max-w-[95%]" />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                ))}
                
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                        <Clock className="w-12 h-12 mb-2" />
                        <p className="font-bold">Tidak ada riwayat</p>
                    </div>
                )}
            </section>

            {/* Transaction Details Modal (Faithful to Plan) */}
            <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
                <DialogContent className="sm:max-w-sm p-0 gap-0 border-none bg-surface-container-lowest dark:bg-inverse-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden focus:outline-none">
                    <div className="p-8 space-y-8">
                        <div className="flex justify-between items-start">
                            <div className={cn(
                                "w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg",
                                selectedTx?.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                            )}>
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {selectedTx?.type === 'income' ? 'payments' : 'receipt'}
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setSelectedTx(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">{selectedTx?.description || "Detail Transaksi"}</h3>
                            <p className={cn(
                                "text-4xl font-black tracking-tighter",
                                selectedTx?.type === 'income' ? "text-emerald-500" : "text-slate-900 dark:text-white"
                            )}>
                                {selectedTx?.type === 'income' ? '+' : '-'}{formatCurrency(Number(selectedTx?.amount || 0))}
                            </p>
                        </div>

                        <div className="space-y-1">
                            {/* Detail List */}
                            {[
                                { label: "Status", value: <div className="flex items-center gap-1.5 text-emerald-600 font-bold"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" /> Berhasil</div> },
                                { label: "Waktu", value: selectedTx ? format(new Date(selectedTx.date), 'HH:mm • dd MMM yyyy', { locale: id }) : "-" },
                                { label: "Metode", value: selectedTx?.accountName || "Cash" },
                                { label: "Kategori", value: <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-500 uppercase tracking-wider">{selectedTx?.category || "Umum"}</span> },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-6 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-white/5">
                        <Button onClick={() => setSelectedTx(null)} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20">Tutup</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
