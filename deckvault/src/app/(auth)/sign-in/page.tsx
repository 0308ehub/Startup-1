"use client";
import { useState, Suspense } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';

    async function signInWithEmail() {
        setIsLoading(true);
        setMessage("");
        const supabase = getSupabaseBrowser();
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) {
            setMessage(`Error: ${error.message}`);
            setIsLoading(false);
        } else if (data.user) {
            // Successful sign in - redirect to the intended page
            router.push(redirectTo);
        }
    }

    async function signInWithGoogle() {
        setIsLoading(true);
        const supabase = getSupabaseBrowser();
        const { data, error } = await supabase.auth.signInWithOAuth({ 
            provider: "google", 
            options: { redirectTo: `${window.location.origin}${redirectTo}` } 
        });
        if (error) {
            setMessage(`Error: ${error.message}`);
            setIsLoading(false);
        } else if (data.url) {
            window.location.href = data.url;
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-md px-6">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold">Welcome to DeckVault</CardTitle>
                        <p className="text-slate-600 mt-2">Sign in to access your collection and decks</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button 
                            className="w-full" 
                            onClick={signInWithGoogle}
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in with Google"}
                        </Button>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <Input
                                    className="w-full"
                                    placeholder="you@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <Input
                                    className="w-full"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button 
                                className="w-full" 
                                onClick={signInWithEmail}
                                disabled={isLoading || !email || !password}
                            >
                                {isLoading ? "Signing in..." : "Sign in with Email"}
                            </Button>
                        </div>

                        {message && (
                            <div className={`text-sm p-3 rounded-md ${
                                message.startsWith("Error") 
                                    ? "bg-red-50 text-red-700 border border-red-200" 
                                    : "bg-green-50 text-green-700 border border-green-200"
                            }`}>
                                {message}
                            </div>
                        )}

                        <div className="text-center text-sm text-slate-600">
                            Don&apos;t have an account?{" "}
                            <Link href="/sign-up" className="text-blue-600 hover:text-blue-700 font-medium">
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
        </Suspense>
    );
}