import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have this
import { Label } from "@/components/ui/label"; // Assuming you have this or need to create it
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function Settings() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const { toast } = useToast();

    // Fetch user details on component mount
    useEffect(() => {
        let mounted = true;
        async function getUser() {
            try {
                setLoading(true);
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error) {
                    console.error("Error fetching user:", error);
                    toast({
                        title: "Error",
                        description: `Failed to load user data: ${error.message}`,
                        variant: "destructive",
                    });
                    if (mounted) setUser(null);
                    return;
                }

                if (mounted) {
                    setUser(user);
                    setEmail(user?.email || "");
                }
            } catch (err) {
                console.error("Unexpected error fetching user:", err);
                toast({
                    title: "Unexpected Error",
                    description: `An unexpected error occurred: ${err.message}`,
                    variant: "destructive",
                });
            } finally {
                if (mounted) setLoading(false);
            }
        }

        getUser();

        // Listen for auth state changes to keep user data fresh
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setUser(session?.user || null);
                setEmail(session?.user?.email || "");
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [toast]);

    // Handle password reset request
    const handlePasswordReset = async () => {
        setSubmitting(true);
        try {
            // Send a password reset email to the current user's email
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/auth?reset=true`, // Redirect user after password reset
            });

            if (error) {
                console.error("Error sending password reset email:", error);
                toast({
                    title: "Password Reset Failed",
                    description: `Could not send reset email: ${error.message}`,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Password Reset Sent!",
                    description: "Check your email for instructions to reset your password.",
                    action: (
                        <a href={`mailto:${user.email}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="link" className="text-blue-300">Open Email</Button>
                        </a>
                    ),
                });
            }
        } catch (err) {
            console.error("Unexpected error during password reset:", err);
            toast({
                title: "Unexpected Error",
                description: `An unexpected error occurred: ${err.message}`,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-zinc-400">Loading user settings...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-zinc-950">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
                    <CardHeader className="text-center">
                        <CardTitle className="text-zinc-50">Authentication Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-zinc-400">
                            Please sign in to view your settings.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-zinc-50 mb-6">Account Settings</h1>

                {/* User Information Card */}
                <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-zinc-50 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-400" />
                            Email Address
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Your primary account email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled // Email is read-only here
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 h-10 px-4 rounded-lg cursor-not-allowed"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Password Reset Card */}
                <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-zinc-50 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            Password Management
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Request a password reset link to your email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handlePasswordReset}
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg py-2.5 transition-all duration-200 transform hover:scale-[1.01] shadow-lg shadow-green-500/20"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending Email...
                                </>
                            ) : (
                                "Send Password Reset Email"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Other potential settings sections can go here */}
                {/* <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-zinc-50">Notifications</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Manage your notification preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-zinc-400">Notification settings coming soon.</p>
                    </CardContent>
                </Card> */}
            </div>
        </div>
    );
}
