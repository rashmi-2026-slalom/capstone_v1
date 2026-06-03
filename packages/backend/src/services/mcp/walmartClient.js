const MCPClient = require('./mcpClient');

/**
 * Walmart MCP Adapter
 * 
 * Official Walmart Open API Integration
 * Provides real-time product pricing and availability
 * 
 * Setup Instructions:
 * 1. Apply for API access at: https://developer.walmart.com/
 * 2. Sign up for Walmart Open API (formerly Walmart Affiliate Program)
 * 3. Get your Consumer ID and Private Key
 * 4. Set environment variables:
 *    export WALMART_API_KEY="your_api_key_here"
 *    export WALMART_STORE_ID="5260"  # Optional: Default store (e.g., 5260 for Cincinnati)
 * 
 * API Documentation: https://developer.walmart.com/api/us/mp/items
 * Note: Walmart uses a simpler API key authentication (no OAuth required)
 */
class WalmartClient extends MCPClient {
  constructor() {
    const apiKey = process.env.WALMART_API_KEY || null;
    
    super({
      name: 'Walmart',
      baseURL: 'https://developer.api.walmart.com/api-proxy/service/affil/product/v2',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000,
      // Enable if API key is provided
      enabled: !!(apiKey)
    });

    this.apiKey = apiKey;
    this.defaultStoreId = process.env.WALMART_STORE_ID || null;
    
    if (this.isAvailable()) {
      console.log(`[Walmart] API enabled with key: ${apiKey.substring(0, 8)}...`);
    } else {
      console.log('[Walmart] API disabled - credentials not configured');
    }
  }

  /**
   * Check if Walmart API is properly configured
   */
  isAvailable() {
    return !!(this.enabled && this.apiKey);
  }

  /**
   * Search for products on Walmart
   * @param {string} query - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Array of normalized products
   */
  async searchProducts(query, options = {}) {
    if (!this.isAvailable()) {
      console.log('[Walmart] API not available - API key required');
      return [];
    }

    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await this.client.get('/items', {
        params: {
          apiKey: this.apiKey,
          query: query,
          format: 'json',
          numItems: options.limit || 10
        }
      });

      // Walmart returns items in response.data.items
      if (response.data && response.data.items) {
        return response.data.items.map(product => this.normalizeProduct(product));
      }

      return [];
    } catch (error) {
      console.error('[Walmart] Search error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get product by UPC/barcode
   * @param {string} barcode - Product UPC
   * @returns {Promise<Object|null>} - Product or null
   */
  async getProductByBarcode(barcode) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const response = await this.client.get('/items', {
        params: {
          apiKey: this.apiKey,
          upc: barcode,
          format: 'json'
        }
      });

      if (response.data && response.data.items && response.data.items.length > 0) {
        return this.normalizeProduct(response.data.items[0]);
      }

      return null;
    } catch (error) {
      console.error('[Walmart] Barcode lookup error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Normalize Walmart product data to standard format
   * @param {Object} product - Raw Walmart product data
   * @returns {Object} - Normalized product
   */
  normalizeProduct(product) {
    const normalized = {
      id: product.itemId?.toString() || product.upc,
      name: product.name || 'Unknown Product',
      barcode: product.upc || null,
      brand: product.brandName || null,
      category: product.categoryPath || null,
      image_url: product.thumbnailImage || product.mediumImage || product.largeImage || null,
      source: 'Walmart',
      
      // Walmart-specific pricing
      price: product.salePrice || null,
      regular_price: product.msrp || product.salePrice || null,
      on_sale: !!(product.msrp && product.salePrice && product.msrp > product.salePrice),
      
      // Additional details
      size: this.extractSize(product),
      stock_status: product.stock || 'Unknown',
      
      // Store raw data for reference
      raw: product
    };

    return normalized;
  }

  /**
   * Extract size information from product data
   * @param {Object} product - Walmart product
   * @returns {string|null} - Size string or null
   */
  extractSize(product) {
    // Try various size fields Walmart might provide
    if (product.size) return product.size;
    if (product.productSize) return product.productSize;
    
    // Extract from name if size pattern exists (e.g., "12 oz", "1 gal")
    const sizeMatch = product.name?.match(/\d+\.?\d*\s*(oz|lb|g|kg|ml|l|gal|ct|count)/i);
    return sizeMatch ? sizeMatch[0] : null;
  }

  /**
   * Get store locations (Walmart has many stores, but API doesn't provide store-specific pricing)
   * This is a placeholder for future store-specific features
   */
  async getLocations(zipCode) {
    console.log('[Walmart] Store location lookup not available in current API');
    return [];
  }
}

module.exports = WalmartClient;
