const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getBearerToken() {
  const publicKey = process.env.TCGPLAYER_PUBLIC_KEY;
  const privateKey = process.env.TCGPLAYER_PRIVATE_KEY;
  
  if (!publicKey || !privateKey) {
    throw new Error('TCGPLAYER_PUBLIC_KEY and TCGPLAYER_PRIVATE_KEY environment variables are required');
  }
  
  const response = await fetch('https://api.tcgplayer.com/token', {
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

  if (!response.ok) {
    throw new Error(`Failed to get bearer token: ${response.status} ${response.statusText}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

async function getProductPrices(productIds, token) {
  console.log(`💰 Getting prices for ${productIds.length} products...`);
  
  const response = await fetch(`https://api.tcgplayer.com/v1.39.0/pricing/product/${productIds.join(',')}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pricing API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const data = await response.json();
  return data;
}

async function searchProducts(searchTerm, token) {
  console.log(`🔍 Searching for products: "${searchTerm}"`);
  
  // Search in Yu-Gi-Oh! category (ID: 2)
  const response = await fetch(`https://api.tcgplayer.com/v1.39.0/catalog/products?name=${encodeURIComponent(searchTerm)}&categoryId=2&limit=10`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Product search failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const data = await response.json();
  return data;
}

async function getTCGPrices() {
  console.log('🎴 TCGPlayer Price Lookup Tool\n');
  
  try {
    // Get bearer token
    console.log('🔑 Getting authentication token...');
    const token = await getBearerToken();
    console.log('✅ Authentication successful\n');
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('Usage: node get-tcg-prices.js <search_term> [product_id1,product_id2,...]');
      console.log('\nExamples:');
      console.log('  node get-tcg-prices.js "Blue-Eyes White Dragon"');
      console.log('  node get-tcg-prices.js "Dark Magician" 1234,5678,9012');
      console.log('  node get-tcg-prices.js --ids 1234,5678,9012');
      return;
    }
    
    let productIds = [];
    let searchTerm = null;
    
    // Parse arguments
    if (args[0] === '--ids' && args[1]) {
      productIds = args[1].split(',').map(id => parseInt(id.trim()));
    } else {
      searchTerm = args[0];
      
      // Check if additional product IDs were provided
      if (args[1]) {
        productIds = args[1].split(',').map(id => parseInt(id.trim()));
      }
    }
    
    // If search term provided, search for products first
    if (searchTerm) {
      const searchResults = await searchProducts(searchTerm, token);
      
      if (searchResults.results && searchResults.results.length > 0) {
        console.log(`\n📋 Found ${searchResults.results.length} products:`);
        searchResults.results.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} (ID: ${product.productId})`);
          if (product.cleanName) {
            console.log(`   Clean Name: ${product.cleanName}`);
          }
          if (product.imageUrl) {
            console.log(`   Image: ${product.imageUrl}`);
          }
          console.log('');
        });
        
        // If no specific product IDs provided, use the first result
        if (productIds.length === 0) {
          productIds = [searchResults.results[0].productId];
          console.log(`🎯 Using first result: ${searchResults.results[0].name} (ID: ${productIds[0]})`);
        }
      } else {
        console.log('❌ No products found for the search term');
        return;
      }
    }
    
    // Get prices for the product IDs
    if (productIds.length > 0) {
      const pricingData = await getProductPrices(productIds, token);
      
      if (pricingData.success && pricingData.results) {
        console.log('\n💰 Price Results:');
        console.log('='.repeat(50));
        
        // Group results by product ID
        const productGroups = {};
        pricingData.results.forEach((result) => {
          if (!productGroups[result.productId]) {
            productGroups[result.productId] = [];
          }
          productGroups[result.productId].push(result);
        });
        
        Object.keys(productGroups).forEach((productId, index) => {
          const priceEntries = productGroups[productId];
          console.log(`\n📦 Product ${index + 1}:`);
          console.log(`   Product ID: ${productId}`);
          
          // Filter out entries with no price data
          const validPrices = priceEntries.filter(entry => 
            entry.lowPrice !== null || 
            entry.midPrice !== null || 
            entry.highPrice !== null || 
            entry.marketPrice !== null
          );
          
          if (validPrices.length > 0) {
            console.log(`   📊 Found ${validPrices.length} price entries:`);
            
            validPrices.forEach((price, priceIndex) => {
              console.log(`\n   💰 Price Entry ${priceIndex + 1}:`);
              console.log(`      SubType: ${price.subTypeName || 'N/A'}`);
              console.log(`      Market Price: $${price.marketPrice || 'N/A'}`);
              console.log(`      Low Price: $${price.lowPrice || 'N/A'}`);
              console.log(`      Mid Price: $${price.midPrice || 'N/A'}`);
              console.log(`      High Price: $${price.highPrice || 'N/A'}`);
              console.log(`      Direct Low Price: $${price.directLowPrice || 'N/A'}`);
            });
          } else {
            console.log('   ❌ No price data available');
          }
        });
      } else {
        console.log('❌ No pricing data returned');
        console.log('Response:', JSON.stringify(pricingData, null, 2));
      }
    } else {
      console.log('❌ No product IDs to look up');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the script
getTCGPrices();
