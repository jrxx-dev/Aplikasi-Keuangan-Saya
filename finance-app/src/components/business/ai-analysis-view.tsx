"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
    Brain,
    Sparkles,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    Lightbulb,
    ArrowRight,
    Target,
    Zap,
    Scale,
    ShieldCheck
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AIAnalysisViewProps {
    revenue: number
    netProfit: number
    totalDebt: number
    profitMargin: number
    assetsValue: number
    monthlyGrowth?: number // Optional growth metric
}

export function BusinessAIAnalysisView({
    revenue,
    netProfit,
    totalDebt,
    profitMargin,
    assetsValue
}: AIAnalysisViewProps) {
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [showResults, setShowResults] = React.useState(false)

    // Simulate AI thinking process
    React.useEffect(() => {
        setIsAnalyzing(true)
        const timer = setTimeout(() => {
            setIsAnalyzing(false)
            setShowResults(true)
        }, 2000)
        return () => clearTimeout(timer)
    }, [revenue, netProfit]) // Re-run if key data changes

    // --- LOGIC ENGINE (Simulated AI) ---

    // 1. Health Score (0-100)
    let healthScore = 70 // Base
    if (profitMargin > 30) healthScore += 10
    if (profitMargin > 50) healthScore += 5
    if (netProfit < 0) healthScore -= 30
    if (totalDebt > revenue * 0.5) healthScore -= 20
    if (assetsValue > 0) healthScore += 5
    // Clamp
    healthScore = Math.min(Math.max(healthScore, 0), 100)

    // 2. Determine Status
    let status: "Excellent" | "Good" | "Warning" | "Critical" = "Good"
    if (healthScore >= 90) status = "Excellent"
    else if (healthScore >= 70) status = "Good"
    else if (healthScore >= 40) status = "Warning"
    else status = "Critical"

    // 3. Generate Insights
    const insights = []

    // Profit Insights
    if (profitMargin > 35) {
        insights.push({
            type: "success",
            title: "Margin Profit Superior",
            desc: `Margin keuntungan Anda (${profitMargin.toFixed(1)}%) berada di atas rata-rata industri ISP (20-30%). Model bagi hasil 40% efektif.`
        })
    } else if (profitMargin < 10 && profitMargin > 0) {
        insights.push({
            type: "warning",
            title: "Margin Tipis",
            desc: "Margin keuntungan menipis. Periksa kembali struktur biaya operasional atau negosiasi ulang bagi hasil."
        })
    }

    // Debt Insights
    if (totalDebt > 0) {
        const debtRatio = (totalDebt / revenue) * 100
        if (debtRatio > 40) {
            insights.push({
                type: "danger",
                title: "Rasio Hutang Tinggi",
                desc: `Hutang memakan ${debtRatio.toFixed(1)}% dari omzet bulanan. Ini berisiko jika ada penurunan pendapatan tiba-tiba.`
            })
        } else {
            insights.push({
                type: "info",
                title: "Leverage Hutang Aman",
                desc: "Penggunaan hutang masih dalam batas aman untuk operasional."
            })
        }
    } else {
        insights.push({
            type: "success",
            title: "Bebas Hutang",
            desc: "Bisnis berjalan dengan cashflow mandiri tanpa beban bunga."
        })
    }

    // Asset Insights
    if (assetsValue > 0 && assetsValue < revenue * 0.1) {
        insights.push({
            type: "warning",
            title: "Aset Operasional Minim",
            desc: "Nilai aset tercatat rendah dibanding omzet. Pastikan semua alat (Router, Modem) sudah terinventarisir untuk menghindari loss."
        })
    }

    const formatRp = (val: number) => "Rp " + Math.floor(val).toLocaleString("id-ID")

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Header / AI Status */}
            <div className="md:col-span-3">
                <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -mr-12 -mt-12" />
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg animate-pulse">
                                <Brain className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-indigo-100">Cortex Business AI</CardTitle>
                                <CardDescription className="text-slate-400">
                                    {isAnalyzing ? "Menganalisis data finansial..." : "Analisis selesai. Berikut hasil diagnosa kesehatan bisnis Anda."}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    {showResults && (
                        <CardContent className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="relative flex items-center justify-center w-32 h-32">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                className="text-slate-800"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                strokeDasharray={351.86}
                                                strokeDashoffset={351.86 - (351.86 * healthScore) / 100}
                                                className={`transition-all duration-1000 ease-out ${healthScore > 80 ? "text-emerald-500" :
                                                        healthScore > 50 ? "text-yellow-500" : "text-red-500"
                                                    }`}
                                            />
                                        </svg>
                                        <div className="absolute text-3xl font-bold">{healthScore}</div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-400">Health Score</span>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            Status: <span className={`${status === "Excellent" ? "text-emerald-400" :
                                                    status === "Good" ? "text-emerald-400" :
                                                        status === "Warning" ? "text-yellow-400" : "text-red-400"
                                                }`}>{status}</span>
                                        </h3>
                                        <p className="text-slate-300 mt-2 leading-relaxed">
                                            {status === "Excellent" && "Performa bisnis luar biasa. Margin profit sehat, beban terkendali, dan risiko hutang minimal. Saatnya ekspansi agresif."}
                                            {status === "Good" && "Bisnis berjalan baik dan stabil. Ada ruang untuk perbaikan efisiensi biaya, namun secara umum arah pertumbuhan positif."}
                                            {status === "Warning" && "Terdeteksi beberapa risiko finansial. Perhatikan beban hutang atau biaya operasional yang mulai menggerus profit."}
                                            {status === "Critical" && "PERHATIAN: Bisnis dalam kondisi kritis. Segera lakukan audit pengeluaran dan restrukturisasi hutang."}
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex-1">
                                            <div className="text-xs text-slate-500 mb-1">Rekomendasi Utama</div>
                                            <div className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                                                <Target className="w-4 h-4" />
                                                {totalDebt > 0 ? "Lunasi Hutang Prioritas Tinggi" : "Reinvestasi Profit ke Aset"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* Insight List */}
            {showResults && (
                <div className="md:col-span-3 grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                Faktor & Analisis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {insights.map((insight, i) => (
                                <div key={i} className={`p-4 rounded-xl border flex gap-3 items-start ${insight.type === "success" ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/50" :
                                        insight.type === "warning" ? "bg-yellow-50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/50" :
                                            insight.type === "danger" ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/50" :
                                                "bg-blue-50 border-blue-100"
                                    }`}>
                                    {insight.type === "success" && <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />}
                                    {insight.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                                    {insight.type === "danger" && <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />}
                                    {insight.type === "info" && <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />}

                                    <div>
                                        <h4 className={`font-semibold text-sm ${insight.type === "success" ? "text-emerald-700 dark:text-emerald-400" :
                                                insight.type === "warning" ? "text-yellow-700 dark:text-yellow-400" :
                                                    insight.type === "danger" ? "text-red-700 dark:text-red-400" :
                                                        "text-blue-700"
                                            }`}>{insight.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            {insight.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                Peluang & Strategi (AI Generated)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-xs">1</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">Optimasi Aset</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Nilai aset Anda saat ini {formatRp(assetsValue)}. Pastikan maintenance rutin dilakukan untuk memperpanjang "Umur Ekonomis" dan menekan biaya penyusutan.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-xs">2</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">Diversifikasi Income</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Jangan hanya bergantung pada tagihan bulanan. Pertimbangkan menawarkan layanan "Instalasi Prioritas" atau "Maintenance Premium" untuk menambah cashflow.
                                        </p>
                                    </div>
                                </div>

                                {netProfit > 5000000 && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <span className="font-bold text-xs">3</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">Simpanan Darurat</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Laba bersih Anda cukup sehat. Disarankan menyisihkan {formatRp(netProfit * 0.2)} (20%) bulan ini ke kas cadangan.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
