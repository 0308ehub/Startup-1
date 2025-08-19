import { NextRequest, NextResponse } from 'next/server';
import { tcgPlayerAPI } from '@/lib/tcgplayer/api';

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs array is required' }, { status: 400 });
    }

    // Limit the number of product IDs to avoid overwhelming the API
    const limitedProductIds = productIds.slice(0, 100);
    
    // Fetch prices for the product IDs
    const pricingData = await tcgPlayerAPI.getProductPrices(limitedProductIds);

    // Extract the lowest market price for each product
    const priceMap = new Map<number, number>();
    
    pricingData.forEach(productPricing => {
      // Get the lowest market price from all SKUs for this product
      let lowestPrice: number | null = null;
      
      productPricing.skus.forEach(sku => {
        const marketPrice = sku.prices.marketPrice;
        if (marketPrice && (lowestPrice === null || marketPrice < lowestPrice)) {
          lowestPrice = marketPrice;
        }
      });
      
      if (lowestPrice !== null) {
        priceMap.set(productPricing.productId, lowestPrice);
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
