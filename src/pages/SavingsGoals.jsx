import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { format, isPast } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
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

// Mock toast hook - replace with your actual implementation
const useToast = () => ({
    toast: ({ title, description, variant }) => {
        console.log(`Toast [${variant}]: ${title} - ${description}`);
        // Replace with actual toast implementation
    }
});

// Enhanced UI components with beautiful styling
const Card = ({ children, className = "", ...props }) => (
    <div className={`relative group rounded-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/90 via-zinc-900/95 to-zinc-950/90 backdrop-blur-sm p-6 shadow-2xl hover:shadow-zinc-900/20 transition-all duration-300 hover:border-zinc-700/60 ${className}`} {...props}>{children}</div>
);
const CardHeader = ({ children, className = "", ...props }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>
);
const CardTitle = ({ children, className = "", ...props }) => (
    <h3 className={`text-2xl font-bold leading-none tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent ${className}`} {...props}>{children}</h3>
);
const CardContent = ({ children, className = "", ...props }) => (
    <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
);
const CardFooter = ({ children, className = "", ...props }) => (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>{children}</div>
);

const Button = ({ children, variant = "default", size = "default", className = "", disabled = false, onClick, type = "button", ...props }) => {
    const baseClass = "inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl";
    const variants = {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 shadow-blue-600/25 hover:shadow-blue-500/40",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-red-600/25 hover:shadow-red-500/40",
        outline: "border-2 border-zinc-700 bg-zinc-900/50 backdrop-blur-sm text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 hover:border-zinc-600 shadow-zinc-900/50",
        ghost: "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 shadow-none"
    };
    const sizes = {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base"
    };
    
    return (
        <button 
            type={type}
            className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`} 
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

const Input = ({ className = "", type = "text", ...props }) => (
    <input 
        type={type}
        className={`flex h-11 w-full rounded-xl border-2 border-zinc-700 bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-sm text-zinc-100 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-zinc-600 ${className}`}
        {...props}
    />
);

const Textarea = ({ className = "", ...props }) => (
    <textarea 
        className={`flex min-h-[100px] w-full rounded-xl border-2 border-zinc-700 bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-sm text-zinc-100 ring-offset-background placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-zinc-600 resize-none ${className}`}
        {...props}
    />
);

const Progress = ({ value = 0, className = "", indicatorClassName = "" }) => (
    <div className={`relative h-3 w-full overflow-hidden rounded-full bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 ${className}`}>
        <div 
            className={`h-full w-full flex-1 rounded-full transition-all duration-700 ease-out shadow-lg ${indicatorClassName}`}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
    </div>
);

const Dialog = ({ children, open, onOpenChange }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
            <div className="relative z-[10000]">{children}</div>
        </div>
    );
};

const DialogContent = ({ children, className = "" }) => (
    <div className={`fixed left-[50%] top-[50%] z-[10001] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border-2 border-zinc-700/50 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-xl p-6 shadow-2xl duration-200 sm:rounded-2xl ${className}`}>
        {children}
    </div>
);

const DialogHeader = ({ children, className = "" }) => (
    <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>{children}</div>
);

const DialogTitle = ({ children, className = "" }) => (
    <h2 className={`text-xl font-bold leading-none tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent ${className}`}>{children}</h2>
);

const DialogFooter = ({ children, className = "" }) => (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 ${className}`}>{children}</div>
);

const Select = ({ children, value, onValueChange, disabled }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button 
                type="button"
                className="flex h-11 w-full items-center justify-between rounded-xl border-2 border-zinc-700 bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-sm text-zinc-100 ring-offset-background placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-zinc-600"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
            >
                <span className={value ? "text-zinc-100" : "text-zinc-500"}>{value || "Select..."}</span>
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="absolute z-50 mt-2 min-w-full overflow-hidden rounded-xl border-2 border-zinc-700/50 bg-zinc-900/95 backdrop-blur-xl p-2 text-zinc-100 shadow-2xl animate-in fade-in-0 zoom-in-95">
                    {React.Children.map(children, child => 
                        React.cloneElement(child, { 
                            onClick: () => { onValueChange(child.props.value); setOpen(false); }
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const SelectTrigger = ({ children, className = "" }) => children;
const SelectValue = ({ placeholder }) => placeholder;
const SelectContent = ({ children, className = "" }) => (
    <div className={className}>{children}</div>
);
const SelectItem = ({ children, value, onClick }) => (
    <div 
        className="relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 px-4 text-sm outline-none hover:bg-zinc-800/80 hover:text-zinc-100 transition-all duration-200 border border-transparent hover:border-zinc-700/50"
        onClick={onClick}
    >
        {children}
    </div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-600/25",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-600/25",
        secondary: "bg-gradient-to-r from-zinc-700 to-zinc-800 text-zinc-100 shadow-zinc-700/25"
    };
    return (
        <div className={`inline-flex items-center rounded-full border-0 px-3 py-1.5 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-lg hover:scale-105 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
};

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

export default function SavingsGoals() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const { toast } = useToast();
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

    // Optimized fetch goals with better error handling
    const fetchGoals = useCallback(async () => {
        if (!userId) {
            console.log("No userId available for fetching goals");
            setGoals([]);
            setLoading(false);
            return;
        }

        console.log("Fetching savings goals for user:", userId);
        
        try {
            const { data, error } = await supabase
                .from("savings_goals")
                .select("*")
                .eq("user_id", userId)
                .order("target_date", { ascending: true });

            if (error) {
                console.error("Supabase query error:", error);
                throw new Error(`Database error: ${error.message}`);
            }

            console.log("Successfully fetched goals:", data?.length || 0, "goals");
            setGoals(data || []);
            setError(""); // Clear any previous errors
        } catch (err) {
            console.error("Error fetching savings goals:", err);
            const errorMessage = err.message || "Failed to load savings goals";
            setError(errorMessage);
            toast({
                title: "Error Loading Goals",
                description: errorMessage,
                variant: "destructive",
            });
            // Don't clear goals on error, keep showing cached data
        } finally {
            setLoading(false);
        }
    }, [userId, toast]);

    // Handle auth state changes
    useEffect(() => {
        let mounted = true;
        let authSubscription = null;

        const initializeAuth = async () => {
            try {
                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                
                if (mounted) {
                    setUser(session?.user || null);
                    setAuthLoading(false);
                }

                // Set up auth state change listener
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    console.log("Auth state changed:", event, session?.user?.id);
                    if (mounted) {
                        setUser(session?.user || null);
                        setAuthLoading(false);
                        
                        // Clear goals when user logs out
                        if (event === 'SIGNED_OUT') {
                            setGoals([]);
                        }
                    }
                });
                
                authSubscription = subscription;
            } catch (error) {
                console.error("Auth initialization error:", error);
                if (mounted) {
                    setAuthLoading(false);
                    setError(`Authentication error: ${error.message}`);
                }
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
            authSubscription?.unsubscribe();
        };
    }, []);

    // Handle real-time subscriptions and data fetching
    useEffect(() => {
        if (authLoading) {
            console.log("Auth still loading, waiting...");
            return;
        }

        if (!user) {
            console.log("No user authenticated, clearing goals");
            setGoals([]);
            setLoading(false);
            return;
        }

        console.log("User authenticated, setting up real-time subscription for user:", userId);
        
        let realtimeChannel = null;

        const setupRealtimeSubscription = async () => {
            // Initial data fetch
            await fetchGoals();

            // Set up real-time subscription for this user's goals
            realtimeChannel = supabase
                .channel(`savings_goals_${userId}`)
                .on("postgres_changes", {
                    event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: "public",
                    table: "savings_goals",
                    filter: `user_id=eq.${userId}`
                }, (payload) => {
                    console.log("Real-time update received:", payload);
                    
                    const { eventType, new: newRecord, old: oldRecord } = payload;
                    
                    setGoals(currentGoals => {
                        switch (eventType) {
                            case 'INSERT':
                                // Add new goal if not already present
                                if (!currentGoals.find(g => g.id === newRecord.id)) {
                                    console.log("Adding new goal:", newRecord.name);
                                    return [...currentGoals, newRecord].sort((a, b) => 
                                        new Date(a.target_date || '9999-12-31') - new Date(b.target_date || '9999-12-31')
                                    );
                                }
                                return currentGoals;
                                
                            case 'UPDATE':
                                // Update existing goal
                                console.log("Updating goal:", newRecord.name);
                                return currentGoals.map(goal => 
                                    goal.id === newRecord.id ? newRecord : goal
                                ).sort((a, b) => 
                                    new Date(a.target_date || '9999-12-31') - new Date(b.target_date || '9999-12-31')
                                );
                                
                            case 'DELETE':
                                // Remove deleted goal
                                console.log("Removing goal:", oldRecord.id);
                                return currentGoals.filter(goal => goal.id !== oldRecord.id);
                                
                            default:
                                console.log("Unknown event type:", eventType);
                                return currentGoals;
                        }
                    });
                })
                .subscribe((status, err) => {
                    console.log("Real-time subscription status:", status, err);
                    
                    if (status === 'SUBSCRIBED') {
                        console.log("✅ Real-time subscription active for savings goals");
                    } else if (status === 'CHANNEL_ERROR' || err) {
                        console.error("❌ Real-time subscription error:", err);
                        toast({
                            title: "Real-time Connection Issue",
                            description: "Real-time updates may not work properly. Data will still sync on refresh.",
                            variant: "destructive",
                        });
                    } else if (status === 'CLOSED') {
                        console.log("Real-time subscription closed");
                    }
                });
        };

        setupRealtimeSubscription();

        // Cleanup function
        return () => {
            console.log("Cleaning up savings goals subscription");
            if (realtimeChannel) {
                supabase.removeChannel(realtimeChannel);
            }
        };
    }, [user, authLoading, userId, fetchGoals, toast]);

    // Handle form submission (Add/Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        // Validation
        if (!userId || !name.trim() || !targetAmount || currentAmount === "") {
            const errorMsg = "Please fill in all required fields.";
            setError(errorMsg);
            toast({
                title: "Validation Error",
                description: errorMsg,
                variant: "destructive",
            });
            setSubmitting(false);
            return;
        }

        const parsedTarget = parseFloat(targetAmount);
        const parsedCurrent = parseFloat(currentAmount);

        if (isNaN(parsedTarget) || parsedTarget <= 0) {
            const errorMsg = "Target amount must be a positive number.";
            setError(errorMsg);
            toast({
                title: "Invalid Target Amount",
                description: errorMsg,
                variant: "destructive",
            });
            setSubmitting(false);
            return;
        }
        
        if (isNaN(parsedCurrent) || parsedCurrent < 0) {
            const errorMsg = "Current amount must be a non-negative number.";
            setError(errorMsg);
            toast({
                title: "Invalid Current Amount",
                description: errorMsg,
                variant: "destructive",
            });
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                user_id: userId,
                name: name.trim(),
                description: description.trim() || null,
                target_amount: parsedTarget,
                current_amount: parsedCurrent,
                target_date: targetDate || null,
                priority: priority,
                is_achieved: parsedCurrent >= parsedTarget,
                updated_at: new Date().toISOString(),
            };

            if (isEditing && currentGoal) {
                const { error: updateError } = await supabase
                    .from("savings_goals")
                    .update(payload)
                    .eq("id", currentGoal.id)
                    .eq("user_id", userId); // Additional security check
                    
                if (updateError) throw updateError;
                
                toast({
                    title: "Goal Updated Successfully! ✨",
                    description: `"${name}" has been updated.`,
                    variant: "default",
                });
            } else {
                payload.created_at = new Date().toISOString();
                
                const { error: insertError } = await supabase
                    .from("savings_goals")
                    .insert([payload]);
                    
                if (insertError) throw insertError;
                
                toast({
                    title: "Goal Created Successfully! 🎯",
                    description: `"${name}" has been added to your savings goals.`,
                    variant: "default",
                });
            }

            resetForm();
            setOpenDialog(false);
            // Real-time subscription will handle the UI update
        } catch (err) {
            console.error("Error saving goal:", err);
            const errorMsg = `Failed to save goal: ${err.message}`;
            setError(errorMsg);
            toast({
                title: "Failed to Save Goal",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Prepare form for editing
    const handleEditClick = (goal) => {
        setCurrentGoal(goal);
        setName(goal.name);
        setDescription(goal.description || "");
        setTargetAmount(goal.target_amount.toString());
        setCurrentAmount(goal.current_amount.toString());
        setTargetDate(goal.target_date || "");
        setPriority(goal.priority || "medium");
        setIsEditing(true);
        setOpenDialog(true);
    };

    // Delete a goal
    const handleDeleteGoal = async (goalId) => {
        const goalToDelete = goals.find(g => g.id === goalId);
        if (!goalToDelete) return;

        if (!window.confirm(`Are you sure you want to delete "${goalToDelete.name}"?`)) {
            return;
        }

        setError("");
        
        try {
            const { error: deleteError } = await supabase
                .from("savings_goals")
                .delete()
                .eq("id", goalId)
                .eq("user_id", userId); // Additional security check
                
            if (deleteError) throw deleteError;
            
            toast({
                title: "Goal Deleted Successfully! 🗑️",
                description: `"${goalToDelete.name}" has been removed from your savings goals.`,
                variant: "default",
            });
            // Real-time subscription will handle the UI update
        } catch (err) {
            console.error("Error deleting goal:", err);
            const errorMsg = `Failed to delete goal: ${err.message}`;
            setError(errorMsg);
            toast({
                title: "Failed to Delete Goal",
                description: errorMsg,
                variant: "destructive",
            });
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

    // Enhanced priority badge styles
    const getPriorityBadge = (prio) => {
        switch (prio) {
            case "high": 
                return (
                    <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-red-200 rounded-full mr-1.5"></div>
                        High Priority
                    </Badge>
                );
            case "medium": 
                return (
                    <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25">
                        <div className="w-1.5 h-1.5 bg-amber-200 rounded-full mr-1.5"></div>
                        Medium
                    </Badge>
                );
            case "low": 
                return (
                    <Badge variant="secondary" className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/25">
                        <div className="w-1.5 h-1.5 bg-emerald-200 rounded-full mr-1.5"></div>
                        Low Priority
                    </Badge>
                );
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
        hidden: { scale: 0.95, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
        exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-800 border-t-blue-500 mx-auto mb-6 shadow-2xl"></div>
                        <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 animate-ping mx-auto opacity-20"></div>
                    </div>
                    <div className="text-zinc-300 font-medium text-lg mb-2">Loading your financial space</div>
                    <div className="text-zinc-500 text-sm">Please wait while we prepare your dashboard...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <motion.div 
                className="flex items-center justify-center h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" 
                variants={pageVariants} 
                initial="initial" 
                animate="animate"
            >
                <Card className="w-full max-w-md shadow-2xl border-zinc-700/50">
                    <CardHeader className="text-center pb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/25">
                            <Target className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-zinc-50 text-2xl">Authentication Required</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-zinc-400 mb-6 leading-relaxed">Please sign in to access your savings goals and start tracking your financial journey.</p>
                        <div className="flex items-center justify-center space-x-2 text-zinc-500 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span>Secure Authentication</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen  bg-zinc-950  relative overflow-hidden"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
           
           
            
            <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                            className="mb-6 p-4 bg-gradient-to-r from-red-950/30 to-red-900/20 backdrop-blur-sm border border-red-800/50 rounded-xl flex items-start gap-3 shadow-xl"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 text-red-300 text-sm font-medium">{error}</div>
                            <Button variant="ghost" size="sm" onClick={() => setError("")} className="text-red-400 hover:text-red-300 p-1 h-auto">×</Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Enhanced Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12"
                >
                    <div className="mb-6 sm:mb-0">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                                    Savings Goals
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <p className="text-zinc-400 text-sm">Real-time tracking • Plan your financial future</p>
                                </div>
                            </div>
                        </div>
                        {goals.length > 0 && (
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-zinc-400">{goals.length} Goals</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-zinc-400">{goals.filter(g => g.is_achieved).length} Completed</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                console.log("Manual refresh triggered");
                                setLoading(true);
                                fetchGoals();
                            }}
                            disabled={loading}
                            className="border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/60 backdrop-blur-sm"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? "Refreshing..." : "Refresh"}
                        </Button>
                        <Button 
                            onClick={() => { setOpenDialog(true); resetForm(); }} 
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Goal
                        </Button>
                    </div>
                </motion.div>

                {/* Enhanced Loading State for Goals */}
                {loading ? (
                     <div className="flex items-center justify-center h-96">
                         <div className="text-center">
                             <div className="relative mb-8">
                                 <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                                 <div className="absolute inset-0 h-12 w-12 border-4 border-transparent border-t-blue-400 rounded-full animate-ping mx-auto opacity-20"></div>
                             </div>
                             <h3 className="text-xl font-semibold text-zinc-200 mb-2">Loading your savings goals</h3>
                             <p className="text-zinc-500">Fetching your financial dreams...</p>
                         </div>
                     </div>
                ) : goals.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-blue-500/20">
                                <Target className="h-12 w-12 text-blue-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-xs">💡</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-50 mb-3">Ready to set your first savings goal?</h3>
                        <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                            Start your financial journey by creating meaningful savings goals. Track progress in real-time and achieve your dreams faster.
                        </p>
                        <div className="space-y-4">
                            <Button 
                                onClick={() => { setOpenDialog(true); resetForm(); }} 
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 text-lg px-8 py-3"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create Your First Goal
                            </Button>
                            <div className="flex items-center justify-center gap-4 text-sm text-zinc-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Real-time tracking</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Progress visualization</span>
                                </div>
                            </div>
                        </div>
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
                                    className={`group relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl ${
                                        isAchieved 
                                            ? 'border-green-500/50 bg-gradient-to-br from-green-950/30 to-zinc-950/90' 
                                            : isOverdue 
                                                ? 'border-red-500/50 bg-gradient-to-br from-red-950/30 to-zinc-950/90'
                                                : 'border-zinc-700/50 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90'
                                    }`}
                                    variants={cardItemVariants}
                                    whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.3 } }}
                                    whileTap={{ scale: 0.98 }}
                                    layout
                                    layoutId={goal.id}
                                >
                                    {/* Achievement Glow Effect */}
                                    {isAchieved && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 pointer-events-none" />
                                    )}
                                    
                                    <CardHeader className="relative">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl font-bold flex items-center gap-3 mb-2">
                                                    <div className="relative">
                                                        <Coins className={`w-7 h-7 ${isAchieved ? 'text-green-400' : 'text-yellow-400'} transition-colors duration-300`} />
                                                        {isAchieved && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                        )}
                                                    </div>
                                                    <span className="bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-zinc-200 transition-all duration-300">
                                                        {goal.name}
                                                    </span>
                                                </CardTitle>
                                            </div>
                                            {getPriorityBadge(goal.priority)}
                                        </div>
                                        {goal.description && (
                                            <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 group-hover:text-zinc-300 transition-colors duration-300">
                                                {goal.description}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-zinc-300">Current: <span className="text-zinc-100">{formatCurrency(goal.current_amount)}</span></span>
                                                <span className="text-zinc-300">Target: <span className="text-zinc-100">{formatCurrency(goal.target_amount)}</span></span>
                                            </div>
                                            <div className="relative">
                                                <Progress 
                                                    value={progress} 
                                                    className="h-3 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50"
                                                    indicatorClassName={
                                                        isAchieved 
                                                            ? "bg-gradient-to-r from-green-400 to-green-500 shadow-green-500/50" 
                                                            : isOverdue 
                                                                ? "bg-gradient-to-r from-red-400 to-red-500 shadow-red-500/50" 
                                                                : "bg-gradient-to-r from-blue-400 to-blue-600 shadow-blue-500/50"
                                                    } 
                                                />
                                                <div className="flex justify-between items-center mt-2">
                                                    <div className={`text-xs font-semibold ${
                                                        isAchieved ? 'text-green-400' : isOverdue ? 'text-red-400' : 'text-blue-400'
                                                    }`}>
                                                        {Math.round(progress)}% Complete
                                                    </div>
                                                    {progress > 0 && (
                                                        <div className="text-xs text-zinc-500">
                                                            {formatCurrency(goal.target_amount - goal.current_amount)} remaining
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {goal.target_date && (
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    <span>Due: {format(new Date(goal.target_date), "MMM dd, yyyy")}</span>
                                                </div>
                                                {isOverdue && (
                                                    <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-700 text-red-100 shadow-red-600/25 animate-pulse">
                                                        Overdue
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        
                                        {isAchieved && (
                                            <div className="flex items-center justify-center text-green-400 font-bold text-sm bg-green-500/10 rounded-xl py-3 px-4 border border-green-500/20">
                                                <BadgeCheck className="w-5 h-5 mr-2 animate-pulse" />
                                                🎉 Goal Achieved! Congratulations!
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-3 pt-6 border-t border-zinc-800/50">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditClick(goal)}
                                            className="group/btn border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 hover:border-zinc-600 backdrop-blur-sm transition-all duration-300"
                                        >
                                            <Edit className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="group/btn bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500 hover:to-red-600 border-0 backdrop-blur-sm transition-all duration-300"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                                            Delete
                                        </Button>
                                    </CardFooter>
                                </MotionCard>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Enhanced Add/Edit Goal Dialog */}
            <AnimatePresence>
                {openDialog && (
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogContent className="sm:max-w-[420px] border-zinc-700/50 bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-xl text-zinc-50">
                            <motion.div
                                variants={modalVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <DialogHeader className="text-center mb-3">
                                    
                                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
                                        {isEditing ? "Edit Savings Goal" : "Create New Goal"}
                                    </DialogTitle>
                                    <p className="text-zinc-400 text-xs mt-1">
                                        {isEditing ? "Update your goal details" : "Set up your financial target"}
                                    </p>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="grid gap-4 py-1 relative z-[10002]">
                                    <div className="grid gap-2">
                                        <label htmlFor="name" className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                            Goal Name *
                                        </label>
                                        <Input 
                                            id="name" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            placeholder="e.g., Emergency Fund, Dream Vacation, New Car" 
                                            required 
                                            disabled={submitting} 
                                            className="transition-all duration-300" 
                                        />
                                    </div>
                                    
                                    <div className="grid gap-2">
                                        <label htmlFor="description" className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                            Description (Optional)
                                        </label>
                                        <Textarea 
                                            id="description" 
                                            value={description} 
                                            onChange={(e) => setDescription(e.target.value)} 
                                            placeholder="Describe your goal and what it means to you..." 
                                            disabled={submitting} 
                                            className="transition-all duration-300" 
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <label htmlFor="targetAmount" className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                Target Amount (₹) *
                                            </label>
                                            <Input 
                                                id="targetAmount" 
                                                type="number" 
                                                step="0.01" 
                                                min="0.01" 
                                                value={targetAmount} 
                                                onChange={(e) => setTargetAmount(e.target.value)} 
                                                placeholder="0.00"
                                                required 
                                                disabled={submitting} 
                                                className="transition-all duration-300" 
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label htmlFor="currentAmount" className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                                Current Amount (₹) *
                                            </label>
                                            <Input 
                                                id="currentAmount" 
                                                type="number" 
                                                step="0.01" 
                                                min="0" 
                                                value={currentAmount} 
                                                onChange={(e) => setCurrentAmount(e.target.value)} 
                                                placeholder="0.00"
                                                required 
                                                disabled={submitting} 
                                                className="transition-all duration-300" 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <label htmlFor="targetDate" className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                                Target Date (Optional)
                                            </label>
                                            <Input 
                                                id="targetDate" 
                                                type="date" 
                                                value={targetDate} 
                                                onChange={(e) => setTargetDate(e.target.value)} 
                                                disabled={submitting} 
                                                className="transition-all duration-300" 
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label htmlFor="priority" className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                Priority Level
                                            </label>
                                            <Select value={priority} onValueChange={setPriority} disabled={submitting}>
                                                <SelectTrigger className="w-full transition-all duration-300">
                                                    <SelectValue placeholder="Select priority level" />
                                                </SelectTrigger>
                                                <SelectContent className="border-zinc-700/50 bg-zinc-900/95 backdrop-blur-xl text-zinc-100">
                                                    <SelectItem value="low">🟢 Low Priority</SelectItem>
                                                    <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                                                    <SelectItem value="high">🔴 High Priority</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    <DialogFooter className="mt-1 pt-1 border-t border-zinc-800/50">
                                        <div className="grid grid-cols-2 gap-3 w-full">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => { setOpenDialog(false); resetForm(); }} 
                                                disabled={submitting} 
                                                className="w-full transition-all duration-300 text-xs"
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={submitting || !name.trim() || !targetAmount || currentAmount === ""} 
                                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/25 w-full transition-all duration-300 text-xs"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        {isEditing ? "Updating..." : "Creating..."}
                                                    </>
                                                ) : (
                                                    <>
                                                        {isEditing ? (
                                                            <>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Save Changes
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Create Goal
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </DialogFooter>
                                </form>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </motion.div>
    );
}