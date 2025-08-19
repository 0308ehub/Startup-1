interface TCGPlayerToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  userName: string;
  '.issued': string;
  '.expires': string;
}

interface TCGPlayerCategory {
  categoryId: number;
  name: string;
  modifiedOn: string;
  displayName: string;
  seoCategoryName: string;
  sealedLabel: string;
  nonSealedLabel: string;
  conditionGuideUrl: string;
  isScannable: boolean;
  popularity: number;
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

interface TCGPlayerSKU {
  skuId: number;
  productId: number;
  languageId: number;
  printId: number;
  conditionId: number;
  isFoil: boolean;
  isAltered: boolean;
  isPlayset: boolean;
  name: string;
  number: string;
  condition: string;
  language: string;
  printing: string;
}

interface TCGPlayerPrice {
  skuId: number;
  productId: number;
  lowPrice: number;
  midPrice: number;
  highPrice: number;
  marketPrice: number;
  directLowPrice: number;
  subTypeName: string;
}

interface TCGPlayerPrice {
  skuId: number;
  productId: number;
  lowPrice: number;
  midPrice: number;
  highPrice: number;
  marketPrice: number;
  directLowPrice: number;
  subTypeName: string;
}

interface TCGPlayerProductPricing {
  productId: number;
  prices: Record<string, number>;
  skus: Array<{
    skuId: number;
    prices: Record<string, number>;
  }>;
}

// Based on TCGPlayer API documentation
// Removed unused interface TCGPlayerPricingResult

interface TCGPlayerAPIResponse<T> {
  success: boolean;
  errors: string[];
  results: T;
}

interface TCGPlayerSearchFilter {
  name: string;
  values: string[];
}

interface TCGPlayerSearchRequest {
  sort: string;
  limit: number;
  offset: number;
  filters: TCGPlayerSearchFilter[];
}

class TCGPlayerAPI {
  private publicKey: string;
  private privateKey: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.publicKey = process.env.TCGPLAYER_PUBLIC_KEY || '';
    this.privateKey = process.env.TCGPLAYER_PRIVATE_KEY || '';
    
    if (!this.publicKey || !this.privateKey) {
      console.warn('TCGplayer API keys not found in environment variables');
    }
  }

  private async getBearerToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://api.tcgplayer.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.publicKey,
          client_secret: this.privateKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get bearer token: ${response.statusText}`);
      }

      const tokenData: TCGPlayerToken = await response.json();
      
      this.accessToken = tokenData.access_token;
      // Set expiry to 1 hour before actual expiry to be safe
      this.tokenExpiry = Date.now() + (tokenData.expires_in - 3600) * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting TCGplayer bearer token:', error);
      throw error;
    }
  }

  private async makeRequest<T>(endpoint: string): Promise<TCGPlayerAPIResponse<T>> {
    const token = await this.getBearerToken();
    
    const url = `https://api.tcgplayer.com/v1.40.0${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TCGplayer API request failed: ${response.status} - ${errorText}`);
      throw new Error(`TCGplayer API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async makeSearchRequest<T>(categoryId: number, searchData: TCGPlayerSearchRequest): Promise<TCGPlayerAPIResponse<T>> {
    const token = await this.getBearerToken();
    
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
      throw new Error(`TCGplayer search request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getCategories(): Promise<TCGPlayerCategory[]> {
    // Get all categories by using a large limit
    const data = await this.makeRequest<TCGPlayerCategory[]>('/catalog/categories?limit=100');
    return data.results || [];
  }

  async getYuGiOhCategory(): Promise<TCGPlayerCategory | null> {
    const categories = await this.getCategories();
    
    // Try different possible names for Yu-Gi-Oh!
    const yugiohCategory = categories.find(cat => 
      cat.name === 'YuGiOh' || 
      cat.name === 'Yu-Gi-Oh!' ||
      cat.name === 'Yu-Gi-Oh' ||
      cat.name.toLowerCase().includes('yugioh') ||
      cat.name.toLowerCase().includes('yugi')
    );
    
    if (yugiohCategory) {
      console.log(`Found Yu-Gi-Oh! category: ${yugiohCategory.name} (ID: ${yugiohCategory.categoryId})`);
    } else {
      console.log('Yu-Gi-Oh! category not found. Available categories:', categories.map(c => c.name));
    }
    
    return yugiohCategory || null;
  }

  async getProducts(categoryId: number, offset: number = 0, limit: number = 100): Promise<TCGPlayerProduct[]> {
    // Use search endpoint to filter for only cards
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

    const data = await this.makeSearchRequest<number[]>(categoryId, searchData);
    
    if (data.results && data.results.length > 0) {
      // Get product details for the returned product IDs
      const productIds = data.results;
      const productsData = await this.makeRequest<TCGPlayerProduct[]>(`/catalog/products/${productIds.join(',')}`);
      return productsData.results || [];
    }
    
    return [];
  }

  async getProductDetails(productIds: number[]): Promise<TCGPlayerProduct[]> {
    const ids = productIds.join(',');
    const data = await this.makeRequest<TCGPlayerProduct[]>(`/catalog/products/${ids}`);
    return data.results || [];
  }

  async getProductSKUs(productId: number): Promise<TCGPlayerSKU[]> {
    const data = await this.makeRequest<TCGPlayerSKU[]>(`/catalog/products/${productId}/skus`);
    return data.results || [];
  }

  async searchProducts(categoryId: number, searchTerm: string, offset: number = 0, limit: number = 100): Promise<TCGPlayerProduct[]> {
    // Use search endpoint with product name filter and card type filter
    const searchData: TCGPlayerSearchRequest = {
      sort: 'ProductName ASC',
      limit,
      offset,
      filters: [
        {
          name: 'ProductName',
          values: [searchTerm]
        },
        {
          name: 'CardType',
          values: ['MainDeckMonster', 'ExtraDeckMonster', 'Spell', 'Trap']
        }
      ]
    };

    const data = await this.makeSearchRequest<number[]>(categoryId, searchData);
    
    if (data.results && data.results.length > 0) {
      // Get product details for the returned product IDs
      const productIds = data.results;
      const productsData = await this.makeRequest<TCGPlayerProduct[]>(`/catalog/products/${productIds.join(',')}`);
      return productsData.results || [];
    }
    
    return [];
  }

  async getProductPrices(productIds: number[]): Promise<TCGPlayerProductPricing[]> {
    const ids = productIds.join(',');
    const data = await this.makeRequest<TCGPlayerProductPricing[]>(`/pricing/product/${ids}`);
    return data.results || [];
  }

  async getSKUPrices(skuIds: number[]): Promise<TCGPlayerPrice[]> {
    const ids = skuIds.join(',');
    const data = await this.makeRequest<TCGPlayerPrice[]>(`/pricing/sku/${ids}`);
    return data.results || [];
  }

  async getProductBuylistPrices(productIds: number[]): Promise<TCGPlayerProductPricing[]> {
    const ids = productIds.join(',');
    const data = await this.makeRequest<TCGPlayerProductPricing[]>(`/pricing/buy/product/${ids}`);
    return data.results || [];
  }

  async getSKUBuylistPrices(skuIds: number[]): Promise<TCGPlayerPrice[]> {
    const ids = skuIds.join(',');
    const data = await this.makeRequest<TCGPlayerPrice[]>(`/pricing/buy/sku/${ids}`);
    return data.results || [];
  }
}

// Create singleton instance
export const tcgPlayerAPI = new TCGPlayerAPI();
