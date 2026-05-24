"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChartSectionProps {
  // We can pass data here later if we want it truly dynamic
}

export function MobileDashboardChart({}: ChartSectionProps) {
    const [period, setIndex] = useState<"Mingguan" | "Bulanan" | "Tahunan">("Mingguan");

    // Dynamic data sets for different periods
    const chartData: Record<string, { income: number[], expense: number[] }> = {
        "Mingguan": {
            income: [30, 45, 60, 40, 75, 90, 85],
            expense: [20, 35, 40, 30, 50, 60, 55]
        },
        "Bulanan": {
            income: [60, 85, 40, 95],
            expense: [40, 60, 35, 70]
        },
        "Tahunan": {
            income: [40, 60, 80, 90],
            expense: [30, 50, 65, 75]
        }
    };

    const periodLabels: Record<string, string[]> = {
        "Mingguan": ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
        "Bulanan": ["W1", "W2", "W3", "W4"],
        "Tahunan": ["Jan", "Mei", "Sep", "Des"]
    };

    const currentLabels = periodLabels[period];
    const data = chartData[period];

    // Helper to generate SVG path from data array
    const generatePath = (values: number[], height: number, width: number, isArea: boolean = false) => {
        if (values.length === 0) return "";
        const step = width / (values.length - 1);
        
        // Start point
        let d = `M${0},${height - (values[0] / 100 * height)}`;
        
        // Curve points
        for (let i = 0; i < values.length - 1; i++) {
            const x1 = i * step;
            const y1 = height - (values[i] / 100 * height);
            const x2 = (i + 1) * step;
            const y2 = height - (values[i + 1] / 100 * height);
            
            // Bezier curve control points
            const cx = (x1 + x2) / 2;
            d += ` C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
        }

        if (isArea) {
            d += ` L${width},${height} L0,${height} Z`;
        }
        return d;
    };

    const chartWidth = 295; // Adjusted for Y-axis labels
    const chartHeight = 110; // Main chart area height

    return (
        <section className="bg-white dark:bg-slate-800 rounded-xl p-stack-md shadow-sm flex flex-col gap-stack-md animate-entrance delay-400 border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg duration-300">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-[20px] font-bold text-on-background tracking-tight">Analisis Keuangan</h2>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-lg text-on-surface-variant text-[12px] font-bold hover:bg-surface-container active:scale-95 transition-all duration-200 uppercase tracking-wider outline-none">
                            <span>{period}</span>
                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-outline-variant/30 min-w-[120px]">
                        <DropdownMenuItem onClick={() => setIndex("Mingguan")} className="font-bold text-xs uppercase tracking-widest py-3">Mingguan</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIndex("Bulanan")} className="font-bold text-xs uppercase tracking-widest py-3">Bulanan</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIndex("Tahunan")} className="font-bold text-xs uppercase tracking-widest py-3">Tahunan</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            {/* SVG Line Chart */}
            <div className="relative h-48 w-full group cursor-crosshair px-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 140" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="income-gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="expense-gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#0058be" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#0058be" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <g className="opacity-60" stroke="#d3e4fe" strokeWidth="1" strokeDasharray="3 3">
                        <line x1="25" y1="20" x2="320" y2="20" />
                        <line x1="25" y1="55" x2="320" y2="55" />
                        <line x1="25" y1="90" x2="320" y2="90" />
                        <line x1="25" y1="125" x2="320" y2="125" />
                    </g>
                    {/* Y Axis Labels */}
                    <g className="fill-on-surface-variant text-[10px] font-medium" style={{ fontFamily: 'Inter' }}>
                        <text x="0" y="24">6M</text>
                        <text x="0" y="59">4M</text>
                        <text x="0" y="94">2M</text>
                        <text x="0" y="129">0</text>
                    </g>
                    {/* X Axis Labels */}
                    <g className="fill-on-surface-variant text-[10px] font-medium text-center" textAnchor="middle" style={{ fontFamily: 'Inter' }}>
                        {currentLabels.map((label, i) => {
                            const step = (320 - 25) / (currentLabels.length - 1);
                            return (
                                <text key={i} x={25 + (step * i)} y="142">{label}</text>
                            );
                        })}
                    </g>
                    
                    {/* Graph Area */}
                    <g transform="translate(25, 20)">
                        <AnimatePresence mode="wait">
                            <motion.g
                                key={period}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Income */}
                                <path 
                                    d={generatePath(data.income, chartHeight, chartWidth, true)} 
                                    fill="url(#income-gradient)" 
                                />
                                <path 
                                    d={generatePath(data.income, chartHeight, chartWidth, false)} 
                                    fill="none" 
                                    stroke="#10b981" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                />
                                
                                {/* Expense */}
                                <path 
                                    d={generatePath(data.expense, chartHeight, chartWidth, true)} 
                                    fill="url(#expense-gradient)" 
                                />
                                <path 
                                    d={generatePath(data.expense, chartHeight, chartWidth, false)} 
                                    fill="none" 
                                    stroke="#0058be" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                />
                            </motion.g>
                        </AnimatePresence>
                    </g>
                </svg>
            </div>

            <div className="flex justify-between items-center mt-2 border-t border-slate-50 dark:border-slate-700 pt-4 px-1">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-primary-container rounded-full"></span>
                        <span className="text-[10px] font-bold text-on-surface-variant/80 tracking-wide uppercase">Pemasukan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                        <span className="text-[10px] font-bold text-on-surface-variant/80 tracking-wide uppercase">Pengeluaran</span>
                    </div>
                </div>
                <Link href="/mobile/history" className="text-[10px] font-bold text-primary-container hover:text-primary transition-all flex items-center gap-1 group/btn uppercase tracking-widest">
                    Detail <span className="material-symbols-outlined text-[14px] transition-transform group-hover/btn:translate-x-0.5">arrow_forward_ios</span>
                </Link>
            </div>
        </section>
    );
}
