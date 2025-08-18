import { NextRequest, NextResponse } from 'next/server';
import { tcgPlayerAPI } from '@/lib/tcgplayer/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Get product details
    const products = await tcgPlayerAPI.getProductDetails([productId]);
    
    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    // Get SKUs for this product
    const skus = await tcgPlayerAPI.getProductSKUs(productId);

    // Transform the data
    const card = {
      id: product.productId.toString(),
      name: product.name,
      cleanName: product.cleanName,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      groupId: product.groupId,
      url: product.url,
      modifiedOn: product.modifiedOn,
      imageCount: product.imageCount,
      presaleInfo: product.presaleInfo,
      extendedData: product.extendedData,
      skus: skus.map(sku => ({
        id: sku.skuId,
        productId: sku.productId,
        name: sku.name,
        number: sku.number,
        condition: sku.condition,
        language: sku.language,
        printing: sku.printing,
        isFoil: sku.isFoil,
        isAltered: sku.isAltered,
        isPlayset: sku.isPlayset,
      })),
    };

    return NextResponse.json({
      success: true,
      data: card,
    });

  } catch (error) {
    console.error('Error fetching TCGplayer card details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card details from TCGplayer' },
      { status: 500 }
    );
  }
}
