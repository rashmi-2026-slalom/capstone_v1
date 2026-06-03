# GitHub Copilot Instructions

## Project Overview

This is a **Grocery Price Comparison Tracker** - a web application that helps users track and compare grocery prices across different stores to find the best deals on items they buy regularly.

## Tech Stack

### Frontend
- React 18.2.0 (functional components with hooks)
- React Scripts 5.0.1
- Testing: Jest + React Testing Library
- Styling: CSS (following design system in `docs/ui-guidelines.md`)

### Backend
- Node.js with Express 4.18.2
- SQLite (better-sqlite3) with in-memory database
- Testing: Jest + Supertest
- Middleware: CORS, Morgan (logging)

### Project Structure
- Monorepo with `packages/frontend` and `packages/backend`
- Frontend runs on port 3000 (development)
- Backend runs on port 3030
- Proxy configured: frontend → backend

## Key Documentation

Before generating code, please review these project guidelines:

1. **Functional Requirements**: `docs/functional-requirements.md`
   - Core features: Item management, price logging, price comparison, best deals dashboard
   - User stories and success criteria

2. **UI Guidelines**: `docs/ui-guidelines.md`
   - Color palette: Primary blue (#2563eb), semantic colors (green/yellow/red for price indicators)
   - Typography, spacing, component styles
   - Responsive design breakpoints

3. **Coding Guidelines**: `docs/coding-guidelines.md`
   - Code quality principles (DRY, KISS, YAGNI)
   - JavaScript/React best practices
   - Import organization, formatting rules
   - Testing standards

## Database Schema

### Items Table
```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Prices Table
```sql
CREATE TABLE prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  store_name TEXT NOT NULL,
  price REAL NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
```

## Coding Conventions

### JavaScript/Node.js
- Use ES6+ features (const/let, arrow functions, destructuring, template literals)
- Prefer `const` by default, `let` only when reassignment needed
- Use 2-space indentation
- Single quotes for strings, backticks for template literals
- Semicolons at end of statements
- async/await over promise chains

### Import Organization
**Backend:**
```javascript
// 1. Built-in Node.js modules
const path = require('path');

// 2. External dependencies
const express = require('express');

// 3. Local modules
const { validateItem } = require('./validators');
```

**Frontend:**
```javascript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. External libraries
import axios from 'axios';

// 3. Components
import ItemList from './components/ItemList';

// 4. Utilities
import { formatPrice } from './utils/helpers';

// 5. Styles
import './App.css';
```

### React Components
- Functional components only (no class components)
- Destructure props in function parameters
- Prefix event handlers with `handle`: `handleClick`, `handleSubmit`
- Keep components small and focused
- Use meaningful state variable names: `[items, setItems]`, `[isLoading, setIsLoading]`

### API Routes
- RESTful conventions:
  - GET `/api/items` - Get all items
  - POST `/api/items` - Create item
  - PUT `/api/items/:id` - Update item
  - DELETE `/api/items/:id` - Delete item
  - GET `/api/items/:id/prices` - Get prices for an item
  - POST `/api/prices` - Create price entry

### Error Handling
- Always use try-catch for async operations
- Return appropriate HTTP status codes (200, 201, 400, 404, 500)
- Provide helpful error messages in response body
- Log errors server-side with console.error

```javascript
// Backend example
app.post('/api/items', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }
    
    // ... business logic
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});
```

### Styling Guidelines
- Use semantic color system:
  - Green (#22c55e) for lowest/best prices
  - Red (#ef4444) for highest prices
  - Yellow (#eab308) for mid-range prices
  - Primary Blue (#2563eb) for buttons and actions
- Maintain spacing scale: 4px, 8px, 16px, 24px, 32px, 48px
- Border radius: 6px for buttons, 8px for cards
- Use responsive design: mobile (<640px), tablet (640-1024px), desktop (>1024px)

### Testing
- Test files in `__tests__` directories
- Name: `ComponentName.test.js`
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Mock external dependencies (API calls, database)

## Code Generation Preferences

When generating code:

1. **Follow project conventions** from `docs/coding-guidelines.md`
2. **Use semantic color coding** for price indicators (see `docs/ui-guidelines.md`)
3. **Implement proper error handling** with try-catch and status codes
4. **Validate user inputs** on both frontend and backend
5. **Write clean, DRY code** - extract reusable logic into utilities
6. **Add helpful comments** explaining "why", not "what"
7. **Use prepared statements** for database queries (SQL injection prevention)
8. **Make components responsive** following mobile-first approach
9. **Include loading and error states** in UI components
10. **Write tests** for new features following existing patterns

## Common Patterns

### Fetching Data (Frontend)
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Database Operations (Backend)
```javascript
// Using better-sqlite3
const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
const item = stmt.get(id);

// Insert with prepared statement
const insert = db.prepare('INSERT INTO items (name) VALUES (?)');
const result = insert.run(name);
```

## Current Development Status

- ✅ Database schema created (items and prices tables)
- ✅ Documentation complete (functional requirements, UI guidelines, coding guidelines)
- ✅ Backend API routes complete
- ✅ **MCP Integration** - Official Model Context Protocol implemented
- ✅ **Kroger API** - Full implementation with OAuth2, real-time pricing
- ✅ Product search service with OpenFoodFacts integration
- 🚧 Frontend UI - In Progress
- ⏳ Tests - Not Started

## MCP & Kroger API Integration

### Official Model Context Protocol
This project implements the **official MCP specification** for GitHub Copilot integration:
- JSON-RPC 2.0 protocol at `/mcp` endpoint
- Tools: `searchProducts`, `getProductByBarcode`, `getAvailableSources`, `searchKrogerLocations`
- Configuration: `.vscode/mcp.json`

### Kroger API (Real-Time Pricing!)
Fully implemented Kroger Developer API integration:
- **OAuth2 authentication** with client credentials flow
- **Product search** with real-time pricing by store location
- **Barcode lookup** for specific products
- **Store location search** by ZIP code
- **Setup required**: Get credentials from https://developer.kroger.com/
- **Documentation**: `docs/kroger-api-setup.md`

**To enable Kroger:**
1. Get credentials from Kroger Developer Portal
2. Create `packages/backend/.env` with `KROGER_CLIENT_ID` and `KROGER_CLIENT_SECRET`
3. Restart backend server

**File locations:**
- Implementation: `packages/backend/src/services/mcp/krogerClient.js`
- MCP Server: `packages/backend/src/services/mcp/mcpServer.js`
- Setup Guide: `docs/kroger-api-setup.md`

## Helpful Context

- This is a learning/capstone project focused on building a practical, real-world application
- Emphasis on clean code, good practices, and maintainability
- SQLite in-memory database for simplicity (data resets on server restart)
- No authentication/user management in MVP scope
- Mobile-responsive design is important for on-the-go price checking

## What NOT to Do

- ❌ Don't use class components (use functional components with hooks)
- ❌ Don't use `var` (use `const` or `let`)
- ❌ Don't skip input validation
- ❌ Don't expose sensitive errors to client
- ❌ Don't write SQL queries without parameterization
- ❌ Don't ignore error handling
- ❌ Don't duplicate code (follow DRY principle)
- ❌ Don't commit console.log statements in production code

---

*When in doubt, refer to the documentation in the `docs/` directory and follow existing patterns in the codebase.*
