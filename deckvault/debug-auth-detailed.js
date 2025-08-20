// Detailed Authentication Debug
// Run this in your browser console to debug authentication issues

async function debugAuth() {
    console.log('🔍 Detailed Authentication Debug...');
    
    try {
        // Test 1: Check if we have any cookies
        console.log('🍪 Checking cookies...');
        const cookies = document.cookie;
        console.log('All cookies:', cookies);
        
        // Check for Supabase cookies specifically
        const supabaseCookies = cookies.split(';').filter(cookie => 
            cookie.trim().startsWith('sb-') || 
            cookie.trim().includes('supabase')
        );
        console.log('Supabase cookies:', supabaseCookies);
        
        // Test 2: Check if we're on the right domain
        console.log('🌐 Current domain:', window.location.hostname);
        console.log('🔗 Current URL:', window.location.href);
        
        // Test 3: Try the auth request with detailed logging
        console.log('📡 Making auth request...');
        const response = await fetch('/api/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const userData = await response.json();
            console.log('✅ Authentication successful!');
            console.log('👤 User data:', userData);
        } else {
            const errorText = await response.text();
            console.log('❌ Authentication failed');
            console.log('📝 Error response:', errorText);
            
            // Test 4: Try a different approach - check if we can access the session
            console.log('🔄 Trying alternative auth check...');
            try {
                const sessionResponse = await fetch('/api/auth/session', {
                    credentials: 'include'
                });
                console.log('Session response status:', sessionResponse.status);
                if (sessionResponse.ok) {
                    const sessionData = await sessionResponse.text();
                    console.log('Session data:', sessionData);
                }
            } catch (sessionError) {
                console.log('Session check failed:', sessionError);
            }
        }
        
    } catch (error) {
        console.error('💥 Debug failed:', error);
    }
}

// Run the debug
debugAuth();
