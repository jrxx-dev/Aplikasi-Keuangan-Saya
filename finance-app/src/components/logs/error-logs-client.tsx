"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    AlertCircle,
    AlertTriangle,
    Info,
    Download,
    Search,
    RefreshCw,
    XCircle,
    CheckCircle2,
    Clock,
    Activity,
    Calendar,
    BarChart3,
    Eye,
    Check,
    X,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DatabaseLog {
    id: string;
    userId: string | null;
    level: "info" | "warning" | "error" | "success";
    action: string;
    message: string;
    metadata: any;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    resolved: boolean;
    resolvedAt: Date | null;
    resolvedBy: string | null;
}

interface ErrorLogsClientProps {
    initialLogs: DatabaseLog[];
}

export function ErrorLogsClient({ initialLogs = [] }: ErrorLogsClientProps) {
    const router = useRouter();
    const [logs, setLogs] = useState<DatabaseLog[]>(initialLogs);
    const [filteredLogs, setFilteredLogs] = useState<DatabaseLog[]>(initialLogs);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "error" | "warning" | "info" | "success" | "unresolved" | "terminal">("all");
    const [selectedLog, setSelectedLog] = useState<DatabaseLog | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setLogs(initialLogs);
    }, [initialLogs]);

    useEffect(() => {
        let filtered = logs;

        // Filter by tab
        if (activeTab === "unresolved") {
            filtered = filtered.filter(log => !log.resolved);
        } else if (activeTab !== "all") {
            filtered = filtered.filter(log => log.level === activeTab);
        }

        // Filter by search
        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredLogs(filtered);
    }, [logs, activeTab, searchTerm]);

    const handleMarkAsResolved = async (logId: string) => {
        setIsResolving(true);
        try {
            const response = await fetch("/api/resolve-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ logId, action: "resolve" })
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Log marked as resolved");
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to mark log as resolved");
        }
        setIsResolving(false);
    };

    const handleMarkAsUnresolved = async (logId: string) => {
        setIsResolving(true);
        try {
            const response = await fetch("/api/resolve-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ logId, action: "unresolve" })
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Log marked as unresolved");
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to mark log as unresolved");
        }
        setIsResolving(false);
    };

    const refreshLogs = () => {
        router.refresh();
        toast.success("Logs refreshed successfully");
    };

    const exportLogs = () => {
        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `logs-${new Date().toISOString()}.json`;
        link.click();
        toast.success("Logs exported successfully");
    };

    // AI Analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const analyzeLogsWithAI = async () => {
        setIsAnalyzing(true);
        setShowAnalysis(true);

        try {
            // Prepare error logs for analysis
            const errorLogs = logs
                .filter(log => log.level === 'error' || log.level === 'warning')
                .slice(0, 20) // Analyze last 20 errors/warnings
                .map(log => ({
                    action: log.action,
                    message: log.message,
                    level: log.level,
                    time: log.createdAt
                }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: `Analyze these application error logs and provide:
1. Summary of main issues
2. Root causes
3. Recommended solutions
4. Priority order for fixing

Logs:
${JSON.stringify(errorLogs, null, 2)}

Please provide a clear, structured analysis in Indonesian.`
                    }]
                })
            });

            if (!response.ok) throw new Error('Failed to analyze');

            // Handle streaming response
            if (response.headers.get("Content-Type")?.includes("application/json")) {
                const data = await response.json();
                setAiAnalysis(data.content);
            } else {
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let fullContent = "";

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed || trimmed === 'data: [DONE]') continue;

                            if (trimmed.startsWith('data: ')) {
                                try {
                                    const json = JSON.parse(trimmed.slice(6));
                                    const content = json.choices?.[0]?.delta?.content || "";
                                    fullContent += content;
                                    setAiAnalysis(fullContent); // Update in real-time
                                } catch (e) {
                                    console.error("Error parsing SSE JSON", e);
                                }
                            }
                        }
                    }
                }
            }

            toast.success("Analysis complete");
        } catch (error) {
            console.error("AI Analysis failed:", error);
            toast.error("Failed to analyze logs");
            setAiAnalysis("Gagal menganalisis logs. Silakan coba lagi.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getLevelConfig = (level: string) => {
        switch (level) {
            case "error":
                return {
                    icon: XCircle,
                    bg: "bg-red-50 dark:bg-red-950/20",
                    border: "border-red-200 dark:border-red-800",
                    iconBg: "bg-red-500",
                    text: "text-red-700 dark:text-red-300",
                    badgeBg: "bg-red-100 dark:bg-red-900/30",
                    badgeText: "text-red-700 dark:text-red-300"
                };
            case "warning":
                return {
                    icon: AlertTriangle,
                    bg: "bg-amber-50 dark:bg-amber-950/20",
                    border: "border-amber-200 dark:border-amber-800",
                    iconBg: "bg-amber-500",
                    text: "text-amber-700 dark:text-amber-300",
                    badgeBg: "bg-amber-100 dark:bg-amber-900/30",
                    badgeText: "text-amber-700 dark:text-amber-300"
                };
            case "info":
                return {
                    icon: Info,
                    bg: "bg-blue-50 dark:bg-blue-950/20",
                    border: "border-blue-200 dark:border-blue-800",
                    iconBg: "bg-blue-500",
                    text: "text-blue-700 dark:text-blue-300",
                    badgeBg: "bg-blue-100 dark:bg-blue-900/30",
                    badgeText: "text-blue-700 dark:text-blue-300"
                };
            case "success":
                return {
                    icon: CheckCircle2,
                    bg: "bg-emerald-50 dark:bg-emerald-950/20",
                    border: "border-emerald-200 dark:border-emerald-800",
                    iconBg: "bg-emerald-500",
                    text: "text-emerald-700 dark:text-emerald-300",
                    badgeBg: "bg-emerald-100 dark:bg-emerald-900/30",
                    badgeText: "text-emerald-700 dark:text-emerald-300"
                };
            default:
                return {
                    icon: AlertCircle,
                    bg: "bg-slate-50 dark:bg-slate-950/20",
                    border: "border-slate-200 dark:border-slate-800",
                    iconBg: "bg-slate-500",
                    text: "text-slate-700 dark:text-slate-300",
                    badgeBg: "bg-slate-100 dark:bg-slate-900/30",
                    badgeText: "text-slate-700 dark:text-slate-300"
                };
        }
    };

    const formatTimestamp = (timestamp: Date | string) => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }).format(date);
    };

    const getRelativeTime = (timestamp: Date | string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} hari lalu`;
        if (hours > 0) return `${hours} jam lalu`;
        if (minutes > 0) return `${minutes} menit lalu`;
        return `${seconds} detik lalu`;
    };

    // Format action name to be more user-friendly
    const formatActionName = (action: string): string => {
        // Map of technical names to user-friendly names
        const actionMap: Record<string, string> = {
            'terminal_stdout': '📟 Terminal Output',
            'terminal_stderr': '⚠️ Terminal Error',
            'create_transaction': '💰 Buat Transaksi',
            'update_transaction': '✏️ Update Transaksi',
            'delete_transaction': '🗑️ Hapus Transaksi',
            'create_account': '🏦 Buat Akun',
            'update_account': '✏️ Update Akun',
            'delete_account': '🗑️ Hapus Akun',
            'user_login': '🔐 Login User',
            'user_logout': '👋 Logout User',
            'user_register': '👤 Registrasi User',
            'api_error': '🔴 API Error',
            'database_error': '💾 Database Error',
            'network_error': '🌐 Network Error',
            'build_error': '🔨 Build Error',
            'system_error': '⚙️ System Error',
        };

        // Check if we have a mapping
        if (actionMap[action]) {
            return actionMap[action];
        }

        // If starts with terminal_, format it nicely
        if (action.startsWith('terminal_')) {
            const type = action.replace('terminal_', '');
            return `📟 Terminal ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        }

        // Convert snake_case to Title Case with emoji
        const formatted = action
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Add emoji based on action type
        if (action.includes('create')) return `➕ ${formatted}`;
        if (action.includes('update')) return `✏️ ${formatted}`;
        if (action.includes('delete')) return `🗑️ ${formatted}`;
        if (action.includes('error')) return `❌ ${formatted}`;
        if (action.includes('success')) return `✅ ${formatted}`;
        if (action.includes('warning')) return `⚠️ ${formatted}`;

        return formatted;
    };

    // Parse error message to extract meaningful information
    const parseErrorMessage = (message: string) => {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(message);

            if (parsed.errno) {
                // File system error
                const errorCodes: Record<number, string> = {
                    '-4058': 'File Not Found',
                    '-4048': 'Address Already in Use',
                    '-4075': 'Permission Denied',
                    '-4082': 'Directory Not Empty'
                };

                const errorName = errorCodes[parsed.errno] || `Error ${parsed.errno}`;
                const errorCode = parsed.code || 'UNKNOWN';
                const syscall = parsed.syscall || 'operation';
                const path = parsed.path || 'unknown path';

                return {
                    title: `${errorName} (${errorCode})`,
                    description: `Failed to ${syscall}`,
                    details: `Path: ${path}`,
                    type: 'filesystem',
                    severity: 'error'
                };
            }

            // Generic JSON error
            return {
                title: 'Error Occurred',
                description: JSON.stringify(parsed, null, 2),
                details: null,
                type: 'json',
                severity: 'error'
            };
        } catch {
            // Not JSON, check for common patterns

            // Build error pattern
            if (message.includes('Compiled') && message.includes('error')) {
                const match = message.match(/(\d+)\s*error/);
                const errorCount = match ? match[1] : 'multiple';
                return {
                    title: `Build Failed`,
                    description: `${errorCount} compilation error(s) detected`,
                    details: message,
                    type: 'build',
                    severity: 'error'
                };
            }

            // Network error
            if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
                return {
                    title: 'Network Error',
                    description: 'Failed to connect to server or API',
                    details: message,
                    type: 'network',
                    severity: 'warning'
                };
            }

            // Database error
            if (message.toLowerCase().includes('database') || message.toLowerCase().includes('sql')) {
                return {
                    title: 'Database Error',
                    description: 'Database operation failed',
                    details: message,
                    type: 'database',
                    severity: 'error'
                };
            }

            // Default: return as-is
            return {
                title: message.substring(0, 100),
                description: message.length > 100 ? message.substring(100) : null,
                details: null,
                type: 'generic',
                severity: 'info'
            };
        }
    };

    const errorCount = logs.filter(l => l.level === "error").length;
    const warningCount = logs.filter(l => l.level === "warning").length;
    const infoCount = logs.filter(l => l.level === "info").length;
    const successCount = logs.filter(l => l.level === "success").length;
    const unresolvedCount = logs.filter(l => !l.resolved).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="container max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 shadow-xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity className="w-8 h-8 text-white" />
                                    <h1 className="text-4xl font-bold text-white">Application Logs</h1>
                                </div>
                                <p className="text-white/90 text-lg">Monitor all application activities in real-time</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={analyzeLogsWithAI}
                                    variant="default"
                                    size="lg"
                                    disabled={isAnalyzing || errorCount + warningCount === 0}
                                    className="bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    {isAnalyzing ? "Analyzing..." : "AI Analysis"}
                                </Button>
                                <Button onClick={refreshLogs} variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                                    <RefreshCw className="w-5 h-5 mr-2" />
                                    Refresh
                                </Button>
                                <Button onClick={exportLogs} variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                                    <Download className="w-5 h-5 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Control Panel - Stats + Search + Tabs */}
                <div className="sticky top-0 z-20 mb-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                            {/* Stats Row - Compact Horizontal */}
                            <div className="grid grid-cols-5 gap-2">
                                {[
                                    { label: "TOTAL", value: logs.length, icon: BarChart3, color: "text-slate-600", bgColor: "bg-slate-50 dark:bg-slate-800/50" },
                                    { label: "UNRESOLVED", value: unresolvedCount, icon: AlertCircle, color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
                                    { label: "ERRORS", value: errorCount, icon: XCircle, color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" },
                                    { label: "WARNINGS", value: warningCount, icon: AlertTriangle, color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
                                    { label: "SUCCESS", value: successCount, icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" }
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${stat.bgColor} border border-slate-200 dark:border-slate-700 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <stat.icon className={`w-4 h-4 ${stat.color} flex-shrink-0`} />
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{stat.label}</p>
                                        </div>
                                        <p className={`text-xl font-bold ${stat.color} leading-none`}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search logs by action or message..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            {/* Tabs */}
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                <TabsList className="w-full grid grid-cols-7 bg-slate-100 dark:bg-slate-800/50 p-1 h-auto">
                                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                                    <TabsTrigger value="unresolved" className="text-xs data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 dark:data-[state=active]:bg-orange-950/30 dark:data-[state=active]:text-orange-400">Unresolved</TabsTrigger>
                                    <TabsTrigger value="terminal" className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-green-400">Terminal</TabsTrigger>
                                    <TabsTrigger value="error" className="text-xs">Errors</TabsTrigger>
                                    <TabsTrigger value="warning" className="text-xs">Warnings</TabsTrigger>
                                    <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
                                    <TabsTrigger value="success" className="text-xs">Success</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Terminal View */}
                {activeTab === "terminal" ? (
                    <Card className="border-slate-800 bg-[#0c0c0c] shadow-2xl overflow-hidden ring-1 ring-white/10">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <span className="ml-3 text-xs font-mono text-slate-400">server-logs — node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-white/10 text-slate-400 text-[10px] h-5">bash</Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={refreshLogs}>
                                    <RefreshCw className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="h-[600px] w-full p-4 font-mono text-sm">
                            <div className="space-y-1">
                                {logs.filter(l => l.action.startsWith('terminal_') || l.userAgent === 'System/Terminal').length === 0 ? (
                                    <div className="text-slate-500 italic px-2">No terminal output recorded yet...</div>
                                ) : (
                                    logs
                                        .filter(l => l.action.startsWith('terminal_') || l.userAgent === 'System/Terminal')
                                        .map((log, i) => (
                                            <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1 rounded group">
                                                <span className="text-slate-600 select-none shrink-0 w-[140px] text-[11px] pt-0.5">
                                                    {formatTimestamp(log.createdAt)}
                                                </span>
                                                <div className="break-all whitespace-pre-wrap">
                                                    <span className={
                                                        log.level === 'error' ? 'text-red-400' :
                                                            log.level === 'warning' ? 'text-yellow-400' :
                                                                log.message.includes('ready') || log.message.includes('success') ? 'text-green-400' :
                                                                    'text-slate-300'
                                                    }>
                                                        {log.message.includes('[LOG]')
                                                            ? log.message.replace('[LOG]', '')
                                                            : log.message}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                )}
                                <div className="flex gap-2 animate-pulse mt-2">
                                    <span className="text-green-500">➜</span>
                                    <span className="text-blue-400">~</span>
                                    <span className="text-slate-500">_</span>
                                </div>
                            </div>
                        </ScrollArea>
                    </Card>
                ) : (
                    /* Standard Lists View */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Logs List - Scrollable */}
                        <ScrollArea className="lg:col-span-2 h-[calc(100vh-400px)]">
                            <div className="space-y-3 pr-4">
                                {filteredLogs.length === 0 ? (
                                    <Card className="border-slate-200 dark:border-slate-800">
                                        <CardContent className="p-12 text-center">
                                            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No logs found</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {searchTerm ? "Try a different search term" : "No activity recorded yet"}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <AnimatePresence>
                                        {filteredLogs.map((log, index) => {
                                            const config = getLevelConfig(log.level);
                                            const Icon = config.icon;
                                            return (
                                                <motion.div
                                                    key={log.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    onClick={() => setSelectedLog(log)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${config.bg} ${config.border} ${selectedLog?.id === log.id
                                                        ? "ring-2 ring-slate-400 dark:ring-slate-600"
                                                        : "hover:shadow-md"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-2.5">
                                                        <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                                                            <Icon className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <span className={`text-sm font-medium ${config.text}`}>
                                                                    {formatActionName(log.action)}
                                                                </span>
                                                                {log.resolved ? (
                                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                                        <Check className="w-3 h-3 mr-1" />
                                                                        Resolved
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                                                        <X className="w-3 h-3 mr-1" />
                                                                        Unresolved
                                                                    </Badge>
                                                                )}
                                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {isMounted ? getRelativeTime(log.createdAt) : "Loading..."}
                                                                </span>
                                                            </div>
                                                            {(() => {
                                                                const parsed = parseErrorMessage(log.message);
                                                                return (
                                                                    <>
                                                                        <p className="text-sm text-slate-900 dark:text-white font-semibold mb-1">
                                                                            {parsed.title}
                                                                        </p>
                                                                        {parsed.description && (
                                                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                                {parsed.description}
                                                                            </p>
                                                                        )}
                                                                        {parsed.details && (
                                                                            <p className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded mt-1 truncate">
                                                                                {parsed.details}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {isMounted ? formatTimestamp(log.createdAt) : "Loading..."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Details Sidebar - Scrollable */}
                        <ScrollArea className="h-[calc(100vh-400px)]">
                            <div className="lg:sticky lg:top-6 lg:h-fit">
                                <Card className="border-slate-200 dark:border-slate-800">
                                    <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                                        <CardTitle className="text-base font-medium flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            Log Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {selectedLog ? (
                                            <div className="space-y-4">
                                                {/* Status & Action Buttons */}
                                                <div className={`p-4 rounded-lg ${getLevelConfig(selectedLog.level).bg} border ${getLevelConfig(selectedLog.level).border}`}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-full ${getLevelConfig(selectedLog.level).iconBg} flex items-center justify-center`}>
                                                                {(() => {
                                                                    const Icon = getLevelConfig(selectedLog.level).icon;
                                                                    return <Icon className="w-5 h-5 text-white" />;
                                                                })()}
                                                            </div>
                                                            <Badge className={getLevelConfig(selectedLog.level).badgeBg + " " + getLevelConfig(selectedLog.level).badgeText}>
                                                                {selectedLog.level.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {selectedLog.resolved ? (
                                                        <div className="space-y-2">
                                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 w-full justify-center py-2">
                                                                <Check className="w-4 h-4 mr-2" />
                                                                Resolved
                                                            </Badge>
                                                            {selectedLog.resolvedAt && (
                                                                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                                                                    {formatTimestamp(selectedLog.resolvedAt)}
                                                                </p>
                                                            )}
                                                            <Button
                                                                onClick={() => handleMarkAsUnresolved(selectedLog.id)}
                                                                disabled={isResolving}
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full"
                                                            >
                                                                <X className="w-4 h-4 mr-2" />
                                                                Mark as Unresolved
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleMarkAsResolved(selectedLog.id)}
                                                            disabled={isResolving}
                                                            className="w-full bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Mark as Resolved
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Timestamp</p>
                                                        <p className="text-sm text-slate-900 dark:text-white">{formatTimestamp(selectedLog.createdAt)}</p>
                                                        <p className="text-xs text-slate-500">{getRelativeTime(selectedLog.createdAt)}</p>
                                                    </div>

                                                    <Separator />

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Action</p>
                                                        <Badge variant="outline">{formatActionName(selectedLog.action)}</Badge>
                                                    </div>

                                                    <Separator />

                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500 uppercase mb-2">Error Details</p>
                                                        {(() => {
                                                            const parsed = parseErrorMessage(selectedLog.message);
                                                            return (
                                                                <div className="space-y-3">
                                                                    {/* Error Type Badge */}
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className="capitalize">
                                                                            {parsed.type} Error
                                                                        </Badge>
                                                                        <Badge
                                                                            className={
                                                                                parsed.severity === 'error'
                                                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                                                    : parsed.severity === 'warning'
                                                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                                            }
                                                                        >
                                                                            {parsed.severity}
                                                                        </Badge>
                                                                    </div>

                                                                    {/* Title */}
                                                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                                                        <p className="text-xs font-medium text-slate-500 mb-1">What Happened</p>
                                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                            {parsed.title}
                                                                        </p>
                                                                    </div>

                                                                    {/* Description */}
                                                                    {parsed.description && (
                                                                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                                                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Explanation</p>
                                                                            <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">
                                                                                {parsed.description}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {/* Details/Path */}
                                                                    {parsed.details && (
                                                                        <div className="bg-slate-900 dark:bg-slate-950 p-3 rounded-lg border border-slate-700">
                                                                            <p className="text-xs font-medium text-slate-400 mb-2">Technical Details</p>
                                                                            <p className="text-xs font-mono text-green-400 break-all">
                                                                                {parsed.details}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {/* Original Message (collapsed) */}
                                                                    <details className="group">
                                                                        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-2">
                                                                            <span className="group-open:rotate-90 transition-transform">▶</span>
                                                                            View Raw Message
                                                                        </summary>
                                                                        <div className="mt-2 bg-slate-900 dark:bg-slate-950 p-3 rounded-lg">
                                                                            <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                                                                                {selectedLog.message}
                                                                            </pre>
                                                                        </div>
                                                                    </details>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>

                                                    {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                                        <>
                                                            <Separator />
                                                            <div>
                                                                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Metadata</p>
                                                                <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3">
                                                                    <pre className="text-xs text-green-400 overflow-x-auto">
                                                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    {selectedLog.ipAddress && (
                                                        <>
                                                            <Separator />
                                                            <div>
                                                                <p className="text-xs font-medium text-slate-500 uppercase mb-1">IP Address</p>
                                                                <Badge variant="outline" className="font-mono">{selectedLog.ipAddress}</Badge>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Eye className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Select a log</h3>
                                                <p className="text-xs text-slate-500">Click on any log to view details</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </div>

            {/* AI Analysis Dialog */}
            < Dialog open={showAnalysis} onOpenChange={setShowAnalysis} >
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                            AI Log Analysis
                        </DialogTitle>
                        <DialogDescription>
                            Intelligent analysis of your error logs with recommendations
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4">
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                    <Sparkles className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                                    Analyzing your logs...
                                </p>
                                <p className="text-sm text-slate-500">
                                    AI is reviewing {errorCount + warningCount} error(s) and warning(s)
                                </p>
                            </div>
                        ) : aiAnalysis ? (
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                        <div className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">
                                            {aiAnalysis}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
                                        💡 Note
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        This analysis is generated by AI and should be used as a guide.
                                        Always verify recommendations before implementing changes.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600 dark:text-slate-400">
                                    No analysis available
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog >
        </div >
    );
}
