const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugImageUrls() {
  console.log('🖼️ Debugging image URLs...\n');
  
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
    console.log('🔍 Getting Yu-Gi-Oh! cards with images...');
    const searchResponse = await fetch('https://api.tcgplayer.com/v1.39.0/catalog/categories/2/search', {
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
    console.log(`✅ Found ${searchData.results.length} card product IDs`);
    
    if (searchData.results && searchData.results.length > 0) {
      // Get product details for the cards
      const productIds = searchData.results.slice(0, 5);
      console.log('\n📋 Getting product details...');
      
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
          console.log('\n🖼️ Card details with image URLs:');
          productsData.results.forEach(product => {
            console.log(`\n📌 ${product.name} (ID: ${product.productId})`);
            console.log(`   Image URL: ${product.imageUrl || 'NO IMAGE URL'}`);
            console.log(`   Clean Name: ${product.cleanName}`);
            console.log(`   Image Count: ${product.imageCount}`);
            
            if (product.imageUrl) {
              // Test if the image URL is accessible
              console.log(`   Testing image URL...`);
              fetch(product.imageUrl, { method: 'HEAD' })
                .then(response => {
                  if (response.ok) {
                    console.log(`   ✅ Image URL is accessible (${response.status})`);
                  } else {
                    console.log(`   ❌ Image URL failed (${response.status})`);
                  }
                })
                .catch(error => {
                  console.log(`   ❌ Image URL error: ${error.message}`);
                });
            }
          });
        }
      }
    }
    
    console.log('\n🎉 Image URL debugging completed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

require('dotenv').config({ path: '.env.local' });
debugImageUrls();
