# MCP Integration Guide

## Overview

The Grocery Price Tracker implements the official **Model Context Protocol (MCP)** for product search and autocomplete. This enables GitHub Copilot to use the product search tools directly in your development environment.

## Architecture

```
GitHub Copilot
    ↓ (JSON-RPC 2.0)
MCP Server (http://localhost:3030/mcp)
    ↓
ProductSearchService (Aggregator)
    ↓
├── OpenFoodFactsClient (ENABLED) ✓
├── KrogerClient (DISABLED - needs API credentials)
└── InstacartClient (DISABLED - partner-only)
```

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol that standardizes how applications provide context to LLMs. It uses JSON-RPC 2.0 for communication and enables:

- **Tools**: Functions that LLMs can call (e.g., product search)
- **Resources**: Data sources LLMs can read (e.g., product databases)
- **Prompts**: Templated interactions for common workflows

Our implementation exposes product search functionality as MCP tools that GitHub Copilot can use.

## MCP Configuration

The MCP server is configured in `.vscode/mcp.json`:

```json
{
  "servers": {
    "grocery-products": {
      "type": "http",
      "url": "http://localhost:3030/mcp",
      "description": "Grocery product search across multiple data sources"
    }
  }
}
```

This tells VS Code/Copilot where to find the MCP server.

## Available MCP Tools

GitHub Copilot can use these tools:

### 1. `searchProducts`
Search for grocery products across all data sources.

**Parameters:**
- `query` (string, required): Product name or search term
- `limit` (number, optional): Max results (default: 10, max: 50)

**Returns:** Products with **real-time prices** from Kroger (if enabled)

**Example:**
```json
{
  "name": "searchProducts",
  "arguments": {
    "query": "organic milk",
    "limit": 5
  }
}
```

### 2. `getProductByBarcode`
Look up a specific product by barcode (UPC/EAN).

**Parameters:**
- `barcode` (string, required): Product barcode

**Example:**
```json
{
  "name": "getProductByBarcode",
  "arguments": {
    "barcode": "737628064502"
  }
}
```

### 3. `getAvailableSources`
List all product data sources and their status.

**Parameters:** None

**Example:**
```json
{
  "name": "getAvailableSources",
  "arguments": {}
}
```

### 4. `searchKrogerLocations` ⭐ NEW
Find Kroger store locations near a ZIP code.

**Parameters:**
- `zipCode` (string, required): ZIP code to search near
- `limit` (number, optional): Max locations (default: 5)

**Requires:** Kroger API credentials

**Example:**
```json
{
  "name": "searchKrogerLocations",
  "arguments": {
    "zipCode": "90210",
    "limit": 3
  }
}
```

## MCP Protocol Endpoint

The MCP server implements JSON-RPC 2.0 at:

```
POST http://localhost:3030/mcp
```

**Supported Methods:**
- `initialize` - Initialize MCP connection
- `tools/list` - List available tools
- `tools/call` - Execute a tool
- `resources/list` - List available resources
- `resources/read` - Read a resource
- `prompts/list` - List available prompts

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

**Example Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "searchProducts",
        "description": "Search for grocery products...",
        "inputSchema": { }
      }
    ]
  }
}
```

## Available MCP Sources

### 1. Open Food Facts ✓ ENABLED

**Status:** Active and working  
**API:** https://world.openfoodfacts.org  
**Access:** Free, no API key required  
**Data Provided:**
- Product names
- Barcodes (UPC/EAN)
- Brand information
- Product images
- Categories
- Nutrition information

**Limitations:**
- No store-specific pricing
- API can be slow or rate-limited during high traffic
- Primarily food products (not all grocery items)

### 2. Kroger API ✗ DISABLED

**Status:** Placeholder implementation  
**API:** https://api.kroger.com/v1  
**Access:** Requires partner application and approval  
**Would Provide:**
- Product catalog
- Store-specific pricing (!)
- Product availability by location
- Store locations

**To Enable:**
1. Apply at: https://developer.kroger.com/
2. Get `client_id` and `client_secret`
3. Set environment variables:
   ```bash
   export KROGER_CLIENT_ID="your_client_id"
   export KROGER_CLIENT_SECRET="your_client_secret"
   ```
4. Update `krogerClient.js` to set `enabled: true`
5. Implement OAuth2 authentication flow

### 3. Instacart API ✗ DISABLED

**Status:** Placeholder implementation  
**API:** Partner-only (no public access)  
**Access:** Enterprise/partner agreements only  
**Would Provide:**
- Products from multiple stores (Costco, Trader Joe's, etc.)
- Real-time pricing
- Store availability
- Delivery information

**To Enable:**
- Contact Instacart for partner API access
- Implement authentication once credentials are provided

## API Endpoints

### Get Available Sources
```bash
GET /api/products/sources
```

**Response:**
```json
{
  "sources": [
    {
      "key": "openFoodFacts",
      "name": "OpenFoodFacts",
      "available": true,
      "baseURL": "https://world.openfoodfacts.org"
    },
    {
      "key": "kroger",
      "name": "Kroger",
      "available": false,
      "baseURL": "https://api.kroger.com/v1"
    },
    {
      "key": "instacart",
      "name": "Instacart",
      "available": false,
      "baseURL": "https://api.instacart.com/v2"
    }
  ],
  "summary": {
    "total": 3,
    "available": 1,
    "unavailable": 2
  }
}
```

### Search Products
```bash
GET /api/products/search?q=<query>&limit=<number>
```

**Parameters:**
- `q` (required): Search query (minimum 2 characters)
- `limit` (optional): Maximum results (default: 20)

**Example:**
```bash
curl "http://localhost:3030/api/products/search?q=organic milk&limit=5"
```

**Response:**
```json
{
  "query": "organic milk",
  "count": 5,
  "products": [
    {
      "id": "0001234567890",
      "name": "Organic Whole Milk",
      "barcode": "0001234567890",
      "brand": "Organic Valley",
      "category": "en:milks",
      "image_url": "https://...",
      "source": "OpenFoodFacts",
      "nutrition_grade": "a",
      "raw": { }
    }
  ]
}
```

### Lookup by Barcode
```bash
GET /api/products/barcode/:code
```

**Example:**
```bash
curl "http://localhost:3030/api/products/barcode/737628064502"
```

## Using with GitHub Copilot

Once the MCP server is running, GitHub Copilot can use the product search tools in your VS Code environment.

### Prerequisites

1. Start the backend server:
   ```bash
   cd packages/backend
   npm start
   ```

2. Verify MCP configuration exists at `.vscode/mcp.json`

3. Restart VS Code to load the MCP server

### Example Copilot Queries

You can ask GitHub Copilot questions like:

- **"Search for organic milk products"** - Copilot will use `searchProducts` tool
- **"What products can I find for barcode 737628064502?"** - Copilot will use `getProductByBarcode` tool  
- **"What product data sources are available?"** - Copilot will use `getAvailableSources` tool
- **"Find me some breakfast cereal options"** - Copilot will search and return results

### How It Works

1. You ask Copilot a question about products
2. Copilot recognizes it needs product data
3. Copilot calls the MCP server using JSON-RPC 2.0
4. The MCP server queries OpenFoodFacts and other sources
5. Results are returned to Copilot
6. Copilot formats the answer for you

### Benefits

- **No API keys needed** in your code - Copilot handles the MCP protocol
- **Context-aware** - Copilot understands your codebase and can suggest relevant products
- **Real data** - Access to millions of products from OpenFoodFacts
- **Development productivity** - Get product data without leaving your editor

## Frontend Integration

The autocomplete component is integrated into the "Add New Item" form:

```javascript
<Autocomplete
  value={newItemName}
  onChange={setNewItemName}
  onSelect={handleProductSelect}
  placeholder="Start typing to search products..."
  minChars={2}
  debounceMs={300}
/>
```

**Features:**
- 📝 Live search as you type
- ⏱️ Debounced API calls (300ms)
- ⬆️⬇️ Keyboard navigation (arrow keys)
- ⏎ Enter to select
- ⎋ Escape to close
- 🖼️ Product images in suggestions
- 🔍 Shows product source (OpenFoodFacts, etc.)

## Testing

### Test MCP Protocol (JSON-RPC 2.0)

#### Test MCP Initialize
```bash
curl -X POST http://localhost:3030/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "1.0.0",
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }' | python3 -m json.tool
```

#### Test MCP Tools List
```bash
curl -X POST http://localhost:3030/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' | python3 -m json.tool
```

#### Test MCP Product Search
```bash
curl -X POST http://localhost:3030/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "searchProducts",
      "arguments": {
        "query": "organic milk",
        "limit": 5
      }
    }
  }' | python3 -m json.tool
```

#### Test MCP Barcode Lookup
```bash
curl -X POST http://localhost:3030/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "getProductByBarcode",
      "arguments": {
        "barcode": "737628064502"
      }
    }
  }' | python3 -m json.tool
```

### Test REST API Endpoints

#### Test MCP Sources
```bash
curl -s "http://localhost:3030/api/products/sources" | python3 -m json.tool
```

#### Test Product Search
```bash
# Search for milk
curl -s "http://localhost:3030/api/products/search?q=milk&limit=3" | python3 -m json.tool

# Search for organic products
curl -s "http://localhost:3030/api/products/search?q=organic" | python3 -m json.tool
```

### Test Barcode Lookup
```bash
# Example: Coca-Cola barcode
curl -s "http://localhost:3030/api/products/barcode/5449000000996" | python3 -m json.tool
```

### Test in Browser
1. Navigate to http://localhost:3000
2. Start typing in the "Add New Item" field
3. After 2+ characters, autocomplete suggestions should appear
4. Click a suggestion or press Enter to select

## Troubleshooting

### Open Food Facts Returns Empty Results

**Symptom:** Search returns `{"products": [], "count": 0}`

**Possible Causes:**
1. **503 Service Unavailable:** Open Food Facts API is temporarily overloaded
2. **Rate Limiting:** Too many requests in short time
3. **Network Issues:** Unable to reach external API

**Solutions:**
- Wait a few moments and try again
- Check backend logs for error messages:
  ```
  [OpenFoodFacts] Search error: Request failed with status code 503
  ```
- Test Open Food Facts API directly:
  ```bash
  curl "https://world.openfoodfacts.org/cgi/search.pl?search_terms=milk&search_simple=1&action=process&json=1&page_size=3"
  ```
- Manual entry still works! Users can type any product name without autocomplete

### Autocomplete Not Showing

**Possible Causes:**
1. No results found for query
2. Query less than 2 characters
3. JavaScript error in browser console
4. Backend not running

**Solutions:**
- Check browser developer console for errors
- Ensure backend is running on port 3030
- Try a common product name like "milk" or "bread"
- Check network tab to see if API call is being made

### Adding New MCP Sources

To add a new product data source:

1. Create a new client class extending `MCPClient`:
   ```javascript
   // packages/backend/src/services/mcp/newSourceClient.js
   const MCPClient = require('./mcpClient');
   
   class NewSourceClient extends MCPClient {
     constructor() {
       super({
         name: 'NewSource',
         baseURL: 'https://api.newsource.com',
         enabled: true
       });
     }
     
     async searchProducts(query) {
       // Implement search logic
     }
     
     normalizeProduct(product) {
       // Standardize product format
     }
   }
   
   module.exports = NewSourceClient;
   ```

2. Register in `productSearchService.js`:
   ```javascript
   const NewSourceClient = require('./newSourceClient');
   
   this.sources = {
     openFoodFacts: new OpenFoodFactsClient(),
     kroger: new KrogerClient(),
     instacart: new InstacartClient(),
     newSource: new NewSourceClient() // Add here
   };
   ```

3. Restart backend server

## Benefits of MCP Architecture

✅ **Modular:** Each API source is isolated  
✅ **Scalable:** Easy to add new sources  
✅ **Resilient:** One source failure doesn't break others  
✅ **Testable:** Each client can be tested independently  
✅ **Maintainable:** Clear separation of concerns  
✅ **Future-Ready:** Prepared for Kroger/Instacart APIs  

## Future Enhancements

### Phase 3: Receipt OCR
- Upload receipt photos
- Extract items and prices automatically
- Batch entry

### Price Data Integration
If Kroger/Instacart APIs become available:
- Auto-populate prices from API
- Show real-time store pricing
- Price comparison across chains
- Best deal recommendations

### Barcode Scanning
- Mobile camera integration
- Instant product lookup
- Quick item addition

## Files Structure

```
packages/backend/src/services/mcp/
├── mcpClient.js                 # Base MCP client class
├── openFoodFactsClient.js       # Open Food Facts implementation ✓
├── krogerClient.js              # Kroger placeholder
├── instacartClient.js           # Instacart placeholder
└── productSearchService.js      # Aggregator service

packages/frontend/src/components/
├── Autocomplete.js              # Autocomplete React component
└── Autocomplete.css             # Autocomplete styles
```

## Known Limitations

1. **Open Food Facts Availability:** API can be slow or unavailable during peak times
2. **No Store Pricing:** Current sources don't provide price data
3. **Product Coverage:** Primarily food items, not all grocery products
4. **No Real-Time Sync:** Prices still manual entry only
5. **Rate Limiting:** External APIs may throttle requests

## Conclusion

The MCP integration provides a solid foundation for product search while keeping the app functional with manual entry. As more APIs become available (Kroger, Instacart), they can be easily integrated into the existing architecture without major changes.

**Current Status:**
- ✅ MCP architecture implemented
- ✅ Open Food Facts integrated
- ✅ Autocomplete UI functional
- ✅ Graceful fallback to manual entry
- ⏳ Kroger API (pending approval)
- ⏳ Instacart API (partner-only)

---

*Last Updated: June 2, 2026*
