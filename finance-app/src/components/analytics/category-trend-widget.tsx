"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { TrendingUp } from "lucide-react";

interface TrendData {
    month: string;
    [key: string]: string | number;
}

export function CategoryTrendWidget({ data = [], categories = [] }: { data?: TrendData[], categories?: string[] }) {
    // Determine initial category
    const initialCategory = categories.length > 0 ? categories[0] : "food";
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    // Fallback Dummy Data
    const displayData = data.length > 0 ? data : [
        { month: 'Sep', food: 2500000, transport: 1200000, shopping: 800000 },
        { month: 'Okt', food: 2300000, transport: 1300000, shopping: 1500000 },
        { month: 'Nov', food: 2800000, transport: 1250000, shopping: 500000 },
        { month: 'Des', food: 3200000, transport: 1400000, shopping: 2000000 },
        { month: 'Jan', food: 2100000, transport: 1100000, shopping: 900000 },
        { month: 'Feb', food: 2400000, transport: 1350000, shopping: 1200000 },
    ];

    // Available categories for dropdown
    const displayCategories = categories.length > 0 ? categories : ["food", "transport", "shopping"];

    const getCategoryName = (key: string) => {
        switch (key) {
            case 'food': return 'Makanan & Minuman';
            case 'transport': return 'Transportasi';
            case 'shopping': return 'Belanja';
            default: return key;
        }
    };

    const getColor = (key: string) => {
        switch (key) {
            case 'food': return '#f43f5e'; // rose-500
            case 'transport': return '#3b82f6'; // blue-500
            case 'shopping': return '#8b5cf6'; // violet-500
            default: return '#64748b';
        }
    };

    return (
        <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Tren Kategori
                    </CardTitle>
                    <CardDescription>Analisis history pengeluaran</CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {displayCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={displayData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={getColor(selectedCategory)} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={getColor(selectedCategory)} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => [`Rp ${(value / 1000).toFixed(0)}k`, getCategoryName(selectedCategory)]}
                            />
                            <Area
                                type="monotone"
                                dataKey={selectedCategory}
                                stroke={getColor(selectedCategory)}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                    Rata-rata: <span className="font-bold text-foreground">Rp {(displayData.reduce((a, b) => a + (Number(b[selectedCategory]) || 0), 0) / displayData.length / 1000).toFixed(0)}k</span> /bulan
                </div>
            </CardContent>
        </Card>
    );
}
