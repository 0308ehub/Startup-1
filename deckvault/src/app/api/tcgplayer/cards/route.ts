import { NextRequest, NextResponse } from 'next/server';

interface TCGPlayerToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  userName: string;
  '.issued': string;
  '.expires': string;
}

interface TCGPlayerProduct {
  productId: number;
  name: string;
  cleanName: string;
  imageUrl: string;
  categoryId: number;
  groupId: number;
  url: string;
  modifiedOn: string;
  imageCount: number;
  presaleInfo: Record<string, unknown>;
  extendedData: Record<string, unknown>[];
}

interface TCGPlayerSearchRequest {
  sort: string;
  limit: number;
  offset: number;
  filters: Array<{
    name: string;
    values: string[];
  }>;
}

async function getBearerToken(): Promise<string> {
  const publicKey = process.env.TCGPLAYER_PUBLIC_KEY;
  const privateKey = process.env.TCGPLAYER_PRIVATE_KEY;
  
  if (!publicKey || !privateKey) {
    throw new Error('TCGPlayer API keys not found in environment variables');
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
    throw new Error(`Failed to get bearer token: ${response.statusText}`);
  }

  const tokenData: TCGPlayerToken = await response.json();
  return tokenData.access_token;
}

async function searchProducts(token: string, searchTerm?: string, offset: number = 0, limit: number = 100): Promise<number[]> {
  // Yu-Gi-Oh! category ID is 2
  const categoryId = 2;
  
  const searchData: TCGPlayerSearchRequest = {
    sort: 'ProductName ASC',
    limit,
    offset,
    filters: [
      {
        name: 'CardType',
        values: ['MainDeckMonster', 'ExtraDeckMonster', 'Spell', 'Trap']
      }
    ]
  };

  // Add search filter if search term is provided
  if (searchTerm && searchTerm.trim()) {
    searchData.filters.push({
      name: 'ProductName',
      values: [searchTerm.trim()]
    });
  }

  const response = await fetch(`https://api.tcgplayer.com/v1.39.0/catalog/categories/${categoryId}/search`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchData),
  });

  if (!response.ok) {
    throw new Error(`Search request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

async function getProductDetails(token: string, productIds: number[]): Promise<TCGPlayerProduct[]> {
  if (productIds.length === 0) {
    return [];
  }

  const ids = productIds.join(',');
  const response = await fetch(`https://api.tcgplayer.com/v1.39.0/catalog/products/${ids}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Product details request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log(`🔍 Fetching Yu-Gi-Oh! cards: search="${search}", offset=${offset}, limit=${limit}`);

    // Get bearer token
    const token = await getBearerToken();
    console.log('✅ Got bearer token');

    // Search for products
    const productIds = await searchProducts(token, search || undefined, offset, limit);
    console.log(`✅ Found ${productIds.length} product IDs`);

    if (productIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        hasMore: false,
      });
    }

    // Get product details
    const products = await getProductDetails(token, productIds);
    console.log(`✅ Retrieved ${products.length} product details`);

    // Transform products to match expected format
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
      total: cards.length,
      hasMore: productIds.length === limit, // If we got the full limit, there might be more
    });

  } catch (error) {
    console.error('❌ Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
