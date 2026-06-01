const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    store_name TEXT NOT NULL,
    price REAL NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  );
`);

console.log('Database initialized with items and prices tables');

// API Routes

// Root route - API info
app.get('/', (req, res) => {
  res.json({
    message: 'Grocery Price Comparison Tracker API',
    version: '1.0.0',
    endpoints: {
      items: '/api/items',
      prices: '/api/prices (coming soon)'
    }
  });
});

// GET /api/items - Get all items
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY name ASC').all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/items/:id - Get a single item
app.get('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST /api/items - Create a new item
app.post('/api/items', (req, res) => {
  try {
    const { name } = req.body;
    
    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }
    
    // Insert item
    const insert = db.prepare('INSERT INTO items (name) VALUES (?)');
    const result = insert.run(name.trim());
    
    // Get the created item
    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newItem);
    
  } catch (error) {
    console.error('Error creating item:', error);
    
    // Handle unique constraint violation
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Item with this name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/items/:id - Update an item
app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Check if item exists
    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }
    
    // Update item
    const update = db.prepare('UPDATE items SET name = ? WHERE id = ?');
    update.run(name.trim(), id);
    
    // Get the updated item
    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(updatedItem);
    
  } catch (error) {
    console.error('Error updating item:', error);
    
    // Handle unique constraint violation
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Item with this name already exists' });
    }
    
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/items/:id - Delete an item
app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists
    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Delete item (CASCADE will delete associated prices)
    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    deleteStmt.run(id);
    
    res.status(204).send();
    
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ============================================
// PRICE ROUTES
// ============================================

// GET /api/items/:id/prices - Get all prices for a specific item
app.get('/api/items/:id/prices', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Get all prices for this item
    const prices = db.prepare(`
      SELECT * FROM prices 
      WHERE item_id = ? 
      ORDER BY date DESC, created_at DESC
    `).all(id);
    
    res.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// POST /api/prices - Create a new price entry
app.post('/api/prices', (req, res) => {
  try {
    const { item_id, store_name, price, date, notes } = req.body;
    
    // Validation
    if (!item_id) {
      return res.status(400).json({ error: 'Item ID is required' });
    }
    if (!store_name || typeof store_name !== 'string' || store_name.trim() === '') {
      return res.status(400).json({ error: 'Store name is required' });
    }
    if (!price || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    // Check if item exists
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(item_id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Insert price
    const insert = db.prepare(`
      INSERT INTO prices (item_id, store_name, price, date, notes) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insert.run(
      item_id,
      store_name.trim(),
      price,
      date,
      notes ? notes.trim() : null
    );
    
    // Get the created price
    const newPrice = db.prepare('SELECT * FROM prices WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newPrice);
    
  } catch (error) {
    console.error('Error creating price:', error);
    res.status(500).json({ error: 'Failed to create price' });
  }
});

// GET /api/prices/:id - Get a single price entry
app.get('/api/prices/:id', (req, res) => {
  try {
    const { id } = req.params;
    const price = db.prepare('SELECT * FROM prices WHERE id = ?').get(id);
    
    if (!price) {
      return res.status(404).json({ error: 'Price not found' });
    }
    
    res.json(price);
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// PUT /api/prices/:id - Update a price entry
app.put('/api/prices/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { store_name, price, date, notes } = req.body;
    
    // Check if price exists
    const existingPrice = db.prepare('SELECT * FROM prices WHERE id = ?').get(id);
    if (!existingPrice) {
      return res.status(404).json({ error: 'Price not found' });
    }
    
    // Validation
    if (!store_name || typeof store_name !== 'string' || store_name.trim() === '') {
      return res.status(400).json({ error: 'Store name is required' });
    }
    if (!price || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    // Update price
    const update = db.prepare(`
      UPDATE prices 
      SET store_name = ?, price = ?, date = ?, notes = ? 
      WHERE id = ?
    `);
    update.run(
      store_name.trim(),
      price,
      date,
      notes ? notes.trim() : null,
      id
    );
    
    // Get the updated price
    const updatedPrice = db.prepare('SELECT * FROM prices WHERE id = ?').get(id);
    res.json(updatedPrice);
    
  } catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

// DELETE /api/prices/:id - Delete a price entry
app.delete('/api/prices/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if price exists
    const existingPrice = db.prepare('SELECT * FROM prices WHERE id = ?').get(id);
    if (!existingPrice) {
      return res.status(404).json({ error: 'Price not found' });
    }
    
    // Delete price
    const deleteStmt = db.prepare('DELETE FROM prices WHERE id = ?');
    deleteStmt.run(id);
    
    res.status(204).send();
    
  } catch (error) {
    console.error('Error deleting price:', error);
    res.status(500).json({ error: 'Failed to delete price' });
  }
});

module.exports = { app, db };