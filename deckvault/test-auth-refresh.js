// Test Authentication with Session Refresh
// Run this in your browser console to test and potentially fix authentication

async function testAuthWithRefresh() {
    console.log('🔄 Testing Authentication with Session Refresh...');
    
    try {
        // Test 1: Check if we have a valid session
        console.log('📡 Checking current session...');
        const sessionResponse = await fetch('/api/auth/session', {
            credentials: 'include'
        });
        
        console.log('Session response status:', sessionResponse.status);
        
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('Session data:', sessionData);
            
            if (sessionData.session) {
                console.log('✅ Valid session found');
            } else {
                console.log('❌ No valid session found');
            }
        } else {
            console.log('❌ Session endpoint failed');
        }
        
        // Test 2: Check if we're actually signed in by looking at the UI
        console.log('👀 Checking UI for sign-in status...');
        const signInButton = document.querySelector('a[href="/sign-in"]');
        const userButton = document.querySelector('button[class*="bg-blue-500"]');
        
        if (signInButton) {
            console.log('❌ Sign-in button visible - user not authenticated');
            console.log('💡 Try signing in again through the UI');
            return;
        } else if (userButton) {
            console.log('✅ User button visible - user appears to be authenticated');
        } else {
            console.log('❓ Cannot determine auth status from UI');
        }
        
        // Test 3: Check localStorage for auth token
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
        
        // Test 4: Try to refresh the session manually
        console.log('🔄 Attempting to refresh session...');
        try {
            // Try to trigger a session refresh by accessing a protected route
            const refreshResponse = await fetch('/api/collection', {
                credentials: 'include'
            });
            console.log('Collection endpoint status:', refreshResponse.status);
            
            if (refreshResponse.ok) {
                console.log('✅ Collection endpoint accessible - session might be working');
            } else {
                console.log('❌ Collection endpoint failed - session issue confirmed');
            }
        } catch (refreshError) {
            console.log('❌ Session refresh failed:', refreshError);
        }
        
        // Test 5: Final auth test
        console.log('🔐 Final authentication test...');
        const finalAuthResponse = await fetch('/api/me', {
            credentials: 'include'
        });
        
        console.log('Final auth status:', finalAuthResponse.status);
        
        if (finalAuthResponse.ok) {
            const userData = await finalAuthResponse.json();
            console.log('🎉 SUCCESS: Authentication working!');
            console.log('User data:', userData);
        } else {
            const errorText = await finalAuthResponse.text();
            console.log('❌ Final auth failed:', errorText);
            console.log('💡 Recommendation: Try signing out and signing back in');
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
testAuthWithRefresh();
