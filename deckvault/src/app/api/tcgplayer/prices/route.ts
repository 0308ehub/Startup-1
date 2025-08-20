import { NextRequest, NextResponse } from 'next/server';

interface TCGPlayerPriceResult {
  productId: number;
  lowPrice: number | null;
  midPrice: number | null;
  highPrice: number | null;
  marketPrice: number | null;
  directLowPrice: number | null;
  subTypeName: string;
}

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

async function getProductPrices(productIds: number[], token: string) {
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

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs array is required' }, { status: 400 });
    }

    // Limit the number of product IDs to avoid overwhelming the API
    const limitedProductIds = productIds.slice(0, 100);
    
    // Get bearer token
    const token = await getBearerToken();
    
    // Get pricing data directly from the pricing endpoint
    const pricingData = await getProductPrices(limitedProductIds, token);
    
    if (!pricingData.success || !pricingData.results) {
      throw new Error('No pricing data returned from TCGPlayer');
    }

    // Group results by product ID and extract the best price
    const productGroups = new Map<number, TCGPlayerPriceResult[]>();
    
    pricingData.results.forEach((result: TCGPlayerPriceResult) => {
      if (!productGroups.has(result.productId)) {
        productGroups.set(result.productId, []);
      }
      productGroups.get(result.productId)!.push(result);
    });
    
    // Extract the best price for each product
    const priceMap = new Map<number, number>();
    
    productGroups.forEach((priceEntries: TCGPlayerPriceResult[], productId: number) => {
      // Filter out entries with no price data
      const validPrices = priceEntries.filter(entry => 
        entry.lowPrice !== null || 
        entry.midPrice !== null || 
        entry.highPrice !== null || 
        entry.marketPrice !== null
      );
      
      if (validPrices.length > 0) {
        // Priority: lowPrice > directLowPrice > marketPrice > midPrice
        // This matches what TCGPlayer website typically shows (lowest available listing)
        let bestPrice = null;
        
        for (const entry of validPrices) {
          if (entry.lowPrice !== null) {
            if (bestPrice === null || entry.lowPrice < bestPrice) {
              bestPrice = entry.lowPrice;
            }
          } else if (entry.directLowPrice !== null) {
            if (bestPrice === null || entry.directLowPrice < bestPrice) {
              bestPrice = entry.directLowPrice;
            }
          } else if (entry.marketPrice !== null) {
            if (bestPrice === null || entry.marketPrice < bestPrice) {
              bestPrice = entry.marketPrice;
            }
          } else if (entry.midPrice !== null) {
            if (bestPrice === null || entry.midPrice < bestPrice) {
              bestPrice = entry.midPrice;
            }
          }
        }
        
        if (bestPrice !== null) {
          priceMap.set(productId, bestPrice);
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: Object.fromEntries(priceMap),
    });

  } catch (error) {
    console.error('Error fetching TCGplayer prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices from TCGplayer' },
      { status: 500 }
    );
  }
}
