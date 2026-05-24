'use client'

import { motion } from "framer-motion"
import { Heart, Calculator, Sprout, CircleDollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ZakatPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-emerald-100 dark:border-emerald-900/40 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">

                    {/* Floating Icons */}
                    <div className="absolute top-12 left-12 animate-bounce duration-[3000ms]">
                        <Sprout className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="absolute bottom-12 right-12 animate-pulse">
                        <CircleDollarSign className="w-8 h-8 text-green-500" />
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-emerald-50 dark:ring-emerald-900/20">
                            <Heart className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 mb-6">
                        Zakat & Berbagi
                    </h1>

                    <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
                        Sucikan harta dengan Zakat dan tumbuhkan keberkahan melalui Sedekah.
                        Hitung kewajiban Anda dan salurkan ke badan amal terpercaya.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-emerald-100 dark:border-emerald-800/30">
                            <Calculator className="w-8 h-8 text-emerald-500 mb-3 mx-auto" />
                            <h3 className="font-semibold mb-1">Kalkulator Zakat</h3>
                            <p className="text-xs text-muted-foreground">Hitung Zakat Maal & Profesi (2.5%).</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-emerald-100 dark:border-emerald-800/30">
                            <Sprout className="w-8 h-8 text-green-500 mb-3 mx-auto" />
                            <h3 className="font-semibold mb-1">Sedekah Rutin</h3>
                            <p className="text-xs text-muted-foreground">Pengingat sedekah subuh & jumat.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-emerald-100 dark:border-emerald-800/30">
                            <Heart className="w-8 h-8 text-teal-500 mb-3 mx-auto" />
                            <h3 className="font-semibold mb-1">Penyaluran</h3>
                            <p className="text-xs text-muted-foreground">Integrasi dengan Baznas & Dompet Dhuafa.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 px-8">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20 px-8">
                            Hitung Zakat Sekarang
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
