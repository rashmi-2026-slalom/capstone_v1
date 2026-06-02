const MCPClient = require('./mcpClient');

/**
 * Open Food Facts MCP Adapter
 * Connects to Open Food Facts API for product information
 * https://world.openfoodfacts.org/data
 */
class OpenFoodFactsClient extends MCPClient {
  constructor() {
    super({
      name: 'OpenFoodFacts',
      baseURL: 'https://world.openfoodfacts.org',
      headers: {
        'User-Agent': 'GroceryPriceTracker/1.0 (Educational Project)'
      },
      timeout: 10000,
      enabled: true
    });
  }

  /**
   * Search for products by name
   * @param {string} query - Search term
   * @returns {Promise<Array>} - Array of standardized products
   */
  async searchProducts(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await this.client.get('/cgi/search.pl', {
        params: {
          search_terms: query,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 10,
          fields: 'code,product_name,brands,categories_tags,image_url,image_small_url'
        }
      });

      if (response.data && response.data.products) {
        return response.data.products.map(product => this.normalizeProduct(product));
      }

      return [];
    } catch (error) {
      console.error('[OpenFoodFacts] Search error:', error.message);
      return [];
    }
  }

  /**
   * Get product by barcode
   * @param {string} barcode - Product barcode (UPC/EAN)
   * @returns {Promise<Object|null>} - Standardized product or null
   */
  async getProductByBarcode(barcode) {
    if (!barcode) {
      return null;
    }

    try {
      const response = await this.client.get(`/api/v0/product/${barcode}.json`);

      if (response.data && response.data.product) {
        return this.normalizeProduct(response.data.product);
      }

      return null;
    } catch (error) {
      console.error('[OpenFoodFacts] Barcode lookup error:', error.message);
      return null;
    }
  }

  /**
   * Normalize Open Food Facts product data to standard format
   * @param {Object} product - Raw product data from Open Food Facts
   * @returns {Object} - Standardized product
   */
  normalizeProduct(product) {
    return {
      id: product.code || product._id,
      name: product.product_name || 'Unknown Product',
      barcode: product.code,
      brand: product.brands || null,
      category: product.categories_tags ? product.categories_tags[0] : null,
      image_url: product.image_url || product.image_small_url || null,
      source: this.name,
      nutrition_grade: product.nutrition_grade_fr || null,
      raw: product
    };
  }

  /**
   * Get popular grocery items (for autocomplete suggestions)
   * @param {string} category - Category to filter by (optional)
   * @returns {Promise<Array>} - Array of popular products
   */
  async getPopularProducts(category = null) {
    try {
      const params = {
        action: 'process',
        json: 1,
        page_size: 20,
        sort_by: 'unique_scans_n',
        fields: 'code,product_name,brands,image_small_url'
      };

      if (category) {
        params.tagtype_0 = 'categories';
        params.tag_contains_0 = 'contains';
        params.tag_0 = category;
      }

      const response = await this.client.get('/cgi/search.pl', { params });

      if (response.data && response.data.products) {
        return response.data.products.map(product => this.normalizeProduct(product));
      }

      return [];
    } catch (error) {
      console.error('[OpenFoodFacts] Popular products error:', error.message);
      return [];
    }
  }
}

module.exports = OpenFoodFactsClient;
