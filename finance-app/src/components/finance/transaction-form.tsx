"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft, PiggyBank } from "lucide-react";
import { MoneyInput } from "@/components/ui/money-input";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { createTransaction, updateTransaction, getAccounts, getCategories, getGoals, createSavingTransaction } from "@/lib/actions/finance";
import { useRouter } from "next/navigation";


const formSchema = z.object({
    description: z.string().min(2, {
        message: "Deskripsi minimal 2 karakter.",
    }).optional().or(z.literal('')),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Jumlah harus berupa angka positif.",
    }),
    type: z.enum(["income", "expense", "transfer", "saving"] as const, {
        message: "Anda harus memilih tipe transaksi.",
    }),
    category: z.string().optional(), // Make optional because 'saving' uses goalId
    goalId: z.string().optional(),
    accountId: z.string().min(1, {
        message: "Silakan pilih akun.",
    }),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Silakan masukkan tanggal yang valid",
    }),
}).refine(data => {
    // Saving no longer requires goalId based on user request "form tujuan tidak ada"
    if (data.type === 'saving') {
        return true;
    }
    return !!data.category;
}, {
    message: "Kategori harus dipilih",
    path: ["category"]
});

interface EditTransaction {
    id: string;
    description: string | null;
    amount: string;
    date: Date;
    type: "income" | "expense" | "transfer"; // Edit mode might not support 'saving' perfectly yet if schema differs
    category: string | null;
}

interface TransactionFormProps {
    onClose?: () => void;
    defaultType?: "income" | "expense" | "transfer" | "saving";
    editTransaction?: EditTransaction;
}

export function TransactionForm({ onClose, defaultType = "expense", editTransaction }: TransactionFormProps) {
    const router = useRouter();
    const isEditMode = !!editTransaction;

    // Track active type to filter categories
    const [activeType, setActiveType] = useState<"income" | "expense" | "transfer" | "saving">(
        // @ts-ignore
        editTransaction?.type || defaultType
    );
    const [accounts, setAccounts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Success Dialog
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<React.ReactNode>("");
    const [successTitle, setSuccessTitle] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoadingAccounts(true);
        setLoadingCategories(true);
        try {
            const [accData, catData, goalData] = await Promise.all([
                getAccounts(),
                getCategories(),
                getGoals()
            ]);
            setAccounts(accData);
            setCategories(catData);
            setGoals(goalData);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Gagal memuat data');
        } finally {
            setLoadingAccounts(false);
            setLoadingCategories(false);
        }
    };

    // Helper to find category ID from category name or ID
    const findCategoryId = (categoryName: string | null, type: string): string => {
        if (!categoryName) return "";
        const filteredCategories = categories.filter((cat: any) => cat.type === type);
        const foundById = filteredCategories.find((cat: any) => cat.id === categoryName);
        if (foundById) return foundById.id;
        const foundByName = filteredCategories.find((cat: any) => cat.name === categoryName);
        return foundByName?.id || "";
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: editTransaction?.description || "",
            amount: editTransaction?.amount || "",
            // @ts-ignore
            type: editTransaction?.type || defaultType,
            category: editTransaction ? findCategoryId(editTransaction.category, editTransaction.type) : "",
            goalId: "",
            accountId: "",
            date: editTransaction
                ? new Date(editTransaction.date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
        },
    });

    // Watch for type changes to update category options
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "type" && value.type) {
                const newType = value.type as "income" | "expense" | "transfer" | "saving";
                setActiveType(newType);

                if (newType === 'saving') {
                    form.setValue("category", "");
                } else {
                    // Check if current category exists in new type
                    const currentCategory = form.getValues("category");
                    const newCategories = categories.filter((cat: any) => cat.type === newType);
                    const categoryExistsInNewType = newCategories.some((cat: any) => cat.id === currentCategory);

                    if (!categoryExistsInNewType) {
                        form.setValue("category", "");
                    }
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [form, categories]);

    // Set category when editing and type is loaded
    useEffect(() => {
        if (editTransaction && editTransaction.category) {
            const categoryId = findCategoryId(editTransaction.category, activeType as string);
            if (categoryId) {
                form.setValue("category", categoryId);
            }
        }
    }, [activeType, editTransaction, categories]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        setProgress(0);

        // Simulate progress for better UX
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                const increment = prev < 50 ? 10 : prev < 80 ? 5 : 2;
                return Math.min(90, prev + increment);
            });
        }, 100);

        try {
            let result;

            if (values.type === 'saving') {
                // Savings Logic - Goal is now optional
                // Create Date object and set to CURRENT time for better tracking
                const dateObj = new Date(values.date);
                const now = new Date();
                dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

                // Sanitize amount to ensure only digits (fix for "Rp 10" issue)
                const cleanAmount = values.amount.toString().replace(/\D/g, "");

                result = await createSavingTransaction({
                    amount: cleanAmount,
                    goalId: values.goalId,
                    accountId: values.accountId,
                    date: dateObj,
                    description: values.description || undefined
                });
            } else if (isEditMode && editTransaction) {
                // Update existing transaction
                // Note: Update logic does NOT support changing TO 'saving' yet in this simple implementation
                // unless we enhance updateTransaction to handle goal updates.
                // @ts-ignore
                result = await updateTransaction(editTransaction.id, {
                    amount: values.amount,
                    description: values.description || "",
                    categoryId: values.category!,
                    // @ts-ignore
                    type: values.type,
                    date: new Date(values.date),
                });
            } else {
                // Standard Expense/Income/Transfer
                const dateObj = new Date(values.date);
                const now = new Date();
                dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

                const cleanAmount = values.amount.toString().replace(/\D/g, "");

                // Create new transaction
                result = await createTransaction({
                    amount: cleanAmount,
                    description: values.description || "",
                    accountId: values.accountId,
                    categoryId: values.category!, // This acts as ID
                    // @ts-ignore
                    type: values.type,
                    date: dateObj,
                    source: "manual"
                });
            }

            clearInterval(interval);
            setProgress(100);

            await new Promise(resolve => setTimeout(resolve, 500));

            if (result.success) {
                const cleanAmount = values.amount.toString().replace(/\D/g, "");
                const accountName = accounts.find(a => a.id === values.accountId)?.name || "Akun";
                // Get category name
                const categoryName = categories.find(c => c.id === values.category)?.name || values.category || "Umum";

                setSuccessTitle(isEditMode ? "Transaksi Diupdate!" : "Transaksi Berhasil!");
                setSuccessMessage(
                    <div className="flex flex-col gap-4 items-center mt-2 w-full">
                        <div className={`text-3xl font-black tracking-tight ${values.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {values.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parseInt(cleanAmount))}
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl w-full text-sm space-y-3">
                            <div className="flex justify-between items-center border-b pb-2 border-slate-100 dark:border-white/5">
                                <span className="text-muted-foreground">Kategori</span>
                                <span className="font-semibold text-foreground capitalize">{categoryName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2 border-slate-100 dark:border-white/5">
                                <span className="text-muted-foreground">Akun</span>
                                <span className="font-semibold text-foreground">{accountName}</span>
                            </div>
                            {values.description && (
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Catatan</span>
                                    <span className="font-semibold text-foreground italic truncate max-w-[150px] text-right">"{values.description}"</span>
                                </div>
                            )}
                        </div>
                    </div>
                );

                // Keep the form open for a moment or handle close in dialog
                setSuccessOpen(true);
                router.refresh();

                if (!isEditMode) {
                    form.reset({
                        description: "",
                        amount: "",
                        // @ts-ignore
                        type: activeType,
                        category: "",
                        goalId: "",
                        accountId: "",
                        date: new Date().toISOString().split('T')[0],
                    });
                }
            } else {
                toast.error(isEditMode ? "Gagal memperbarui transaksi" : "Gagal menyimpan transaksi");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
            setProgress(0);
            clearInterval(interval);
        }
    }

    const currentCategories = categories.filter((cat: any) => cat.type === activeType);

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'bank': return '🏦';
            case 'wallet': return '📱';
            case 'cash': return '💵';
            default: return '💳';
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative">
                {/* LOADING OVERLAY */}
                {isSubmitting && (
                    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
                        <div className="w-full max-w-[80%] space-y-4 text-center">
                            <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-muted-foreground">Menyimpan data...</span>
                                <span className="text-primary font-bold">{progress}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground animate-pulse">
                                Mohon tunggu sebentar
                            </p>
                        </div>
                    </div>
                )}

                {/* TRANSACTION TYPE SELECTOR */}
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Tipe Transaksi</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                                >
                                    <div>
                                        <RadioGroupItem value="expense" id="expense" className="peer sr-only" />
                                        <label
                                            htmlFor="expense"
                                            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-rose-500 peer-data-[state=checked]:bg-rose-50 dark:peer-data-[state=checked]:bg-rose-950/20 [&:has([data-state=checked])]:border-rose-500 cursor-pointer transition-all h-full"
                                        >
                                            <TrendingDown className="h-5 w-5 text-rose-500" />
                                            <span className="text-xs font-semibold">Pengeluaran</span>
                                        </label>
                                    </div>

                                    <div>
                                        <RadioGroupItem value="income" id="income" className="peer sr-only" />
                                        <label
                                            htmlFor="income"
                                            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-950/20 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer transition-all h-full"
                                        >
                                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                                            <span className="text-xs font-semibold">Pemasukan</span>
                                        </label>
                                    </div>

                                    <div>
                                        <RadioGroupItem value="transfer" id="transfer" className="peer sr-only" />
                                        <label
                                            htmlFor="transfer"
                                            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-950/20 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-all h-full"
                                        >
                                            <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                                            <span className="text-xs font-semibold">Transfer</span>
                                        </label>
                                    </div>

                                    <div>
                                        <RadioGroupItem value="saving" id="saving" className="peer sr-only" />
                                        <label
                                            htmlFor="saving"
                                            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 dark:peer-data-[state=checked]:bg-teal-950/20 [&:has([data-state=checked])]:border-teal-500 cursor-pointer transition-all h-full"
                                        >
                                            <PiggyBank className="h-5 w-5 text-teal-500" />
                                            <span className="text-xs font-semibold">Menabung</span>
                                        </label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Jumlah (Rp)</FormLabel>
                                <FormControl>
                                    <MoneyInput
                                        {...field}
                                        value={field.value}
                                        onValueChange={(val) => field.onChange(val)}
                                        placeholder="0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tanggal</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="accountId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center justify-between">
                                    <span>Akun {activeType === 'saving' || activeType === 'expense' || activeType === 'transfer' ? "(Sumber)" : "(Tujuan)"}</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={loadingAccounts}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih akun" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accounts.length === 0 && !loadingAccounts ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                Belum ada akun.
                                            </div>
                                        ) : (
                                            accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{getAccountIcon(acc.type)}</span>
                                                        <span>{acc.name}</span>
                                                        <span className="text-xs text-muted-foreground">({acc.type})</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* CATEGORY / GOAL SELECTOR SWITCH */}
                    {activeType === 'saving' ? (
                        null // User requested "form tujuan di menabung tidak ada" - Removing Goal Selector for specific "Routine Saving" flow.
                        // If they later want to fund specific goals, we might need a toggle or separate specific flow.
                        // For now, adhering strictly.
                    ) : (
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center justify-between">
                                        <span>Kategori</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={loadingCategories}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {currentCategories.length === 0 && !loadingCategories ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    Belum ada kategori untuk tipe ini.
                                                </div>
                                            ) : (
                                                currentCategories.map((cat: any) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        <span className="mr-2">{cat.icon}</span> {cat.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Deskripsi / Catatan</FormLabel>
                            <FormControl>
                                <Input placeholder={activeType === 'saving' ? "Contoh: Tabungan bulan Mei" : "Contoh: Beli makan siang"} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting} className={`w-full text-white font-bold transition-all ${activeType === 'expense' ? 'bg-rose-500 hover:bg-rose-600' :
                    activeType === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' :
                        activeType === 'saving' ? 'bg-teal-500 hover:bg-teal-600' :
                            'bg-blue-500 hover:bg-blue-600'
                    }`}>
                    {isSubmitting
                        ? (isEditMode ? "Memperbarui..." : "Menyimpan...")
                        : isEditMode
                            ? "Perbarui Transaksi"
                            : (activeType === 'expense' ? 'Catat Pengeluaran' :
                                activeType === 'income' ? 'Catat Pemasukan' :
                                    activeType === 'saving' ? 'Tabung Sekarang' : 'Catat Transfer')
                    }
                </Button>
            </form>

            <SuccessDialog
                open={successOpen}
                onOpenChange={(open) => {
                    setSuccessOpen(open);
                    if (!open) {
                        if (onClose) onClose();
                        if (isEditMode) window.location.reload();
                    }
                }}
                title={successTitle}
                description={successMessage}
                actionLabel="Tutup"
                onAction={() => {
                    if (onClose) onClose();
                    if (isEditMode) window.location.reload();
                }}
            />
        </Form>
    );
}
