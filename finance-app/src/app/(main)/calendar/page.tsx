'use client'

import { motion } from "framer-motion"
import { Calendar as CalendarIcon, Clock, Bell, CalendarDays, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-3xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-blue-100 dark:border-blue-900/50 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">

                    {/* Animated Calendar Decoration */}
                    <div className="flex justify-center mb-10 relative">
                        <div className="relative w-28 h-28 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-xl z-20">
                            <CalendarIcon className="w-14 h-14 text-white" />
                            {/* Paper effect */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-blue-700/50 rounded-full blur-sm"></div>
                        </div>

                        {/* Floating Notifications */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute top-0 -right-4 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg z-10 border border-blue-50 dark:border-slate-700 flex items-center gap-3 w-48"
                        >
                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                <Bell className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Today</p>
                                <p className="text-xs font-semibold">Bayar Listrik</p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-0 -left-4 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-lg z-30 border border-blue-50 dark:border-slate-700 flex items-center gap-3 w-48"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Success</p>
                                <p className="text-xs font-semibold">Gaji Masuk</p>
                            </div>
                        </motion.div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Kalender Finansial
                    </h1>

                    <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
                        Jangan pernah lewatkan jatuh tempo tagihan. Kalender pintar kami akan menyinkronkan semua pembayaran rutin dan pemasukan Anda.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
                        <Button asChild size="lg" className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="ghost" size="lg" className="h-12 px-8 rounded-full text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                            Lihat Roadmap
                        </Button>
                    </div>

                    {/* Feature Highlight */}
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Bill Reminder', 'Salary Schedule', 'Subscription', 'Debt Due Date'].map((item, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs font-medium text-muted-foreground border border-slate-100 dark:border-slate-800">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
