// Simple Authentication Test
// Run this in your browser console to test if authentication is working

async function testAuth() {
    console.log('🔐 Testing Authentication...');
    
    try {
        // Test 1: Check if user is authenticated
        const response = await fetch('/api/me');
        console.log('Auth response status:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('✅ Authentication successful!');
            console.log('User data:', userData);
            return true;
        } else {
            console.log('❌ Authentication failed - status:', response.status);
            const errorText = await response.text();
            console.log('Error details:', errorText);
            return false;
        }
        
    } catch (error) {
        console.error('💥 Auth test failed:', error);
        return false;
    }
}

// Run the test
testAuth();
