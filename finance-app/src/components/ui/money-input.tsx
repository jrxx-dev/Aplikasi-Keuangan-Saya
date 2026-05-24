"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends React.ComponentProps<typeof Input> {
    onValueChange?: (value: string) => void;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ className, onValueChange, onChange, value, ...props }, ref) => {
        const [localValue, setLocalValue] = React.useState("");

        React.useEffect(() => {
            if (value !== undefined) {
                // If value is provided (controlled), format it
                const stringVal = value.toString();
                if (stringVal === "") {
                    setLocalValue("");
                } else {
                    const numberVal = parseFloat(stringVal.replace(/\./g, "").replace(/,/g, "."));
                    if (!isNaN(numberVal)) {
                        setLocalValue(new Intl.NumberFormat("id-ID").format(numberVal));
                    } else {
                        setLocalValue(stringVal);
                    }
                }
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // Remove non-digit characters
            const rawValue = e.target.value.replace(/\D/g, "");

            // Format for display
            const formatted = rawValue === "" ? "" : new Intl.NumberFormat("id-ID").format(parseInt(rawValue));
            setLocalValue(formatted);

            // Pass numeric string (no dots) to parent
            if (onValueChange) {
                onValueChange(rawValue);
            }
            // Also call original onChange if needed by form libraries, but they usually need the raw value
            // We'll let the parent handle the onChange event if it relies on standard events, 
            // but relying on onValueChange is safer for the numeric value.
            if (onChange) {
                onChange(e);
            }
        };

        return (
            <Input
                {...props}
                ref={ref}
                type="text" 
                value={localValue}
                onChange={handleChange}
                className={cn("font-mono tracking-wider", className)}
                autoComplete="off"
                inputMode="numeric"
                pattern="[0-9]*"
            />
        );
    }
);
MoneyInput.displayName = "MoneyInput";
