import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, ExternalLink, CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GoogleAuthSetup() {
    const supabaseProjectRef = "oolhukfahpnfjjqroqqh"; // Your actual project ref
    const redirectUri = `https://${supabaseProjectRef}.supabase.co/auth/v1/callback`;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl bg-zinc-900 border-zinc-800 shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-zinc-50 flex items-center justify-center gap-2">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                        Google OAuth Setup Required
                    </CardTitle>
                    <p className="text-zinc-400 mt-2">
                        Follow these steps to enable Google authentication
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 1 */}
                    <div className="border border-zinc-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                            Google Cloud Console Setup
                        </h3>
                        <div className="space-y-2 text-zinc-300 text-sm">
                            <p>• Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></p>
                            <p>• Create a new project or select an existing one</p>
                            <p>• Enable the <strong>Google Identity API</strong></p>
                            <p>• Go to <strong>Credentials</strong> → <strong>Create Credentials</strong> → <strong>OAuth 2.0 Client IDs</strong></p>
                            <p>• Choose <strong>Web application</strong></p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="border border-zinc-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                            Configure OAuth URLs
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-zinc-300 text-sm mb-2"><strong>Authorized JavaScript origins:</strong></p>
                                <div className="bg-zinc-800 p-3 rounded border flex items-center justify-between">
                                    <code className="text-green-400">http://localhost:5174</code>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard('http://localhost:5174')}
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <p className="text-zinc-300 text-sm mb-2"><strong>Authorized redirect URIs:</strong></p>
                                <div className="bg-zinc-800 p-3 rounded border flex items-center justify-between">
                                    <code className="text-green-400 text-xs">{redirectUri}</code>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(redirectUri)}
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="border border-zinc-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                            Supabase Configuration
                        </h3>
                        <div className="space-y-2 text-zinc-300 text-sm">
                            <p>• Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a></p>
                            <p>• Navigate to <strong>Authentication</strong> → <strong>Providers</strong></p>
                            <p>• Find <strong>Google</strong> and enable it</p>
                            <p>• Enter your <strong>Client ID</strong> and <strong>Client Secret</strong> from Google Cloud Console</p>
                            <p>• Save the configuration</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="border border-green-700 rounded-lg p-4 bg-green-950/20">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            Test Google Authentication
                        </h3>
                        <p className="text-zinc-300 text-sm mb-3">
                            Once configured, refresh this page and you'll see the Google sign-in button on the auth page.
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Refresh Page
                        </Button>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-blue-950/20 border border-blue-700 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">📝 Additional Notes:</h4>
                        <ul className="text-xs text-blue-200 space-y-1">
                            <li>• For production, add your domain to authorized origins</li>
                            <li>• Users can sign up OR sign in with Google (it handles both)</li>
                            <li>• Google auth will create new accounts automatically</li>
                            <li>• Make sure to test in an incognito window first</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
