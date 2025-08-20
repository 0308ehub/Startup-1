// Supabase Client Test
// Run this in your browser console to test Supabase client directly

async function testSupabaseClient() {
    console.log('🔧 Testing Supabase Client...');
    
    try {
        // Check if Supabase is available globally
        if (typeof window !== 'undefined' && window.supabase) {
            console.log('✅ Supabase available globally');
        } else {
            console.log('❌ Supabase not available globally');
        }
        
        // Try to import and use Supabase client
        console.log('📡 Testing Supabase auth...');
        
        // Test 1: Check if we can get the current session
        const sessionResponse = await fetch('/api/auth/session', {
            credentials: 'include'
        });
        console.log('Session response status:', sessionResponse.status);
        
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.text();
            console.log('Session data:', sessionData);
        }
        
        // Test 2: Try to get user info directly
        const userResponse = await fetch('/api/auth/user', {
            credentials: 'include'
        });
        console.log('User response status:', userResponse.status);
        
        if (userResponse.ok) {
            const userData = await userResponse.text();
            console.log('User data:', userData);
        }
        
        // Test 3: Check if we're actually signed in by looking at the UI
        console.log('👀 Checking UI for sign-in status...');
        const signInButton = document.querySelector('a[href="/sign-in"]');
        const userButton = document.querySelector('button[class*="bg-blue-500"]');
        
        if (signInButton) {
            console.log('❌ Sign-in button visible - user not authenticated');
        } else if (userButton) {
            console.log('✅ User button visible - user appears to be authenticated');
        } else {
            console.log('❓ Cannot determine auth status from UI');
        }
        
        // Test 4: Check localStorage for any auth tokens
        console.log('💾 Checking localStorage...');
        const authKeys = Object.keys(localStorage).filter(key => 
            key.includes('supabase') || key.includes('auth') || key.includes('sb-')
        );
        console.log('Auth-related localStorage keys:', authKeys);
        
        if (authKeys.length > 0) {
            authKeys.forEach(key => {
                try {
                    const value = localStorage.getItem(key);
                    console.log(`${key}:`, value ? 'exists' : 'empty');
                } catch (e) {
                    console.log(`${key}: error reading`);
                }
            });
        }
        
    } catch (error) {
        console.error('💥 Supabase client test failed:', error);
    }
}

// Run the test
testSupabaseClient();
