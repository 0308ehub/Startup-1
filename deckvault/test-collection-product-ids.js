// Test Collection Product IDs
// Run this in your browser console to see what product IDs your collection cards have

async function testCollectionProductIds() {
    console.log('🔍 Testing Collection Product IDs...');
    
    try {
        const response = await fetch('/api/collection', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📦 Collection data:', data);
            
            if (data.items && data.items.length > 0) {
                console.log('🆔 Product IDs in collection:');
                data.items.forEach((item, index) => {
                    console.log(`${index + 1}. ${item.cardName}:`);
                    console.log(`   - cardId: ${item.cardId}`);
                    console.log(`   - price: ${item.price}`);
                    console.log(`   - product_id type: ${typeof item.cardId}`);
                });
            } else {
                console.log('❌ No items found in collection');
            }
        } else {
            console.error('❌ Failed to fetch collection:', response.status);
        }

    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
testCollectionProductIds();
