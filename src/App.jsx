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

export default function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const handleAuthStateChange = async (event, session) => {
            if (mounted) {
                setUser(session?.user || null);
                setAuthLoading(false);
                // Redirect authenticated users away from auth page if they land there
                if (session?.user && window.location.pathname === "/auth") {
                    navigate("/");
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
            await supabase.auth.signOut();
            // Supabase's onAuthStateChange will handle setting user to null and redirecting
        } catch (error) {
            console.error("Error signing out:", error);
            // Optionally, show a toast or message to the user
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
            <Routes>
                {/* Public Auth Route */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Protected Routes - Render Layout only if user is authenticated */}
                {user ? (
                  <>
                    <Route element={<Layout user={user} onSignOut={handleSignOut} />}>
                        <Route index element={<Dashboard />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="budgets" element={<Budgets />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="savings-goals" element={<SavingsGoals />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    {/* Catch all other routes and redirect to dashboard when authenticated */}
                    <Route path="*" element={<Dashboard />} />
                  </>
                ) : (
                  // Fallback for any other path if not authenticated, redirects to /auth
                  <Route path="*" element={<AuthPage />} />
                )}
            </Routes>
            <Toaster />
        </>
    );
}
