"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gem, AlertTriangle } from "lucide-react";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { WidgetColorPicker } from "./widget-color-picker";
import { motion } from "framer-motion";
import Link from "next/link";
import { differenceInDays } from "date-fns";

interface PaylaterData {
    totalAmount: number;
    daysUntilDue: number;
    providerCount: number;
}

export function PaylaterWidget({ data }: { data?: any[] }) {
    const { themes } = useWidgetTheme();
    const theme = themes["paylater-widget"];

    // Derived state from props
    const debts = data || [];
    const totalAmount = debts.reduce((sum, d) => sum + (parseFloat(d.currentBalance) || 0), 0);
    const providerCount = debts.length;

    // Find nearest due date
    const now = new Date();
    let daysUntilDue = -1;

    // Filter debts with balance > 0 and valid due date
    const activeDebts = debts.filter(d => (parseFloat(d.currentBalance) || 0) > 0 && d.dueDate);

    if (activeDebts.length > 0) {
        // Sort by due date
        const sorted = [...activeDebts].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const nearest = new Date(sorted[0].dueDate);
        daysUntilDue = differenceInDays(nearest, now);
    }

    const paylaterData: PaylaterData = {
        totalAmount,
        daysUntilDue,
        providerCount
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(val);

    return (
        <Link href="/paylater" className="block h-full cursor-pointer">
            <Card
                className="h-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg group hover:scale-[1.01] transition-all rounded-3xl relative overflow-hidden"
                style={{
                    borderColor: `${theme.primary}20`,
                }}
            >
                {/* Pulsing warning background */}
                <motion.div
                    className="absolute inset-0 opacity-5 dark:opacity-10"
                    style={{
                        background: `radial-gradient(circle at 70% 30%, ${theme.primary}, transparent 60%)`,
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.2, 0.05],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Alert wave effect */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(circle at center, ${theme.secondary}40, transparent 70%)`,
                    }}
                    animate={{
                        scale: [0.8, 1.5],
                        opacity: [0.3, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                    }}
                />

                <CardHeader className="pb-2 relative z-10">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tagihan Paylater</CardTitle>
                        <div className="flex items-center gap-1">
                            <motion.div
                                animate={{
                                    rotate: [0, -5, 5, 0],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                }}
                            >
                                <Gem
                                    className="h-4 w-4 transition-colors"
                                    style={{ color: theme.primary }}
                                />
                            </motion.div>
                            <WidgetColorPicker widgetId="paylater-widget" widgetName="Tagihan Paylater" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="flex flex-col gap-1">
                        <motion.span
                            className="text-2xl font-bold"
                            style={{ color: theme.primary }}
                            animate={{
                                scale: [1, 1.02, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                            }}
                            suppressHydrationWarning
                        >
                            {formatCurrency(paylaterData.totalAmount)}
                        </motion.span>
                        <motion.span
                            className="text-xs font-medium"
                            style={{ color: theme.accent }}
                            animate={{
                                opacity: [0.7, 1, 0.7],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                            }}
                            suppressHydrationWarning
                        >
                            {paylaterData.daysUntilDue > 0
                                ? `Jatuh Tempo: ${paylaterData.daysUntilDue} Hari Lagi`
                                : paylaterData.daysUntilDue === 0
                                    ? "Jatuh Tempo Hari Ini!"
                                    : paylaterData.daysUntilDue < -1 // If negative but legitimate
                                        ? `Lewat ${Math.abs(paylaterData.daysUntilDue)} Hari`
                                        : "Tidak ada tagihan segera"}
                        </motion.span>
                    </div>
                </CardContent>
                <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between items-center relative z-10 mt-auto">
                    <span suppressHydrationWarning>{paylaterData.providerCount} Provider Aktif</span>
                    <div className="flex gap-2">
                        {paylaterData.daysUntilDue <= 7 && paylaterData.daysUntilDue > -100 && ( // reasonable range
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                }}
                            >
                                <AlertTriangle
                                    className="w-4 h-4"
                                    style={{ color: theme.primary }}
                                />
                            </motion.div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent transition-colors"
                            style={{
                                color: theme.primary,
                            }}
                        >
                            Bayar <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
