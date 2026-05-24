"use client";

import { useState } from "react";
import { createGoal } from "@/lib/actions/goals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GoalForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const targetAmount = parseFloat(formData.get("targetAmount") as string);
        const deadlineStr = formData.get("deadline") as string;
        const deadline = deadlineStr ? new Date(deadlineStr) : undefined;
        const color = formData.get("color") as string;

        try {
            await createGoal({ name, targetAmount, deadline, color });
            toast.success("Target tabungan berhasil dibuat!");
            setIsOpen(false);
        } catch (error) {
            toast.error("Gagal membuat target");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Target Baru
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Buat Target Tabungan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Target</Label>
                        <Input id="name" name="name" placeholder="Misal: Liburan ke Bali" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetAmount">Jumlah Target (Rp)</Label>
                        <Input id="targetAmount" name="targetAmount" type="number" placeholder="10000000" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deadline">Target Tanggal (Opsional)</Label>
                        <Input id="deadline" name="deadline" type="date" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Warna Tema</Label>
                        <Select name="color" defaultValue="blue">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="blue">Blue (Biru Langit)</SelectItem>
                                <SelectItem value="emerald">Emerald (Hijau Uang)</SelectItem>
                                <SelectItem value="rose">Rose (Merah Muda)</SelectItem>
                                <SelectItem value="purple">Purple (Ungu Mewah)</SelectItem>
                                <SelectItem value="amber">Amber (Emas)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Simpan Target
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
