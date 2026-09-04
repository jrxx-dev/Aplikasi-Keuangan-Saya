"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type WidgetId =
    | "balance-card"
    | "income-card"
    | "expense-card"
    | "budget-widget"
    | "goals-widget"
    | "paylater-widget"
    | "quick-actions"
    | "bank-accounts"
    | "e-wallets"
    | "cash-accounts"
    | "average-income"
    | "average-expense"
    | "average-widget";

export interface WidgetTheme {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
}

export interface ThemePreset {
    name: string;
    label: string;
    themes: Record<WidgetId, WidgetTheme>;
}

export const defaultThemes: Record<WidgetId, WidgetTheme> = {
    "balance-card": {
        primary: "#3b82f6", // blue-600
        secondary: "#60a5fa", // blue-400
        accent: "#1d4ed8", // blue-700
        gradient: "from-blue-400 to-blue-600",
    },
    // ... existing themes ...
    "income-card": {
        primary: "#10b981", // emerald-600
        secondary: "#34d399", // emerald-400
        accent: "#047857", // emerald-700
        gradient: "from-emerald-400 to-emerald-600",
    },
    "expense-card": {
        primary: "#f43f5e", // rose-600
        secondary: "#fb7185", // rose-400
        accent: "#be123c", // rose-700
        gradient: "from-rose-400 to-rose-600",
    },
    "budget-widget": {
        primary: "#f97316", // orange-500
        secondary: "#fb923c", // orange-400
        accent: "#ea580c", // orange-600
        gradient: "from-orange-400 to-orange-600",
    },
    "goals-widget": {
        primary: "#10b981", // emerald-500
        secondary: "#34d399", // emerald-400
        accent: "#059669", // emerald-600
        gradient: "from-emerald-400 to-emerald-600",
    },
    "paylater-widget": {
        primary: "#ef4444", // red-500
        secondary: "#f87171", // red-400
        accent: "#dc2626", // red-600
        gradient: "from-red-400 to-red-600",
    },
    "quick-actions": {
        primary: "#3b82f6", // blue-600
        secondary: "#60a5fa", // blue-400
        accent: "#1d4ed8", // blue-700
        gradient: "from-blue-600 to-indigo-600",
    },
    "bank-accounts": {
        primary: "#3b82f6", // blue-600
        secondary: "#60a5fa", // blue-400
        accent: "#1d4ed8", // blue-700
        gradient: "from-blue-400 to-blue-600",
    },
    "e-wallets": {
        primary: "#a855f7", // purple-500
        secondary: "#c084fc", // purple-400
        accent: "#7e22ce", // purple-700
        gradient: "from-purple-400 to-purple-600",
    },
    "cash-accounts": {
        primary: "#10b981", // emerald-500
        secondary: "#34d399", // emerald-400
        accent: "#059669", // emerald-600
        gradient: "from-emerald-400 to-emerald-600",
    },
    "average-income": {
        primary: "#14b8a6", // teal-500
        secondary: "#2dd4bf", // teal-400
        accent: "#0d9488", // teal-600
        gradient: "from-teal-400 to-teal-600",
    },
    "average-expense": {
        primary: "#db2777", // pink-600
        secondary: "#f472b6", // pink-400
        accent: "#be185d", // pink-700
        gradient: "from-pink-400 to-pink-600",
    },
    "average-widget": {
        primary: "#6366f1", // indigo-500
        secondary: "#818cf8", // indigo-400
        accent: "#4f46e5", // indigo-600
        gradient: "from-indigo-400 to-indigo-600",
    },
};

export const themePresets: Record<string, ThemePreset> = {
    "tema-1": {
        name: "tema-1",
        label: "Tema 1 - Classic",
        themes: defaultThemes,
    },
    "tema-2": {
        name: "tema-2",
        label: "Tema 2 - Modern Finance",
        themes: {
            "balance-card": {
                primary: "#f59e0b", // amber-500
                secondary: "#fbbf24", // amber-400
                accent: "#8b5cf6", // violet-500
                gradient: "from-amber-400 to-violet-600",
            },
            "income-card": {
                primary: "#10b981", // emerald-600
                secondary: "#34d399", // emerald-400
                accent: "#8b5cf6", // violet-500
                gradient: "from-emerald-400 to-violet-600",
            },
            "expense-card": {
                primary: "#f43f5e", // rose-600
                secondary: "#fb7185", // rose-400
                accent: "#8b5cf6", // violet-500
                gradient: "from-rose-400 to-violet-600",
            },
            "budget-widget": {
                primary: "#f59e0b", // amber-500
                secondary: "#fbbf24", // amber-400
                accent: "#8b5cf6", // violet-500
                gradient: "from-amber-400 to-violet-600",
            },
            "goals-widget": {
                primary: "#8b5cf6", // violet-500
                secondary: "#a78bfa", // violet-400
                accent: "#7c3aed", // violet-600
                gradient: "from-violet-400 to-violet-600",
            },
            "paylater-widget": {
                primary: "#f59e0b", // amber-500
                secondary: "#fbbf24", // amber-400
                accent: "#8b5cf6", // violet-500
                gradient: "from-amber-400 to-violet-600",
            },
            "quick-actions": {
                primary: "#8b5cf6", // violet-500
                secondary: "#a78bfa", // violet-400
                accent: "#7c3aed", // violet-600
                gradient: "from-violet-600 to-violet-800",
            },
            "bank-accounts": {
                primary: "#f59e0b", // amber-500
                secondary: "#fbbf24", // amber-400
                accent: "#8b5cf6", // violet-500
                gradient: "from-amber-400 to-violet-600",
            },
            "e-wallets": {
                primary: "#8b5cf6", // violet-500
                secondary: "#a78bfa", // violet-400
                accent: "#7c3aed", // violet-600
                gradient: "from-violet-400 to-violet-600",
            },
            "cash-accounts": {
                primary: "#10b981", // emerald-600
                secondary: "#34d399", // emerald-400
                accent: "#8b5cf6", // violet-500
                gradient: "from-emerald-400 to-violet-600",
            },
            "average-income": {
                primary: "#f59e0b", // amber-500
                secondary: "#fbbf24", // amber-400
                accent: "#8b5cf6", // violet-500
                gradient: "from-amber-400 to-violet-600",
            },
            "average-expense": {
                primary: "#f43f5e", // rose-600
                secondary: "#fb7185", // rose-400
                accent: "#8b5cf6", // violet-500
                gradient: "from-rose-400 to-violet-600",
            },
            "average-widget": {
                primary: "#8b5cf6", // violet-500
                secondary: "#a78bfa", // violet-400
                accent: "#7c3aed", // violet-600
                gradient: "from-violet-400 to-violet-600",
            },
        },
    },
};

interface WidgetThemeContextType {
    themes: Record<WidgetId, WidgetTheme>;
    updateTheme: (widgetId: WidgetId, theme: Partial<WidgetTheme>) => void;
    resetTheme: (widgetId: WidgetId) => void;
    resetAllThemes: () => void;
    activePreset: string;
    setActivePreset: (preset: string) => void;
    themePresets: Record<string, ThemePreset>;
}

const WidgetThemeContext = createContext<WidgetThemeContextType | undefined>(undefined);

export function WidgetThemeProvider({ children }: { children: ReactNode }) {
    const [themes, setThemes] = useState<Record<WidgetId, WidgetTheme>>(defaultThemes);
    const [activePreset, setActivePresetState] = useState<string>("tema-1");

    // Load themes and preset from localStorage on mount
    useEffect(() => {
        const savedThemes = localStorage.getItem("widget-themes");
        const savedPreset = localStorage.getItem("widget-theme-preset");

        if (savedPreset) {
            setActivePresetState(savedPreset);
        }

        if (savedThemes) {
            try {
                const parsed = JSON.parse(savedThemes);
                // Merge saved themes with defaults to ensure new widgets exist
                setThemes(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to parse saved themes:", e);
            }
        }
    }, []);

    // Save themes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("widget-themes", JSON.stringify(themes));
    }, [themes]);

    // Save preset to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("widget-theme-preset", activePreset);
    }, [activePreset]);

    const updateTheme = (widgetId: WidgetId, themeUpdate: Partial<WidgetTheme>) => {
        setThemes((prev) => ({
            ...prev,
            [widgetId]: {
                ...prev[widgetId],
                ...themeUpdate,
            },
        }));
    };

    const resetTheme = (widgetId: WidgetId) => {
        const currentPreset = themePresets[activePreset];
        const baseTheme = currentPreset ? currentPreset.themes[widgetId] : defaultThemes[widgetId];
        setThemes((prev) => ({
            ...prev,
            [widgetId]: baseTheme,
        }));
    };

    const resetAllThemes = () => {
        const currentPreset = themePresets[activePreset];
        const baseThemes = currentPreset ? currentPreset.themes : defaultThemes;
        setThemes(baseThemes);
    };

    const setActivePreset = (preset: string) => {
        setActivePresetState(preset);
        const newPreset = themePresets[preset];
        if (newPreset) {
            setThemes(newPreset.themes);
        }
    };

    return (
        <WidgetThemeContext.Provider value={{ themes, updateTheme, resetTheme, resetAllThemes, activePreset, setActivePreset, themePresets }}>
            {children}
        </WidgetThemeContext.Provider>
    );
}

export function useWidgetTheme() {
    const context = useContext(WidgetThemeContext);
    if (!context) {
        throw new Error("useWidgetTheme must be used within WidgetThemeProvider");
    }
    return context;
}
