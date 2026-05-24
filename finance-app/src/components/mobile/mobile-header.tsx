"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface MobileHeaderProps {
    title?: string;
    rightAction?: "notification" | "search" | "close" | "none";
    leftAction?: "menu" | "back" | "close" | "none";
    onRightClick?: () => void;
    onLeftClick?: () => void;
    children?: ReactNode;
    className?: string;
}

export function MobileHeader({ 
    title, 
    rightAction = "notification", 
    leftAction = "none", 
    onRightClick, 
    onLeftClick, 
    children, 
    className 
}: MobileHeaderProps) {
    const router = useRouter();
    
    const defaultOnLeft = () => {
        if (leftAction === "back" || leftAction === "close") {
            router.back();
        }
    };

    return (
        <header className={cn(
            "bg-white/70 dark:bg-on-background/70 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 border-b border-surface-variant/30 shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all duration-300",
            className
        )}>
            <div className="flex items-center justify-between px-6 h-18 w-full max-w-md mx-auto">
                {/* Left Action */}
                <div className="w-12 flex items-center justify-start">
                    {leftAction !== "none" && (
                        <button 
                            onClick={onLeftClick || defaultOnLeft} 
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/40 active:scale-90 transition-all duration-200"
                        >
                            <span className="material-symbols-outlined text-[26px] text-on-surface" style={{ fontVariationSettings: "'wght' 400" }}>
                                {leftAction === "menu" ? "menu" : leftAction === "back" ? "arrow_back_ios_new" : "close"}
                            </span>
                        </button>
                    )}
                </div>

                {/* Center Content / Title */}
                <div className="flex-1 flex justify-center items-center overflow-hidden px-2">
                    {children ? children : (
                        <h1 className="font-black text-[18px] text-on-surface dark:text-slate-100 truncate tracking-tight uppercase tracking-[0.05em]">
                            {title}
                        </h1>
                    )}
                </div>

                {/* Right Action */}
                <div className="w-12 flex items-center justify-end">
                    {rightAction !== "none" && (
                        <button 
                            onClick={onRightClick} 
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/40 active:scale-90 transition-all duration-200 relative"
                        >
                            <span className="material-symbols-outlined text-[26px] text-on-surface" style={{ fontVariationSettings: "'wght' 400" }}>
                                {rightAction === "notification" ? "notifications" : rightAction === "search" ? "search" : "close"}
                            </span>
                            {rightAction === "notification" && (
                                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
