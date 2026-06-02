import React, { useState, useEffect } from 'react';
import './App.css';
import Autocomplete from './components/Autocomplete';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for items
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');

  // Price state
  const [selectedItemForPrice, setSelectedItemForPrice] = useState(null);
  const [prices, setPrices] = useState({});
  const [showPriceForm, setShowPriceForm] = useState(null);
  const [priceFormData, setPriceFormData] = useState({
    store_name: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricesForItem = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}/prices`);
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      const data = await response.json();
      setPrices(prev => ({ ...prev, [itemId]: data }));
    } catch (err) {
      console.error('Error fetching prices:', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItemName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item');
      }

      const newItem = await response.json();
      setItems([...items, newItem]);
      setNewItemName('');
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error adding item:', err);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item.id);
    setEditName(item.name);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName('');
  };

  const handleUpdateItem = async (id) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }

      const updatedItem = await response.json();
      setItems(items.map(item => item.id === id ? updatedItem : item));
      setEditingItem(null);
      setEditName('');
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error updating item:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item and all its prices?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(items.filter(item => item.id !== id));
      setPrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[id];
        return newPrices;
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting item:', err);
    }
  };

  const handleViewPrices = async (itemId) => {
    if (selectedItemForPrice === itemId) {
      setSelectedItemForPrice(null);
    } else {
      setSelectedItemForPrice(itemId);
      if (!prices[itemId]) {
        await fetchPricesForItem(itemId);
      }
    }
  };

  const handleAddPriceClick = (itemId) => {
    setShowPriceForm(itemId);
    setPriceFormData({
      store_name: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handlePriceFormChange = (field, value) => {
    setPriceFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitPrice = async (e, itemId) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          store_name: priceFormData.store_name,
          price: parseFloat(priceFormData.price),
          date: priceFormData.date,
          notes: priceFormData.notes || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add price');
      }

      await fetchPricesForItem(itemId);
      setShowPriceForm(null);
      setPriceFormData({
        store_name: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error adding price:', err);
    }
  };

  const handleDeletePrice = async (priceId, itemId) => {
    if (!window.confirm('Are you sure you want to delete this price entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/prices/${priceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete price');
      }

      await fetchPricesForItem(itemId);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting price:', err);
    }
  };

  const getPriceClass = (price, allPrices) => {
    if (!allPrices || allPrices.length === 0) return '';
    
    const prices = allPrices.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (price === minPrice) return 'price-lowest';
    if (price === maxPrice && prices.length > 1) return 'price-highest';
    return 'price-medium';
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleProductSelect = (product) => {
    // When user selects a product from autocomplete, set it as the item name
    setNewItemName(product.name);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🛒 Grocery Price Tracker</h1>
        <p>Track and compare prices across stores</p>
      </header>
      
      <main>
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <section className="add-item-section">
          <h2>Add New Item</h2>
          <form onSubmit={handleAddItem}>
            <div className="form-group">
              <Autocomplete
                value={newItemName}
                onChange={setNewItemName}
                onSelect={handleProductSelect}
                placeholder="Start typing to search products... (e.g., Organic Milk)"
                minChars={2}
                debounceMs={300}
              />
            </div>
            <button type="submit" className="btn-primary">Add Item</button>
          </form>
          <p className="help-text">
            💡 Start typing to see product suggestions from our database, or enter any item name manually.
          </p>
        </section>

        <section className="items-section">
          <h2>Your Items</h2>
          {loading ? (
            <p className="loading">Loading items...</p>
          ) : items.length === 0 ? (
            <p className="empty-state">No items yet. Add your first grocery item above!</p>
          ) : (
            <ul className="items-list">
              {items.map((item) => (
                <li key={item.id} className="item-card">
                  {editingItem === item.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Item name"
                      />
                      <div className="edit-actions">
                        <button
                          onClick={() => handleUpdateItem(item.id)}
                          className="btn-primary btn-small"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-secondary btn-small"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="item-content">
                        <div className="item-info">
                          <h3>{item.name}</h3>
                        </div>
                        <div className="item-actions">
                          <button
                            onClick={() => handleViewPrices(item.id)}
                            className="btn-secondary btn-small"
                          >
                            {selectedItemForPrice === item.id ? 'Hide Prices' : 'View Prices'}
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="btn-secondary btn-small"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="btn-danger btn-small"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {selectedItemForPrice === item.id && (
                        <div className="prices-section">
                          <div className="prices-header">
                            <h4>Price History</h4>
                            <button
                              onClick={() => handleAddPriceClick(item.id)}
                              className="btn-primary btn-small"
                            >
                              + Add Price
                            </button>
                          </div>

                          {showPriceForm === item.id && (
                            <form onSubmit={(e) => handleSubmitPrice(e, item.id)} className="price-form">
                              <div className="price-form-grid">
                                <input
                                  type="text"
                                  placeholder="Store name"
                                  value={priceFormData.store_name}
                                  onChange={(e) => handlePriceFormChange('store_name', e.target.value)}
                                  required
                                />
                                <input
                                  type="number"
                                  placeholder="Price"
                                  step="0.01"
                                  min="0"
                                  value={priceFormData.price}
                                  onChange={(e) => handlePriceFormChange('price', e.target.value)}
                                  required
                                />
                                <input
                                  type="date"
                                  value={priceFormData.date}
                                  onChange={(e) => handlePriceFormChange('date', e.target.value)}
                                  required
                                />
                                <input
                                  type="text"
                                  placeholder="Notes (optional)"
                                  value={priceFormData.notes}
                                  onChange={(e) => handlePriceFormChange('notes', e.target.value)}
                                />
                              </div>
                              <div className="price-form-actions">
                                <button type="submit" className="btn-primary btn-small">
                                  Save Price
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowPriceForm(null)}
                                  className="btn-secondary btn-small"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}

                          {prices[item.id] && prices[item.id].length > 0 ? (
                            <div className="prices-list">
                              {prices[item.id].map((price) => (
                                <div
                                  key={price.id}
                                  className={`price-card ${getPriceClass(price.price, prices[item.id])}`}
                                >
                                  <div className="price-info">
                                    <div className="price-store">{price.store_name}</div>
                                    <div className="price-amount">{formatPrice(price.price)}</div>
                                    <div className="price-date">{formatDate(price.date)}</div>
                                    {price.notes && <div className="price-notes">{price.notes}</div>}
                                  </div>
                                  <button
                                    onClick={() => handleDeletePrice(price.id, item.id)}
                                    className="btn-danger btn-small"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="empty-prices">
                              No prices logged yet. Click "Add Price" to start tracking!
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;