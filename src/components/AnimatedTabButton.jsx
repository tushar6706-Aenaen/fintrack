// Animated Tab Button - Re-added (though not used in the provided layout snippet, useful for future expans
import {
    motion,
} from "framer-motion";
export const AnimatedTabButton = ({ active, onClick, children, icon: Icon }) => (
    <motion.button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all relative overflow-hidden ${active
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={false}
        animate={{
            background: active
                ? "linear-gradient(45deg, #3B82F6, #1D4ED8)"
                : "transparent"
        }}
    >
        {active && (
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500"
                layoutId="activeTab"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <motion.div
            className="relative z-10 flex items-center gap-2"
            animate={{ scale: active ? 1.1 : 1 }}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </motion.div>
    </motion.button>
);