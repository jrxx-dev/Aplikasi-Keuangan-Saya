"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, RotateCcw, Sparkles } from "lucide-react";
import { useWidgetTheme } from "@/contexts/widget-theme-context";
import { motion } from "framer-motion";

export function WidgetThemeMenu() {
    const { resetAllThemes } = useWidgetTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-white/10 hover:scale-105 transition-all"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Palette className="w-4 h-4" />
                    </motion.div>
                    <span className="hidden sm:inline">Tema Widget</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Kustomisasi Tema
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm text-muted-foreground cursor-default">
                    Klik ikon <Palette className="w-3 h-3 mx-1 inline" /> pada setiap widget untuk mengubah warna
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={resetAllThemes}
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset Semua Warna
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
