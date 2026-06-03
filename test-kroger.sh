#!/bin/bash

# Kroger API Test Script
# Tests Kroger integration after setting up API credentials

echo "==================================="
echo "Kroger API Integration Test"
echo "==================================="
echo ""

# Check if environment variables are set
if [ -z "$KROGER_CLIENT_ID" ] && [ ! -f "/workspaces/capstone_v1/packages/backend/.env" ]; then
    echo "⚠️  WARNING: Kroger API credentials not found!"
    echo ""
    echo "To enable Kroger API:"
    echo "1. Get credentials from https://developer.kroger.com/"
    echo "2. Create packages/backend/.env file:"
    echo ""
    echo "   KROGER_CLIENT_ID=your_client_id"
    echo "   KROGER_CLIENT_SECRET=your_client_secret"
    echo "   KROGER_LOCATION_ID=01400943"
    echo ""
    echo "3. Restart the backend server"
    echo ""
    echo "See docs/kroger-api-setup.md for detailed instructions."
    echo ""
    exit 1
fi

BASE_URL="http://localhost:3030"

echo "Test 1: Check Available Sources"
echo "-----------------------------------"
curl -s "$BASE_URL/api/products/sources" | python3 -m json.tool
echo ""
echo ""

echo "Test 2: Search Products with Kroger (MCP)"
echo "-----------------------------------"
curl -X POST "$BASE_URL/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "searchProducts",
      "arguments": {
        "query": "milk",
        "limit": 3
      }
    }
  }' 2>/dev/null | python3 -m json.tool
echo ""
echo ""

echo "Test 3: Search Kroger Store Locations"
echo "-----------------------------------"
echo "Searching for stores near ZIP 45202 (Cincinnati, OH)..."
curl -X POST "$BASE_URL/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "searchKrogerLocations",
      "arguments": {
        "zipCode": "45202",
        "limit": 3
      }
    }
  }' 2>/dev/null | python3 -m json.tool
echo ""
echo ""

echo "Test 4: Product with Real-Time Pricing"
echo "-----------------------------------"
curl -s "$BASE_URL/api/products/search?q=organic%20milk&limit=3" | python3 -m json.tool
echo ""
echo ""

echo "==================================="
echo "✓ Kroger API Tests Complete"
echo "==================================="
echo ""
echo "If you see prices in the results, Kroger API is working! 🎉"
echo "If not, check:"
echo "  - API credentials are correct"
echo "  - Backend server was restarted after setting .env"
echo "  - Kroger Developer Portal shows application as 'Active'"
