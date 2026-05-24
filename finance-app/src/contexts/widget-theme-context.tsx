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
    | "average-widget"
    | "kasbon-widget";

export interface WidgetTheme {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
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
    "kasbon-widget": {
        primary: "#3b82f6", // blue-600
        secondary: "#60a5fa", // blue-400
        accent: "#1d4ed8", // blue-700
        gradient: "from-blue-400 to-blue-600",
    },
};

interface WidgetThemeContextType {
    themes: Record<WidgetId, WidgetTheme>;
    updateTheme: (widgetId: WidgetId, theme: Partial<WidgetTheme>) => void;
    resetTheme: (widgetId: WidgetId) => void;
    resetAllThemes: () => void;
}

const WidgetThemeContext = createContext<WidgetThemeContextType | undefined>(undefined);

export function WidgetThemeProvider({ children }: { children: ReactNode }) {
    const [themes, setThemes] = useState<Record<WidgetId, WidgetTheme>>(defaultThemes);

    // Load themes from localStorage on mount
    useEffect(() => {
        const savedThemes = localStorage.getItem("widget-themes");
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
        setThemes((prev) => ({
            ...prev,
            [widgetId]: defaultThemes[widgetId],
        }));
    };

    const resetAllThemes = () => {
        setThemes(defaultThemes);
    };

    return (
        <WidgetThemeContext.Provider value={{ themes, updateTheme, resetTheme, resetAllThemes }}>
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
