# Cloud Architecture Overview - Grocery Price Tracker

**Project:** Grocery Price Comparison Tracker  
**Architecture Type:** Monorepo Web Application  
**Last Updated:** June 1, 2026

---

## System Context Diagram

```mermaid
graph TB
    subgraph "User Devices"
        Browser[Web Browser<br/>Desktop/Mobile/Tablet]
    end
    
    subgraph "Monorepo: capstone_v1"
        subgraph "Frontend Package"
            React[React Application<br/>Port 3000<br/>- Components<br/>- State Management<br/>- UI Logic]
        end
        
        subgraph "Backend Package"
            Express[Express API Server<br/>Port 3030<br/>- REST Endpoints<br/>- Business Logic<br/>- Validation]
            DB[(SQLite In-Memory<br/>Database<br/>- Items Table<br/>- Prices Table)]
        end
    end
    
    Browser -->|HTTP Requests| React
    React -->|Proxy: /api/*| Express
    Express -->|SQL Queries| DB
    DB -->|Query Results| Express
    Express -->|JSON Response| React
    React -->|Rendered HTML/CSS| Browser
    
    classDef frontend fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    classDef backend fill:#dcfce7,stroke:#22c55e,stroke-width:2px
    classDef database fill:#fef3c7,stroke:#eab308,stroke-width:2px
    classDef user fill:#f3f4f6,stroke:#6b7280,stroke-width:2px
    
    class React frontend
    class Express backend
    class DB database
    class Browser user
```

---

## Architecture Components

### 1. Frontend (React Application)
- **Technology:** React 18.2.0
- **Development Port:** 3000
- **Build Tool:** React Scripts 5.0.1
- **Location:** `packages/frontend/`

**Responsibilities:**
- User interface rendering
- Client-side state management
- Form validation
- API communication via fetch
- Responsive design implementation

**Key Features:**
- Item management UI (add, edit, delete)
- Price tracking forms
- Price comparison display with color coding
- Mobile-responsive design

---

### 2. Backend (Express API Server)
- **Technology:** Node.js with Express 4.18.2
- **Development Port:** 3030
- **Location:** `packages/backend/`

**Responsibilities:**
- RESTful API endpoints
- Business logic processing
- Input validation and sanitization
- Database operations
- Error handling and logging

**API Endpoints:**
```
Items:
- GET    /api/items       - List all items
- POST   /api/items       - Create item
- GET    /api/items/:id   - Get single item
- PUT    /api/items/:id   - Update item
- DELETE /api/items/:id   - Delete item

Prices:
- GET    /api/items/:id/prices - List prices for item
- POST   /api/prices           - Create price entry
- GET    /api/prices/:id       - Get single price
- PUT    /api/prices/:id       - Update price
- DELETE /api/prices/:id       - Delete price
```

**Middleware:**
- CORS (Cross-Origin Resource Sharing)
- Express JSON body parser
- Morgan (HTTP request logging)

---

### 3. Database (SQLite In-Memory)
- **Technology:** better-sqlite3 11.10.0
- **Type:** In-memory (data resets on server restart)
- **Location:** Backend process memory

**Schema:**

```sql
-- Items Table
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prices Table
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

**Characteristics:**
- Lightweight and fast
- No external database server required
- Suitable for MVP/development
- Data is volatile (resets on restart)

---

## Data Flow

### User Journey: Creating a Grocery Item Tracker

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant React
    participant Express
    participant SQLite

    Note over User,SQLite: Step 1: User opens the app
    User->>Browser: Navigate to localhost:3000
    Browser->>React: Request application
    React->>Browser: Load Grocery Price Tracker UI
    Browser->>User: Display empty item list

    Note over User,SQLite: Step 2: User adds a new grocery item
    User->>Browser: Types "Organic Milk"<br/>Clicks "Add Item"
    Browser->>React: Form submit event
    React->>React: Validate input (not empty)
    React->>Express: POST /api/items<br/>{name: "Organic Milk"}
    Express->>Express: Validate item name
    Express->>SQLite: INSERT INTO items (name)<br/>VALUES ('Organic Milk')
    SQLite->>Express: Return new item<br/>{id: 1, name: "Organic Milk"}
    Express->>React: 201 Created<br/>+ item JSON
    React->>React: Update items state
    React->>Browser: Re-render item list
    Browser->>User: Show "Organic Milk" in list

    Note over User,SQLite: Step 3: User adds first price entry
    User->>Browser: Clicks "View Prices"<br/>Clicks "+ Add Price"
    Browser->>React: Show price form
    React->>Browser: Display form fields
    User->>Browser: Fills form:<br/>- Store: "Whole Foods"<br/>- Price: 5.99<br/>- Date: 2026-06-01
    Browser->>React: Form submit
    React->>Express: POST /api/prices<br/>{item_id: 1, store_name: "Whole Foods",<br/>price: 5.99, date: "2026-06-01"}
    Express->>Express: Validate all fields
    Express->>SQLite: INSERT INTO prices<br/>(item_id, store_name, price, date)
    SQLite->>Express: Return new price record
    Express->>React: 201 Created + price JSON
    React->>React: Fetch updated prices
    React->>Express: GET /api/items/1/prices
    Express->>SQLite: SELECT * FROM prices<br/>WHERE item_id = 1
    SQLite->>Express: Return [price record]
    Express->>React: 200 OK + prices array
    React->>React: Calculate price class<br/>(only 1 price = lowest)
    React->>Browser: Render green price card
    Browser->>User: Show price $5.99<br/>in green (best price)

    Note over User,SQLite: Step 4: User adds second price for comparison
    User->>Browser: Clicks "+ Add Price" again
    User->>Browser: Fills form:<br/>- Store: "Trader Joe's"<br/>- Price: 4.99<br/>- Date: 2026-06-01
    Browser->>React: Form submit
    React->>Express: POST /api/prices<br/>{item_id: 1, store_name: "Trader Joe's",<br/>price: 4.99, date: "2026-06-01"}
    Express->>SQLite: INSERT INTO prices
    SQLite->>Express: Return new price
    Express->>React: 201 Created
    React->>Express: GET /api/items/1/prices
    Express->>SQLite: SELECT * FROM prices
    SQLite->>Express: Return [2 price records]
    Express->>React: 200 OK + prices array
    React->>React: Calculate:<br/>- min: $4.99 (Trader Joe's)<br/>- max: $5.99 (Whole Foods)
    React->>Browser: Re-render price comparison:<br/>- Trader Joe's: GREEN 🏆<br/>- Whole Foods: RED
    Browser->>User: Display color-coded prices<br/>showing best deal clearly

    Note over User,SQLite: ✅ Complete! User can now track prices<br/>and see which store has the best deal
```

### Adding a Price Entry

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant React
    participant Express
    participant SQLite

    User->>Browser: Fills price form<br/>(store, price, date)
    Browser->>React: Form submit event
    React->>React: Validate input
    React->>Express: POST /api/prices<br/>{item_id, store_name, price, date}
    Express->>Express: Validate data
    Express->>SQLite: INSERT INTO prices
    SQLite->>Express: Return new price record
    Express->>React: 201 Created + price JSON
    React->>React: Update state
    React->>Browser: Re-render UI
    Browser->>User: Show updated price list
```

### Viewing Price Comparison

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant React
    participant Express
    participant SQLite

    User->>Browser: Clicks "View Prices"
    Browser->>React: Click event
    React->>Express: GET /api/items/{id}/prices
    Express->>SQLite: SELECT * FROM prices WHERE item_id = ?
    SQLite->>Express: Return price records
    Express->>React: 200 OK + prices JSON
    React->>React: Calculate min/max prices<br/>Apply color coding
    React->>Browser: Render price cards
    Browser->>User: Display color-coded prices
```

---

## Development Environment

### Local Development Setup

```mermaid
graph LR
    subgraph "Terminal 1"
        BStart[npm start<br/>Backend on :3030]
    end
    
    subgraph "Terminal 2"
        FStart[npm start<br/>Frontend on :3000]
    end
    
    subgraph "Browser"
        App[localhost:3000<br/>React App]
    end
    
    BStart -.Running.- Backend[Backend Server]
    FStart -.Running.- Frontend[Frontend Dev Server]
    Frontend -->|Proxy /api/*| Backend
    App --> Frontend
    
    classDef terminal fill:#1e293b,stroke:#64748b,color:#fff
    classDef server fill:#0ea5e9,stroke:#0284c7,color:#fff
    
    class BStart,FStart terminal
    class Backend,Frontend server
```

**Development Commands:**
```bash
# Backend
cd packages/backend
npm start              # Start with nodemon (auto-reload)
npm test              # Run tests

# Frontend  
cd packages/frontend
npm start              # Start development server
npm test              # Run tests
npm run build         # Production build
```

---

## Network Configuration

### Port Assignments
- **Frontend Development Server:** 3000
- **Backend API Server:** 3030
- **Proxy Configuration:** Frontend proxies `/api/*` requests to backend

### CORS Policy
```javascript
// Backend allows all origins in development
app.use(cors());
```

---

## Current Limitations (MVP)

1. **Data Persistence:** In-memory database - data lost on server restart
2. **Authentication:** No user accounts or authentication
3. **Scalability:** Single-instance application
4. **State Management:** Client-side state only (no Redux/Context)
5. **File Storage:** No image/file upload capability
6. **Deployment:** Not production-ready (development configuration)

---

## Future Architecture Considerations

### Post-MVP Enhancements

```mermaid
graph TB
    subgraph "Future: Production Architecture"
        LB[Load Balancer]
        
        subgraph "Static Hosting"
            CDN[CDN/Static Site<br/>React Build]
        end
        
        subgraph "API Layer"
            API1[Express API<br/>Instance 1]
            API2[Express API<br/>Instance 2]
        end
        
        subgraph "Data Layer"
            DB[(PostgreSQL<br/>Persistent DB)]
            Cache[(Redis<br/>Session Cache)]
            S3[S3/Cloud Storage<br/>Receipt Images]
        end
        
        subgraph "Auth"
            Auth[Auth Service<br/>JWT Tokens]
        end
    end
    
    Users[Users] --> LB
    LB --> CDN
    LB --> API1
    LB --> API2
    API1 --> DB
    API2 --> DB
    API1 --> Cache
    API2 --> Cache
    API1 --> S3
    API2 --> Auth
```

**Planned Improvements:**
- Persistent database (PostgreSQL)
- User authentication (JWT)
- Cloud storage for receipt images
- API caching layer (Redis)
- Container deployment (Docker)
- CI/CD pipeline
- Multiple environment support (dev/staging/prod)

---

## Security Considerations

### Current Implementation (MVP)
- ✅ Prepared SQL statements (prevents SQL injection)
- ✅ Input validation on backend
- ✅ CORS enabled
- ✅ Error messages don't expose sensitive data
- ⚠️ No authentication/authorization
- ⚠️ No HTTPS (development only)
- ⚠️ No rate limiting
- ⚠️ No data encryption

### Required for Production
- [ ] HTTPS/TLS encryption
- [ ] User authentication
- [ ] Authorization/access control
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Security headers
- [ ] Environment variable management
- [ ] Audit logging

---

## Performance Characteristics

### Current Performance (MVP)
- **Page Load:** < 3 seconds (development)
- **API Response Time:** < 100ms (in-memory DB)
- **Database Queries:** No indexes (small dataset)
- **Frontend Bundle:** ~200KB (unoptimized)

### Optimization Opportunities
- Production build minification
- Code splitting
- Image optimization
- Database indexing
- API response caching
- Service worker for offline support

---

## Monitoring and Observability

### Current Logging (MVP)
```javascript
// Backend: Morgan HTTP logging
app.use(morgan('dev'));

// Console logging for errors
console.error('Error message', error);
```

### Future Monitoring Needs
- Application Performance Monitoring (APM)
- Error tracking (Sentry, Rollbar)
- Analytics (Google Analytics, Mixpanel)
- Server monitoring (CPU, memory, disk)
- API endpoint metrics
- User behavior tracking

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | React | 18.2.0 | UI rendering |
| Frontend Build | React Scripts | 5.0.1 | Development/build |
| Backend Framework | Express | 4.18.2 | API server |
| Runtime | Node.js | Latest LTS | JavaScript runtime |
| Database | SQLite (better-sqlite3) | 11.10.0 | Data storage |
| HTTP Client | Fetch API | Native | API calls |
| Logging | Morgan | 1.10.0 | Request logging |
| Testing (Frontend) | Jest + React Testing Library | 29.7.0 | Unit/integration tests |
| Testing (Backend) | Jest + Supertest | 29.7.0 | API tests |

---

## Deployment Considerations

### Development Environment (Current)
```
Local Machine
├── Backend: localhost:3030
├── Frontend: localhost:3000
└── Database: In-memory
```

### Production Environment (Future)
```
Cloud Provider (AWS/Azure/GCP/Vercel)
├── Frontend: Static hosting (S3, Netlify, Vercel)
├── Backend: Container service (ECS, Cloud Run)
└── Database: Managed database (RDS, Cloud SQL)
```

---

## Related Documentation

- [Functional Requirements](functional-requirements.md)
- [PRD with TODO List](prd-todo.md)
- [Epics and Stories](epics-and-stories.md)
- [Coding Guidelines](coding-guidelines.md)
- [UI Guidelines](ui-guidelines.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 1, 2026 | Initial architecture documentation for MVP |
