# Walmart API Setup Guide

## Overview

This guide will help you set up the **Walmart Open API** to get real-time pricing for grocery items in your price tracking application.

## Prerequisites

- Node.js backend already running
- Access to create a Walmart developer account

## Step 1: Sign Up for Walmart Developer Account

1. Go to: **https://developer.walmart.com/**
2. Click **"Sign Up"** or **"Get Started"**
3. Create an account or sign in with existing Walmart account
4. Accept the terms and conditions

## Step 2: Request API Access

1. Navigate to **"My Account"** or **"API Management"**
2. Click **"Add New Key for an Application"**
3. Fill out the application form:
   - **Application Name**: "Grocery Price Tracker"
   - **Application Description**: "Personal grocery price comparison app"
   - **APIs Requested**: Select **"Affiliate Product API"** or **"Item API"**
4. Submit your application

## Step 3: Get Your API Key

Once approved (usually instant for Affiliate API):
1. Go to **"My Keys"** or **"API Keys"**
2. Copy your **API Key** (Consumer ID)
3. Keep this secure - do not commit to GitHub!

## Step 4: Configure Environment Variables

### For Local Development:

Create or edit `packages/backend/.env`:

```bash
# Walmart API Configuration
WALMART_API_KEY=your_api_key_here
WALMART_STORE_ID=5260  # Optional: Default store (Cincinnati area)
```

### For GitHub Codespaces:

```bash
export WALMART_API_KEY="your_api_key_here"
export WALMART_STORE_ID="5260"
```

## Step 5: Restart Backend Server

```bash
cd packages/backend
npm start
```

You should see:
```
[Walmart] API enabled with key: abcd1234...
✓ ENABLED - Walmart
```

## Step 6: Test the Integration

### Test Product Search:

```bash
curl "http://localhost:3030/api/products/search?q=milk&limit=10"
```

You should see results from **Kroger, Walmart, and OpenFoodFacts**!

### Check Available Sources:

```bash
curl "http://localhost:3030/api/products/sources"
```

Should show Walmart as `"available": true`

## API Key Notes

### Free Tier Limits:
- **5,000 requests per day** for Affiliate API
- Rate limit: **5 requests per second**
- Suitable for personal use

### API Endpoints Used:
- **Search**: `/items?query=<search_term>`
- **UPC Lookup**: `/items?upc=<barcode>`

### What You Get:
- Product names and descriptions
- Real-time pricing (`salePrice`)
- Regular price (`msrp`) for comparison
- Product images
- Brand information
- Stock status
- UPC/barcode

## Troubleshooting

### "API not available - API key required"
- Check that `WALMART_API_KEY` is set in `.env`
- Restart the backend server
- Verify the key is correct (no extra spaces)

### "401 Unauthorized"
- Your API key may be invalid
- Check you copied the entire key
- Verify your Walmart developer account is active

### "No Walmart products returned"
- Walmart's catalog might not have that specific item
- Try more generic search terms (e.g., "milk" instead of "Organic Valley Milk")
- Check the API key is working with a simple search first

### "Rate limit exceeded"
- Free tier: 5 req/sec, 5000/day
- Wait a minute and try again
- Consider reducing search frequency

## Store IDs

Default store ID: `5260` (Cincinnati area)

To find your local Walmart:
1. Visit Walmart.com
2. Set your local store
3. Check URL or store details for store number

## Security Best Practices

- ✅ Keep API key in `.env` file
- ✅ Add `.env` to `.gitignore`
- ✅ Never commit API keys to Git
- ✅ Use environment variables in production
- ✅ Rotate keys periodically

## Resources

- **Walmart Developer Portal**: https://developer.walmart.com/
- **API Documentation**: https://developer.walmart.com/doc/us/mp/us-mp-items/
- **Support**: developer@walmart.com

---

## Next Steps

Once Walmart API is working:
1. Frontend will automatically show Walmart prices alongside Kroger prices
2. Users can compare prices across both stores
3. System will aggregate results from OpenFoodFacts, Kroger, and Walmart

Enjoy multi-store price comparison! 🛒💰
