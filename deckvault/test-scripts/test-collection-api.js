// Test Collection API - Run this in your browser console after signing in
// This will test if cards can be added to your collection

async function testCollectionAPI() {
    console.log('🧪 Testing Collection API...');
    
    try {
        // Test 1: Check authentication
        const authResponse = await fetch('/api/me');
        if (!authResponse.ok) {
            console.log('❌ Not authenticated - please sign in first');
            return;
        }
        console.log('✅ Authentication OK');
        
        // Test 2: Load current collection
        const collectionResponse = await fetch('/api/collection');
        const collectionData = await collectionResponse.json();
        console.log('📦 Current collection items:', collectionData.items.length);
        
        // Test 3: Add a test card
        const testCard = {
            cardId: '123456',
            cardName: 'Test Blue-Eyes White Dragon',
            cardImage: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
            quantity: 1
        };
        
        console.log('➕ Adding test card:', testCard.cardName);
        
        const addResponse = await fetch('/api/collection/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(testCard)
        });
        
        if (addResponse.ok) {
            const result = await addResponse.json();
            console.log('✅ Card added successfully:', result);
            
            // Test 4: Reload collection to verify
            const reloadResponse = await fetch('/api/collection');
            const reloadData = await reloadResponse.json();
            console.log('📦 Collection after adding card:', reloadData.items.length, 'items');
            
            const addedCard = reloadData.items.find(item => item.cardId === '123456');
            if (addedCard) {
                console.log('🎉 SUCCESS: Card is now in your collection!', addedCard);
            } else {
                console.log('❌ Card not found in collection after adding');
            }
        } else {
            const error = await addResponse.text();
            console.log('❌ Failed to add card:', error);
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
testCollectionAPI();
