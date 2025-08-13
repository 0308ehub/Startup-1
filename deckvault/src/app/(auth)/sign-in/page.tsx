"use client";
import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';

    async function sendMagicLink() {
        setIsLoading(true);
        setMessage("");
        const supabase = getSupabaseBrowser();
        const { error } = await supabase.auth.signInWithOtp({ 
            email, 
            options: { emailRedirectTo: `${window.location.origin}${redirectTo}` } 
        });
        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("Check your email for the magic link!");
        }
        setIsLoading(false);
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
                            <Input
                                className="w-full"
                                placeholder="you@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button 
                                variant="secondary" 
                                className="w-full" 
                                onClick={sendMagicLink}
                                disabled={isLoading || !email}
                            >
                                {isLoading ? "Sending..." : "Send magic link"}
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
                            Don't have an account?{" "}
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