import React, { useState, useEffect, useRef } from 'react';
import './Autocomplete.css';

/**
 * Autocomplete Component
 * Provides search suggestions from product database APIs
 */
function Autocomplete({ 
  value, 
  onChange, 
  onSelect,
  placeholder = "Search products...",
  minChars = 2,
  debounceMs = 300
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);
  
  const wrapperRef = useRef(null);
  const debounceTimer = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions when value changes
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Reset state
    setSelectedIndex(-1);
    setError(null);

    // Don't search if input is too short
    if (!value || value.trim().length < minChars) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce the search
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value.trim());
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, minChars, debounceMs]);

  const fetchSuggestions = async (query) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.products || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to load suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    onSelect(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      
      default:
        break;
    }
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <div className="autocomplete-input-container">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="autocomplete-input"
        />
        {isLoading && (
          <div className="autocomplete-loading">
            <span className="loading-spinner">⏳</span>
          </div>
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || error) && (
        <div className="autocomplete-suggestions">
          {error ? (
            <div className="autocomplete-error">{error}</div>
          ) : (
            <>
              <div className="autocomplete-header">
                {suggestions.length} suggestions from product database
              </div>
              <ul className="autocomplete-list">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={`${suggestion.source}-${suggestion.id}`}
                    className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="suggestion-content">
                      {suggestion.image_url && (
                        <img 
                          src={suggestion.image_url} 
                          alt={suggestion.name}
                          className="suggestion-image"
                        />
                      )}
                      <div className="suggestion-details">
                        <div className="suggestion-name">{suggestion.name}</div>
                        {suggestion.brand && (
                          <div className="suggestion-brand">{suggestion.brand}</div>
                        )}
                        <div className="suggestion-source">
                          from {suggestion.source}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Autocomplete;
