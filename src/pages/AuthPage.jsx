import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Mail, Lock, UserPlus, LogIn, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        // Add client-side validation
        if (!email || !password) {
            setError("Email and password are required");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                console.log('Attempting sign up with:', { email }); // Don't log password
                
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        // Add email redirect URL if needed
                        emailRedirectTo: window.location.origin,
                        data: {
                            full_name: '', // Add default data for profile creation
                        }
                    }
                });

                console.log('Sign up response:', { data, error }); // Enhanced logging
                console.log('User object:', data?.user);
                console.log('Session object:', data?.session);

                if (error) {
                    console.error('Sign up error:', error);
                    console.error('Error code:', error.code);
                    console.error('Error status:', error.status);
                    throw error;
                }
                
                if (data?.user) {
                    console.log('User created successfully:', data.user.id);
                    
                    // Check if user was actually created
                    if (data.user.id) {
                        if (data.user.email_confirmed_at) {
                            setMessage("Sign up successful! You are now logged in.");
                            navigate("/");
                        } else {
                            setMessage("Sign up successful! Please check your email to confirm your account before signing in.");
                        }
                    } else {
                        console.error('User object exists but no ID found');
                        setError("Sign up failed - user creation incomplete");
                    }
                } else {
                    console.error('No user object returned');
                    setError("Sign up failed - no user data returned");
                }
            } else {
                console.log('Attempting sign in with:', { email });
                
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                console.log('Sign in response:', { data, error });

                if (error) {
                    console.error('Sign in error:', error);
                    throw error;
                }
                
                if (data.user) {
                    console.log('Sign in successful, navigating to home');
                    navigate("/");
                }
            }
        } catch (err) {
            console.error("Auth error details:", err);
            
            // Handle specific error types
            if (err.message.includes('Email not confirmed')) {
                setError("Please check your email and click the confirmation link before signing in.");
            } else if (err.message.includes('Invalid login credentials')) {
                setError("Invalid email or password. Please check your credentials and try again.");
            } else if (err.message.includes('User already registered')) {
                setError("An account with this email already exists. Please sign in instead.");
            } else if (err.message.includes('Password should be at least 6 characters')) {
                setError("Password must be at least 6 characters long.");
            } else if (err.message.includes('Unable to validate email address')) {
                setError("Please enter a valid email address.");
            } else if (err.message.includes('signup is disabled')) {
                setError("New user registration is currently disabled. Please contact support.");
            } else if (err.message.includes('Email rate limit exceeded')) {
                setError("Too many sign-up attempts. Please wait a few minutes and try again.");
            } else if (err.message.includes('Database error') || err.message.includes('relation')) {
                setError("Database configuration error. Please check your database setup.");
            } else if (err.code === 'weak_password') {
                setError("Password is too weak. Please use a stronger password.");
            } else if (err.status === 422) {
                setError("Invalid input data. Please check your email and password format.");
            } else {
                setError(err.message || "An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-xl">
                <CardHeader className="text-center pb-6">
                    <CardTitle className="text-3xl font-bold text-slate-50">
                        {isSignUp ? "Create Account" : "Welcome Back!"}
                    </CardTitle>
                    <p className="text-slate-400 mt-2">
                        {isSignUp ? "Sign up to start tracking your expenses" : "Sign in to your account"}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    disabled={loading}
                                    className="pl-10 bg-slate-800 border-slate-700 text-slate-100 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password (min 6 characters)"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    className="pl-10 bg-slate-800 border-slate-700 text-slate-100 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-950/20 border border-red-800 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {message && (
                            <div className="p-3 bg-green-950/20 border border-green-800 rounded-lg flex items-center gap-2 text-green-300 text-sm">
                                <span>{message}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {isSignUp ? "Signing Up..." : "Logging In..."}
                                </span>
                            ) : (
                                <>
                                    {isSignUp ? (
                                        <><UserPlus className="mr-2 h-5 w-5" /> Sign Up</>
                                    ) : (
                                        <><LogIn className="mr-2 h-5 w-5" /> Sign In</>
                                    )}
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        {isSignUp ? (
                            <>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignUp(false);
                                        setError("");
                                        setMessage("");
                                    }}
                                    className="text-blue-500 hover:underline font-medium"
                                >
                                    Sign In
                                </button>
                            </>
                        ) : (
                            <>
                                {"Don't have an account?"}{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignUp(true);
                                        setError("");
                                        setMessage("");
                                    }}
                                    className="text-blue-500 hover:underline font-medium"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}