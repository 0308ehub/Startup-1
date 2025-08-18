import { NextRequest, NextResponse } from 'next/server';
import { tcgPlayerAPI } from '@/lib/tcgplayer/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get Yu-Gi-Oh! category
    const yugiohCategory = await tcgPlayerAPI.getYuGiOhCategory();
    
    if (!yugiohCategory) {
      return NextResponse.json({ error: 'Yu-Gi-Oh! category not found' }, { status: 404 });
    }

    let products;
    
    if (search) {
      // Search for specific cards
      products = await tcgPlayerAPI.searchProducts(yugiohCategory.categoryId, search, offset, limit);
    } else {
      // Get all Yu-Gi-Oh! products
      products = await tcgPlayerAPI.getProducts(yugiohCategory.categoryId, offset, limit);
    }

    // Transform the data to match our card format
    const cards = products.map(product => ({
      id: product.productId.toString(),
      name: product.name,
      cleanName: product.cleanName,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      groupId: product.groupId,
      url: product.url,
      modifiedOn: product.modifiedOn,
      imageCount: product.imageCount,
    }));

    return NextResponse.json({
      success: true,
      data: cards,
      total: products.length,
      category: yugiohCategory,
    });

  } catch (error) {
    console.error('Error fetching TCGplayer cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards from TCGplayer' },
      { status: 500 }
    );
  }
}
