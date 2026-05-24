"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Goal {
    id: string;
    name: string;
    target: number;
    current: number;
    color: string;
    icon: string;
}

export function GoalsTrackerWidget({ goals = [] }: { goals?: Goal[] }) {
    // Fallback to dummy if empty
    const displayGoals = goals.length > 0 ? goals : [
        { id: "1", name: "Dana Darurat", target: 50000000, current: 35000000, color: "bg-emerald-500", icon: "🛡️" },
        { id: "2", name: "Liburan Jepang", target: 25000000, current: 8500000, color: "bg-blue-500", icon: "✈️" },
        { id: "3", name: "Upgrade Laptop", target: 30000000, current: 12000000, color: "bg-purple-500", icon: "💻" },
    ];

    return (
        <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" />
                    Goals & Dreams
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayGoals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium flex items-center gap-2">
                                <span>{goal.icon}</span> {goal.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {Math.round((goal.current / goal.target) * 100)}%
                            </span>
                        </div>
                        <div className="relative">
                            <Progress value={(goal.current / goal.target) * 100} className="h-2.5" indicatorColor={goal.color} />
                            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-medium">
                                <span>Rp {(goal.current / 1000000).toFixed(1)}jt</span>
                                <span>Rp {(goal.target / 1000000).toFixed(0)}jt</span>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
