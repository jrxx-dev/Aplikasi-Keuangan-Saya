"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createAccount, updateAccount } from "@/lib/actions/finance";
import { Loader2, Plus, Gem, Banknote } from "lucide-react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/ui/money-input";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const accountSchema = z.object({
    name: z.string().min(2, "Nama akun minimal 2 karakter"),
    type: z.enum(["bank", "cash", "wallet"]),
    balance: z.string().min(1, "Saldo awal diperlukan"),
    theme: z.string().optional(),
});

interface Account {
    id: string;
    name: string;
    type: string;
    balance: string;
    currency: string;
    theme?: string | null;
}

interface AccountManagerProps {
    accountToEdit?: Account | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

const THEMES = [
    { id: "blue", color: "bg-blue-500" },
    { id: "purple", color: "bg-purple-500" },
    { id: "emerald", color: "bg-emerald-500" },
    { id: "rose", color: "bg-rose-500" },
    { id: "amber", color: "bg-amber-500" },
    { id: "sky", color: "bg-sky-500" },
    { id: "indigo", color: "bg-indigo-500" },
    { id: "pink", color: "bg-pink-500" },
];

export function AccountManager({ accountToEdit, open: controlledOpen, onOpenChange, children }: AccountManagerProps) {
    // If controlledOpen is provided, use it, otherwise use internal state
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const [isLoading, setIsLoading] = useState(false);

    const isEditing = !!accountToEdit;

    const form = useForm<z.infer<typeof accountSchema>>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            type: "bank",
            balance: "",
            theme: "blue",
        },
    });

    // Update form values when accountToEdit changes
    useEffect(() => {
        if (accountToEdit) {
            form.reset({
                name: accountToEdit.name,
                type: accountToEdit.type as "bank" | "cash" | "wallet",
                balance: accountToEdit.balance,
                theme: accountToEdit.theme || "blue",
            });
        } else {
            form.reset({
                name: "",
                type: "bank",
                balance: "",
                theme: "blue",
            });
        }
    }, [accountToEdit, form]);

    async function onSubmit(values: z.infer<typeof accountSchema>) {
        setIsLoading(true);
        try {
            let result;
            if (isEditing && accountToEdit) {
                result = await updateAccount(accountToEdit.id, values);
            } else {
                result = await createAccount(values);
            }

            if (result.success) {
                toast.success(isEditing ? "Akun berhasil diperbarui!" : "Akun berhasil dibuat!");
                setOpen(false);
                form.reset();
                window.location.reload();
            } else {
                toast.error(isEditing ? "Gagal memperbarui akun" : "Gagal membuat akun");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {/* Display custom trigger (children) or default button */}
            {controlledOpen === undefined && (
                <DialogTrigger asChild>
                    {children || (
                        <Button variant="outline" size="sm" className="h-8 gap-1 bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 border-dashed">
                            <Plus className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Tambah Akun
                            </span>
                        </Button>
                    )}
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Akun" : "Tambah Akun Baru"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Perbarui informasi akun Anda di sini."
                            : "Tambahkan akun bank, e-wallet, atau tunai Anda untuk memonitor saldo."
                        }
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Akun</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: BCA, Gopay, Dompet Utama" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipe Akun</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih tipe" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="bank">
                                                    <div className="flex items-center gap-2">
                                                        <Gem className="w-4 h-4 text-blue-500" />
                                                        <span>Bank Transfer</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="wallet">
                                                    <div className="flex items-center gap-2">
                                                        <Gem className="w-4 h-4 text-purple-500" />
                                                        <span>E-Wallet / Digital</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="cash">
                                                    <div className="flex items-center gap-2">
                                                        <Banknote className="w-4 h-4 text-emerald-500" />
                                                        <span>Tunai / Cash</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Saldo Awal (Rp)</FormLabel>
                                        <FormControl>
                                            <MoneyInput
                                                {...field}
                                                onChange={undefined}
                                                value={field.value}
                                                onValueChange={(val) => field.onChange(val)}
                                                placeholder="0"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="theme"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tema Warna</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-2">
                                            {THEMES.map((theme) => (
                                                <button
                                                    key={theme.id}
                                                    type="button"
                                                    onClick={() => field.onChange(theme.id)}
                                                    className={`
                                                        w-8 h-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
                                                        ${theme.color}
                                                        ${field.value === theme.id
                                                            ? "ring-2 ring-offset-2 ring-offset-background scale-110 shadow-md"
                                                            : "hover:scale-110 hover:shadow-sm opacity-80 hover:opacity-100"
                                                        }
                                                    `}
                                                    aria-label={`Select ${theme.id} theme`}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Update Akun" : "Simpan Akun"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
