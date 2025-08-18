import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from "../lib/supabaseClient";
import { subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion"; // Import motion from framer-motion
import { callGeminiApi } from '@/lib/geminiApi';
import {
    Search, Filter, Download, Calendar, TrendingUp, Users, Activity, ChevronDown, Eye, FileText, PieChart, AlertCircle, RefreshCw, ArrowUpRight, ArrowDownRight,
    Target, Wallet, CreditCard, Banknote, TrendingDown, Lightbulb, Plus, X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import regular Button component
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Create a MotionButton component by wrapping the shadcn/ui Button
const MotionButton = motion(Button);

// --- Animation Variants ---
const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const statsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const statCardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } },
    hover: { scale: 1.03, transition: { type: "spring", stiffness: 200, damping: 10 } },
};

const filterButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

const reportCardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    hover: { scale: 1.02, transition: { type: "spring", stiffness: 200, damping: 10 } },
};

const modalOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const modalContentVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 50 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
    exit: { scale: 0.9, opacity: 0, y: 50, transition: { duration: 0.2 } },
};

// New AI Section Variants
const aiCardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } },
};

const aiContentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};

const aiTextItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

// --- End Animation Variants ---

function formatCurrency(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(n));
}

// Utility to convert a single line for basic markdown (e.g., bolding).
// This is a minimal implementation, not a full markdown parser.
const processLineForMarkdown = (line) => {
    // Convert bold text: **text** to <strong>text</strong>
    return line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};


const ReportsPage = () => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [categories, setCategories] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [groups, setGroups] = useState([]); // State for groups
    const [selectedGroupId, setSelectedGroupId] = useState('personal'); // New state for selected group view

    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('last-30-days');
    const [selectedReport, setSelectedReport] = useState(null);

    // States for AI integration
    const [aiTips, setAiTips] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    // States for Group Modals
   
    // Initialize auth state
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

    // Load all necessary data when user changes or on mount/selectedGroupId change
    const loadAllData = async () => {
        setLoading(true);
        setError("");
        try {
            const userId = user?.id;
            if (!userId) {
                setLoading(false);
                return;
            }

            // Always fetch groups the user is a member of
            const { data: groupsData, error: groupsError } = await supabase
                .from("groups")
                .select("*")
                .contains('members', [userId]);
            if (groupsError) throw groupsError;
            setGroups(groupsData || []);
            console.log("ReportsPage: Fetched groupsData (after setGroups):", groupsData);

            let expensesData = [];
            let incomeData = [];
            let categoriesData = [];
            let savingsGoalsData = [];
            let budgetsData = [];

            if (selectedGroupId === 'personal') {
                // Fetch personal data (where group_id is NULL)
                const [{ data: expData, error: expError },
                       { data: incData, error: incError },
                       { data: catData, error: catError },
                       { data: sgData, error: sgError },
                       { data: budData, error: budError }] = await Promise.all([
                    supabase.from("expenses").select("*").eq("user_id", userId).is("group_id", null).order("date", { ascending: false }),
                    supabase.from("income").select("*").eq("user_id", userId).is("group_id", null).order("date", { ascending: false }),
                    supabase.from("categories").select("id, name, icon, color").eq("user_id", userId).eq("is_active", true),
                    supabase.from("savings_goals").select("*").eq("user_id", userId),
                    supabase.from("budgets").select("*").eq("user_id", userId).is("group_id", null).eq("is_active", true)
                ]);
                if (expError) throw expError; if (incError) throw incError; if (catError) throw catError;
                if (sgError) throw sgError; if (budError) throw budError;

                expensesData = expData;
                incomeData = incData;
                categoriesData = catData;
                savingsGoalsData = sgData;
                budgetsData = budData;

            } else {
                // Fetch group data (where group_id matches selectedGroupId)
                const [{ data: expData, error: expError },
                       { data: incData, error: incError },
                       { data: catData, error: catError }, // Categories are still user-specific
                       { data: sgData, error: sgError }, // Savings goals are still user-specific
                       { data: budData, error: budError }] = await Promise.all([
                    supabase.from("expenses").select("*").eq("group_id", selectedGroupId).order("date", { ascending: false }),
                    supabase.from("income").select("*").eq("group_id", selectedGroupId).order("date", { ascending: false }),
                    supabase.from("categories").select("id, name, icon, color").eq("user_id", userId).eq("is_active", true), // Categories are fetched for the current user's categories
                    supabase.from("savings_goals").select("*").eq("user_id", userId), // Savings goals are fetched for the current user's goals
                    supabase.from("budgets").select("*").eq("group_id", selectedGroupId).eq("is_active", true)
                ]);
                if (expError) throw expError; if (incError) throw incError; if (catError) throw catError;
                if (sgError) throw sgError; if (budError) throw budError;

                expensesData = expData;
                incomeData = incData;
                categoriesData = catData; // Still fetch user's categories for display
                savingsGoalsData = sgData; // Still fetch user's savings goals
                budgetsData = budData;
            }

            setExpenses(expensesData || []);
            setIncome(incomeData || []);
            setCategories(categoriesData || []);
            setSavingsGoals(savingsGoalsData || []);
            setBudgets(budgetsData || []);


        } catch (err) {
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Effect to trigger data load when user changes or on mount/selectedGroupId change
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        loadAllData(); // Initial data load

        const userId = user.id;

        // Setup real-time subscriptions for all relevant tables
        const channelsToSubscribe = [
            // Personal expenses/income/budgets
            supabase.channel('personal-data-changes')
                .on("postgres_changes", { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}.and.group_id=is.null` }, () => loadAllData())
                .on("postgres_changes", { event: "*", schema: "public", table: "income", filter: `user_id=eq.${userId}.and.group_id=is.null` }, () => loadAllData())
                .on("postgres_changes", { event: "*", schema: "public", table: "budgets", filter: `user_id=eq.${userId}.and.group_id=is.null` }, () => loadAllData())
                .subscribe(),
            // User-specific categories/savings goals (always personal)
            supabase.channel('user-settings-changes')
                .on("postgres_changes", { event: "*", schema: "public", table: "categories", filter: `user_id=eq.${userId}` }, () => loadAllData())
                .on("postgres_changes", { event: "*", schema: "public", table: "savings_goals", filter: `user_id=eq.${userId}` }, () => loadAllData())
                .subscribe(),
            // Groups where the user is a member (this will trigger when you join a new group!)
            supabase.channel('user-groups-changes')
                .on("postgres_changes", { event: "*", schema: "public", table: "groups", filter: `members.cs.{${JSON.stringify(userId)}}` }, (payload) => {
                    console.log("ReportsPage: Realtime group update detected:", payload);
                    loadAllData(); // Refresh all data including groups
                })
                .subscribe()
        ];

        // If a group is selected, also listen for changes in that specific group's data
        if (selectedGroupId !== 'personal') {
            channelsToSubscribe.push(
                supabase.channel(`group-${selectedGroupId}-data-changes`)
                    .on("postgres_changes", { event: "*", schema: "public", table: "expenses", filter: `group_id=eq.${selectedGroupId}` }, () => loadAllData())
                    .on("postgres_changes", { event: "*", schema: "public", table: "income", filter: `group_id=eq.${selectedGroupId}` }, () => loadAllData())
                    .on("postgres_changes", { event: "*", schema: "public", table: "budgets", filter: `group_id=eq.${selectedGroupId}` }, () => loadAllData())
                    .subscribe()
            );
        }

        return () => {
            channelsToSubscribe.forEach(channel => {
                if (channel) {
                    supabase.removeChannel(channel);
                }
            });
        };
    }, [user?.id, authLoading, selectedGroupId]);


    // Derive reports and quick stats from fetched data
    const { generatedReports, quickStats, reportCategories, detailedReports, totalExpenses, totalIncome, netIncome } = useMemo(() => {
        const today = new Date();
        let startDateFilter, endDateFilter;

        switch (dateRange) {
            case 'last-7-days':
                startDateFilter = subDays(today, 7);
                endDateFilter = today;
                break;
            case 'last-30-days':
                startDateFilter = subDays(today, 30);
                endDateFilter = today;
                break;
            case 'last-3-months':
                startDateFilter = subDays(today, 90);
                endDateFilter = today;
                break;
            case 'last-year':
                startDateFilter = subDays(today, 365);
                endDateFilter = today;
                break;
            case 'all-time':
                startDateFilter = new Date(0);
                endDateFilter = today;
                break;
            default:
                startDateFilter = new Date(0);
                endDateFilter = today;
        }

        const filteredExpenses = expenses.filter(exp =>
            exp.date && isWithinInterval(parseISO(exp.date), { start: startDateFilter, end: endDateFilter })
        );
        const filteredIncome = income.filter(inc =>
            inc.date && isWithinInterval(parseISO(inc.date), { start: startDateFilter, end: endDateFilter })
        );

        const calculatedTotalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
        const calculatedTotalIncome = filteredIncome.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
        const calculatedNetIncome = calculatedTotalIncome - calculatedTotalExpenses;

        const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
            const category = categories.find(cat => cat.id === exp.category_id);
            const categoryName = category?.name || "Uncategorized";
            acc[categoryName] = {
                amount: (acc[categoryName]?.amount || 0) + Number(exp.amount || 0),
                count: (acc[categoryName]?.count || 0) + 1,
                color: category?.color || '#6b7280'
            };
            return acc;
        }, {});

        const incomeBySource = filteredIncome.reduce((acc, inc) => {
            const source = inc.source || 'other';
            acc[source] = (acc[source] || 0) + Number(inc.amount || 0);
            return acc;
        }, {});

        const activeSavingsGoals = savingsGoals.filter(goal => !goal.is_achieved);
        const achievedSavingsGoals = savingsGoals.filter(goal => goal.is_achieved);
        const totalSavingsTarget = activeSavingsGoals.reduce((sum, goal) => sum + Number(goal.target_amount || 0), 0);
        const totalSavingsProgress = activeSavingsGoals.reduce((sum, goal) => sum + Number(goal.current_amount || 0), 0);

        const budgetAnalysis = budgets.map(budget => {
            const budgetStartDate = parseISO(budget.start_date);
            const budgetEndDate = parseISO(budget.end_date);

            const expensesForBudgetPeriod = expenses.filter(exp => {
                const expenseDate = parseISO(exp.date);
                const matchesGroupFilter = selectedGroupId === 'personal'
                    ? exp.group_id === null
                    : exp.group_id === selectedGroupId;

                return matchesGroupFilter &&
                       isWithinInterval(expenseDate, { start: budgetStartDate, end: budgetEndDate }) &&
                       (budget.category_id ? exp.category_id === budget.category_id : true);
            });

            const categoryExpenses = expensesForBudgetPeriod
                .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
            const budgetAmount = Number(budget.amount || 0);
            const percentage = budgetAmount > 0 ? (categoryExpenses / budgetAmount) * 100 : 0;
            return {
                ...budget,
                spent: categoryExpenses,
                percentage: percentage,
                remaining: budgetAmount - categoryExpenses,
                status: percentage > 100 ? 'over' : percentage >= (budget.alert_threshold * 100) ? 'warning' : 'good'
            };
        });

        const paymentMethods = filteredExpenses.reduce((acc, exp) => {
            const method = exp.payment_method || 'cash';
            acc[method] = (acc[method] || 0) + Number(exp.amount || 0);
            return acc;
        }, {});

        const generated = [
            {
                id: '1',
                title: 'Net Cash Flow Analysis',
                category: 'financial',
                description: `${calculatedNetIncome >= 0 ? 'Positive' : 'Negative'} cash flow: ${formatCurrency(calculatedNetIncome)}. Income: ${formatCurrency(calculatedTotalIncome)}, Expenses: ${formatCurrency(calculatedTotalExpenses)}`,
                lastGenerated: new Date().toISOString(),
                size: 'Live Data',
                format: 'Interactive',
                status: 'ready',
                icon: calculatedNetIncome >= 0 ? TrendingUp : TrendingDown,
                color: calculatedNetIncome >= 0 ? 'bg-green-600' : 'bg-red-600',
                data: { totalIncome: calculatedTotalIncome, totalExpenses: calculatedTotalExpenses, netIncome: calculatedNetIncome }
            },
            {
                id: '2',
                title: 'Expense Category Breakdown',
                category: 'analytics',
                description: `Spending across ${Object.keys(expensesByCategory).length} categories. ${Object.keys(expensesByCategory).length > 0 ? `Top: ${Object.entries(expensesByCategory).sort((a, b) => b[1].amount - a[1].amount)[0]?.[0]}` : 'No expenses yet'}`,
                lastGenerated: new Date().toISOString(),
                size: 'Live Data',
                format: 'Interactive',
                status: 'ready',
                icon: PieChart,
                color: 'bg-indigo-600',
                data: expensesByCategory
            },
            {
                id: '3',
                title: 'Income Sources Report',
                category: 'financial',
                description: `${Object.keys(incomeBySource).length} income sources totaling ${formatCurrency(calculatedTotalIncome)}`,
                lastGenerated: new Date().toISOString(),
                size: 'Live Data',
                format: 'Interactive',
                status: 'ready',
                icon: Banknote,
                color: 'bg-blue-600',
                data: incomeBySource
            },
            {
                id: '4',
                title: 'Savings Goals Progress',
                category: 'savings',
                description: `${activeSavingsGoals.length} active goals. Progress: ${formatCurrency(totalSavingsProgress)} of ${formatCurrency(totalSavingsTarget)} (${totalSavingsTarget > 0 ? Math.round((totalSavingsProgress / totalSavingsTarget) * 100) : 0}%)`,
                lastGenerated: new Date().toISOString(),
                size: 'Live Data',
                format: 'Interactive',
                status: 'ready',
                icon: Target,
                color: 'bg-purple-600',
                data: { activeSavingsGoals, totalSavingsTarget, totalSavingsProgress }
            },
            {
                id: '5',
                title: 'Budget Performance',
                category: 'budgets',
                description: `${budgets.length} active budgets. ${budgetAnalysis.filter(b => b.status === 'over').length} over budget, ${budgetAnalysis.filter(b => b.status === 'warning').length} approaching limit`,
                lastGenerated: new Date().toISOString(),
                size: 'Live Data',
                format: 'Interactive',
                status: 'ready',
                icon: Wallet,
                color: 'bg-orange-600',
                data: budgetAnalysis
            },
            {
                id: '6',
                title: 'Payment Methods Analysis',
                category: 'analytics',
                description: `Spending breakdown by payment method. ${Object.keys(paymentMethods).length > 0 ? `Most used: ${Object.entries(paymentMethods).sort((a, b) => b[1] - a[1])[0]?.[0]}` : 'No payment data'}`,
                lastGenerated: new Date().toISOString(),
                size: 'Live Data',
                format: 'Interactive',
                status: 'ready',
                icon: CreditCard,
                color: 'bg-teal-600',
                data: paymentMethods
            }
        ];

        const currentReportCategories = [
            { id: 'all', name: 'All Reports', count: generated.length },
            { id: 'financial', name: 'Financial', count: generated.filter(r => r.category === 'financial').length },
            { id: 'analytics', name: 'Analytics', count: generated.filter(r => r.category === 'analytics').length },
            { id: 'savings', name: 'Savings', count: generated.filter(r => r.category === 'savings').length },
            { id: 'budgets', name: 'Budgets', count: generated.filter(r => r.category === 'budgets').length },
        ];

        const last30DaysExpenses = expenses.filter(exp =>
            exp.date && isWithinInterval(parseISO(exp.date), { start: subDays(today, 30), end: today })
        ).reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

        const previous30DaysExpenses = expenses.filter(exp =>
            exp.date && isWithinInterval(parseISO(exp.date), { start: subDays(today, 60), end: subDays(today, 30) })
        ).reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

        const expensesTrend = previous30DaysExpenses > 0 ? ((last30DaysExpenses - previous30DaysExpenses) / previous30DaysExpenses * 100).toFixed(1) : 0;

        const last30DaysIncome = income.filter(inc =>
            inc.date && isWithinInterval(parseISO(inc.date), { start: subDays(today, 30), end: today })
        ).reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
        const previous30DaysIncome = income.filter(inc =>
            inc.date && isWithinInterval(parseISO(inc.date), { start: subDays(today, 60), end: subDays(today, 30) })
        ).reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
        const incomeTrend = previous30DaysIncome > 0 ? ((last30DaysIncome - previous30DaysIncome) / previous30DaysIncome * 100) : 0;


        const currentQuickStats = [
            {
                label: 'Net Cash Flow',
                value: formatCurrency(calculatedNetIncome),
                change: `${calculatedNetIncome >= 0 ? 'Positive' : 'Negative'}`,
                trend: calculatedNetIncome >= 0 ? 'up' : 'down',
                icon: calculatedNetIncome >= 0 ? ArrowUpRight : ArrowDownRight
            },
            {
                label: 'Total Expenses',
                value: formatCurrency(calculatedTotalExpenses),
                change: `${expensesTrend > 0 ? '+' : ''}${expensesTrend}% vs Last 30 Days`,
                trend: expensesTrend > 0 ? 'up' : expensesTrend < 0 ? 'down' : 'neutral',
                icon: Activity
            },
            {
                label: 'Total Income',
                value: formatCurrency(calculatedTotalIncome),
                change: `${incomeTrend > 0 ? '+' : ''}${incomeTrend}% vs Last 30 Days`,
                trend: incomeTrend > 0 ? 'up' : incomeTrend < 0 ? 'down' : 'neutral',
                icon: Banknote
            },
            {
                label: 'Savings Progress',
                value: `${totalSavingsTarget > 0 ? Math.round((totalSavingsProgress / totalSavingsTarget) * 100) : 0}%`,
                change: `${activeSavingsGoals.length} Goals`,
                trend: totalSavingsProgress > 0 ? 'up' : 'neutral',
                icon: Target
            }
        ];

        return {
            generatedReports: generated,
            quickStats: currentQuickStats,
            reportCategories: currentReportCategories,
            detailedReports: {
                expensesByCategory,
                incomeBySource,
                budgetAnalysis,
                paymentMethods,
                savingsGoals: { activeSavingsGoals, achievedSavingsGoals }
            },
            totalExpenses: calculatedTotalExpenses,
            totalIncome: calculatedTotalIncome,
            netIncome: calculatedNetIncome
        };
    }, [expenses, income, categories, savingsGoals, budgets, dateRange, selectedGroupId]);


    const filteredReports = generatedReports.filter(report => {
        const matchesFilter = activeFilter === 'all' || report.category === activeFilter;
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Just now';
        }
    };

    const exportReport = (report) => {
        try {
            let csvContent = '';
            let filename = '';

            switch (report.id) {
                case '1':
                    csvContent = 'Metric,Amount\n' +
                                 `Total Income,${report.data.totalIncome}\n` +
                                 `Total Expenses,${report.data.totalExpenses}\n` +
                                 `Net Income,${report.data.netIncome}`;
                    filename = 'net-cash-flow.csv';
                    break;
                case '2':
                    csvContent = 'Category,Amount,Transaction Count\n' +
                        Object.entries(report.data || {}).map(([cat, data]) =>
                            `${cat},${data.amount || 0},${data.count || 0}`
                        ).join('\n');
                    filename = 'expense-categories.csv';
                    break;
                case '3':
                    csvContent = 'Source,Amount\n' +
                        Object.entries(report.data || {}).map(([source, amount]) =>
                            `${source},${amount || 0}`
                        ).join('\n');
                    filename = 'income-sources.csv';
                    break;
                case '4':
                    csvContent = 'Goal Name,Target Amount,Current Amount,Target Date,Progress (%)\n' +
                                 report.data.activeSavingsGoals.map(goal => {
                                    const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount * 100).toFixed(1) : 0;
                                    return `${goal.name},${goal.target_amount},${goal.current_amount},${goal.target_date || 'N/A'},${progress}`;
                                }).join('\n');
                    filename = 'savings-goals.csv';
                    break;
                case '5':
                    csvContent = 'Budget Name,Amount,Spent,Remaining,Percentage Used (%),Status\n' +
                                 report.data.map(budget =>
                                    `${budget.name},${budget.amount || 0},${budget.spent || 0},${budget.remaining || 0},${budget.percentage.toFixed(1) || 0},${budget.status}`
                                ).join('\n');
                    filename = 'budget-performance.csv';
                    break;
                case '6':
                    csvContent = 'Payment Method,Total Spent\n' +
                                 Object.entries(report.data || {}).map(([method, amount]) =>
                                    `${method},${amount || 0}`
                                ).join('\n');
                    filename = 'payment-methods.csv';
                    break;
                default:
                    csvContent = `Report: ${report.title}\nGenerated: ${new Date().toISOString()}\nDescription: ${report.description}`;
                    filename = `${report.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
            }

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export failed:', error);
            setError(`Failed to export report: ${error.message}`);
        }
    };

    // Function to generate AI tips
    const handleGenerateTips = async () => {
        setAiLoading(true);
        setAiTips("");
        setError("");

        try {
            const topExpenseCategories = Object.entries(detailedReports.expensesByCategory || {})
                .sort((a, b) => b[1].amount - a[1].amount)
                .slice(0, 5)
                .map(([name, data]) => `${name}: ${formatCurrency(data.amount)} (${data.count} transactions)`)
                .join(', ');

            const totalExpensesAmountFormatted = formatCurrency(totalExpenses);
            const totalIncomeAmountFormatted = formatCurrency(totalIncome);
            const netCashFlowAmountFormatted = formatCurrency(netIncome);
            const numActiveSavingsGoals = detailedReports.savingsGoals.activeSavingsGoals.length;

            const prompt = `
                Given the following financial data for a user:
                - Total Expenses: ${totalExpensesAmountFormatted}
                - Top 5 Expense Categories: ${topExpenseCategories || 'N/A'}
                - Total Income: ${totalIncomeAmountFormatted}
                - Net Cash Flow: ${netCashFlowAmountFormatted}
                - Number of active savings goals: ${numActiveSavingsGoals}

                Please provide 3-5 concise, actionable, and practical tips for reducing expenses. Focus on general advice and specific suggestions related to common expense categories if available. Avoid generic statements and be encouraging. Format the tips as a numbered list using Markdown.
                `;

            const response = await callGeminiApi(prompt);
            setAiTips(response);

        } catch (err) {
            console.error("Error generating AI tips:", err);
            setError(`Failed to generate tips: ${err.message}. Please try again.`);
            setAiTips("Oops! Something went wrong while fetching tips. Please try again later.");
        } finally {
            setAiLoading(false);
        }
    };

    // Modal to view detailed report data
    const ReportDetailModal = ({ report, onClose }) => {
        if (!report) return null;

        const renderReportContent = () => {
            switch (report.id) {
                case '1':
                    return (
                        <div className="space-y-2 text-slate-300">
                            <p><strong>Total Income:</strong> {formatCurrency(report.data.totalIncome)}</p>
                            <p><strong>Total Expenses:</strong> {formatCurrency(report.data.totalExpenses)}</p>
                            <p><strong>Net Cash Flow:</strong> {formatCurrency(report.data.netIncome)}</p>
                        </div>
                    );
                case '2':
                    return (
                        <ul className="space-y-2">
                            {Object.entries(report.data || {}).sort((a,b) => (b[1]?.amount || 0) - (a[1]?.amount || 0)).map(([cat, data]) => (
                                <li key={cat} className="flex justify-between items-center text-slate-300">
                                    <span className="font-medium flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></span>
                                        {cat}
                                    </span>
                                    <span>{formatCurrency(data.amount)} ({data.count} transactions)</span>
                                </li>
                            ))}
                        </ul>
                    );
                case '3':
                    return (
                        <ul className="space-y-2">
                            {Object.entries(report.data || {}).sort((a,b) => (b[1] || 0) - (a[1] || 0)).map(([source, amount]) => (
                                <li key={source} className="flex justify-between items-center text-slate-300">
                                    <span className="font-medium">{source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    <span>{formatCurrency(amount)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                case '4':
                    return (
                        <div className="space-y-4">
                            {report.data.activeSavingsGoals.length > 0 ? (
                                <>
                                <h4 className="font-semibold text-slate-200">Active Goals:</h4>
                                <ul className="space-y-2">
                                    {report.data.activeSavingsGoals.map(goal => (
                                        <li key={goal.id} className="text-slate-300">
                                            <p className="font-medium">{goal.name}</p>
                                            <p className="text-sm text-slate-400">Target: {formatCurrency(goal.target_amount)} | Current: {formatCurrency(goal.current_amount)}</p>
                                            <p className="text-sm text-slate-400">Progress: {goal.target_amount > 0 ? (goal.current_amount / goal.target_amount * 100).toFixed(1) : 0}%</p>
                                        </li>
                                    ))}
                                </ul>
                                </>
                            ) : (
                                <p className="text-slate-400">No active savings goals.</p>
                            )}
                            {report.data.achievedSavingsGoals.length > 0 && (
                                <>
                                <h4 className="font-semibold text-slate-200 mt-4">Achieved Goals:</h4>
                                <ul className="space-y-2">
                                    {report.data.achievedSavingsGoals.map(goal => (
                                        <li key={goal.id} className="text-slate-500 line-through">
                                            <p className="font-medium">{goal.name}</p>
                                        </li>
                                    ))}
                                </ul>
                                </>
                            )}
                        </div>
                    );
                case '5':
                    return (
                        <ul className="space-y-4">
                            {report.data.map(budget => (
                                <li key={budget.id} className="p-3 bg-slate-800 rounded-md border border-slate-700">
                                    <p className="font-medium text-slate-200">{budget.name} ({budget.period_type})</p>
                                    <p className="text-sm text-slate-400">Budget: {formatCurrency(budget.amount)} | Spent: {formatCurrency(budget.spent)} | Remaining: {formatCurrency(budget.remaining)}</p>
                                    <div className="flex items-center gap-2 text-sm mt-1">
                                        <Badge className={`px-2 py-0.5 text-xs ${
                                            budget.status === 'over' ? 'bg-red-900 text-red-300' :
                                            budget.status === 'warning' ? 'bg-orange-900 text-orange-300' :
                                            'bg-green-900 text-green-300'
                                        }`}>
                                            {budget.percentage.toFixed(1)}% Used
                                        </Badge>
                                        <span className={`text-xs ${
                                            budget.status === 'over' ? 'text-red-400' :
                                            budget.status === 'warning' ? 'text-orange-400' :
                                            'text-green-400'
                                        }`}>
                                            {budget.status === 'over' ? 'Over Budget' : budget.status === 'warning' ? 'Near Limit' : 'Good'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    );
                case '6':
                    return (
                        <ul className="space-y-2">
                            {Object.entries(report.data || {}).sort((a,b) => (b[1] || 0) - (a[1] || 0)).map(([method, amount]) => (
                                <li key={method} className="flex justify-between items-center text-slate-300">
                                    <span className="font-medium">{method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    <span>{formatCurrency(amount)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                default:
                    return <p className="text-slate-400">No detailed data available for this report type.</p>;
            }
        };

        return (
            <AnimatePresence>
                {report && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        variants={modalOverlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={onClose}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={modalOverlayVariants}
                        />
                        <motion.div
                            className="relative w-full max-w-2xl mx-4 my-8 shadow-2xl bg-slate-900 border-slate-700 rounded-xl overflow-y-auto max-h-[90vh]"
                            variants={modalContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
                                <CardTitle className="text-slate-50">{report.title} Details</CardTitle>
                                <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
                                    &times;
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                {renderReportContent()}
                            </CardContent>
                            <div className="p-4 border-t border-slate-800 flex justify-end">
                                <Button onClick={() => exportReport(report)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export to CSV
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

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
                                Please sign in to view your reports.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-zinc-950 flex flex-col"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1">
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
                                &times;
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
                    variants={headerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-3xl font-bold text-zinc-50">
                            Financial Reports ✨
                        </h1>
                        <p className="text-zinc-400 mt-1">
                            Gain insights into your spending, income, and financial goals.
                        </p>
                    </div>
                    
                </motion.div>

                {/* Filters and Search */}
                <Card className="mb-6 bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                            <Input
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 w-full"
                            />
                        </div>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:ring-2 focus:ring-zinc-50 focus:border-transparent outline-none flex-shrink-0"
                        >
                            <option value="last-7-days">Last 7 Days</option>
                            <option value="last-30-days">Last 30 Days</option>
                            <option value="last-3-months">Last 3 Months</option>
                            <option value="last-year">Last Year</option>
                            <option value="all-time">All Time</option>
                        </select>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    variants={statsContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {quickStats.map((stat, index) => (
                        <motion.div key={stat.label} variants={statCardVariants} whileHover="hover">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">
                                        {stat.label}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 ${
                                        stat.trend === 'up' ? 'text-green-400' :
                                        stat.trend === 'down' ? 'text-red-400' :
                                        'text-blue-400'
                                    }`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-zinc-50">{stat.value}</div>
                                    <p className="text-xs text-zinc-400">
                                        {stat.change}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Report Categories / Filters */}
                <motion.div className="mb-6 flex flex-wrap gap-2" initial="hidden" animate="visible" variants={statsContainerVariants}>
                    {reportCategories.map(cat => (
                        <motion.div key={cat.id} variants={filterButtonVariants} whileHover="hover" whileTap="tap">
                            <Button
                                variant={activeFilter === cat.id ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setActiveFilter(cat.id)}
                                className={`${
                                    activeFilter === cat.id
                                        ? "bg-zinc-50 text-zinc-900"
                                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
                                }`}
                            >
                                {cat.name} ({cat.count})
                            </Button>
                        </motion.div>
                    ))}
                </motion.div>

                {/* AI Expense Reduction Advisor Card */}
                <motion.div
                    className="mb-8"
                    variants={aiCardVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Card className="bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-800 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-700">
                                    <Lightbulb className="w-4 h-4 text-yellow-300" />
                                </div>
                                <CardTitle className="text-lg text-zinc-50">AI Expense Reduction Advisor</CardTitle>
                            </div>
                            <Button
                                onClick={handleGenerateTips}
                                disabled={aiLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {aiLoading ? (
                                    <motion.span
                                        className="flex items-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...
                                    </motion.span>
                                ) : (
                                    <>
                                        <Lightbulb className="w-4 h-4 mr-2" /> Get Tips
                                    </>
                                )}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="min-h-[100px] bg-zinc-900 border border-zinc-800 rounded-md p-4 text-zinc-300 text-sm">
                                {aiTips ? (
                                    <motion.div
                                        variants={aiContentVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {aiTips.split('\n').map((line, index) => (
                                            <motion.p
                                                key={index}
                                                variants={aiTextItemVariants}
                                                className="mb-1"
                                                // Safely render the HTML after processing markdown for this line
                                                dangerouslySetInnerHTML={{ __html: processLineForMarkdown(line) }}
                                            />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <p className="text-zinc-500 italic">
                                        Click "Get Tips" to receive personalized advice on reducing your expenses based on your spending patterns.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Reports List */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-50">Generated Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-48">
                                <motion.div
                                    className="rounded-full h-10 w-10 border-b-2 border-zinc-50"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                        ) : filteredReports.length === 0 ? (
                            <motion.div
                                className="text-center py-12 text-zinc-400"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                                <p>No reports found matching your criteria.</p>
                            </motion.div>
                        ) : (
                            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={statsContainerVariants} initial="hidden" animate="visible">
                                <AnimatePresence>
                                {filteredReports.map(report => (
                                    <motion.div
                                        key={report.id}
                                        variants={reportCardVariants}
                                        whileHover="hover"
                                        layout
                                    >
                                        <Card className="bg-zinc-800 border-zinc-700 h-full flex flex-col">
                                            <CardHeader className="flex-row items-center justify-between pb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${report.color}`}>
                                                        <report.icon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <CardTitle className="text-lg text-zinc-50">{report.title}</CardTitle>
                                                </div>
                                                <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                                                    {report.category}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                                                        {report.description}
                                                    </p>
                                                    <div className="text-xs text-zinc-500 mb-4">
                                                        Last updated: {formatDate(report.lastGenerated)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)} className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50">
                                                        <Eye className="w-3 h-3 mr-1" /> View Details
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => exportReport(report)} className="text-zinc-400 hover:text-green-400">
                                                        <Download className="w-3 h-3 mr-1" /> Export
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {/* Detailed Report Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ReportsPage;
