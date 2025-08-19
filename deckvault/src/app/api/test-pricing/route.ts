import { NextResponse } from 'next/server';
import { tcgPlayerAPI } from '@/lib/tcgplayer/api';

export async function GET() {
  try {
    // Test with some known Yu-Gi-Oh! product IDs
    const testProductIds = [1234, 5678, 9012]; // These are example IDs
    
    console.log('Testing pricing API with product IDs:', testProductIds);
    
    const pricingData = await tcgPlayerAPI.getProductPrices(testProductIds);
    
    console.log('Pricing test response:', JSON.stringify(pricingData, null, 2));
    
    return NextResponse.json({
      success: true,
      testProductIds,
      pricingData,
      message: 'Check server logs for detailed response'
    });
    
  } catch (error) {
    console.error('Pricing test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Check server logs for details'
      },
      { status: 500 }
    );
  }
}
