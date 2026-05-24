'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { formatCurrency, formatDate, formatNumber, formatPercentage, formatRelativeTime } from './format-utils';

/**
 * Hook to use localized formatting functions
 * Automatically uses the current language from context
 */
export function useFormat() {
    const { language } = useLanguage();

    return {
        /**
         * Format currency based on current language
         * @param amount - The amount to format
         * @returns Formatted currency string
         */
        currency: (amount: number) => formatCurrency(amount, language),

        /**
         * Format date based on current language
         * @param date - The date to format
         * @param format - The format type ('short', 'medium', 'long')
         * @returns Formatted date string
         */
        date: (date: Date | string, format: 'short' | 'medium' | 'long' = 'medium') =>
            formatDate(date, language, format),

        /**
         * Format number based on current language
         * @param num - The number to format
         * @param decimals - Number of decimal places
         * @returns Formatted number string
         */
        number: (num: number, decimals: number = 0) =>
            formatNumber(num, language, decimals),

        /**
         * Format percentage based on current language
         * @param value - The value to format as percentage (0-100)
         * @returns Formatted percentage string
         */
        percentage: (value: number) => formatPercentage(value, language),

        /**
         * Get relative time string based on current language
         * @param date - The date to compare
         * @returns Relative time string (e.g., "2 days ago")
         */
        relativeTime: (date: Date | string) => formatRelativeTime(date, language),

        /**
         * Current language code
         */
        language,
    };
}
