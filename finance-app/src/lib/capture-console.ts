import { db } from "@/db";
import { logs } from "@/db/schema";
import crypto from "crypto";

// Flag to prevent infinite loops if DB logging fails
let isLogging = false;

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

function isSystemLog(args: any[]) {
    const msg = args.map(a => String(a)).join(' ');
    // Filter out noise/drizzle logs to keep DB clean
    if (msg.includes('drizzle')) return true;
    if (msg.includes('[LOG]')) return true; // Avoid capturing our own custom logs twice
    return false;
}

export function initConsoleCapture() {
    if (process.env.NODE_ENV === 'development') {
        // Only run once
        if ((global as any).__consoleCaptured) return;
        (global as any).__consoleCaptured = true;

        console.log("🎙️ Console capture initialized: Terminal logs will appear in Dashboard");

        console.log = function (...args) {
            originalConsoleLog.apply(console, args); // Keep terminal output working

            if (isLogging || isSystemLog(args)) return;

            try {
                isLogging = true;
                const message = args.map(a =>
                    typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                ).join(' ');

                // Fire and forget insert
                db.insert(logs).values({
                    id: crypto.randomUUID(),
                    level: "info",
                    action: "terminal_stdout",
                    message: message.substring(0, 1000), // Trim logs
                    resolved: true, // System logs are auto resolved
                    userAgent: "System/Terminal",
                    resolvedAt: new Date(),
                    resolvedBy: "system"
                }).then(() => {
                    isLogging = false;
                }).catch(() => {
                    isLogging = false;
                });

            } catch (e) {
                isLogging = false;
            }
        };

        console.error = function (...args) {
            originalConsoleError.apply(console, args);

            if (isLogging || isSystemLog(args)) return;

            try {
                isLogging = true;
                const message = args.map(a =>
                    typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
                ).join(' ');

                db.insert(logs).values({
                    id: crypto.randomUUID(),
                    level: "error", // Treat console.error as error logs
                    action: "terminal_stderr",
                    message: message.substring(0, 1000),
                    resolved: false, // Errors need attention
                    userAgent: "System/Terminal",
                    resolvedAt: null,
                    resolvedBy: null
                }).then(() => {
                    isLogging = false;
                }).catch(() => {
                    isLogging = false;
                });

            } catch (e) {
                isLogging = false;
            }
        };
    }
}
