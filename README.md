# AI Coding Assistant Enablement Bootcamp Session 1

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey @rashmi-2026-slalom!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/rashmi-2026-slalom/capstone_v1/issues/1)

---

## Project: Grocery Price Comparison Tracker

A web application that helps users track and compare grocery prices across different stores with **official Model Context Protocol (MCP)** integration for GitHub Copilot.

### Features

- 📝 Item management with autocomplete product search
- 💰 Price logging across multiple stores
- 📊 Price comparison and best deals dashboard
- 🤖 **MCP Integration** - GitHub Copilot can search products directly
- 🔍 Multi-source product search (OpenFoodFacts, Kroger✨, Instacart*)
- 💵 **Real-time pricing** from Kroger API (with credentials)

*Requires API credentials - See [Kroger API Setup Guide](docs/kroger-api-setup.md)

### Tech Stack

- **Frontend**: React 18.2.0
- **Backend**: Node.js + Express 4.18.2
- **Database**: SQLite (in-memory)
- **MCP**: Official Model Context Protocol (JSON-RPC 2.0)

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start backend server:**
   ```bash
   cd packages/backend
   npm start
   # Server runs on http://localhost:3030
   ```

3. **Start frontend (in another terminal):**
   ```bash
   cd packages/frontend
   npm start
   # Opens http://localhost:3000
   ```

### MCP Integration (GitHub Copilot)

This project implements the **official Model Context Protocol** specification, enabling GitHub Copilot to use product search tools.

**Configuration:** `.vscode/mcp.json`

**Available Tools:**
- `searchProducts(query, limit)` - Search grocery products (with real-time Kroger pricing! 💰)
- `getProductByBarcode(barcode)` - Lookup by UPC/EAN
- `getAvailableSources()` - List data sources
- `searchKrogerLocations(zipCode)` - Find nearby Kroger stores

**Test MCP Endpoint:**
```bash
./test-mcp.sh           # Test all MCP features
./test-kroger.sh        # Test Kroger API specifically
```

**Enable Kroger API (Real-Time Prices!):**

Kroger API provides **actual product prices** from stores. To enable:

1. **Get API credentials** from https://developer.kroger.com/
2. **Create `.env` file** in `packages/backend/`:
   ```env
   KROGER_CLIENT_ID=your_client_id
   KROGER_CLIENT_SECRET=your_client_secret
   KROGER_LOCATION_ID=01400943
   ```
3. **Restart backend server**
4. **See prices!** 🎉

📖 **Full Setup Guide:** [docs/kroger-api-setup.md](docs/kroger-api-setup.md)

**Ask Copilot:**
- "Search for organic milk products"
- "What products can I find for barcode 737628064502?"
- "What product data sources are available?"

### Documentation

- **[MCP Integration Guide](docs/mcp-integration-guide.md)** - Complete MCP setup and usage
- **[Functional Requirements](docs/functional-requirements.md)** - Features and user stories
- **[UI Guidelines](docs/ui-guidelines.md)** - Design system and styling
- **[Coding Guidelines](docs/coding-guidelines.md)** - Best practices and conventions

### Project Structure

```
capstone_v1/
├── .vscode/
│   └── mcp.json              # MCP server configuration
├── packages/
│   ├── backend/
│   │   └── src/
│   │       ├── app.js        # Express app with MCP endpoint
│   │       └── services/
│   │           └── mcp/      # MCP server and data sources
│   └── frontend/
│       └── src/
│           ├── App.js
│           └── components/
└── docs/                      # Project documentation
```

### MCP Architecture

```
GitHub Copilot
    ↓ (JSON-RPC 2.0)
MCP Server (/mcp)
    ↓
Product Search Service
    ↓
├── OpenFoodFacts ✓ (Active)
├── Kroger (Needs credentials)
└── Instacart (Partner-only)
```

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

