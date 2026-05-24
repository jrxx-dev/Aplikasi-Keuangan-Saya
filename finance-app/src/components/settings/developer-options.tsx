"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Database, Shield, Activity, RefreshCw, Zap, Settings,
    Terminal, HardDrive, Trash2, Download, Flag, AlertTriangle, Code
} from "lucide-react";
import {
    testDatabaseConnection,
    testAuthAPI,
    performHealthCheck,
    clearServerCache,
    resetDatabase,
    getEnvironmentInfo,
    getCacheStats
} from "@/lib/actions/developer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DeveloperOptions() {
    const [consoleOutput, setConsoleOutput] = useState<string[]>(["> Ready to test API endpoints..."]);
    const [isLoading, setIsLoading] = useState(false);
    const [envInfo, setEnvInfo] = useState<any>(null);
    const [cacheStats, setCacheStats] = useState<any>(null);

    // Debug settings (stored in localStorage)
    const [debugMode, setDebugMode] = useState(false);
    const [verboseLogging, setVerboseLogging] = useState(false);
    const [performanceMetrics, setPerformanceMetrics] = useState(true);

    // Feature flags (stored in localStorage)
    const [experimentalFeatures, setExperimentalFeatures] = useState(false);
    const [aiAssistant, setAiAssistant] = useState(true);
    const [realtimeSync, setRealtimeSync] = useState(true);
    const [advancedAnalytics, setAdvancedAnalytics] = useState(false);

    useEffect(() => {
        // Load settings from localStorage
        const loadSettings = () => {
            setDebugMode(localStorage.getItem('dev_debugMode') === 'true');
            setVerboseLogging(localStorage.getItem('dev_verboseLogging') === 'true');
            setPerformanceMetrics(localStorage.getItem('dev_performanceMetrics') !== 'false');
            setExperimentalFeatures(localStorage.getItem('dev_experimentalFeatures') === 'true');
            setAiAssistant(localStorage.getItem('dev_aiAssistant') !== 'false');
            setRealtimeSync(localStorage.getItem('dev_realtimeSync') !== 'false');
            setAdvancedAnalytics(localStorage.getItem('dev_advancedAnalytics') === 'true');
        };

        loadSettings();
        fetchEnvInfo();
        fetchCacheStats();

        // Intercept console.log if debug mode is enabled
        if (debugMode) {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;

            console.log = (...args) => {
                originalLog(...args);
                addToConsole(`[LOG] ${args.join(' ')}`);
            };

            console.error = (...args) => {
                originalError(...args);
                addToConsole(`[ERROR] ${args.join(' ')}`);
            };

            console.warn = (...args) => {
                originalWarn(...args);
                addToConsole(`[WARN] ${args.join(' ')}`);
            };

            return () => {
                console.log = originalLog;
                console.error = originalError;
                console.warn = originalWarn;
            };
        }

        // Refresh cache stats every 10 seconds
        const interval = setInterval(fetchCacheStats, 10000);
        return () => clearInterval(interval);
    }, [debugMode]);

    const fetchEnvInfo = async () => {
        const info = await getEnvironmentInfo();
        setEnvInfo(info);
    };

    const fetchCacheStats = async () => {
        const stats = await getCacheStats();
        if (stats.success) {
            setCacheStats(stats);
        }
    };

    const addToConsole = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = `[${timestamp}] ${message}`;
        setConsoleOutput(prev => [...prev, formattedMessage].slice(-50)); // Keep last 50 messages
    };

    const handleTestDB = async () => {
        setIsLoading(true);
        addToConsole("> Testing database connection...");

        const result = await testDatabaseConnection();
        addToConsole(result.message);

        if (result.success) {
            toast.success("Database connection successful", {
                description: `Latency: ${result.latency}ms`
            });
        } else {
            toast.error("Database connection failed", {
                description: result.error
            });
        }

        setIsLoading(false);
    };

    const handleTestAuth = async () => {
        setIsLoading(true);
        addToConsole("> Testing auth API...");

        const result = await testAuthAPI();
        addToConsole(result.message);

        if (result.success) {
            toast.success("Auth API working", {
                description: `${result.userCount} users found`
            });
        } else {
            toast.error("Auth API test failed", {
                description: result.error
            });
        }

        setIsLoading(false);
    };

    const handleHealthCheck = async () => {
        setIsLoading(true);
        addToConsole("> Running health check...");

        const result = await performHealthCheck();
        addToConsole(result.message);

        if (result.success && result.checks) {
            result.checks.forEach((check: any) => {
                addToConsole(`  ${check.name}: ${check.status} ${check.latency ? `(${check.latency}ms)` : check.value ? `(${check.value})` : ''}`);
            });
            toast.success("Health check passed", {
                description: "All systems operational"
            });
        } else {
            toast.error("Health check failed", {
                description: result.error
            });
        }

        setIsLoading(false);
    };

    const handleClearCache = async () => {
        setIsLoading(true);
        addToConsole("> Clearing server cache...");

        const result = await clearServerCache();
        addToConsole(result.message);

        // Also clear browser cache
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            addToConsole("> Browser cache cleared");
        }

        toast.success("Cache cleared", {
            description: "Server and browser cache cleared"
        });

        await fetchCacheStats();
        setIsLoading(false);
    };

    const handleResetDatabase = async () => {
        if (!confirm("⚠️ WARNING: This will delete ALL data in the database. Are you absolutely sure?")) {
            return;
        }

        setIsLoading(true);
        addToConsole("> Resetting database...");

        const result = await resetDatabase();
        addToConsole(result.message);

        if (result.success) {
            toast.success("Database reset", {
                description: "All data has been cleared"
            });
        } else {
            toast.error("Reset failed", {
                description: result.error
            });
        }

        setIsLoading(false);
    };

    const handleDownloadLogs = () => {
        try {
            // Create simple filename with date and time
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-'); // HH-MM-SS
            const filename = `developer-logs-${dateStr}-${timeStr}.txt`;

            // Create log content with header
            const header = [
                '='.repeat(60),
                'DEVELOPER CONSOLE LOGS',
                '='.repeat(60),
                `Generated: ${now.toLocaleString()}`,
                `Environment: ${envInfo?.nodeEnv || 'N/A'}`,
                `Database: ${envInfo?.database || 'N/A'}`,
                `Total Entries: ${consoleOutput.length}`,
                '='.repeat(60),
                '',
                ''
            ].join('\n');

            const logs = consoleOutput.join('\n');
            const fullContent = header + logs;

            // Create and trigger download
            const element = document.createElement('a');
            const file = new Blob([fullContent], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = filename;
            element.click();

            addToConsole(`> Logs downloaded: ${filename}`);
            toast.success("Logs downloaded", {
                description: filename
            });
        } catch (error: any) {
            console.error('Download error:', error);
            addToConsole(`> Download failed: ${error.message}`);
            toast.error("Failed to download logs");
        }
    };

    const handleClearConsole = () => {
        setConsoleOutput(["> Console cleared"]);
        toast.success("Console cleared");
    };

    const updateSetting = (key: string, value: boolean, setter: (v: boolean) => void) => {
        localStorage.setItem(key, String(value));
        setter(value);
        addToConsole(`> Setting updated: ${key.replace('dev_', '')} = ${value}`);
        toast.success("Setting updated", {
            description: `${key.replace('dev_', '')} ${value ? 'enabled' : 'disabled'}`
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Code className="w-8 h-8 text-purple-500" />
                    Developer Options
                </h2>
                <p className="text-muted-foreground">Advanced tools for debugging and development.</p>
            </div>
            <Separator />

            {/* API Testing */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    API Testing
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="justify-start"
                            onClick={handleTestDB}
                            disabled={isLoading}
                        >
                            <Database className="w-4 h-4 mr-2" />
                            Test DB Connection
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start"
                            onClick={handleTestAuth}
                            disabled={isLoading}
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Test Auth API
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start"
                            onClick={handleHealthCheck}
                            disabled={isLoading}
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Health Check
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start"
                            onClick={handleClearCache}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                            Clear All Cache
                        </Button>
                    </div>
                    <div className="p-3 bg-black/90 rounded-lg max-h-40 overflow-y-auto">
                        {consoleOutput.map((line, i) => (
                            <p key={i} className="text-xs font-mono text-green-400">
                                {line}
                            </p>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Environment Variables */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Environment Info
                </h3>
                {envInfo && (
                    <div className="space-y-2 text-sm font-mono">
                        <div className="flex justify-between p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">NODE_ENV:</span>
                            <Badge variant="outline">{envInfo.nodeEnv}</Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">Next.js Version:</span>
                            <Badge variant="outline">{envInfo.nextVersion}</Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">Database:</span>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                                {envInfo.database}
                            </Badge>
                        </div>
                        <div className="flex justify-between p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">Auth Provider:</span>
                            <Badge variant="outline">{envInfo.authProvider}</Badge>
                        </div>
                    </div>
                )}
            </Card>

            {/* Debug Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Console Logs
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Enable Debug Mode</Label>
                            <Switch
                                checked={debugMode}
                                onCheckedChange={(v) => updateSetting('dev_debugMode', v, setDebugMode)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Verbose Logging</Label>
                            <Switch
                                checked={verboseLogging}
                                onCheckedChange={(v) => updateSetting('dev_verboseLogging', v, setVerboseLogging)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Performance Metrics</Label>
                            <Switch
                                checked={performanceMetrics}
                                onCheckedChange={(v) => updateSetting('dev_performanceMetrics', v, setPerformanceMetrics)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleDownloadLogs}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Logs ({consoleOutput.length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleClearConsole}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Console
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        Cache Management
                    </h3>
                    {cacheStats && (
                        <div className="space-y-3">
                            <div className="p-3 bg-muted/50 rounded">
                                <p className="text-xs text-muted-foreground mb-1">Browser Cache</p>
                                <p className="text-lg font-bold">{cacheStats.browserCache.toFixed(2)} MB</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                                <p className="text-xs text-muted-foreground mb-1">API Cache</p>
                                <p className="text-lg font-bold">{cacheStats.apiCache.toFixed(2)} MB</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                                <p className="text-xs text-muted-foreground mb-1">DB Cache Hit Ratio</p>
                                <p className="text-lg font-bold">{cacheStats.dbHitRatio}%</p>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={handleClearCache}
                                disabled={isLoading}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Cache
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Feature Flags */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Feature Flags
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div>
                            <Label>Experimental Features</Label>
                            <p className="text-xs text-muted-foreground">Enable beta features</p>
                        </div>
                        <Switch
                            checked={experimentalFeatures}
                            onCheckedChange={(v) => updateSetting('dev_experimentalFeatures', v, setExperimentalFeatures)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div>
                            <Label>AI Assistant</Label>
                            <p className="text-xs text-muted-foreground">AI-powered insights</p>
                        </div>
                        <Switch
                            checked={aiAssistant}
                            onCheckedChange={(v) => updateSetting('dev_aiAssistant', v, setAiAssistant)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div>
                            <Label>Real-time Sync</Label>
                            <p className="text-xs text-muted-foreground">Live data updates</p>
                        </div>
                        <Switch
                            checked={realtimeSync}
                            onCheckedChange={(v) => updateSetting('dev_realtimeSync', v, setRealtimeSync)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div>
                            <Label>Advanced Analytics</Label>
                            <p className="text-xs text-muted-foreground">Detailed reports</p>
                        </div>
                        <Switch
                            checked={advancedAnalytics}
                            onCheckedChange={(v) => updateSetting('dev_advancedAnalytics', v, setAdvancedAnalytics)}
                        />
                    </div>
                </div>
            </Card>

            {/* Database Tools */}
            <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Zone
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background rounded">
                        <div>
                            <Label className="text-red-700 dark:text-red-400">Reset Database</Label>
                            <p className="text-xs text-muted-foreground">Clear all data and reset to defaults</p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleResetDatabase}
                            disabled={isLoading}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
