import React, { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { format, subDays, startOfWeek, endOfWeek, isToday, isThisWeek } from "date-fns";

// Framer Motion imports
import {
    motion,
    AnimatePresence,
    useSpring,
    useMotionValue,
    useTransform,
    stagger,
    useAnimation
} from "framer-motion";

// Lucide React Icons
import {
    Plus,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    CreditCard,
    DollarSign,
    Calendar,
    Target,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Filter,
    Wallet,
    PieChart, // Added for potential future use in analytics
    BarChart3, // Added for potential future use in overview
    Sparkles, // Added for animated elements
    Zap,      // Added for animated elements
    Star,     // Added for animated elements
    X,        // Added for closing dialog
    Coins,    // Added for savings goals
    LineChart, // Added for spending trend chart
    Tag       // Added for recent transactions
} from "lucide-react";

// Shadcn UI Component Imports
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
// Added missing Shadcn UI components for the modal
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Although not directly used in this snippet, good to include if form is complex
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import SpendingLineChart from "../components/SpendingLineChart";
import { AnimatedCounter } from "@/components/AnimatedCounter";

// Helper function to format currency
function formatCurrency(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(n));
}

// Animation variants




const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -5,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

const pulseVariants = {
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};



// Enhanced Metric Card with animations - Used directly in JSX below
const AnimatedMetricCard = ({ title, value, trend, trendValue, icon: Icon, color = "blue", delay = 0 }) => {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
        emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
        violet: "from-violet-500 to-violet-600 shadow-violet-500/25",
        amber: "from-amber-500 to-amber-600 shadow-amber-500/25",
        rose: "from-rose-500 to-rose-600 shadow-rose-500/25"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
            whileHover="hover"
            variants={cardHoverVariants}
        >
            <div className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-xl p-6">
                <motion.div
                    className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClasses[color]}`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: delay + 0.3 }}
                />

                <div className="flex items-center justify-between">
                    <div className="space-y-3">
                        <motion.p
                            className="text-sm font-medium text-zinc-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.2 }}
                        >
                            {title}
                        </motion.p>

                        <motion.div
                            className="text-3xl font-bold text-white"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                duration: 0.5,
                                delay: delay + 0.4,
                                type: "spring",
                                bounce: 0.3
                            }}
                        >
                            <AnimatedCounter  value={value} />
                        </motion.div>

                        {trend && (
                            <motion.div
                                className="flex items-center space-x-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: delay + 0.6 }}
                            >
                                <motion.div
                                    animate={{
                                        rotate: trend === 'up' ? [0, -10, 0] : trend === 'down' ? [0, 10, 0] : 0
                                    }}
                                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                                >
                                    {trend === 'up' ? (
                                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                                    ) : trend === 'down' ? (
                                        <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                                    ) : null}
                                </motion.div>
                                <span className="text-sm text-slate-600">{trendValue}</span>
                            </motion.div>
                        )}
                    </div>

                    <motion.div
                        className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}
                        variants={pulseVariants}
                        animate="pulse"
                        whileHover={{
                            scale: 1.1,
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.5 }
                        }}
                    >
                        <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                </div>

                {/* Floating particles effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white/30 rounded-full"
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -50, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 1,
                                ease: "easeInOut"
                            }}
                            style={{
                                left: `${20 + i * 30}%`,
                                top: `${60 + i * 10}%`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};





export default function Dashboard() {
    // Supabase auth state
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true); // New state for initial auth loading

    const [expenses, setExpenses] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [weeklyExpenses, setWeeklyExpenses] = useState([]);
    const [todaysExpenses, setTodaysExpenses] = useState([]);

    // Modal state
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [categoryId, setCategoryId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [loading, setLoading] = useState(true); // For data loading
    const [error, setError] = useState("");

    // Supabase user ID will be a string (usually UUID)
    const userId = user?.id;

    // Default categories
    const defaultCategories = useMemo(() => [
        { name: "Food & Dining", description: "Meals and groceries", icon: "🍽️" },
        { name: "Transportation", description: "Travel and commuting", icon: "🚗" },
        { name: "Shopping", description: "General purchases", icon: "🛍️" },
        { name: "Bills & Utilities", description: "Monthly bills", icon: "💡" },
        { name: "Entertainment", description: "Fun and leisure", icon: "🎬" },
        { name: "Healthcare", description: "Medical expenses", icon: "🏥" }
    ], []); // Memoize to prevent re-creation on every render

    const loadExpenses = useCallback(async () => {
        if (!userId) {
            console.log("No user ID available for expenses");
            setExpenses([]);
            setTrendData([]);
            setCategoryData([]);
            setWeeklyExpenses([]);
            setTodaysExpenses([]);
            return;
        }

        console.log("Loading expenses for user:", userId);

        try {
            const { data, error } = await supabase
                .from("expenses")
                .select(`
                    id, title, amount, date, category_id,
                    categories (id, name)
                `)
                .eq("user_id", userId)
                .order("date", { ascending: false })
                .limit(500);

            console.log("Expenses query result:", { data, error, count: data?.length });

            if (error) {
                console.error("Database error:", error);
                // If it's a UUID error, suggest the fix
                if (error.message.includes("invalid input syntax for type uuid")) {
                    setError(`Database schema issue: user_id column expects UUID format but got "${userId}". Please update your database schema to use TEXT instead of UUID for user_id columns.`);
                } else {
                    setError(`Error loading expenses: ${error.message}`);
                }
                return;
            }

            const rows = data || [];
            setExpenses(rows);

            // Filter today's and this week's expenses
            const today = new Date();
            const todaysExpenses = rows.filter(r => isToday(new Date(r.date)));
            const weeklyExpenses = rows.filter(r => {
                const expenseDate = new Date(r.date);
                // Ensure week starts on Monday (1)
                return expenseDate >= startOfWeek(today, { weekStartsOn: 1 }) && expenseDate <= endOfWeek(today, { weekStartsOn: 1 });
            });

            setTodaysExpenses(todaysExpenses);
            setWeeklyExpenses(weeklyExpenses);

            // Build trend data for last 30 days
            const last30Days = Array.from({ length: 30 }, (_, i) => {
                const date = subDays(new Date(), 29 - i);
                const dayExpenses = rows.filter(r =>
                    format(new Date(r.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                );
                const total = dayExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
                return {
                    date: format(date, 'MMM dd'),
                    total,
                    count: dayExpenses.length
                };
            });
            setTrendData(last30Days);

            // Build category data
            const catMap = {};
            rows.forEach((r) => {
                const name = r.categories?.name || "Uncategorized";
                catMap[name] = (catMap[name] || 0) + Number(r.amount);
            });
            const catArr = Object.entries(catMap).map(([name, value]) => ({ name, value }));
            setCategoryData(catArr.sort((a, b) => b.value - a.value));
        } catch (err) {
            console.error("Unexpected error loading expenses:", err);
            setError(`Unexpected error loading expenses: ${err.message}`);
        }
    }, [userId]);

    const loadCategories = useCallback(async () => {
        if (!userId) {
            console.log("No user ID for categories");
            setCategories([]);
            return;
        }

        console.log("Loading categories for user:", userId);

        try {
            const { data, error } = await supabase
                .from("categories")
                .select("id, name, description")
                .eq("user_id", userId)
                .eq("is_active", true)
                .order("name", { ascending: true });

            console.log("Categories query result:", { data, error, count: data?.length });

            if (error) {
                console.error("Categories error:", error);

                if (error.message.includes("invalid input syntax for type uuid")) {
                    setError(`Database schema issue: user_id column expects UUID format but got "${userId}". Please update your database schema to use TEXT instead of UUID for user_id columns.`);
                } else {
                    setError(`Error loading categories: ${error.message}`);
                }
                setCategories([]);
                return;
            }

            if (!data || data.length === 0) {
                console.log("No categories found, creating defaults");
                const { data: insertedData, error: insertError } = await supabase
                    .from("categories")
                    .insert(
                        defaultCategories.map((cat) => ({
                            name: cat.name,
                            description: cat.description,
                            user_id: userId, // Ensure user_id is passed
                            is_active: true
                        }))
                    )
                    .select();

                if (insertError) {
                    console.error("Error creating categories:", insertError);

                    if (insertError.message.includes("invalid input syntax for type uuid")) {
                        setError(`Database schema issue: user_id column expects UUID format but got "${userId}". Please update your database schema to use TEXT instead of UUID for user_id columns.`);
                    } else {
                        setError(`Error creating categories: ${insertError.message}`);
                    }
                    setCategories([]);
                } else {
                    console.log("Created default categories:", insertedData?.length);
                    setCategories(insertedData || []);
                }
            } else {
                setCategories(data);
            }
        } catch (err) {
            console.error("Unexpected error loading categories:", err);
            setError(`Unexpected error loading categories: ${err.message}`);
        }
    }, [userId, defaultCategories]);


    const loadAll = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            // Load categories first to ensure they are available for expenses
            await Promise.all([loadCategories(), loadExpenses()]);
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Failed to load data. Please refresh the page.");
        }
        setLoading(false);
    }, [loadCategories, loadExpenses]);

    // Effect to handle Supabase authentication state changes
    useEffect(() => {
        let mounted = true;

        const handleAuthStateChange = async (event, session) => {
            if (mounted) {
                setUser(session?.user || null);
                setAuthLoading(false); // Auth state is loaded
            }
        };

        // Initial session check
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (mounted) {
                setUser(session?.user || null);
                setAuthLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    // Load data when user is authenticated (after authLoading is complete)
    useEffect(() => {
        if (authLoading) return; // Wait for auth to finish loading

        if (!user) {
            setLoading(false); // No user, so no data to load
            return;
        }

        console.log("User loaded:", user.id);
        console.log("Using userId:", userId);
        loadAll();

        // Set up real-time subscription for expenses
        const expensesChannel = supabase
            .channel('expenses-changes')
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "expenses",
                filter: `user_id=eq.${userId}`
            }, () => {
                console.log("Real-time update received for expenses");
                loadExpenses(); // Reload expenses on change
            })
            .subscribe();

        // Set up real-time subscription for categories
        const categoriesChannel = supabase
            .channel('categories-changes')
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "categories",
                filter: `user_id=eq.${userId}`
            }, () => {
                console.log("Real-time update received for categories");
                loadCategories(); // Reload categories on change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(expensesChannel);
            supabase.removeChannel(categoriesChannel);
        };
    }, [user?.id, authLoading, loadAll, loadExpenses, loadCategories, userId]); // Depend on user.id and authLoading

    async function handleAddExpense(e) {
        e.preventDefault();
        if (!userId || !title.trim() || !amount || !categoryId) {
            setError("Please fill all required fields.");
            return;
        }

        const parsed = parseFloat(amount);
        if (Number.isNaN(parsed) || parsed <= 0) {
            setError("Amount must be a positive number.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const payload = {
                user_id: userId,
                title: title.trim(),
                amount: parsed,
                date: date || format(new Date(), "yyyy-MM-dd"),
                category_id: categoryId,
            };

            console.log("Adding expense:", payload);

            const { data, error } = await supabase
                .from("expenses")
                .insert([payload])
                .select();

            if (error) {
                console.error("Insert error:", error);

                if (error.message.includes("invalid input syntax for type uuid")) {
                    setError(`Database schema issue: user_id column expects UUID format but got "${userId}". Please update your database schema to use TEXT instead of UUID for user_id columns.`);
                } else {
                    setError(`Failed to add expense: ${error.message}`);
                }
            } else {
                console.log("Expense added successfully:", data);
                setTitle("");
                setAmount("");
                setDate(format(new Date(), "yyyy-MM-dd"));
                setCategoryId("");
                setOpen(false);
                setError("");
                await loadExpenses(); // Reload to show new expense
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setError(`Unexpected error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    }

    // Calculate metrics
    const totalSpent = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const todaySpent = todaysExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const weekSpent = weeklyExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const numDaysWithExpenses = useMemo(() => {
        const uniqueDates = new Set(expenses.map(e => format(new Date(e.date), 'yyyy-MM-dd')));
        return uniqueDates.size;
    }, [expenses]);
    const avgDaily = numDaysWithExpenses > 0 ? totalSpent / numDaysWithExpenses : 0;

    // Calculate trends
    const yesterdaySpent = expenses.filter(r =>
        format(new Date(r.date), 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd')
    ).reduce((s, e) => s + Number(e.amount || 0), 0);

    const todayTrend = todaySpent > yesterdaySpent ? 'up' : todaySpent < yesterdaySpent ? 'down' : 'neutral';
    const trendPercentage = yesterdaySpent > 0 ? Math.abs(((todaySpent - yesterdaySpent) / yesterdaySpent) * 100) : 0;

    

    // Loading state
    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-50 mx-auto mb-4"></div>
                    <div className="text-zinc-400">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-950">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
                    <CardHeader className="text-center">
                        <CardTitle className="text-zinc-50">Authentication Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-zinc-400">
                            Please sign in to view your dashboard.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-red-950/20 border border-red-800 rounded-lg"
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="text-red-300 text-sm font-medium mb-2">Database Configuration Error</div>
                                    <div className="text-red-200 text-sm mb-3">{error}</div>
                                    {error.includes("UUID format") && (
                                        <div className="bg-red-900/30 p-3 rounded text-xs text-red-200">
                                            <div className="font-medium mb-1">Quick Fix:</div>
                                            <div className="mb-2">Run this SQL in your Supabase SQL editor:</div>
                                            <pre className="bg-black/20 p-2 rounded text-xs overflow-x-auto">
                                                {`ALTER TABLE expenses ALTER COLUMN user_id TYPE text;
                                                ALTER TABLE categories ALTER COLUMN user_id TYPE text;
                                                ALTER TABLE budgets ALTER COLUMN user_id TYPE text;
                                                ALTER TABLE income ALTER COLUMN user_id TYPE text;
                                                ALTER TABLE savings_goals ALTER COLUMN user_id TYPE text;`}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setError("")}
                                    className="text-red-500 hover:text-red-600 p-1"
                                >
                                    <X className="w-4 h-4" /> {/* Use X icon for close */}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Debug Info (Remove in production) */}
                {/* <div className="mb-4 p-3 bg-zinc-800 rounded-lg text-xs text-zinc-400">
                    <div>Supabase User ID: {user?.id}</div> Changed Clerk to Supabase
                    <div>Using ID: {userId}</div>
                    <div>Expenses: {expenses.length}</div>
                    <div>Categories: {categories.length}</div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            console.log("Debug info:", { user, userId, expenses: expenses.length, categories: categories.length });
                            loadAll();
                        }}
                        className="mt-2 text-zinc-400"
                    >
                        Reload Data
                    </Button>
                </div> */}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-3xl font-bold text-zinc-50">Dashboard</h1>
                        <p className="text-zinc-400 mt-1">
                            Track your expenses and manage your budget
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Expense
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  gap-6 mb-8 ">

                    <AnimatedMetricCard
                        title="Today's Spending"
                        value={formatCurrency(todaySpent)}
                        trend={todayTrend}
                        trendValue={`${trendPercentage.toFixed(1)}% vs yesterday`}
                        icon={Calendar}
                        color="blue"
                        delay={0.1}
                    />

                    <AnimatedMetricCard
                        title="This Week"
                        value={formatCurrency(weekSpent)}
                        trend="neutral" // Or calculate a real weekly trend if data is available
                        trendValue={`${weeklyExpenses.length} transactions`}
                        icon={TrendingUp}
                        color="emerald"
                        delay={0.2}
                    />

                    <AnimatedMetricCard
                        title="Total Spent"
                        value={formatCurrency(totalSpent)}
                        trend="neutral" // Or calculate a real total trend
                        trendValue="All time"
                        icon={DollarSign}
                        color="violet"
                        delay={0.3}
                    />

                    <AnimatedMetricCard
                        title="Daily Average"
                        value={formatCurrency(avgDaily)}
                        trend="neutral" // Or calculate a real daily average trend
                        trendValue="Based on activity"
                        icon={Activity}
                        color="amber"
                        delay={0.4}
                    />
                </div>

                {/* Charts and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">
                    {/* Spending Trend Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        whileHover={{ scale: 1.01 }}
                        className="lg:col-span-4"
                    >
                        <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800 overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-zinc-50">
                                    <LineChart className="h-5 w-5" />
                                    Spending Trend (30 Days)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="h-auto"
                                >
                                    <SpendingLineChart data={trendData} />
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Categories Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                        className="lg:col-span-3"
                    >
                        <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800 overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-zinc-50">
                                    <PieChart className="h-5 w-5" />
                                    Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {categoryData.length > 0 ? (
                                    <div className="space-y-3">
                                        {categoryData.slice(0, 6).map((cat, index) => (
                                            <motion.div
                                                key={cat.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 + 0.3 }}
                                                whileHover={{ scale: 1.02, x: 5 }}
                                                className="flex items-center justify-between py-1 px-2 rounded-md cursor-pointer hover:bg-zinc-800"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        whileHover={{ scale: 1.3, rotate: 10 }}
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium text-zinc-100">
                                                        {cat.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-zinc-50">
                                                    {formatCurrency(cat.value)}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-zinc-400 text-center py-8"
                                    >
                                        No category data available
                                    </motion.p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Recent Transactions */}
                

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-zinc-50">
                                <CreditCard className="h-5 w-5" />
                                Recent Transactions
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {expenses.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="h-6 w-6 text-zinc-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-50 mb-2">
                                        No transactions yet
                                    </h3>
                                    <p className="text-zinc-400 mb-4">
                                        Start tracking your expenses by adding your first transaction.
                                    </p>
                                    <Button
                                        onClick={() => setOpen(true)}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add First Expense
                                    </Button>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    {expenses.slice(0, 8).map((tx, index) => (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.01, duration: 0.1 }}
                                            whileHover={{
                                                scale: 1.02,
                                                backgroundColor: "rgba(39,39,42,0.6)", // subtle zinc highlight
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center justify-between py-3 px-2 rounded-lg border-b border-zinc-800 last:border-0 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                    className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center"
                                                >
                                                    <Tag className="h-4 w-4 text-zinc-500" />
                                                </motion.div>
                                                <div>
                                                    <div className="font-medium text-zinc-100">{tx.title}</div>
                                                    <div className="text-sm text-zinc-400">
                                                        {tx.categories?.name || "Uncategorized"} •{" "}
                                                        {format(new Date(tx.date), "MMM dd")}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-red-400">
                                                    -{formatCurrency(tx.amount)}
                                                </div>
                                                {isToday(new Date(tx.date)) && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-zinc-700 text-zinc-300 text-xs"
                                                    >
                                                        Today
                                                    </Badge>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => !submitting && setOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <Card className="relative w-full max-w-md mx-auto shadow-2xl bg-zinc-900 rounded-xl border border-zinc-800">
                            <CardHeader className="p-6 pb-4">
                                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-zinc-50">
                                    <Plus className="h-6 w-6 text-blue-500" />
                                    Add New Expense
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <form onSubmit={handleAddExpense} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="title" className="text-sm font-medium text-zinc-300">Title</label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Coffee, Groceries, Uber..."
                                            required
                                            disabled={submitting}
                                            className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="amount" className="text-sm font-medium text-zinc-300">Amount (₹)</label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                required
                                                disabled={submitting}
                                                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="date" className="text-sm font-medium text-zinc-300">Date</label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                required
                                                disabled={submitting}
                                                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="category" className="text-sm font-medium text-zinc-300">Category</label>
                                        <Select value={categoryId} onValueChange={setCategoryId} disabled={submitting}>
                                            <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-zinc-100">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-3 bg-red-950/20 border border-red-800 rounded-lg flex items-center gap-2 text-red-300 text-sm"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                if (!submitting) {
                                                    setOpen(false);
                                                    setError("");
                                                }
                                            }}
                                            disabled={submitting}
                                            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitting || categories.length === 0}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30"
                                        >
                                            {submitting ? "Adding..." : "Add Expense"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
