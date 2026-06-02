# Functional Requirements - Grocery Price Comparison Tracker

## Overview
A web application that helps users track and compare grocery prices across different stores to find the best deals on items they buy regularly.

## Core Features

### 1. Item Management
- **FR-1.1**: User can add a new grocery item with a name
- **FR-1.2**: User can view a list of all their tracked items
- **FR-1.3**: User can edit an existing item's name
- **FR-1.4**: User can delete an item (and all associated price records)

### 2. Price Logging
- **FR-2.1**: User can log a price for an item by entering:
  - Store name
  - Price (dollar amount)
  - Date of purchase
  - Optional notes
- **FR-2.2**: User can view all price records for a specific item
- **FR-2.3**: User can edit a price record
- **FR-2.4**: User can delete a price record

### 3. Price Comparison
- **FR-3.1**: For each item, user can see all logged prices sorted by store
- **FR-3.2**: System highlights the lowest price for each item
- **FR-3.3**: User can see price history over time for an item at each store
- **FR-3.4**: System shows which store currently has the best price

### 4. Dashboard / Best Deals View
- **FR-4.1**: User can see a summary view of all tracked items
- **FR-4.2**: For each item, display the current best price and which store offers it
- **FR-4.3**: Visual indicators (colors) show price differences:
  - Green: Best/lowest price
  - Red: Highest price
  - Yellow/Orange: Mid-range prices

## User Stories

### As a grocery shopper, I want to:
1. Track items I buy regularly so I can compare prices across stores
2. Log prices when I shop so I remember what I paid
3. See which store has the best price for each item so I can save money
4. View price trends over time to know if prices are going up or down
5. Quickly add new items and prices with minimal typing

## Implementation Phases

### Phase 1: Manual Entry (MVP - Current Scope)
- **FR-5.1**: Users manually enter all item names and price data
- **FR-5.2**: Simple text input for item creation
- **FR-5.3**: Manual data entry for all store prices

**Rationale:** Most reliable, works with any store, legal and compliant, focuses on core value proposition.

### Phase 2: Product Database Integration (Future)
- **FR-6.1**: Integration with Open Food Facts API for product autocomplete
- **FR-6.2**: Barcode scanning to auto-populate item details
- **FR-6.3**: Product images and metadata from external database
- **FR-6.4**: Consistent product naming across entries
- **FR-6.5**: Model Context Protocol (MCP) server for API integration

**Benefits:**
- Better UX with autocomplete (less typing)
- Barcode support for mobile app
- Consistent product identification
- Still flexible pricing (manual per store)

**Note:** Major grocery chains (Costco, Trader Joe's, Walmart, Target, Kroger) do not offer public APIs for pricing data. Product databases provide item information only, not store-specific prices.

### Phase 3: Receipt Scanning (Future)
- **FR-7.1**: Upload receipt photos
- **FR-7.2**: OCR extraction of items and prices
- **FR-7.3**: Manual verification/correction workflow
- **FR-7.4**: Batch price entry from receipt

**Technology Options:**
- Google Cloud Vision API
- AWS Textract
- Open-source Tesseract OCR

## Out of Scope (Future Enhancements)
- Shopping list generation
- Budget tracking
- Price alerts/notifications
- Multi-user support / user accounts
- Native mobile app
- Store location/distance integration
- Community-shared pricing data
- Price prediction/trend forecasting

## Technical Requirements
- React frontend with responsive design
- Node.js/Express backend with RESTful API
- SQLite database (in-memory for development)
- CRUD operations for items and prices
- Data validation on both frontend and backend

## Success Criteria
- User can add at least 5 items and 3 prices per item
- Price comparison view clearly shows the best deal
- All CRUD operations work correctly
- Application is responsive and user-friendly
- No data loss during typical usage
