"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function Counter({
    value,
    direction = "up",
    currency = false,
}: {
    value: number;
    direction?: "up" | "down";
    currency?: boolean;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(direction === "down" ? value : 0);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        // Set initial value immediately to handle 0 case where animation doesn't trigger 'change'
        if (ref.current) {
            const initialVal = direction === "down" ? value : 0;
            if (currency) {
                ref.current.textContent = new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                }).format(initialVal);
            } else {
                ref.current.textContent = Intl.NumberFormat("en-US").format(initialVal);
            }
        }
    }, []); // Run once on mount

    useEffect(() => {
        springValue.on("change", (latest) => {
            // ... existing logic ...
            if (ref.current) {
                if (currency) {
                    ref.current.textContent = new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                    }).format(Math.round(latest));
                } else {
                    ref.current.textContent = Intl.NumberFormat("en-US").format(Math.round(latest));
                }
            }
        });
        // Trigger animation
        if (isInView) {
            motionValue.set(value);
        }
    }, [springValue, currency, isInView, value, motionValue]);

    return <span ref={ref} />;
}
