"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, CheckCircle2, Target, CalendarDays, Building2, Save } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"

interface BusinessReportViewProps {
    revenue?: number
    netProfit?: number
    companyName?: string
    partnerName?: string
}

export function BusinessReportView({
    revenue = 0,
    netProfit = 0,
    companyName = "PT. NET SYNERGY INOVATE",
    partnerName = "PT. RUBYAN NETWORK SOLUTION"
}: BusinessReportViewProps) {

    // --- Manual Business Info (Bios) ---
    // If we want to allow editing this here OR via settings
    // The user said: "Business Info is Company Bio... Input via Business Settings."
    // So here we should probably just DISPLAY it if passed as props, or have a read-only view.
    // However, since I haven't built the Settings Page yet, I will define the props interface to receive it.

    const formatRp = (val: number) => "Rp " + Math.floor(val).toLocaleString("id-ID")
    const currentDate = format(new Date(), "dd MMMM yyyy", { locale: id })

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Report List */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold tracking-tight">Laporan Keuangan & Profil</h2>
                    <p className="text-muted-foreground">Profil perusahaan dan arsip laporan bulanan.</p>
                </div>

                {/* Company Bio Section (New Request) */}
                <Card className="bg-slate-50 dark:bg-slate-900 border-indigo-100 dark:border-indigo-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                            <Building2 className="w-5 h-5" />
                            Informasi Bisnis (Biodata Perusahaan)
                        </CardTitle>
                        <CardDescription>Entitas legal yang terlibat dalam kerjasama ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3 p-4 bg-white dark:bg-slate-950 rounded-xl border shadow-sm">
                            <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Pihak Pertama (Anda)</h3>
                            <div>
                                <div className="font-bold text-lg text-slate-900 dark:text-slate-100">{companyName}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Pemilik Infrastruktur Last-Mile & Manajemen Pelanggan.
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 p-4 bg-white dark:bg-slate-950 rounded-xl border shadow-sm">
                            <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Pihak Kedua (Mitra)</h3>
                            <div>
                                <div className="font-bold text-lg text-slate-900 dark:text-slate-100">{partnerName}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Penyedia Bandwidth Hulu & Core Network.
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Real-time Summary Card for Reporting */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Ringkasan Bulan Ini (Live)</CardTitle>
                        <CardDescription>Data realtime yang siap dicetak menjadi laporan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                                <div className="text-xs font-medium uppercase">Omzet Berjalan</div>
                                <div className="text-2xl font-bold mt-1">{formatRp(revenue)}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                <div className="text-xs font-medium uppercase">Laba Bersih Est.</div>
                                <div className="text-2xl font-bold mt-1">{formatRp(netProfit)}</div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 border-t p-4 flex gap-2">
                        <Button className="flex-1 gap-2">
                            <FileText className="w-4 h-4" />
                            Generate Laporan {format(new Date(), "MMMM", { locale: id })}
                        </Button>
                        <Button variant="outline" size="icon">
                            <Download className="w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>

                {/* Archive (Static for now, but illustrative) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Arsip Laporan</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[200px]">
                            <div className="divide-y">
                                {[
                                    { month: "Oktober 2024", status: "Final", net: "Rp 65.000.000", date: "01 Nov 2024" },
                                    { month: "September 2024", status: "Final", net: "Rp 62.500.000", date: "01 Okt 2024" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{item.month}</p>
                                                <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {item.date}</span>
                                                    <span className="text-emerald-600 font-medium">{item.net}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Goals & Summary Sidebar */}
            <div className="space-y-6">
                <Card className="bg-slate-900 text-white border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            Target Bisnis
                        </CardTitle>
                        <CardDescription className="text-slate-400">Target: Laba Bersih Tahunan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold text-white">Rp 1.000.000.000</div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-slate-300">
                                <span>Progress (YTD)</span>
                                <span>{Math.min(((netProfit * 12) / 1000000000) * 100, 100).toFixed(1)}% (Proj)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-1000"
                                    style={{ width: `${Math.min(((netProfit * 12) / 1000000000) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">
                            Proyeksi berdasarkan performa bulan ini.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
