"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Gem, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    Sparkles, Banknote, Smartphone, Layers, Eye, EyeOff,
    ChevronRight, ArrowRight, CalendarDays, Clock, Zap, Target,
    PieChart, BarChart3, ShoppingBag, Utensils, Car, Briefcase,
    Gift, Coffee, Plane, Home, HeartPulse
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Counter } from "@/components/ui/counter";
import { CategoryBreakdown } from "@/components/finance/category-breakdown";
import { FinancialHealth } from "@/components/finance/financial-health";
import { QuickActions } from "@/components/finance/quick-actions";
import { DailyActivityChart } from "@/components/finance/daily-activity-chart";
import { BudgetWidget } from "@/components/finance/budget-widget";
import { GoalsWidget } from "@/components/finance/goals-widget";
import { BudgetRadar } from "@/components/finance/budget-radar";
import { SpendingComparisonWidget } from "@/components/finance/spending-comparison";
import { FinancialForecastWidget } from "@/components/finance/financial-forecast";
import { PaylaterWidget } from "@/components/finance/paylater-widget";
import { KasbonWidget } from "@/components/business/kasbon-widget";
import { Button } from "@/components/ui/button";

interface DashboardData {
    summary: {
        balance: number;
        income: number;
        expense: number;
        incomeTrend: { params: string; value: number }[];
        expenseTrend: { params: string; value: number }[];
        averages?: {
            income: number;
            expense: number;
            history: { month: string; income: number; expense: number }[];
            dailyHistory: any[];
        };
    };
    recentTransactions: any[];
    accounts: any[];
    categoryBreakdown: any[];
    largestTransactions: any[];
    debts: any[];
    businessDebts: any[];
    goals: any[];
    budgetSummary: any;
}

// ─────────────────────────────────────────────
// HELPER: Format Currency
// ─────────────────────────────────────────────
const formatIDR = (val: number, compact = false) => {
    if (compact) {
        if (Math.abs(val) >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
        if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`;
        if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}rb`;
        return val.toFixed(0);
    }
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val);
};

// ─────────────────────────────────────────────
// COMPONENT: Mini Sparkline SVG
// ─────────────────────────────────────────────
function MiniSparkline({ data, color, height = 40 }: { data: { value: number }[]; color: string; height?: number }) {
    const values = data.length > 1 ? data.map(d => d.value) : [30, 50, 45, 70, 55, 80, 65, 90, 75, 85];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 120;
    const h = height;
    const pad = 4;

    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return `${x},${y}`;
    }).join(" ");

    const areaPoints = `0,${h} ${points} ${w},${h}`;

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <defs>
                <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#spark-${color.replace('#', '')})`} />
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Glow dot at the end */}
            {values.length > 0 && (() => {
                const lastVal = values[values.length - 1];
                const lx = w;
                const ly = h - pad - ((lastVal - min) / range) * (h - pad * 2);
                return (
                    <>
                        <circle cx={lx} cy={ly} r="5" fill={color} opacity="0.2" />
                        <circle cx={lx} cy={ly} r="3" fill={color} />
                    </>
                );
            })()}
        </svg>
    );
}

// ─────────────────────────────────────────────
// COMPONENT: Subtle Background Pulse
// ─────────────────────────────────────────────
function SubtleBackgroundPulse({ color }: { color: string }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <motion.div
                className="absolute -inset-1/2 opacity-10 blur-[60px]"
                animate={{
                    background: [
                        `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 50%)`,
                        `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 60%)`,
                        `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 50%)`
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// COMPONENT: Account Credit Card Visual
// ─────────────────────────────────────────────
function AccountCardVisual({ accounts }: { accounts: any[] }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [showBalance, setShowBalance] = useState(true);

    const allAccounts = accounts.length > 0 ? accounts : [{
        id: "default", name: "Akun Utama", type: "cash", balance: "0", theme: "blue"
    }];
    const acc = allAccounts[activeIdx] || allAccounts[0];
    const balance = parseFloat(acc.balance || "0");

    const cardThemes: Record<string, { bg: string; accent: string }> = {
        blue: { bg: "from-blue-600 via-blue-700 to-indigo-800", accent: "bg-blue-400" },
        sky: { bg: "from-sky-500 via-cyan-600 to-blue-700", accent: "bg-sky-300" },
        emerald: { bg: "from-emerald-600 via-teal-700 to-green-800", accent: "bg-emerald-400" },
        purple: { bg: "from-purple-600 via-violet-700 to-indigo-800", accent: "bg-violet-400" },
        rose: { bg: "from-rose-600 via-pink-700 to-red-800", accent: "bg-rose-400" },
        amber: { bg: "from-amber-600 via-orange-700 to-red-800", accent: "bg-amber-400" },
    };

    const theme = cardThemes[acc.theme || "blue"] || cardThemes.blue;
    const typeIcon = acc.type === "bank" ? Gem : acc.type === "wallet" || acc.type === "emoney" ? Smartphone : Banknote;
    const TypeIcon = typeIcon;

    return (
        <div className="space-y-4">
            {/* The Digital Asset Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, rotateY: -15, scale: 0.95 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: 15, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={cn(
                        "relative w-full aspect-[1.7/1] rounded-2xl overflow-hidden cursor-pointer select-none",
                        "bg-gradient-to-br", theme.bg,
                        "shadow-2xl shadow-black/30",
                    )}
                    style={{ perspective: "1000px" }}
                    onClick={() => setShowBalance(prev => !prev)}
                >
                    {/* Digital Mesh Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)]" />

                    {/* Orbiting Sparkles */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute text-white/40"
                                animate={{ 
                                    x: ["0%", "100%", "0%"],
                                    y: ["0%", "100%", "0%"],
                                    opacity: [0.1, 0.4, 0.1]
                                }}
                                transition={{ 
                                    duration: 10 + i * 5, 
                                    repeat: Infinity, 
                                    ease: "linear",
                                    delay: i * 2 
                                }}
                                style={{ top: `${20 * i}%`, left: `${10 * i}%` }}
                            >
                                <Sparkles className="w-4 h-4" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Floating Glow */}
                    <motion.div
                        className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-3xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    />

                    {/* Card Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-5">
                        {/* Top: Type + Eye */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/10 shadow-lg")}>
                                    <TypeIcon className="w-4 h-4 text-white/90" />
                                </div>
                                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{acc.type} Asset</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowBalance(prev => !prev); }}
                                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                {showBalance ? <Eye className="w-3.5 h-3.5 text-white/70" /> : <EyeOff className="w-3.5 h-3.5 text-white/70" />}
                            </button>
                        </div>

                        {/* Middle: Balance */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Digital Value</p>
                            <AnimatePresence mode="wait">
                                {showBalance ? (
                                    <motion.h2
                                        key="bal"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-2xl font-black text-white tracking-tight drop-shadow-md"
                                    >
                                        <Counter value={balance} currency />
                                    </motion.h2>
                                ) : (
                                    <motion.h2
                                        key="hidden"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-2xl font-black text-white/60 tracking-wider"
                                    >
                                        ••••••••
                                    </motion.h2>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bottom: Account Name + Gem Core */}
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-wider">Asset Label</p>
                                <p className="text-sm font-bold text-white/90 tracking-wide">{acc.name}</p>
                            </div>
                            {/* Gem Core Decorative */}
                            <motion.div 
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-inner"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <Gem className="w-5 h-5 text-white opacity-80" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Card Selector Dots */}
            {allAccounts.length > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {allAccounts.map((a: any, i: number) => (
                        <button
                            key={a.id}
                            onClick={() => setActiveIdx(i)}
                            className={cn(
                                "transition-all duration-300 rounded-full",
                                i === activeIdx
                                    ? "w-6 h-2 bg-indigo-500 dark:bg-indigo-400"
                                    : "w-2 h-2 bg-slate-300 dark:bg-zinc-600 hover:bg-slate-400 dark:hover:bg-zinc-500"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// COMPONENT: Stat Tile (compact icon + number)
// ─────────────────────────────────────────────
function StatTile({ label, value, icon: Icon, color, bgColor, trend }: {
    label: string;
    value: number;
    icon: any;
    color: string;
    bgColor: string;
    trend?: number;
}) {
    return (
        <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            className="flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgColor)}>
                <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{label}</p>
                <p className={cn("text-lg font-black tracking-tight mt-0.5", color)}>{formatIDR(value, true)}</p>
                {trend !== undefined && (
                    <div className={cn("flex items-center gap-1 text-[10px] font-bold mt-1",
                        trend >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{Math.abs(trend).toFixed(1)}%</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// COMPONENT: Transaction Timeline (grouped by date)
// ─────────────────────────────────────────────
function TransactionTimeline({ transactions }: { transactions: any[] }) {
    const getCategoryIcon = (categoryName: string | null, type: string) => {
        if (!categoryName) return type === "income" ? Gem : Gem;
        const lower = categoryName.toLowerCase();
        if (lower.includes("makan") || lower.includes("food")) return Utensils;
        if (lower.includes("belanja") || lower.includes("shop")) return ShoppingBag;
        if (lower.includes("transport") || lower.includes("bensin")) return Car;
        if (lower.includes("rumah") || lower.includes("listrik")) return Home;
        if (lower.includes("gaji") || lower.includes("salary")) return Briefcase;
        if (lower.includes("kopi") || lower.includes("coffee")) return Coffee;
        if (lower.includes("hadiah") || lower.includes("donasi")) return Gift;
        if (lower.includes("travel") || lower.includes("liburan")) return Plane;
        if (lower.includes("kesehatan") || lower.includes("obat")) return HeartPulse;
        return type === "income" ? Gem : Gem;
    };

    // Group transactions by date
    const grouped = useMemo(() => {
        const groups: Record<string, any[]> = {};
        const displayed = transactions.slice(0, 8);

        displayed.forEach((t: any) => {
            const date = new Date(t.date);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let label: string;
            if (date.toDateString() === today.toDateString()) {
                label = `Hari Ini | ${date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
            } else if (date.toDateString() === yesterday.toDateString()) {
                label = `Kemarin | ${date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
            } else {
                label = date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
            }

            if (!groups[label]) groups[label] = [];
            groups[label].push(t);
        });

        return Object.entries(groups);
    }, [transactions]);

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-semibold text-sm">Belum ada transaksi</p>
                <p className="text-xs mt-1 opacity-70 max-w-[200px]">Transaksi yang kamu buat akan muncul di sini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {grouped.map(([dateLabel, txns], gi) => (
                <div key={dateLabel}>
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 whitespace-nowrap">{dateLabel}</p>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800" />
                    </div>

                    {/* Transactions */}
                    <div className="space-y-1">
                        {txns.map((t: any, ti: number) => {
                            const amount = parseFloat(t.amount || "0");
                            const isIncome = t.type === "income";
                            const Icon = getCategoryIcon(t.category, t.type);

                            return (
                                <motion.div
                                    key={t.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: gi * 0.1 + ti * 0.05 }}
                                >
                                    <Link
                                        href="/transactions"
                                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Timeline Dot */}
                                            <div className="relative flex items-center justify-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                    isIncome
                                                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                                                )}>
                                                    <Icon className="w-4.5 h-4.5" />
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {t.description || "Tanpa Keterangan"}
                                                </p>
                                                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 truncate">{t.category || "Umum"}</p>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="text-right shrink-0 pl-4">
                                            <p className={cn(
                                                "text-sm font-black tabular-nums",
                                                isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                            )}>
                                                {isIncome ? "+" : "-"}{formatIDR(Math.abs(amount))}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {transactions.length > 8 && (
                <Link href="/transactions" className="block">
                    <Button variant="outline" className="w-full group rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                        <span className="font-semibold text-sm">Lihat Semua Transaksi</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// COMPONENT: Account Summary Grid
// ─────────────────────────────────────────────
function AccountSummaryGrid({ accounts }: { accounts: any[] }) {
    const bankAccounts = accounts.filter((a: any) => a.type === "bank");
    const walletAccounts = accounts.filter((a: any) => a.type === "wallet" || a.type === "emoney");
    const cashAccounts = accounts.filter((a: any) => a.type === "cash");

    const totalBank = bankAccounts.reduce((s: number, a: any) => s + parseFloat(a.balance || "0"), 0);
    const totalWallet = walletAccounts.reduce((s: number, a: any) => s + parseFloat(a.balance || "0"), 0);
    const totalCash = cashAccounts.reduce((s: number, a: any) => s + parseFloat(a.balance || "0"), 0);

    const stats = [
        { icon: Gem, label: "Bank", value: `${bankAccounts.length}`, detail: formatIDR(totalBank, true), color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { icon: Smartphone, label: "E-Wallet", value: `${walletAccounts.length}`, detail: formatIDR(totalWallet, true), color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
        { icon: Banknote, label: "Tunai", value: `${cashAccounts.length}`, detail: formatIDR(totalCash, true), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { icon: Layers, label: "Total Akun", value: `${accounts.length}`, detail: "Terdaftar", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
                <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:shadow-sm transition-shadow"
                >
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
                        <s.icon className={cn("w-4 h-4", s.color)} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{s.label}</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.value}</span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500">{s.detail}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
// ---------------------------------------------
// COMPONENT: Modern Type Account Card (Horizontal)
// ---------------------------------------------
function HorizontalAccountTypeCard({ title, icon: Icon, accounts, color, onClick, isActive }: {
    title: string;
    icon: any;
    accounts: any[];
    color: "emerald" | "violet" | "blue";
    onClick?: () => void;
    isActive?: boolean;
}) {
    const total = accounts.reduce((s: number, a: any) => s + parseFloat(a.balance || "0"), 0);

    const colors = {
        emerald: { light: "bg-emerald-50 text-emerald-600 border-emerald-100", dark: "dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30", iconBg: "bg-emerald-100 dark:bg-emerald-900/40" },
        violet: { light: "bg-violet-50 text-violet-600 border-violet-100", dark: "dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/30", iconBg: "bg-violet-100 dark:bg-violet-900/40" },
        blue: { light: "bg-blue-50 text-blue-600 border-blue-100", dark: "dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30", iconBg: "bg-blue-100 dark:bg-blue-900/40" }
    }[color];

    return (
        <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "cursor-pointer flex flex-col justify-between p-3 rounded-2xl border transition-all h-full relative overflow-hidden",
                colors.light, colors.dark,
                isActive ? "shadow-md ring-2 ring-offset-1 ring-opacity-50 ring-current border-transparent" : "hover:shadow-sm"
            )}
        >
            <div className="flex items-start justify-between mb-3 relative z-10">
                <div className={cn("p-1.5 rounded-lg", colors.iconBg)}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold opacity-60 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full">{accounts.length}</span>
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{title}</p>
                <p className="text-xs font-black tabular-nums">{formatIDR(total, true)}</p>
            </div>
            {/* Soft decorative blur */}
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-current opacity-10 blur-xl rounded-full" />
        </motion.div>
    );
}

// -----------------------------------------------
// VARIANTS: Bento Item Animations
// -----------------------------------------------
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: {
            type: "spring" as const,
            stiffness: 260,
            damping: 20
        }    }
};

// -----------------------------------------------
// MAIN: Dashboard Wrapper
// -----------------------------------------------
export function DashboardWrapper({ data }: { data: DashboardData }) {
    const [activeAccountType, setActiveAccountType] = useState<string | null>(null);

    // Calculate trends
    const incomeTrend = useMemo(() => {
        if (data.summary.averages && data.summary.averages.income > 0) {
            return ((data.summary.income - data.summary.averages.income) / data.summary.averages.income) * 100;
        }
        return 0;
    }, [data.summary]);

    const expenseTrend = useMemo(() => {
        if (data.summary.averages && data.summary.averages.expense > 0) {
            return ((data.summary.expense - data.summary.averages.expense) / data.summary.averages.expense) * 100;
        }
        return 0;
    }, [data.summary]);

    const savings = data.summary.income - data.summary.expense;

    const cashAccs = data.accounts.filter(a => a.type === "cash");
    const walletAccs = data.accounts.filter(a => a.type === "wallet" || a.type === "emoney");
    const bankAccs = data.accounts.filter(a => a.type === "bank");

    const displayAccounts = activeAccountType === "cash" ? cashAccs 
                          : activeAccountType === "wallet" ? walletAccs
                          : activeAccountType === "bank" ? bankAccs
                          : data.accounts.slice(0, 5); // Default show top 5

    return (
        <div className="h-[calc(100vh-64px)] bg-[#fafafa] dark:bg-[#09090b] relative overflow-hidden transition-colors duration-500">
            {/* Minimalist Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] dark:opacity-20 opacity-40" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[100px] dark:opacity-20 opacity-40" />
            </div>

            <div className="h-full relative z-10 flex flex-col lg:flex-row gap-0 max-w-[1800px] mx-auto">

                {/* --------------------------------------------------- */}
                {/* LEFT COLUMN: Sidebar (Clean & Professional)         */}
                {/* --------------------------------------------------- */}
                <div className="lg:w-[360px] xl:w-[400px] shrink-0 h-full overflow-hidden border-r border-slate-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
                    <div className="h-full flex flex-col p-5 md:p-6 gap-6 overflow-y-auto lg:overflow-y-hidden custom-scrollbar">

                        {/* Balance Hero */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="shrink-0"
                        >
                            <AccountCardVisual accounts={[{
                                id: "all", 
                                name: "Total Kekayaan", 
                                type: "bank", 
                                balance: data.summary.balance.toString(),
                                theme: "blue"
                            }]} />
                        </motion.div>

                        {/* Account Filters */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="shrink-0 space-y-3"
                        >
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Aset Anda</h3>
                                {activeAccountType && (
                                    <button onClick={() => setActiveAccountType(null)} className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold transition-colors">
                                        Reset
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <HorizontalAccountTypeCard
                                    title="Tunai"
                                    icon={Banknote}
                                    accounts={cashAccs}
                                    color="emerald"
                                    isActive={activeAccountType === "cash"}
                                    onClick={() => setActiveAccountType((p) => p === "cash" ? null : "cash")}
                                />
                                <HorizontalAccountTypeCard
                                    title="Dompet"
                                    icon={Smartphone}
                                    accounts={walletAccs}
                                    color="violet"
                                    isActive={activeAccountType === "wallet"}
                                    onClick={() => setActiveAccountType((p) => p === "wallet" ? null : "wallet")}
                                />
                                <HorizontalAccountTypeCard
                                    title="Bank"
                                    icon={Gem}
                                    accounts={bankAccs}
                                    color="blue"
                                    isActive={activeAccountType === "bank"}
                                    onClick={() => setActiveAccountType((p) => p === "bank" ? null : "bank")}
                                />
                            </div>
                        </motion.div>

                        {/* Accounts List (Dense) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar space-y-2"
                        >
                            <AnimatePresence mode="popLayout">
                                {displayAccounts.map((acc, i) => (
                                    <motion.div 
                                        key={acc.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                        transition={{ duration: 0.2, delay: i * 0.03 }}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-100 dark:border-white/5",
                                            "hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-sm transition-all group cursor-pointer"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-black/20 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors">
                                                {acc.type === "bank" ? <Gem className="w-4 h-4 text-blue-500" /> : 
                                                 acc.type === "cash" ? <Banknote className="w-4 h-4 text-emerald-500" /> : 
                                                 <Smartphone className="w-4 h-4 text-violet-500" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{acc.name}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-tighter">{acc.type}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">
                                            {formatIDR(parseFloat(acc.balance || "0"), true)}
                                        </p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {displayAccounts.length === 0 && (
                                <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">Belum ada akun di kategori ini</div>
                            )}
                        </motion.div>

                        {/* Monthly Overview Card (Dense & Clean) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="shrink-0 bg-white dark:bg-zinc-950 rounded-3xl p-5 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm relative overflow-hidden"
                        >
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Ringkasan Bulan Ini</h4>
                                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">Masuk</p>
                                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatIDR(data.summary.income, true)}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">Keluar</p>
                                        <p className="text-sm font-black text-rose-600 dark:text-rose-400">{formatIDR(data.summary.expense, true)}</p>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-slate-100 dark:bg-zinc-800/60" />

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Nett</span>
                                    <span className={cn(
                                        "text-base font-black tracking-tight",
                                        savings >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-amber-500"
                                    )}>
                                        <Counter value={savings} currency />
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* RIGHT COLUMN: ASYMMETRIC BENTO GRID                */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className="flex-1 h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50/20 dark:bg-zinc-950/20">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-min"
                    >
                        {/* 1. Income Sparkline */}
                        <motion.div variants={itemVariants} className="col-span-1">
                            <div className="relative overflow-hidden flex items-center justify-between p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                                <SubtleBackgroundPulse color="#10b981" />
                                <div className="relative z-10">
                                    <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight tabular-nums group-hover:text-emerald-600 transition-colors">
                                        {formatIDR(data.summary.income, true)}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                                        <motion.span
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="inline-block"
                                        >
                                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                                        </motion.span>
                                        Income
                                    </p>
                                </div>
                                <div className="relative z-10">
                                    <MiniSparkline data={data.summary.incomeTrend} color="#10b981" />
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Expense Sparkline */}
                        <motion.div variants={itemVariants} className="col-span-1">
                            <div className="relative overflow-hidden flex items-center justify-between p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                                <SubtleBackgroundPulse color="#f43f5e" />
                                <div className="relative z-10">
                                    <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight tabular-nums group-hover:text-rose-600 transition-colors">
                                        {formatIDR(data.summary.expense, true)}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                                        <motion.span
                                            animate={{ y: [0, 3, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="inline-block"
                                        >
                                            <TrendingDown className="w-3 h-3 text-rose-500" />
                                        </motion.span>
                                        Expense
                                    </p>
                                </div>
                                <div className="relative z-10">
                                    <MiniSparkline data={data.summary.expenseTrend} color="#f43f5e" />
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Daily Activity Chart (Spans 2 columns, 2 rows) */}
                        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 row-span-1 lg:row-span-2">
                            <DailyActivityChart data={data.summary.averages?.dailyHistory || []} />
                        </motion.div>

                        {/* 4. Transaction Timeline (Spans 1 column, 2 rows) - Data Dense */}
                        <motion.div variants={itemVariants} className="col-span-1 md:col-span-1 row-span-1 lg:row-span-2">
                            <div className="h-full p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col">
                                <div className="flex items-center justify-between mb-5 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Terbaru</h3>
                                    </div>
                                    <Link href="/transactions">
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 rounded-lg">
                                            Semua
                                        </Button>
                                    </Link>
                                </div>
                                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                                    <TransactionTimeline transactions={data.recentTransactions} />
                                </div>
                            </div>
                        </motion.div>

                        {/* 5. Financial Health (Bento Tile) */}
                        <motion.div variants={itemVariants} className="col-span-1">
                            <FinancialHealth income={data.summary.income} expense={data.summary.expense} balance={data.summary.balance} />
                        </motion.div>

                        {/* 6. Quick Actions (Bento Tile) */}
                        <motion.div variants={itemVariants} className="col-span-1">
                            <QuickActions />
                        </motion.div>

                        {/* 7. Category Breakdown (Spans 2 columns) */}
                        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                                <CategoryBreakdown data={data.categoryBreakdown} type="income" />
                                <CategoryBreakdown data={data.categoryBreakdown} type="expense" />
                            </div>
                        </motion.div>

                        {/* 8. Advanced Analytics Row */}
                        <motion.div variants={itemVariants} className="col-span-1">
                            <BudgetRadar categories={data.categoryBreakdown} />
                        </motion.div>
                        <motion.div variants={itemVariants} className="col-span-1">
                            <SpendingComparisonWidget dailyData={data.summary.averages?.dailyHistory || []} />
                        </motion.div>
                        <motion.div variants={itemVariants} className="col-span-1">
                            <FinancialForecastWidget currentBalance={data.summary.balance} dailyData={data.summary.averages?.dailyHistory || []} />
                        </motion.div>

                        {/* 9. Remaining Widgets */}
                        <motion.div variants={itemVariants} className="col-span-1">
                            <BudgetWidget data={data.budgetSummary} />
                        </motion.div>
                        <motion.div variants={itemVariants} className="col-span-1">
                            <GoalsWidget data={data.goals} />
                        </motion.div>
                        <motion.div variants={itemVariants} className="col-span-1">
                            <PaylaterWidget data={data.debts} />
                        </motion.div>
                        <motion.div variants={itemVariants} className="col-span-1">
                            <KasbonWidget data={data.businessDebts} />
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
}
