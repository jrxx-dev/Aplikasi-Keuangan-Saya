"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";

interface LoggedButtonProps extends ButtonProps {
    actionName?: string; // Nama action untuk logging
    logOnClick?: boolean; // Auto-log setiap klik
}

export const LoggedButton = forwardRef<HTMLButtonElement, LoggedButtonProps>(
    ({ actionName, logOnClick = true, onClick, children, ...props }, ref) => {
        const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
            const buttonName = actionName || children?.toString() || "Unknown Button";

            try {
                // Log button click
                if (logOnClick) {
                    console.log(`🔘 [BUTTON] Clicked: ${buttonName}`);

                    await fetch("/api/log-error", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            level: "info",
                            action: "button_click",
                            message: `Button clicked: ${buttonName}`,
                            metadata: {
                                buttonName,
                                disabled: props.disabled,
                                variant: props.variant,
                                url: window.location.href
                            }
                        })
                    });
                }

                // Execute original onClick
                if (onClick) {
                    await onClick(e);
                } else if (!props.disabled) {
                    // Button tidak punya onClick handler!
                    console.warn(`⚠️ [BUTTON] No onClick handler: ${buttonName}`);

                    await fetch("/api/log-error", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            level: "warning",
                            action: "button_no_handler",
                            message: `Button "${buttonName}" tidak memiliki fungsi onClick`,
                            metadata: {
                                buttonName,
                                url: window.location.href
                            }
                        })
                    });
                }
            } catch (error) {
                // Log button error
                console.error(`❌ [BUTTON] Error in ${buttonName}:`, error);

                await fetch("/api/log-error", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        level: "error",
                        action: "button_error",
                        message: `Error saat klik button "${buttonName}": ${String(error)}`,
                        metadata: {
                            buttonName,
                            error: String(error),
                            stack: (error as Error).stack,
                            url: window.location.href
                        }
                    })
                });

                // Re-throw error agar tetap terlihat di console
                throw error;
            }
        };

        return (
            <Button ref={ref} onClick={handleClick} {...props}>
                {children}
            </Button>
        );
    }
);

LoggedButton.displayName = "LoggedButton";
