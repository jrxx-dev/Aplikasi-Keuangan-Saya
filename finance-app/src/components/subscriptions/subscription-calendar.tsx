"use client";

import { DayPicker } from "react-day-picker";
import { id } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useState } from "react";
import { format, isSameDay } from "date-fns";

interface Subscription {
    id: string;
    name: string;
    cost: string;
    nextPaymentDate: Date;
    provider: string | null;
    billingCycle: string;
}

export function SubscriptionCalendar({ subscriptions }: { subscriptions: Subscription[] }) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Map dates to subscriptions for highlighting
    const modifiers = {
        paymentDay: (date: Date) => subscriptions.some(s => isSameDay(new Date(s.nextPaymentDate), date)),
    };

    const modifiersStyles = {
        paymentDay: {
            fontWeight: "bold",
            backgroundColor: "var(--purple-500)",
            color: "white",
            borderRadius: "50%"
        }
    };

    // Get subs for selected date
    const selectedSubs = subscriptions.filter(s =>
        selectedDate && isSameDay(new Date(s.nextPaymentDate), selectedDate)
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Kalender Tagihan</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex justify-center md:justify-start">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-800">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={id}
                            modifiers={modifiers}
                            modifiersClassNames={{
                                paymentDay: "bg-purple-600 text-white font-bold hover:bg-purple-700"
                            }}
                            styles={{
                                caption: { textTransform: 'capitalize' }
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-zinc-900 dark:to-black border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>{selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: id }) : "Pilih Tanggal"}</span>
                        <span className="text-xs font-normal text-muted-foreground bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                            {selectedSubs.length} Tagihan
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedSubs.length > 0 ? (
                        <div className="space-y-4">
                            {selectedSubs.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xs uppercase">
                                            {sub.provider?.[0] || sub.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{sub.name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{sub.billingCycle}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-purple-600">
                                        {formatCurrency(parseFloat(sub.cost))}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-sm opacity-60">
                            <p>Tidak ada tagihan pada tanggal ini.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
