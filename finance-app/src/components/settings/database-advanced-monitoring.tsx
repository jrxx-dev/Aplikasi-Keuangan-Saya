"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getQueryPerformance, getTableStatistics, getSystemHealth } from "@/lib/actions/database";
import {
    Zap,
    Table2,
    Shield,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Lock,
    Database
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DatabaseAdvancedMonitoring() {
    const [queryPerf, setQueryPerf] = useState<any>(null);
    const [tableStats, setTableStats] = useState<any>(null);
    const [systemHealth, setSystemHealth] = useState<any>(null);

    const fetchQueryPerformance = async () => {
        const result = await getQueryPerformance();
        if (result.success) {
            setQueryPerf(result.data);
        }
    };

    const fetchTableStatistics = async () => {
        const result = await getTableStatistics();
        if (result.success) {
            setTableStats(result.data);
        }
    };

    const fetchSystemHealth = async () => {
        const result = await getSystemHealth();
        if (result.success) {
            setSystemHealth(result.data);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchQueryPerformance();
        fetchTableStatistics();
        fetchSystemHealth();

        // Set up intervals with different refresh rates
        const queryInterval = setInterval(fetchQueryPerformance, 15000); // 15 seconds
        const tableInterval = setInterval(fetchTableStatistics, 30000); // 30 seconds
        const healthInterval = setInterval(fetchSystemHealth, 60000); // 60 seconds

        return () => {
            clearInterval(queryInterval);
            clearInterval(tableInterval);
            clearInterval(healthInterval);
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* System Health Overview */}
            <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    System Health
                    <Badge variant="outline" className="text-xs ml-2">
                        Updates every 60s
                    </Badge>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Database Role */}
                    <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Database className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                    Database Role
                                </p>
                                <p className="text-lg font-bold text-blue-700 dark:text-blue-400 capitalize">
                                    {systemHealth?.role || 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Active Locks */}
                    <Card className={cn(
                        "p-4 bg-gradient-to-br border transition-all",
                        (systemHealth?.activeLocks || 0) > 0
                            ? "from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
                            : "from-emerald-500/10 to-green-500/10 border-emerald-500/20"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-lg",
                                (systemHealth?.activeLocks || 0) > 0
                                    ? "bg-yellow-500/20"
                                    : "bg-emerald-500/20"
                            )}>
                                <Lock className={cn(
                                    "w-5 h-5",
                                    (systemHealth?.activeLocks || 0) > 0
                                        ? "text-yellow-600"
                                        : "text-emerald-600"
                                )} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                    Active Locks
                                </p>
                                <p className={cn(
                                    "text-lg font-bold",
                                    (systemHealth?.activeLocks || 0) > 0
                                        ? "text-yellow-700 dark:text-yellow-400"
                                        : "text-emerald-700 dark:text-emerald-400"
                                )}>
                                    {systemHealth?.activeLocks || 0}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Vacuum Status */}
                    <Card className={cn(
                        "p-4 bg-gradient-to-br border transition-all",
                        systemHealth?.needsVacuum
                            ? "from-red-500/10 to-pink-500/10 border-red-500/20"
                            : "from-emerald-500/10 to-green-500/10 border-emerald-500/20"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-lg",
                                systemHealth?.needsVacuum
                                    ? "bg-red-500/20"
                                    : "bg-emerald-500/20"
                            )}>
                                {systemHealth?.needsVacuum ? (
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                    Vacuum Status
                                </p>
                                <p className={cn(
                                    "text-sm font-bold",
                                    systemHealth?.needsVacuum
                                        ? "text-red-700 dark:text-red-400"
                                        : "text-emerald-700 dark:text-emerald-400"
                                )}>
                                    {systemHealth?.needsVacuum ? "Needs Vacuum" : "Healthy"}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Query Performance */}
            <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Query Performance
                    <Badge variant="outline" className="text-xs ml-2">
                        Updates every 15s
                    </Badge>
                </h3>

                <Card className="p-4 bg-muted/30">
                    {queryPerf?.totalQueries > 0 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 pb-4 border-b">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Total Queries</p>
                                    <p className="text-2xl font-bold">{queryPerf.totalQueries}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Total Calls</p>
                                    <p className="text-2xl font-bold">{queryPerf.totalCalls.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Avg Time</p>
                                    <p className="text-2xl font-bold">{queryPerf.avgTime}ms</p>
                                </div>
                            </div>

                            {queryPerf.slowQueries?.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                        Slow Queries ({">"} 100ms)
                                    </p>
                                    <div className="space-y-2">
                                        {queryPerf.slowQueries.slice(0, 3).map((q: any, i: number) => (
                                            <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {Math.round(q.mean_exec_time)}ms avg
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {q.calls} calls
                                                    </span>
                                                </div>
                                                <p className="text-xs font-mono text-muted-foreground truncate">
                                                    {q.query?.substring(0, 100)}...
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Query statistics not available</p>
                            <p className="text-xs mt-1">pg_stat_statements extension may not be enabled</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Table Statistics */}
            <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Table2 className="w-4 h-4" />
                    Table Statistics
                    <Badge variant="outline" className="text-xs ml-2">
                        Updates every 30s
                    </Badge>
                </h3>

                <Card className="p-4 bg-muted/30">
                    {tableStats && tableStats.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3 font-semibold">Table</th>
                                        <th className="text-right py-2 px-3 font-semibold">Rows</th>
                                        <th className="text-right py-2 px-3 font-semibold">Dead Rows</th>
                                        <th className="text-right py-2 px-3 font-semibold">Size</th>
                                        <th className="text-right py-2 px-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableStats.slice(0, 8).map((table: any, i: number) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-2 px-3 font-mono text-xs">
                                                {table.tablename}
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono">
                                                {Number(table.row_count || 0).toLocaleString()}
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                <span className={cn(
                                                    "font-mono",
                                                    Number(table.dead_rows || 0) > 1000
                                                        ? "text-amber-600 font-bold"
                                                        : "text-muted-foreground"
                                                )}>
                                                    {Number(table.dead_rows || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono text-xs">
                                                {table.size || 'N/A'}
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                {Number(table.dead_rows || 0) > 1000 ? (
                                                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/20">
                                                        Needs Vacuum
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                                                        Healthy
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Table2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Loading table statistics...</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
