"use client"

import * as React from "react"
import { CalendarIcon, Building2, User } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const formSchema = z.object({
    creditorName: z.string().min(2, "Nama kreditur wajib diisi"),
    amount: z.string().min(1, "Jumlah wajib diisi"),
    description: z.string().optional(),
    dueDate: z.date(),
    category: z.enum(["business", "personal"]),
    status: z.enum(["pending", "paid"]),
})

type FormValues = z.infer<typeof formSchema>


export type DebtItem = {
    id: string
    creditorName: string
    amount: number
    description?: string
    dueDate: Date
    category: "business" | "personal"
    status: "pending" | "paid"
    type: "payable" | "receivable"
}

interface AddDebtDialogProps {
    children: React.ReactNode
    onSave?: (data: DebtItem) => void
    defaultType?: "payable" | "receivable"
}

export function AddDebtDialog({ children, onSave, defaultType = "payable" }: AddDebtDialogProps) {
    const [open, setOpen] = React.useState(false)
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            creditorName: "",
            amount: "",
            description: "",
            dueDate: new Date(),
            category: "business",
            status: "pending",
        },
    })

    function onSubmit(values: FormValues) {
        const newItem: DebtItem = {
            id: Math.random().toString(36).substr(2, 9),
            creditorName: values.creditorName,
            amount: parseFloat(values.amount),
            description: values.description,
            dueDate: values.dueDate,
            category: values.category,
            status: values.status,
            type: defaultType,
        }

        if (onSave) {
            onSave(newItem)
        } else {
            // Fallback
            toast.success(defaultType === "payable" ? "Hutang berhasil dicatat" : "Kasbon berhasil dicatat", {
                description: `Tercatat Rp ${values.amount} kepada ${values.creditorName}.`
            })
        }

        setOpen(false)
        form.reset()
    }

    const isPayable = defaultType === "payable";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isPayable ? "Catat Hutang Baru" : "Catat Kasbon Pelanggan"}</DialogTitle>
                    <DialogDescription>
                        {isPayable 
                            ? "Catat uang yang harus dibayarkan ke perusahaan lain atau pemberi pinjaman." 
                            : "Catat uang yang harus dibayar orang lain kepada Anda (Order Kuota, dll)."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="creditorName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{isPayable ? "Nama Kreditur / Perusahaan" : "Nama Pelanggan / Orang"}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder={isPayable ? "cth. Bank Asia, Vendor PT..." : "cth. Pak Budi, Jefri..."} className="pl-9" {...field} />
                                        </div>
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
                                    <FormItem>
                                        <FormLabel>Jumlah (Rp)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0" {...field} type="number" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kategori</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih konteks" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="business">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-3 h-3" />
                                                        <span>Bisnis</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="personal">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-3 h-3" />
                                                        <span>Pribadi</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Jatuh Tempo</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: id })
                                                    ) : (
                                                        <span>Pilih tanggal</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catatan / Item (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder={isPayable ? "cth. Pinjaman modal ekspansi" : "cth. Order Kuota XL 10GB"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" className={cn("w-full text-white", isPayable ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700")}>Simpan Catatan</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
