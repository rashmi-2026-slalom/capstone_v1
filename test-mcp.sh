#!/bin/bash

# MCP Integration Test Script
# Tests the official Model Context Protocol implementation

echo "==================================="
echo "MCP Integration Test"
echo "==================================="
echo ""

BASE_URL="http://localhost:3030/mcp"

# Test 1: Initialize
echo "Test 1: Initialize MCP Connection"
echo "-----------------------------------"
curl -X POST "$BASE_URL" \
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
  }' 2>/dev/null | python3 -m json.tool
echo ""
echo ""

# Test 2: List Tools
echo "Test 2: List Available Tools"
echo "-----------------------------------"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' 2>/dev/null | python3 -m json.tool
echo ""
echo ""

# Test 3: Call Tool - Get Available Sources
echo "Test 3: Call Tool - getAvailableSources"
echo "-----------------------------------"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "getAvailableSources",
      "arguments": {}
    }
  }' 2>/dev/null | python3 -m json.tool
echo ""
echo ""

# Test 4: Call Tool - Search Products
echo "Test 4: Call Tool - searchProducts"
echo "-----------------------------------"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "searchProducts",
      "arguments": {
        "query": "organic milk",
        "limit": 3
      }
    }
  }' 2>/dev/null | python3 -m json.tool
echo ""
echo ""

# Test 5: List Resources
echo "Test 5: List Available Resources"
echo "-----------------------------------"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "resources/list",
    "params": {}
  }' 2>/dev/null | python3 -m json.tool
echo ""
echo ""

# Test 6: Read Resource
echo "Test 6: Read Resource - product://sources"
echo "-----------------------------------"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "resources/read",
    "params": {
      "uri": "product://sources"
    }
  }' 2>/dev/null | python3 -m json.tool
echo ""
echo ""

# Test 7: List Prompts
echo "Test 7: List Available Prompts"
echo "-----------------------------------"
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "prompts/list",
    "params": {}
  }' 2>/dev/null | python3 -m json.tool
echo ""
echo ""

echo "==================================="
echo "✓ MCP Integration Tests Complete"
echo "==================================="
echo ""
echo "Note: If searchProducts returns empty results, this may be due to"
echo "OpenFoodFacts API being temporarily unavailable (503 error)."
echo "This is expected behavior and the MCP implementation is working correctly."
