import { ArrowUpIcon, ArrowDownIcon, Landmark, CreditCard, Coins, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

// ----------------------------------------------------------------------
// HELPER FOR BALANCE DETAIL
// ----------------------------------------------------------------------
export function BalanceDetail({ accounts }: { accounts: any[] }) {
    if (!accounts || accounts.length === 0) return <div className="text-center text-muted-foreground py-8">Tidak ada data akun.</div>;

    const byType = {
        bank: accounts.filter(a => a.type === 'bank'),
        wallet: accounts.filter(a => a.type === 'wallet' || a.type === 'emoney'),
        cash: accounts.filter(a => a.type === 'cash'),
    };

    const format = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="space-y-6 pb-2"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {Object.entries(byType).map(([type, accs]) => {
                if (accs.length === 0) return null;
                const total = accs.reduce((sum: number, a: any) => sum + Number(a.balance), 0);
                const title = type === 'bank' ? "Bank" : type === 'wallet' ? "E-Wallet" : "Tunai";
                const TypeIcon = type === 'bank' ? Landmark : type === 'wallet' ? CreditCard : Coins;

                // GLASS THEMES - Pure Translucency + Colored Accents
                const theme = type === 'bank'
                    ? {
                        iconGradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
                        text: "text-blue-600 dark:text-blue-300",
                        border: "border-blue-200/50 dark:border-blue-800/30",
                        bg: "bg-blue-50/30 dark:bg-blue-900/10",
                        glow: "group-hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
                    }
                    : type === 'wallet'
                        ? {
                            iconGradient: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
                            text: "text-purple-600 dark:text-purple-300",
                            border: "border-purple-200/50 dark:border-purple-800/30",
                            bg: "bg-purple-50/30 dark:bg-purple-900/10",
                            glow: "group-hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]"
                        }
                        : {
                            iconGradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
                            text: "text-emerald-600 dark:text-emerald-300",
                            border: "border-emerald-200/50 dark:border-emerald-800/30",
                            bg: "bg-emerald-50/30 dark:bg-emerald-900/10",
                            glow: "group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
                        };

                return (
                    <motion.div key={type} className="space-y-3" variants={itemAnim}>
                        {/* Section Header */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2.5">
                                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm", theme.iconGradient)}>
                                    <TypeIcon className="w-3.5 h-3.5" />
                                </div>
                                <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground/80">{title}</h4>
                            </div>
                            <span className={cn("text-xs font-black font-mono tracking-tight", theme.text)}>{format(total)}</span>
                        </div>

                        {/* Glass Cards */}
                        <div className="grid gap-2.5">
                            {accs.map((a: any) => (
                                <div key={a.id} className={cn(
                                    "relative flex justify-between items-center p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 group",
                                    "bg-white/60 dark:bg-black/40", // Base glass
                                    theme.border,
                                    theme.glow
                                )}>
                                    <div className="flex items-center gap-3.5 z-10">
                                        <div className="w-9 h-9 rounded-full bg-white/80 dark:bg-white/10 flex items-center justify-center text-[10px] font-black shadow-sm ring-1 ring-black/5 dark:ring-white/10 text-foreground/80">
                                            {a.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground/90 leading-tight">{a.name}</span>
                                            <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">{title}</span>
                                        </div>
                                    </div>
                                    <span className={cn("font-bold text-sm font-mono tracking-tight z-10", theme.text)}>{format(Number(a.balance))}</span>

                                    {/* Subtle Gradient Overlay on Hover */}
                                    <div className={cn("absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-soft-light", theme.bg)} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )
            })}
        </motion.div>
    );
}

// ----------------------------------------------------------------------
// HELPER FOR TRANSACTION DETAIL
// ----------------------------------------------------------------------
export function TransactionDetail({ transactions, type }: { transactions: any[], type: 'income' | 'expense' }) {
    const filtered = transactions.filter(t => t.type === type).slice(0, 20);
    const format = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

    if (filtered.length === 0) return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50 gap-3">
            <div className="p-3 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-sm">
                <Calendar className="w-6 h-6 opacity-30" />
            </div>
            <p className="text-sm font-medium">Belum ada transaksi bulan ini.</p>
        </div>
    );

    const grouped = filtered.reduce((acc: any, t) => {
        const date = new Date(t.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(t);
        return acc;
    }, {});

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    // Themes
    const isIncome = type === 'income';
    const theme = isIncome
        ? {
            gradText: "text-emerald-600 dark:text-emerald-400",
            iconBg: "bg-emerald-500",
            lightBg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            hoverShad: "hover:shadow-emerald-500/10"
        }
        : {
            gradText: "text-rose-600 dark:text-rose-400",
            iconBg: "bg-rose-500",
            lightBg: "bg-rose-500/10",
            border: "border-rose-500/20",
            hoverShad: "hover:shadow-rose-500/10"
        };

    return (
        <motion.div
            className="space-y-6 pb-2"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {Object.entries(grouped).map(([date, items]: [string, any]) => (
                <div key={date} className="relative">
                    {/* Floating Date Badge */}
                    <div className="flex justify-center mb-3 sticky top-0 z-20">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 bg-white/70 dark:bg-black/70 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                            {date}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {items.map((t: any, i: number) => (
                            <motion.div
                                key={i}
                                variants={itemAnim}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 group cursor-default relative overflow-hidden",
                                    "bg-white/60 dark:bg-zinc-800/40 backdrop-blur-sm", // Brighter Ultra Glass
                                    "border-white/50 dark:border-white/10",
                                    "hover:bg-white/60 dark:hover:bg-white/5",
                                    "hover:scale-[1.01] hover:shadow-lg",
                                    theme.hoverShad
                                )}
                            >
                                <div className="flex items-center gap-3.5 relative z-10">
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 duration-300 text-white",
                                        theme.iconBg
                                    )}>
                                        {isIncome ? <ArrowUpIcon className="w-4 h-4 stroke-[3]" /> : <ArrowDownIcon className="w-4 h-4 stroke-[3]" />}
                                    </div>
                                    <div className="min-w-0 flex flex-col gap-0.5">
                                        <p className="font-bold text-sm truncate text-foreground/90">{t.description || t.categoryName || "Transaksi"}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground/70 flex items-center gap-1.5">
                                            {new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {t.categoryName || "Umum"}
                                        </p>
                                    </div>
                                </div>

                                <span className={cn(
                                    "font-black text-sm whitespace-nowrap px-2.5 py-1 rounded-lg transition-all relative z-10 font-mono",
                                    theme.gradText,
                                    theme.lightBg
                                )}>
                                    {isIncome ? '+' : '-'} {format(Number(t.amount))}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="pt-4 sticky bottom-0 z-30 pointer-events-none">
                {/* Gradient fade to cover scrolling */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-black dark:via-black/80 pointer-events-none" />

                <div className="relative pointer-events-auto">
                    <Button variant="default" size="sm" className={cn(
                        "w-full rounded-xl text-xs font-bold h-10 shadow-xl hover:shadow-2xl transition-all text-white border-t border-white/20 backdrop-blur-md",
                        isIncome ? "bg-emerald-600/90 hover:bg-emerald-600" : "bg-rose-600/90 hover:bg-rose-600"
                    )} asChild>
                        <Link href="/transactions">Lihat Semua Transaksi</Link>
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
