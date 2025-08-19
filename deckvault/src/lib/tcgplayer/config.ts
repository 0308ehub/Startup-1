// TCGPlayer Affiliate Configuration
// Using the official TCGPlayer API link format with ?u= parameter

export const TCGPLAYER_CONFIG = {
  // Your Impact partner ID from TCGPlayer affiliate dashboard
  PARTNER_ID: '6468161',
  
  // Your official TCGPlayer API link
  API_LINK: 'https://partner.tcgplayer.com/c/6468161/1830156/21018',
  
  // Generate affiliate link for a specific card
  generateCardLink: (cardName: string, productId?: string): string => {
    let targetUrl: string;
    
    if (productId) {
      // Use direct product URL if we have the product ID
      targetUrl = `https://tcgplayer.com/product/${productId}`;
    } else {
      // Fall back to search URL
      targetUrl = `https://tcgplayer.com/search/yugioh/product.html?q=${encodeURIComponent(cardName)}`;
    }
    
    // Encode the target URL and add to the API link
    const encodedUrl = encodeURIComponent(targetUrl);
    return `${TCGPLAYER_CONFIG.API_LINK}?u=${encodedUrl}`;
  },
  
  // Generate affiliate link for general Yu-Gi-Oh! search
  generateGeneralLink: (): string => {
    const targetUrl = 'https://tcgplayer.com/search/yugioh/product.html';
    const encodedUrl = encodeURIComponent(targetUrl);
    return `${TCGPLAYER_CONFIG.API_LINK}?u=${encodedUrl}`;
  },
  
  // Generate affiliate link for a specific product ID (most accurate)
  generateProductLink: (productId: string): string => {
    const targetUrl = `https://tcgplayer.com/product/${productId}`;
    const encodedUrl = encodeURIComponent(targetUrl);
    return `${TCGPLAYER_CONFIG.API_LINK}?u=${encodedUrl}`;
  }
};
