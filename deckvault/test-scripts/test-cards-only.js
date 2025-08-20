const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCardsOnly() {
  console.log('🃏 Testing Yu-Gi-Oh! cards only...\n');
  
  const publicKey = process.env.TCGPLAYER_PUBLIC_KEY;
  const privateKey = process.env.TCGPLAYER_PRIVATE_KEY;
  
  try {
    // Get bearer token
    const tokenResponse = await fetch('https://api.tcgplayer.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: publicKey,
        client_secret: privateKey,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    // Test search for cards only (Category ID: 2)
    console.log('🔍 Searching for Yu-Gi-Oh! cards only...');
    const searchResponse = await fetch('https://api.tcgplayer.com/v1.39.0/catalog/categories/2/search', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sort: 'ProductName ASC',
        limit: 10,
        offset: 0,
        filters: [
          {
            name: 'CardType',
            values: ['MainDeckMonster', 'ExtraDeckMonster', 'Spell', 'Trap']
          }
        ]
      }),
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Search request failed: ${searchResponse.status} ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    console.log('✅ Search completed successfully');
    console.log(`Found ${searchData.results.length} card product IDs`);
    
    if (searchData.results && searchData.results.length > 0) {
      // Get product details for the first few cards
      const productIds = searchData.results.slice(0, 5);
      console.log('\n📋 Getting details for first 5 cards...');
      
      const productsResponse = await fetch(`https://api.tcgplayer.com/v1.39.0/catalog/products/${productIds.join(',')}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `bearer ${tokenData.access_token}`,
        },
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('✅ Product details retrieved');
        
        if (productsData.results && productsData.results.length > 0) {
          console.log('\n🃏 Sample Yu-Gi-Oh! cards:');
          productsData.results.forEach(product => {
            console.log(`- ${product.name} (ID: ${product.productId})`);
            console.log(`  Clean Name: ${product.cleanName}`);
            console.log(`  Image: ${product.imageUrl ? 'Available' : 'Not available'}`);
            console.log('');
          });
        }
      }
    }
    
    // Test search with name filter
    console.log('\n🔍 Testing search for "Blue-Eyes" cards...');
    const nameSearchResponse = await fetch('https://api.tcgplayer.com/v1.39.0/catalog/categories/2/search', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sort: 'ProductName ASC',
        limit: 5,
        offset: 0,
        filters: [
          {
            name: 'ProductName',
            values: ['Blue-Eyes']
          },
          {
            name: 'CardType',
            values: ['MainDeckMonster', 'ExtraDeckMonster', 'Spell', 'Trap']
          }
        ]
      }),
    });
    
    if (nameSearchResponse.ok) {
      const nameSearchData = await nameSearchResponse.json();
      console.log(`✅ Name search found ${nameSearchData.results.length} Blue-Eyes cards`);
      
      if (nameSearchData.results && nameSearchData.results.length > 0) {
        const blueEyesIds = nameSearchData.results.slice(0, 3);
        const blueEyesResponse = await fetch(`https://api.tcgplayer.com/v1.39.0/catalog/products/${blueEyesIds.join(',')}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `bearer ${tokenData.access_token}`,
          },
        });
        
        if (blueEyesResponse.ok) {
          const blueEyesData = await blueEyesResponse.json();
          console.log('\n🐉 Blue-Eyes cards found:');
          blueEyesData.results.forEach(product => {
            console.log(`- ${product.name} (ID: ${product.productId})`);
          });
        }
      }
    }
    
    console.log('\n🎉 Cards-only search test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

require('dotenv').config({ path: '.env.local' });
testCardsOnly();
