// Direct Collection Test - Bypasses /api/me authentication issues
// Run this in your browser console to test collection functionality directly

async function testCollectionDirect() {
    console.log('🎯 Direct Collection Test (Bypassing /api/me)...');
    
    try {
        // Test 1: Check if collection endpoint works (we know it does)
        console.log('📦 Testing collection endpoint...');
        const collectionResponse = await fetch('/api/collection', {
            credentials: 'include'
        });
        
        console.log('Collection status:', collectionResponse.status);
        
        if (collectionResponse.ok) {
            const collectionData = await collectionResponse.json();
            console.log('✅ Collection accessible!');
            console.log('Current items:', collectionData.items.length);
            
            // Test 2: Try to add a card directly
            console.log('➕ Testing card addition...');
            const testCard = {
                cardId: '999888',
                cardName: 'Test Card - Direct Add',
                cardImage: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
                quantity: 1
            };
            
            const addResponse = await fetch('/api/collection/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(testCard)
            });
            
            console.log('Add card status:', addResponse.status);
            
            if (addResponse.ok) {
                const result = await addResponse.json();
                console.log('🎉 SUCCESS: Card added to collection!');
                console.log('Result:', result);
                
                // Test 3: Verify the card was added
                console.log('🔍 Verifying card was added...');
                const verifyResponse = await fetch('/api/collection', {
                    credentials: 'include'
                });
                
                if (verifyResponse.ok) {
                    const verifyData = await verifyResponse.json();
                    console.log('Updated collection items:', verifyData.items.length);
                    
                    const addedCard = verifyData.items.find(item => item.cardId === '999888');
                    if (addedCard) {
                        console.log('✅ Card confirmed in collection:', addedCard);
                        console.log('🎉 COLLECTION FUNCTIONALITY IS WORKING!');
                    } else {
                        console.log('❌ Card not found in collection after adding');
                    }
                }
            } else {
                const error = await addResponse.text();
                console.log('❌ Failed to add card:', error);
            }
        } else {
            console.log('❌ Collection endpoint failed');
        }
        
    } catch (error) {
        console.error('💥 Collection test failed:', error);
    }
}

// Run the test
testCollectionDirect();
