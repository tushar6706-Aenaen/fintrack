import { motion } from "framer-motion";

// Animated Progress Bar - Re-added (for savings goals or other progress indicators)

export const AnimatedProgressBar = ({ value, max, color = "blue", delay = 0 }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const colorClasses = {
        blue: "bg-gradient-to-r from-blue-400 to-blue-600",
        emerald: "bg-gradient-to-r from-emerald-400 to-emerald-600",
        violet: "bg-gradient-to-r from-violet-400 to-violet-600",
        amber: "bg-gradient-to-r from-amber-400 to-amber-600",
        rose: "bg-gradient-to-r from-rose-400 to-rose-600"
    };

    return (
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <motion.div
                className={`h-full rounded-full ${colorClasses[color]} shadow-lg`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                    duration: 1.5,
                    delay,
                    ease: "easeOut"
                }}
                style={{
                    boxShadow: `0 0 20px ${color === 'blue' ? '#3B82F6' : color === 'emerald' ? '#10B981' : '#8B5CF6'}40`
                }}
            />
        </div>
    );
};
