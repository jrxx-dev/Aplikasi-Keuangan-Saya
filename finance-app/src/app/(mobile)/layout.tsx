import { ReactNode } from "react";
export default function MobileLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 pb-24 relative overflow-x-hidden">
            {children}
        </div>
    );
}
