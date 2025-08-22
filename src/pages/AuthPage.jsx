import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Mail, Lock, UserPlus, LogIn, Loader2, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();

    // Check if user is already authenticated when component mounts
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                console.log('User already authenticated, redirecting to dashboard');
                navigate('/', { replace: true });
            }
        };

        checkUser();
    }, [navigate]);

    const handleGoogleAuth = async () => {
        setGoogleLoading(true);
        setError("");
        setMessage("");

        try {
            console.log('Attempting Google OAuth...');
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                }
            });

            if (error) {
                console.error('Google auth error:', error);
                
                // Handle specific Google OAuth errors
                if (error.message.includes('provider is not enabled')) {
                    throw new Error('Google authentication is not enabled. Please contact support.');
                } else if (error.message.includes('Invalid provider')) {
                    throw new Error('Google authentication is not properly configured.');
                }
                throw error;
            }

            console.log('Google OAuth initiated successfully');
            // The redirect will happen automatically
            
        } catch (err) {
            console.error("Google auth error:", err);
            
            if (err.message.includes('provider is not enabled') || err.message.includes('validation_failed')) {
                setError("Google authentication is not enabled on this app. Please contact the administrator or use email/password to sign in.");
            } else if (err.message.includes('popup_closed_by_user')) {
                setError("Google sign-in was cancelled. Please try again.");
            } else if (err.message.includes('network')) {
                setError("Network error. Please check your connection and try again.");
            } else {
                setError(err.message || "Failed to sign in with Google. Please try again or use email/password.");
            }
        } finally {
            setGoogleLoading(false);
        }
    };

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
                            setMessage("Account created successfully! You are now logged in.");
                            navigate("/");
                        } else {
                            setEmailSent(true);
                            setMessage("Account created successfully! Please check your email and click the confirmation link to complete your registration.");
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
                    setMessage("Welcome back! Signing you in...");
                    setTimeout(() => navigate("/"), 1000);
                }
            }
        } catch (err) {
            console.error("Auth error details:", err);
            
            // Handle specific error types
            if (err.message.includes('Email not confirmed')) {
                setError("Please check your email and click the confirmation link before signing in.");
                setEmailSent(true);
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
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-xl">
                <CardHeader className="text-center pb-6">
                    <CardTitle className="text-3xl font-bold text-zinc-50">
                        {isSignUp ? "Create Account" : "Welcome Back!"}
                    </CardTitle>
                    <p className="text-zinc-400 mt-2">
                        {isSignUp ? "Sign up to start tracking your expenses" : "Sign in to your account"}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    disabled={loading}
                                    className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500 focus:border-zinc-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password (min 6 characters)"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-zinc-500 focus:border-zinc-500"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-950/20 border border-red-800 rounded-lg flex items-start gap-3 text-red-300 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Error</p>
                                    <p className="mt-1">{error}</p>
                                    {emailSent && (
                                        <p className="mt-2 text-red-200">
                                            💡 <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {message && (
                            <div className="p-4 bg-green-950/20 border border-green-800 rounded-lg flex items-start gap-3 text-green-300 text-sm">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Success</p>
                                    <p className="mt-1">{message}</p>
                                    {emailSent && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-green-200">
                                                📧 <strong>Check your email:</strong> We've sent a confirmation link to <strong>{email}</strong>
                                            </p>
                                            <p className="text-green-200">
                                                ⏰ <strong>Next steps:</strong> Click the link in your email to activate your account, then return here to sign in.
                                            </p>
                                            <p className="text-green-200">
                                                🔍 <strong>Can't find it?</strong> Check your spam/junk folder.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-zinc-200 hover:bg-zinc-700 text-black hover:text-white font-bold py-3 rounded-lg transition-all duration-200"
                            disabled={loading || googleLoading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {isSignUp ? "Creating Account..." : "Signing In..."}
                                </span>
                            ) : (
                                <>
                                    {isSignUp ? (
                                        <><UserPlus className="mr-2 h-5 w-5" /> Create Account</>
                                    ) : (
                                        <><LogIn className="mr-2 h-5 w-5" /> Sign In</>
                                    )}
                                </>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900 px-2 text-zinc-400">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign In Button */}
                        <Button
                            type="button"
                            onClick={handleGoogleAuth}
                            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg transition-all duration-200 border border-gray-300 shadow-md hover:shadow-lg"
                            disabled={loading || googleLoading}
                        >
                            {googleLoading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Connecting to Google...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Continue with Google
                                </span>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-zinc-400 text-sm mt-6">
                        {isSignUp ? (
                            <>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignUp(false);
                                        setError("");
                                        setMessage("");
                                        setEmailSent(false);
                                    }}
                                    className="text-white hover:underline font-medium transition-colors"
                                    disabled={loading || googleLoading}
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
                                        setEmailSent(false);
                                    }}
                                    className="text-white hover:underline font-medium transition-colors"
                                    disabled={loading || googleLoading}
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </p>

                    {/* Additional Help Text */}
                    {emailSent && (
                        <div className="mt-4 p-3 bg-blue-950/20 border border-blue-800 rounded-lg text-center">
                            <p className="text-blue-300 text-sm">
                                📬 <strong>Email sent!</strong> Return here after confirming your email to sign in.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setEmailSent(false);
                                    setMessage("");
                                    setIsSignUp(false);
                                }}
                                className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                            >
                                I've confirmed my email, let me sign in
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}