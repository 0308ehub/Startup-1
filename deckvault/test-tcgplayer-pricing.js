async function getBearerToken() {
  const response = await fetch('https://api.tcgplayer.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.TCGPLAYER_PUBLIC_KEY,
      client_secret: process.env.TCGPLAYER_PRIVATE_KEY,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get bearer token: ${response.statusText}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

async function testPricingAPI() {
  try {
    console.log('Getting bearer token...');
    const token = await getBearerToken();
    console.log('Token obtained successfully');

    // Test with a few known Yu-Gi-Oh! product IDs
    const productIds = [1234, 5678, 9012]; // Example IDs
    console.log(`Testing pricing API with product IDs: ${productIds.join(',')}`);

    const response = await fetch(`https://api.tcgplayer.com/v1.39.0/pricing/product/${productIds.join(',')}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${token}`,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Full API Response:');
    console.log(JSON.stringify(data, null, 2));

    // Test the structure
    if (data.success && data.results) {
      console.log('\nResults structure:');
      data.results.forEach((result, index) => {
        console.log(`\nProduct ${index + 1}:`);
        console.log('  Product ID:', result.productId);
        console.log('  Prices:', result.prices);
        console.log('  SKUs:', result.skus ? result.skus.length : 'No SKUs');
        if (result.skus && result.skus.length > 0) {
          console.log('  First SKU:', result.skus[0]);
        }
      });
    }

  } catch (error) {
    console.error('Error testing pricing API:', error);
  }
}

// Load environment variables
require('dotenv').config();

testPricingAPI();
