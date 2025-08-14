"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

interface AuthData {
    session: unknown | null;
    sessionError: unknown | null;
}

interface ProfileData {
    profile: unknown | null;
    profileError: unknown | null;
}

export default function TestAuthPage() {
    const [authData, setAuthData] = useState<AuthData | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const supabase = getSupabaseBrowser();
            
            // Check current session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            console.log('Session:', session);
            console.log('Session error:', sessionError);
            
            setAuthData({ session, sessionError });
            
            if (session?.user) {
                // Check profile data
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                console.log('Profile:', profile);
                console.log('Profile error:', profileError);
                
                setProfileData({ profile, profileError });
            }
            
            setLoading(false);
        }
        
        checkAuth();
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Authentication Test</h1>
            
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Session Data:</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(authData, null, 2)}
                </pre>
            </div>
            
            {profileData && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Profile Data:</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(profileData, null, 2)}
                    </pre>
                </div>
            )}
            
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Actions:</h2>
                <div className="space-x-4">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Refresh Page
                    </button>
                    <button 
                        onClick={async () => {
                            const supabase = getSupabaseBrowser();
                            await supabase.auth.signOut();
                            window.location.href = '/';
                        }} 
                        className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
