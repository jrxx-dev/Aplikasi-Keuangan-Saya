'use client'

import { motion } from "framer-motion"
import { Plane, Map, Compass, Ticket } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TravelPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-300/20 via-transparent to-transparent -z-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="max-w-4xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-sky-200 dark:border-sky-900/40 p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">

                    <div className="absolute top-10 left-10 animate-pulse">
                        <Compass className="w-12 h-12 text-sky-500" />
                    </div>
                    <motion.div
                        animate={{ x: [0, 100, 200], y: [0, -20, 0], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="absolute top-20 left-0"
                    >
                        <Plane className="w-8 h-8 text-sky-400 rotate-12" />
                    </motion.div>


                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-xl ring-4 ring-sky-100 dark:ring-sky-900/30">
                            <Map className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Travel Planner
                    </h1>

                    <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto">
                        Wujudkan liburan impian tanpa mengganggu arus kas. Buat anggaran perjalanan detail, dari tiket hingga oleh-oleh.
                    </p>

                    <div className="flex justify-center gap-6 mb-12 flex-wrap">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Ticket className="w-5 h-5 text-purple-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Itinerary</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Plane className="w-5 h-5 text-sky-500" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide">Booking</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25 px-8">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-900/20 px-8">
                            Buat Rencana Baru
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
