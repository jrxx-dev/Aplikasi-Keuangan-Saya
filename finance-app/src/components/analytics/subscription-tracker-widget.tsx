"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Repeat, Music, Youtube, Zap, Wifi } from "lucide-react";

interface Subscription {
    id: string;
    name: string;
    amount: number;
    date: number;
    icon: any;
    type: string;
}

export function SubscriptionTrackerWidget({ subscriptions = [] }: { subscriptions?: Subscription[] }) {
    // Fallback Dummy Data
    const displaySubs = subscriptions.length > 0 ? subscriptions : [
        { id: "1", name: "Netflix Premium", amount: 186000, date: 5, icon: <Youtube className="w-4 h-4 text-red-500" />, type: "Entertainment" },
        { id: "2", name: "Spotify Family", amount: 89000, date: 12, icon: <Music className="w-4 h-4 text-green-500" />, type: "Entertainment" },
        { id: "3", name: "Listrik Token", amount: 500000, date: 1, icon: <Zap className="w-4 h-4 text-yellow-500" />, type: "Utility" },
        { id: "4", name: "WiFi Indihome", amount: 350000, date: 20, icon: <Wifi className="w-4 h-4 text-blue-500" />, type: "Utility" },
    ];

    const totalFixedCost = displaySubs.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-blue-500" />
                    Tagihan Rutin
                </CardTitle>
                <CardDescription>
                    Total: <span className="font-bold text-foreground">Rp {new Intl.NumberFormat('id-ID').format(totalFixedCost)}</span> /bulan
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {displaySubs.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-zinc-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                                {sub.icon}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{sub.name}</p>
                                <p className="text-[10px] text-muted-foreground">Tagihan tgl {sub.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm">Rp {new Intl.NumberFormat('id-ID').format(sub.amount)}</p>
                            <Badge variant="outline" className="text-[9px] h-4 px-1">{sub.type}</Badge>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
