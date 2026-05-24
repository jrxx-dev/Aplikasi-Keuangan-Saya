"use client";

import { useState } from "react";
import { ArrowUpIcon, ArrowDownIcon, Pencil, TrendingUp, TrendingDown, Banknote, Coins, Wallet, Gem, Sparkles } from "lucide-react";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { Counter } from "@/components/ui/counter";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { WidgetColorPicker } from "./widget-color-picker";

export interface TrendData {
    params: string;
    value: number;
}

interface StatCardProps {
    title: string;
    type: "balance" | "income" | "expense";
    initialValue: number;
    trend?: TrendData[];
    enableMotion?: boolean;
}

// ----------------------------------------------------------------------
// COMPONENT: Subtle Background Pulse (Simplified Ambient Effect)
// ----------------------------------------------------------------------
function SubtleBackgroundPulse({ theme }: { theme: { primary: string } }) {
    return (
        <div className="absolute inset-0 pointer-events-none rounded-[2rem] overflow-hidden z-0">
            <motion.div
                className="absolute -inset-1/2 opacity-20 blur-[80px]"
                animate={{
                    background: [
                        `radial-gradient(circle at 50% 50%, ${theme.primary} 0%, transparent 50%)`,
                        `radial-gradient(circle at 50% 50%, ${theme.primary} 0%, transparent 60%)`,
                        `radial-gradient(circle at 50% 50%, ${theme.primary} 0%, transparent 50%)`
                    ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

// ----------------------------------------------------------------------
// COMPONENT: Floating Gem Animation (Modern Asset Visualization)
// ----------------------------------------------------------------------
function FloatingGemIcon({ theme }: { theme: { primary: string; secondary: string; accent: string } }) {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Background Halo */}
            <motion.div 
                className="absolute w-[90%] h-[90%] blur-2xl opacity-30 rounded-full"
                style={{ backgroundColor: theme.primary }}
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Orbiting Sparkles */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute text-yellow-400"
                    animate={{ 
                        rotate: 360,
                        scale: [0.5, 1, 0.5],
                        opacity: [0, 1, 0]
                    }}
                    transition={{ 
                        rotate: { duration: 10 + i * 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, delay: i * 0.5 },
                        opacity: { duration: 2, repeat: Infinity, delay: i * 0.5 }
                    }}
                    style={{ 
                        width: "100%", 
                        height: "100%",
                        padding: `${20 + i * 10}%` 
                    }}
                >
                    <Sparkles className="w-4 h-4" />
                </motion.div>
            ))}

            {/* The Main Gem */}
            <motion.div
                className="relative z-10 flex items-center justify-center"
                animate={{ 
                    y: [0, -10, 0],
                    rotateY: [0, 360]
                }}
                transition={{ 
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotateY: { duration: 12, repeat: Infinity, ease: "linear" }
                }}
            >
                <div className="relative">
                    <Gem 
                        className="w-16 h-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                        style={{ color: theme.primary, fill: `${theme.primary}40` }} 
                    />
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-white/20 blur-md rounded-full pointer-events-none" />
                </div>
            </motion.div>

            {/* Bottom Glow Platform */}
            <motion.div 
                className="absolute bottom-2 w-[50%] h-2 blur-md rounded-full"
                style={{ backgroundColor: theme.primary }}
                animate={{ 
                    scaleX: [0.8, 1.2, 0.8],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

function MoneyRainEffect() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem] z-50">
            {/* Minimal sparkle particles */}
            {[0, 1].map((i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute bg-white/40 rounded-full blur-[1px]"
                    initial={{ top: "10%", left: `${20 + i * 50}%`, opacity: 0, width: 2, height: 2 }}
                    animate={{ top: ["10%", "50%"], opacity: [0, 0.6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i, ease: "linear" }}
                />
            ))}

            {/* Center Digital Orb/Glow */}
            <div className="absolute top-[30%] left-[40%] w-32 h-32 bg-blue-400/10 rounded-full blur-[40px] animate-pulse pointer-events-none" />
        </div>
    );
}

// ----------------------------------------------------------------------
// COMPONENT: Balance Background Graph (Holographic Wave)
// ----------------------------------------------------------------------
function BalanceBackgroundGraph() {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-end justify-center overflow-hidden rounded-[2rem]">
            <svg className="w-[120%] h-[70%] absolute bottom-0 opacity-30" viewBox="0 0 100 60" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Layer 1: Slow Deep Wave */}
                <motion.path
                    d="M-10,50 C20,40 50,60 80,45 S110,40 120,50 L120,70 L-10,70 Z"
                    fill="url(#balanceGradient)"
                    animate={{
                        d: [
                            "M-10,50 C20,40 50,60 80,45 S110,40 120,50 L120,70 L-10,70 Z",
                            "M-10,50 C20,55 50,35 80,50 S110,55 120,50 L120,70 L-10,70 Z",
                            "M-10,50 C20,40 50,60 80,45 S110,40 120,50 L120,70 L-10,70 Z"
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Layer 2: Faster Top Line */}
                <motion.path
                    d="M-10,50 C20,40 50,60 80,45 S110,40 120,50"
                    fill="none"
                    stroke="#93C5FD"
                    strokeWidth="0.5"
                    animate={{
                        d: [
                            "M-10,50 C20,40 50,60 80,45 S110,40 120,50",
                            "M-10,50 C20,55 50,35 80,50 S110,55 120,50",
                            "M-10,50 C20,40 50,60 80,45 S110,40 120,50"
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
            </svg>
        </div>
    );
}

function WindyMoneyPattern() {
    // Background ambient money floating in the wind - ENHANCED VISIBILITY
    const items = [
        { icon: Banknote, delay: 0, yStart: "15%", size: 60, duration: 12 },
        { icon: Coins, delay: 2, yStart: "65%", size: 40, duration: 15 },
        { icon: Banknote, delay: 5, yStart: "40%", size: 50, duration: 10 },
        { icon: Banknote, delay: 1, yStart: "85%", size: 45, duration: 14 },
        { icon: Coins, delay: 7, yStart: "25%", size: 30, duration: 18 },
    ];

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem] z-0">
            {/* Added a subtle shadow gradient to emphasize the 'in the shadows' feel */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5 mix-blend-overlay" />

            {items.map((item, i) => (
                <motion.div
                    key={i}
                    className="absolute text-emerald-600/10 dark:text-emerald-400/10 backdrop-blur-[1px]"
                    style={{ top: item.yStart, width: item.size, height: item.size }}
                    initial={{ left: "-20%", opacity: 0, rotate: -25, scale: 0.8 }}
                    animate={{
                        left: ["-20%", "120%"], // Move completely across from Left to Right
                        y: [-15, 15, -15],      // Gentle wave
                        rotate: [-25, 15, -10], // Tumble effect
                        opacity: [0, 0.4, 0.4, 0] // Higher opacity (0.4) to be visible in 'shadows'
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        delay: item.delay,
                        ease: "linear"
                    }}
                >
                    <item.icon className="w-full h-full drop-shadow-sm" />
                </motion.div>
            ))}
        </div>
    );
}

// ----------------------------------------------------------------------
// MAIN COMPONENT: StatCard
// ----------------------------------------------------------------------
function StatCard({ title, type, initialValue, enableMotion, detailContent }: StatCardProps & { detailContent?: React.ReactNode }) {
    const [value, setValue] = useState(initialValue);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Edit Dialog
    const [isDetailOpen, setIsDetailOpen] = useState(false); // Detail Dialog
    const [editValue, setEditValue] = useState(value.toString());
    const { themes } = useWidgetTheme();

    const widgetId = type === "balance" ? "balance-card" : type === "income" ? "income-card" : "expense-card";
    const theme = themes[widgetId];

    const handleOpenEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening detail
        setEditValue(value.toString());
        setIsDialogOpen(true);
    };

    const handleOpenDetail = () => {
        if (detailContent) {
            setIsDetailOpen(true);
        }
    };

    const handleSave = () => {
        const num = parseFloat(editValue);
        if (!isNaN(num)) {
            setValue(num);
        }
        setIsDialogOpen(false);
    };

    const config = {
        balance: {
            icon: null,
            color: "text-blue-600 dark:text-blue-200",
            glassBg: "bg-gradient-to-br from-blue-50/80 via-white/50 to-blue-50/20 dark:from-zinc-800/60 dark:via-zinc-900/60 dark:to-zinc-800/40",
            border: "border-blue-100/50 dark:border-white/10",
            shadow: "shadow-blue-200/40 dark:shadow-blue-900/20",
            iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
            trendColor: "text-blue-700 dark:text-blue-300",
        },
        income: {
            icon: ArrowUpIcon,
            color: "text-emerald-600 dark:text-emerald-200",
            glassBg: "bg-gradient-to-br from-emerald-50/80 via-white/50 to-emerald-50/20 dark:from-zinc-800/60 dark:via-zinc-900/60 dark:to-zinc-800/40",
            border: "border-emerald-100/50 dark:border-white/10",
            shadow: "shadow-emerald-200/40 dark:shadow-emerald-900/20",
            iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
            trendColor: "text-emerald-700 dark:text-emerald-300",
        },
        expense: {
            icon: ArrowDownIcon,
            color: "text-rose-600 dark:text-rose-200",
            glassBg: "bg-gradient-to-br from-rose-50/80 via-white/50 to-rose-50/20 dark:from-zinc-800/60 dark:via-zinc-900/60 dark:to-zinc-800/40",
            border: "border-rose-100/50 dark:border-white/10",
            shadow: "shadow-rose-200/40 dark:shadow-rose-900/20",
            iconBg: "bg-gradient-to-br from-rose-400 to-rose-600",
            trendColor: "text-rose-700 dark:text-rose-300",
        }
    };

    const style = config[type];
    const Icon = style.icon;

    const Container = enableMotion ? motion.div : "div";
    const motionProps = enableMotion ? {
        animate: { y: [0, -5, 0] }, // Reduced float range for stability
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const }
    } : {};

    return (
        <>
            <Container
                {...motionProps}
                onClick={handleOpenDetail}
                className={cn(
                    "relative group h-full transition-all duration-500 hover:-translate-y-2 cursor-pointer",
                    "rounded-[2rem]",
                    "backdrop-blur-2xl backdrop-saturate-150",
                    style.glassBg,
                    "border border-white/60 dark:border-white/10",
                    "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]",
                    style.shadow,
                    "hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)]",
                    "overflow-hidden"
                )}
            >
                <div className="absolute inset-0 rounded-[2rem] border-t border-l border-white/90 dark:border-white/20 pointer-events-none z-20" />
                <div className="absolute inset-0 rounded-[2rem] border-b border-r border-black/5 dark:border-black/50 pointer-events-none z-20" />

                {enableMotion && (
                    <motion.div
                        className="absolute inset-0 z-0 pointer-events-none"
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: "200%", opacity: [0, 0.3, 0] }}
                        transition={{ duration: 5, repeat: Infinity, delay: 0, ease: "easeInOut" }}
                    >
                        <div className="w-[80%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] blur-xl" />
                    </motion.div>
                )}

                {/* --- EFFECTS & CHARTS --- */}
                {type === 'balance' && <WindyMoneyPattern />}
                {type === 'balance' && <BalanceBackgroundGraph />}
                {type === 'balance' && enableMotion && <MoneyRainEffect />}

                {/* VISUALIZE TRENDS FOR INCOME/EXPENSE */}
                {(type === 'income' || type === 'expense') && enableMotion && (
                    <SubtleBackgroundPulse theme={theme} />
                )}

                <div className="p-4 relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className={cn(
                            "flex items-start",
                            type === 'expense' ? "flex-row-reverse" : "justify-between"
                        )}>
                            <div className={cn(
                                "flex items-center gap-2",
                                type === 'expense' ? "flex-row-reverse" : ""
                            )}>
                                <div className={cn("p-1.5 rounded-xl bg-white/40 dark:bg-black/20 border border-white/50 shadow-sm backdrop-blur-md")}>
                                    {type === 'balance' ? <Gem className="w-4 h-4" style={{ color: theme.primary }} />
                                        : type === 'income' ? <TrendingUp className="w-4 h-4" style={{ color: theme.primary }} />
                                            : <TrendingDown className="w-4 h-4" style={{ color: theme.primary }} />
                                    }
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{title}</span>
                            </div>

                            <div className={cn(
                                "flex items-center gap-1",
                                type === 'expense' ? "mr-auto" : ""
                            )}>
                                <button
                                    onClick={handleOpenEdit}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                                >
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <WidgetColorPicker widgetId={widgetId} widgetName={title} />
                            </div>
                        </div>

                        <div className={cn(
                            "mt-1 relative z-10 flex",
                            type === 'expense' ? "justify-end" : "justify-start"
                        )}>
                            <h3 className="text-3xl font-black tracking-tighter drop-shadow-sm flex items-start gap-1" style={{ color: theme.primary }}>
                                <span className="text-sm opacity-60 font-semibold mt-1.5">Rp</span>
                                <Counter value={initialValue} />
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full bg-white/40 dark:bg-black/20 border border-white/20 shadow-sm backdrop-blur-sm" style={{ color: theme.accent }}>
                            {type === 'income' ? <TrendingUp className="w-4 h-4" /> : type === 'expense' ? <TrendingDown className="w-4 h-4" /> : <Gem className="w-4 h-4" />}
                            <span>{type === 'balance' ? 'Aman' : 'Aktif'}</span>
                        </div>

                        {/* ICON CONTAINER ADJUSTMENT: Reduced size for compact view */}
                        <div
                            className={cn(
                                type === 'balance' ? "w-24 h-20 mt-1 mr-0" : "w-8 h-8",
                                "rounded-[1rem] flex items-center justify-center text-white rotate-3 group-hover:rotate-6 group-hover:scale-105 transition-all duration-300 relative",
                                type !== 'balance' ? "shadow-xl border-t border-white/40 shadow-inner" : "bg-transparent shadow-none",
                            )}
                            style={type !== 'balance' ? {
                                background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`
                            } : undefined}
                        >
                            {type === 'balance' ? (
                                <FloatingGemIcon theme={theme} />
                            ) : (
                                Icon && (
                                    <motion.div
                                        animate={{ y: type === 'income' ? [0, -4, 0] : type === 'expense' ? [0, 4, 0] : 0 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="relative z-10"
                                    >
                                        <Icon className="w-6 h-6 drop-shadow-md" />
                                    </motion.div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/20 dark:bg-white/5 blur-[40px] rounded-full pointer-events-none" />
            </Container>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah {title}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="amount" className="mb-2 block">Jumlah Baru</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">Rp</span>
                            <Input
                                id="amount"
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>
                        <Button onClick={handleSave}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto !bg-white/80 dark:!bg-zinc-900/80 !backdrop-blur-xl border-white/40 dark:border-white/10 shadow-2xl ring-1 ring-black/5">
                    <DialogHeader>
                        <DialogTitle>{title} Detail</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        {detailContent}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Tutup</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

import { BalanceDetail, TransactionDetail } from "@/components/finance/stat-details";


export function BalanceCard({ value = 0, accounts = [] }: { value?: number, accounts?: any[] }) {
    return (
        <StatCard
            title="Total Saldo"
            type="balance"
            initialValue={value}
            enableMotion={true}
            detailContent={<BalanceDetail accounts={accounts} />}
        />
    );
}

export function IncomeCard({ value = 0, trend = [], transactions = [] }: { value?: number, trend?: TrendData[], transactions?: any[] }) {
    return (
        <StatCard
            title="Pemasukan"
            type="income"
            initialValue={value}
            trend={trend}
            enableMotion={true}
            detailContent={<TransactionDetail transactions={transactions} type="income" />}
        />
    );
}

export function ExpenseCard({ value = 0, trend = [], transactions = [] }: { value?: number, trend?: TrendData[], transactions?: any[] }) {
    return (
        <StatCard
            title="Pengeluaran"
            type="expense"
            initialValue={value}
            trend={trend}
            enableMotion={true}
            detailContent={<TransactionDetail transactions={transactions} type="expense" />}
        />
    );
}
