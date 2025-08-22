import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient"; // Ensure this path is correct

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import AuthPage from "./pages/AuthPage"; // New AuthPage
import SavingsGoals from "./pages/SavingsGoals";
import Settings from "./pages/Settings";
import { Toaster } from "./components/ui/toaster";
import { ToastProvider } from "./components/ui/use-toast";

export default function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const handleAuthStateChange = async (event, session) => {
            console.log("Auth state change event:", event, "Session:", session?.user?.email || "No user");
            
            if (mounted) {
                setUser(session?.user || null);
                setAuthLoading(false);
                
                // Handle redirections based on auth state
                if (event === 'SIGNED_OUT' || !session?.user) {
                    console.log("User signed out, redirecting to auth page");
                    navigate("/auth", { replace: true });
                } else if (session?.user && window.location.pathname === "/auth") {
                    console.log("User signed in, redirecting to dashboard");
                    navigate("/", { replace: true });
                }
            }
        };

        // Initial session check
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (mounted) {
                setUser(session?.user || null);
                setAuthLoading(false);
                if (!session?.user && window.location.pathname !== "/auth") {
                    navigate("/auth"); // Redirect to auth if no user and not already on auth page
                } else if (session?.user && window.location.pathname === "/auth") {
                    navigate("/"); // Redirect to dashboard if user exists and is on auth page
                }
            }
        });

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [navigate]); // navigate is a stable function provided by react-router-dom

    const handleSignOut = async () => {
        try {
            console.log("Starting sign out process...");
            
            // Clear user state immediately to prevent UI flickering
            setUser(null);
            
            // Sign out from Supabase with scope 'global' to clear all sessions
            const { error } = await supabase.auth.signOut({ scope: 'global' });
            
            if (error) {
                console.error("Supabase sign out error:", error);
                // Continue with cleanup even if there's an error
            }
            
            // Clear any remaining local storage
            localStorage.removeItem('supabase.auth.token');
            
            console.log("Sign out successful, redirecting to auth page");
            
            // Force navigation to auth page with replace to prevent back navigation
            navigate("/auth", { replace: true });
            
        } catch (error) {
            console.error("Error signing out:", error);
            
            // Even if there's an error, try to clear local state and redirect
            setUser(null);
            localStorage.removeItem('supabase.auth.token');
            navigate("/auth", { replace: true });
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-slate-400">Loading authentication...</div>
                </div>
            </div>
        );
    }

    return (
      <>
      
      <ToastProvider>
        <Routes>
            {/* Public Auth Route */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes - Render Layout only if user is authenticated */}
            {user ? (
              <Route element={<Layout user={user} onSignOut={handleSignOut} />}>
                    <Route index element={<Dashboard />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="budgets" element={<Budgets />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="saving-goals" element={<SavingsGoals />} />
                    <Route path="settings" element={<Settings />} />
                    {/* Add more protected routes here */}
                </Route>
            ) : (
              // Fallback for any other path if not authenticated, redirects to /auth
              <Route path="*" element={<AuthPage />} />
            )}
        </Routes>
         <Toaster />
        </ToastProvider>
            </>
    );
}
