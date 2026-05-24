"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { bulkImportCustomers } from "@/actions/business-customer";

export function CustomerImport({ userId }: { userId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    toast.error("File kosong");
                    setLoading(false);
                    return;
                }

                // Map excel keys to DB keys if needed, or assume template is correct
                // Expected headers: Name, Nickname, CustomerID, Phone, Village, Address, MonthlyFee

                const formattedData = data.map((row: any) => ({
                    name: row['Name'] || row['Nama'],
                    nickname: row['Nickname'] || row['Panggilan'],
                    customerId: row['Customer ID'] || row['ID'],
                    phone: row['Phone'] || row['HP'],
                    village: row['Village'] || row['Desa'],
                    address: row['Address'] || row['Alamat'],
                    monthlyFee: row['Monthly Fee'] || row['Biaya'] || 0
                }));

                const result = await bulkImportCustomers(userId, formattedData);
                if (result.success) {
                    toast.success(`Berhasil mengimport ${result.count} pelanggan`);
                    setOpen(false);
                } else {
                    toast.error("Gagal import data");
                }
            } catch (err) {
                console.error(err);
                toast.error("Gagal membaca file excel");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            {
                "Nama": "Contoh Nama",
                "Panggilan": "Contoh",
                "ID": "contoh",
                "HP": "08123456789",
                "Desa": "Tunggal Jaya",
                "Alamat": "Jalan Mawar",
                "Biaya": 150000
            }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "template_pelanggan.xlsx");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" /> Import Excel
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Data Pelanggan</DialogTitle>
                    <DialogDescription>
                        Upload file Excel (.xlsx) dengan format yang sesuai.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Template Excel</p>
                            <p className="text-xs text-muted-foreground">Download template untuk diisi</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={downloadTemplate}>
                            <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                    </div>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Button variant="outline" className="w-full relative" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4 mr-2" />}
                            {loading ? "Memproses..." : "Pilih File Excel"}
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                                disabled={loading}
                            />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
