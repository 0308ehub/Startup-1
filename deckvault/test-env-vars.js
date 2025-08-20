// Test Environment Variables and Supabase Client
// Run this in your browser console to check configuration

async function testEnvVars() {
    console.log('🔧 Testing Environment Variables and Supabase Client...');
    
    try {
        // Test 1: Check if we can access the Supabase client
        console.log('📡 Testing Supabase client access...');
        
        // Try to access the Supabase client through the window object
        if (typeof window !== 'undefined') {
            console.log('✅ Window object available');
            
            // Check if there's a global Supabase object
            if (window.supabase) {
                console.log('✅ Global Supabase object found');
            } else {
                console.log('❌ No global Supabase object found');
            }
        }
        
        // Test 2: Check if we can make a direct Supabase request
        console.log('🌐 Testing direct Supabase connection...');
        
        // Try to access the Supabase URL directly
        const supabaseUrl = 'https://gqlrxngvvhtwkrgrjuld.supabase.co';
        console.log('Supabase URL:', supabaseUrl);
        
        // Test 3: Check if the auth token in localStorage is valid
        console.log('🔑 Checking auth token validity...');
        const authKeys = Object.keys(localStorage).filter(key => 
            key.includes('supabase') || key.includes('auth') || key.includes('sb-')
        );
        
        if (authKeys.length > 0) {
            console.log('Found auth keys:', authKeys);
            
            // Try to parse the auth token
            const authKey = authKeys[0];
            try {
                const authValue = localStorage.getItem(authKey);
                if (authValue) {
                    const parsed = JSON.parse(authValue);
                    console.log('Auth token structure:', Object.keys(parsed));
                    
                    // Check if token has expired
                    if (parsed.expires_at) {
                        const expiresAt = new Date(parsed.expires_at * 1000);
                        const now = new Date();
                        console.log('Token expires at:', expiresAt);
                        console.log('Current time:', now);
                        
                        if (expiresAt > now) {
                            console.log('✅ Token is still valid');
                        } else {
                            console.log('❌ Token has expired');
                        }
                    }
                }
            } catch (parseError) {
                console.log('❌ Could not parse auth token:', parseError);
            }
        } else {
            console.log('❌ No auth tokens found in localStorage');
        }
        
        // Test 4: Try to clear and re-authenticate
        console.log('🔄 Testing session refresh...');
        
        // Check if we can access the session endpoint
        const sessionResponse = await fetch('/api/auth/session', {
            credentials: 'include'
        });
        
        console.log('Session endpoint status:', sessionResponse.status);
        
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('Session data:', sessionData);
            
            if (sessionData.session) {
                console.log('✅ Valid session found');
            } else {
                console.log('❌ No session in response');
            }
        } else {
            console.log('❌ Session endpoint failed');
        }
        
        // Test 5: Check if we need to sign in again
        console.log('👤 Checking if user needs to sign in...');
        
        // Look for sign-in button
        const signInButton = document.querySelector('a[href="/sign-in"]');
        if (signInButton) {
            console.log('💡 Sign-in button found - user needs to authenticate');
            console.log('🔗 Sign-in URL:', signInButton.href);
        } else {
            console.log('✅ No sign-in button found - user appears authenticated');
        }
        
    } catch (error) {
        console.error('💥 Environment test failed:', error);
    }
}

// Run the test
testEnvVars();
