'use client'

import { motion } from "framer-motion"
import { TrendingUp, LineChart, BarChart3, PieChart, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InvestmentsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-3xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-indigo-100 dark:border-indigo-900/50 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>

                    <div className="flex justify-center mb-10 relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                        <div className="relative w-28 h-28 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                            <TrendingUp className="w-14 h-14 text-white" />
                        </div>
                        {/* Floating elements */}
                        <div className="absolute top-0 right-10 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg animate-bounce duration-[3000ms]">
                            <PieChart className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="absolute bottom-0 left-10 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg animate-bounce duration-[3000ms] delay-700">
                            <BarChart3 className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 mb-6 animate-gradient bg-300%">
                        Portofolio Investasi
                    </h1>

                    <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                        Kelola aset saham, reksadana, kripto, hingga emas dalam satu dashboard terintegrasi.
                        Analisa performa portofolio Anda secara real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <Button asChild size="lg" className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-300">
                            <ArrowUpRight className="w-4 h-4 mr-2" />
                            Bergabung Waitlist
                        </Button>
                    </div>

                    <div className="mt-16 pt-8 border-t border-indigo-100 dark:border-indigo-900/50 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-indigo-50 dark:border-indigo-900/30">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-3">
                                <LineChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-sm mb-1">Real-time Tracking</h3>
                            <p className="text-xs text-muted-foreground">Pantau harga pasar terkini.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-indigo-50 dark:border-indigo-900/30">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-3">
                                <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-sm mb-1">Asset Allocation</h3>
                            <p className="text-xs text-muted-foreground">Visualisasi diversifikasi aset.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-indigo-50 dark:border-indigo-900/30 opacity-70">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-3">
                                <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="font-semibold text-sm mb-1">ROI Calculator</h3>
                            <p className="text-xs text-muted-foreground">Hitung estimasi keuntungan.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
