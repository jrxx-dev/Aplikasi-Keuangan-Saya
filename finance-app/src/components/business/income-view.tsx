"use client"

import * as React from "react"
import { Plus, Search, Filter, TrendingUp, Wallet, Lightbulb, Trash2 } from "lucide-react"
import { AddIncomeDialog, IncomeItem } from "@/components/business/add-income-dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface IncomeViewProps {
    incomes?: IncomeItem[]
    setIncomes?: React.Dispatch<React.SetStateAction<IncomeItem[]>>
    onSave?: (income: IncomeItem) => void
    onDelete?: (id: string) => void
}

export function IncomeView({ incomes = [], setIncomes, onSave, onDelete }: IncomeViewProps) {
    const [searchTerm, setSearchTerm] = React.useState("")

    const handleSaveIncome = (newItem: IncomeItem) => {
        if (onSave) {
            onSave(newItem)
        } else if (setIncomes) {
            setIncomes(prev => [...prev, newItem])
        }
        toast.success("Pemasukan Ditambahkan", {
            description: `Rp ${newItem.amount.toLocaleString("id-ID")} dari ${newItem.description} telah dicatat.`
        })
    }

    const handleDelete = (id: string, desc: string) => {
        if (onDelete) {
            onDelete(id)
        } else if (setIncomes) {
            setIncomes(prev => prev.filter(i => i.id !== id))
        }
        toast.success("Pemasukan Dihapus", {
            description: `${desc} telah dihapus dari catatan.`
        })
    }

    // Filtered Data
    const filteredIncomes = incomes.filter(i =>
        i.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Derived Stats
    const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0)
    const netIncome = incomes.filter(i => i.type === "net").reduce((acc, i) => acc + i.amount, 0)
    const transferCount = incomes.filter(i => i.transferToPersonal).length
    const transferAmount = incomes.filter(i => i.transferToPersonal).reduce((acc, i) => acc + i.amount, 0)

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Main Income List */}
            <div className="md:col-span-2 lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari pemasukan..."
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
                        <AddIncomeDialog onSave={handleSaveIncome}>
                            <Button className="gap-2 flex-1 sm:flex-none">
                                <Plus className="w-4 h-4" />
                                Input Pemasukan
                            </Button>
                        </AddIncomeDialog>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Catatan Pemasukan</CardTitle>
                        <CardDescription>
                            Daftar semua aliran dana masuk ke bisnis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead className="w-[50px] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredIncomes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Belum ada data pemasukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredIncomes.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{item.description}</span>
                                                    <span className="md:hidden text-xs text-muted-foreground">
                                                        {format(item.date, "dd MMM yyyy", { locale: id })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {format(item.date, "dd MMM yyyy", { locale: id })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal border-transparent bg-primary/10 text-primary hover:bg-primary/20 capitalize">
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">
                                                +{toRp(item.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                    onClick={() => handleDelete(item.id, item.description)}
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

            {/* Sidebar Stats */}
            <div className="md:col-span-2 lg:col-span-1 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Pemasukan (Total)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{toRp(totalIncome)}</div>
                            <div className="flex items-center text-xs text-emerald-600 mt-1 font-medium">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Teratat {incomes.length} transaksi
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pemasukan Bersih (Net)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{toRp(netIncome)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Pemasukan tipe 'Net'.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ditransfer ke Pribadi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{toRp(transferAmount)}</div>
                            <div className="flex items-center text-xs text-blue-500 mt-1 font-medium">
                                <Wallet className="w-3 h-3 mr-1" />
                                {transferCount} Transaksi
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-l-4 border-l-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                            <Lightbulb className="w-4 h-4" />
                            Tips Pintar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-yellow-700/80 dark:text-yellow-200/80 leading-relaxed">
                        Jika Anda menerima pembayaran dalam jumlah besar (Gross), jangan lupa untuk menyisihkan **PPN 11%** sebelum menggunakannya untuk operasional.
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
