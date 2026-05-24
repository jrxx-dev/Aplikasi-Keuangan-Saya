"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ArrowRightLeft, MoreHorizontal } from "lucide-react";
import { TransactionDialog } from "./transaction-dialog";
import { useState } from "react";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { WidgetColorPicker } from "./widget-color-picker";
import { motion } from "framer-motion";

export function QuickActions() {
    const [openType, setOpenType] = useState<"income" | "expense" | null>(null);
    const { themes } = useWidgetTheme();
    const theme = themes["quick-actions"];

    return (
        <Card
            className="h-full text-white border-none shadow-lg group hover:scale-[1.01] transition-all rounded-3xl relative overflow-hidden"
            style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
            }}
        >
            {/* Animated background pattern */}
            <motion.div
                className="absolute top-0 right-0 p-4 opacity-10"
                animate={{
                    rotate: [12, 20, 12],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <MoreHorizontal className="w-24 h-24" />
            </motion.div>

            {/* Floating orbs */}
            <motion.div
                className="absolute w-32 h-32 rounded-full opacity-20"
                style={{
                    background: `radial-gradient(circle, ${theme.secondary}, transparent)`,
                    top: "-10%",
                    left: "-10%",
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="absolute w-24 h-24 rounded-full opacity-20"
                style={{
                    background: `radial-gradient(circle, ${theme.secondary}, transparent)`,
                    bottom: "-5%",
                    right: "-5%",
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                }}
            />

            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-white">Aksi Cepat</CardTitle>
                        <CardDescription className="text-white/80">Catat transaksi baru.</CardDescription>
                    </div>
                    <WidgetColorPicker widgetId="quick-actions" widgetName="Aksi Cepat" />
                </div>
            </CardHeader>
            <CardContent className="grid gap-2 relative z-10">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        variant="secondary"
                        className="w-full justify-start hover:bg-white/20 bg-white/10 text-white border-0"
                        size="sm"
                        onClick={() => setOpenType("income")}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Pemasukan
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        variant="secondary"
                        className="w-full justify-start hover:bg-white/20 bg-white/10 text-white border-0"
                        size="sm"
                        onClick={() => setOpenType("expense")}
                    >
                        <Minus className="w-4 h-4 mr-2" /> Pengeluaran
                    </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        variant="secondary"
                        className="w-full justify-start hover:bg-white/20 bg-white/10 text-white border-0"
                        size="sm"
                    >
                        <ArrowRightLeft className="w-4 h-4 mr-2" /> Transfer
                    </Button>
                </motion.div>
            </CardContent>

            <TransactionDialog
                open={openType === "income"}
                onOpenChange={(open) => !open && setOpenType(null)}
                type="income"
            />
            <TransactionDialog
                open={openType === "expense"}
                onOpenChange={(open) => !open && setOpenType(null)}
                type="expense"
            />
        </Card>
    );
}
