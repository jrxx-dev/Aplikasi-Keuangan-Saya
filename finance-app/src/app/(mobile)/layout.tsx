import { ReactNode } from "react";
import { BottomNav } from "@/components/mobile/bottom-nav";

export default function MobileLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 relative overflow-x-hidden">
            <div className="flex-1 overflow-auto">
                {children}
            </div>
            <BottomNav />
        </div>
    );
}
