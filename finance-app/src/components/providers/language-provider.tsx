"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionaries, Language } from "@/lib/i18n/dictionaries";

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("id");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load language preference from server
        const loadLanguagePreference = async () => {
            try {
                const response = await fetch('/api/user-settings/language');
                if (response.ok) {
                    const data = await response.json();
                    if (data.language && (data.language === 'id' || data.language === 'en')) {
                        setLanguageState(data.language);
                        localStorage.setItem("app-language", data.language);
                    }
                } else {
                    // Fallback to localStorage if API fails
                    const savedLang = localStorage.getItem("app-language") as Language;
                    if (savedLang && (savedLang === "id" || savedLang === "en")) {
                        setLanguageState(savedLang);
                    }
                }
            } catch (error) {
                console.error("Failed to load language preference:", error);
                // Fallback to localStorage
                const savedLang = localStorage.getItem("app-language") as Language;
                if (savedLang && (savedLang === "id" || savedLang === "en")) {
                    setLanguageState(savedLang);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadLanguagePreference();
    }, []);

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("app-language", lang);

        // Save to database
        try {
            await fetch('/api/user-settings/language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: lang })
            });
        } catch (error) {
            console.error("Failed to save language preference to database:", error);
        }
    };

    const t = (path: string) => {
        const keys = path.split(".");
        let current: any = dictionaries[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation key not found: ${path}`);
                return path;
            }
            current = current[key];
        }

        return current as string;
    };

    if (isLoading) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
