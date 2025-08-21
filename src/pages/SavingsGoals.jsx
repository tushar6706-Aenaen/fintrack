import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { format, isPast } from "date-fns";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
import {
    Plus,
    Target,
    Edit,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    BadgeCheck,
    Coins,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Helper function for currency formatting
function formatCurrency(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(n));
}

// Create motion-wrapped components for animation
const MotionCard = motion(Card);
const MotionDialogContent = motion(DialogContent);

export default function SavingsGoals() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentGoal, setCurrentGoal] = useState(null);

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [priority, setPriority] = useState("medium");
    const [submitting, setSubmitting] = useState(false);

    const userId = user?.id;

    // Fetch savings goals
    const fetchGoals = useCallback(async () => {
        if (!userId) {
            setGoals([]);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("savings_goals")
                .select("*")
                .eq("user_id", userId)
                .order("target_date", { ascending: true });

            if (error) throw error;
            setGoals(data || []);
        } catch (err) {
            console.error("Error fetching savings goals:", err);
            setError(`Failed to load savings goals: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Handle initial auth state and real-time subscriptions
    useEffect(() => {
        let mounted = true;

        const handleAuthStateChange = async (event, session) => {
            if (mounted) {
                setUser(session?.user || null);
                setAuthLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
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

    // Load goals when user or auth state changes
    useEffect(() => {
        if (authLoading) return;
        if (user) {
            fetchGoals();

            const channel = supabase
                .channel('savings-goals-changes')
                .on("postgres_changes", {
                    event: "*",
                    schema: "public",
                    table: "savings_goals",
                    filter: `user_id=eq.${userId}`
                }, () => {
                    console.log("Real-time update received for savings goals");
                    fetchGoals();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else {
            setGoals([]);
            setLoading(false);
        }
    }, [user, authLoading, userId, fetchGoals]);

    // Handle form submission (Add/Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        if (!userId || !name.trim() || !targetAmount || !currentAmount) {
            setError("Please fill in all required fields.");
            setSubmitting(false);
            return;
        }

        const parsedTarget = parseFloat(targetAmount);
        const parsedCurrent = parseFloat(currentAmount);

        if (isNaN(parsedTarget) || parsedTarget <= 0) {
            setError("Target amount must be a positive number.");
            setSubmitting(false);
            return;
        }
        if (isNaN(parsedCurrent) || parsedCurrent < 0) {
            setError("Current amount must be a non-negative number.");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                user_id: userId,
                name: name.trim(),
                description: description || null,
                target_amount: parsedTarget,
                current_amount: parsedCurrent,
                target_date: targetDate || null,
                priority: priority,
                is_achieved: parsedCurrent >= parsedTarget,
            };

            if (isEditing && currentGoal) {
                const { error: updateError } = await supabase
                    .from("savings_goals")
                    .update(payload)
                    .eq("id", currentGoal.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("savings_goals")
                    .insert([payload]);
                if (insertError) throw insertError;
            }

            resetForm();
            setOpenDialog(false);
            // fetchGoals(); // No need to call, real-time subscription will handle it
        } catch (err) {
            console.error("Error saving goal:", err);
            setError(`Failed to save goal: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Prepare form for editing
    const handleEditClick = (goal) => {
        setCurrentGoal(goal);
        setName(goal.name);
        setDescription(goal.description || "");
        setTargetAmount(goal.target_amount);
        setCurrentAmount(goal.current_amount);
        setTargetDate(goal.target_date || "");
        setPriority(goal.priority || "medium");
        setIsEditing(true);
        setOpenDialog(true);
    };

    // Delete a goal
    const handleDeleteGoal = async (goalId) => {
        if (!window.confirm("Are you sure you want to delete this savings goal?")) {
            return;
        }
        setError("");
        try {
            const { error: deleteError } = await supabase
                .from("savings_goals")
                .delete()
                .eq("id", goalId);
            if (deleteError) throw deleteError;
            // fetchGoals(); // Real-time handles update
        } catch (err) {
            console.error("Error deleting goal:", err);
            setError(`Failed to delete goal: ${err.message}`);
        }
    };

    // Reset form fields
    const resetForm = () => {
        setName("");
        setDescription("");
        setTargetAmount("");
        setCurrentAmount("");
        setTargetDate("");
        setPriority("medium");
        setIsEditing(false);
        setCurrentGoal(null);
        setError("");
    };

    // Priority badge styles
    const getPriorityBadge = (prio) => {
        switch (prio) {
            case "high": return <Badge variant="destructive" className="bg-red-600 hover:bg-red-600 text-white">High</Badge>;
            case "medium": return <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-500 text-white">Medium</Badge>;
            case "low": return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-500 text-white">Low</Badge>;
            default: return null;
        }
    };

    // Framer Motion Variants
    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0 },
    };

    const gridContainerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    };

    const cardItemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    };
    
    const modalVariants = {
        hidden: { scale: 0.95, opacity: 0, y: 20 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
        exit: { scale: 0.95, opacity: 0, y: 20, transition: { duration: 0.2 } }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-50 mx-auto mb-4"></div>
                    <div className="text-zinc-400">Loading your space...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <motion.div className="flex items-center justify-center h-screen bg-zinc-950" variants={pageVariants} initial="initial" animate="animate">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
                    <CardHeader className="text-center">
                        <CardTitle className="text-zinc-50">Authentication Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-zinc-400">Please sign in to view your savings goals.</p>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-zinc-950"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                            className="mb-6 p-4 bg-red-950/20 border border-red-800 rounded-lg flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 text-red-300 text-sm">{error}</div>
                            <Button variant="ghost" size="sm" onClick={() => setError("")} className="text-red-500 hover:text-red-600 p-1">×</Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
                >
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-3xl font-bold text-zinc-50">Savings Goals</h1>
                        <p className="text-zinc-400 mt-1">Plan and track your financial aspirations</p>
                    </div>
                    <Button onClick={() => { setOpenDialog(true); resetForm(); }} className="bg-zinc-50 hover:bg-zinc-200 text-zinc-900">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Goal
                    </Button>
                </motion.div>

                {/* Loading State for Goals */}
                {loading ? (
                     <div className="flex items-center justify-center h-64">
                         <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                     </div>
                ) : goals.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-50 mb-2">No savings goals set yet!</h3>
                        <p className="text-zinc-400 mb-4">Start planning your future by adding your first financial goal.</p>
                        <Button onClick={() => { setOpenDialog(true); resetForm(); }} className="bg-zinc-50 text-zinc-900">
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Goal
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={gridContainerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {goals.map((goal) => {
                            const progress = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;
                            const isAchieved = goal.current_amount >= goal.target_amount;
                            const isOverdue = goal.target_date && !isAchieved && isPast(new Date(goal.target_date));

                            return (
                                <MotionCard
                                    key={goal.id}
                                    className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800 flex flex-col justify-between"
                                    variants={cardItemVariants}
                                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                                    whileTap={{ scale: 0.98 }}
                                    layout // Animate layout changes, e.g., on delete
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-2">
                                            <CardTitle className="text-xl font-bold text-zinc-50 flex items-center gap-2">
                                                <Coins className="w-6 h-6 text-yellow-400" />
                                                {goal.name}
                                            </CardTitle>
                                            {getPriorityBadge(goal.priority)}
                                        </div>
                                        {goal.description && (
                                            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{goal.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm text-zinc-300 mb-1">
                                                <span>Current: {formatCurrency(goal.current_amount)}</span>
                                                <span>Target: {formatCurrency(goal.target_amount)}</span>
                                            </div>
                                            <Progress value={progress} className="h-2 bg-zinc-700"
                                                indicatorClassName={isAchieved ? "bg-green-500" : isOverdue ? "bg-red-500" : "bg-blue-500"} />
                                            <div className="text-right text-xs text-zinc-400 mt-1">{Math.round(progress)}% Complete</div>
                                        </div>
                                        {goal.target_date && (
                                            <div className="flex items-center text-sm text-zinc-400">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Target Date: {format(new Date(goal.target_date), "MMM dd, yyyy")}
                                                {isOverdue && (
                                                    <Badge variant="destructive" className="ml-2 bg-red-800/50 text-red-300">Overdue</Badge>
                                                )}
                                            </div>
                                        )}
                                        {isAchieved && (
                                            <div className="flex items-center text-green-400 font-medium">
                                                <BadgeCheck className="w-5 h-5 mr-2" />
                                                Goal Achieved!
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2 pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditClick(goal)}
                                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteGoal(goal.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />Delete
                                        </Button>
                                    </CardFooter>
                                </MotionCard>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Add/Edit Goal Dialog */}
            <AnimatePresence>
                {openDialog && (
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <MotionDialogContent
                            className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-zinc-50"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <DialogHeader>
                                <DialogTitle className="text-zinc-50">{isEditing ? "Edit Savings Goal" : "Add New Savings Goal"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="name" className="text-sm font-medium text-zinc-300">Name</label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Down Payment for House" required disabled={submitting} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="description" className="text-sm font-medium text-zinc-300">Description (Optional)</label>
                                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of your goal" disabled={submitting} className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[80px]" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label htmlFor="targetAmount" className="text-sm font-medium text-zinc-300">Target Amount (₹)</label>
                                        <Input id="targetAmount" type="number" step="0.01" min="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required disabled={submitting} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="currentAmount" className="text-sm font-medium text-zinc-300">Current Amount (₹)</label>
                                        <Input id="currentAmount" type="number" step="0.01" min="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} required disabled={submitting} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label htmlFor="targetDate" className="text-sm font-medium text-zinc-300">Target Date (Optional)</label>
                                        <Input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} disabled={submitting} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="priority" className="text-sm font-medium text-zinc-300">Priority</label>
                                        <Select value={priority} onValueChange={setPriority} disabled={submitting}>
                                            <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-zinc-100"><SelectValue placeholder="Select priority" /></SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter className="mt-4">
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <Button type="button" variant="outline" onClick={() => { setOpenDialog(false); resetForm(); }} disabled={submitting} className="border-zinc-700 w-full text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50">Cancel</Button>
                                        <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                            {submitting ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                                            ) : (isEditing ? "Save Changes" : "Add Goal")}
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </form>
                        </MotionDialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </motion.div>
    );
}