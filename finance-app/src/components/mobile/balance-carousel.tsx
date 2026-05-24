"use client";

import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Wallet, Landmark, PiggyBank } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface BalanceCarouselProps {
    totalBalance: number;
    availableBalance: number;
    savingsBalance: number;
}

export function BalanceCarousel({ totalBalance, availableBalance, savingsBalance }: BalanceCarouselProps) {
    const [index, setIndex] = useState(0);

    const cards = [
        { 
            title: "Total Saldo", 
            amount: totalBalance, 
            icon: <Landmark className="w-6 h-6" />, 
            color: "bg-[#2170e4]",
            label: "Seluruh Akun"
        },
        { 
            title: "Saldo Utama", 
            amount: availableBalance, 
            icon: <Wallet className="w-6 h-6" />, 
            color: "bg-[#10b981]",
            label: "Kas & Dompet"
        },
        { 
            title: "Tabungan", 
            amount: savingsBalance, 
            icon: <PiggyBank className="w-6 h-6" />, 
            color: "bg-[#7c3aed]",
            label: "Rekening Bank"
        }
    ];

    // Auto-advance would go here, but user wants manual swipe
    
    const handleDragEnd = (event: any, info: any) => {
        const threshold = 50;
        if (info.offset.x < -threshold && index < cards.length - 1) {
            setIndex(index + 1);
        } else if (info.offset.x > threshold && index > 0) {
            setIndex(index - 1);
        }
    };

    return (
        <section className="relative w-full overflow-visible py-2 select-none touch-none">
            {/* Draggable Container */}
            <div className="relative h-[200px] w-full overflow-hidden rounded-[2rem]">
                <motion.div 
                    className="flex h-full w-full"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    animate={{ x: `-${index * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{ cursor: "grab" }}
                    whileTap={{ cursor: "grabbing" }}
                >
                    {cards.map((card, i) => (
                        <div 
                            key={i} 
                            className="min-w-full h-full p-1"
                        >
                            <div 
                                className={cn(
                                    card.color,
                                    "w-full h-full rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between"
                                )}
                            >
                                {/* Decorative Background Circles */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />

                                <div className="flex justify-between items-start relative z-10 pointer-events-none">
                                    <div className="space-y-1">
                                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{card.title}</p>
                                        <h2 className="text-3xl font-black tabular-nums tracking-tighter">
                                            {formatCurrency(card.amount, true)}
                                        </h2>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        {card.icon}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center relative z-10 pointer-events-none">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="text-xs font-bold text-white/80">{card.label}</span>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(j => (
                                            <div key={j} className="w-6 h-6 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
                {cards.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setIndex(i)}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            i === index ? "bg-primary w-6" : "bg-primary/20 w-1.5"
                        )}
                    />
                ))}
            </div>
        </section>
    );
}
