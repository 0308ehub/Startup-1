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

interface TCGPlayerAPIResponse<T> {
  success: boolean;
  errors: string[];
  results: T;
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
    
    const response = await fetch(`https://api.tcgplayer.com/v1.39.0${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`TCGplayer API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getCategories(): Promise<TCGPlayerCategory[]> {
    const data = await this.makeRequest<TCGPlayerCategory[]>('/catalog/categories');
    return data.results || [];
  }

  async getYuGiOhCategory(): Promise<TCGPlayerCategory | null> {
    const categories = await this.getCategories();
    return categories.find(cat => cat.name === 'YuGiOh') || null;
  }

  async getProducts(categoryId: number, offset: number = 0, limit: number = 100): Promise<TCGPlayerProduct[]> {
    const data = await this.makeRequest<TCGPlayerProduct[]>(`/catalog/products?categoryId=${categoryId}&offset=${offset}&limit=${limit}`);
    return data.results || [];
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
    const token = await this.getBearerToken();
    
    const response = await fetch('https://api.tcgplayer.com/v1.39.0/catalog/products/search', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryId,
        productName: searchTerm,
        offset,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`TCGplayer API request failed: ${response.statusText}`);
    }

    const data: TCGPlayerAPIResponse<TCGPlayerProduct[]> = await response.json();
    return data.results || [];
  }
}

// Create singleton instance
export const tcgPlayerAPI = new TCGPlayerAPI();
