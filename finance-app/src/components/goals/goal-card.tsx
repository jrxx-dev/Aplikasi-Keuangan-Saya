"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Target, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { updateGoalAmount, deleteGoal } from "@/lib/actions/goals";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

interface Goal {
    id: string;
    name: string;
    currentAmount: string;
    targetAmount: string;
    deadline: Date | null;
    icon: string | null;
    color: string | null;
}

interface GoalCardProps {
    goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
    const current = parseFloat(goal.currentAmount);
    const target = parseFloat(goal.targetAmount);
    const percentage = Math.min(100, (current / target) * 100);
    const timeLeft = goal.deadline ? Math.max(0, differenceInDays(new Date(goal.deadline), new Date())) : null;

    const [addAmount, setAddAmount] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleAddFunds = async () => {
        const amount = parseFloat(addAmount);
        if (isNaN(amount) || amount <= 0) return;

        try {
            await updateGoalAmount(goal.id, amount);
            toast.success("Berhasil menambahkan dana!");
            setIsOpen(false);
            setAddAmount("");
        } catch (error) {
            toast.error("Gagal menambahkan dana");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteGoal(goal.id);
            toast.success("Target dihapus");
        } catch (error) {
            toast.error("Gagal menghapus target");
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full"
        >
            <Card className="h-full flex flex-col justify-between overflow-hidden relative border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/40 backdrop-blur-md">
                <div className={`absolute top-0 left-0 w-1 h-full bg-${goal.color || 'blue'}-500`} />

                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl bg-${goal.color || 'blue'}-500/10 text-${goal.color || 'blue'}-500`}>
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">{goal.name}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Target: {formatCurrency(target)}
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
                            <span>{percentage.toFixed(0)}%</span>
                            <span className="text-muted-foreground">{formatCurrency(current)}</span>
                        </div>
                        <Progress value={percentage} className={`h-2.5 bg-zinc-100 dark:bg-zinc-800 [&>div]:bg-${goal.color || 'blue'}-500`} />
                    </div>

                    {timeLeft !== null && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-zinc-100/50 dark:bg-zinc-800/30 p-2 rounded-lg">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{timeLeft} hari lagi ({goal.deadline?.toLocaleDateString('id-ID', { dateStyle: 'medium' })})</span>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-0">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity">
                                <Plus className="w-4 h-4 mr-2" /> Tambah Dana
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Alokasi Dana ke {goal.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Jumlah (Rp)</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={addAmount}
                                        onChange={(e) => setAddAmount(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleAddFunds} className="w-full">Simpan</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
