# Kroger API Setup Guide

## Overview

The Kroger Developer API provides **real-time product pricing** and availability data from Kroger stores. This is a HUGE upgrade from OpenFoodFacts which doesn't have pricing.

## What You Get

✅ **Real-time prices** - Current product prices at Kroger stores  
✅ **Promotional pricing** - Sale prices and deals  
✅ **Store locations** - Find Kroger stores near you  
✅ **Product availability** - Check if products are in stock  
✅ **Product catalog** - Search Kroger's full product database  
✅ **Store-specific pricing** - Prices vary by location  

## Certification vs Production Environments

Kroger has two API environments:

### Certification (Test) Environment
- **Purpose**: Testing and development
- **URL**: `https://api-ce.kroger.com/v1`
- **Data**: Test/sample data, may not reflect real inventory
- **Availability**: Can be intermittent, less reliable than production
- **Access**: Immediate upon creating application
- **Use for**: Development, testing your integration

### Production Environment  
- **Purpose**: Live, real-world data
- **URL**: `https://api.kroger.com/v1`
- **Data**: Real products, real prices, real inventory
- **Availability**: Highly reliable, production-grade
- **Access**: May require additional approval from Kroger
- **Use for**: Actual price tracking with real data

**Your current setup** uses **Certification** environment (perfect for testing!).  

## Step 1: Apply for API Access

1. **Visit Kroger Developer Portal**
   - Go to: https://developer.kroger.com/
   - Click "Get Started" or "Sign Up"

2. **Create an Account**
   - Sign up with your email
   - Verify your email address

3. **Create a New Application**
   - Dashboard → "Create Application"
   - Application Name: `Grocery Price Tracker`
   - Description: `Personal project for tracking grocery prices`
   - Application Type: `Other`
   - Accept Terms of Service

4. **Get Your Credentials**
   - After approval, you'll receive:
     - **Client ID** (public identifier)
     - **Client Secret** (keep this private!)

## Step 2: Set Environment Variables

### Option A: Terminal (Temporary - current session only)

```bash
export KROGER_CLIENT_ID="your_client_id_here"
export KROGER_CLIENT_SECRET="your_client_secret_here"
export KROGER_LOCATION_ID="01400943"  # Optional: Cincinnati store
```

### Option B: Create .env File (Recommended)

1. Create `.env` file in `packages/backend/`:

```bash
cd /workspaces/capstone_v1/packages/backend
touch .env
```

2. Add your credentials to `.env`:

```env
# Kroger API Credentials
KROGER_CLIENT_ID=your_client_id_here
KROGER_CLIENT_SECRET=your_client_secret_here

# Optional: Default store location (Cincinnati, OH)
KROGER_LOCATION_ID=01400943
```

3. Install dotenv package (if not already installed):

```bash
npm install dotenv
```

4. Load environment variables in `src/index.js`:

```javascript
require('dotenv').config();
```

### Option C: GitHub Codespaces Secrets (Production)

1. Go to your repository settings
2. Secrets and variables → Codespaces
3. Add repository secrets:
   - `KROGER_CLIENT_ID`
   - `KROGER_CLIENT_SECRET`
   - `KROGER_LOCATION_ID`

## Step 3: Find Your Store Location ID

Kroger API requires a store location ID for pricing (prices vary by store).

### Method 1: Use the API

Once you have credentials, search by ZIP code:

```bash
curl -X POST http://localhost:3030/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "searchKrogerLocations",
      "arguments": {
        "zipCode": "90210"
      }
    }
  }'
```

### Method 2: Common Location IDs

Here are some example location IDs:

- **Cincinnati, OH**: `01400943`
- **Atlanta, GA**: `01400421`
- **Dallas, TX**: `01400466`
- **Seattle, WA**: `01400422`

You can find more by using the location search once your API is enabled.

## Step 4: Restart the Backend

After setting environment variables:

```bash
# Stop the server (Ctrl+C)
# Restart it
cd /workspaces/capstone_v1/packages/backend
npm start
```

You should see:

```
=== MCP Product Search Service ===
  ✓ ENABLED - OpenFoodFacts
  ✓ ENABLED - Kroger           ← Should now show as enabled!
  ✗ DISABLED - Instacart
==================================
```

## Step 5: Test Kroger Integration

### Test with MCP Protocol

```bash
# Search for products with REAL PRICES
curl -X POST http://localhost:3030/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
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

### Test with REST API

```bash
curl -s "http://localhost:3030/api/products/search?q=milk&limit=5" | python3 -m json.tool
```

You should now see **REAL KROGER PRICES** in the results! 🎉

## Expected Response Format

```json
{
  "id": "0001111041700",
  "name": "Simple Truth Organic™ Whole Milk",
  "barcode": "0001111041700",
  "brand": "Simple Truth Organic",
  "category": "Dairy",
  "image_url": "https://...",
  "price": 5.49,              ← REAL PRICE!
  "regular_price": 5.99,
  "promo_price": 5.49,
  "on_sale": true,            ← On sale indicator
  "size": "1 gal",
  "store": "Kroger",
  "location_id": "01400943",
  "source": "Kroger"
}
```

## Troubleshooting

### Error: "API credentials not configured"

**Solution:** Environment variables not set or server not restarted
- Double-check `.env` file exists in `packages/backend/`
- Restart the backend server
- Verify variables: `echo $KROGER_CLIENT_ID`

### Error: "Authentication failed"

**Possible Causes:**
- Invalid `client_id` or `client_secret`
- Application not approved by Kroger
- Credentials expired

**Solution:** 
- Check Kroger Developer Portal for application status
- Regenerate credentials if needed
- Ensure no extra spaces in environment variables

### Error: "401 Unauthorized"

**Solution:** Token expired, will auto-refresh on next request

### Error: "No results found"

**Possible Causes:**
- Product not available at the selected store location
- Search term too specific
- Location ID invalid

**Solution:**
- Try broader search terms
- Verify location ID with location search
- Try a different store location

## Rate Limits

Kroger API has rate limits:
- **1,000 calls per day** (free tier)
- **10 calls per second**

The implementation caches OAuth tokens to minimize authentication calls.

## Security Notes

🔒 **IMPORTANT:**

1. **Never commit credentials to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Keep secrets secret**
   - Don't share your `client_secret`
   - Don't log credentials

3. **Use GitHub Secrets for production**
   - Store in repository secrets
   - Not in code

## Next Steps

1. ✅ Get API credentials
2. ✅ Set environment variables
3. ✅ Restart backend
4. ✅ Test product search with real prices
5. 🚀 Start comparing grocery prices!

## Useful Links

- **Kroger Developer Portal**: https://developer.kroger.com/
- **API Documentation**: https://developer.kroger.com/reference
- **Support**: https://developer.kroger.com/support

---

**Note:** Kroger API access is typically approved within 1-2 business days. While waiting, you can continue using OpenFoodFacts (no pricing) or manually enter prices.
