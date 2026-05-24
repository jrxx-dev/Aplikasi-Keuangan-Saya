"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calculator,
    PieChart,
    TrendingUp,
    Building2,
    Wallet,
    Landmark,
    ArrowRight,
    ArrowDownRight,
    MinusCircle,
    Percent,
    AlertCircle,
    Info,
    Calendar,
    CalendarDays
} from "lucide-react"

interface ProfitLossViewProps {
    totalRevenue: number // From ClientsView (Total Tagihan)
    totalDPP: number     // From ClientsView
    totalBHP: number     // From ClientsView (BHP Regulation)
    totalDebtPayment: number // Monthly debt payment
    totalDepreciation: number
    totalMaintenance: number
}

export function ProfitLossView({ totalRevenue, totalDPP, totalBHP, totalDebtPayment, totalDepreciation, totalMaintenance }: ProfitLossViewProps) {
    const [viewMode, setViewMode] = React.useState<"monthly" | "yearly">("monthly")

    // If viewing yearly, multiply monthly stats by 12
    const multiplier = viewMode === "yearly" ? 12 : 1

    const revenue = (totalRevenue || 0) * multiplier
    const dpp = (totalDPP || 0) * multiplier
    const bhp = (totalBHP || 0) * multiplier

    const ppn = revenue - dpp // Since Tagihan = DPP + PPN

    // Net Distributable Revenue (Pendapatan Bersih untuk Bagi Hasil)
    const regulatoryCosts = ppn + bhp
    const distributableRevenue = revenue - regulatoryCosts // Should equal DPP - BHP roughly

    const SHARE_USER = 0.40 // PT. NET SYNERGY INOVATE
    const SHARE_PARTNER = 0.60 // PT. RUBYAN NETWORK SOLUTION

    const shareUserGross = distributableRevenue * SHARE_USER
    const sharePartnerGross = distributableRevenue * SHARE_PARTNER

    // Laba Kotor (Gross Profit) for User = My Share
    const grossProfit = shareUserGross

    // Deductions
    const debtCost = (totalDebtPayment || 0) * multiplier
    const depreciationCost = (totalDepreciation || 0) * multiplier
    const maintenanceCost = (totalMaintenance || 0) * multiplier
    const totalDeductions = debtCost + depreciationCost + maintenanceCost

    // Laba Bersih (Net Profit)
    const netProfit = grossProfit - totalDeductions

    const formatRp = (val: number) => "Rp " + Math.floor(val).toLocaleString("id-ID")

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold">Analisis Keuangan Real-Time</h2>
                    <p className="text-sm text-muted-foreground">Datastream langsung dari Input Pelanggan & Inventaris.</p>
                </div>
                <div className="flex items-center bg-muted p-1 rounded-lg">
                    <Button
                        variant={viewMode === "monthly" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("monthly")}
                        className="text-xs"
                    >
                        Bulanan
                    </Button>
                    <Button
                        variant={viewMode === "yearly" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("yearly")}
                        className="text-xs"
                    >
                        Tahunan
                    </Button>
                </div>
            </div>

            {/* Top Level Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 border-none text-white shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-100 flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Pendapatan Total (Tagihan)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatRp(revenue)}</div>
                        <p className="text-xs text-indigo-200 mt-1">
                            {viewMode === "monthly" ? "Bulan Ini" : "Proyeksi 1 Tahun"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-teal-600 text-white border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-teal-100 flex items-center gap-2">
                            <Percent className="w-4 h-4" /> Laba Kotor (Gross Profit)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatRp(grossProfit)}</div>
                        <p className="text-xs text-teal-200 mt-1">
                            Bagian 40% Anda (Sebelum Beban)
                        </p>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "border-none shadow-lg text-white",
                    netProfit >= 0 ? "bg-emerald-600" : "bg-rose-600"
                )}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
                            <Calculator className="w-4 h-4" /> Laba Bersih (Net Profit)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatRp(netProfit)}</div>
                        <p className="text-xs text-white/80 mt-1">
                            {netProfit >= 0 ? "Keuntungan Bersih" : "Defisit / Rugi"} ({viewMode === "monthly" ? "/bln" : "/thn"})
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Waterfall Breakdown Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Alur Distribusi Keuangan ({viewMode === "monthly" ? "Bulanan" : "Tahunan"})</CardTitle>
                    <CardDescription>Visualisasi potongan dari Pendapatan hingga Laba Bersih.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 1. Revenue -> Taxes */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="flex items-center gap-2"> <ArrowDownRight className="w-4 h-4 text-slate-400" /> 1. Pendapatan Kotor (Total Tagihan Pelanggan)</span>
                            <span>{formatRp(revenue)}</span>
                        </div>
                        <div className="pl-6 space-y-2 border-l-2 border-dashed border-slate-200 dark:border-slate-800 ml-2">
                            <div className="flex justify-between text-xs text-red-600">
                                <span>(-) PPN (11%)</span>
                                <span>- {formatRp(ppn)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-orange-600">
                                <span>(-) BHP & USO (5%)</span>
                                <span>- {formatRp(bhp)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span>= Pendapatan Bersih (Net Distributable)</span>
                                <span>{formatRp(distributableRevenue)}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* 2. Split -> Partners */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="flex items-center gap-2"> <Building2 className="w-4 h-4 text-slate-400" /> 2. Bagi Hasil (Split)</span>
                        </div>
                        <div className="pl-6 space-y-4 border-l-2 border-dashed border-slate-200 dark:border-slate-800 ml-2 py-2">
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>PT. RUBYAN (60%)</span>
                                    <span>{formatRp(sharePartnerGross)}</span>
                                </div>
                                <Progress value={60} className="h-1.5" indicatorColor="bg-slate-400" />
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-teal-600 mb-1 font-bold">
                                    <span>PT. NET SYNERGY (40%) - GROSS PROFIT</span>
                                    <span>{formatRp(grossProfit)}</span>
                                </div>
                                <Progress value={40} className="h-2" indicatorColor="bg-teal-600" />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* 3. Debt -> Net Profit */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="flex items-center gap-2"> <Wallet className="w-4 h-4 text-slate-400" /> 3. Beban & Laba Bersih</span>
                        </div>
                        <div className="pl-6 space-y-2 border-l-2 border-dashed border-slate-200 dark:border-slate-800 ml-2">
                            <div className="flex justify-between text-xs text-rose-500 font-medium">
                                <span>(-) Cicilan Hutang & Operasional (Debt)</span>
                                <span>- {formatRp(debtCost)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-orange-600 font-medium">
                                <span>(-) Penyusutan Alat (Asset Depreciation)</span>
                                <span>- {formatRp(depreciationCost)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-blue-600 font-medium">
                                <span>(-) Biaya Pemeliharaan (Maintenance)</span>
                                <span>- {formatRp(maintenanceCost)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-emerald-600 pt-2 border-t mt-2">
                                <span>= LABA BERSIH (NET PROFIT)</span>
                                <span>{formatRp(netProfit)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}
