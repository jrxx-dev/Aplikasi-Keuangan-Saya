'use client'

import { motion } from "framer-motion"
import { Scale, Receipt, FileText, Calculator } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TaxPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="max-w-4xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-orange-200 dark:border-orange-900/40 p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">

                    <div className="absolute top-10 right-10 animate-pulse">
                        <Scale className="w-10 h-10 text-orange-500" />
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-300 to-red-500 rounded-full flex items-center justify-center shadow-xl ring-4 ring-orange-100 dark:ring-orange-900/30">
                            <Receipt className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Pajak (Tax Center)
                    </h1>

                    <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
                        Estimasi PPh 21, lapor SPT tahunan, dan arsip dokumen pajak Anda dalam satu tempat yang aman.
                    </p>

                    <div className="flex justify-center gap-6 mb-12 flex-wrap">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">SPT Tahunan</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Scale className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Kalkulator PPh</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 px-8">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/20 px-8">
                            Pelajari Pajak
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
