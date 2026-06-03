const MCPClient = require('./mcpClient');

/**
 * Kroger MCP Adapter
 * 
 * Official Kroger Developer API Integration
 * Provides real-time product pricing and availability
 * 
 * Setup Instructions:
 * 1. Apply for API access at: https://developer.kroger.com/
 * 2. Create a new application in the Developer Portal
 * 3. Get your client_id and client_secret
 * 4. Set environment variables:
 *    export KROGER_CLIENT_ID="your_client_id_here"
 *    export KROGER_CLIENT_SECRET="your_client_secret_here"
 *    export KROGER_LOCATION_ID="01400943"  # Optional: Default store location
 * 
 * API Documentation: https://developer.kroger.com/reference
 */
class KrogerClient extends MCPClient {
  constructor() {
    const clientId = process.env.KROGER_CLIENT_ID || null;
    const clientSecret = process.env.KROGER_CLIENT_SECRET || null;
    const environment = (process.env.KROGER_ENVIRONMENT || 'cert').toLowerCase();
    
    // Kroger has two environments:
    // - 'cert' (Certification): Test/sandbox environment with test data
    // - 'prod' (Production): Live environment with real store data
    const baseURLs = {
      cert: 'https://api-ce.kroger.com/v1',
      prod: 'https://api.kroger.com/v1'
    };
    
    const apiBaseURL = baseURLs[environment] || baseURLs.cert;
    
    super({
      name: 'Kroger',
      baseURL: apiBaseURL,
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000,
      // Enable if credentials are provided
      enabled: !!(clientId && clientSecret)
    });

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.environment = environment;
    this.defaultLocationId = process.env.KROGER_LOCATION_ID || '01400943'; // Default to Cincinnati store
    
    // OAuth endpoint matches the environment
    this.authBaseURL = `${apiBaseURL}/connect/oauth2`;
    
    console.log(`[Kroger] Using ${environment.toUpperCase()} environment: ${apiBaseURL}`);
  }

  /**
   * Check if Kroger API is properly configured
   */
  isAvailable() {
    return !!(this.enabled && this.clientId && this.clientSecret);
  }

  /**
   * Authenticate with Kroger API using OAuth2 Client Credentials flow
   * @returns {Promise<boolean>} - Success status
   */
  async authenticate() {
    if (!this.clientId || !this.clientSecret) {
      console.warn('[Kroger] API credentials not configured');
      return false;
    }

    // Check if we already have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return true;
    }

    try {
      console.log('[Kroger] Authenticating with OAuth2...');
      
      // Create Basic Auth header
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await this.client.post(
        `${this.authBaseURL}/token`,
        'grant_type=client_credentials&scope=product.compact',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);
      
      // Update client headers with new token
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
      
      console.log('[Kroger] Authentication successful');
      return true;
    } catch (error) {
      console.error('[Kroger] Authentication failed:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Ensure we have a valid access token before making API calls
   */
  async ensureAuthenticated() {
    if (!this.isAvailable()) {
      return false;
    }
    return await this.authenticate();
  }

  /**
   * Search for products
   * @param {string} query - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Array of standardized products
   */
  async searchProducts(query, options = {}) {
    if (!this.isAvailable()) {
      console.log('[Kroger] API not available - credentials required');
      return [];
    }

    if (!query || query.trim().length < 2) {
      return [];
    }

    // Authenticate before making request
    const authenticated = await this.ensureAuthenticated();
    if (!authenticated) {
      return [];
    }

    try {
      const locationId = options.locationId || this.defaultLocationId;
      
      const response = await this.client.get('/products', {
        params: {
          'filter.term': query,
          'filter.locationId': locationId,
          'filter.limit': options.limit || 10
        }
      });

      if (response.data && response.data.data) {
        return response.data.data.map(product => this.normalizeProduct(product));
      }

      return [];
    } catch (error) {
      console.error('[Kroger] Search error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get product by UPC barcode
   * @param {string} barcode - Product UPC
   * @param {Object} options - Search options
   * @returns {Promise<Object|null>} - Product or null
   */
  async getProductByBarcode(barcode, options = {}) {
    if (!this.isAvailable()) {
      return null;
    }

    const authenticated = await this.ensureAuthenticated();
    if (!authenticated) {
      return null;
    }

    try {
      const locationId = options.locationId || this.defaultLocationId;
      
      const response = await this.client.get('/products', {
        params: {
          'filter.productId': barcode,
          'filter.locationId': locationId
        }
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        return this.normalizeProduct(response.data.data[0]);
      }

      return null;
    } catch (error) {
      console.error('[Kroger] Barcode lookup error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Normalize Kroger product data to standard format
   * @param {Object} product - Raw Kroger API product
   * @returns {Object} - Standardized product
   */
  normalizeProduct(product) {
    // Extract the first item's price (Kroger products have multiple items/sizes)
    const firstItem = product.items?.[0];
    const regularPrice = firstItem?.price?.regular;
    const promoPrice = firstItem?.price?.promo;
    
    return {
      id: product.productId,
      name: product.description || product.brand,
      barcode: product.upc,
      brand: product.brand,
      category: product.categories?.[0],
      image_url: product.images?.[0]?.sizes?.[0]?.url || product.images?.[0]?.perspective,
      // ⭐ Real-time pricing from Kroger!
      price: promoPrice || regularPrice || null,
      regular_price: regularPrice,
      promo_price: promoPrice,
      on_sale: !!promoPrice,
      size: firstItem?.size,
      store: 'Kroger',
      location_id: this.defaultLocationId,
      source: this.name,
      raw: product
    };
  }

  /**
   * Get store locations by ZIP code
   * @param {string} zipCode - ZIP code to search near
   * @param {number} limit - Max number of locations
   * @returns {Promise<Array>} - Array of store locations
   */
  async getLocations(zipCode, limit = 5) {
    if (!this.isAvailable()) {
      return [];
    }

    const authenticated = await this.ensureAuthenticated();
    if (!authenticated) {
      return [];
    }

    try {
      const response = await this.client.get('/locations', {
        params: {
          'filter.zipCode.near': zipCode,
          'filter.limit': limit
        }
      });

      if (response.data && response.data.data) {
        return response.data.data.map(location => ({
          id: location.locationId,
          name: location.name,
          address: location.address,
          phone: location.phone,
          hours: location.hours,
          departments: location.departments
        }));
      }

      return [];
    } catch (error) {
      console.error('[Kroger] Location search error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get product details by Kroger product ID
   * @param {string} productId - Kroger product ID
   * @returns {Promise<Object|null>} - Product details or null
   */
  async getProduct(productId) {
    if (!this.isAvailable()) {
      return null;
    }

    const authenticated = await this.ensureAuthenticated();
    if (!authenticated) {
      return null;
    }

    try {
      const response = await this.client.get(`/products/${productId}`, {
        params: {
          'filter.locationId': this.defaultLocationId
        }
      });

      if (response.data && response.data.data) {
        return this.normalizeProduct(response.data.data);
      }

      return null;
    } catch (error) {
      console.error('[Kroger] Product lookup error:', error.response?.data || error.message);
      return null;
    }
  }
}

module.exports = KrogerClient;
