# Coding Guidelines - Grocery Price Comparison Tracker

## Overview
This document outlines the coding standards, style conventions, and best practices for the Grocery Price Comparison Tracker project. Following these guidelines ensures consistency, maintainability, and quality across the codebase.

## General Principles

### 1. Code Quality Principles

#### DRY (Don't Repeat Yourself)
- Avoid code duplication by extracting common logic into reusable functions or components
- If you write the same code more than twice, refactor it into a shared utility
- Example: Create a `formatPrice()` utility function instead of repeating price formatting logic

#### KISS (Keep It Simple, Stupid)
- Write simple, straightforward code that's easy to understand
- Avoid over-engineering solutions
- Prefer clarity over cleverness

#### YAGNI (You Aren't Gonna Need It)
- Don't add functionality until it's actually needed
- Build features based on current requirements, not hypothetical future needs

#### Separation of Concerns
- Keep business logic separate from presentation logic
- Backend: Separate route handlers, database operations, and validation logic
- Frontend: Separate UI components from data fetching and state management

### 2. Code Readability

#### Meaningful Names
- Use descriptive, self-documenting variable and function names
- **Good**: `calculateLowestPrice()`, `storeName`, `priceHistory`
- **Bad**: `calc()`, `sn`, `data1`

#### Function Size
- Keep functions small and focused (ideally under 50 lines)
- Each function should do one thing well
- If a function is too long, break it into smaller functions

#### Comments
- Write code that's self-explanatory first
- Use comments to explain "why", not "what"
- Document complex business logic or algorithms
- Keep comments up-to-date with code changes

```javascript
// Good: Explains why
// Use ISO format to ensure consistent date comparison across timezones
const formattedDate = date.toISOString().split('T')[0];

// Bad: States the obvious
// Format the date
const formattedDate = date.toISOString().split('T')[0];
```

## JavaScript/Node.js Standards

### 1. Modern JavaScript (ES6+)
- Use modern ES6+ features: `const`/`let`, arrow functions, destructuring, template literals
- Prefer `const` by default, use `let` only when reassignment is necessary
- Never use `var`

```javascript
// Good
const itemName = 'Milk';
const prices = items.map(item => item.price);
const { id, name } = item;

// Bad
var itemName = 'Milk';
const prices = items.map(function(item) { return item.price; });
const id = item.id;
const name = item.name;
```

### 2. Formatting Rules

#### Indentation
- Use **2 spaces** for indentation (no tabs)
- Consistent indentation for nested blocks

#### Line Length
- Maximum line length: **100 characters**
- Break long lines for better readability

#### Semicolons
- Use semicolons at the end of statements
- Consistent across the project

#### Quotes
- Use **single quotes** for strings in JavaScript
- Use backticks for template literals

```javascript
const message = 'Hello';
const greeting = `Hello, ${name}!`;
```

#### Spacing
- Space after keywords: `if (condition)`, `for (let i = 0; ...)`, `function name()`
- Space around operators: `a + b`, `x === y`
- No space before parentheses in function calls: `myFunction()`
- Space after commas: `[1, 2, 3]`, `{ a: 1, b: 2 }`

```javascript
// Good
if (price < 10) {
  console.log('Cheap!');
}

// Bad
if(price<10){
  console.log('Cheap!');
}
```

#### Braces
- Use braces for all control structures, even single-line statements
- Opening brace on same line (K&R style)

```javascript
// Good
if (condition) {
  doSomething();
}

// Bad
if (condition)
  doSomething();
```

### 3. Import Organization

#### Backend (Node.js)
Organize imports in this order:
1. Built-in Node.js modules
2. External dependencies (npm packages)
3. Local modules (project files)

Add a blank line between each group:

```javascript
// 1. Built-in modules
const path = require('path');
const fs = require('fs');

// 2. External dependencies
const express = require('express');
const cors = require('cors');

// 3. Local modules
const { validateItem } = require('./validators');
const db = require('./database');
```

#### Frontend (React)
Organize imports in this order:
1. React and React-related imports
2. External libraries
3. Local components
4. Utilities and helpers
5. Styles

```javascript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. External libraries
import axios from 'axios';

// 3. Local components
import ItemList from './components/ItemList';
import PriceForm from './components/PriceForm';

// 4. Utilities
import { formatPrice, calculateLowest } from './utils/priceHelpers';

// 5. Styles
import './App.css';
```

### 4. Async/Await
- Prefer `async/await` over `.then()` chains for better readability
- Always handle errors with try-catch blocks

```javascript
// Good
async function fetchItems() {
  try {
    const response = await fetch('/api/items');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}

// Avoid
function fetchItems() {
  return fetch('/api/items')
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error('Error:', error));
}
```

## React Best Practices

### 1. Component Structure
- One component per file
- Use functional components with hooks (not class components)
- Name component files with PascalCase: `ItemList.js`, `PriceCard.js`

### 2. Component Organization
Structure components in this order:
1. Imports
2. Component definition
3. Helper functions (if any)
4. Export

```javascript
// 1. Imports
import React, { useState } from 'react';
import './ItemCard.css';

// 2. Component
function ItemCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="item-card">
      {/* JSX */}
    </div>
  );
}

// 3. Export
export default ItemCard;
```

### 3. Props
- Destructure props in function parameters for clarity
- Use PropTypes or TypeScript for type checking (optional but recommended)

```javascript
// Good
function PriceCard({ price, store, date, isLowest }) {
  return <div>{/* ... */}</div>;
}

// Less clear
function PriceCard(props) {
  return <div>{props.price}</div>;
}
```

### 4. State Management
- Keep state as local as possible
- Lift state up only when multiple components need it
- Use meaningful state variable names

```javascript
// Good
const [items, setItems] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);
const [isLoading, setIsLoading] = useState(false);

// Bad
const [data, setData] = useState([]);
const [selected, setSelected] = useState(null);
const [loading, setLoading] = useState(false);
```

### 5. Event Handlers
- Prefix handler functions with `handle`: `handleClick`, `handleSubmit`, `handleChange`
- Define handlers inside component, not inline (unless very simple)

```javascript
// Good
function ItemForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Complex logic here
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Backend (Express) Best Practices

### 1. Route Organization
- Keep route handlers clean and focused
- Extract complex logic into separate functions or services
- Use meaningful route paths: `/api/items`, `/api/prices/:id`

### 2. Error Handling
- Always handle errors in async routes
- Return appropriate HTTP status codes
- Provide helpful error messages

```javascript
app.post('/api/items', async (req, res) => {
  try {
    const { name, category } = req.body;
    
    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }
    
    // Business logic
    const result = await createItem(name, category);
    res.status(201).json(result);
    
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});
```

### 3. Input Validation
- Validate all user inputs
- Check data types, required fields, and constraints
- Return clear validation error messages

### 4. Database Operations
- Use prepared statements to prevent SQL injection
- Handle database errors gracefully
- Keep database logic separate from route handlers

## Code Organization

### 1. File Structure
```
packages/
  backend/
    src/
      app.js           # Express app setup
      index.js         # Server entry point
      routes/          # API routes (future)
      utils/           # Helper functions
  frontend/
    src/
      components/      # React components
      utils/           # Helper functions
      App.js           # Main component
      index.js         # Entry point
```

### 2. Utility Functions
- Create utility files for reusable functions
- Group related utilities together
- Examples: `priceHelpers.js`, `dateHelpers.js`, `validators.js`

### 3. Constants
- Define constants in UPPER_CASE
- Group related constants in separate files
- Examples: `const MAX_PRICE = 9999;`, `const API_BASE_URL = '/api';`

## Testing Standards

### 1. Test File Naming
- Place tests in `__tests__` directories
- Name test files: `ComponentName.test.js` or `functionName.test.js`

### 2. Test Structure
- Use descriptive test names that explain what's being tested
- Follow Arrange-Act-Assert pattern
- Group related tests with `describe` blocks

```javascript
describe('ItemList Component', () => {
  test('renders list of items', () => {
    // Arrange
    const items = [{ id: 1, name: 'Milk' }];
    
    // Act
    render(<ItemList items={items} />);
    
    // Assert
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });
});
```

### 3. Test Coverage
- Aim for meaningful test coverage, not just high percentages
- Test critical business logic and user interactions
- Don't test implementation details

## Linting and Formatting

### 1. ESLint
- Use ESLint to catch common errors and enforce code style
- Configuration extends React and Node.js best practices
- Run linter before committing code

### 2. Prettier (Optional)
- Can be used for consistent code formatting
- Configure to match project style (2 spaces, single quotes, etc.)

### 3. Pre-commit Hooks
- Consider using Husky + lint-staged to run linters before commits
- Ensures all committed code meets standards

## Git Commit Guidelines

### 1. Commit Messages
Use clear, descriptive commit messages:
- Start with a verb: "Add", "Fix", "Update", "Remove", "Refactor"
- Be specific about what changed
- Keep first line under 72 characters

```
Good:
- Add price comparison view component
- Fix date formatting bug in price display
- Update item validation to require category

Bad:
- updates
- fix bug
- changes
```

### 2. Commit Frequency
- Commit logical units of work
- Don't commit broken code
- Commit often to create a clear history

## Documentation

### 1. README Files
- Keep README.md updated with setup instructions
- Document environment variables and configuration
- Include examples of how to run the project

### 2. Code Documentation
- Document complex functions with JSDoc comments
- Explain non-obvious business logic
- Keep documentation in sync with code

### 3. API Documentation
- Document API endpoints (method, path, request/response format)
- Include example requests and responses
- Note any authentication or permission requirements

## Performance Considerations

### 1. Frontend
- Avoid unnecessary re-renders
- Use React.memo for expensive components (when needed)
- Lazy load images and components when appropriate
- Minimize bundle size

### 2. Backend
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache expensive computations when appropriate
- Use appropriate HTTP status codes and headers

## Security Best Practices

### 1. Input Validation
- Validate and sanitize all user inputs
- Never trust client-side data
- Use parameterized queries to prevent SQL injection

### 2. Error Handling
- Don't expose sensitive information in error messages
- Log detailed errors server-side, return generic messages to client
- Handle edge cases gracefully

### 3. Dependencies
- Keep dependencies up to date
- Review security advisories for packages
- Use `npm audit` to check for vulnerabilities

## Code Review Checklist

Before submitting code for review or merging:
- [ ] Code follows style guidelines
- [ ] No console.log statements left in production code
- [ ] Error handling is in place
- [ ] Tests are written and passing
- [ ] Code is DRY and reusable where appropriate
- [ ] Variable and function names are clear and descriptive
- [ ] Comments explain complex logic
- [ ] No unused imports or variables
- [ ] Linter passes with no warnings
- [ ] Functionality works as expected

## Resources

- [JavaScript Style Guide (Airbnb)](https://github.com/airbnb/javascript)
- [React Documentation](https://react.dev)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

*These guidelines are living documents and should evolve as the project grows. Consistency is more important than any specific rule - when in doubt, follow the existing patterns in the codebase.*
