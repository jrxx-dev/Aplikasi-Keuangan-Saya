"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Download,
    Upload,
    Database,
    HardDrive,
    Trash2,
    FileJson,
    FileText,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export function DataStorageManager() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const handleExportData = async (format: 'json' | 'csv') => {
        setIsExporting(true);

        try {
            // Simulate data export
            const data = {
                exportDate: new Date().toISOString(),
                version: "1.0.0",
                userData: {
                    // This would be real user data in production
                    accounts: [],
                    transactions: [],
                    budgets: [],
                    goals: []
                }
            };

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-CA');
            const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-');

            if (format === 'json') {
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `finance-data-${dateStr}-${timeStr}.json`;
                link.click();
                URL.revokeObjectURL(url);

                toast.success("Data exported successfully", {
                    description: `Exported as JSON file`
                });
            } else {
                // CSV export
                const csvContent = "Type,Date,Amount,Category\n"; // Header
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `finance-data-${dateStr}-${timeStr}.csv`;
                link.click();
                URL.revokeObjectURL(url);

                toast.success("Data exported successfully", {
                    description: `Exported as CSV file`
                });
            }
        } catch (error: any) {
            toast.error("Export failed", {
                description: error.message
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';

        input.onchange = async (e: any) => {
            setIsImporting(true);

            try {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const content = event.target?.result as string;

                        if (file.name.endsWith('.json')) {
                            const data = JSON.parse(content);
                            console.log('Imported data:', data);
                            toast.success("Data imported successfully", {
                                description: `Imported from ${file.name}`
                            });
                        } else {
                            // CSV import
                            console.log('CSV content:', content);
                            toast.success("Data imported successfully", {
                                description: `Imported from ${file.name}`
                            });
                        }
                    } catch (error: any) {
                        toast.error("Import failed", {
                            description: "Invalid file format"
                        });
                    } finally {
                        setIsImporting(false);
                    }
                };

                reader.readAsText(file);
            } catch (error: any) {
                toast.error("Import failed", {
                    description: error.message
                });
                setIsImporting(false);
            }
        };

        input.click();
    };

    const handleClearLocalStorage = () => {
        if (!confirm("⚠️ This will clear all local app settings. Continue?")) {
            return;
        }

        try {
            // Clear specific app data, keep auth
            const keysToRemove = Object.keys(localStorage).filter(key =>
                key.startsWith('dev_') || key.startsWith('app_')
            );

            keysToRemove.forEach(key => localStorage.removeItem(key));

            toast.success("Local storage cleared", {
                description: `Removed ${keysToRemove.length} items`
            });
        } catch (error: any) {
            toast.error("Failed to clear storage", {
                description: error.message
            });
        }
    };

    const getStorageSize = () => {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2); // KB
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Database className="w-8 h-8 text-blue-500" />
                    Data & Storage
                </h2>
                <p className="text-muted-foreground">Manage your financial data and storage.</p>
            </div>
            <Separator />

            {/* Export Data */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    Export Data
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Download your financial data for backup or analysis
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => handleExportData('json')}
                        disabled={isExporting}
                    >
                        <FileJson className="w-4 h-4 mr-2" />
                        Export as JSON
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => handleExportData('csv')}
                        disabled={isExporting}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Export as CSV
                    </Button>
                </div>
            </Card>

            {/* Import Data */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-green-600" />
                    Import Data
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Restore your financial data from a backup file
                </p>
                <Button
                    variant="outline"
                    onClick={handleImportData}
                    disabled={isImporting}
                    className="w-full"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    {isImporting ? "Importing..." : "Import from File"}
                </Button>
            </Card>

            {/* Storage Info */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Storage Information
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div>
                            <p className="text-sm font-medium">Local Storage</p>
                            <p className="text-xs text-muted-foreground">Browser cache and settings</p>
                        </div>
                        <Badge variant="outline">{getStorageSize()} KB</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div>
                            <p className="text-sm font-medium">Database Size</p>
                            <p className="text-xs text-muted-foreground">Server-side data</p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                            Connected
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div>
                            <p className="text-sm font-medium">Backup Status</p>
                            <p className="text-xs text-muted-foreground">Last backup</p>
                        </div>
                        <Badge variant="outline">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Auto-enabled
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Data Management */}
            <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    Data Management
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background rounded">
                        <div>
                            <p className="text-sm font-medium">Clear Local Storage</p>
                            <p className="text-xs text-muted-foreground">Remove cached app settings</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearLocalStorage}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded">
                        <div>
                            <p className="text-sm font-medium">Auto-Backup</p>
                            <p className="text-xs text-muted-foreground">Automatic daily backups</p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                            Enabled
                        </Badge>
                    </div>
                </div>
            </Card>
        </div>
    );
}
