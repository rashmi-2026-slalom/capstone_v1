const axios = require('axios');

/**
 * Base MCP Client
 * Provides a standardized interface for connecting to external data sources
 * following the Model Context Protocol pattern
 */
class MCPClient {
  constructor(config) {
    this.name = config.name || 'Unknown';
    this.baseURL = config.baseURL || '';
    this.headers = config.headers || {};
    this.timeout = config.timeout || 5000;
    this.enabled = config.enabled !== false;
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: this.headers
    });
  }

  /**
   * Check if the MCP service is enabled and available
   */
  isAvailable() {
    return this.enabled;
  }

  /**
   * Search for products
   * @param {string} query - Search term
   * @returns {Promise<Array>} - Array of product results
   */
  async searchProducts(query) {
    throw new Error('searchProducts() must be implemented by subclass');
  }

  /**
   * Get product details by ID
   * @param {string} productId - Product identifier
   * @returns {Promise<Object>} - Product details
   */
  async getProduct(productId) {
    throw new Error('getProduct() must be implemented by subclass');
  }

  /**
   * Get product by barcode
   * @param {string} barcode - Product barcode (UPC/EAN)
   * @returns {Promise<Object>} - Product details
   */
  async getProductByBarcode(barcode) {
    throw new Error('getProductByBarcode() must be implemented by subclass');
  }

  /**
   * Standardize product data format across all MCP sources
   * @param {Object} rawProduct - Raw product data from API
   * @returns {Object} - Standardized product object
   */
  normalizeProduct(rawProduct) {
    return {
      id: null,
      name: null,
      barcode: null,
      brand: null,
      category: null,
      image_url: null,
      source: this.name,
      raw: rawProduct
    };
  }

  /**
   * Handle API errors consistently
   */
  handleError(error, context) {
    console.error(`[${this.name}] Error in ${context}:`, error.message);
    
    if (error.response) {
      // API responded with error status
      return {
        success: false,
        error: `API error: ${error.response.status}`,
        message: error.response.data?.message || 'Unknown error'
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        error: 'No response from API',
        message: 'Service may be unavailable'
      };
    } else {
      // Error setting up request
      return {
        success: false,
        error: 'Request failed',
        message: error.message
      };
    }
  }
}

module.exports = MCPClient;
