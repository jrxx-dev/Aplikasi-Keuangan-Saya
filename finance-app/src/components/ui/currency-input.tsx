import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    value: string | number;
    onValueChange: (value: string) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, value, onValueChange, ...props }, ref) => {
        // Format value for display
        const displayValue = React.useMemo(() => {
            if (!value) return "";
            return new Intl.NumberFormat("id-ID").format(Number(value));
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let inputValue = e.target.value;

            // Handle multipliers (k, rb, jt, m)
            const lowerVal = inputValue.toLowerCase();
            let multiplier = 1;

            if (lowerVal.includes("rb") || lowerVal.includes("k")) {
                multiplier = 1000;
                inputValue = inputValue.replace(/rb|k/gi, "");
            } else if (lowerVal.includes("jt") || lowerVal.includes("juta") || lowerVal.includes("m")) {
                multiplier = 1000000;
                inputValue = inputValue.replace(/jt|juta|m/gi, "");
            }

            // Remove non-digit characters
            const rawValue = inputValue.replace(/\D/g, "");

            // Apply multiplier
            if (rawValue) {
                const finalValue = (parseInt(rawValue) * multiplier).toString();
                onValueChange(finalValue);
            } else {
                onValueChange("");
            }
        };

        return (
            <Input
                ref={ref}
                type="text"
                inputMode="numeric"
                className={cn("", className)}
                value={displayValue}
                onChange={handleChange}
                {...props}
            />
        );
    }
);
CurrencyInput.displayName = "CurrencyInput";
