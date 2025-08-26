import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
    User, 
    Mail, 
    Lock, 
    Bell, 
    Moon, 
    Sun, 
    Globe, 
    Trash2, 
    Download, 
    Upload,
    Save,
    Edit3,
    AlertTriangle,
    CheckCircle2,
    Settings as SettingsIcon,
    Shield,
    Database,
    FileText,
    CreditCard,
    Loader2
} from "lucide-react";

// Enhanced UI Components
const Card = ({ children, className = "", ...props }) => (
    <div className={`relative group rounded-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/90 via-zinc-900/95 to-zinc-950/90 backdrop-blur-sm p-6 shadow-2xl hover:shadow-zinc-900/20 transition-all duration-300 hover:border-zinc-700/60 ${className}`} {...props}>
        {children}
    </div>
);

const CardHeader = ({ children, className = "", ...props }) => (
    <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>{children}</div>
);

const CardTitle = ({ children, className = "", ...props }) => (
    <h3 className={`text-xl font-bold leading-none tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent ${className}`} {...props}>{children}</h3>
);

const CardContent = ({ children, className = "", ...props }) => (
    <div className={`${className}`} {...props}>{children}</div>
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

const Label = ({ children, className = "", ...props }) => (
    <label className={`text-sm font-semibold text-zinc-300 ${className}`} {...props}>{children}</label>
);

const Switch = ({ checked, onCheckedChange, disabled = false, className = "" }) => (
    <button
        type="button"
        className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? 'bg-blue-600' : 'bg-zinc-700'
        } ${className}`}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
    >
        <span
            className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                checked ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
    </button>
);

const Select = ({ children, value, onValueChange, disabled, className = "" }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button 
                type="button"
                className={`flex h-11 w-full items-center justify-between rounded-xl border-2 border-zinc-700 bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-sm text-zinc-100 ring-offset-background placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-zinc-600 ${className}`}
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
        secondary: "bg-gradient-to-r from-zinc-700 to-zinc-800 text-zinc-100 shadow-zinc-700/25",
        success: "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-600/25"
    };
    return (
        <div className={`inline-flex items-center rounded-full border-0 px-3 py-1.5 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-lg hover:scale-105 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
};

export default function Settings() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    
    // Profile settings
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [profileUpdating, setProfileUpdating] = useState(false);
    
    // Security
    const [passwordChanging, setPasswordChanging] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Data management
    const [exportingData, setExportingData] = useState(false);
    const [importingData, setImportingData] = useState(false);
    
    // Toast-like notification system
    const [toast, setToast] = useState(null);
    
    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Initialize user data
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                
                if (session?.user) {
                    setUser(session.user);
                    setEmail(session.user.email || "");
                    setDisplayName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "");
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                showToast("Failed to load user data", "error");
            } finally {
                setAuthLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user);
                setEmail(session.user.email || "");
                setDisplayName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "");
            } else {
                setUser(null);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    // Update profile
    const handleProfileUpdate = async () => {
        if (!user) return;
        
        setProfileUpdating(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: displayName }
            });
            
            if (error) throw error;
            showToast("Profile updated successfully!", "success");
        } catch (error) {
            console.error("Profile update error:", error);
            showToast(error.message, "error");
        } finally {
            setProfileUpdating(false);
        }
    };

    // Change password
    const handlePasswordChange = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            showToast("Passwords don't match", "error");
            return;
        }

        if (newPassword.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }

        setPasswordChanging(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) throw error;
            
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            showToast("Password updated successfully!", "success");
        } catch (error) {
            console.error("Password change error:", error);
            showToast(error.message, "error");
        } finally {
            setPasswordChanging(false);
        }
    };

    // Export data
    const handleExportData = async () => {
        setExportingData(true);
        try {
            // Fetch user's financial data
            const [expensesRes, goalsRes, budgetsRes] = await Promise.all([
                supabase.from("expenses").select("*").eq("user_id", user.id),
                supabase.from("savings_goals").select("*").eq("user_id", user.id),
                supabase.from("budgets").select("*").eq("user_id", user.id)
            ]);

            const exportData = {
                user: {
                    email: user.email,
                    created_at: user.created_at
                },
                expenses: expensesRes.data || [],
                savings_goals: goalsRes.data || [],
                budgets: budgetsRes.data || [],
                exported_at: new Date().toISOString()
            };

            // Create and download file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `fintrack-data-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            showToast("Data exported successfully!", "success");
        } catch (error) {
            console.error("Export error:", error);
            showToast("Failed to export data", "error");
        } finally {
            setExportingData(false);
        }
    };

    // Delete account
    const handleDeleteAccount = async () => {
        const confirmation = window.prompt(
            'This action cannot be undone. Type "DELETE" to confirm account deletion:'
        );
        
        if (confirmation !== "DELETE") {
            showToast("Account deletion cancelled", "info");
            return;
        }

        setLoading(true);
        try {
            // Note: Supabase doesn't allow direct user deletion from client
            // In a real app, you'd call a server-side function
            showToast("Please contact support to delete your account", "info");
        } catch (error) {
            console.error("Delete account error:", error);
            showToast("Failed to delete account", "error");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Shield },
        { id: "data", label: "Data Management", icon: Database },
        { id: "danger", label: "Danger Zone", icon: AlertTriangle }
    ];

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-800 border-t-blue-500 mx-auto mb-6 shadow-2xl"></div>
                        <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 animate-ping mx-auto opacity-20"></div>
                    </div>
                    <div className="text-zinc-300 font-medium text-lg mb-2">Loading Settings</div>
                    <div className="text-zinc-500 text-sm">Please wait...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Card className="w-full max-w-md shadow-2xl border-zinc-700/50">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-zinc-700">
                            <SettingsIcon className="w-8 h-8 text-zinc-300" />
                        </div>
                        <CardTitle className="text-zinc-50 text-2xl">Authentication Required</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-zinc-400 mb-6 leading-relaxed">Please sign in to access your settings.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-zinc-950 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background Elements */}
          
            
            <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
                                toast.type === "success" 
                                    ? "bg-green-950/90 border-green-500/50 text-green-100" 
                                    : toast.type === "error"
                                    ? "bg-red-950/90 border-red-500/50 text-red-100"
                                    : "bg-blue-950/90 border-blue-500/50 text-blue-100"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
                                {toast.type === "error" && <AlertTriangle className="w-5 h-5" />}
                                <span className="font-medium">{toast.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/25">
                            <SettingsIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                                Settings
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-zinc-400 text-sm">Manage your account and preferences</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Tabs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <Card className="p-4">
                            <div className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                                                activeTab === tab.id
                                                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300"
                                                    : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Content Area */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Profile Tab */}
                                {activeTab === "profile" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3">
                                                <User className="w-6 h-6 text-blue-400" />
                                                Profile Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                        <span className="text-2xl font-bold text-white">
                                                            {displayName.charAt(0).toUpperCase() || "U"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-zinc-100">{displayName || "User"}</h3>
                                                        <p className="text-zinc-400">{email}</p>
                                                        <Badge variant="success" className="mt-2">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Verified
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>Display Name</Label>
                                                        <Input
                                                            value={displayName}
                                                            onChange={(e) => setDisplayName(e.target.value)}
                                                            placeholder="Enter your name"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Email Address</Label>
                                                        <Input
                                                            value={email}
                                                            disabled
                                                            className="opacity-60"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={handleProfileUpdate}
                                                        disabled={profileUpdating}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {profileUpdating ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Save className="w-4 h-4" />
                                                        )}
                                                        {profileUpdating ? "Updating..." : "Save Changes"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Preferences Tab */}
                                

                                {/* Security Tab */}
                                {activeTab === "security" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3">
                                                <Shield className="w-6 h-6 text-green-400" />
                                                Security Settings
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl">
                                                    <h4 className="font-semibold text-blue-300 mb-2">Account Security</h4>
                                                    <p className="text-blue-200 text-sm">
                                                        Your account is secured with email authentication. 
                                                        Change your password regularly to keep your account safe.
                                                    </p>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>New Password</Label>
                                                        <Input
                                                            type="password"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            placeholder="Enter new password"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Confirm New Password</Label>
                                                        <Input
                                                            type="password"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="Confirm new password"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={handlePasswordChange}
                                                        disabled={passwordChanging || !newPassword || newPassword !== confirmPassword}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {passwordChanging ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Lock className="w-4 h-4" />
                                                        )}
                                                        {passwordChanging ? "Updating..." : "Change Password"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Data Management Tab */}
                                {activeTab === "data" && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3">
                                                <Database className="w-6 h-6 text-cyan-400" />
                                                Data Management
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="p-6 border border-zinc-700/50 rounded-xl bg-gradient-to-br from-green-950/30 to-emerald-950/30">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <Download className="w-6 h-6 text-green-400" />
                                                            <h3 className="text-lg font-semibold text-green-300">Export Data</h3>
                                                        </div>
                                                        <p className="text-green-200 text-sm mb-4">
                                                            Download all your financial data in JSON format for backup or migration.
                                                        </p>
                                                        <Button
                                                            onClick={handleExportData}
                                                            disabled={exportingData}
                                                            variant="outline"
                                                            className="w-full border-green-500/30 text-green-300 hover:bg-green-500/10"
                                                        >
                                                            {exportingData ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                                    Exporting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Export Data
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="p-6 border border-zinc-700/50 rounded-xl bg-gradient-to-br from-blue-950/30 to-indigo-950/30">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <Upload className="w-6 h-6 text-blue-400" />
                                                            <h3 className="text-lg font-semibold text-blue-300">Import Data</h3>
                                                        </div>
                                                        <p className="text-blue-200 text-sm mb-4">
                                                            Import financial data from a previously exported JSON file.
                                                        </p>
                                                        <Button
                                                            disabled={importingData}
                                                            variant="outline"
                                                            className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                                                        >
                                                            {importingData ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                                    Importing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-4 h-4 mr-2" />
                                                                    Import Data
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl">
                                                    <h4 className="font-semibold text-amber-300 mb-2">Data Privacy</h4>
                                                    <p className="text-amber-200 text-sm">
                                                        Your financial data is encrypted and stored securely. 
                                                        We never share your personal information with third parties.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Danger Zone Tab */}
                                {activeTab === "danger" && (
                                    <Card className="border-red-500/30">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3 text-red-400">
                                                <AlertTriangle className="w-6 h-6" />
                                                Danger Zone
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                <div className="p-6 border border-red-500/30 rounded-xl bg-gradient-to-br from-red-950/30 to-red-900/20">
                                                    <h3 className="text-lg font-semibold text-red-300 mb-2">Delete Account</h3>
                                                    <p className="text-red-200 text-sm mb-4">
                                                        Permanently delete your account and all associated data. 
                                                        This action cannot be undone.
                                                    </p>
                                                    <Button
                                                        onClick={handleDeleteAccount}
                                                        disabled={loading}
                                                        variant="destructive"
                                                        className="flex items-center gap-2"
                                                    >
                                                        {loading ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                        {loading ? "Processing..." : "Delete Account"}
                                                    </Button>
                                                </div>
                                                
                                                <div className="p-4 bg-zinc-950/50 border border-zinc-700/50 rounded-xl">
                                                    <h4 className="font-semibold text-zinc-300 mb-2">Before You Delete</h4>
                                                    <ul className="text-zinc-400 text-sm space-y-1">
                                                        <li>• Make sure to export your data if you want to keep it</li>
                                                        <li>• Cancel any active subscriptions</li>
                                                        <li>• This will permanently delete all expenses, goals, and budgets</li>
                                                        <li>• You won't be able to recover your account after deletion</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
