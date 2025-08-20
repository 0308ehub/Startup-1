const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testYuGiOhProducts() {
  console.log('🃏 Testing Yu-Gi-Oh! products...\n');
  
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
    
    // Get Yu-Gi-Oh! products (Category ID: 2)
    console.log('📂 Getting Yu-Gi-Oh! products...');
    const productsResponse = await fetch('https://api.tcgplayer.com/v1.39.0/catalog/products?categoryId=2&offset=0&limit=10', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${tokenData.access_token}`,
      },
    });
    
    if (!productsResponse.ok) {
      throw new Error(`Products request failed: ${productsResponse.status} ${productsResponse.statusText}`);
    }
    
    const productsData = await productsResponse.json();
    console.log('✅ Yu-Gi-Oh! products retrieved successfully');
    console.log(`Found ${productsData.results.length} products`);
    
    if (productsData.results.length > 0) {
      console.log('\n📋 Sample Yu-Gi-Oh! products:');
      productsData.results.slice(0, 5).forEach(product => {
        console.log(`- ${product.name} (ID: ${product.productId})`);
        console.log(`  Image: ${product.imageUrl ? 'Available' : 'Not available'}`);
        console.log(`  Clean Name: ${product.cleanName}`);
      });
    }
    
    // Test search functionality
    console.log('\n🔍 Testing search for "Blue-Eyes"...');
    const searchResponse = await fetch('https://api.tcgplayer.com/v1.39.0/catalog/products/search', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryId: 2,
        productName: 'Blue-Eyes',
        offset: 0,
        limit: 5,
      }),
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`✅ Search found ${searchData.results.length} products`);
      
      if (searchData.results.length > 0) {
        console.log('\n📋 Search results:');
        searchData.results.forEach(product => {
          console.log(`- ${product.name} (ID: ${product.productId})`);
        });
      }
    } else {
      console.log('❌ Search failed:', searchResponse.statusText);
    }
    
    console.log('\n🎉 Yu-Gi-Oh! API integration test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

require('dotenv').config({ path: '.env.local' });
testYuGiOhProducts();
