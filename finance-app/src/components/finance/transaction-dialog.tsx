"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "./transaction-form";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

interface TransactionDialogProps {
    trigger?: React.ReactNode;
    defaultType?: "income" | "expense" | "transfer";
    // Support controlled state
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    // Alias for convenience
    type?: "income" | "expense" | "transfer";
}

export function TransactionDialog({ trigger, defaultType, type, open: controlledOpen, onOpenChange: setControlledOpen }: TransactionDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen;

    // Prioritize 'type' prop if consistent with QuickActions, else defaultType
    const effectiveType = type || defaultType;

    const handleOpenChange = (newOpen: boolean) => {
        if (setOpen) {
            setOpen(newOpen);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            {!trigger && !isControlled && (
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Transaction
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {effectiveType ? `Add ${effectiveType.charAt(0).toUpperCase() + effectiveType.slice(1)}` : "Add Transaction"}
                    </DialogTitle>
                    <DialogDescription>
                        Record a new {effectiveType || "transaction"}.
                    </DialogDescription>
                </DialogHeader>
                <TransactionForm onClose={() => handleOpenChange(false)} defaultType={effectiveType} />
            </DialogContent>
        </Dialog>
    );
}
