"use client";

import { useState } from "react";
import { createDebt } from "@/lib/actions/debts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DebtForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            await createDebt(formData);
            toast.success("Catatan utang berhasil dibuat!");
            setIsOpen(false);
        } catch (error) {
            toast.error("Gagal membuat catatan utang");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Catat Utang Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Catat Utang / Cicilan Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Utang</Label>
                        <Input id="name" name="name" placeholder="Misal: Cicilan iPhone / Pinjam Budi" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="provider">Penyedia / Pemberi Pinjaman</Label>
                        <Input id="provider" name="provider" placeholder="Misal: Bank BCA / Kredivo" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="limitAmount">Total Pinjaman (Limit)</Label>
                            <Input id="limitAmount" name="limitAmount" type="number" placeholder="10000000" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currentBalance">Sisa Pokok Saat Ini</Label>
                            <Input id="currentBalance" name="currentBalance" type="number" placeholder="5000000" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Jatuh Tempo Berikutnya</Label>
                        <Input id="dueDate" name="dueDate" type="date" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Label Warna</Label>
                        <Select name="color" defaultValue="red">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="red">Red (Critical)</SelectItem>
                                <SelectItem value="orange">Orange (Warning)</SelectItem>
                                <SelectItem value="yellow">Yellow (Caution)</SelectItem>
                                <SelectItem value="blue">Blue (Standard)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Simpan Catatan
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
