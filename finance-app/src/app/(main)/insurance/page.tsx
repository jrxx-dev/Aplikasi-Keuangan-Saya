'use client'

import { motion } from "framer-motion"
import { Shield, ShieldCheck, HeartPulse, CarFront } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InsurancePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="max-w-4xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-indigo-200 dark:border-indigo-900/40 p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">

                    <div className="absolute top-10 right-10 animate-pulse">
                        <HeartPulse className="w-12 h-12 text-rose-500" />
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3">
                            <ShieldCheck className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Proteksi & Asuransi
                    </h1>

                    <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
                        Kelola polis asuransi jiwa, kesehatan, dan kendaraan Anda. Dapatkan notifikasi jatuh tempo premi dan analisa cakupan proteksi.
                    </p>

                    <div className="flex justify-center gap-6 mb-12 flex-wrap">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <HeartPulse className="w-5 h-5 text-rose-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Kesehatan</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Jiwa</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <CarFront className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Kendaraan</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 px-8">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20 px-8">
                            Tambah Polis
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
