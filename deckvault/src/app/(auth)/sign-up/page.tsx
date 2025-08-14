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
    const searchParams = useSearchParams();
    const router = useRouter();
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';

    async function signUp() {
        setLoading(true);
        setMessage("");
        const supabase = getSupabaseBrowser();
        
        // Create the user account
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { 
                data: { username }
            },
        });
        
        if (error) {
            setMessage(`Error: ${error.message}`);
            setLoading(false);
        } else if (data.user) {
            // Wait a moment for the trigger to create profile and collection
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Automatically sign in the user
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
        }
        setLoading(false);
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
                                message.startsWith("Error") 
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



