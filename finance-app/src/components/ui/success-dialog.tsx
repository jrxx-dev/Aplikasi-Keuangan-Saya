"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface SuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string | React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
}

export function SuccessDialog({
    open,
    onOpenChange,
    title = "Berhasil!",
    description = "Data telah berhasil disimpan.",
    actionLabel = "Lanjut",
    onAction
}: SuccessDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm glass-card border-none shadow-2xl flex flex-col items-center justify-center text-center p-8">
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20"
                >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </motion.div>

                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-2">
                    {title}
                </DialogTitle>

                <div className="text-muted-foreground mb-8 w-full text-center">
                    {description}
                </div>

                <Button
                    onClick={() => {
                        if (onAction) onAction();
                        onOpenChange(false);
                    }}
                    className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                >
                    {actionLabel}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
