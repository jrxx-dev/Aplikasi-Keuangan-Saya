'use client'

import { motion } from "framer-motion"
import { Heart, Users, Home, PiggyBank, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FamilyPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, type: "spring" }}
                className="max-w-4xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-rose-100 dark:border-rose-900/40 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">

                    {/* Floating Hearts */}
                    <div className="absolute top-10 right-10 animate-bounce duration-[2000ms]">
                        <Heart className="w-8 h-8 text-rose-400 fill-rose-200 dark:fill-rose-900/50" />
                    </div>
                    <div className="absolute bottom-20 left-10 animate-bounce duration-[2500ms] delay-500">
                        <Users className="w-6 h-6 text-orange-400" />
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl ring-8 ring-rose-50 dark:ring-rose-900/20">
                            <Home className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500 dark:from-rose-400 dark:to-orange-400 mb-6">
                        Keuangan Keluarga
                    </h1>

                    <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
                        Kelola anggaran rumah tangga bersama pasangan dan keluarga.
                        Transparansi finansial untuk masa depan yang lebih harmonis.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-rose-100 dark:border-rose-800/30">
                            <Users className="w-8 h-8 text-rose-500 mb-3 mx-auto" />
                            <h3 className="font-semibold mb-1">Shared Wallet</h3>
                            <p className="text-xs text-muted-foreground">Dompet bersama untuk belanja bulanan.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-rose-100 dark:border-rose-800/30">
                            <PiggyBank className="w-8 h-8 text-orange-500 mb-3 mx-auto" />
                            <h3 className="font-semibold mb-1">Tabungan Anak</h3>
                            <p className="text-xs text-muted-foreground">Persiapkan dana pendidikan si kecil.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-rose-100 dark:border-rose-800/30">
                            <ShieldCheck className="w-8 h-8 text-emerald-500 mb-3 mx-auto" />
                            <h3 className="font-semibold mb-1">Asuransi Keluarga</h3>
                            <p className="text-xs text-muted-foreground">Monitoring polis asuransi keluarga.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 px-8">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20 px-8">
                            Undang Pasangan
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
