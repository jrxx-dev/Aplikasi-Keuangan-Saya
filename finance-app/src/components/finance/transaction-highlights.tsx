"use client";

import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, Trophy, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/counter";

const MotionCard = motion(Card);

export function TransactionHighlights() {
    const topIncomes = [
        { label: "Gaji Bulanan", date: "01 April 2024", amount: 12000000 },
        { label: "Proyek Freelance", date: "25 Maret 2024", amount: 5000000 },
        { label: "Jual Laptop Lama", date: "20 Maret 2024", amount: 3200000 },
        { label: "Dividen Investasi", date: "15 Maret 2024", amount: 1500000 },
        { label: "Hadiah", date: "10 Maret 2024", amount: 500000 },
    ];

    const topExpenses = [
        { label: "Handphone Baru", date: "28 Maret 2024", amount: 4000000 },
        { label: "Bayar Kontrakan", date: "01 April 2024", amount: 2500000 },
        { label: "Servis Mobil", date: "18 Maret 2024", amount: 1200000 },
        { label: "Belanja Bulanan", date: "05 Maret 2024", amount: 800000 },
        { label: "Tagihan Listrik", date: "02 Maret 2024", amount: 450000 },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 h-full">
            {/* Highest Income List */}
            <MotionCard
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative overflow-hidden p-6 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-lg rounded-3xl group"
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl">
                            <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Pemasukan Terbesar</h3>
                            <p className="text-xs text-muted-foreground">Sumber pendapatan tertinggi</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Top 1 Highlight */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    #1 Juara
                                </span>
                                <Trophy className="w-5 h-5 text-yellow-300" />
                            </div>
                            <h4 className="text-lg font-bold mb-1 opacity-95">{topIncomes[0].label}</h4>
                            <h3 className="text-3xl font-bold tracking-tight">
                                +<Counter value={topIncomes[0].amount} currency />
                            </h3>
                            <p className="text-xs text-emerald-100 mt-2 opacity-80">{topIncomes[0].date}</p>
                        </div>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    </div>

                    {/* Remaining List */}
                    <div className="space-y-3 pl-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Berikutnya</p>
                        {topIncomes.slice(1).map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                        {index + 2}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{item.label}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                        +<Counter value={item.amount} currency />
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
            </MotionCard>

            {/* Highest Expense List */}
            <MotionCard
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative overflow-hidden p-6 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-lg rounded-3xl group"
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/10 rounded-2xl">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Pengeluaran Terbesar</h3>
                            <p className="text-xs text-muted-foreground">Pos pengeluaran tertinggi</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Top 1 Highlight */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 p-5 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    #1 Terbesar
                                </span>
                                <AlertCircle className="w-5 h-5 text-white/80" />
                            </div>
                            <h4 className="text-lg font-bold mb-1 opacity-95">{topExpenses[0].label}</h4>
                            <h3 className="text-3xl font-bold tracking-tight">
                                -<Counter value={topExpenses[0].amount} currency />
                            </h3>
                            <p className="text-xs text-red-100 mt-2 opacity-80">{topExpenses[0].date}</p>
                        </div>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    </div>

                    {/* Remaining List */}
                    <div className="space-y-3 pl-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Berikutnya</p>
                        {topExpenses.slice(1).map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-[10px]">
                                        {index + 2}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{item.label}</p>
                                        <p className="text-[10px] text-muted-foreground">{item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-600 dark:text-red-400 text-sm">
                                        -<Counter value={item.amount} currency />
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all pointer-events-none" />
            </MotionCard>
        </div>
    );
}
