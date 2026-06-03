# MCP Services

Official Model Context Protocol (MCP) implementation for product search and GitHub Copilot integration.

## Overview

This directory implements the **official Model Context Protocol (MCP)** specification, enabling GitHub Copilot to use grocery product search as a native tool. The implementation follows JSON-RPC 2.0 protocol standards.

## What is MCP?

**Model Context Protocol** is an open standard for connecting AI assistants to data sources and tools. Our implementation exposes:

- **Tools**: Product search functions Copilot can call
- **Resources**: Access to product database information
- **Prompts**: (Reserved for future use)

## Architecture Pattern

```
GitHub Copilot (VS Code)
    ↓ JSON-RPC 2.0
MCP Server (/mcp endpoint)
    ↓
ProductSearchService (Aggregator)
    ↓
├── Queries all available clients in parallel
├── Aggregates and deduplicates results  
└── Returns unified product array

MCP Data Sources:
    ├── OpenFoodFactsClient ✓ (2.8M+ products)
    ├── KrogerClient (placeholder)
    └── InstacartClient (placeholder)
```

## Files

### `mcpServer.js` ⭐ NEW
Official MCP server implementing JSON-RPC 2.0 protocol.

**Implements:**
- `initialize` - MCP connection handshake
- `tools/list` - List available tools
- `tools/call` - Execute tool functions
- `resources/list` - List available resources
- `resources/read` - Read resource data
- `prompts/list` - List available prompts

**Available Tools:**
1. `searchProducts(query, limit)` - Search products by name
2. `getProductByBarcode(barcode)` - Lookup by UPC/EAN
3. `getAvailableSources()` - List data sources

### `mcpClient.js`
Base class defining the client interface for external data sources.

**Key Methods:**
- `searchProducts(query)` - Search by text
- `getProduct(productId)` - Get by ID
- `getProductByBarcode(barcode)` - Lookup by UPC/EAN
- `normalizeProduct(rawProduct)` - Standardize format
- `isAvailable()` - Check if source is enabled

### `openFoodFactsClient.js`
Open Food Facts API integration (ACTIVE).

**Provides:**
- 2.8M+ food products worldwide
- Product names, brands, categories
- Barcodes (UPC/EAN)
- Product images
- Nutrition information
- FREE, no API key required

### `krogerClient.js`
Kroger Developer API integration (PLACEHOLDER).

**Would Provide:**
- Kroger product catalog
- Store-specific pricing
- Product availability
- Store locations

**Status:** Requires API credentials and approval

### `instacartClient.js`
Instacart Partner API integration (PLACEHOLDER).

**Would Provide:**
- Multi-store product search
- Real-time pricing
- Delivery availability
- Access to Costco, Trader Joe's, etc.

**Status:** Partner-only API, not publicly available

### `productSearchService.js`
Aggregates results from all MCP sources.

**Features:**
- Parallel querying of all enabled sources
- Result deduplication
- Relevance sorting (images first, alphabetical)
- Configurable limits
- Source availability checking

**Singleton:** Exported as single instance for app-wide use

## Usage

### From Express Routes

```javascript
const productSearchService = require('./services/mcp/productSearchService');

// Search products
app.get('/api/products/search', async (req, res) => {
  const results = await productSearchService.searchProducts(req.query.q);
  res.json({ products: results });
});

// Lookup by barcode
app.get('/api/products/barcode/:code', async (req, res) => {
  const product = await productSearchService.getProductByBarcode(req.params.code);
  res.json(product);
});

// Get available sources
app.get('/api/products/sources', (req, res) => {
  const sources = productSearchService.getAvailableSources();
  res.json({ sources });
});
```

### Direct Usage

```javascript
const productSearchService = require('./services/mcp/productSearchService');

// Search across all sources
const products = await productSearchService.searchProducts('organic milk', {
  limit: 20,
  deduplicate: true
});

// Search specific source only
const products = await productSearchService.searchProducts('bread', {
  sources: ['openFoodFacts']
});

// Lookup barcode
const product = await productSearchService.getProductByBarcode('5449000000996');

// Check which sources are available
const sources = productSearchService.getAvailableSources();
```

## Adding New Sources

1. Create new client class extending `MCPClient`
2. Implement required methods:
   - `searchProducts(query)`
   - `getProductByBarcode(barcode)`
   - `normalizeProduct(rawProduct)`
3. Register in `productSearchService.js` constructor
4. Configure API credentials (if needed)
5. Set `enabled: true`

## Product Data Format

All MCP clients normalize products to this standard format:

```javascript
{
  id: "unique-id",              // Source-specific product ID
  name: "Product Name",         // Display name
  barcode: "0123456789",        // UPC/EAN barcode
  brand: "Brand Name",          // Brand/manufacturer
  category: "category-slug",    // Product category
  image_url: "https://...",     // Product image URL
  price: 4.99,                  // Price (if available)
  store: "Store Name",          // Store name (if applicable)
  source: "OpenFoodFacts",      // Which MCP source
  raw: { }                      // Original API response
}
```

## Error Handling

MCP clients handle errors gracefully:

- Network errors → return empty array, log error
- API errors → return empty array, log error  
- Timeout → return empty array, log error
- Invalid input → return empty array

The ProductSearchService continues with results from other sources if one fails.

## Environment Variables

### Kroger API (when available)
```bash
export KROGER_CLIENT_ID="your_client_id"
export KROGER_CLIENT_SECRET="your_client_secret"
```

### Instacart API (when available)
```bash
export INSTACART_API_KEY="your_api_key"
```

## Testing

### Unit Tests
```bash
cd packages/backend
npm test -- services/mcp
```

### Manual Testing
```bash
# Test Open Food Facts search
curl "http://localhost:3030/api/products/search?q=milk&limit=5"

# Test barcode lookup
curl "http://localhost:3030/api/products/barcode/737628064502"

# Check available sources
curl "http://localhost:3030/api/products/sources"
```

## Performance

- **Parallel Queries:** All sources queried simultaneously
- **Timeout:** 10 seconds per source (configurable)
- **Deduplication:** O(n) by product name
- **Caching:** Not currently implemented (future enhancement)

## Dependencies

```json
{
  "@modelcontextprotocol/sdk": "^1.0.0",
  "axios": "^1.6.0"
}
```

## Future Enhancements

- [ ] Response caching (Redis)
- [ ] Request queuing/throttling
- [ ] Advanced deduplication (fuzzy matching)
- [ ] Price comparison across sources
- [ ] Popularity scoring
- [ ] User preference learning

---

*Model Context Protocol (MCP) enables standardized integration with diverse data sources.*
