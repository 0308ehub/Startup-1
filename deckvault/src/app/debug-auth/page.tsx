"use client";
import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function DebugAuthPage() {
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function runDebug() {
            const info: any = {};

            try {
                // Check environment variables
                info.envVars = {
                    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
                    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
                    urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'Not set'
                };

                // Check localStorage
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const projectId = supabaseUrl?.split('//')[1]?.split('.')[0];
                const authKey = `sb-${projectId}-auth-token`;
                info.localStorage = {
                    authToken: localStorage.getItem(authKey) ? 'Present' : 'Missing',
                    allKeys: Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-'))
                };

                // Check cookies
                info.cookies = {
                    all: document.cookie,
                    supabaseCookies: document.cookie.split(';').filter(cookie => 
                        cookie.includes('supabase') || cookie.includes('sb-')
                    )
                };

                // Test Supabase connection
                const supabase = getSupabaseBrowser();
                
                // Get session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                info.session = {
                    exists: !!session,
                    user: session?.user ? {
                        id: session.user.id,
                        email: session.user.email,
                        emailConfirmed: session.user.email_confirmed_at
                    } : null,
                    error: sessionError?.message
                };

                // Get user
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                info.user = {
                    exists: !!user,
                    data: user ? {
                        id: user.id,
                        email: user.email,
                        emailConfirmed: user.email_confirmed_at,
                        metadata: user.user_metadata
                    } : null,
                    error: userError?.message
                };

                // Test profile lookup
                if (user) {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    
                    info.profile = {
                        exists: !!profile,
                        data: profile,
                        error: profileError?.message
                    };
                }

            } catch (error) {
                info.error = error;
            }

            setDebugInfo(info);
            setLoading(false);
        }

        runDebug();
    }, []);

    if (loading) {
        return <div className="p-6">Loading debug info...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Authentication Debug</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
                {/* Environment Variables */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
                    <div className="space-y-2 text-sm">
                        <div>URL: <span className={debugInfo.envVars?.url === 'Set' ? 'text-green-600' : 'text-red-600'}>{debugInfo.envVars?.url}</span></div>
                        <div>Key: <span className={debugInfo.envVars?.key === 'Set' ? 'text-green-600' : 'text-red-600'}>{debugInfo.envVars?.key}</span></div>
                        <div>URL Preview: {debugInfo.envVars?.urlPreview}</div>
                    </div>
                </div>

                {/* Session */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-3">Session</h2>
                    <div className="space-y-2 text-sm">
                        <div>Exists: <span className={debugInfo.session?.exists ? 'text-green-600' : 'text-red-600'}>{debugInfo.session?.exists ? 'Yes' : 'No'}</span></div>
                        {debugInfo.session?.user && (
                            <div>
                                <div>User ID: {debugInfo.session.user.id}</div>
                                <div>Email: {debugInfo.session.user.email}</div>
                                <div>Email Confirmed: {debugInfo.session.user.emailConfirmed ? 'Yes' : 'No'}</div>
                            </div>
                        )}
                        {debugInfo.session?.error && (
                            <div className="text-red-600">Error: {debugInfo.session.error}</div>
                        )}
                    </div>
                </div>

                {/* User */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-3">User</h2>
                    <div className="space-y-2 text-sm">
                        <div>Exists: <span className={debugInfo.user?.exists ? 'text-green-600' : 'text-red-600'}>{debugInfo.user?.exists ? 'Yes' : 'No'}</span></div>
                        {debugInfo.user?.data && (
                            <div>
                                <div>User ID: {debugInfo.user.data.id}</div>
                                <div>Email: {debugInfo.user.data.email}</div>
                                <div>Email Confirmed: {debugInfo.user.data.emailConfirmed ? 'Yes' : 'No'}</div>
                                <div>Metadata: {JSON.stringify(debugInfo.user.data.metadata)}</div>
                            </div>
                        )}
                        {debugInfo.user?.error && (
                            <div className="text-red-600">Error: {debugInfo.user.error}</div>
                        )}
                    </div>
                </div>

                {/* Profile */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-3">Profile</h2>
                    <div className="space-y-2 text-sm">
                        <div>Exists: <span className={debugInfo.profile?.exists ? 'text-green-600' : 'text-red-600'}>{debugInfo.profile?.exists ? 'Yes' : 'No'}</span></div>
                        {debugInfo.profile?.data && (
                            <div>
                                <div>Username: {debugInfo.profile.data.username}</div>
                                <div>Email: {debugInfo.profile.data.email}</div>
                                <div>Region: {debugInfo.profile.data.region || 'Not set'}</div>
                            </div>
                        )}
                        {debugInfo.profile?.error && (
                            <div className="text-red-600">Error: {debugInfo.profile.error}</div>
                        )}
                    </div>
                </div>

                {/* Local Storage */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-3">Local Storage</h2>
                    <div className="space-y-2 text-sm">
                        <div>Auth Token: <span className={debugInfo.localStorage?.authToken === 'Present' ? 'text-green-600' : 'text-red-600'}>{debugInfo.localStorage?.authToken}</span></div>
                        <div>Supabase Keys: {debugInfo.localStorage?.allKeys.length || 0}</div>
                        {debugInfo.localStorage?.allKeys.length > 0 && (
                            <div className="text-xs">
                                {debugInfo.localStorage.allKeys.map((key: string) => (
                                    <div key={key}>• {key}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cookies */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-3">Cookies</h2>
                    <div className="space-y-2 text-sm">
                        <div>Supabase Cookies: {debugInfo.cookies?.supabaseCookies.length || 0}</div>
                        {debugInfo.cookies?.supabaseCookies.length > 0 && (
                            <div className="text-xs">
                                {debugInfo.cookies.supabaseCookies.map((cookie: string, index: number) => (
                                    <div key={index}>• {cookie.trim()}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-3">Actions</h2>
                <div className="space-x-4">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Refresh Page
                    </button>
                    <button 
                        onClick={() => {
                            const supabase = getSupabaseBrowser();
                            supabase.auth.signOut();
                            window.location.reload();
                        }} 
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Raw Data */}
            <details className="border rounded-lg p-4">
                <summary className="text-xl font-semibold cursor-pointer">Raw Debug Data</summary>
                <pre className="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                </pre>
            </details>
        </div>
    );
}
