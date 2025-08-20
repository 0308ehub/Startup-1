// Test Authentication After Browser Client Fix
// Run this in your browser console after refreshing the page

async function testAuthFixed() {
    console.log('🔧 Testing Authentication After Browser Client Fix...');
    
    try {
        // First, let's check if we're actually signed in on the client side
        console.log('👤 Checking client-side authentication...');
        
        // Test 1: Check session endpoint
        console.log('🔄 Testing /api/auth/session...');
        const sessionResponse = await fetch('/api/auth/session', {
            credentials: 'include'
        });
        
        console.log('Session status:', sessionResponse.status);
        
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            console.log('Session data:', sessionData);
            
            if (sessionData.session) {
                console.log('✅ Session found! User is authenticated.');
                
                // Test 2: Now try /api/me
                console.log('👤 Testing /api/me...');
                const meResponse = await fetch('/api/me', {
                    credentials: 'include'
                });
                
                console.log('Me status:', meResponse.status);
                
                if (meResponse.ok) {
                    const meData = await meResponse.json();
                    console.log('✅ /api/me works! User data:', meData);
                    
                    // Test 3: Try adding a card to collection
                    console.log('➕ Testing card addition...');
                    const addResponse = await fetch('/api/collection/items', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            cardId: 'test456',
                            cardName: 'Test Card - Fixed Auth',
                            cardImage: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
                            quantity: 1
                        })
                    });
                    
                    console.log('Add card status:', addResponse.status);
                    
                    if (addResponse.ok) {
                        const result = await addResponse.json();
                        console.log('🎉 SUCCESS: Card added to collection!');
                        console.log('Result:', result);
                        
                        // Test 4: Verify collection shows the card
                        console.log('📦 Verifying collection...');
                        const collectionResponse = await fetch('/api/collection', {
                            credentials: 'include'
                        });
                        
                        if (collectionResponse.ok) {
                            const collectionData = await collectionResponse.json();
                            console.log('Collection items:', collectionData.items.length);
                            
                            const addedCard = collectionData.items.find(item => item.cardId === 'test456');
                            if (addedCard) {
                                console.log('✅ Card confirmed in collection:', addedCard);
                                console.log('🎉 AUTHENTICATION IS NOW WORKING!');
                            } else {
                                console.log('❌ Card not found in collection');
                            }
                        }
                    } else {
                        const error = await addResponse.text();
                        console.log('❌ Failed to add card:', error);
                    }
                } else {
                    const error = await meResponse.text();
                    console.log('❌ /api/me still failing:', error);
                }
            } else {
                console.log('❌ No session found. User needs to sign in.');
                console.log('💡 Try signing out and signing back in to refresh the session.');
            }
        } else {
            const error = await sessionResponse.text();
            console.log('❌ Session endpoint failed:', error);
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
testAuthFixed();
