// Test All Collection Prices
// Run this in your browser console to test prices for all your collection cards

async function testAllCollectionPrices() {
    console.log('🔍 Testing All Collection Prices...');
    
    try {
        // First get the collection data
        const collectionResponse = await fetch('/api/collection', {
            credentials: 'include'
        });

        if (collectionResponse.ok) {
            const collectionData = await collectionResponse.json();
            console.log('📦 Collection data:', collectionData);
            
            if (collectionData.items && collectionData.items.length > 0) {
                // Extract all product IDs from the collection
                const productIds = collectionData.items
                    .map(item => parseInt(item.cardId))
                    .filter(id => !isNaN(id));
                
                console.log('🆔 Product IDs to test:', productIds);
                
                // Test prices for all these product IDs
                const priceResponse = await fetch('/api/tcgplayer/prices', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ productIds }),
                });

                if (priceResponse.ok) {
                    const priceData = await priceResponse.json();
                    console.log('💰 Price API response:', priceData);
                    
                    if (priceData.success) {
                        console.log('✅ Prices found for collection cards:');
                        collectionData.items.forEach((item, index) => {
                            const productId = parseInt(item.cardId);
                            const price = priceData.data[productId] || 0;
                            console.log(`${index + 1}. ${item.cardName}:`);
                            console.log(`   - Product ID: ${productId}`);
                            console.log(`   - Price: $${price.toFixed(2)}`);
                            console.log(`   - Current collection price: $${item.price.toFixed(2)}`);
                        });
                    } else {
                        console.log('❌ Price API returned error:', priceData);
                    }
                } else {
                    console.error('❌ Price API request failed:', priceResponse.status);
                }
            } else {
                console.log('❌ No items found in collection');
            }
        } else {
            console.error('❌ Failed to fetch collection:', collectionResponse.status);
        }

    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
testAllCollectionPrices();
