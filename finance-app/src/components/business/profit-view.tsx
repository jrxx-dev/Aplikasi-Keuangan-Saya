"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, Wifi, Zap, Trophy, ArrowRight } from "lucide-react"

export function BusinessProfitView() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Main Profit Analysis Card */}
            <Card className="md:col-span-2 lg:col-span-2 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <TrendingUp className="w-5 h-5" />
                                Analisis Keuntungan
                            </CardTitle>
                            <CardDescription>
                                Mengapa perusahaan Anda untung bulan ini.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">Bertumbuh</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
                            <div className="text-sm font-medium text-muted-foreground mb-2">Akumulasi Profit (Setaun)</div>
                            <div className="text-3xl font-bold text-emerald-600">Rp 450.000.000</div>
                            <div className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
                                <TrendingUp className="w-3 h-3" /> +15% vs Tahun Lalu
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
                            <div className="text-sm font-medium text-muted-foreground mb-2">Margin Rata-rata (Bagian Anda)</div>
                            <div className="text-3xl font-bold text-blue-600">40%</div>
                            <div className="text-xs text-blue-500 flex items-center gap-1 mt-1 font-medium">
                                <Users className="w-3 h-3" /> PT. Net Synergy Inovate
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Faktor Keuntungan</h4>

                        <div className="relative pl-6 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-4">
                            <div className="relative">
                                <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-950" />
                                <div className="text-sm font-semibold text-foreground">Instalasi Baru</div>
                                <div className="text-xs text-muted-foreground">35 titik WiFi baru terpasang di blok residensial A & B.</div>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-950" />
                                <div className="text-sm font-semibold text-foreground">Bonus Tanpa Downtime</div>
                                <div className="text-xs text-muted-foreground">Mencapai uptime 99.9%, memicu insentif performa dari PT. Rubyan.</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logic/Explanation Sidebar */}
            <Card className="h-full bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-950">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Faktor Sukses
                    </CardTitle>
                    <CardDescription>Mengapa Anda menang.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "Strategi Anda yang fokus pada **Last-Mile Delivery** memungkinkan PT. Net Synergy mengambil margin 40% secara efisien tanpa menanggung biaya infrastruktur backbone yang berat (ditanggung PT. Rubyan)."
                    </p>

                    <div className="p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                        <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <strong>Rekomendasi:</strong> Perluas cakupan ke Sektor 5 untuk memaksimalkan kapasitas bandwidth saat ini.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
