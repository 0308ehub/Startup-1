// Test script to verify authentication and collection functionality
// Run this in your browser console or as a Node.js script

async function testAuth() {
    console.log('Testing authentication...');
    
    try {
        // Test 1: Check if user is authenticated
        const response = await fetch('/api/me');
        console.log('Auth check response:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('User data:', userData);
        } else {
            console.log('User not authenticated');
        }
        
        // Test 2: Try to add a card to collection
        const testCard = {
            cardId: '12345',
            cardName: 'Test Card',
            cardImage: 'https://example.com/test.jpg',
            quantity: 1
        };
        
        const collectionResponse = await fetch('/api/collection/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(testCard)
        });
        
        console.log('Collection response status:', collectionResponse.status);
        
        if (collectionResponse.ok) {
            const result = await collectionResponse.json();
            console.log('Collection result:', result);
        } else {
            const error = await collectionResponse.text();
            console.log('Collection error:', error);
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testAuth();
