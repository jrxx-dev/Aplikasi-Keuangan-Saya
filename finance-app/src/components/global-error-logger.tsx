"use client";

import { useEffect } from "react";
import { createLog } from "@/lib/actions/logs";

export function GlobalErrorLogger() {
    useEffect(() => {
        // Capture unhandled errors
        const handleError = async (event: ErrorEvent) => {
            console.error("Global Error:", event.error);

            try {
                await fetch("/api/log-error", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        level: "error",
                        action: "global_error",
                        message: event.message,
                        metadata: {
                            filename: event.filename,
                            lineno: event.lineno,
                            colno: event.colno,
                            stack: event.error?.stack,
                            url: window.location.href,
                            userAgent: navigator.userAgent
                        }
                    })
                });
            } catch (err) {
                console.error("Failed to log error:", err);
            }
        };

        // Capture unhandled promise rejections
        const handleRejection = async (event: PromiseRejectionEvent) => {
            console.error("Unhandled Promise Rejection:", event.reason);

            try {
                await fetch("/api/log-error", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        level: "error",
                        action: "promise_rejection",
                        message: event.reason?.message || String(event.reason),
                        metadata: {
                            reason: event.reason,
                            url: window.location.href
                        }
                    })
                });
            } catch (err) {
                console.error("Failed to log rejection:", err);
            }
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleRejection);

        return () => {
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleRejection);
        };
    }, []);

    return null;
}
