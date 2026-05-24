"use client";

import { useState } from "react";
import { createSubscription } from "@/lib/actions/subscriptions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SubscriptionForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        try {
            await createSubscription(formData);
            toast.success("Langganan berhasil ditambahkan!");
            setIsOpen(false);
        } catch (error) {
            toast.error("Gagal menambahkan langganan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20">
                    <Plus className="w-4 h-4 mr-2" /> Langganan Baru
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Langganan Rutin</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nama Layanan</Label>
                        <Input name="name" placeholder="Misal: Netflix Premium" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Biaya (Rp)</Label>
                            <Input name="cost" type="number" placeholder="186000" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Siklus Tagihan</Label>
                            <Select name="billingCycle" defaultValue="monthly">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Bulanan</SelectItem>
                                    <SelectItem value="yearly">Tahunan</SelectItem>
                                    <SelectItem value="weekly">Mingguan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Pembayaran Berikutnya</Label>
                        <Input name="nextPaymentDate" type="date" required />
                    </div>

                    <div className="space-y-2">
                        <Label>Kategori / Provider</Label>
                        <Input name="provider" placeholder="Misal: Digital, Gym, Utilities" />
                    </div>

                    <Button type="submit" className="w-full bg-purple-600" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Simpan
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
