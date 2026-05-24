"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeColor = "default" | "green" | "violet" | "rose" | "orange" | "sky" | "lime";

interface ThemeColorStore {
    color: ThemeColor;
    setColor: (color: ThemeColor) => void;
}

export const useThemeColor = create<ThemeColorStore>()(
    persist(
        (set) => ({
            color: "default",
            setColor: (color) => set({ color }),
        }),
        {
            name: "theme-color-storage",
        }
    )
);

export function ThemeColorManager() {
    const { color } = useThemeColor();

    useEffect(() => {
        const root = document.documentElement;
        // Remove all previous theme classes
        root.classList.remove("theme-green", "theme-violet", "theme-rose", "theme-orange", "theme-sky", "theme-lime");

        if (color !== "default") {
            root.classList.add(`theme-${color}`);
        }
    }, [color]);

    return null;
}
