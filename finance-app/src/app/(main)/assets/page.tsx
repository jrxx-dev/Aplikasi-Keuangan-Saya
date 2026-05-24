'use client'

import { motion } from "framer-motion"
import { Gem, Building2, Car, Briefcase, Landmark } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AssetsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="max-w-4xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-amber-200 dark:border-amber-900/40 p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">

                    {/* Floating Gems */}
                    <div className="absolute top-10 right-10 animate-pulse">
                        <Gem className="w-10 h-10 text-amber-500" />
                    </div>
                    <div className="absolute bottom-10 left-10 animate-bounce duration-[3000ms]">
                        <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-amber-100 dark:ring-amber-900/30">
                            <Landmark className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Manajemen Aset
                    </h1>

                    <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
                        Lacak total kekayaan bersih (Net Worth) Anda. Hitung nilai properti, kendaraan, emas, dan barang berharga lainnya secara otomatis.
                    </p>

                    {/* Asset Categories */}
                    <div className="flex justify-center gap-6 mb-12 flex-wrap">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Properti</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Car className="w-5 h-5 text-red-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Kendaraan</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Gem className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Logam Mulia</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Bisnis</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 px-8">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20 px-8">
                            Input Aset Awal
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
