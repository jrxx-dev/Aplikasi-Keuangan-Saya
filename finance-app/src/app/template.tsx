"use client";

import { useState, useEffect } from "react";
import { LoadingCar } from "@/components/ui/loading-car";
import { motion, AnimatePresence } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
    const [isDriving, setIsDriving] = useState(true);

    useEffect(() => {
        // Force the animation to play for at least 1.5 seconds on every page mount
        const timer = setTimeout(() => {
            setIsDriving(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full min-h-screen">
            <AnimatePresence mode="wait">
                {isDriving ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-50 bg-slate-50 dark:bg-zinc-950 flex items-center justify-center"
                    >
                        <LoadingCar />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
