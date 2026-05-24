"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDatabaseMetrics } from "@/lib/actions/database";
import { Database, Activity, HardDrive, Zap, TrendingUp, AlertCircle } from "lucide-react";

interface DatabaseMetricsProps {
    refreshInterval?: number;
}

export function DatabaseMetrics({ refreshInterval = 5000 }: DatabaseMetricsProps) {
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMetrics = async () => {
        try {
            const result = await getDatabaseMetrics();
            if (result.success) {
                setMetrics(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-4 animate-pulse">
                        <div className="h-20 bg-muted rounded" />
                    </Card>
                ))}
            </div>
        );
    }

    const getCacheColor = (ratio: number) => {
        if (ratio >= 95) return "text-emerald-600";
        if (ratio >= 80) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Connections */}
            <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                        Live
                    </Badge>
                </div>
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Connections
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                            {metrics?.activeConnections || 0}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                            / {metrics?.totalConnections || 0}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Active / Total
                    </p>
                </div>
            </Card>

            {/* Database Size */}
            <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <HardDrive className="w-5 h-5 text-purple-600" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                        Live
                    </Badge>
                </div>
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Database Size
                    </p>
                    <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {metrics?.sizeMB || 0} MB
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {((metrics?.sizeBytes || 0) / 1024).toFixed(2)} KB
                    </p>
                </div>
            </Card>

            {/* Cache Hit Ratio */}
            <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Zap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                        Live
                    </Badge>
                </div>
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Cache Hit Ratio
                    </p>
                    <h3 className={`text-2xl font-bold ${getCacheColor(metrics?.cacheHitRatio || 0)}`}>
                        {metrics?.cacheHitRatio || 0}%
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {metrics?.cacheHitRatio >= 95 ? "Excellent" : metrics?.cacheHitRatio >= 80 ? "Good" : "Poor"}
                    </p>
                </div>
            </Card>

            {/* Transactions */}
            <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                        Live
                    </Badge>
                </div>
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Transactions
                    </p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Commits:</span>
                            <span className="text-sm font-bold text-emerald-600">
                                {(metrics?.commits || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Rollbacks:</span>
                            <span className="text-sm font-bold text-red-600">
                                {(metrics?.rollbacks || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
