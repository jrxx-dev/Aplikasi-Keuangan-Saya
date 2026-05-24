"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, MoreHorizontal, Building2, Landmark, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerDetail } from "./customer-detail";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { deleteCustomer, bulkDeleteCustomers } from "@/actions/business-customer";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CustomerForm } from "./customer-form";
import { X } from "lucide-react";

// Helper for currency
const toRp = (val: number) => "Rp " + Math.floor(val).toLocaleString("id-ID");

export function CustomerList({ data, userId }: { data: any[], userId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState("10");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editCustomer, setEditCustomer] = useState<any | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedData.map(c => c.id));
        }
    };

    const toggleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(x => x !== id));
        }
    };

    const handleBulkDelete = () => {
        if (!confirm(`Hapus ${selectedIds.length} pelanggan terpilih?`)) return;

        startTransition(async () => {
            const res = await bulkDeleteCustomers(selectedIds);
            if (res.success) {
                toast.success(`${res.count} pelanggan berhasil dihapus`);
                setSelectedIds([]);
                router.refresh();
            } else {
                toast.error("Gagal menghapus pelanggan terpilih");
            }
        });
    };

    const filteredData = data.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Financial Checks & Calculations
    const processedData = filteredData.map(c => {
        const fee = parseFloat(c.monthlyFee) || 0;
        const dpp = fee / 1.11;
        return {
            ...c,
            processed: {
                fee,
                dpp,
                ppn: dpp * 0.11,
                bhp: dpp * 0.05
            }
        };
    });

    // Totals
    const totalTagihan = processedData.reduce((acc, c) => acc + c.processed.fee, 0);
    const totalDPP = processedData.reduce((acc, c) => acc + c.processed.dpp, 0);
    const totalPPN = processedData.reduce((acc, c) => acc + c.processed.ppn, 0);
    const totalBHP = processedData.reduce((acc, c) => acc + c.processed.bhp, 0);

    // Pagination Calculations
    const totalItems = processedData.length;
    const limit = parseInt(itemsPerPage);
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (currentPage - 1) * limit;
    const paginatedData = processedData.slice(startIndex, startIndex + limit);

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            {/* Main Content Card */}
            <Card className="shadow-sm border-none bg-white dark:bg-slate-900">
                <CardHeader className="pb-4">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-4">
                                <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                                    <X className="w-4 h-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                    {selectedIds.length} terpilih
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleBulkDelete}
                                disabled={isPending}
                            >
                                <Trash className="w-4 h-4 mr-2" />
                                Hapus Terpilih
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Daftar Pelanggan</CardTitle>
                                <CardDescription className="mt-1">
                                    Kelola data pelanggan dan history pembayaran.
                                </CardDescription>
                            </div>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari pelanggan..."
                                    className="pl-9 bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Reset to page 1 on search
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="w-[40px] text-center">
                                    <Checkbox
                                        checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead className="w-[50px] font-semibold text-center">#</TableHead>
                                <TableHead className="w-[200px] font-semibold">Nama Pelanggan</TableHead>
                                <TableHead className="font-semibold">ID Pelanggan</TableHead>
                                <TableHead className="font-semibold">Desa</TableHead>
                                <TableHead className="font-semibold text-right">Tagihan</TableHead>
                                <TableHead className="hidden md:table-cell font-semibold text-right">DPP</TableHead>
                                <TableHead className="hidden md:table-cell font-semibold text-right">PPN</TableHead>
                                <TableHead className="hidden md:table-cell font-semibold text-right">BHP</TableHead>
                                <TableHead className="font-semibold text-center">Status</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-slate-100 rounded-full">
                                                <Search className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p>Tidak ada data pelanggan yang cocok.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((customer, idx) => {
                                    // Generate consistent color based on name length
                                    const colors = [
                                        "bg-blue-50 text-blue-600 border-blue-100",
                                        "bg-emerald-50 text-emerald-600 border-emerald-100",
                                        "bg-violet-50 text-violet-600 border-violet-100",
                                        "bg-orange-50 text-orange-600 border-orange-100",
                                        "bg-rose-50 text-rose-600 border-rose-100",
                                    ];
                                    const colorClass = colors[customer.name.length % colors.length];
                                    const initials = customer.name.substring(0, 2).toUpperCase();

                                    return (
                                        <TableRow
                                            key={customer.id}
                                            className="cursor-pointer hover:bg-slate-50/80 transition-colors group border-b border-slate-50 last:border-0"
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setShowDetail(true);
                                            }}
                                        >
                                            <TableCell className="text-center w-[40px]" onClick={e => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.includes(customer.id)}
                                                    onCheckedChange={(checked) => toggleSelect(customer.id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center text-xs font-mono text-slate-400 w-[50px]">
                                                {startIndex + idx + 1}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border shadow-sm ${colorClass}`}>
                                                        {initials}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                                                            {customer.name}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                                            {customer.nickname && <span>{customer.nickname}</span>}
                                                            {customer.nickname && customer.village && <span>•</span>}
                                                            <span>{customer.village || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono text-[10px] font-normal bg-slate-100 text-slate-500 border-slate-200">
                                                    {customer.customerId}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-medium text-slate-600">{customer.village}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-bold text-slate-700 tabular-nums tracking-tight">
                                                    {toRp(customer.processed.fee)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-right">
                                                <span className="text-xs font-mono text-slate-500 tabular-nums">
                                                    {toRp(customer.processed.dpp)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-right">
                                                <span className="text-xs font-mono text-red-500 tabular-nums">
                                                    {toRp(customer.processed.ppn)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-right">
                                                <span className="text-xs font-mono text-orange-500 tabular-nums">
                                                    {toRp(customer.processed.bhp)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${customer.status === 'active'
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    : "bg-slate-50 text-slate-500 border-slate-100"
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                                        }`} />
                                                    {customer.status === 'active' ? 'ACTIVE' : customer.status.toUpperCase()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-slate-600 transition-colors focus:ring-0 focus:ring-offset-0" onClick={(e) => e.stopPropagation()}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditCustomer(customer);
                                                            setIsEditOpen(true);
                                                        }}>
                                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" onClick={(e) => {
                                                            e.stopPropagation();
                                                            const isConfirmed = confirm(`Apakah anda yakin ingin menghapus pelanggan "${customer.name}"? Data yang dihapus tidak dapat dikembalikan.`);

                                                            if (isConfirmed) {
                                                                startTransition(async () => {
                                                                    try {
                                                                        const res = await deleteCustomer(customer.id);
                                                                        if (res.success) {
                                                                            toast.success("Pelanggan berhasil dihapus");
                                                                            router.refresh();
                                                                        } else {
                                                                            toast.error(res.error || "Gagal menghapus pelanggan");
                                                                        }
                                                                    } catch (err) {
                                                                        toast.error("Terjadi kesalahan saat menghapus");
                                                                    }
                                                                });
                                                            }
                                                        }}>
                                                            <Trash className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {/* Pagination Footer */}
                <div className="flex items-center justify-between px-4 py-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Show</span>
                        <Select
                            value={itemsPerPage}
                            onValueChange={(val) => {
                                setItemsPerPage(val);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={itemsPerPage} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 50, 100].map(sz => (
                                    <SelectItem key={sz} value={sz.toString()}>{sz}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span>entries</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages || 1}
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Edit Form */}
            <CustomerForm userId={userId} initialData={editCustomer} open={isEditOpen} onOpenChange={setIsEditOpen} />

            <CustomerDetail
                customer={selectedCustomer}
                open={showDetail}
                onOpenChange={setShowDetail}
            />
        </div >
    );
}
