const productSearchService = require('./productSearchService');

/**
 * MCP Server Implementation
 * Implements Model Context Protocol (JSON-RPC 2.0) for GitHub Copilot integration
 * 
 * Official MCP Specification:
 * - Requests: JSON-RPC 2.0 format
 * - Methods: tools/list, tools/call, resources/list, prompts/list
 * - Transport: HTTP POST
 */

class MCPServer {
  constructor() {
    this.protocolVersion = '1.0.0';
    this.serverName = 'grocery-products';
    this.serverVersion = '1.0.0';
    
    // Define available tools for Copilot
    this.tools = [
      {
        name: 'searchProducts',
        description: 'Search for grocery products across multiple data sources (OpenFoodFacts, Kroger, Walmart, Instacart). Returns product names, barcodes, brands, images, pricing, and categories.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Product name or search term (e.g., "organic milk", "cheerios")'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 10, max: 50)',
              default: 10
            }
          },
          required: ['query']
        }
      },
      {
        name: 'getProductByBarcode',
        description: 'Look up a specific product by its barcode (UPC/EAN code). Returns detailed product information including name, brand, category, and image.',
        inputSchema: {
          type: 'object',
          properties: {
            barcode: {
              type: 'string',
              description: 'Product barcode (UPC or EAN format, e.g., "012000161155")'
            }
          },
          required: ['barcode']
        }
      },
      {
        name: 'getAvailableSources',
        description: 'List all available product data sources and their status (enabled/disabled). Shows which APIs are currently active.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'searchKrogerLocations',
        description: 'Find Kroger store locations near a ZIP code. Returns store addresses, phone numbers, and hours. Requires Kroger API credentials.',
        inputSchema: {
          type: 'object',
          properties: {
            zipCode: {
              type: 'string',
              description: 'ZIP code to search near (e.g., "90210", "10001")'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of locations to return (default: 5)',
              default: 5
            }
          },
          required: ['zipCode']
        }
      }
    ];

    // Define available resources (product database information)
    this.resources = [
      {
        uri: 'product://sources',
        name: 'Available Product Sources',
        description: 'List of product data sources (OpenFoodFacts, Kroger, Walmart, Instacart) and their availability',
        mimeType: 'application/json'
      }
    ];

    // Define available prompts (none for now, but keeping for extensibility)
    this.prompts = [];
  }

  /**
   * Handle incoming JSON-RPC 2.0 requests
   * @param {Object} request - JSON-RPC request object
   * @returns {Object} JSON-RPC response
   */
  async handleRequest(request) {
    // Validate JSON-RPC 2.0 format
    if (!request.jsonrpc || request.jsonrpc !== '2.0') {
      return this.createErrorResponse(null, -32600, 'Invalid Request: jsonrpc version must be "2.0"');
    }

    if (!request.method) {
      return this.createErrorResponse(request.id, -32600, 'Invalid Request: method is required');
    }

    const { method, params, id } = request;

    try {
      let result;

      switch (method) {
        case 'tools/list':
          result = await this.handleToolsList(params);
          break;

        case 'tools/call':
          result = await this.handleToolsCall(params);
          break;

        case 'resources/list':
          result = await this.handleResourcesList(params);
          break;

        case 'resources/read':
          result = await this.handleResourcesRead(params);
          break;

        case 'prompts/list':
          result = await this.handlePromptsList(params);
          break;

        case 'initialize':
          result = await this.handleInitialize(params);
          break;

        default:
          return this.createErrorResponse(id, -32601, `Method not found: ${method}`);
      }

      return this.createSuccessResponse(id, result);
    } catch (error) {
      console.error(`[MCP Server] Error handling ${method}:`, error);
      return this.createErrorResponse(id, -32603, `Internal error: ${error.message}`);
    }
  }

  /**
   * Handle initialize request
   */
  async handleInitialize(params) {
    return {
      protocolVersion: this.protocolVersion,
      serverInfo: {
        name: this.serverName,
        version: this.serverVersion
      },
      capabilities: {
        tools: {
          listChanged: false
        },
        resources: {
          subscribe: false,
          listChanged: false
        },
        prompts: {
          listChanged: false
        }
      }
    };
  }

  /**
   * Handle tools/list request
   * Returns list of available tools
   */
  async handleToolsList(params) {
    return {
      tools: this.tools
    };
  }

  /**
   * Handle tools/call request
   * Executes the specified tool with given arguments
   */
  async handleToolsCall(params) {
    if (!params || !params.name) {
      throw new Error('Tool name is required');
    }

    const { name, arguments: args } = params;

    switch (name) {
      case 'searchProducts':
        return await this.executeSearchProducts(args);

      case 'getProductByBarcode':
        return await this.executeGetProductByBarcode(args);

      case 'getAvailableSources':
        return await this.executeGetAvailableSources(args);

      case 'searchKrogerLocations':
        return await this.executeSearchKrogerLocations(args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  /**
   * Handle resources/list request
   */
  async handleResourcesList(params) {
    return {
      resources: this.resources
    };
  }

  /**
   * Handle resources/read request
   */
  async handleResourcesRead(params) {
    if (!params || !params.uri) {
      throw new Error('Resource URI is required');
    }

    const { uri } = params;

    if (uri === 'product://sources') {
      const sources = productSearchService.getAvailableSources();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(sources, null, 2)
          }
        ]
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  }

  /**
   * Handle prompts/list request
   */
  async handlePromptsList(params) {
    return {
      prompts: this.prompts
    };
  }

  /**
   * Execute searchProducts tool
   */
  async executeSearchProducts(args) {
    if (!args || !args.query) {
      throw new Error('query parameter is required');
    }

    const { query, limit = 10 } = args;
    const products = await productSearchService.searchProducts(query, {
      limit: Math.min(limit, 50)
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(products, null, 2)
        }
      ]
    };
  }

  /**
   * Execute getProductByBarcode tool
   */
  async executeGetProductByBarcode(args) {
    if (!args || !args.barcode) {
      throw new Error('barcode parameter is required');
    }

    const { barcode } = args;
    const product = await productSearchService.getProductByBarcode(barcode);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(product, null, 2)
        }
      ]
    };
  }

  /**
   * Execute getAvailableSources tool
   */
  async executeGetAvailableSources(args) {
    const sources = productSearchService.getAvailableSources();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(sources, null, 2)
        }
      ]
    };
  }

  /**
   * Execute searchKrogerLocations tool
   */
  async executeSearchKrogerLocations(args) {
    if (!args || !args.zipCode) {
      throw new Error('zipCode parameter is required');
    }

    const { zipCode, limit = 5 } = args;

    // Get Kroger client from product search service
    const krogerClient = productSearchService.sources.kroger;
    
    if (!krogerClient || !krogerClient.isAvailable()) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Kroger API not available',
              message: 'Kroger API credentials not configured. See docs/kroger-api-setup.md for setup instructions.',
              locations: []
            }, null, 2)
          }
        ]
      };
    }

    const locations = await krogerClient.getLocations(zipCode, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            zipCode,
            count: locations.length,
            locations
          }, null, 2)
        }
      ]
    };
  }

  /**
   * Create JSON-RPC 2.0 success response
   */
  createSuccessResponse(id, result) {
    return {
      jsonrpc: '2.0',
      id,
      result
    };
  }

  /**
   * Create JSON-RPC 2.0 error response
   */
  createErrorResponse(id, code, message, data = null) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };

    if (data) {
      response.error.data = data;
    }

    return response;
  }
}

// Export singleton instance
module.exports = new MCPServer();
