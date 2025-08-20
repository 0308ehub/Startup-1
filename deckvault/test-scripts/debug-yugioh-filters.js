const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugYuGiOhFilters() {
  console.log('🔍 Debugging Yu-Gi-Oh! search manifest...\n');
  
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
    
    // Get Yu-Gi-Oh! search manifest (Category ID: 2)
    console.log('📋 Getting Yu-Gi-Oh! search manifest...');
    const manifestResponse = await fetch('https://api.tcgplayer.com/v1.39.0/catalog/categories/2/search/manifest', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${tokenData.access_token}`,
      },
    });
    
    if (!manifestResponse.ok) {
      throw new Error(`Manifest request failed: ${manifestResponse.status} ${manifestResponse.statusText}`);
    }
    
    const manifestData = await manifestResponse.json();
    console.log('✅ Yu-Gi-Oh! search manifest retrieved successfully');
    
    if (manifestData.results && manifestData.results.length > 0) {
      const manifest = manifestData.results[0];
      
      console.log('\n📊 Available sorting options:');
      if (manifest.sorting) {
        manifest.sorting.forEach(sort => {
          console.log(`- ${sort.text} (value: ${sort.value})`);
        });
      }
      
      console.log('\n🔧 Available filters:');
      if (manifest.filters) {
        manifest.filters.forEach(filter => {
          console.log(`\n📌 Filter: ${filter.displayName} (${filter.name})`);
          console.log(`   Type: ${filter.inputType}`);
          if (filter.items && filter.items.length > 0) {
            console.log(`   Options (${filter.items.length}):`);
            filter.items.slice(0, 10).forEach(item => {
              console.log(`     - ${item.text} (value: ${item.value})`);
            });
            if (filter.items.length > 10) {
              console.log(`     ... and ${filter.items.length - 10} more`);
            }
          }
        });
      }
      
      // Look for product type filters
      const productTypeFilter = manifest.filters?.find(f => 
        f.name.toLowerCase().includes('product') || 
        f.name.toLowerCase().includes('type') ||
        f.displayName.toLowerCase().includes('product') ||
        f.displayName.toLowerCase().includes('type')
      );
      
      if (productTypeFilter) {
        console.log('\n🎯 Found product type filter!');
        console.log(`Name: ${productTypeFilter.displayName} (${productTypeFilter.name})`);
        console.log('Available product types:');
        productTypeFilter.items?.forEach(item => {
          console.log(`- ${item.text} (value: ${item.value})`);
        });
      }
      
    } else {
      console.log('❌ No manifest data found');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

require('dotenv').config({ path: '.env.local' });
debugYuGiOhFilters();
