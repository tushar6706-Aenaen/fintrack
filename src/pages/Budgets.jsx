import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import {
    Plus,
    AlertCircle,
    Target,
    TrendingUp,
    TrendingDown,
    Edit,
    Trash2,
    Calendar,
    Banknote,
    AlertTriangle,
    CheckCircle,
    Activity,
    PieChart,
    X,
    Folder,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    }
};

const progressVariants = {
    hidden: { scaleX: 0 },
    visible: {
        scaleX: 1,
        transition: {
            duration: 1,
            ease: "easeOut",
            delay: 0.3
        }
    }
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 50
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 50,
        transition: {
            duration: 0.2,
            ease: "easeIn"
        }
    }
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

function formatCurrency(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(n));
}

export default function Budgets() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        period_type: "monthly",
        start_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        end_date: format(endOfMonth(new Date()), "yyyy-MM-dd"),
        category_id: "",
        alert_threshold: "80"
    });

    // Period options
    const periodOptions = [
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "yearly", label: "Yearly" },
        { value: "custom", label: "Custom" }
    ];

    // Initialize auth
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) console.error("Auth error:", error);

                if (mounted) {
                    setUser(session?.user || null);
                    setAuthLoading(false);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                if (mounted) {
                    setUser(null);
                    setAuthLoading(false);
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (mounted) {
                    setUser(session?.user || null);
                    setAuthLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    // Load data when user changes
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        loadAll();

        const budgetChannel = supabase
            .channel('budgets-changes')
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "budgets",
                filter: `user_id=eq.${user.id}`
            }, () => {
                loadBudgets();
            })
            .subscribe();

        const expenseChannel = supabase
            .channel('expenses-changes-budgets')
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "expenses",
                filter: `user_id=eq.${user.id}`
            }, () => {
                loadExpenses();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(budgetChannel);
            supabase.removeChannel(expenseChannel);
        };
    }, [user?.id, authLoading]);

    async function loadAll() {
        setLoading(true);
        setError("");
        await Promise.all([loadBudgets(), loadCategories(), loadExpenses()]);
        setLoading(false);
    }

    async function loadBudgets() {
        if (!user?.id) {
            setBudgets([]);
            return;
        }
        try {
            const { data, error } = await supabase
                .from("budgets")
                .select(`
          id, name, amount, period_type, start_date, end_date, alert_threshold, is_active,
          categories (id, name, color, icon)
        `)
                .eq("user_id", user.id)
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) {
                setError(`Error loading budgets: ${error.message}`);
                return;
            }
            setBudgets(data || []);
        } catch (err) {
            setError(`Unexpected error loading budgets: ${err.message}`);
        }
    }

    async function loadCategories() {
        if (!user?.id) {
            setCategories([]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("categories")
                .select("id, name, description, color, icon")
                .eq("user_id", user.id)
                .eq("is_active", true)
                .order("name", { ascending: true });

            if (error) {
                setError(`Error loading categories: ${error.message}`);
                return;
            }
            setCategories(data || []);
        } catch (err) {
            setError(`Unexpected error loading categories: ${err.message}`);
        }
    }

    async function loadExpenses() {
        if (!user?.id) {
            setExpenses([]);
            return;
        }
        try {
            const { data, error } = await supabase
                .from("expenses")
                .select("id, amount, date, category_id")
                .eq("user_id", user.id)
                .order("date", { ascending: false });

            if (error) {
                setError(`Error loading expenses: ${error.message}`);
                return;
            }
            setExpenses(data || []);
        } catch (err) {
            setError(`Unexpected error loading expenses: ${err.message}`);
        }
    }

    // Calculate budget progress
    const calculateBudgetProgress = (budget) => {
        const startDate = parseISO(budget.start_date);
        const endDate = parseISO(budget.end_date);

        let relevantExpenses = expenses.filter(expense => {
            const expenseDate = parseISO(expense.date);
            const isInPeriod = isWithinInterval(expenseDate, { start: startDate, end: endDate });

            // If budget has a category, filter by category
            if (budget.categories) {
                return isInPeriod && expense.category_id === budget.categories.id;
            }

            return isInPeriod;
        });

        const totalSpent = relevantExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

        return {
            totalSpent,
            percentage: Math.min(percentage, 100),
            remaining: Math.max(budget.amount - totalSpent, 0),
            isOverBudget: totalSpent > budget.amount,
            isNearThreshold: percentage >= (budget.alert_threshold * 100)
        };
    };

    // Form handlers
    const resetForm = () => {
        setFormData({
            name: "",
            amount: "",
            period_type: "monthly",
            start_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
            end_date: format(endOfMonth(new Date()), "yyyy-MM-dd"),
            category_id: "",
            alert_threshold: "80"
        });
    };

    const handlePeriodChange = (period) => {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case "weekly":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
                break;
            case "monthly":
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case "quarterly":
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0); // Last day of the quarter
                break;
            case "yearly":
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                // Custom - don't change dates, use existing formData
                return;
        }
        setFormData(prev => ({
            ...prev,
            period_type: period,
            start_date: format(startDate, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd")
        }));
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        setError(""); // Clear any previous errors

        if (!user?.id) {
            setError("Authentication error: User not logged in.");
            return;
        }

        // Validate form data
        if (!formData.name.trim()) {
            setError("Budget name is required.");
            return;
        }
        const parsedAmount = parseFloat(formData.amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Amount must be a positive number.");
            return;
        }
        const threshold = parseFloat(formData.alert_threshold);
        if (Number.isNaN(threshold) || threshold <= 0 || threshold > 100) {
            setError("Alert threshold must be between 1 and 100.");
            return;
        }
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            setError("Start date cannot be after end date.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                user_id: user.id,
                name: formData.name.trim(),
                amount: parsedAmount,
                period_type: formData.period_type,
                start_date: formData.start_date,
                end_date: formData.end_date,
                category_id: formData.category_id || null, // Allow null for all categories
                alert_threshold: threshold / 100, // Convert percentage to decimal
                is_active: true
            };

            const { error } = await supabase.from("budgets").insert([payload]);

            if (error) {
                setError(`Failed to add budget: ${error.message}`);
            } else {
                resetForm();
                setShowAddModal(false);
                await loadBudgets(); // Refresh the list
            }
        } catch (err) {
            console.error("Unexpected error in handleAddBudget:", err);
            setError(`Unexpected error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };
    const handleEditBudget = async (e) => {
        e.preventDefault();
        if (!selectedBudget || !formData.name.trim() || !formData.amount || !formData.start_date || !formData.end_date) {
            setError("Please fill all required fields (Name, Amount, Start Date, End Date).");
            return;
        }

        const parsed = parseFloat(formData.amount);
        if (Number.isNaN(parsed) || parsed <= 0) {
            setError("Amount must be a positive number.");
            return;
        }

        const threshold = parseFloat(formData.alert_threshold) / 100;
        if (Number.isNaN(threshold) || threshold <= 0 || threshold > 1) {
            setError("Alert threshold must be between 1 and 100.");
            return;
        }

        // Basic date validation
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            setError("Start date cannot be after end date.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                amount: parsed,
                period_type: formData.period_type,
                start_date: formData.start_date,
                end_date: formData.end_date,
                category_id: formData.category_id || null,
                alert_threshold: threshold,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from("budgets")
                .update(payload)
                .eq("id", selectedBudget.id)
                .eq("user_id", user.id);

            if (error) {
                setError(`Failed to update budget: ${error.message}`);
            } else {
                resetForm();
                setShowEditModal(false);
                setSelectedBudget(null);
                setError("");
                await loadBudgets();
            }
        } catch (err) {
            setError(`Unexpected error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBudget = async () => {
        if (!selectedBudget) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from("budgets")
                .update({ is_active: false }) // Soft delete
                .eq("id", selectedBudget.id)
                .eq("user_id", user.id);

            if (error) {
                setError(`Failed to delete budget: ${error.message}`);
            } else {
                setShowDeleteModal(false);
                setSelectedBudget(null);
                setError("");
                await loadBudgets();
            }
        } catch (err) {
            setError(`Unexpected error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (budget) => {
        setSelectedBudget(budget);
        setFormData({
            name: budget.name,
            amount: budget.amount.toString(),
            period_type: budget.period_type,
            start_date: budget.start_date,
            end_date: budget.end_date,
            category_id: budget.categories?.id || "",
            alert_threshold: (budget.alert_threshold * 100).toString()
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (budget) => {
        setSelectedBudget(budget);
        setShowDeleteModal(true);
    };

    // Calculate overall stats
    const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
    const totalSpent = budgets.reduce((sum, budget) => {
        const progress = calculateBudgetProgress(budget);
        return sum + progress.totalSpent;
    }, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overBudgetCount = budgets.filter(budget => calculateBudgetProgress(budget).isOverBudget).length;

    // Loading and auth states
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-950">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="rounded-full h-8 w-8 border-b-2 border-zinc-50 mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="text-zinc-400">Loading...</div>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
                        <CardHeader className="text-center">
                            <CardTitle className="text-zinc-50">Authentication Required</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-zinc-400">
                                Please sign in to view your budgets.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-zinc-950 flex"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8">
                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="mb-6 p-4 bg-red-950/20 border border-red-800 rounded-lg flex items-center gap-3"
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-300 text-sm flex-1">{error}</span>
                            <motion.button
                                onClick={() => setError("")}
                                className="text-red-500 hover:text-red-600 p-1"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X className="h-4 w-4" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
                    variants={itemVariants}
                >
                    <div className="mb-4 sm:mb-0">
                        <motion.h1
                            className="text-3xl font-bold text-zinc-50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            Budgets
                        </motion.h1>
                        <motion.p
                            className="text-zinc-400 mt-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Set spending limits and track your progress
                        </motion.p>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => {
                                    resetForm();
                                    setShowAddModal(true);
                                }}
                                className="bg-zinc-50 hover:bg-zinc-200 text-zinc-900"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Budget
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {loading ? (
                    <motion.div
                        className="flex items-center justify-center h-64"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className="rounded-full h-8 w-8 border-b-2 border-zinc-50"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.div>
                ) : (
                    <>
                        {/* Summary Stats */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8"
                            variants={containerVariants}
                        >
                            {[
                                {
                                    title: "Total Budget",
                                    value: formatCurrency(totalBudget),
                                    subtitle: `${budgets.length} active budgets`,
                                    icon: Target,
                                    color: "blue"
                                },
                                {
                                    title: "Total Spent",
                                    value: formatCurrency(totalSpent),
                                    subtitle: "Across all budgets",
                                    icon: TrendingDown,
                                    color: "red"
                                },
                                {
                                    title: "Remaining",
                                    value: formatCurrency(totalRemaining),
                                    subtitle: "Available to spend",
                                    icon: Banknote,
                                    color: "green"
                                },
                                {
                                    title: "Over Budget",
                                    value: overBudgetCount,
                                    subtitle: "Budgets exceeded",
                                    icon: AlertTriangle,
                                    color: "orange"
                                }
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.title}
                                    variants={cardVariants}
                                    whileHover="hover"
                                    custom={index}
                                >
                                    <Card className="bg-gradient-to-br from-zinc-950 to-zinc-900   border-zinc-800">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-zinc-400">
                                                {stat.title}
                                            </CardTitle>
                                            <stat.icon className={`h-4 w-4 text-${stat.color}-400`} />
                                        </CardHeader>
                                        <CardContent>
                                            <motion.div
                                                className="text-2xl font-bold text-zinc-50"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                {stat.value}
                                            </motion.div>
                                            <p className="text-xs text-zinc-400 mt-1">
                                                {stat.subtitle}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Budgets List */}
                        <motion.div variants={itemVariants}>
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-zinc-50 flex items-center gap-2">
                                            <PieChart className="h-5 w-5 text-blue-400" />
                                            Your Budgets
                                        </CardTitle>
                                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                                            {budgets.length} active
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {budgets.length === 0 ? (
                                        <motion.div
                                            className="text-center py-16"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <motion.div
                                                className="relative w-20 h-20 mx-auto mb-6"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.4 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
                                                <div className="relative w-full h-full bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                                                    <Target className="h-8 w-8 text-blue-400" />
                                                </div>
                                            </motion.div>
                                            <motion.h3
                                                className="text-xl font-semibold text-zinc-50 mb-2"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                No budgets created yet
                                            </motion.h3>
                                            <motion.p
                                                className="text-zinc-400 mb-6 max-w-sm mx-auto"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                Take control of your finances by setting spending limits and tracking your progress.
                                            </motion.p>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    onClick={() => setShowAddModal(true)}
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                                                    size="lg"
                                                >
                                                    <Plus className="w-5 h-5 mr-2" />
                                                    Create Your First Budget
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            className="grid gap-4"
                                            variants={containerVariants}
                                        >
                                            <AnimatePresence>
                                                {budgets.map((budget, index) => {
                                                    const progress = calculateBudgetProgress(budget);
                                                    return (
                                                        <motion.div
                                                            key={budget.id}
                                                            className="group relative overflow-hidden rounded-xl border border-zinc-700 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-sm hover:from-zinc-800/70 hover:to-zinc-900/70 transition-all duration-300"
                                                            variants={itemVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                                            whileHover={{ scale: 1.02, y: -4 }}
                                                            transition={{ duration: 0.3, type: "spring", bounce: 0.1 }}
                                                            layout
                                                        >
                                                            {/* Background gradient overlay */}
                                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                <div className={`absolute inset-0 bg-gradient-to-r ${progress.isOverBudget
                                                                    ? "from-red-500/5 to-red-600/5"
                                                                    : progress.isNearThreshold
                                                                        ? "from-orange-500/5 to-orange-600/5"
                                                                        : "from-emerald-500/5 to-blue-500/5"
                                                                    }`} />
                                                            </div>

                                                            <div className="relative p-6">
                                                                {/* Header Section */}
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <motion.h4
                                                                                className="text-lg font-semibold text-zinc-50"
                                                                                initial={{ opacity: 0, x: -20 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{ delay: 0.1 + index * 0.05 }}
                                                                            >
                                                                                {budget.name}
                                                                            </motion.h4>
                                                                            <motion.div
                                                                                initial={{ opacity: 0, scale: 0 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                transition={{ delay: 0.2 + index * 0.05 }}
                                                                            >
                                                                                <Badge
                                                                                    className={`text-xs font-medium px-2 py-1 ${progress.isOverBudget
                                                                                        ? "bg-red-900/40 text-red-300 border-red-700/50"
                                                                                        : progress.isNearThreshold
                                                                                            ? "bg-orange-900/40 text-orange-300 border-orange-700/50"
                                                                                            : "bg-emerald-900/40 text-emerald-300 border-emerald-700/50"
                                                                                        }`}
                                                                                >
                                                                                    {budget.period_type}
                                                                                </Badge>
                                                                            </motion.div>
                                                                        </div>

                                                                        {/* Info Row */}
                                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-3">
                                                                            <motion.span
                                                                                className="flex items-center gap-1 font-medium"
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                transition={{ delay: 0.3 + index * 0.05 }}
                                                                            >
                                                                                <Banknote className="w-3 h-3" />
                                                                                {formatCurrency(budget.amount)} budget
                                                                            </motion.span>
                                                                            {budget.categories && (
                                                                                <motion.span
                                                                                    className="flex items-center gap-1"
                                                                                    initial={{ opacity: 0, y: 10 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    transition={{ delay: 0.4 + index * 0.05 }}
                                                                                >
                                                                                    <span className="text-base">{budget.categories.icon || "📁"}</span>
                                                                                    {budget.categories.name}
                                                                                </motion.span>
                                                                            )}
                                                                            <motion.span
                                                                                className="flex items-center gap-1"
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                transition={{ delay: 0.5 + index * 0.05 }}
                                                                            >
                                                                                <Calendar className="w-3 h-3" />
                                                                                {format(parseISO(budget.start_date), "MMM dd")} - {format(parseISO(budget.end_date), "MMM dd")}
                                                                            </motion.span>
                                                                        </div>

                                                                        {/* Amount Summary */}
                                                                        <motion.div
                                                                            className="flex items-center justify-between text-sm mb-4"
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.6 + index * 0.05 }}
                                                                        >
                                                                            <div className="flex items-center gap-4">
                                                                                <span className="text-zinc-400">
                                                                                    Spent: <span className="text-zinc-200 font-semibold">{formatCurrency(progress.totalSpent)}</span>
                                                                                </span>
                                                                                <span className={`font-semibold ${progress.isOverBudget ? "text-red-400" : "text-emerald-400"}`}>
                                                                                    {progress.isOverBudget
                                                                                        ? `Over by ${formatCurrency(progress.totalSpent - budget.amount)}`
                                                                                        : `${formatCurrency(progress.remaining)} left`
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <span className={`text-lg font-bold ${progress.isOverBudget ? "text-red-400" :
                                                                                progress.isNearThreshold ? "text-orange-400" : "text-emerald-400"
                                                                                }`}>
                                                                                {progress.percentage.toFixed(0)}%
                                                                            </span>
                                                                        </motion.div>
                                                                    </div>

                                                                    {/* Action Buttons */}
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                        <motion.button
                                                                            onClick={() => openEditModal(budget)}
                                                                            className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                                                                            whileHover={{ scale: 1.1 }}
                                                                            whileTap={{ scale: 0.9 }}
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </motion.button>
                                                                        <motion.button
                                                                            onClick={() => openDeleteModal(budget)}
                                                                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                                                            whileHover={{ scale: 1.1 }}
                                                                            whileTap={{ scale: 0.9 }}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </motion.button>
                                                                    </div>
                                                                </div>

                                                                {/* Progress Bar */}
                                                                <div className="space-y-2">
                                                                    <div className="relative w-full h-3 bg-zinc-700/50 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            className={`absolute inset-y-0 left-0 rounded-full ${progress.isOverBudget
                                                                                ? "bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/30"
                                                                                : progress.isNearThreshold
                                                                                    ? "bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-lg shadow-orange-500/30"
                                                                                    : "bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 shadow-lg shadow-blue-500/30"
                                                                                }`}
                                                                            initial={{ width: 0, scale: 0.8 }}
                                                                            animate={{
                                                                                width: `${Math.min(progress.percentage, 100)}%`,
                                                                                scale: 1
                                                                            }}
                                                                            transition={{
                                                                                duration: 1.2,
                                                                                ease: "easeOut",
                                                                                delay: 0.8 + index * 0.1,
                                                                                scale: { duration: 0.5 }
                                                                            }}
                                                                        />
                                                                        {/* Progress bar shine effect */}
                                                                        <motion.div
                                                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                                            animate={{ x: [-100, 300] }}
                                                                            transition={{
                                                                                duration: 2,
                                                                                delay: 1.5 + index * 0.1,
                                                                                ease: "easeInOut"
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    {/* Status Indicators */}
                                                                    <motion.div
                                                                        className="flex justify-between items-center"
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        transition={{ delay: 1.2 + index * 0.1 }}
                                                                    >
                                                                        <span className="text-xs text-zinc-500">
                                                                            {progress.percentage.toFixed(1)}% of budget used
                                                                        </span>
                                                                        {progress.isNearThreshold && !progress.isOverBudget && (
                                                                            <motion.span
                                                                                className="text-xs text-orange-400 flex items-center gap-1 bg-orange-900/20 px-2 py-1 rounded-full"
                                                                                initial={{ opacity: 0, scale: 0 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                transition={{ delay: 1.3 + index * 0.1 }}
                                                                            >
                                                                                <AlertTriangle className="w-3 h-3" />
                                                                                Near limit ({budget.alert_threshold * 100}%)
                                                                            </motion.span>
                                                                        )}
                                                                        {progress.isOverBudget && (
                                                                            <motion.span
                                                                                className="text-xs text-red-400 flex items-center gap-1 bg-red-900/20 px-2 py-1 rounded-full"
                                                                                initial={{ opacity: 0, scale: 0 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                transition={{ delay: 1.3 + index * 0.1 }}
                                                                            >
                                                                                <AlertCircle className="w-3 h-3" />
                                                                                Budget exceeded
                                                                            </motion.span>
                                                                        )}
                                                                    </motion.div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </>
                )}

                {/* Add Budget Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div
                                className="w-full max-w-lg bg-zinc-900 rounded-lg p-6 shadow-2xl border border-zinc-800"
                                variants={modalVariants}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-zinc-50">Create New Budget</h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowAddModal(false)}
                                        className="text-zinc-400 hover:bg-zinc-800"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <form onSubmit={handleAddBudget} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-zinc-400">Budget Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="e.g., Monthly Groceries"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount" className="text-zinc-400">Budget Amount (₹)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="10000"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category" className=" text-zinc-400">Category (Optional)</Label>
                                        <Select
                                        
                                            value={formData.category_id}
                                            onValueChange={(value) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    category_id: value === "all" ? "" : value, // Handle the "all" value
                                                }));
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All categories"  />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 ">
                                                <SelectItem  value="all">All categories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        <div className="flex items-center gap-2 ">
                                                            <span
                                                                className="w-2 h-2 rounded-full"
                                                                style={{ backgroundColor: category.color }}
                                                            />
                                                            <span>{category.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="period" className="text-zinc-400">Period Type</Label>
                                        <Select
                                            value={formData.period_type}
                                            onValueChange={handlePeriodChange}
                                        >
                                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-50">
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-50">
                                                {periodOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.period_type === "custom" && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="start_date" className="text-zinc-400">Start Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-50", !formData.start_date && "text-zinc-500")}
                                                        >
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {formData.start_date ? format(parseISO(formData.start_date), "PPP") : "Pick a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700">
                                                        <DayPicker
                                                            mode="single"
                                                            selected={parseISO(formData.start_date)}
                                                            onSelect={(date) => setFormData({ ...formData, start_date: format(date, "yyyy-MM-dd") })}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="end_date" className="text-zinc-400">End Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-50", !formData.end_date && "text-zinc-500")}
                                                        >
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {formData.end_date ? format(parseISO(formData.end_date), "PPP") : "Pick a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700">
                                                        <DayPicker
                                                            mode="single"
                                                            selected={parseISO(formData.end_date)}
                                                            onSelect={(date) => setFormData({ ...formData, end_date: format(date, "yyyy-MM-dd") })}
                                                            initialFocus
                                                            fromMonth={parseISO(formData.start_date)}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="alert_threshold" className="text-zinc-400">Alert Threshold (%)</Label>
                                        <Input
                                            id="alert_threshold"
                                            type="number"
                                            placeholder="80"
                                            value={formData.alert_threshold}
                                            onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                                            className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                                            min="1"
                                            max="100"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setShowAddModal(false)}
                                            className="bg-zinc-700 text-zinc-50 hover:bg-zinc-600"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Saving..." : "Create"}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Budget Modal */}
                <AnimatePresence>
                    {showEditModal && selectedBudget && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div
                                className="w-full max-w-lg bg-zinc-900 rounded-lg p-6 shadow-2xl border border-zinc-800"
                                variants={modalVariants}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-zinc-50">Edit Budget</h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowEditModal(false)}
                                        className="text-zinc-400 hover:bg-zinc-800"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <form onSubmit={handleEditBudget} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-name" className="text-zinc-400">Budget Name</Label>
                                            <Input
                                                id="edit-name"
                                                type="text"
                                                placeholder="e.g., Monthly Groceries"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-amount" className="text-zinc-400">Budget Amount (₹)</Label>
                                            <Input
                                                id="edit-amount"
                                                type="number"
                                                placeholder="10000"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-category" className="text-zinc-400">Category (Optional)</Label>
                                        <Select
                                            value={formData.category_id}
                                            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                        >
                                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-50">
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-50">
                                                <SelectItem value="">All Categories</SelectItem>
                                                {categories.map(category => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        <div className="flex items-center gap-2">
                                                            {category.icon || <Folder className="h-4 w-4" />} {category.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-period" className="text-zinc-400">Period Type</Label>
                                        <Select
                                            value={formData.period_type}
                                            onValueChange={handlePeriodChange}
                                        >
                                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-50">
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-50">
                                                {periodOptions.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.period_type === "custom" && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-start_date" className="text-zinc-400">Start Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-50", !formData.start_date && "text-zinc-500")}
                                                        >
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {formData.start_date ? format(parseISO(formData.start_date), "PPP") : "Pick a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700">
                                                        <DayPicker
                                                            mode="single"
                                                            selected={parseISO(formData.start_date)}
                                                            onSelect={(date) => setFormData({ ...formData, start_date: format(date, "yyyy-MM-dd") })}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-end_date" className="text-zinc-400">End Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-50", !formData.end_date && "text-zinc-500")}
                                                        >
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {formData.end_date ? format(parseISO(formData.end_date), "PPP") : "Pick a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700">
                                                        <DayPicker
                                                            mode="single"
                                                            selected={parseISO(formData.end_date)}
                                                            onSelect={(date) => setFormData({ ...formData, end_date: format(date, "yyyy-MM-dd") })}
                                                            initialFocus
                                                            fromMonth={parseISO(formData.start_date)}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-alert_threshold" className="text-zinc-400">Alert Threshold (%)</Label>
                                        <Input
                                            id="edit-alert_threshold"
                                            type="number"
                                            placeholder="80"
                                            value={formData.alert_threshold}
                                            onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                                            className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
                                            min="1"
                                            max="100"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setShowEditModal(false)}
                                            className="bg-zinc-700 text-zinc-50 hover:bg-zinc-600"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-zinc-50 text-zinc-900 hover:bg-zinc-200"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Budget Modal */}
                <AnimatePresence>
                    {showDeleteModal && selectedBudget && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div
                                className="w-full max-w-sm bg-zinc-900 rounded-lg p-6 shadow-2xl border border-zinc-800"
                                variants={modalVariants}
                            >
                                <DialogHeader className="mb-4">
                                    <DialogTitle className="text-xl font-bold text-zinc-50">Confirm Deletion</DialogTitle>
                                    <DialogDescription className="text-zinc-400">
                                        Are you sure you want to delete the budget "{selectedBudget.name}"? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowDeleteModal(false)}
                                            className="bg-zinc-700 text-zinc-50 hover:bg-zinc-600"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteBudget}
                                            className="bg-red-600 text-zinc-50 hover:bg-red-700"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Deleting..." : "Delete"}
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}