"use client";

import * as React from "react"
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, DollarSign, Users, TrendingDown, Wallet, Calculator, Percent, FileText, Wrench, Brain, Settings, Info } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMonth, getYear, setMonth, setYear, isSameMonth, format, startOfMonth, endOfMonth } from "date-fns"
import { id } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { IncomeView } from "@/components/business/income-view"
import { DebtView } from "@/components/business/debt-view"
import { ProfitLossView } from "@/components/business/profit-loss-view"
import { BusinessReportView } from "@/components/business/report-view"
import { BusinessAIAnalysisView } from "@/components/business/ai-analysis-view"
import { DepreciationView, AssetItem } from "@/components/business/depreciation-view"
import { ClientsView, Client } from "@/components/business/clients-view"
import { IncomeItem } from "@/components/business/add-income-dialog"
import { DebtItem } from "@/components/business/add-debt-dialog"
import { BusinessSettingsView, CompanyInfo } from "@/components/business/settings-view"
import { BusinessPageSettingsView, BusinessPageConfig } from "@/components/business/page-settings-view"
import { getBusinessData, saveClient, deleteClient, saveAsset, deleteAsset, saveIncome, deleteIncome, saveDebt, deleteDebt, updateBusinessSettings } from "@/actions/business"

export default function BusinessPage() {
    const searchParams = useSearchParams()
    const viewParam = searchParams.get("view")

    // ---- STATE MANAGEMENT ----
    const [activeTab, setActiveTab] = React.useState("clients")
    const [isLoading, setIsLoading] = React.useState(true)

    // Date Stats
    const now = new Date()
    const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth().toString())
    const [selectedYear, setSelectedYear] = React.useState(now.getFullYear().toString())

    const [clients, setClients] = React.useState<Client[]>([])
    const [incomes, setIncomes] = React.useState<IncomeItem[]>([])
    const [debts, setDebts] = React.useState<DebtItem[]>([])
    const [assets, setAssets] = React.useState<AssetItem[]>([])

    // Page Configuration State
    const [pageConfig, setPageConfig] = React.useState<BusinessPageConfig>({
        showAssets: true,
        showIncome: true,
        showDebt: true,
        showAI: true,
    })

    // Settings State (Company Bio)
    const [companyInfo, setCompanyInfo] = React.useState<CompanyInfo>({
        myCompanyName: "PT. NET SYNERGY INOVATE",
        myCompanyDesc: "Pemilik Infrastruktur Last-Mile & Manajemen Pelanggan.",
        partnerName: "PT. RUBYAN NETWORK SOLUTION",
        partnerDesc: "Penyedia Bandwidth Hulu & Core Network."
    })

    // Sync URL params to Active Tab
    React.useEffect(() => {
        if (viewParam === "settings") setActiveTab("page-settings")
        else if (viewParam === "info") setActiveTab("business-info")
    }, [viewParam])

    // Load Data from DB
    React.useEffect(() => {
        const load = async () => {
            try {
                const data = await getBusinessData()
                if (data) {
                    // Map Clients
                    setClients(data.clients.map(c => {
                        const tagihan = parseFloat(c.monthlyFee) || 0
                        const dpp = tagihan / 1.11
                        return {
                            id: c.id,
                            name: c.name,
                            tagihan,
                            dpp,
                            ppn: dpp * 0.11,
                            bhp: dpp * 0.05
                        }
                    }))

                    // Map Assets
                    setAssets(data.assets.map(a => ({
                        id: a.id,
                        name: a.name,
                        price: parseFloat(a.purchasePrice) || 0,
                        lifespanMonths: a.lifespanMonths || 12,
                        monthlyMaintenance: parseFloat(a.monthlyMaintenanceCost || "0") || 0,
                        purchaseDate: a.purchaseDate || new Date()
                    })))

                    // Map Incomes
                    setIncomes(data.incomes.map(i => ({
                        id: i.id,
                        amount: parseFloat(i.amount) || 0,
                        description: i.description,
                        date: i.date || new Date(),
                        type: (i.type as "gross" | "net") || "gross",
                        transferToPersonal: i.isTransferredToPersonal || false
                    })))

                    // Map Debts
                    setDebts(data.debts.map(d => ({
                        id: d.id,
                        name: d.name,
                        amount: parseFloat(d.amount) || 0,
                        dueDate: d.dueDate || new Date(),
                        transferredToPersonal: false,
                        category: (d.category as "business" | "personal") || "business",
                        creditorName: d.name,
                        status: (d.status === "paid" ? "paid" : "pending"),
                        type: (d.type as "payable" | "receivable") || "payable"
                    })))

                    // Map Settings
                    if (data.settings) {
                        setCompanyInfo({
                            myCompanyName: data.settings.myCompanyName || "",
                            myCompanyDesc: data.settings.myCompanyDesc || "",
                            partnerName: data.settings.partnerName || "",
                            partnerDesc: data.settings.partnerDesc || ""
                        })
                        setPageConfig({
                            showAssets: data.settings.showAssets ?? true,
                            showIncome: data.settings.showIncome ?? true,
                            showDebt: data.settings.showDebt ?? true,
                            showAI: data.settings.showAI ?? true,
                        })
                    }
                }
            } catch (e) {
                console.error("Failed to load business data", e)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    // ---- HANDLERS ----
    const handleSaveClient = async (client: Client) => {
        setClients(prev => {
            const exists = prev.find(c => c.id === client.id)
            if (exists) return prev.map(c => c.id === client.id ? client : c)
            return [...prev, client]
        })

        await saveClient({
            id: client.id,
            name: client.name,
            monthlyFee: client.tagihan.toString(),
            userId: "" // Handled by server
        })
    }

    const handleDeleteClient = async (id: string) => {
        setClients(prev => prev.filter(c => c.id !== id))
        await deleteClient(id)
    }

    const handleSaveAsset = async (asset: AssetItem) => {
        setAssets(prev => {
            const exists = prev.find(a => a.id === asset.id)
            if (exists) return prev.map(a => a.id === asset.id ? asset : a)
            return [...prev, asset]
        })
        await saveAsset({
            id: asset.id,
            name: asset.name,
            purchasePrice: asset.price.toString(),
            lifespanMonths: asset.lifespanMonths,
            monthlyMaintenanceCost: asset.monthlyMaintenance.toString(),
            purchaseDate: asset.purchaseDate,
            userId: ""
        })
    }

    const handleDeleteAsset = async (id: string) => {
        setAssets(prev => prev.filter(a => a.id !== id))
        await deleteAsset(id)
    }

    const handleSaveIncome = async (income: IncomeItem) => {
        setIncomes(prev => {
            const exists = prev.find(i => i.id === income.id)
            if (exists) return prev.map(i => i.id === income.id ? income : i)
            return [...prev, income]
        })
        await saveIncome({
            id: income.id,
            amount: income.amount.toString(),
            description: income.description,
            date: income.date,
            type: income.type,
            isTransferredToPersonal: income.transferToPersonal,
            userId: ""
        })
    }

    const handleDeleteIncome = async (id: string) => {
        setIncomes(prev => prev.filter(i => i.id !== id))
        await deleteIncome(id)
    }

    const handleSaveDebt = async (debt: DebtItem) => {
        setDebts(prev => {
            const exists = prev.find(d => d.id === debt.id)
            if (exists) return prev.map(d => d.id === debt.id ? debt : d)
            return [...prev, debt]
        })
        await saveDebt({
            id: debt.id,
            name: debt.creditorName,
            amount: debt.amount.toString(),
            dueDate: debt.dueDate,
            userId: ""
        })
    }

    const handleDeleteDebt = async (id: string) => {
        setDebts(prev => prev.filter(d => d.id !== id))
        await deleteDebt(id)
    }

    const handleSaveSettings = async (info: CompanyInfo) => {
        setCompanyInfo(info)
        await updateBusinessSettings({
            myCompanyName: info.myCompanyName,
            myCompanyDesc: info.myCompanyDesc,
            partnerName: info.partnerName,
            partnerDesc: info.partnerDesc,
            userId: ""
        })
    }

    const handleSaveConfig = async (config: BusinessPageConfig) => {
        setPageConfig(config)
        await updateBusinessSettings({
            showAssets: config.showAssets,
            showIncome: config.showIncome,
            showDebt: config.showDebt,
            showAI: config.showAI,
            userId: ""
        })
    }

    // ---- FILTERING LOGIC ----
    const targetDate = new Date()
    targetDate.setMonth(parseInt(selectedMonth))
    targetDate.setFullYear(parseInt(selectedYear))

    const filteredIncomes = incomes.filter(i => isSameMonth(i.date, targetDate))
    const filteredDebts = debts.filter(d => isSameMonth(d.dueDate, targetDate))

    // Revenue is typically MRR (Snapshot of active clients) + One-off Income (Filtered)
    // We will separate MRR and One-Off in the Profit/Loss view or sum them here?
    // Let's keep Clients as MRR.
    const totalMRR = clients.reduce((acc, c) => acc + c.tagihan, 0)
    const totalDPP = clients.reduce((acc, c) => acc + c.dpp, 0)
    const totalBHP = clients.reduce((acc, c) => acc + c.bhp, 0)

    // Add extra income to revenue? Typically separate. 
    // ProfitLossView currently takes "totalRevenue" which seems to implied Client Billings.
    // I should probably pass 'extraIncome' to ProfitLossView if it supports it, or just stick to MRR there and user sees "Income" separately.
    // Actually, user wants "Profit Analysis". This should include EVERYTHING.
    // However, ProfitLossView logic is very specific to the Shared Partnership model (40/60 split).
    // Usually only Client Revenue is split. Side income might be personal? 
    // Let's assumes ProfitLossView is for the MAIN ISP Business.
    // I will pass the filtered Extra Income as a separate prop if needed, or leave it for now.
    // For now, let's keep ProfitLossView focused on the ISP Core Business (Clients).

    // Asset Costs (Snapshot - Depreciation is monthly constant)
    const totalDepreciation = assets.reduce((acc, a) => acc + (a.price / a.lifespanMonths), 0)
    const totalMaintenance = assets.reduce((acc, a) => acc + a.monthlyMaintenance, 0)

    // Debt for this month
    const totalDebtPayment = filteredDebts.reduce((acc, d) => acc + d.amount, 0)

    // Profit Calculation Logic (For AI & Report)
    const revenue = totalMRR
    const ppn = revenue - totalDPP
    const distributableRevenue = revenue - (ppn + totalBHP)
    const grossProfit = distributableRevenue * 0.40
    const totalDeductions = totalDebtPayment + totalDepreciation + totalMaintenance
    const netProfit = grossProfit - totalDeductions
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0
    const assetsValue = assets.reduce((acc, a) => acc + a.price, 0)

    const profitLossProps = {
        totalRevenue: totalMRR,
        totalDPP,
        totalBHP,
        totalDebtPayment, // NOW DYNAMIC
        totalDepreciation,
        totalMaintenance
    }

    if (isLoading) {
        return <div className="flex h-[50vh] w-full items-center justify-center p-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
                <p>Memuat data bisnis...</p>
            </div>
        </div>
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20">
            <div className="container max-w-[1920px] mx-auto p-4 lg:p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            Dashboard Bisnis
                        </h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <Briefcase className="w-3 h-3" /> {companyInfo.myCompanyName}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border">
                        <div className="flex items-center gap-2 px-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Periode</span>
                        </div>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-slate-950 border-slate-200">
                                <SelectValue placeholder="Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                        {format(new Date(2024, i, 1), "MMMM", { locale: id })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[100px] h-9 bg-white dark:bg-slate-950 border-slate-200">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const y = new Date().getFullYear() - 2 + i
                                    return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                    <div className="sticky top-0 z-40 bg-slate-50/50 dark:bg-slate-950/20 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 lg:mx-0 lg:px-0">
                        <div className="flex items-center overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            <TabsList className="h-12 w-full lg:w-auto p-1 bg-white/80 dark:bg-slate-900/80 border shadow-sm rounded-xl gap-1">
                                <TabsTrigger value="clients" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200 border border-transparent rounded-lg px-4 h-10 transition-all gap-2">
                                    <Users className="w-4 h-4" />
                                    Pelanggan
                                </TabsTrigger>

                                {pageConfig.showIncome && (
                                    <TabsTrigger value="income" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200 border border-transparent rounded-lg px-4 h-10 transition-all gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Pemasukan
                                    </TabsTrigger>
                                )}

                                {pageConfig.showAssets && (
                                    <TabsTrigger value="assets" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 border border-transparent rounded-lg px-4 h-10 transition-all gap-2">
                                        <Wrench className="w-4 h-4" />
                                        Aset
                                    </TabsTrigger>
                                )}

                                {pageConfig.showDebt && (
                                    <TabsTrigger value="debt" className="data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 data-[state=active]:border-rose-200 border border-transparent rounded-lg px-4 h-10 transition-all gap-2">
                                        <Wallet className="w-4 h-4" />
                                        Hutang
                                    </TabsTrigger>
                                )}

                                <TabsTrigger value="profit-analysis" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 data-[state=active]:border-violet-200 border border-transparent rounded-lg px-4 h-10 transition-all gap-2">
                                    <Calculator className="w-4 h-4" />
                                    Laba/Rugi
                                </TabsTrigger>

                                {pageConfig.showAI && (
                                    <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-slate-900 border border-transparent rounded-lg px-4 h-10 transition-all gap-2">
                                        <Brain className="w-4 h-4" />
                                        AI Strategy
                                    </TabsTrigger>
                                )}

                                <TabsTrigger value="report" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 border border-transparent rounded-lg px-4 h-10 transition-all gap-2">
                                    <FileText className="w-4 h-4" />
                                    Laporan
                                </TabsTrigger>

                                <TabsTrigger value="business-info" className="data-[state=active]:bg-slate-100 border border-transparent rounded-lg px-4 h-10 transition-all gap-2">
                                    <Settings className="w-4 h-4" />
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="clients" className="space-y-4">
                        <ClientsView
                            clients={clients}
                            onSave={handleSaveClient}
                            onDelete={handleDeleteClient}
                        />
                    </TabsContent>

                    <TabsContent value="assets" className="space-y-4">
                        <DepreciationView
                            assets={assets}
                            onSave={handleSaveAsset}
                            onDelete={handleDeleteAsset}
                        />
                    </TabsContent>

                    <TabsContent value="income" className="space-y-4">
                        <IncomeView
                            incomes={filteredIncomes}
                            onSave={handleSaveIncome}
                            onDelete={handleDeleteIncome}
                        />
                    </TabsContent>

                    <TabsContent value="debt" className="space-y-4">
                        <DebtView
                            debts={filteredDebts}
                            onSave={handleSaveDebt}
                            onDelete={handleDeleteDebt}
                        />
                    </TabsContent>

                    <TabsContent value="profit-analysis" className="space-y-4">
                        <ProfitLossView {...profitLossProps} />
                    </TabsContent>

                    <TabsContent value="ai-analysis" className="space-y-4">
                        <BusinessAIAnalysisView
                            revenue={revenue}
                            netProfit={netProfit}
                            totalDebt={totalDebtPayment}
                            profitMargin={profitMargin}
                            assetsValue={assetsValue}
                        />
                    </TabsContent>

                    <TabsContent value="report" className="space-y-4">
                        <BusinessReportView
                            revenue={revenue}
                            netProfit={netProfit}
                            companyName={companyInfo.myCompanyName}
                            partnerName={companyInfo.partnerName}
                        />
                    </TabsContent>

                    <TabsContent value="business-info" className="space-y-4">
                        <BusinessSettingsView
                            info={companyInfo}
                            onSave={handleSaveSettings}
                        />
                        <BusinessPageSettingsView
                            config={pageConfig}
                            onSave={handleSaveConfig}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
