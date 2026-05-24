"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    ArrowDownLeft,
    ArrowUpRight,
    ShoppingBag,
    Utensils,
    Car,
    Home,
    Zap,
    Smartphone,
    HeartPulse,
    Briefcase,
    Gift,
    CreditCard,
    Wallet,
    Coffee,
    Plane,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

interface Transaction {
    id: string;
    description: string | null;
    amount: string;
    date: Date;
    type: "income" | "expense" | "transfer";
    category: string | null;
    categoryIcon: string | null;
}

// Smart Icon Mapping Helper
const getCategoryIcon = (categoryName: string | null, type: string) => {
    if (!categoryName) return type === 'income' ? Wallet : CreditCard;

    const lower = categoryName.toLowerCase();

    if (lower.includes('makan') || lower.includes('food') || lower.includes('restaurant')) return Utensils;
    if (lower.includes('belanja') || lower.includes('shop') || lower.includes('mall')) return ShoppingBag;
    if (lower.includes('transport') || lower.includes('gojek') || lower.includes('grab') || lower.includes('bensin')) return Car;
    if (lower.includes('rumah') || lower.includes('listrik') || lower.includes('air') || lower.includes('sewa')) return Home;
    if (lower.includes('gaji') || lower.includes('salary')) return Briefcase;
    if (lower.includes('hiburan') || lower.includes('nonton') || lower.includes('game')) return Zap;
    if (lower.includes('pulsa') || lower.includes('data') || lower.includes('internet')) return Smartphone;
    if (lower.includes('kesehatan') || lower.includes('obat') || lower.includes('dokter')) return HeartPulse;
    if (lower.includes('hadiah') || lower.includes('donasi')) return Gift;
    if (lower.includes('kopi') || lower.includes('coffee')) return Coffee;
    if (lower.includes('travel') || lower.includes('liburan') || lower.includes('hotel')) return Plane;

    return type === 'income' ? Wallet : CreditCard;
}

export function RecentTransactions({ data = [] }: { data?: Transaction[] }) {
    // Limit to 4 transactions
    const displayData = data.slice(0, 4);

    // Basic date formatter
    const formatDate = (dateInput: Date) => {
        const date = new Date(dateInput);
        const today = new Date();
        const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

        if (isToday) return "Hari ini";

        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <Card className="shadow-xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 h-full rounded-3xl overflow-hidden transition-all hover:shadow-2xl flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">Transaksi Terkini</CardTitle>
                    <CardDescription>Aktivitas keuangan terbaru Anda</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
                {displayData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground flex-1">
                        <div className="w-16 h-16 mb-4 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center animate-pulse">
                            <ShoppingBag className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="font-medium">Belum ada transaksi</p>
                        <p className="text-xs max-w-[200px] mt-1 opacity-70">Transaksi yang Anda buat akan muncul di sini secara real-time.</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-black/5 dark:divide-white/5 flex-1">
                            {displayData.map((transaction, i) => {
                                const amountVal = parseFloat(transaction.amount);
                                const Icon = getCategoryIcon(transaction.category, transaction.type);
                                const isIncome = transaction.type === 'income';

                                return (
                                    <Link
                                        key={transaction.id}
                                        href="/transactions"
                                        className="block focus:outline-none"
                                    >
                                        <div className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                {/* Icon Box */}
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm",
                                                    isIncome
                                                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                                                )}>
                                                    <Icon className="w-6 h-6" />
                                                </div>

                                                {/* info */}
                                                <div className="space-y-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground/90 truncate leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {transaction.description || "Tanpa Keterangan"}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-medium bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded capitalize">
                                                            {transaction.category || "Umum"}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="font-medium">{formatDate(transaction.date)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="text-right shrink-0 pl-2">
                                                <div className={cn(
                                                    "font-black font-mono text-sm mb-1 tabular-nums",
                                                    isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                )}>
                                                    {isIncome ? "+" : "-"}{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(amountVal))}
                                                </div>
                                                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[10px] font-bold text-indigo-500 mr-1 opacity-70">Kelola</span>
                                                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* View All Button */}
                        {data.length > 4 && (
                            <div className="p-4 border-t border-black/5 dark:border-white/5">
                                <Link href="/transactions">
                                    <Button variant="outline" className="w-full group hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                        <span className="font-semibold">Lihat Semua Transaksi</span>
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
