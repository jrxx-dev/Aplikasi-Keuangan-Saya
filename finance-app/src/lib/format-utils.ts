import type { Language } from './i18n/dictionaries';

/**
 * Format currency based on language preference
 * @param amount - The amount to format
 * @param language - The language code ('id' or 'en')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, language: Language = 'id'): string {
    if (language === 'id') {
        // Indonesian format: Rp 1.000.000,00
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } else {
        // English format: $1,000,000.00 (using USD as default)
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount / 15000); // Rough IDR to USD conversion for display
    }
}

/**
 * Format date based on language preference
 * @param date - The date to format
 * @param language - The language code ('id' or 'en')
 * @param format - The format type ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | string,
    language: Language = 'id',
    format: 'short' | 'medium' | 'long' = 'medium'
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        medium: { day: 'numeric', month: 'short', year: 'numeric' },
        long: { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' },
    };

    const locale = language === 'id' ? 'id-ID' : 'en-US';

    return new Intl.DateTimeFormat(locale, formatOptions[format]).format(dateObj);
}

/**
 * Format number based on language preference
 * @param num - The number to format
 * @param language - The language code ('id' or 'en')
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(
    num: number,
    language: Language = 'id',
    decimals: number = 0
): string {
    const locale = language === 'id' ? 'id-ID' : 'en-US';

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Format percentage based on language preference
 * @param value - The value to format as percentage (0-100)
 * @param language - The language code ('id' or 'en')
 * @returns Formatted percentage string
 */
export function formatPercentage(
    value: number,
    language: Language = 'id'
): string {
    const locale = language === 'id' ? 'id-ID' : 'en-US';

    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value / 100);
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date - The date to compare
 * @param language - The language code ('id' or 'en')
 * @returns Relative time string
 */
export function formatRelativeTime(
    date: Date | string,
    language: Language = 'id'
): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const locale = language === 'id' ? 'id-ID' : 'en-US';
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2592000 },
        { unit: 'week', seconds: 604800 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 },
    ];

    for (const { unit, seconds } of units) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (Math.abs(interval) >= 1) {
            return rtf.format(-interval, unit);
        }
    }

    return rtf.format(0, 'second');
}
