"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AuthCallbackPage() {
    const [message, setMessage] = useState("Processing...");
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        async function handleAuthCallback() {
            const supabase = getSupabaseBrowser();
            
            try {
                // Debug: Log URL parameters
                console.log('URL params:', Object.fromEntries(searchParams.entries()));
                
                // Get the access_token and refresh_token from URL params
                const accessToken = searchParams.get('access_token');
                const refreshToken = searchParams.get('refresh_token');

                console.log('Access token exists:', !!accessToken);
                console.log('Refresh token exists:', !!refreshToken);

                if (accessToken && refreshToken) {
                    // Set the session with the tokens from the URL
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    console.log('Session set result:', { data: !!data.session, error: error?.message });

                    if (error) {
                        console.error('Session error:', error);
                        setMessage("Authentication error. Please try signing in again.");
                        setIsLoading(false);
                        setTimeout(() => {
                            router.push('/sign-in');
                        }, 3000);
                        return;
                    }

                    if (data.session) {
                        console.log('User email confirmed:', data.session.user.email_confirmed_at);
                        setMessage("Email confirmed successfully! Redirecting to dashboard...");
                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 2000);
                    } else {
                        setMessage("No session found. Please try signing in again.");
                        setIsLoading(false);
                        setTimeout(() => {
                            router.push('/sign-in');
                        }, 3000);
                    }
                } else {
                    // If no tokens in URL, try to get current session
                    const { data, error } = await supabase.auth.getSession();
                    
                    console.log('Current session result:', { data: !!data.session, error: error?.message });
                    
                    if (error) {
                        setMessage("Authentication error. Please try signing in again.");
                        setIsLoading(false);
                        setTimeout(() => {
                            router.push('/sign-in');
                        }, 3000);
                        return;
                    }

                    if (data.session) {
                        console.log('User email confirmed:', data.session.user.email_confirmed_at);
                        setMessage("Email confirmed successfully! Redirecting to dashboard...");
                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 2000);
                    } else {
                        setMessage("No session found. Please try signing in again.");
                        setIsLoading(false);
                        setTimeout(() => {
                            router.push('/sign-in');
                        }, 3000);
                    }
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                setMessage("An error occurred. Please try signing in again.");
                setIsLoading(false);
                setTimeout(() => {
                    router.push('/sign-in');
                }, 3000);
            }
        }

        handleAuthCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-md px-6">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold">Email Confirmation</CardTitle>
                        <p className="text-slate-600 mt-2">Processing your email confirmation</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            {isLoading && (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            )}
                            <p className="text-sm text-slate-700">{message}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
