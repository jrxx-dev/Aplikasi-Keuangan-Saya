"use client";

import { motion, AnimatePresence, animate } from "framer-motion";
import { TrendingUp, TrendingDown, Gem, PiggyBank } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState, useRef } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/providers/language-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BalanceDetail, TransactionDetail } from "@/components/finance/stat-details";
import { TransactionForm } from "@/components/finance/transaction-form";
import { Plus } from "lucide-react";

const MOTIVATION_QUOTES = [
    "Kelola uangmu, kendalikan masa depanmu.",
    "Hemat pangkal kaya, investasi pangkal jaya.",
    "Mulai dari yang kecil, konsisten adalah kunci.",
    "Kebebasan finansial dimulai hari ini.",
    "Uang adalah alat, bukan tujuan akhir.",
    "Investasi leher ke atas selalu menguntungkan.",
    "Bijak berhemat, cerdas berinvestasi.",
    "Disiplin menabung untuk masa depan cerah."
];

// Counter Component for Number Animation
function Counter({ value, className }: { value: number, className: string }) {
    const nodeRef = useRef<HTMLParagraphElement>(null);
    const prevValue = useRef(0);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(prevValue.current, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(v) {
                node.textContent = new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0
                }).format(v);
            },
        });

        prevValue.current = value;
        return () => controls.stop();
    }, [value]);

    return <p ref={nodeRef} className={className}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)}</p>;
}

interface GlobalSummaryClientProps {
    summary: any;
    accounts?: any[];
    transactions?: any[];
}

export default function GlobalSummaryClient({ summary, accounts = [], transactions = [] }: GlobalSummaryClientProps) {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const { toggleSidebar } = useSidebar();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [quoteIndex, setQuoteIndex] = useState(0);
    const { t } = useLanguage();

    const [openBalance, setOpenBalance] = useState(false);
    const [openIncome, setOpenIncome] = useState(false);
    const [openExpense, setOpenExpense] = useState(false);
    const [openTransaction, setOpenTransaction] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Rotate Quotes
    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % MOTIVATION_QUOTES.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("id-ID", {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDayDate = (date: Date) => {
        return date.toLocaleDateString("id-ID", {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const userName = session?.user?.name || "User";
    const userImage = session?.user?.image || "";
    const userInitials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('header.greeting.morning');
        if (hour < 15) return t('header.greeting.afternoon');
        if (hour < 18) return t('header.greeting.evening');
        return t('header.greeting.night');
    };

    if (!mounted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full mb-6 z-40 relative px-1"
        >
            {/* ONE BIG BOX CONTAINER - Soft & Fresh - Animated */}
            <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-500 flex flex-col xl:flex-row items-stretch overflow-hidden">

                {/* SECTION 1: PROFILE (LEFT) */}
                <div className="flex-1 flex items-center gap-4 p-3 overflow-hidden">
                    <div className="relative group cursor-pointer flex-shrink-0" onClick={toggleSidebar}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <Avatar className="h-11 w-11 md:h-12 md:w-12 border-2 border-slate-50 dark:border-zinc-800 transition-transform duration-300">
                                <AvatarImage src={userImage} className="object-cover" />
                                <AvatarFallback className="bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-300 font-bold text-sm">{userInitials}</AvatarFallback>
                            </Avatar>
                            {/* Continuously Pulsing Dot */}
                            <span className="absolute bottom-0 right-0 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 duration-1000"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 border-2 border-white dark:border-zinc-900"></span>
                            </span>
                        </motion.div>
                    </div>

                    <div className="flex flex-col justify-center gap-0.5 overflow-hidden w-full">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 truncate tracking-tight">
                                {greeting()}, {userName.split(" ")[0]}
                            </h2>
                        </div>
                        <div className="h-6 overflow-hidden relative w-full pr-4">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={quoteIndex}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.4 }}
                                    className="text-sm text-slate-500 dark:text-zinc-400 font-medium truncate w-full block"
                                >
                                    "{MOTIVATION_QUOTES[quoteIndex]}"
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: STATS WIDGETS (COMPACT ISLAND) - CONTINUOUS ANIMATIONS */}
                <div className="hidden xl:flex items-center justify-center p-2 flex-shrink-0">
                    <div className="flex items-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 overflow-hidden divide-x divide-slate-100 dark:divide-zinc-800 shadow-sm relative z-10">

                        {/* Income - Floating Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ backgroundColor: "rgba(209, 250, 229, 0.8)", flex: 1.3 }}
                            onClick={() => setOpenIncome(true)}
                            className="flex flex-col justify-center px-4 py-1.5 bg-emerald-50/40 dark:bg-emerald-900/10 min-w-[90px] cursor-pointer group overflow-hidden relative"
                        >
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5 relative z-10">
                                <motion.div
                                    animate={{ y: [0, -2, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                >
                                    <TrendingUp className="w-2.5 h-2.5" />
                                </motion.div>
                                {t('header.income')}
                            </div>
                            <Counter value={summary.income} className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums relative z-10" />
                        </motion.div>

                        {/* Expense - Floating Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ backgroundColor: "rgba(255, 228, 230, 0.8)", flex: 1.3 }}
                            onClick={() => setOpenExpense(true)}
                            className="flex flex-col justify-center px-4 py-1.5 bg-rose-50/40 dark:bg-rose-900/10 min-w-[90px] cursor-pointer group overflow-hidden relative"
                        >
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-0.5 relative z-10">
                                <motion.div
                                    animate={{ y: [0, 2, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                                >
                                    <TrendingDown className="w-2.5 h-2.5" />
                                </motion.div>
                                {t('header.expense')}
                            </div>
                            <Counter value={summary.expense} className="text-sm font-bold text-rose-700 dark:text-rose-300 tabular-nums relative z-10" />
                        </motion.div>

                        {/* Balance - Shimmer & Floating Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{
                                backgroundColor: "rgba(219, 234, 254, 0.9)",
                                flex: 1.5,
                                scale: 1.05,
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                zIndex: 20
                            }}
                            onClick={() => setOpenBalance(true)}
                            className="flex flex-col justify-center px-5 py-1.5 bg-blue-50/40 dark:bg-blue-900/10 min-w-[110px] cursor-pointer group relative overflow-hidden"
                        >
                            {/* Constant Shimmer Effect */}
                            <motion.div
                                initial={{ x: "-100%", opacity: 0.5 }}
                                animate={{ x: "200%" }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }} // Reduced delay
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                            />

                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5 relative z-10">
                                <motion.div
                                    animate={{ y: [0, -3, 0], rotate: [0, 5, 0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                >
                                    <Gem className="w-2.5 h-2.5" />
                                </motion.div>
                                {t('header.balance')}
                            </div>
                            <Counter value={summary.balance} className="text-base font-black text-blue-800 dark:text-blue-200 tabular-nums tracking-tight relative z-10" />
                        </motion.div>
                    </div>
                </div>

                {/* SECTION 3: TIME (FAR RIGHT) - Minimal */}
                <div className="flex flex-col justify-center items-end px-5 py-3 min-w-[140px] flex-shrink-0">
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
                        {formatDayDate(currentTime)}
                    </p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-black text-slate-800 dark:text-white font-mono tracking-tighter tabular-nums leading-none">
                            {formatTime(currentTime)}
                        </p>
                        <motion.span
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-[9px] font-bold text-slate-300 dark:text-zinc-600"
                        >
                            WIB
                        </motion.span>
                    </div>
                </div>

                {/* SECTION 4: ACTION BUTTONS (FAR RIGHT) */}
                <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0 border-l border-slate-100 dark:border-zinc-800">
                    {/* Refined Premium Button */}
                    <div className="relative group ml-1">
                        <Button
                            onClick={() => setOpenTransaction(true)}
                            className="relative overflow-hidden rounded-full h-9 pl-1.5 pr-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 border-y border-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {/* Glassy Sheen Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                            {/* Subtle Shimmer */}
                            <motion.span
                                initial={{ x: "-100%" }}
                                animate={{ x: "300%" }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear", repeatDelay: 3 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 z-10"
                            />

                            {/* Content */}
                            <span className="relative z-20 flex items-center gap-2">
                                <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-white group-hover:text-violet-600 transition-colors duration-300">
                                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                                <span className="font-semibold text-xs tracking-wide">Transaksi Baru</span>
                            </span>
                        </Button>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-700 mx-1"></div>

                    <Link href="/savings">
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors" title="Tabungan">
                            <PiggyBank className="w-5 h-5" />
                        </Button>
                    </Link>
                    <ThemeToggle />
                </div>
            </div>

            {/* DIALOGS */}
            <Dialog open={openBalance} onOpenChange={setOpenBalance}>
                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto !bg-white/80 dark:!bg-zinc-900/80 !backdrop-blur-xl border-white/40 dark:border-white/10 shadow-2xl ring-1 ring-black/5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{t('header.balance')} Detail</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <BalanceDetail accounts={accounts} />
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <DialogClose asChild>
                            <Button variant="ghost" className="rounded-full w-full sm:w-auto text-muted-foreground hover:bg-black/5">Tutup</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openIncome} onOpenChange={setOpenIncome}>
                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto !bg-white/80 dark:!bg-zinc-900/80 !backdrop-blur-xl border-white/40 dark:border-white/10 shadow-2xl ring-1 ring-black/5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{t('header.income')} Detail</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <TransactionDetail transactions={transactions} type="income" />
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <DialogClose asChild>
                            <Button variant="ghost" className="rounded-full w-full sm:w-auto text-muted-foreground hover:bg-black/5">Tutup</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openExpense} onOpenChange={setOpenExpense}>
                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto !bg-white/80 dark:!bg-zinc-900/80 !backdrop-blur-xl border-white/40 dark:border-white/10 shadow-2xl ring-1 ring-black/5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-rose-600 dark:text-rose-400">{t('header.expense')} Detail</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <TransactionDetail transactions={transactions} type="expense" />
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <DialogClose asChild>
                            <Button variant="ghost" className="rounded-full w-full sm:w-auto text-muted-foreground hover:bg-black/5">Tutup</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* TRANSACTION FORM DIALOG */}
            <Dialog open={openTransaction} onOpenChange={setOpenTransaction}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto !bg-white/95 dark:!bg-zinc-900/95 !backdrop-blur-xl shadow-2xl border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Catat Transaksi Baru</DialogTitle>
                        <DialogDescription>
                            Masukkan detail pengeluaran, pemasukan, atau tabunganmu.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <TransactionForm onClose={() => setOpenTransaction(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
