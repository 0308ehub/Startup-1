const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testTCGPlayerAPI() {
  console.log('🧪 Testing TCGplayer API...\n');
  
  // Check environment variables
  const publicKey = process.env.TCGPLAYER_PUBLIC_KEY;
  const privateKey = process.env.TCGPLAYER_PRIVATE_KEY;
  
  console.log('📋 Environment Variables:');
  console.log(`Public Key: ${publicKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`Private Key: ${privateKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!publicKey || !privateKey) {
    console.log('\n❌ API keys not found in environment variables');
    console.log('Make sure to add them to your .env.local file and restart the server');
    return;
  }
  
  try {
    // Step 1: Get bearer token
    console.log('\n🔑 Step 1: Getting bearer token...');
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
    
    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Bearer token obtained successfully');
    console.log(`Token expires in: ${tokenData.expires_in} seconds`);
    
    // Step 2: Get categories
    console.log('\n📂 Step 2: Getting categories...');
    const categoriesResponse = await fetch('https://api.tcgplayer.com/v1.39.0/catalog/categories', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${tokenData.access_token}`,
      },
    });
    
    if (!categoriesResponse.ok) {
      throw new Error(`Categories request failed: ${categoriesResponse.status} ${categoriesResponse.statusText}`);
    }
    
    const categoriesData = await categoriesResponse.json();
    const yugiohCategory = categoriesData.results.find(cat => cat.name === 'YuGiOh');
    
    if (yugiohCategory) {
      console.log('✅ Yu-Gi-Oh! category found');
      console.log(`Category ID: ${yugiohCategory.categoryId}`);
      console.log(`Name: ${yugiohCategory.name}`);
      
      // Step 3: Get Yu-Gi-Oh! products
      console.log('\n🃏 Step 3: Getting Yu-Gi-Oh! products...');
      const productsResponse = await fetch(`https://api.tcgplayer.com/v1.39.0/catalog/products?categoryId=${yugiohCategory.categoryId}&offset=0&limit=5`, {
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
        console.log('\n📋 Sample products:');
        productsData.results.slice(0, 3).forEach(product => {
          console.log(`- ${product.name} (ID: ${product.productId})`);
        });
      }
      
    } else {
      console.log('❌ Yu-Gi-Oh! category not found');
    }
    
    console.log('\n🎉 All tests passed! Your TCGplayer API integration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if your API keys are correct');
    console.log('2. Verify your internet connection');
    console.log('3. Check if TCGplayer API is accessible');
  }
}

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

testTCGPlayerAPI();
