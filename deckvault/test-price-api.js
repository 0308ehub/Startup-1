// Test Price API
// Run this in your browser console to test the price API directly

async function testPriceAPI() {
    console.log('🔍 Testing Price API...');
    
    try {
        // Test with some known product IDs
        const testProductIds = [23259, 25692]; // 3-Hump Lacooda and "A" Cell Scatter Burst
        
        console.log('📦 Testing with product IDs:', testProductIds);
        
        const response = await fetch('/api/tcgplayer/prices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productIds: testProductIds }),
        });

        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Price API response:', data);
            console.log('💰 Prices found:', data.data);
        } else {
            const errorText = await response.text();
            console.error('❌ Price API error:', errorText);
        }

    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
testPriceAPI();
