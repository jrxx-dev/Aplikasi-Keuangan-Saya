"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, WifiOff, Activity, TrendingUp } from "lucide-react";
import { pingDatabase, getDatabaseInfo } from "@/lib/actions/database";
import { cn } from "@/lib/utils";

interface DatabaseStatusProps {
    autoRefresh?: boolean;
    refreshInterval?: number;
}

interface LatencyDataPoint {
    timestamp: number;
    latency: number;
}

export function DatabaseStatus({ autoRefresh = true, refreshInterval = 5000 }: DatabaseStatusProps) {
    const [status, setStatus] = useState<{
        status: string;
        latency: number | null;
        timestamp: string;
        error?: string;
    } | null>(null);

    const [dbInfo, setDbInfo] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [latencyHistory, setLatencyHistory] = useState<LatencyDataPoint[]>([]);
    const [animatedHistory, setAnimatedHistory] = useState<LatencyDataPoint[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const MAX_HISTORY = 20; // Keep last 20 data points

    const fetchStatus = async () => {
        setIsRefreshing(true);
        try {
            const result = await pingDatabase();
            setStatus(result);

            // Add to history if we have latency
            if (result.latency !== null) {
                setLatencyHistory(prev => {
                    const newHistory = [...prev, {
                        timestamp: Date.now(),
                        latency: result.latency!
                    }];
                    // Keep only last MAX_HISTORY points
                    return newHistory.slice(-MAX_HISTORY);
                });
            }

            if (result.status === "connected") {
                const info = await getDatabaseInfo();
                if (info.success) {
                    setDbInfo(info.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch database status:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Continuous smooth animation
    useEffect(() => {
        if (latencyHistory.length === 0) return;

        let lastTime = performance.now();

        const animate = (currentTime: number) => {
            const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
            lastTime = currentTime;

            setAnimatedHistory(prev => {
                if (prev.length === 0) return latencyHistory;

                // Smooth interpolation with continuous movement
                const newAnimated = latencyHistory.map((target, index) => {
                    const current = prev[index];
                    if (!current) return target;

                    // Ultra-smooth interpolation
                    const diff = target.latency - current.latency;
                    const speed = 5; // Pixels per second movement speed
                    const step = diff * Math.min(deltaTime * speed, 1);

                    return {
                        timestamp: target.timestamp,
                        latency: current.latency + step
                    };
                });

                return newAnimated;
            });

            // Continue animation forever
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Start continuous animation
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [latencyHistory]);

    // Draw chart
    useEffect(() => {
        const dataToRender = animatedHistory.length > 0 ? animatedHistory : latencyHistory;
        if (!canvasRef.current || dataToRender.length < 2) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Get min/max latency for scaling
        const latencies = dataToRender.map(d => d.latency);
        const minLatency = Math.min(...latencies);
        const maxLatency = Math.max(...latencies);
        const latencyRange = maxLatency - minLatency || 1;

        // Draw grid lines
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
        }

        // Draw Y-axis labels
        ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const latency = maxLatency - (latencyRange / 4) * i;
            const y = padding.top + (chartHeight / 4) * i;
            ctx.fillText(`${Math.round(latency)}ms`, padding.left - 5, y + 3);
        }

        // Helper function to draw smooth curve using Bezier
        const drawSmoothCurve = (points: { x: number; y: number }[], stroke = true) => {
            if (points.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            // Use quadratic curves for smooth transitions
            for (let i = 0; i < points.length - 1; i++) {
                const current = points[i];
                const next = points[i + 1];

                // Calculate control point for smooth curve
                const controlX = (current.x + next.x) / 2;
                const controlY = (current.y + next.y) / 2;

                ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
            }

            // Draw to last point
            const lastPoint = points[points.length - 1];
            ctx.lineTo(lastPoint.x, lastPoint.y);

            if (stroke) {
                ctx.stroke();
            }
        };

        // Prepare points for smooth curve
        const points = dataToRender.map((point, index) => {
            const x = padding.left + (chartWidth / (MAX_HISTORY - 1)) * index;
            const normalizedLatency = (point.latency - minLatency) / latencyRange;
            const y = padding.top + chartHeight - (normalizedLatency * chartHeight);
            return { x, y };
        });

        // Draw smooth line chart
        ctx.strokeStyle = '#10b981'; // emerald-500
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(16, 185, 129, 0.3)';
        ctx.shadowBlur = 8;

        drawSmoothCurve(points, true);

        ctx.shadowBlur = 0; // Reset shadow

        // Draw gradient fill under line
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = gradient;
        drawSmoothCurve(points, false);
        ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.closePath();
        ctx.fill();

        // Draw data points with smooth animation
        ctx.fillStyle = '#10b981';
        points.forEach((point, index) => {
            const x = point.x;
            const y = point.y;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Highlight last point
            if (index === dataToRender.length - 1) {
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        // Draw X-axis label
        ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Time (last 20 pings)', width / 2, height - 5);

    }, [animatedHistory, latencyHistory]);

    useEffect(() => {
        fetchStatus();

        if (autoRefresh) {
            const interval = setInterval(fetchStatus, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval]);

    const isConnected = status?.status === "connected";
    const latencyColor =
        !status?.latency ? "text-gray-500" :
            status.latency < 50 ? "text-emerald-600" :
                status.latency < 150 ? "text-yellow-600" :
                    "text-red-600";

    const avgLatency = latencyHistory.length > 0
        ? Math.round(latencyHistory.reduce((sum, p) => sum + p.latency, 0) / latencyHistory.length)
        : 0;

    return (
        <div className="space-y-4">
            <Card className={cn(
                "p-5 flex items-center gap-4 transition-all",
                isConnected
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
            )}>
                <div className={cn(
                    "p-3 rounded-full text-white transition-all",
                    isConnected ? "bg-emerald-500" : "bg-red-500"
                )}>
                    {isConnected ? (
                        <Database className="w-6 h-6" />
                    ) : (
                        <WifiOff className="w-6 h-6" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Database Status
                        </p>
                        {autoRefresh && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Activity className="w-3 h-3 animate-pulse" />
                                <span>Live</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <h3 className={cn(
                            "text-lg font-bold",
                            isConnected
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-red-700 dark:text-red-400"
                        )}>
                            {isConnected ? "Connected" : "Disconnected"}
                        </h3>
                        {status && status.latency !== null && (
                            <Badge variant="outline" className={cn("font-mono", latencyColor)}>
                                {status.latency}ms
                            </Badge>
                        )}
                        {avgLatency > 0 && (
                            <Badge variant="secondary" className="font-mono text-xs">
                                Avg: {avgLatency}ms
                            </Badge>
                        )}
                    </div>
                    {status?.error && (
                        <p className="text-xs text-red-600 mt-1">{status.error}</p>
                    )}
                    {dbInfo && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {dbInfo.database} • {dbInfo.user}
                        </p>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchStatus}
                    disabled={isRefreshing}
                    className="shrink-0"
                >
                    <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                </Button>
            </Card>

            {/* Real-time Latency Chart */}
            {latencyHistory.length >= 2 && (
                <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 border-emerald-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            Ping Latency History
                        </h4>
                        <Badge variant="outline" className="text-xs">
                            {latencyHistory.length} / {MAX_HISTORY} points
                        </Badge>
                    </div>
                    <div className="relative">
                        <canvas
                            ref={canvasRef}
                            className="w-full"
                            style={{ height: '200px' }}
                        />
                    </div>
                </Card>
            )}

            {dbInfo && (
                <Card className="p-4 bg-muted/30">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Database Information
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span className="font-semibold">{dbInfo.version?.split(' ')[0]}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Database:</span>
                            <span className="font-semibold">{dbInfo.database}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">User:</span>
                            <span className="font-semibold">{dbInfo.user}</span>
                        </div>
                        {status?.timestamp && (
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-muted-foreground">Last Check:</span>
                                <span className="font-semibold">
                                    {new Date(status.timestamp).toLocaleTimeString('id-ID')}
                                </span>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
