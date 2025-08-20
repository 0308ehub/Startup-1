// Test Card Creation Issue
// Run this in your browser console to debug the card creation problem

async function testCardCreation() {
    console.log('🔍 Testing Card Creation Issue...');
    
    try {
        // Test with a unique card ID to avoid conflicts
        const uniqueCardId = `test_${Date.now()}`;
        const testCard = {
            cardId: uniqueCardId,
            cardName: `Test Card ${uniqueCardId}`,
            cardImage: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
            quantity: 1
        };
        
        console.log('➕ Testing card addition with unique ID:', uniqueCardId);
        
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
            
            // Verify it was added
            console.log('📦 Verifying collection...');
            const collectionResponse = await fetch('/api/collection', {
                credentials: 'include'
            });
            
            if (collectionResponse.ok) {
                const collectionData = await collectionResponse.json();
                console.log('Collection items:', collectionData.items.length);
                
                const addedCard = collectionData.items.find(item => item.cardId === uniqueCardId);
                if (addedCard) {
                    console.log('✅ Card confirmed in collection:', addedCard);
                    console.log('🎉 CARD CREATION IS WORKING!');
                } else {
                    console.log('❌ Card not found in collection after adding');
                }
            }
        } else {
            const error = await addResponse.text();
            console.log('❌ Failed to add card:', error);
            
            // Try to get more details about the error
            try {
                const errorJson = JSON.parse(error);
                console.log('Error details:', errorJson);
            } catch (e) {
                console.log('Raw error:', error);
            }
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
testCardCreation();
