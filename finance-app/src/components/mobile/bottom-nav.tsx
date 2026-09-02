"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, Plus, History, LayoutDashboard, ReceiptText } from "lucide-react";
import { motion } from "framer-motion";

function BottomNavBase() {
    const pathname = usePathname();

    // Only show on paths starting with /mobile
    if (!pathname.startsWith("/mobile")) return null;

    const navItems = [
        {
            href: "/mobile/dashboard",
            label: "Beranda",
            icon: LayoutDashboard,
            activePaths: ["/mobile/dashboard"]
        },
        {
            href: "/mobile/input",
            label: "Tambah",
            icon: Plus,
            isFAB: true,
            activePaths: ["/mobile/input"]
        },
        {
            href: "/mobile/history",
            label: "Riwayat",
            icon: ReceiptText,
            activePaths: ["/mobile/history"]
        }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[10000] px-6 pb-6 pointer-events-none">
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/40 dark:border-white/5 flex items-center justify-around h-20 w-full max-w-md mx-auto pointer-events-auto relative px-4 ring-1 ring-black/5"
            >
                {navItems.map((item) => {
                    const isActive = item.activePaths.some(p => pathname === p);
                    const Icon = item.icon;

                    if (item.isFAB) {
                        return (
                            <div key={item.href} className="relative flex justify-center w-20">
                            {/* @ts-ignore prefetch="intent" is supported in Next.js 15+ */}
                            <Link
                                    href={item.href}
                                    // @ts-ignore
                                    prefetch="intent"
                                    className="absolute -top-12 flex flex-col items-center gap-2 group outline-none"
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center shadow-[0_15px_30px_-5px_rgba(var(--primary-rgb),0.4)] transition-all duration-300",
                                            "bg-gradient-to-br from-primary via-primary to-indigo-600 text-white",
                                            "ring-4 ring-white dark:ring-slate-900"
                                        )}>
                                        <motion.div
                                            initial={{ opacity: 1, scale: 1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <Icon className="w-8 h-8 stroke-[2.5px]" />
                                        </motion.div>
                                    </motion.div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
                                        isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                    )}>
                                        {item.label}
                                    </span>
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            // @ts-ignore - prefetch="intent" is supported by Next.js at runtime
                            prefetch="intent"
                            className={cn(
                                "flex flex-col items-center justify-center w-1/3 transition-all outline-none gap-1.5 py-2 rounded-2xl",
                                isActive ? "text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn(
                                    "w-6 h-6 transition-all duration-300",
                                    isActive ? "stroke-[2.5px] scale-110" : "stroke-[1.8px]"
                                )} />
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute -inset-2 bg-primary/10 dark:bg-primary/20 rounded-xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold tracking-tight transition-all duration-300",
                                isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-0"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </motion.div>
        </nav>
    );
}

export const BottomNav = React.memo(BottomNavBase);
