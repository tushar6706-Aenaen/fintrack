import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

function formatCurrency(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(n));
}
export  const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const controls = useAnimation();

    useEffect(() => {
        const numericValue = typeof value === 'string' ?
            parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;

        if (!isNaN(numericValue)) {
            controls.start({
                opacity: 1,
                transition: { duration: 0.1 }
            });

            let startValue = displayValue;
            let endValue = numericValue;
            let duration = 200;
            let startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);

                const current = startValue + (endValue - startValue) * easeOutQuart;
                setDisplayValue(current);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [value, controls, displayValue]);

    const formattedValue = typeof value === 'string' && value.includes('₹') ?
        formatCurrency(displayValue) : Math.round(displayValue).toLocaleString();

    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={controls}
            className="tabular-nums"
        >
            {prefix}{formattedValue}{suffix}
        </motion.span>
    );
};
