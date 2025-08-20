// Debug Authentication Difference
// Run this in your browser console to see the exact difference

async function debugAuthDifference() {
    console.log('🔍 Debugging Authentication Difference...');
    
    try {
        // Test 1: Check what /api/collection returns (working endpoint)
        console.log('📦 Testing /api/collection (working endpoint)...');
        const collectionResponse = await fetch('/api/collection', {
            credentials: 'include'
        });
        
        console.log('Collection status:', collectionResponse.status);
        console.log('Collection headers:', Object.fromEntries(collectionResponse.headers.entries()));
        
        if (collectionResponse.ok) {
            const collectionData = await collectionResponse.json();
            console.log('Collection data:', collectionData);
        }
        
        // Test 2: Check what /api/me returns (failing endpoint)
        console.log('👤 Testing /api/me (failing endpoint)...');
        const meResponse = await fetch('/api/me', {
            credentials: 'include'
        });
        
        console.log('Me status:', meResponse.status);
        console.log('Me headers:', Object.fromEntries(meResponse.headers.entries()));
        
        if (meResponse.ok) {
            const meData = await meResponse.json();
            console.log('Me data:', meData);
        } else {
            const meError = await meResponse.text();
            console.log('Me error:', meError);
        }
        
        // Test 3: Check what /api/collection/items returns (failing endpoint)
        console.log('➕ Testing /api/collection/items (failing endpoint)...');
        const itemsResponse = await fetch('/api/collection/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                cardId: 'test123',
                cardName: 'Test Card',
                cardImage: 'https://example.com/test.jpg',
                quantity: 1
            })
        });
        
        console.log('Items status:', itemsResponse.status);
        console.log('Items headers:', Object.fromEntries(itemsResponse.headers.entries()));
        
        if (itemsResponse.ok) {
            const itemsData = await itemsResponse.json();
            console.log('Items data:', itemsData);
        } else {
            const itemsError = await itemsResponse.text();
            console.log('Items error:', itemsError);
        }
        
        // Test 4: Check session endpoint
        console.log('🔄 Testing /api/auth/session...');
        const sessionResponse = await fetch('/api/auth/session', {
            credentials: 'include'
        });
        
        console.log('Session status:', sessionResponse.status);
        
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('Session data:', sessionData);
        } else {
            const sessionError = await sessionResponse.text();
            console.log('Session error:', sessionError);
        }
        
        // Summary
        console.log('📊 SUMMARY:');
        console.log('- /api/collection:', collectionResponse.status);
        console.log('- /api/me:', meResponse.status);
        console.log('- /api/collection/items:', itemsResponse.status);
        console.log('- /api/auth/session:', sessionResponse.status);
        
    } catch (error) {
        console.error('💥 Debug failed:', error);
    }
}

// Run the debug
debugAuthDifference();
