"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Wallet, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";

interface Transaction {
    id: string;
    amount: string;
    description: string;
    date: Date;
    type: "income" | "expense" | "transfer";
    categoryName?: string;
    categoryIcon?: string;
}

interface WidgetProps {
    data: Transaction[];
}

function BaseTopWidget({ data, type }: { data: Transaction[], type: 'income' | 'expense' }) {
    const { topItem, otherItems } = useMemo(() => {
        // Filter by type
        const filtered = data.filter(t => t.type === type);
        // Sort DESC
        const sorted = [...filtered].sort((a, b) => Number(b.amount) - Number(a.amount));

        return {
            topItem: sorted[0] || null,
            otherItems: sorted.slice(1, 4) // Show up to 3 others
        };
    }, [data, type]);

    const isIncome = type === 'income';
    const config = isIncome ? {
        title: "Pemasukan Terbesar",
        icon: TrendingUp,
        arrow: ArrowUpRight,
        colorClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
        gradient: "from-emerald-100/50 to-emerald-50/10 dark:from-emerald-900/40 dark:to-emerald-900/10",
        border: "border-emerald-200/50 dark:border-emerald-700/30",
        textMain: "text-emerald-800 dark:text-emerald-200",
        emptyText: "Belum ada pemasukan"
    } : {
        title: "Pengeluaran Terbesar",
        icon: TrendingDown,
        arrow: ArrowDownLeft,
        colorClass: "text-rose-600 dark:text-rose-400",
        bgClass: "bg-rose-100 dark:bg-rose-900/30",
        gradient: "from-rose-100/50 to-rose-50/10 dark:from-rose-900/40 dark:to-rose-900/10",
        border: "border-rose-200/50 dark:border-rose-700/30",
        textMain: "text-rose-800 dark:text-rose-200",
        emptyText: "Belum ada pengeluaran"
    };

    const Icon = config.icon;
    const Arrow = config.arrow;

    if (!data.length && !topItem) {
        return (
            <Card className="h-full border-none shadow-sm bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${config.colorClass}`} />
                        {config.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-xs border-2 border-dashed rounded-xl gap-2">
                        <Wallet className="w-6 h-6 opacity-50" />
                        <span>{config.emptyText}</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full flex flex-col border-none bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-xl overflow-hidden rounded-3xl group hover:scale-[1.01] transition-transform duration-500">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${config.colorClass}`} />
                    {config.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                {/* TOP 1 CARD ONLY */}
                {topItem ? (
                    <div className="flex flex-col h-full gap-4">
                        <div className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${config.gradient} border ${config.border} shadow-sm flex-1 flex flex-col justify-between group-hover:shadow-md transition-all`}>
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Crown className="w-16 h-16 rotate-12" />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={`p-1.5 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'} text-white rounded-lg shadow-sm w-fit`}>
                                        <Crown className="w-4 h-4" />
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isIncome ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                                        Top #1
                                    </span>
                                </div>

                                <div className={`font-black text-3xl tracking-tight ${config.textMain} truncate mb-1`}>
                                    {new Intl.NumberFormat("id-ID", { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(topItem.amount))}
                                </div>
                                <div className="text-sm text-foreground/80 font-medium truncate">
                                    {topItem.description}
                                </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-4 bg-white/40 dark:bg-black/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                                <span>{new Date(topItem.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span className="mx-1">•</span>
                                <span>{topItem.categoryName || (isIncome ? 'Pemasukan' : 'Pengeluaran')}</span>
                            </div>
                        </div>

                        {/* OTHER ITEMS (Rank 2-4) */}
                        <div className="space-y-2 mt-auto">
                            {Array(3).fill(null).map((_, i) => {
                                const item = otherItems[i];
                                return item ? (
                                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`flex items-center justify-center w-6 h-6 rounded-md shadow-sm font-bold text-xs text-white ${isIncome ? 'bg-emerald-500/80' : 'bg-rose-500/80'}`}>
                                                {i + 2}
                                            </div>
                                            <div className="min-w-0 flex flex-col">
                                                <p className="text-xs font-semibold truncate text-foreground/90">{item.description}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>
                                        <div className={`font-bold font-mono text-xs shrink-0 ${config.colorClass}`}>
                                            {new Intl.NumberFormat("id-ID", { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(item.amount)).replace("Rp", "").trim()}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`empty-${i}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-black/10 dark:border-white/10 bg-transparent opacity-50">
                                        <div className="w-6 h-6 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                            {i + 2}
                                        </div>
                                        <div className="h-2 w-20 bg-black/5 dark:bg-white/5 rounded-full" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[140px] rounded-2xl border border-dashed flex items-center justify-center text-xs text-muted-foreground bg-black/5 dark:bg-white/5">
                        Tidak ada data
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function TopIncomeWidget({ data }: WidgetProps) {
    return <BaseTopWidget data={data} type="income" />;
}

export function TopExpenseWidget({ data }: WidgetProps) {
    return <BaseTopWidget data={data} type="expense" />;
}
