"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Save,
    History,
    Trash2,
    FileText,
    Calendar as CalendarIcon,
    AlertCircle,
    Building2,
    User,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Zap,
    Download,
    Printer,
    Filter,
    BarChart3,
    Info,
    Edit2,
    Plus,
    PieChart as PieChartIcon,
    Target
} from "lucide-react"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend
} from "recharts"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

import {
    saveBusinessExpense,
    getBusinessExpenses,
    deleteBusinessExpense,
    processMonthlyAccumulation,
    getBusinessData,
    deleteIncome
} from "@/actions/business"
import { getCustomerFinancialStats } from "@/actions/business-customer"

// Generate month options for the last 12 months
const generateMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
        const date = subMonths(now, i)
        options.push({
            value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: format(date, "MMMM yyyy", { locale: id })
        })
    }
    return options
}

export default function AkumulasiPage() {
    // ---- Data State ----
    const [stats, setStats] = React.useState({
        totalTagihan: 0,
        dpp: 0,
        ppn: 0,
        bhp: 0
    })
    const [expenses, setExpenses] = React.useState<any[]>([])
    const [accumulations, setAccumulations] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    // ---- Filter State ----
    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = React.useState(
        `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    )
    const monthOptions = generateMonthOptions()

    // ---- Wizard State ----
    const [step, setStep] = React.useState(1) // 1: Verify Deduction, 2: Review Profit, 3: Distribution

    // ---- Expense Form State ----
    const [isSubmittingExpense, setIsSubmittingExpense] = React.useState(false)
    const [expenseForm, setExpenseForm] = React.useState({
        amount: "",
        invoiceNo: "",
        description: "",
        category: "bandwidth", // bandwidth, maintenance, salary, operational, other
        date: new Date().toISOString().split('T')[0]
    })

    // ---- Allocation State ----
    const [salaryMode, setSalaryMode] = React.useState<"manual" | "auto">("manual")
    const [autoSalaryPercent, setAutoSalaryPercent] = React.useState("30") // Default 30%
    const [allocation, setAllocation] = React.useState({
        personalAmount: "",
        createPersonalTx: true,
        personalAccountName: "BRI",
        notes: "", // NEW: Notes for this accumulation
        isProcessing: false
    })

    // ---- Confirmation Dialog State ----
    const [confirmDialog, setConfirmDialog] = React.useState({
        open: false,
        title: "",
        description: "",
        onConfirm: () => { }
    })

    // ---- Fetch Data ----
    const loadData = async () => {
        try {
            const [statsData, businessData] = await Promise.all([
                getCustomerFinancialStats(),
                getBusinessData()
            ])
            if (statsData) setStats(statsData)
            if (businessData) {
                setExpenses(businessData.expenses)
                setAccumulations(businessData.incomes.filter((i: any) => i.type === 'net'))
            }
        } catch (error) {
            console.error("Failed to load data", error)
            toast.error("Gagal memuat data")
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        loadData()
    }, [])

    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(val)

    // ---- Calculations ----
    const [year, month] = selectedMonth.split('-').map(Number)
    const selectedDate = new Date(year, month - 1)

    // Filter expenses by selected month
    const monthlyExpenses = expenses.filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === (month - 1) && d.getFullYear() === year
    })

    // Group expenses by category
    const expensesByCategory = monthlyExpenses.reduce((acc, e) => {
        const cat = e.category || 'operational'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(e)
        return acc
    }, {} as Record<string, any[]>)

    const categoryTotals = Object.entries(expensesByCategory).map(([category, items]) => ({
        category,
        total: (items as any[]).reduce((sum, item) => sum + Number(item.amount), 0),
        count: (items as any[]).length
    }))

    const totalExpenseAmount = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const netProfit = stats.totalTagihan - totalExpenseAmount

    // Previous month comparison
    const prevMonthDate = subMonths(selectedDate, 1)
    const prevMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear()
    })
    const prevMonthTotal = prevMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const expenseChange = totalExpenseAmount - prevMonthTotal
    const expenseChangePercent = prevMonthTotal > 0 ? ((expenseChange / prevMonthTotal) * 100) : 0

    // Calculate personal amount based on mode
    const personalAmt = React.useMemo(() => {
        if (salaryMode === "auto") {
            const percent = parseFloat(autoSalaryPercent) || 0
            return (netProfit * percent) / 100
        }
        return parseFloat(allocation.personalAmount) || 0
    }, [salaryMode, autoSalaryPercent, netProfit, allocation.personalAmount])

    const businessRetained = netProfit - personalAmt

    // Category labels
    const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
        bandwidth: { label: "Bandwidth/Internet", icon: "🌐", color: "blue" },
        maintenance: { label: "Pemeliharaan", icon: "🔧", color: "amber" },
        salary: { label: "Gaji Karyawan", icon: "👥", color: "green" },
        operational: { label: "Operasional", icon: "📦", color: "slate" },
        other: { label: "Lainnya", icon: "📌", color: "purple" }
    }

    const CHART_COLORS: Record<string, string> = {
        bandwidth: "#3b82f6",
        maintenance: "#f59e0b",
        salary: "#22c55e",
        operational: "#64748b",
        other: "#a855f7"
    }

    const pieChartData = categoryTotals.map(ct => ({
        name: categoryLabels[ct.category]?.label || ct.category,
        value: ct.total,
        color: CHART_COLORS[ct.category] || CHART_COLORS.other
    }))

    // ---- Handlers ----

    const handleExpenseSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!expenseForm.amount || !expenseForm.description) {
            toast.error("Mohon lengkapi data wajib")
            return
        }

        setIsSubmittingExpense(true)
        try {
            await saveBusinessExpense({
                amount: parseFloat(expenseForm.amount),
                description: expenseForm.description,
                invoiceNo: expenseForm.invoiceNo || undefined,
                date: expenseForm.date,
                category: expenseForm.category
            })
            toast.success("Tagihan berhasil disimpan")
            setExpenseForm({
                amount: "",
                invoiceNo: "",
                description: "",
                category: "bandwidth",
                date: new Date().toISOString().split('T')[0]
            })
            loadData()
        } catch (error) {
            toast.error("Gagal menyimpan data")
        } finally {
            setIsSubmittingExpense(false)
        }
    }

    const handleDeleteExpense = async (id: string) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Tagihan?",
            description: "Data tagihan ini akan dihapus permanen. Lanjutkan?",
            onConfirm: async () => {
                try {
                    await deleteBusinessExpense(id)
                    toast.success("Data dihapus")
                    loadData()
                } catch (error) {
                    toast.error("Gagal menghapus")
                }
            }
        })
    }

    const handleAccumulationSubmit = async () => {
        // Validation for allocation exceeding available funds
        if (businessRetained < 0 && personalAmt > 0) {
            setConfirmDialog({
                open: true,
                title: "⚠️ Peringatan Defisit",
                description: `Gaji yang Anda ambil (${formatCurrency(personalAmt)}) melebihi profit yang tersedia.\n\nBisnis akan mengalami defisit sebesar ${formatCurrency(Math.abs(businessRetained))}.\n\nLanjutkan?`,
                onConfirm: () => proceedWithSave()
            })
            return
        }

        // Build detailed breakdown
        const monthName = format(selectedDate, "MMMM yyyy", { locale: id })
        const salaryMethod = salaryMode === "auto"
            ? `${autoSalaryPercent}% dari profit (otomatis)`
            : "Input manual"

        // Build category breakdown
        const categoryBreakdown = categoryTotals.map(ct => {
            const catInfo = categoryLabels[ct.category] || categoryLabels.other
            return `${catInfo.icon} ${catInfo.label}: ${formatCurrency(ct.total)} (${ct.count} item)`
        }).join('\n')

        const breakdown = netProfit >= 0
            ? `📊 LAPORAN AKUMULASI - ${monthName.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 PENDAPATAN & PENGELUARAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pendapatan Kotor (Gross):  ${formatCurrency(stats.totalTagihan)}

Tagihan Pusat Detail:
${categoryBreakdown}
                           ─────────────────────
Total Tagihan:             ${formatCurrency(totalExpenseAmount)}
                           ─────────────────────
Profit Bersih:             ${formatCurrency(netProfit)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 DISTRIBUSI PROFIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gaji Owner (${salaryMethod}):
                           ${formatCurrency(personalAmt)}

Sisa Kas Bisnis:           ${formatCurrency(businessRetained)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allocation.createPersonalTx ? `✅ Akan dicatat di Keuangan Pribadi (${allocation.personalAccountName})` : '⚠️ Tidak dicatat di Keuangan Pribadi'}
${allocation.notes ? `\n📝 Catatan: ${allocation.notes}` : ''}

Lanjutkan penyimpanan?`
            : `📊 LAPORAN KERUGIAN - ${monthName.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pendapatan Kotor:          ${formatCurrency(stats.totalTagihan)}

Tagihan Pusat Detail:
${categoryBreakdown}
                           ─────────────────────
Total Tagihan:             ${formatCurrency(totalExpenseAmount)}
                           ─────────────────────
Rugi Bersih:               ${formatCurrency(Math.abs(netProfit))}

Bisnis mengalami kerugian bulan ini.
Data akan dicatat untuk laporan keuangan.
${allocation.notes ? `\n📝 Catatan: ${allocation.notes}` : ''}

Lanjutkan?`;

        setConfirmDialog({
            open: true,
            title: netProfit >= 0 ? "💾 Simpan Laporan Akumulasi?" : "📉 Simpan Laporan Kerugian?",
            description: breakdown,
            onConfirm: () => proceedWithSave()
        })
    }

    const proceedWithSave = async () => {
        setAllocation(prev => ({ ...prev, isProcessing: true }));
        try {
            await processMonthlyAccumulation({
                date: selectedDate,
                netProfit: netProfit,
                personalAllocation: personalAmt,
                businessRetained: businessRetained,
                createPersonalTx: allocation.createPersonalTx,
                personalAccountName: allocation.personalAccountName
            });

            const successMessage = netProfit >= 0
                ? "Laporan Akumulasi Tersimpan!"
                : "Laporan Kerugian Tersimpan!";
            toast.success(successMessage);

            setStep(1); // Reset to beginning
            setAllocation(prev => ({ ...prev, personalAmount: "", notes: "" })); // Reset input
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Gagal menyimpan akumulasi");
        } finally {
            setAllocation(prev => ({ ...prev, isProcessing: false }));
        }
    }

    const handleExport = () => {
        const monthName = format(selectedDate, "MMMM_yyyy", { locale: id })
        const content = `LAPORAN AKUMULASI BISNIS
${format(selectedDate, "MMMM yyyy", { locale: id }).toUpperCase()}

PENDAPATAN:
Pendapatan Kotor: ${formatCurrency(stats.totalTagihan)}

PENGELUARAN:
${categoryTotals.map(ct => {
            const catInfo = categoryLabels[ct.category] || categoryLabels.other
            return `${catInfo.label}: ${formatCurrency(ct.total)}`
        }).join('\n')}
Total Pengeluaran: ${formatCurrency(totalExpenseAmount)}

PROFIT BERSIH: ${formatCurrency(netProfit)}
`
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Laporan_Akumulasi_${monthName}.txt`
        a.click()
        toast.success("Laporan berhasil diexport")
    }

    const handlePrint = () => {
        window.print()
        toast.success("Membuka dialog print...")
    }

    // ---- Render Steps ----

    // STEP 1: Verify Deduction (Expenses)
    const renderStep1 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Verifikasi Pengeluaran</h2>
                    <p className="text-muted-foreground">
                        Review dan catat pengeluaran operasional bulan ini untuk mendapatkan perhitungan profit yang akurat.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-1.5 rounded-lg border shadow-sm">
                    <div className="bg-slate-100 dark:bg-zinc-800 p-2 rounded-md">
                        <CalendarIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[180px] border-none shadow-none h-9 font-medium bg-transparent focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {monthOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FileText className="w-24 h-24" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-blue-100 font-medium text-sm">Total Transaksi</p>
                        <h3 className="text-4xl font-bold mt-2">{monthlyExpenses.length}</h3>
                        <p className="text-blue-100/80 text-xs mt-4 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Transaksi tercatat bulan ini
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingDown className="w-24 h-24 transform rotate-12" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <p className="text-rose-100 font-medium text-sm">Total Pengeluaran</p>
                        <h3 className="text-3xl font-bold mt-2">{formatCurrency(totalExpenseAmount)}</h3>
                        {prevMonthTotal > 0 && (
                            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                                {expenseChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {Math.abs(expenseChangePercent).toFixed(1)}% vs bulan lalu
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Kategori Aktif</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{categoryTotals.length}</h3>
                            </div>
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            {categoryTotals.slice(0, 3).map(ct => (
                                <div key={ct.category} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[ct.category] || CHART_COLORS.other }}></span>
                                        {categoryLabels[ct.category]?.label}
                                    </span>
                                    <span className="font-medium">{formatCurrency(ct.total)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Visual Breakdown & Add Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Pie Chart Card */}
                    {categoryTotals.length > 0 && (
                        <Card className="shadow-md border-slate-200 dark:border-zinc-800 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-zinc-800/50 pb-4 border-b">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <PieChartIcon className="w-4 h-4 text-slate-500" />
                                    Komposisi Pengeluaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 flex justify-center bg-white dark:bg-zinc-900">
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="transparent" />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Add Expense Form - Compact */}
                    <Card className="shadow-lg border-indigo-100 dark:border-indigo-900 overflow-hidden">
                        <div className="bg-indigo-600 p-4 text-white">
                            <div className="flex items-center gap-2 font-semibold">
                                <Plus className="w-5 h-5" /> Input Tagihan Baru
                            </div>
                            <p className="text-indigo-100 text-xs mt-1">Tambahkan pengeluaran operasional di sini</p>
                        </div>
                        <CardContent className="p-5 space-y-4 bg-white dark:bg-zinc-900">
                            <form onSubmit={handleExpenseSubmit} className="space-y-4">
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-500">Kategori</Label>
                                        <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}>
                                            <SelectTrigger className="h-9 bg-slate-50 border-slate-200 focus:ring-indigo-500">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(categoryLabels).map(([key, val]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{val.icon}</span>
                                                            <span>{val.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-500">Nominal (Rp)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                                            <Input
                                                type="number"
                                                className="pl-8 h-9 font-medium bg-slate-50 border-slate-200 focus:ring-indigo-500"
                                                placeholder="0"
                                                value={expenseForm.amount}
                                                onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-500">Keterangan</Label>
                                        <Input
                                            className="h-9 bg-slate-50 border-slate-200 focus:ring-indigo-500"
                                            placeholder="Contoh: Bayar Listrik"
                                            value={expenseForm.description}
                                            onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-500">Tanggal</Label>
                                            <Input
                                                type="date"
                                                className="h-9 text-xs bg-slate-50 border-slate-200 focus:ring-indigo-500"
                                                value={expenseForm.date}
                                                onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-500">No. Invoice</Label>
                                            <Input
                                                className="h-9 text-xs bg-slate-50 border-slate-200 focus:ring-indigo-500"
                                                placeholder="Opsional"
                                                value={expenseForm.invoiceNo}
                                                onChange={e => setExpenseForm({ ...expenseForm, invoiceNo: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:translate-y-[-1px]"
                                    disabled={isSubmittingExpense}
                                >
                                    {isSubmittingExpense ? "Menyimpan..." : "Tambah Transaksi"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: List & Detailed Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border-slate-200 dark:border-zinc-800 h-full flex flex-col overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-800/50 flex flex-row items-center justify-between pb-4 border-b">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <History className="w-5 h-5 text-indigo-500" />
                                    Daftar Tagihan
                                </CardTitle>
                                <CardDescription>Detail semua pengeluaran bulan ini</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleExport} className="h-8 bg-white hover:bg-slate-50 border-slate-200">
                                    <Download className="w-3.5 h-3.5 mr-2" /> Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 bg-white dark:bg-zinc-900">
                            <div className="max-h-[600px] overflow-auto custom-scrollbar">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-slate-50 dark:bg-zinc-800 z-10 shadow-sm">
                                        <TableRow>
                                            <TableHead className="w-[120px] font-semibold">Tanggal</TableHead>
                                            <TableHead className="font-semibold">Kategori</TableHead>
                                            <TableHead className="font-semibold">Keterangan</TableHead>
                                            <TableHead className="text-right font-semibold">Nominal</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monthlyExpenses.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="p-4 bg-slate-100 rounded-full">
                                                            <FileText className="w-8 h-8 opacity-40" />
                                                        </div>
                                                        <p>Belum ada data tagihan bulan ini.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            monthlyExpenses.map((e) => {
                                                const catInfo = categoryLabels[e.category] || categoryLabels.other
                                                return (
                                                    <TableRow key={e.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                                        <TableCell className="font-medium text-xs text-muted-foreground">
                                                            {format(new Date(e.date), "dd MMM yyyy", { locale: id })}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className={cn("font-medium text-[10px] px-2 py-0.5 border shadow-sm",
                                                                e.category === 'bandwidth' && "bg-blue-50/80 text-blue-700 border-blue-100",
                                                                e.category === 'maintenance' && "bg-amber-50/80 text-amber-700 border-amber-100",
                                                                e.category === 'salary' && "bg-green-50/80 text-green-700 border-green-100",
                                                                e.category === 'operational' && "bg-slate-50/80 text-slate-700 border-slate-100",
                                                                e.category === 'other' && "bg-purple-50/80 text-purple-700 border-purple-100",
                                                            )}>
                                                                <span className="mr-1">{catInfo.icon}</span> {catInfo.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                                                            {e.description}
                                                            {e.invoiceNo && <span className="ml-2 text-[10px] bg-slate-100 border px-1.5 py-0.5 rounded text-slate-500 font-mono">{e.invoiceNo}</span>}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-slate-700 dark:text-slate-300">
                                                            {formatCurrency(Number(e.amount))}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-300 opacity-60 group-hover:opacity-100 transition-all hover:text-red-600 hover:bg-red-50 rounded-full"
                                                                onClick={() => handleDeleteExpense(e.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/80 dark:bg-zinc-800/80 border-t p-4 flex justify-between items-center backdrop-blur-sm">
                            <div className="text-xs text-slate-500 font-medium">
                                {monthlyExpenses.length} transaksi terdaftar
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500">Total Pengeluaran:</span>
                                <span className="text-xl font-bold text-rose-600 font-mono tracking-tight">
                                    {formatCurrency(totalExpenseAmount)}
                                </span>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <Button
                    size="lg"
                    className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-6 h-auto shadow-xl shadow-slate-900/10 transition-all hover:translate-x-1"
                    onClick={() => setStep(2)}
                >
                    <div className="flex flex-col items-start text-left">
                        <span className="text-xs font-normal opacity-80">Langkah Berikutnya</span>
                        <span className="text-sm font-bold flex items-center gap-2">Analisa Profit & Laba Rugi <ArrowRight className="w-4 h-4" /></span>
                    </div>
                </Button>
            </div>
        </div>
    )

    // STEP 2: Review Profit Assessment
    const renderStep2 = () => {
        const profitData = [
            { name: "Pemasukan", value: stats.totalTagihan, fill: "#3b82f6" },
            { name: "Pengeluaran", value: totalExpenseAmount, fill: "#f43f5e" },
            { name: "Profit Bersih", value: netProfit > 0 ? netProfit : 0, fill: "#10b981" }
        ]

        return (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 mb-4">
                        <BarChart3 className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Analisa Profitabilitas</h2>
                    <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                        Cek kembali perhitungan pendapatan bersih anda untuk periode {format(selectedDate, "MMMM yyyy", { locale: id })}.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {/* Left: Summary Visuals */}
                    <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 flex flex-col justify-center overflow-hidden relative min-h-[400px]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                        <CardContent className="p-8 h-full flex flex-col">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-500" />
                                Perbandingan Arus Kas
                            </h3>
                            <div className="flex-1 min-h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={profitData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <RechartsTooltip
                                            cursor={{ fill: 'transparent' }}
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                                            {profitData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Detailed Breakdown */}
                    <div className="space-y-4 flex flex-col justify-center">
                        {/* Income */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Pendapatan Kotor</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalTagihan)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Expense */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-slate-100 dark:border-zinc-800 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                                    <TrendingDown className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">Total Pengeluaran</p>
                                    <p className="text-xl font-bold text-rose-600">- {formatCurrency(totalExpenseAmount)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Result Card */}
                        <div className={cn(
                            "p-8 rounded-xl shadow-xl transform transition-all hover:scale-[1.02] relative overflow-hidden",
                            netProfit >= 0
                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                                : "bg-gradient-to-br from-rose-500 to-red-600 text-white"
                        )}>
                            <div className="relative z-10 text-center">
                                <p className="text-sm font-medium uppercase tracking-widest opacity-90 mb-1">
                                    {netProfit >= 0 ? "Keuntungan Bersih (Net Profit)" : "Kerugian (Loss)"}
                                </p>
                                <h3 className="text-5xl font-extrabold tracking-tight my-4">
                                    {formatCurrency(Math.abs(netProfit))}
                                </h3>

                                {netProfit >= 0 ? (
                                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
                                        <CheckCircle2 className="w-4 h-4" /> Siap didistribusikan
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full text-sm backdrop-blur-sm">
                                        <AlertCircle className="w-4 h-4" /> Perlu evaluasi pengeluaran
                                    </div>
                                )}
                            </div>

                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-10 rotate-12">
                                <Wallet className="w-64 h-64" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-12 items-center border-t mt-8">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(1)}
                        className="text-slate-500 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Verifikasi
                    </Button>
                    <Button
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 h-auto shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                        onClick={() => setStep(3)}
                    >
                        <div className="flex flex-col items-start text-left">
                            <span className="text-xs font-normal opacity-80">Langkah Terakhir</span>
                            <span className="text-sm font-bold flex items-center gap-2">Distribusi Dana <ArrowRight className="w-4 h-4" /></span>
                        </div>
                    </Button>
                </div>
            </div>
        )
    }

    // STEP 3: Distribution
    const renderStep3 = () => {
        const distributionData = [
            { name: "Gaji Owner", value: personalAmt, color: "#a855f7" },
            { name: "Kas Bisnis", value: businessRetained, color: "#3b82f6" }
        ]

        return (
            <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-4">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Distribusi Profit</h2>
                    <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                        Tentukan alokasi dana profit bersih ke dompet pribadi dan kas bisnis.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Allocation Controls */}
                    <div className="space-y-6">
                        <Card className="shadow-lg border-indigo-100 dark:border-indigo-900 h-full">
                            <CardHeader className="bg-slate-50 dark:bg-zinc-800/50 pb-4">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-500" />
                                    Pengaturan Alokasi Owner
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                <RadioGroup value={salaryMode} onValueChange={(v: "manual" | "auto") => setSalaryMode(v)} className="grid grid-cols-2 gap-4">
                                    <div className={cn(
                                        "cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-zinc-800",
                                        salaryMode === 'manual' ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-zinc-700"
                                    )}>
                                        <RadioGroupItem value="manual" id="manual" className="sr-only" />
                                        <Label htmlFor="manual" className="cursor-pointer">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                                                <Edit2 className="w-4 h-4" /> Manual
                                            </div>
                                            <p className="text-xs text-slate-500">Input nominal bebas</p>
                                        </Label>
                                    </div>
                                    <div className={cn(
                                        "cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-zinc-800",
                                        salaryMode === 'auto' ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-zinc-700"
                                    )}>
                                        <RadioGroupItem value="auto" id="auto" className="sr-only" />
                                        <Label htmlFor="auto" className="cursor-pointer">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                                                <Zap className="w-4 h-4" /> Otomatis
                                            </div>
                                            <p className="text-xs text-slate-500">Persentase dari profit</p>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {salaryMode === 'auto' && (
                                    <div className="space-y-6 bg-slate-50 dark:bg-zinc-900 p-6 rounded-xl border border-slate-100 dark:border-zinc-800">
                                        <div className="flex justify-between items-center">
                                            <Label className="font-medium text-slate-700 dark:text-slate-300">Persentase Gaji</Label>
                                            <span className="text-2xl font-bold text-indigo-600">{autoSalaryPercent}%</span>
                                        </div>
                                        <Slider
                                            value={[Number(autoSalaryPercent)]}
                                            onValueChange={(val) => setAutoSalaryPercent(val[0].toString())}
                                            max={100}
                                            step={5}
                                            className="py-4"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>0% (Full Bisnis)</span>
                                            <span>50% (Bagi Rata)</span>
                                            <span>100% (Ambil Semua)</span>
                                        </div>
                                    </div>
                                )}

                                {salaryMode === 'manual' && (
                                    <div className="space-y-3">
                                        <Label className="font-medium text-slate-700 dark:text-slate-300">Nominal Gaji (Rp)</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-slate-400 font-bold">Rp</span>
                                            <Input
                                                type="number"
                                                className="pl-12 h-12 text-lg font-medium"
                                                placeholder="0"
                                                value={allocation.personalAmount}
                                                onChange={e => setAllocation({ ...allocation, personalAmount: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground text-right">
                                            Maksimal tersedia: {formatCurrency(netProfit)}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                            <Checkbox
                                                id="createTx"
                                                className="mt-1 data-[state=checked]:bg-indigo-600"
                                                checked={allocation.createPersonalTx}
                                                onCheckedChange={(c) => setAllocation(prev => ({ ...prev, createPersonalTx: !!c }))}
                                            />
                                            <div className="space-y-1">
                                                <Label htmlFor="createTx" className="font-medium cursor-pointer text-indigo-900 dark:text-indigo-200">
                                                    Catat ke Keuangan Pribadi
                                                </Label>
                                                <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70">
                                                    Otomatis buat transaksi 'Pemasukan' di data pribadi.
                                                </p>
                                            </div>
                                        </div>

                                        {allocation.createPersonalTx && (
                                            <div className="ml-8">
                                                <Label className="text-xs mb-1.5 block font-medium text-slate-500">Rekening Tujuan:</Label>
                                                <Input
                                                    placeholder="Nama Akun (cth. BRI / BCA)"
                                                    className="h-9 text-sm"
                                                    value={allocation.personalAccountName}
                                                    onChange={e => setAllocation(prev => ({ ...prev, personalAccountName: e.target.value }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Visualization & Confirmation */}
                    <div className="space-y-6">
                        <Card className="shadow-lg border-emerald-100 dark:border-emerald-900 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                <PieChartIcon className="w-32 h-32" />
                            </div>
                            <CardContent className="p-8">
                                <h3 className="text-lg font-semibold mb-6 text-center">Estimasi Hasil Distribusi</h3>

                                <div className="h-[200px] w-full mb-8 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={distributionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {distributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Total Profit</span>
                                        <span className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(netProfit)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">Diterima Owner</p>
                                                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatCurrency(personalAmt)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">Ditahan Kas Bisnis</p>
                                                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(businessRetained)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Edit2 className="w-3.5 h-3.5" />
                                Catatan Laporan
                            </Label>
                            <Textarea
                                placeholder="Tambahkan catatan untuk laporan ini..."
                                className="min-h-[80px] bg-white dark:bg-zinc-900"
                                value={allocation.notes}
                                onChange={e => setAllocation(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-10 items-center border-t mt-8">
                    <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        disabled={allocation.isProcessing}
                        className="h-12 px-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 h-12 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                        onClick={handleAccumulationSubmit}
                        disabled={allocation.isProcessing}
                    >
                        {allocation.isProcessing ? "Menyimpan Laporan..." : (
                            <span className="flex items-center gap-2 font-bold text-base">
                                <Save className="w-5 h-5" /> Simpan & Selesai
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        )
    }

    // Helper icon
    const ArrowDownIcon = ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
    )

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-10 pb-32">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300">
                        Akumulasi Bisnis
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Pusat kendali keuangan dan distribusi profit bulanan.
                    </p>
                </div>
            </div>

            {/* Enhanced Stepper */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-zinc-800 -z-10 rounded-full"></div>
                <div className="flex justify-between max-w-3xl mx-auto relative">
                    {/* Step 1 Indicator */}
                    <button
                        onClick={() => step > 1 && setStep(1)}
                        disabled={step < 1}
                        className={cn("flex flex-col items-center gap-2 group transition-all", step === 1 ? "scale-110" : "scale-100 opacity-60")}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors z-10 bg-white dark:bg-zinc-950",
                            step >= 1 ? "border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-500/20" : "border-slate-200 text-slate-300 dark:border-zinc-700"
                        )}>
                            <FileText className="w-4 h-4" />
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-wider", step >= 1 ? "text-indigo-600" : "text-slate-400")}>
                            Verifikasi
                        </span>
                    </button>

                    {/* Step 2 Indicator */}
                    <button
                        onClick={() => step > 2 && setStep(2)}
                        disabled={step < 2}
                        className={cn("flex flex-col items-center gap-2 group transition-all", step === 2 ? "scale-110" : "scale-100 opacity-60")}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors z-10 bg-white dark:bg-zinc-950",
                            step >= 2 ? "border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-500/20" : "border-slate-200 text-slate-300 dark:border-zinc-700"
                        )}>
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-wider", step >= 2 ? "text-indigo-600" : "text-slate-400")}>
                            Analisa
                        </span>
                    </button>

                    {/* Step 3 Indicator */}
                    <button
                        disabled
                        className={cn("flex flex-col items-center gap-2 group transition-all", step === 3 ? "scale-110" : "scale-100 opacity-60")}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors z-10 bg-white dark:bg-zinc-950",
                            step >= 3 ? "border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-500/20" : "border-slate-200 text-slate-300 dark:border-zinc-700"
                        )}>
                            <Wallet className="w-4 h-4" />
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-wider", step >= 3 ? "text-indigo-600" : "text-slate-400")}>
                            Distribusi
                        </span>
                    </button>
                </div>

                {/* Connecting Lines (Active) */}
                <div className="absolute top-1/2 left-0 w-full h-1 -z-10 rounded-full overflow-hidden max-w-3xl mx-auto right-0">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-500 ease-in-out"
                        style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                    ></div>
                </div>
            </div>

            <div className="mt-12 min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <Separator className="my-12" />

            <div className="opacity-80 hover:opacity-100 transition-opacity">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" /> Arsip Laporan Akumulasi
                </h3>
                <Card className="border shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right">Nominal</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accumulations.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{format(new Date(item.date), "dd MMM yyyy", { locale: id })}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right font-medium text-emerald-600">
                                            {formatCurrency(Number(item.amount))}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setConfirmDialog({
                                                        open: true,
                                                        title: "Hapus Arsip?",
                                                        description: "Data laporan ini akan dihapus permanen. Lanjutkan?",
                                                        onConfirm: async () => {
                                                            await deleteIncome(item.id);
                                                            loadData();
                                                            toast.success("Arsip dihapus");
                                                        }
                                                    })
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {accumulations.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-16 text-center text-muted-foreground text-sm">
                                            Belum ada arsip laporan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Custom Confirmation Dialog */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription className="whitespace-pre-line font-mono text-xs">
                            {confirmDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                confirmDialog.onConfirm();
                                setConfirmDialog(prev => ({ ...prev, open: false }));
                            }}
                        >
                            Lanjutkan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
