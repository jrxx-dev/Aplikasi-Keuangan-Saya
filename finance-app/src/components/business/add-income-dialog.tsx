"use client"

import * as React from "react"
import { CalendarIcon, DollarSign, Wallet } from "lucide-react"
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
    FormDescription,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const formSchema = z.object({
    amount: z.string().min(1, "Jumlah wajib diisi"),
    description: z.string().min(2, "Deskripsi minimal 2 karakter"),
    date: z.date(),
    type: z.enum(["gross", "net"]),
    transferToPersonal: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>


export type IncomeItem = {
    id: string
    description: string
    amount: number
    date: Date
    type: "gross" | "net"
    transferToPersonal: boolean
}

interface AddIncomeDialogProps {
    children: React.ReactNode
    onSave?: (data: IncomeItem) => void
}

export function AddIncomeDialog({ children, onSave }: AddIncomeDialogProps) {
    const [open, setOpen] = React.useState(false)

    const form = useForm<FormValues>({
        // @ts-ignore - Known issue with zodResolver type inference in strict mode
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            description: "",
            date: new Date(),
            type: "gross",
            transferToPersonal: false,
        },
    }) as any

    // Format currency input with dots
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
        const rawValue = e.target.value.replace(/\./g, "")
        if (!/^\d*$/.test(rawValue)) return // Only allow digits

        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        onChange(formatted)
    }

    function onSubmit(values: FormValues) {
        // Clean dots before parsing
        const cleanAmount = parseFloat(values.amount.replace(/\./g, ""))

        const newItem: IncomeItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: values.description,
            amount: cleanAmount,
            date: values.date,
            type: values.type,
            transferToPersonal: values.transferToPersonal,
        }

        if (onSave) {
            onSave(newItem)
        } else {
            // Fallback if no handler (legacy behavior)
            toast.success("Pemasukan berhasil dicatat", {
                description: `Rp ${values.amount} ditambahkan ke catatan.`
            })
        }

        setOpen(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Catat Pemasukan Bisnis</DialogTitle>
                    <DialogDescription>
                        Masukkan detail pendapatan atau omzet baru.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jumlah (Rp)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="0"
                                                className="pl-9"
                                                {...field}
                                                onChange={(e) => handleAmountChange(e, field.onChange)}
                                                value={field.value}
                                                type="text"
                                                inputMode="numeric"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sumber / Keterangan</FormLabel>
                                    <FormControl>
                                        <Input placeholder="cth. Pembayaran Klien A, Penjualan Harian" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Tanggal</FormLabel>
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
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
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
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Tipe Pemasukan</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-row space-x-1"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="gross" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-xs">
                                                        Kotor (Gross)
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="net" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-xs">
                                                        Bersih (Net)
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="transferToPersonal"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-emerald-600" />
                                            Transfer ke Pribadi?
                                        </FormLabel>
                                        <FormDescription>
                                            Otomatis catat ini sebagai pemasukan di dompet pribadi.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" className="w-full">Simpan Pemasukan</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
