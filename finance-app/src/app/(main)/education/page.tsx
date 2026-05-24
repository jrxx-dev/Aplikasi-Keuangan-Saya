'use client'

import { motion } from "framer-motion"
import { GraduationCap, BookOpen, Lightbulb, PlayCircle, Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EducationPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl w-full"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-teal-100 dark:border-teal-900/40 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">

                    {/* Floating Books */}
                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="absolute top-20 left-10 opacity-50"
                    >
                        <BookOpen className="w-12 h-12 text-indigo-400" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-20 right-10 opacity-50"
                    >
                        <Lightbulb className="w-12 h-12 text-teal-400" />
                    </motion.div>


                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-500">
                            <GraduationCap className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Pusat Edukasi
                    </h1>

                    <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
                        Tingkatkan literasi finansial Anda dengan modul pembelajaran interaktif.
                        Dari dasar pengelolaan uang hingga strategi investasi tingkat lanjut.
                    </p>

                    {/* Learning Tracks Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                        <div className="group p-5 rounded-2xl bg-white dark:bg-slate-800 border-l-4 border-teal-500 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">Finansial 101</h3>
                                <BookOpen className="w-5 h-5 text-teal-500" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">Dasar budgeting & menabung.</p>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-teal-500 h-full w-3/4"></div>
                            </div>
                        </div>

                        <div className="group p-5 rounded-2xl bg-white dark:bg-slate-800 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">Investasi Pemula</h3>
                                <PlayCircle className="w-5 h-5 text-indigo-500" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">Saham, Reksadana & Kripto.</p>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full w-1/4"></div>
                            </div>
                        </div>

                        <div className="group p-5 rounded-2xl bg-white dark:bg-slate-800 border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">Quiz & Rewards</h3>
                                <Trophy className="w-5 h-5 text-amber-500" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">Uji pengetahuanmu.</p>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full w-0"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild size="lg" className="h-12 px-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/25">
                            <Link href="/">
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                        <Button variant="ghost" size="lg" className="h-12 px-8 rounded-full text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20">
                            Lihat Katalog Kelas
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
