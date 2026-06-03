const OpenFoodFactsClient = require('./openFoodFactsClient');
const KrogerClient = require('./krogerClient');
const WalmartClient = require('./walmartClient');
const InstacartClient = require('./instacartClient');

/**
 * Product Search Service
 * Aggregates results from multiple MCP sources
 * Provides unified interface for product search across all configured sources
 */
class ProductSearchService {
  constructor() {
    // Initialize all MCP clients
    this.sources = {
      openFoodFacts: new OpenFoodFactsClient(),
      kroger: new KrogerClient(),
      walmart: new WalmartClient(),
      instacart: new InstacartClient()
    };

    // Log available sources
    this.logAvailableSources();
  }

  /**
   * Log which MCP sources are available
   */
  logAvailableSources() {
    console.log('=== MCP Product Search Service ===');
    Object.entries(this.sources).forEach(([key, client]) => {
      const status = client.isAvailable() ? '✓ ENABLED' : '✗ DISABLED';
      console.log(`  ${status} - ${client.name}`);
    });
    console.log('==================================');
  }

  /**
   * Search for products across all available sources
   * @param {string} query - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Aggregated product results
   */
  async searchProducts(query, options = {}) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const {
      limit = 20,
      sources = null, // null = all available sources
      deduplicate = true
    } = options;

    // Determine which sources to query
    const sourcesToQuery = sources || Object.keys(this.sources);

    // Query all sources in parallel
    const searchPromises = sourcesToQuery.map(async (sourceKey) => {
      const client = this.sources[sourceKey];
      
      if (!client || !client.isAvailable()) {
        return [];
      }

      try {
        const results = await client.searchProducts(query);
        return results || [];
      } catch (error) {
        console.error(`[ProductSearchService] Error from ${sourceKey}:`, error.message);
        return [];
      }
    });

    // Wait for all searches to complete
    const resultsArrays = await Promise.all(searchPromises);
    
    // Flatten results
    let allResults = resultsArrays.flat();

    // Deduplicate by product name (optional)
    if (deduplicate) {
      allResults = this.deduplicateProducts(allResults);
    }

    // Sort by relevance (products with images first, then alphabetically)
    allResults.sort((a, b) => {
      if (a.image_url && !b.image_url) return -1;
      if (!a.image_url && b.image_url) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    // Limit results
    return allResults.slice(0, limit);
  }

  /**
   * Get product by barcode from all sources
   * @param {string} barcode - Product barcode (UPC/EAN)
   * @returns {Promise<Object|null>} - Product details or null
   */
  async getProductByBarcode(barcode) {
    if (!barcode) {
      return null;
    }

    // Try all sources in parallel
    const lookupPromises = Object.values(this.sources).map(async (client) => {
      if (!client.isAvailable()) {
        return null;
      }

      try {
        return await client.getProductByBarcode(barcode);
      } catch (error) {
        console.error(`[ProductSearchService] Barcode lookup error from ${client.name}:`, error.message);
        return null;
      }
    });

    const results = await Promise.all(lookupPromises);
    
    // Return first non-null result
    return results.find(result => result !== null) || null;
  }

  /**
   * Deduplicate products based on name similarity
   * @param {Array} products - Array of products
   * @returns {Array} - Deduplicated array
   */
  deduplicateProducts(products) {
    const seen = new Map();

    products.forEach(product => {
      const normalizedName = (product.name || '').toLowerCase().trim();
      
      if (!seen.has(normalizedName)) {
        seen.set(normalizedName, product);
      } else {
        // Keep the one with more complete data (has image, brand, etc.)
        const existing = seen.get(normalizedName);
        if (this.getProductCompleteness(product) > this.getProductCompleteness(existing)) {
          seen.set(normalizedName, product);
        }
      }
    });

    return Array.from(seen.values());
  }

  /**
   * Calculate completeness score for a product
   * Used for deduplication - prefer products with more data
   * @param {Object} product - Product object
   * @returns {number} - Completeness score
   */
  getProductCompleteness(product) {
    let score = 0;
    if (product.name) score += 1;
    if (product.brand) score += 1;
    if (product.image_url) score += 2;
    if (product.barcode) score += 1;
    if (product.category) score += 1;
    if (product.price) score += 3; // Pricing data is most valuable
    return score;
  }

  /**
   * Get list of available MCP sources
   * @returns {Array} - Array of source info
   */
  getAvailableSources() {
    return Object.entries(this.sources).map(([key, client]) => ({
      key,
      name: client.name,
      available: client.isAvailable(),
      baseURL: client.baseURL
    }));
  }

  /**
   * Enable/disable a specific source
   * @param {string} sourceKey - Source identifier
   * @param {boolean} enabled - Enable or disable
   */
  setSourceEnabled(sourceKey, enabled) {
    const client = this.sources[sourceKey];
    if (client) {
      client.enabled = enabled;
      console.log(`[ProductSearchService] ${client.name} ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }
  }
}

// Export singleton instance
module.exports = new ProductSearchService();
