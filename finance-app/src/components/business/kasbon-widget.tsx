"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeDollarSign, UserCircle2, Clock } from "lucide-react";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { WidgetColorPicker } from "../finance/widget-color-picker";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";

export function KasbonWidget({ data }: { data?: any[] }) {
    const { themes } = useWidgetTheme();
    const theme = themes["kasbon-widget"] || { primary: "#3b82f6", secondary: "#6366f1", accent: "#2563eb" };

    const activeKasbon = (data || []).filter(d => d.type === 'receivable' && d.status === 'unpaid');
    const totalAmount = activeKasbon.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    return (
        <Link href="/business?view=debt" className="block h-full cursor-pointer">
            <Card
                className="h-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg group hover:scale-[1.01] transition-all rounded-3xl relative overflow-hidden"
                style={{
                    borderColor: `${theme.primary}20`,
                }}
            >
                {/* Decorative background pulse */}
                <motion.div
                    className="absolute inset-0 opacity-5 dark:opacity-10"
                    style={{
                        background: `radial-gradient(circle at 70% 30%, ${theme.primary}, transparent 60%)`,
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                <CardHeader className="pb-2 relative z-10">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Kasbon Bisnis (Piutang)</CardTitle>
                        <div className="flex items-center gap-1">
                            <BadgeDollarSign
                                className="h-4 w-4 transition-colors"
                                style={{ color: theme.primary }}
                            />
                            <WidgetColorPicker widgetId="kasbon-widget" widgetName="Kasbon Bisnis" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10">
                    <div className="flex flex-col gap-1">
                        <motion.span
                            className="text-2xl font-black tabular-nums"
                            style={{ color: theme.primary }}
                            suppressHydrationWarning
                        >
                            {formatCurrency(totalAmount, true)}
                        </motion.span>
                        
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex -space-x-2">
                                {activeKasbon.slice(0, 3).map((k, i) => (
                                    <div key={i} className="w-5 h-5 rounded-full border border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <UserCircle2 className="w-3 h-3 text-slate-400" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                {activeKasbon.length > 0 
                                    ? `${activeKasbon.length} Orang Belum Bayar` 
                                    : "Semua Lunas"}
                            </span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-2 text-[10px] font-bold text-muted-foreground flex justify-between items-center relative z-10 mt-auto border-t border-slate-100 dark:border-white/5 py-3">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Update: Baru saja
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-[10px] font-black uppercase tracking-widest hover:bg-transparent transition-all group-hover:translate-x-1"
                        style={{ color: theme.primary }}
                    >
                        Detail <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}
