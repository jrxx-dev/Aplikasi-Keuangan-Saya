"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Trash2, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { updateDebtBalance, deleteDebt } from "@/lib/actions/debts";
import { toast } from "sonner";
import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";

interface Debt {
    id: string;
    name: string;
    provider: string | null;
    limitAmount: string; // The total loan amount or limit
    currentBalance: string; // How much is currently OWE
    dueDate: Date | null;
    color: string | null;
}

interface DebtCardProps {
    debt: Debt;
}

export function DebtCard({ debt }: DebtCardProps) {
    const limit = parseFloat(debt.limitAmount);
    const balance = parseFloat(debt.currentBalance);
    // Percentage of limit used (or percentage of loan remaining)
    // If it's a loan, limit might be original amount. If credit card, limit is credit limit.
    // For general debt tracking: Balance / Limit * 100
    const percentage = limit > 0 ? Math.min(100, (balance / limit) * 100) : 0;

    const daysLeft = debt.dueDate ? differenceInDays(new Date(debt.dueDate), new Date()) : null;
    const isOverdue = daysLeft !== null && daysLeft < 0;

    const [payAmount, setPayAmount] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handlePayment = async () => {
        const amount = parseFloat(payAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            // New balance = Old balance - Payment
            const newBalance = Math.max(0, balance - amount);
            await updateDebtBalance(debt.id, newBalance);
            toast.success("Pembayaran dicatat!");
            setIsOpen(false);
            setPayAmount("");
        } catch (error) {
            toast.error("Gagal mencatat pembayaran");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDebt(debt.id);
            toast.success("Hutang dihapus");
        } catch (error) {
            toast.error("Gagal menghapus hutang");
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full"
        >
            <Card className="h-full flex flex-col justify-between overflow-hidden relative border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/40 backdrop-blur-md">
                <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    isOverdue ? "bg-red-600" : `bg-${debt.color || 'red'}-500`
                )} />

                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2.5 rounded-xl",
                                isOverdue ? "bg-red-100 text-red-600 dark:bg-red-900/20" : `bg-${debt.color || 'red'}-500/10 text-${debt.color || 'red'}-500`
                            )}>
                                {debt.provider ? <CreditCardIcon className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold truncate max-w-[150px]">{debt.name}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {debt.provider || "Personal Loan"}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 h-8 w-8" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-4">
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Sisa Utang</span>
                            <span className="text-red-500 font-bold">{formatCurrency(balance)}</span>
                        </div>
                        <Progress value={percentage} className={cn(
                            "h-2.5 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-red-500",
                            percentage < 30 && "[&>div]:bg-emerald-500",
                            percentage > 70 && "[&>div]:bg-red-600"
                        )} />
                        {limit > 0 && (
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>0%</span>
                                <span>Limit: {formatCurrency(limit)}</span>
                            </div>
                        )}
                    </div>

                    {debt.dueDate && (
                        <div className={cn(
                            "flex items-center gap-2 text-xs p-2 rounded-lg",
                            isOverdue ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-zinc-100/50 dark:bg-zinc-800/30 text-muted-foreground"
                        )}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                                {isOverdue ? `Telat ${Math.abs(daysLeft || 0)} hari!` : `${daysLeft} hari lagi (${format(debt.dueDate, 'dd MMM')})`}
                            </span>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-0">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity">
                                <RefreshCw className="w-4 h-4 mr-2" /> Catat Pembayaran
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bayar Cicilan {debt.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Jumlah Pembayaran (Rp)</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Sisa utang akan berkurang sebesar jumlah ini.</p>
                                </div>
                                <Button onClick={handlePayment} className="w-full">Simpan Pembayaran</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

function CreditCardIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}
