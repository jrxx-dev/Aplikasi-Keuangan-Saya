"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { Activity, Calculator } from "lucide-react";

export function DebtCalculator() {
    const [loanAmount, setLoanAmount] = useState(10000000);
    const [interestRate, setInterestRate] = useState(12); // Annual %
    const [months, setMonths] = useState(12);

    const monthlyInterest = (interestRate / 100) / 12;
    // Cicilan = (P * i) / (1 - (1 + i)^-n)
    const monthlyPaymentRaw = (loanAmount * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -months));
    const monthlyPayment = isNaN(monthlyPaymentRaw) ? 0 : monthlyPaymentRaw;
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;

    return (
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-500" />
                    <CardTitle>Simulasi Cicilan</CardTitle>
                </div>
                <CardDescription>Estimasikan beban bunga sebelum berutang.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Pokok Pinjaman</Label>
                        <span className="font-bold text-indigo-500">{formatCurrency(loanAmount)}</span>
                    </div>
                    <Slider
                        value={[loanAmount]}
                        max={100000000}
                        step={500000}
                        onValueChange={(vals) => setLoanAmount(vals[0])}
                        className="[&>.relative>.absolute]:bg-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Bunga per Tahun (%)</Label>
                        <Input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Tenor (Bulan)</Label>
                        <Input
                            type="number"
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="bg-zinc-100 dark:bg-black/40 p-4 rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Cicilan per Bulan</span>
                        <span className="text-xl font-black">{formatCurrency(monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Total Bunga Dibayar</span>
                        <span className="text-red-500 font-medium">+{formatCurrency(totalInterest)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-muted-foreground">Total Pengembalian</span>
                        <span className="font-bold">{formatCurrency(totalPayment)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
