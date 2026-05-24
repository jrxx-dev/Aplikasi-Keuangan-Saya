'use client'

import { motion } from "framer-motion"
import { Armchair, Umbrella, Sun, Palmtree } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PensionPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute bottom-0 w-full h-[500px] bg-gradient-to-t from-blue-500/10 to-transparent -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="max-w-4xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-blue-200 dark:border-blue-900/40 p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">

                    <div className="absolute top-10 right-10 animate-bounce duration-[4000ms]">
                        <Sun className="w-12 h-12 text-yellow-400" />
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-blue-100 dark:ring-blue-900/30">
                            <Umbrella className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Dana Pensiun
                    </h1>

                    <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
                        Masa tua yang tenang dimulai dari hari ini. Rencanakan Dana Pensiun Lembaga Keuangan (DPLK) dan JHT Anda.
                    </p>

                    <div className="flex justify-center gap-6 mb-12 flex-wrap">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Armchair className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Simulasi</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Palmtree className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Target</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 px-8">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 px-8">
                            Mulai Rencana
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
