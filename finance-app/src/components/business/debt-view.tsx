"use client"

import * as React from "react"
import { Plus, Search, Filter, TrendingUp, TrendingDown, MoreHorizontal, AlertTriangle, Calendar, Building2, User, Trash2, BadgeDollarSign } from "lucide-react"
import { AddDebtDialog, DebtItem } from "./add-debt-dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"

// Helper
const toRp = (val: number) => "Rp " + Math.floor(val).toLocaleString("id-ID")

interface DebtViewProps {
    debts?: DebtItem[]
    setDebts?: React.Dispatch<React.SetStateAction<DebtItem[]>>
    onSave?: (debt: DebtItem) => void
    onDelete?: (id: string) => void
}

export function DebtView({ debts = [], setDebts, onSave, onDelete }: DebtViewProps) {
    const [searchTerm, setSearchTerm] = React.useState("")
    const [viewType, setViewType] = React.useState<"payable" | "receivable">("payable")

    const handleSaveDebt = (newItem: DebtItem) => {
        if (onSave) {
            onSave({ ...newItem, type: viewType })
        } else if (setDebts) {
            setDebts(prev => [...prev, newItem])
        }
        toast.success(viewType === "payable" ? "Hutang Dicatat" : "Kasbon Dicatat", {
            description: `${viewType === "payable" ? "Hutang" : "Kasbon"} sebesar ${toRp(newItem.amount)} telah disimpan.`
        })
    }

    const handleDelete = (id: string, name: string) => {
        if (onDelete) {
            onDelete(id)
        } else if (setDebts) {
            setDebts(prev => prev.filter(d => d.id !== id))
        }
        toast.success("Data Dihapus", {
            description: `Catatan ${name} telah dihapus.`
        })
    }

    const filteredDebts = debts.filter(d => {
        const matchesSearch = d.creditorName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = d.type === viewType;
        return matchesSearch && matchesType;
    })

    const totalDebt = debts.filter(d => d.type === "payable").reduce((acc, d) => acc + d.amount, 0)
    const totalReceivable = debts.filter(d => d.type === "receivable").reduce((acc, d) => acc + d.amount, 0)

    return (
        <div className="space-y-6">
            {/* View Type Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
                <Button 
                    variant={viewType === "payable" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewType("payable")}
                    className={cn("rounded-lg px-6", viewType === "payable" && "bg-red-600 hover:bg-red-700")}
                >
                    Hutang (Kewajiban)
                </Button>
                <Button 
                    variant={viewType === "receivable" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewType("receivable")}
                    className={cn("rounded-lg px-6", viewType === "receivable" && "bg-blue-600 hover:bg-blue-700")}
                >
                    Piutang (Kasbon Orang)
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Main Debt List */}
                <div className="md:col-span-2 lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={`Cari ${viewType === "payable" ? "Hutang" : "Kasbon"}...`}
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                                <Filter className="w-4 h-4" />
                                Filter
                            </Button>
                            <AddDebtDialog onSave={handleSaveDebt} defaultType={viewType}>
                                <Button className={cn("text-white gap-2 flex-1 sm:flex-none", viewType === "payable" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700")}>
                                    <Plus className="w-4 h-4" />
                                    {viewType === "payable" ? "Catat Hutang" : "Catat Kasbon"}
                                </Button>
                            </AddDebtDialog>
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                                {viewType === "payable" ? "Daftar Hutang Bisnis" : "Daftar Piutang / Kasbon Pelanggan"}
                            </CardTitle>
                            <CardDescription>
                                {viewType === "payable" 
                                    ? "Kelola semua hutang bisnis Anda kepada pihak lain." 
                                    : "Catat dan kelola uang yang harus dibayar orang lain kepada Anda (Order Kuota, Voucher, dll)."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{viewType === "payable" ? "Kreditur" : "Nama Pelanggan"}</TableHead>
                                        <TableHead className="hidden md:table-cell">Jatuh Tempo</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-right">Jumlah</TableHead>
                                        <TableHead className="w-[50px] text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDebts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                Belum ada catatan {viewType === "payable" ? "hutang" : "kasbon"}.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredDebts.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{item.creditorName}</span>
                                                        <span className="md:hidden text-xs text-muted-foreground">
                                                            {format(item.dueDate, "dd MMM yyyy", { locale: id })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                                    {format(item.dueDate, "dd MMM yyyy", { locale: id })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={cn(
                                                        "gap-1",
                                                        viewType === "receivable" ? "bg-emerald-50 text-emerald-700" : (item.category === "business" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700")
                                                    )}>
                                                        {viewType === "receivable" ? <BadgeDollarSign className="w-3 h-3" /> : (item.category === "business" ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />)}
                                                        {viewType === "receivable" ? "Piutang" : (item.category === "business" ? "Bisnis" : "Pribadi")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className={cn("font-bold", viewType === "receivable" ? "text-blue-600" : "text-red-600")}>
                                                        {toRp(item.amount)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-100 h-8 w-8"
                                                        onClick={() => handleDelete(item.id, item.creditorName)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Summary & Alerts */}
                <div className="md:col-span-2 lg:col-span-1 space-y-6">
                    <Card className={cn(viewType === "receivable" && "border-blue-100 bg-blue-50/10")}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {viewType === "payable" ? "Total Hutang Aktif" : "Total Piutang (Kasbon)"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold", viewType === "payable" ? "text-red-600" : "text-blue-600")}>
                                {toRp(viewType === "payable" ? totalDebt : totalReceivable)}
                            </div>
                            <div className={cn("flex items-center text-xs mt-1 font-medium", viewType === "payable" ? "text-red-500" : "text-blue-500")}>
                                {viewType === "payable" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {viewType === "payable" ? "Kewajiban berjalan" : "Aset tertunda"}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <Card className={cn(viewType === "payable" ? "bg-red-50/50 border-red-100" : "bg-blue-50/50 border-blue-100")}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium flex items-center gap-2", viewType === "payable" ? "text-red-600" : "text-blue-600")}>
                                    <AlertTriangle className="w-4 h-4" />
                                    Tips Bisnis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {viewType === "payable" 
                                        ? "Pastikan saldo operasional cukup untuk membayar hutang jatuh tempo."
                                        : "Ingatkan pelanggan secara sopan sebelum jatuh tempo untuk menjaga arus kas tetap sehat."}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
