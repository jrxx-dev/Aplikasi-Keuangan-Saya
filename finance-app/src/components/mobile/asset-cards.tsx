"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface AssetCardsProps {
    savings: number;
    wallet: number;
    investments: number;
    target: number;
    targetLabel: string;
    targetProgress: number;
}

export function AssetCards({ savings, wallet, investments, target, targetLabel, targetProgress }: AssetCardsProps) {
    const assets = [
        { label: "Tabungan", value: savings, icon: "account_balance_wallet", color: "text-emerald-500", detail: "Bank Central", trend: "+1.2%", bgColor: "bg-emerald-500/5" },
        { label: "E-Wallet", value: wallet, icon: "account_balance", color: "text-blue-500", detail: "G-Pay", trend: "+5.4%", bgColor: "bg-blue-500/5" },
        { label: "Investasi", value: investments, icon: "trending_up", color: "text-orange-500", detail: "Stocks", trend: "-0.8%", bgColor: "bg-orange-500/5" },
        { label: "Target", value: target, icon: "track_changes", color: "text-emerald-500", detail: targetLabel, trend: `${targetProgress}%`, bgColor: "bg-emerald-500/5" },
    ];

    return (
        <section className="grid grid-cols-2 gap-stack-md animate-entrance delay-200">
            {assets.map((asset, i) => (
                <motion.div
                    key={i}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-surface-variant flex flex-col gap-1 transition-all shadow-sm hover:shadow-lg relative overflow-hidden cursor-pointer"
                >
                    <div className={asset.bgColor + " absolute top-0 right-0 w-8 h-8 rounded-bl-full"} />
                    <div className={asset.color + " flex items-center gap-1 mb-1"}>
                        <span className="material-symbols-outlined text-[16px]">{asset.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{asset.label}</span>
                    </div>
                    <span className="text-[16px] font-bold text-on-background">{formatCurrency(asset.value, true)}</span>
                    <div className="flex items-center justify-between mt-1">
                        <span className={"text-[10px] font-bold " + (asset.trend.startsWith('-') ? 'text-rose-500' : 'text-emerald-500')}>
                            {asset.trend}
                        </span>
                        <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">{asset.detail}</span>
                    </div>
                </motion.div>
            ))}
        </section>
    );
}
