"use client";

import { useState } from "react";
import { Palette, RotateCcw, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWidgetTheme, WidgetId, WidgetTheme } from "@/contexts/widget-theme-context";
import { motion } from "framer-motion";

interface WidgetColorPickerProps {
    widgetId: WidgetId;
    widgetName: string;
    trigger?: React.ReactNode;
}

const presetColors = [
    { name: "Blue", primary: "#3b82f6", secondary: "#60a5fa", accent: "#1d4ed8", gradient: "from-blue-400 to-blue-600" },
    { name: "Emerald", primary: "#10b981", secondary: "#34d399", accent: "#047857", gradient: "from-emerald-400 to-emerald-600" },
    { name: "Rose", primary: "#f43f5e", secondary: "#fb7185", accent: "#be123c", gradient: "from-rose-400 to-rose-600" },
    { name: "Purple", primary: "#a855f7", secondary: "#c084fc", accent: "#7e22ce", gradient: "from-purple-400 to-purple-600" },
    { name: "Orange", primary: "#f97316", secondary: "#fb923c", accent: "#ea580c", gradient: "from-orange-400 to-orange-600" },
    { name: "Pink", primary: "#ec4899", secondary: "#f472b6", accent: "#be185d", gradient: "from-pink-400 to-pink-600" },
    { name: "Cyan", primary: "#06b6d4", secondary: "#22d3ee", accent: "#0891b2", gradient: "from-cyan-400 to-cyan-600" },
    { name: "Amber", primary: "#f59e0b", secondary: "#fbbf24", accent: "#d97706", gradient: "from-amber-400 to-amber-600" },
    { name: "Indigo", primary: "#6366f1", secondary: "#818cf8", accent: "#4f46e5", gradient: "from-indigo-400 to-indigo-600" },
    { name: "Teal", primary: "#14b8a6", secondary: "#2dd4bf", accent: "#0d9488", gradient: "from-teal-400 to-teal-600" },
    { name: "Lime", primary: "#84cc16", secondary: "#a3e635", accent: "#65a30d", gradient: "from-lime-400 to-lime-600" },
    { name: "Fuchsia", primary: "#d946ef", secondary: "#e879f9", accent: "#a21caf", gradient: "from-fuchsia-400 to-fuchsia-600" },
];

export function WidgetColorPicker({ widgetId, widgetName, trigger }: WidgetColorPickerProps) {
    const [open, setOpen] = useState(false);
    const { themes, updateTheme, resetTheme } = useWidgetTheme();
    const currentTheme = themes[widgetId];

    const handlePresetClick = (preset: WidgetTheme) => {
        updateTheme(widgetId, preset);
    };

    const handleColorChange = (key: keyof WidgetTheme, value: string) => {
        updateTheme(widgetId, { [key]: value });
    };

    const handleReset = () => {
        resetTheme(widgetId);
    };

    return (
        <>
            <div onClick={() => setOpen(true)}>
                {trigger || (
                    <button className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full hover:scale-110 active:scale-95">
                        <Palette className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Kustomisasi Warna - {widgetName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Color Preview */}
                        <div className="relative">
                            <Label className="mb-3 block text-sm font-semibold">Preview</Label>
                            <motion.div
                                className="h-32 rounded-2xl relative overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${currentTheme.secondary}, ${currentTheme.primary})`,
                                }}
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                        className="text-white font-bold text-2xl drop-shadow-lg"
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        {widgetName}
                                    </motion.div>
                                </div>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                />
                            </motion.div>
                        </div>

                        {/* Preset Colors */}
                        <div>
                            <Label className="mb-3 block text-sm font-semibold">Warna Preset</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {presetColors.map((preset, idx) => (
                                    <motion.button
                                        key={preset.name}
                                        onClick={() => handlePresetClick(preset)}
                                        className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:scale-105 active:scale-95"
                                        style={{
                                            background: `linear-gradient(135deg, ${preset.secondary}, ${preset.primary})`,
                                        }}
                                        whileHover={{ y: -4 }}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                    >
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                                                {preset.name}
                                            </span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Colors */}
                        <div className="space-y-4">
                            <Label className="mb-3 block text-sm font-semibold">Kustomisasi Manual</Label>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primary" className="text-xs">Warna Utama</Label>
                                    <div className="flex gap-2">
                                        <input
                                            id="primary"
                                            type="color"
                                            value={currentTheme.primary}
                                            onChange={(e) => handleColorChange("primary", e.target.value)}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                                        />
                                        <input
                                            type="text"
                                            value={currentTheme.primary}
                                            onChange={(e) => handleColorChange("primary", e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="secondary" className="text-xs">Warna Sekunder</Label>
                                    <div className="flex gap-2">
                                        <input
                                            id="secondary"
                                            type="color"
                                            value={currentTheme.secondary}
                                            onChange={(e) => handleColorChange("secondary", e.target.value)}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                                        />
                                        <input
                                            type="text"
                                            value={currentTheme.secondary}
                                            onChange={(e) => handleColorChange("secondary", e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accent" className="text-xs">Warna Aksen</Label>
                                    <div className="flex gap-2">
                                        <input
                                            id="accent"
                                            type="color"
                                            value={currentTheme.accent}
                                            onChange={(e) => handleColorChange("accent", e.target.value)}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                                        />
                                        <input
                                            type="text"
                                            value={currentTheme.accent}
                                            onChange={(e) => handleColorChange("accent", e.target.value)}
                                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </Button>
                        <Button onClick={() => setOpen(false)}>
                            Selesai
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
