"use client";
import { useState, Suspense } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [showVerificationMessage, setShowVerificationMessage] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';

    async function signUp() {
        setLoading(true);
        setMessage("");
        setShowVerificationMessage(false);
        const supabase = getSupabaseBrowser();
        
        // Create the user account
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { 
                data: { username },
                emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL 
                    ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
                    : `${window.location.origin}/auth/callback`
            },
        });
        
        if (error) {
            // Provide more specific error messages
            let errorMessage = "Account creation failed";
            
            switch (error.message) {
                case "User already registered":
                    errorMessage = "An account with this email already exists. Please sign in instead.";
                    break;
                case "Password should be at least 6 characters":
                    errorMessage = "Password must be at least 6 characters long.";
                    break;
                case "Invalid email":
                    errorMessage = "Please enter a valid email address.";
                    break;
                case "Unable to validate email address: invalid format":
                    errorMessage = "Please enter a valid email address.";
                    break;
                default:
                    errorMessage = `Error: ${error.message}`;
            }
            
            setMessage(errorMessage);
            setLoading(false);
        } else if (data.user) {
            // Check if email confirmation is required
            if (data.user.email_confirmed_at) {
                // Email already confirmed, proceed with sign in
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                
                if (signInError) {
                    setMessage("Account created successfully! Please sign in manually.");
                    setTimeout(() => {
                        router.push('/sign-in');
                    }, 2000);
                } else {
                    setMessage("Account created successfully! Redirecting to dashboard...");
                    setTimeout(() => {
                        router.push(redirectTo);
                    }, 1000);
                }
            } else {
                // Email confirmation required - show verification message
                setShowVerificationMessage(true);
                setMessage("Account created successfully! Please check your email and click the confirmation link to complete your registration.");
            }
        }
        setLoading(false);
    }

    if (showVerificationMessage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-full max-w-md px-6">
                    <Card className="shadow-lg">
                        <CardHeader className="text-center pb-6">
                            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                            <p className="text-slate-600 mt-2">We&apos;ve sent a verification link to your email</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-md p-4">
                                <p className="text-sm">
                                    We&apos;ve sent a verification email to <strong>{email}</strong>. 
                                    Please check your inbox and click the confirmation link to complete your registration.
                                </p>
                            </div>
                            
                            <div className="text-sm text-slate-600 space-y-2">
                                <p>Didn&apos;t receive the email?</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>Check your spam folder</li>
                                    <li>Make sure you entered the correct email address</li>
                                    <li>Wait a few minutes for the email to arrive</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <Button 
                                    className="w-full" 
                                    onClick={() => setShowVerificationMessage(false)}
                                >
                                    Back to Sign Up
                                </Button>
                                
                                <div className="text-center text-sm text-slate-600">
                                    Already have an account?{" "}
                                    <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
                                        Sign in
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-md px-6">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                        <p className="text-slate-600 mt-2">Join DeckVault to start building your collection</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <Input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Username</label>
                                <Input 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    placeholder="yourname"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <Input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <p className="text-xs text-slate-500 mt-1">Password must be at least 6 characters</p>
                            </div>
                        </div>

                        <Button 
                            className="w-full" 
                            onClick={signUp} 
                            disabled={loading || !email || !password || !username}
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </Button>

                        {message && (
                            <div className={`text-sm p-3 rounded-md ${
                                message.startsWith("Error") || message.includes("failed") || message.includes("already exists") || message.includes("Invalid")
                                    ? "bg-red-50 text-red-700 border border-red-200" 
                                    : "bg-green-50 text-green-700 border border-green-200"
                            }`}>
                                {message}
                            </div>
                        )}

                        <div className="text-center text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignUpForm />
        </Suspense>
    );
}



