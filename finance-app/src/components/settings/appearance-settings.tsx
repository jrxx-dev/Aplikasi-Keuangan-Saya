"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Palette,
    Sun,
    Moon,
    Monitor,
    Zap,
    Eye,
    Type,
    Sparkles,
    Layout
} from "lucide-react";
import { useTheme } from "next-themes";
import { useThemeColor } from "@/components/theme-color-manager";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const colorOptions = [
    { id: "default", label: "Indigo (Default)", class: "bg-indigo-500" },
    { id: "green", label: "Emerald", class: "bg-emerald-500" },
    { id: "violet", label: "Violet", class: "bg-violet-500" },
    { id: "rose", label: "Rose", class: "bg-rose-500" },
    { id: "orange", label: "Amber", class: "bg-orange-500" },
    { id: "sky", label: "Sky Blue", class: "bg-sky-500" },
    { id: "lime", label: "Neon Lime", class: "bg-lime-500" },
];

const fontOptions = [
    { id: "default", label: "Parkinsans (Default)", description: "Modern geometric sans-serif" },
    { id: "inter", label: "Inter", description: "Clean and professional" },
    { id: "roboto", label: "Roboto", description: "Google's signature font" },
    { id: "poppins", label: "Poppins", description: "Friendly and rounded" },
];

export function AppearanceSettings() {
    const { theme, setTheme } = useTheme();
    const { color, setColor } = useThemeColor();

    // UI Settings (stored in localStorage)
    const [glassmorphism, setGlassmorphism] = useState(true);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [compactMode, setCompactMode] = useState(false);
    const [showAnimations, setShowAnimations] = useState(true);
    const [fontSize, setFontSize] = useState(100);
    const [borderRadius, setBorderRadius] = useState(12);
    const [selectedFont, setSelectedFont] = useState("default");
    const [sidebarPosition, setSidebarPosition] = useState("left");

    useEffect(() => {
        // Load settings from localStorage
        setGlassmorphism(localStorage.getItem('ui_glassmorphism') !== 'false');
        setReduceMotion(localStorage.getItem('ui_reduceMotion') === 'true');
        setCompactMode(localStorage.getItem('ui_compactMode') === 'true');
        setShowAnimations(localStorage.getItem('ui_showAnimations') !== 'false');
        setFontSize(Number(localStorage.getItem('ui_fontSize')) || 100);
        setBorderRadius(Number(localStorage.getItem('ui_borderRadius')) || 12);
        setSelectedFont(localStorage.getItem('ui_font') || 'default');
        setSidebarPosition(localStorage.getItem('ui_sidebarPosition') || 'left');

        // Apply settings
        applySettings();
    }, []);

    const applySettings = () => {
        const root = document.documentElement;
        const mainContent = document.querySelector('main');

        // Apply font size to main content only, not root
        const savedFontSize = Number(localStorage.getItem('ui_fontSize')) || 100;
        if (mainContent) {
            (mainContent as HTMLElement).style.fontSize = `${savedFontSize}%`;
        }

        // Apply border radius
        const savedBorderRadius = Number(localStorage.getItem('ui_borderRadius')) || 12;
        root.style.setProperty('--radius', `${savedBorderRadius}px`);

        // Apply reduce motion
        const savedReduceMotion = localStorage.getItem('ui_reduceMotion') === 'true';
        if (savedReduceMotion) {
            root.classList.add('reduce-motion');
        } else {
            root.classList.remove('reduce-motion');
        }

        // Apply compact mode
        const savedCompactMode = localStorage.getItem('ui_compactMode') === 'true';
        if (savedCompactMode) {
            root.classList.add('compact-mode');
        } else {
            root.classList.remove('compact-mode');
        }
    };

    const updateSetting = (key: string, value: any, setter: (v: any) => void) => {
        localStorage.setItem(key, String(value));
        setter(value);
        applySettings();

        toast.success("Setting updated", {
            description: `${key.replace('ui_', '')} has been updated`
        });
    };

    const handleFontSizeChange = (value: number[]) => {
        const newSize = value[0];
        setFontSize(newSize);
        localStorage.setItem('ui_fontSize', String(newSize));

        // Apply to main content only
        const mainContent = document.querySelector('main');
        if (mainContent) {
            (mainContent as HTMLElement).style.fontSize = `${newSize}%`;
        }
    };

    const handleBorderRadiusChange = (value: number[]) => {
        const newRadius = value[0];
        setBorderRadius(newRadius);
        localStorage.setItem('ui_borderRadius', String(newRadius));
        document.documentElement.style.setProperty('--radius', `${newRadius}px`);
    };

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        toast.success("Theme changed", {
            description: `Switched to ${newTheme} mode`
        });
    };

    const handleColorChange = (newColor: string) => {
        setColor(newColor as any);
        toast.success("Color theme changed", {
            description: `Applied ${newColor} color scheme`
        });
    };

    const resetToDefaults = () => {
        if (!confirm("Reset all appearance settings to defaults?")) return;

        // Reset all settings
        setGlassmorphism(true);
        setReduceMotion(false);
        setCompactMode(false);
        setShowAnimations(true);
        setFontSize(100);
        setBorderRadius(12);
        setSelectedFont("default");
        setSidebarPosition("left");
        setTheme("system");
        setColor("default" as any);

        // Clear localStorage
        ['ui_glassmorphism', 'ui_reduceMotion', 'ui_compactMode', 'ui_showAnimations',
            'ui_fontSize', 'ui_borderRadius', 'ui_font', 'ui_sidebarPosition'].forEach(key => {
                localStorage.removeItem(key);
            });

        // Reset CSS
        const mainContent = document.querySelector('main');
        if (mainContent) {
            (mainContent as HTMLElement).style.fontSize = '100%';
        }
        document.documentElement.style.setProperty('--radius', '12px');
        document.documentElement.classList.remove('reduce-motion', 'compact-mode');

        toast.success("Settings reset", {
            description: "All appearance settings restored to defaults"
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Tampilan & UI Frontend</h2>
                    <p className="text-muted-foreground">Kustomisasi antarmuka visual agar sesuai preferensi Anda.</p>
                </div>
                <Button variant="outline" size="sm" onClick={resetToDefaults}>
                    Reset to Defaults
                </Button>
            </div>
            <Separator />

            {/* Color Theme */}
            <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold">Warna Tema Utama</h3>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {colorOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleColorChange(option.id)}
                            className={cn(
                                "group relative flex flex-col items-center gap-2 p-2 rounded-xl border transition-all hover:bg-muted",
                                color === option.id ? "border-primary bg-primary/5" : "border-transparent"
                            )}
                            title={option.label}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full shadow-sm ring-2 ring-offset-2 ring-offset-background transition-transform",
                                option.class,
                                color === option.id ? "scale-110 ring-primary" : "ring-transparent group-hover:scale-105"
                            )} />
                            <span className="text-[10px] font-medium hidden md:block">{option.id}</span>
                            {color === option.id && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px]">✓</div>
                            )}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Theme Mode */}
            <Card className="p-6 space-y-4 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Mode Tema</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map((t) => (
                        <button
                            key={t}
                            onClick={() => handleThemeChange(t)}
                            className={cn(
                                "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                theme === t
                                    ? "bg-background border-primary shadow-md"
                                    : "bg-transparent border-transparent hover:bg-background/50"
                            )}
                        >
                            {t === 'light' && <Sun className="w-5 h-5" />}
                            {t === 'dark' && <Moon className="w-5 h-5" />}
                            {t === 'system' && <Monitor className="w-5 h-5" />}
                            <span className="text-xs font-medium capitalize">{t}</span>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Typography */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Type className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold">Font Size</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Base Size: {fontSize}%</Label>
                        </div>
                        <Slider
                            value={[fontSize]}
                            onValueChange={handleFontSizeChange}
                            min={80}
                            max={120}
                            step={5}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Small (80%)</span>
                            <span>Large (120%)</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Layout className="w-5 h-5 text-pink-500" />
                        <h3 className="font-semibold">Border Radius</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Roundness: {borderRadius}px</Label>
                        </div>
                        <Slider
                            value={[borderRadius]}
                            onValueChange={handleBorderRadiusChange}
                            min={0}
                            max={24}
                            step={2}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Sharp (0px)</span>
                            <span>Round (24px)</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Visual Effects */}
            <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold">Visual Effects</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div>
                            <Label>Glassmorphism Effect</Label>
                            <p className="text-xs text-muted-foreground">Frosted glass blur effect</p>
                        </div>
                        <Switch
                            checked={glassmorphism}
                            onCheckedChange={(v) => updateSetting('ui_glassmorphism', v, setGlassmorphism)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div>
                            <Label>Show Animations</Label>
                            <p className="text-xs text-muted-foreground">Enable UI animations</p>
                        </div>
                        <Switch
                            checked={showAnimations}
                            onCheckedChange={(v) => updateSetting('ui_showAnimations', v, setShowAnimations)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div>
                            <Label>Reduce Motion</Label>
                            <p className="text-xs text-muted-foreground">Minimize animations</p>
                        </div>
                        <Switch
                            checked={reduceMotion}
                            onCheckedChange={(v) => updateSetting('ui_reduceMotion', v, setReduceMotion)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div>
                            <Label>Compact Mode</Label>
                            <p className="text-xs text-muted-foreground">Reduce spacing</p>
                        </div>
                        <Switch
                            checked={compactMode}
                            onCheckedChange={(v) => updateSetting('ui_compactMode', v, setCompactMode)}
                        />
                    </div>
                </div>
            </Card>

            {/* Layout Preferences */}
            <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Layout Preferences</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Sidebar Position</Label>
                        <Select value={sidebarPosition} onValueChange={(v) => updateSetting('ui_sidebarPosition', v, setSidebarPosition)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select value={selectedFont} onValueChange={(v) => updateSetting('ui_font', v, setSelectedFont)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {fontOptions.map(font => (
                                    <SelectItem key={font.id} value={font.id}>
                                        {font.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>
        </div>
    );
}
