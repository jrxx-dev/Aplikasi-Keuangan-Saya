"use client"

import * as React from "react"
import { Plus, Search, Filter, Trash2, Users, Receipt, Building2, Landmark, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Helper for currency
const toRp = (val: number) => "Rp " + Math.floor(val).toLocaleString("id-ID")

export type Client = {
    id: string
    name: string
    tagihan: number // Total Tagihan (Incl. PPN)
    dpp: number     // Dasar Pengenaan Pajak (Tagihan / 1.11)
    ppn: number     // 11% of DPP
    bhp: number     // 5% of DPP
}

interface ClientsViewProps {
    clients: Client[]
    setClients?: React.Dispatch<React.SetStateAction<Client[]>>
    onSave?: (client: Client) => void
    onDelete?: (id: string) => void
}

export function ClientsView({ clients, setClients, onSave, onDelete }: ClientsViewProps) {
    const [name, setName] = React.useState("")
    const [feeStr, setFeeStr] = React.useState("")
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingId, setEditingId] = React.useState<string | null>(null)

    // Calculate derived values for preview
    const fee = parseFloat(feeStr) || 0
    const dppPreview = fee / 1.11
    const ppnPreview = dppPreview * 0.11
    const bhpPreview = dppPreview * 0.05

    // Reset form when dialog closes or opens for new
    React.useEffect(() => {
        if (!isDialogOpen) {
            setEditingId(null)
            setName("")
            setFeeStr("")
        }
    }, [isDialogOpen])

    const handleEditClick = (client: Client) => {
        setEditingId(client.id)
        setName(client.name)
        setFeeStr(client.tagihan.toString())
        setIsDialogOpen(true)
    }

    const handleSaveClient = () => {
        if (!name || !fee) {
            toast.error("Mohon lengkapi nama dan jumlah tagihan.")
            return
        }

        const dpp = fee / 1.11
        const clientData = {
            name: name,
            tagihan: fee,
            dpp: dpp,
            ppn: dpp * 0.11,
            bhp: dpp * 0.05
        }

        if (editingId) {
            // Update existing
            const updatedClient = { id: editingId, ...clientData }
            if (onSave) {
                onSave(updatedClient)
            } else if (setClients) {
                setClients(prev => prev.map(c => c.id === editingId ? updatedClient : c))
            }
            toast.success("Data Pelanggan Diperbarui", {
                description: `${name} berhasil diupdate.`
            })
        } else {
            // Create new
            const newClient: Client = {
                id: Math.random().toString(36).substr(2, 9),
                ...clientData
            }
            if (onSave) {
                onSave(newClient)
            } else if (setClients) {
                setClients(prev => [...prev, newClient])
            }
            toast.success("Pelanggan Baru Ditambahkan", {
                description: `${name} telah masuk ke daftar tagihan.`
            })
        }

        setIsDialogOpen(false)
    }

    const deleteClient = (id: string, clientName: string) => {
        if (onDelete) {
            onDelete(id)
        } else if (setClients) {
            setClients(prev => prev.filter(c => c.id !== id))
        }
        toast.success("Pelanggan Dihapus", {
            description: `Data ${clientName} telah dihapus dari sistem.`
        })
    }

    // Totals
    const totalTagihan = clients.reduce((acc, c) => acc + c.tagihan, 0)
    const totalDPP = clients.reduce((acc, c) => acc + c.dpp, 0)
    const totalPPN = clients.reduce((acc, c) => acc + c.ppn, 0)
    const totalBHP = clients.reduce((acc, c) => acc + c.bhp, 0)

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-blue-600 text-white border-none shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100 uppercase tracking-wider">Total Tagihan (Omzet)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{toRp(totalTagihan)}</div>
                        <p className="text-xs text-blue-200 mt-1">Akumulasi dari {clients.length} pelanggan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Total DPP
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{toRp(totalDPP)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Dasar Pengenaan Pajak (pendapatan sebelum pajak)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-red-500" /> Total PPN (11%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{toRp(totalPPN)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Wajib setor ke negara</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-orange-500" /> Total BHP & USO (5%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{toRp(totalBHP)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Kewajiban regulasi telekomunikasi</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Daftar Pelanggan Internet</CardTitle>
                            <CardDescription>Manajemen tagihan bulanan per klien.</CardDescription>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="w-4 h-4" /> Tambah Pelanggan
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingId ? "Edit Data Pelanggan" : "Input Pelanggan Baru"}</DialogTitle>
                                    <DialogDescription>
                                        {editingId ? "Perbarui informasi tagihan pelanggan." : "Masukkan harga total tagihan (termasuk PPN)."}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Nama Pelanggan</Label>
                                        <Input
                                            placeholder="Contoh: Bpk. Budi - Paket Home"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total Tagihan (Rp)</Label>
                                        <Input
                                            type="number"
                                            placeholder="250000"
                                            value={feeStr}
                                            onChange={(e) => setFeeStr(e.target.value)}
                                        />
                                    </div>
                                    {fee > 0 && (
                                        <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span>Estimasi DPP:</span>
                                                <span className="font-mono font-medium">{toRp(dppPreview)}</span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>PPN (11%):</span>
                                                <span className="font-mono">{toRp(ppnPreview)}</span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>BHP (5%):</span>
                                                <span className="font-mono">{toRp(bhpPreview)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveClient}>{editingId ? "Simpan Perubahan" : "Tambah Pelanggan"}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[30%]">Nama Pelanggan</TableHead>
                                <TableHead>Tagihan (Total)</TableHead>
                                <TableHead>DPP</TableHead>
                                <TableHead>PPN (11%)</TableHead>
                                <TableHead>BHP & USO (5%)</TableHead>
                                <TableHead className="w-[100px] text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                                        Belum ada data pelanggan. Tambahkan pelanggan baru.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell className="font-medium">{client.name}</TableCell>
                                        <TableCell className="font-bold text-blue-600">{toRp(client.tagihan)}</TableCell>
                                        <TableCell className="font-mono text-sm">{toRp(client.dpp)}</TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">{toRp(client.ppn)}</TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">{toRp(client.bhp)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(client)}
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteClient(client.id, client.name)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        <TableFooter className="bg-slate-100/50 dark:bg-slate-900/50 font-bold">
                            <TableRow>
                                <TableCell>Total Bulanan</TableCell>
                                <TableCell className="text-blue-700">{toRp(totalTagihan)}</TableCell>
                                <TableCell>{toRp(totalDPP)}</TableCell>
                                <TableCell className="text-red-600">{toRp(totalPPN)}</TableCell>
                                <TableCell className="text-orange-600">{toRp(totalBHP)}</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
