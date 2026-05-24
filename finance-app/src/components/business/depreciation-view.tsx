"use client"

import * as React from "react"
import { Plus, Search, Filter, Trash2, Wrench, Package, TrendingDown, Clock, AlertCircle } from "lucide-react"
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
    TableFooter,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Helper
const toRp = (val: number) => "Rp " + Math.floor(val).toLocaleString("id-ID")

export type AssetItem = {
    id: string
    name: string
    price: number
    lifespanMonths: number
    monthlyMaintenance: number
    purchaseDate: Date
}

interface DepreciationViewProps {
    assets?: AssetItem[]
    setAssets?: React.Dispatch<React.SetStateAction<AssetItem[]>>
    onSave?: (asset: AssetItem) => void
    onDelete?: (id: string) => void
}

export function DepreciationView({ assets = [], setAssets, onSave, onDelete }: DepreciationViewProps) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    // Form State
    const [name, setName] = React.useState("")
    const [price, setPrice] = React.useState("")
    const [lifespan, setLifespan] = React.useState("12") // Default 1 year
    const [maintenance, setMaintenance] = React.useState("")

    const handleSave = () => {
        if (!name || !price || !lifespan) {
            toast.error("Mohon lengkapi nama, harga, dan umur ekonomis.")
            return
        }

        const newItem: AssetItem = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            price: parseFloat(price),
            lifespanMonths: parseInt(lifespan),
            monthlyMaintenance: parseFloat(maintenance) || 0,
            purchaseDate: new Date()
        }

        if (onSave) {
            onSave(newItem)
        } else if (setAssets) {
            setAssets(prev => [...prev, newItem])
        }
        toast.success("Aset Ditambahkan", {
            description: `${name} telah masuk ke daftar inventaris.`
        })

        setIsDialogOpen(false)
        resetForm()
    }

    const handleDelete = (id: string, assetName: string) => {
        if (onDelete) {
            onDelete(id)
        } else if (setAssets) {
            setAssets(prev => prev.filter(item => item.id !== id))
        }
        toast.success("Aset Dihapus", {
            description: `${assetName} dihapus dari daftar.`
        })
    }

    const resetForm = () => {
        setName("")
        setPrice("")
        setLifespan("12")
        setMaintenance("")
    }

    // Calculations
    const totalAssetsValue = assets.reduce((acc, a) => acc + a.price, 0)
    const totalMonthlyDepreciation = assets.reduce((acc, a) => acc + (a.price / a.lifespanMonths), 0)
    const totalMonthlyMaintenance = assets.reduce((acc, a) => acc + a.monthlyMaintenance, 0)
    const totalMonthlyCost = totalMonthlyDepreciation + totalMonthlyMaintenance

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Main List */}
            <div className="md:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari alat / aset..."
                            className="pl-8"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white">
                                    <Plus className="w-4 h-4" />
                                    Tambah Alat
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Input Aset & Alat</DialogTitle>
                                    <DialogDescription>
                                        Masukkan detail alat untuk menghitung penyusutan dan biaya perawatan.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Nama Alat</Label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="cth. Router Mikrotik RB750"
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Harga Beli</Label>
                                        <Input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="Rp"
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Umur (Bln)</Label>
                                        <div className="col-span-3 flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={lifespan}
                                                onChange={(e) => setLifespan(e.target.value)}
                                                placeholder="12"
                                            />
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">Estimasi pakai (bulan)</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Biaya Rawat</Label>
                                        <div className="col-span-3 flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={maintenance}
                                                onChange={(e) => setMaintenance(e.target.value)}
                                                placeholder="0"
                                            />
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">per Bulan</span>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">Simpan Aset</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Daftar Inventaris & Pemeliharaan</CardTitle>
                        <CardDescription>
                            Daftar aset yang mengalami penyusutan nilai dan membutuhkan perawatan rutin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Alat</TableHead>
                                    <TableHead>Harga Beli</TableHead>
                                    <TableHead title="Penyusutan per Bulan">Depresiasi/Bln</TableHead>
                                    <TableHead>Maintenance/Bln</TableHead>
                                    <TableHead className="text-right">Total Beban/Bln</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            Belum ada data aset. Tambahkan alat baru.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    assets.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{item.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">Umur: {item.lifespanMonths} bulan</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{toRp(item.price)}</TableCell>
                                            <TableCell className="text-orange-600 font-medium">
                                                {toRp(item.price / item.lifespanMonths)}
                                            </TableCell>
                                            <TableCell className="text-blue-600 font-medium">
                                                {toRp(item.monthlyMaintenance)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-700 dark:text-slate-300">
                                                {toRp((item.price / item.lifespanMonths) + item.monthlyMaintenance)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700"
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                            {assets.length > 0 && (
                                <TableFooter className="bg-orange-50/50 dark:bg-orange-900/20 font-bold">
                                    <TableRow>
                                        <TableCell colSpan={2}>Total Beban Alat</TableCell>
                                        <TableCell className="text-orange-700">{toRp(totalMonthlyDepreciation)}</TableCell>
                                        <TableCell className="text-blue-700">{toRp(totalMonthlyMaintenance)}</TableCell>
                                        <TableCell className="text-right text-lg">{toRp(totalMonthlyCost)}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
                <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" /> Total Penyusutan (Bulan)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {toRp(totalMonthlyDepreciation)}
                        </div>
                        <p className="text-xs text-orange-600/80 mt-1">
                            Nilai aset yang hilang setiap bulan.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                            <Wrench className="w-4 h-4" /> Biaya Pemeliharaan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {toRp(totalMonthlyMaintenance)}
                        </div>
                        <p className="text-xs text-blue-600/80 mt-1">
                            Estimasi biaya service/maintenance rutin.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Package className="w-4 h-4" /> Total Aset Dimiliki
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                            {toRp(totalAssetsValue)}
                        </div>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {assets.length} Item terdaftar
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-400">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            Info Akuntansi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground leading-relaxed">
                        Biaya penyusutan dan pemeliharaan akan <b>mengurangi Laba Bersih</b> Anda setiap bulan, memastikan Anda menyisihkan dana untuk penggantian alat di masa depan.
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
