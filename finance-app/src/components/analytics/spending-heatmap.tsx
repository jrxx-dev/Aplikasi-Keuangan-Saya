"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CalendarDays, Info } from "lucide-react";
import { motion } from "framer-motion";

const getColor = (intensity: number) => {
    switch (intensity) {
        case 0: return "bg-slate-100 dark:bg-zinc-800/50";
        case 1: return "bg-emerald-200 dark:bg-emerald-900/40";
        case 2: return "bg-emerald-400 dark:bg-emerald-700/60";
        case 3: return "bg-amber-400 dark:bg-amber-600/80";
        case 4: return "bg-rose-500 dark:bg-rose-600";
        default: return "bg-slate-100";
    }
};

const getLabel = (intensity: number) => {
    switch (intensity) {
        case 0: return "Tidak ada pengeluaran";
        case 1: return "Pengeluaran Rendah";
        case 2: return "Pengeluaran Normal";
        case 3: return "Pengeluaran Tinggi";
        case 4: return "Pengeluaran Ekstrem";
        default: return "";
    }
};

// Helper to get normalized intensity (0-4) based on amount relative to max
const getIntensity = (amount: number, max: number) => {
    if (amount === 0) return 0;
    if (max === 0) return 0;
    const ratio = amount / max;
    if (ratio < 0.2) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.8) return 3;
    return 4;
};

export function SpendingHeatmap({ data }: { data?: { day: string, amount: number }[] }) {
    const today = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    // Find max spending to normalize intensity
    const maxSpending = data?.reduce((max, d) => Math.max(max, d.amount), 0) || 1;

    // Map data to full month array
    const heatmapData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const record = data?.find(d => d.day === day.toString());
        const amount = record ? record.amount : 0;

        // Don't show future days unless debug
        const intensity = day > today ? 0 : getIntensity(amount, maxSpending);

        return { day, intensity, amount };
    });

    return (
        <Card className="border-none shadow-lg bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-indigo-500" />
                            Intensitas Belanja Harian
                        </CardTitle>
                        <CardDescription>Pola pengeluaran harian real-time</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    {/* Heatmap Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium mb-1">
                                {d}
                            </div>
                        ))}

                        <TooltipProvider>
                            {heatmapData.map((d, i) => (
                                <Tooltip key={i} delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: i * 0.01 }}
                                            className={cn(
                                                "aspect-square rounded-md cursor-pointer transition-all hover:ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900",
                                                getColor(d.intensity)
                                            )}
                                        >
                                            <div className="w-full h-full flex items-center justify-center text-[9px] font-medium text-slate-900/50 dark:text-white/50 opacity-0 hover:opacity-100">
                                                {d.day}
                                            </div>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-xs text-center">
                                            <p className="font-bold">Tanggal {d.day}</p>
                                            <p className="text-muted-foreground">{getLabel(d.intensity)}</p>
                                            {d.amount > 0 && <p className="font-mono mt-1">Rp {d.amount.toLocaleString('id-ID')}</p>}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground mt-2">
                        <span>Hemat</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-zinc-800/50"></div>
                            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/40"></div>
                            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700/60"></div>
                            <div className="w-3 h-3 rounded-sm bg-amber-400 dark:bg-amber-600/80"></div>
                            <div className="w-3 h-3 rounded-sm bg-rose-500 dark:bg-rose-600"></div>
                        </div>
                        <span>Boros</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
