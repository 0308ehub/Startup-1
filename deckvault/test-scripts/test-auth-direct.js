// Direct Authentication Test
// Run this in your browser console to test authentication directly

async function testAuthDirect() {
    console.log('🎯 Direct Authentication Test...');
    
    try {
        // Test 1: Check if we can access the Supabase client directly
        console.log('🔧 Checking Supabase client...');
        
        // Test 2: Try a simple health check first
        console.log('🏥 Testing health endpoint...');
        const healthResponse = await fetch('/api/health');
        console.log('Health status:', healthResponse.status);
        
        // Test 3: Try the auth endpoint with different approaches
        console.log('🔐 Testing auth endpoint...');
        
        // Approach 1: Basic fetch
        const authResponse1 = await fetch('/api/me');
        console.log('Basic fetch status:', authResponse1.status);
        
        // Approach 2: With credentials
        const authResponse2 = await fetch('/api/me', {
            credentials: 'include'
        });
        console.log('With credentials status:', authResponse2.status);
        
        // Approach 3: With full headers
        const authResponse3 = await fetch('/api/me', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        console.log('With full headers status:', authResponse3.status);
        
        // If any of them worked, show the data
        if (authResponse1.ok) {
            const data = await authResponse1.json();
            console.log('✅ Auth successful (basic):', data);
        } else if (authResponse2.ok) {
            const data = await authResponse2.json();
            console.log('✅ Auth successful (credentials):', data);
        } else if (authResponse3.ok) {
            const data = await authResponse3.json();
            console.log('✅ Auth successful (full headers):', data);
        } else {
            console.log('❌ All auth attempts failed');
            
            // Show error details
            const error1 = await authResponse1.text();
            const error2 = await authResponse2.text();
            const error3 = await authResponse3.text();
            
            console.log('Error 1:', error1);
            console.log('Error 2:', error2);
            console.log('Error 3:', error3);
        }
        
    } catch (error) {
        console.error('💥 Direct test failed:', error);
    }
}

// Run the test
testAuthDirect();
