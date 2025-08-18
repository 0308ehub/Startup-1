const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugCategories() {
  console.log('🔍 Debugging TCGplayer categories...\n');
  
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
    
    // Get categories
    const categoriesResponse = await fetch('https://api.tcgplayer.com/v1.39.0/catalog/categories', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${tokenData.access_token}`,
      },
    });
    
    const categoriesData = await categoriesResponse.json();
    
    console.log(`📋 Found ${categoriesData.results.length} total categories:`);
    
    // Show all categories
    categoriesData.results.forEach(category => {
      console.log(`- ${category.name} (ID: ${category.categoryId})`);
    });
    
    // Look for Yu-Gi-Oh! specifically
    const yugiohCategory = categoriesData.results.find(cat => 
      cat.name === 'YuGiOh' || 
      cat.name === 'Yu-Gi-Oh!' ||
      cat.name === 'Yu-Gi-Oh' ||
      cat.name.toLowerCase().includes('yugioh')
    );
    
    if (yugiohCategory) {
      console.log(`\n🎯 Found Yu-Gi-Oh! category: ${yugiohCategory.name} (ID: ${yugiohCategory.categoryId})`);
    } else {
      console.log('\n❌ Yu-Gi-Oh! category not found. Available categories:');
      categoriesData.results.forEach(cat => {
        if (cat.name.includes('Yu') || cat.name.includes('yugi') || cat.name.includes('Magic') || cat.name.includes('Pokemon')) {
          console.log(`- ${cat.name} (ID: ${cat.categoryId})`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

require('dotenv').config({ path: '.env.local' });
debugCategories();
