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

## Out of Scope (Future Enhancements)
- Receipt photo upload with OCR
- Barcode scanning
- Shopping list generation
- Budget tracking
- Price alerts/notifications
- Multi-user support / user accounts
- Mobile app
- Store location/distance integration

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
