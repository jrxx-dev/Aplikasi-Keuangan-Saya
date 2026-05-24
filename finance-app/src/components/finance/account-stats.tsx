"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, Gem, Smartphone, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { WidgetColorPicker } from "./widget-color-picker";

export interface Account {
    id: string;
    name: string;
    type: string;
    balance: string;
    theme?: string | null;
}

export function getUsableBalance(acc: Account): number {
    const bal = parseFloat(acc.balance || "0");
    if (acc.name && acc.name.toLowerCase().includes("bri")) {
        return Math.max(0, bal - 50000);
    }
    return bal;
}

export function AccountStats({ accounts = [] }: { accounts?: Account[] }) {
    if (!accounts.length) {
        return (
            <div className="col-span-3 p-8 text-center border rounded-2xl border-dashed">
                <p className="text-muted-foreground">Tidak ada akun ditemukan.</p>
            </div>
        );
    }

    // Filter accounts by type
    const bankAccounts = accounts.filter(a => a.type === 'bank');
    const walletAccounts = accounts.filter(a => a.type === 'wallet' || a.type === 'emoney');
    const cashAccounts = accounts.filter(a => a.type === 'cash');

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <AccountCategoryWidget
                title="Bank Accounts"
                accounts={bankAccounts}
                type="bank"
            />
            <AccountCategoryWidget
                title="E-Wallets"
                accounts={walletAccounts}
                type="wallet"
            />
            <AccountCategoryWidget
                title="Tunai / Cash"
                accounts={cashAccounts}
                type="cash"
            />
        </div>
    );
}

export function AccountCategoryWidget({ title, accounts, type }: {
    title: string,
    accounts: Account[],
    type: 'bank' | 'wallet' | 'cash'
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const { themes } = useWidgetTheme();

    // Map type to widget ID
    const widgetId = type === 'bank' ? 'bank-accounts' : type === 'wallet' ? 'e-wallets' : 'cash-accounts';
    // Use fallback if theme is not yet loaded contextually to prevent crash
    const theme = themes[widgetId] || { primary: '#000', secondary: '#000', accent: '#000', gradient: '' };

    if (!themes[widgetId]) return null; // Or render skeleton/fallback

    const totalBalance = accounts.reduce((sum, acc) => sum + getUsableBalance(acc), 0);
    const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(totalBalance);

    // Icon based on type
    const Icon = type === 'bank' ? Gem : type === 'wallet' ? Smartphone : Banknote;

    return (
        <>
            <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "relative group h-full cursor-pointer overflow-hidden",
                    "rounded-[2rem]",
                    "backdrop-blur-xl backdrop-saturate-150",
                    "bg-white/60 dark:bg-zinc-800/40",
                    "border border-white/60 dark:border-white/10",
                    "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]",
                    "hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_40px_-5px_theme(colors.primary.DEFAULT/0.2)]",
                    "transition-all duration-300"
                )}
                style={{
                    borderColor: `${theme.primary}20`,
                }}
                onClick={() => accounts.length > 0 && setIsDialogOpen(true)}
            >
                {/* Glass Highlights */}
                <div className="absolute inset-0 rounded-[2rem] border-t border-l border-white/80 dark:border-white/10 pointer-events-none z-20 mix-blend-overlay" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/20 opacity-50" />

                {/* Background Glow */}
                <motion.div
                    className="absolute -right-10 -bottom-10 w-40 h-40 blur-[50px] rounded-full pointer-events-none"
                    style={{
                        background: `radial-gradient(circle, ${theme.secondary}, transparent)`,
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                <div className="p-7 relative z-10 flex flex-col h-full justify-between min-h-[200px]">
                    {/* Header Section */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="p-2 rounded-xl bg-white/40 dark:bg-black/20 border border-white/50 shadow-sm backdrop-blur-md"
                                style={{ color: theme.primary }}
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Icon className="w-5 h-5" />
                            </motion.div>
                            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">{title}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            {accounts.length > 0 && (
                                <motion.div
                                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </motion.div>
                            )}
                            <div onClick={(e) => e.stopPropagation()}>
                                <WidgetColorPicker widgetId={widgetId} widgetName={title} />
                            </div>
                        </div>
                    </div>

                    {/* Summary Content */}
                    <div>
                        <motion.h3
                            className="text-3xl font-black tracking-tighter drop-shadow-sm flex items-start gap-1"
                            style={{ color: theme.primary }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-lg opacity-60 font-semibold mt-1">Rp</span>
                            {formattedTotal.replace('Rp', '').trim()}
                        </motion.h3>
                        <div className="flex items-center gap-2 mt-2 text-sm font-medium text-muted-foreground/70">
                            <Layers className="w-4 h-4" />
                            <span>{accounts.length} Akun Terdaftar</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Popup Dialog - Portal to Document Body */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isDialogOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setIsDialogOpen(false)}
                            />

                            {/* Dialog */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden z-10"
                            >
                                <div className={cn(
                                    "flex flex-col h-full max-h-[85vh] rounded-[2rem] overflow-hidden",
                                    "backdrop-blur-2xl backdrop-saturate-150",
                                    "bg-white/90 dark:bg-black/90",
                                    "border border-white/60 dark:border-white/10",
                                    "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)]",
                                )}
                                    style={{
                                        borderColor: `${theme.primary}30`,
                                    }}
                                >
                                    {/* Header */}
                                    <div className="p-6 border-b border-black/5 dark:border-white/5 flex-shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="p-3 rounded-xl shadow-lg"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`,
                                                    }}
                                                >
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold">{title}</h2>
                                                    <p className="text-sm text-muted-foreground">{accounts.length} akun terdaftar</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                                                onClick={() => setIsDialogOpen(false)}
                                            >
                                                <ChevronUp className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Content - Scrollable */}
                                    <div className="p-6 overflow-y-auto flex-1 min-h-0">
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {accounts.map((account, index) => (
                                                <motion.div
                                                    key={account.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <AccountCard account={account} widgetTheme={theme} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-6 border-t border-black/5 dark:border-white/5 bg-white/20 dark:bg-black/20 flex-shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Saldo</p>
                                                <h3 className="text-2xl font-bold" style={{ color: theme.primary }}>{formattedTotal}</h3>
                                            </div>
                                            <Button onClick={() => setIsDialogOpen(false)}>
                                                Tutup
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

function AccountCard({ account, widgetTheme }: { account: Account, widgetTheme: any }) {
    const balance = getUsableBalance(account);
    const formattedBalance = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(balance);
    const isBri = account.name.toLowerCase().includes("bri");

    // Icon based on type
    const Icon = account.type === 'bank' ? Gem : account.type === 'wallet' || account.type === 'emoney' ? Smartphone : Banknote;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={cn(
                "group relative p-4 rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md",
                "bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/30",
                "border border-white/60 dark:border-white/10"
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-full shadow-sm"
                        style={{
                            background: `linear-gradient(135deg, ${widgetTheme.secondary}, ${widgetTheme.primary})`,
                        }}
                    >
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">{account.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h4 className="text-xl font-bold tracking-tight" style={{ color: widgetTheme.primary }}>{formattedBalance}</h4>
                    {isBri && (
                        <p className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1">
                            <span>🔒</span> Saldo tertahan Rp 50.000
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
