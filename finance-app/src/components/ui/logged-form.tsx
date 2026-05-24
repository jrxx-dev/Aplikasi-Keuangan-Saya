"use client";

import { FormEvent, ReactNode } from "react";

interface LoggedFormProps {
    formName: string;
    onSubmit?: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
    children: ReactNode;
    className?: string;
}

export function LoggedForm({ formName, onSubmit, children, className }: LoggedFormProps) {
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            console.log(`📝 [FORM] Submitting: ${formName}`);

            // Log form submission
            await fetch("/api/log-error", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level: "info",
                    action: "form_submit",
                    message: `Form submitted: ${formName}`,
                    metadata: {
                        formName,
                        url: window.location.href
                    }
                })
            });

            // Execute original onSubmit
            if (onSubmit) {
                await onSubmit(e);
            } else {
                console.warn(`⚠️ [FORM] No onSubmit handler: ${formName}`);

                await fetch("/api/log-error", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        level: "warning",
                        action: "form_no_handler",
                        message: `Form "${formName}" tidak memiliki fungsi onSubmit`,
                        metadata: {
                            formName,
                            url: window.location.href
                        }
                    })
                });
            }
        } catch (error) {
            console.error(`❌ [FORM] Error in ${formName}:`, error);

            await fetch("/api/log-error", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level: "error",
                    action: "form_error",
                    message: `Error saat submit form "${formName}": ${String(error)}`,
                    metadata: {
                        formName,
                        error: String(error),
                        stack: (error as Error).stack,
                        url: window.location.href
                    }
                })
            });

            throw error;
        }
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            {children}
        </form>
    );
}
