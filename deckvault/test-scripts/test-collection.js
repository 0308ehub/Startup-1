// Test script to verify collection functionality
// Run this in your browser console after signing in

async function testCollection() {
    console.log('Testing collection functionality...');
    
    try {
        // Test 1: Check if user is authenticated
        const authResponse = await fetch('/api/me');
        console.log('Auth check response:', authResponse.status);
        
        if (!authResponse.ok) {
            console.log('User not authenticated - please sign in first');
            return;
        }
        
        // Test 2: Load current collection
        const collectionResponse = await fetch('/api/collection');
        console.log('Collection response status:', collectionResponse.status);
        
        if (collectionResponse.ok) {
            const collectionData = await collectionResponse.json();
            console.log('Current collection items:', collectionData.items.length);
            console.log('Collection data:', collectionData);
        } else {
            console.log('Failed to load collection');
        }
        
        // Test 3: Try to add a test card
        const testCard = {
            cardId: '999999',
            cardName: 'Test Card for Collection',
            cardImage: 'https://example.com/test.jpg',
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
        
        console.log('Add card response status:', addResponse.status);
        
        if (addResponse.ok) {
            const result = await addResponse.json();
            console.log('Add card result:', result);
            
            // Test 4: Reload collection to verify it was added
            const reloadResponse = await fetch('/api/collection');
            if (reloadResponse.ok) {
                const reloadData = await reloadResponse.json();
                console.log('Collection after adding card:', reloadData.items.length, 'items');
                
                const testItem = reloadData.items.find(item => item.cardId === '999999');
                if (testItem) {
                    console.log('✅ Test card successfully added to collection:', testItem);
                } else {
                    console.log('❌ Test card not found in collection after adding');
                }
            }
        } else {
            const error = await addResponse.text();
            console.log('Add card error:', error);
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testCollection();
