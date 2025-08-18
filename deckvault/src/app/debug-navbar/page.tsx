"use client";
import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export default function DebugNavbarPage() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function debugAuth() {
      try {
        const supabase = getSupabaseBrowser();
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // Get profile data
        let profileData = null;
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          profileData = profile;
        }

        // Get session
        const { data: { session } } = await supabase.auth.getSession();

        setDebugInfo({
          user,
          profile: profileData,
          session,
          localStorage: {
            authToken: typeof window !== 'undefined' ? window.localStorage.getItem('sb-gqlrxngvvhtwkrgrjuld-auth-token') : null
          }
        });
      } catch (error) {
        console.error('Debug error:', error);
      } finally {
        setLoading(false);
      }
    }

    debugAuth();
  }, []);

  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Navbar Auth Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">User Info</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo?.user, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Profile Info</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debugInfo?.profile, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Expected Display Name</h2>
          <p>Based on the data above, your navbar should display:</p>
          <p className="font-mono bg-white p-2 rounded mt-2">
            {debugInfo?.profile?.username || 
             debugInfo?.user?.user_metadata?.username || 
             debugInfo?.user?.email || 
             'No display name found'}
          </p>
        </div>
      </div>
    </div>
  );
}
