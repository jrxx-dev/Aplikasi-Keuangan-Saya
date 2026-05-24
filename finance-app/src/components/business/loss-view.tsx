"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowDown, ArrowUpRight, TrendingDown, Server, Wrench, ShieldAlert } from "lucide-react"

export function BusinessLossView() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Main Loss Analysis Card */}
            <Card className="md:col-span-2 lg:col-span-2 bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl flex items-center gap-2 text-red-700 dark:text-red-400">
                                <TrendingDown className="w-5 h-5" />
                                Analisis Beban & Kerugian
                            </CardTitle>
                            <CardDescription>
                                Menganalisis ke mana uang perusahaan keluar sebelum keuntungan.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">Dampak Tinggi</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Primary Cost Driver: Bandwidth to PT Rubyan */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-slate-500" />
                                Pembelian Bandwidth (PT. Rubyan)
                            </span>
                            <span className="text-red-600 font-bold">-60% dari Omzet</span>
                        </div>
                        <Progress value={60} className="h-2.5 bg-red-100" indicatorColor="bg-slate-600" />
                        <p className="text-xs text-muted-foreground">
                            Beban terbesar. Kesepakatan bagi hasil/pembelian bandwidth hulu dari PT. Rubyan Network Solution.
                        </p>
                    </div>

                    {/* Secondary: Regulatory */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-orange-500" />
                                Regulasi (PPN 11% + BHP 5%)
                            </span>
                            <span className="text-orange-600 font-bold">-16% dari Omzet</span>
                        </div>
                        <Progress value={16} className="h-2.5 bg-red-100" indicatorColor="bg-orange-500" />
                        <p className="text-xs text-muted-foreground">
                            Pungutan wajib pemerintah (Pajak Pertambahan Nilai & Biaya Hak Penggunaan). Tidak dapat dinegosiasikan.
                        </p>
                    </div>

                    {/* Tertiary: Operational */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-blue-500" />
                                Operasional & Pemeliharaan
                            </span>
                            <span className="text-blue-600 font-bold">~5% Variabel</span>
                        </div>
                        <Progress value={5} className="h-2.5 bg-red-100" indicatorColor="bg-blue-500" />
                        <p className="text-xs text-muted-foreground">
                            Perbaikan lapangan, penggantian perangkat, dan bahan bakar tim teknis.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Why is there a Loss? (Analysis Sidebar) */}
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base">Kenapa Beban Tinggi?</CardTitle>
                    <CardDescription>Diagnosa otomatis pengeluaran.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-sm">
                        <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Ketergantungan Bandwidth</div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            Model bisnis Anda sangat bergantung pada akses dari <span className="font-medium text-foreground">PT. Rubyan</span>. Potongan 60% ini adalah "beban" utama namun menjamin kualitas koneksi.
                        </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50 text-sm">
                        <div className="font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Laporan Insiden
                        </div>
                        <p className="text-red-600/80 dark:text-red-300/80 text-xs leading-relaxed">
                            Terdeteksi 3 kabel putus bulan ini meningkatkan biaya "Pemeliharaan" sebesar 2.1%.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
