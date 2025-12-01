# 🏢 Multi-Store HQ Management System - Complete Implementation Guide

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Connecting Stores](#connecting-stores)
7. [Running the System](#running-the-system)
8. [API Documentation](#api-documentation)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

This HQ Management System provides centralized control and monitoring for multiple retail stores. It safely integrates with existing POS systems without modifying their databases.

### **Key Features**

✅ **Multi-Store Dashboard** - Real-time monitoring of all stores
✅ **Safe Sync System** - Queue-based synchronization with automatic retries
✅ **Centralized Inventory** - View and manage inventory across all stores
✅ **Price Control** - Push price updates to selected stores
✅ **Transfer Management** - Inter-store inventory transfers with approval workflow
✅ **Employee Management** - Consolidated employee data across stores
✅ **Advanced Analytics** - Cross-store reports and KPIs
✅ **Real-time Events** - WebSocket-based live updates
✅ **Role-Based Access** - Owner, HQ Admin, Regional Manager, etc.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HQ MANAGEMENT SYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (React + Vite + Tailwind)                         │
│  ├─ HQ Dashboard                                            │
│  ├─ Multi-Store Analytics                                   │
│  ├─ Inventory Management                                    │
│  ├─ Transfer System                                         │
│  └─ Admin Panel                                             │
│                                                               │
│  Backend (Node.js + Express + Prisma + PostgreSQL)          │
│  ├─ REST API (JWT Auth, RBAC)                              │
│  ├─ WebSocket Server (Real-time events)                     │
│  ├─ Queue System (BullMQ + Redis)                           │
│  └─ Background Workers                                       │
│                                                               │
│  Sync Agents (Per Store)                                    │
│  ├─ Supabase Connector                                      │
│  ├─ eSaletab Connector                                      │
│  └─ Custom API Connector                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
               ↓           ↓           ↓
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Store 1  │ │ Store 2  │ │ Store 3  │
        │(Supabase)│ │(Supabase)│ │(eSaletab)│
        └──────────┘ └──────────┘ └──────────┘
```

---

## 🚀 Installation & Setup

### **Prerequisites**

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Redis 6+
- Git

### **Step 1: Clone the Repository**

```bash
cd AI-Retail-POS-System
```

### **Step 2: Install Backend Dependencies**

```bash
cd hq-backend
npm install
```

### **Step 3: Set Up Environment Variables**

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/retail_hq"

# JWT Secrets
JWT_SECRET="your-super-secret-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### **Step 4: Set Up Database**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Optional: Open Prisma Studio to view database
npm run prisma:studio
```

### **Step 5: Install Frontend Dependencies**

```bash
cd ..  # Back to root
npm install
```

---

## 🔧 Backend Setup

### **Database Schema**

The HQ database includes:

- **Users & Authentication** (JWT-based, role-based access)
- **Stores** (Multi-store configuration)
- **Products** (Centralized product catalog)
- **Inventory** (Stock levels per store)
- **Sales** (Synced transaction data)
- **Transfers** (Inter-store transfers with approval)
- **Employees** (Consolidated employee data)
- **Promotions** (Push promotions to stores)
- **Sync Logs** (Track all sync operations)
- **Alerts & Notifications**

### **API Structure**

```
/api/v1
├── /auth          # Authentication endpoints
├── /users         # User management
├── /stores        # Store CRUD and configuration
├── /products      # Product management
├── /inventory     # Inventory viewing and transfers
├── /sales         # Sales data (read-only, synced)
├── /transfers     # Inter-store transfers
├── /employees     # Employee management
├── /promotions    # Promotion creation and push
├── /sync          # Manual sync triggers
├── /analytics     # Cross-store analytics
└── /alerts        # System alerts
```

### **Running Backend Server**

```bash
cd hq-backend

# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

The backend will start on `http://localhost:4000`

### **Running Background Workers**

Open separate terminals for workers:

```bash
# Terminal 1: Sync Worker
npm run worker:sync

# Terminal 2: Queue Worker
npm run worker:queue
```

---

## 🎨 Frontend Setup

### **Frontend Structure**

```
src/
├── components/
│   ├── hq/
│   │   ├── HQDashboard.tsx        # Main HQ dashboard
│   │   ├── MultiStoreAnalytics.tsx# Cross-store analytics
│   │   ├── StoreComparison.tsx    # Store performance comparison
│   │   ├── CentralInventory.tsx   # Centralized inventory view
│   │   ├── TransferManager.tsx    # Transfer creation/approval
│   │   └── HQAdminPanel.tsx       # HQ admin controls
│   └── [existing POS components]
├── services/
│   ├── hqApi.ts                   # HQ API client
│   ├── websocket.ts               # WebSocket client
│   └── [existing services]
└── App.tsx                        # Updated with HQ routes
```

### **Running Frontend**

```bash
# From project root
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## 🔗 Connecting Stores

### **Store 1 & 2: Supabase-Based Stores**

These are your existing stores running the Supabase POS system.

1. **Get Supabase Credentials**:
   - Supabase Project URL
   - Anon Key
   - Service Role Key (for HQ sync)

2. **Add Store via HQ Admin Panel** or API:

```bash
POST /api/v1/stores
Content-Type: application/json
Authorization: Bearer <your-token>

{
  "storeCode": "STR-001",
  "name": "Main Store",
  "type": "SUPABASE",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "phone": "+1-555-0100",
  "email": "store1@company.com",
  "apiConfig": {
    "supabaseUrl": "https://your-project.supabase.co",
    "supabaseAnonKey": "your-anon-key",
    "supabaseServiceKey": "your-service-role-key"
  },
  "syncEnabled": true,
  "syncInterval": 5
}
```

3. **Test Connection**:

```bash
POST /api/v1/stores/{storeId}/test-connection
```

4. **Trigger Initial Sync**:

```bash
POST /api/v1/sync/store/{storeId}
{
  "syncType": "full"  // products, inventory, sales, employees
}
```

### **Store 3: eSaletab POS Store**

For external eSaletab stores:

1. **Get eSaletab API Credentials**:
   - API URL
   - API Key (if available)
   - Username & Password

2. **Add Store**:

```bash
POST /api/v1/stores
{
  "storeCode": "STR-003",
  "name": "Third Store (eSaletab)",
  "type": "ESALETAB",
  "address": "789 Oak Ave",
  "city": "Chicago",
  "country": "USA",
  "phone": "+1-555-0300",
  "email": "store3@company.com",
  "apiConfig": {
    "apiUrl": "https://esaletab-store.com/api",
    "apiKey": "your-api-key",
    "username": "admin@store3.com",
    "password": "your-password"
  },
  "syncEnabled": true,
  "syncInterval": 10
}
```

3. **The HQ Sync Agent will**:
   - Authenticate with eSaletab API
   - Fetch products, inventory, sales
   - Map data to HQ format
   - Store in HQ database
   - Never modify eSaletab database directly

---

## ▶️ Running the System

### **Complete Startup (All Components)**

1. **Start PostgreSQL**:
   ```bash
   # macOS (Homebrew)
   brew services start postgresql

   # Linux
   sudo systemctl start postgresql

   # Windows
   # Use PostgreSQL service manager
   ```

2. **Start Redis**:
   ```bash
   # macOS
   brew services start redis

   # Linux
   sudo systemctl start redis

   # Windows
   # Download from https://redis.io/download
   ```

3. **Start Backend**:
   ```bash
   cd hq-backend
   npm run dev
   ```

4. **Start Workers** (separate terminals):
   ```bash
   # Terminal 2
   npm run worker:sync

   # Terminal 3
   npm run worker:queue
   ```

5. **Start Frontend**:
   ```bash
   cd ..  # Back to root
   npm run dev
   ```

6. **Access System**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - Health Check: http://localhost:4000/health
   - Prisma Studio: http://localhost:5555 (run `npm run prisma:studio`)

---

## 📚 API Documentation

### **Authentication**

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "owner@hq.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0100"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "owner@hq.com",
  "password": "securepassword"
}

Response:
{
  "status": "success",
  "data": {
    "user": { ... },
    "token": "eyJhbGc...",
    "refreshToken": "..."
  }
}
```

### **Stores**

#### List All Stores
```http
GET /api/v1/stores
Authorization: Bearer <token>
```

#### Get Store Details
```http
GET /api/v1/stores/{storeId}
Authorization: Bearer <token>
```

#### Create Store
```http
POST /api/v1/stores
Authorization: Bearer <token>
Content-Type: application/json

{
  "storeCode": "STR-001",
  "name": "Main Store",
  "type": "SUPABASE",
  ...
}
```

### **Sync Operations**

#### Trigger Manual Sync
```http
POST /api/v1/sync/store/{storeId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "syncType": "products"  // products, inventory, sales, employees, full
}
```

#### Get Sync Status
```http
GET /api/v1/sync/store/{storeId}/status
Authorization: Bearer <token>
```

### **Products**

#### Get All Products (Across All Stores)
```http
GET /api/v1/products?storeId={storeId}&category={category}
Authorization: Bearer <token>
```

#### Create Central Product
```http
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "PRD-001",
  "name": "Product Name",
  "category": "Electronics",
  "costPrice": 50,
  "sellingPrice": 100,
  ...
}
```

#### Push Product to Stores
```http
POST /api/v1/products/{productId}/push
Authorization: Bearer <token>
Content-Type: application/json

{
  "storeIds": ["store-id-1", "store-id-2"]
}
```

### **Price Updates**

#### Push Price Update
```http
POST /api/v1/products/price-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "updates": [
    {
      "sku": "PRD-001",
      "newPrice": 120,
      "effectiveDate": "2025-12-15T00:00:00Z"
    }
  ],
  "storeIds": ["all"]  // or specific store IDs
}
```

### **Transfers**

#### Create Transfer Request
```http
POST /api/v1/transfers
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromStoreId": "store-001",
  "toStoreId": "store-002",
  "items": [
    {
      "productId": "product-id",
      "quantity": 10
    }
  ],
  "notes": "Seasonal restock"
}
```

#### Approve Transfer
```http
POST /api/v1/transfers/{transferId}/approve
Authorization: Bearer <token>
```

---

## 🚢 Deployment

### **Backend Deployment (Docker + PM2)**

1. **Create Dockerfile** (already in `hq-backend/Dockerfile`):

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

2. **Build and Run**:

```bash
# Build Docker image
docker build -t hq-backend .

# Run container
docker run -d \
  -p 4000:4000 \
  --env-file .env \
  --name hq-backend \
  hq-backend

# Or use docker-compose (see docker-compose.yml)
docker-compose up -d
```

3. **Using PM2 (Alternative)**:

```bash
npm install -g pm2
pm2 start dist/server.js --name hq-backend
pm2 start dist/workers/syncWorker.js --name sync-worker
pm2 save
pm2 startup
```

### **Frontend Deployment**

```bash
# Build frontend
npm run build

# Deploy to Vercel/Netlify/etc.
# Or serve with nginx
```

---

## 🔍 Troubleshooting

### **Common Issues**

#### 1. **Database Connection Failed**

```
Solution:
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: createdb retail_hq
- Run migrations: npm run prisma:migrate
```

#### 2. **Redis Connection Error**

```
Solution:
- Start Redis: brew services start redis (macOS)
- Check REDIS_HOST and REDIS_PORT in .env
- Test connection: redis-cli ping
```

#### 3. **Sync Job Failing**

```
Solution:
- Check store API credentials in database
- View sync logs: GET /api/v1/sync/logs?storeId=...
- Check worker logs
- Retry manually: POST /api/v1/sync/store/{storeId}
```

#### 4. **WebSocket Not Connecting**

```
Solution:
- Check CORS settings in .env
- Ensure WebSocket port is accessible
- Check browser console for errors
- Verify JWT token is valid
```

### **Logs**

```bash
# Backend logs
cd hq-backend
tail -f logs/combined.log
tail -f logs/error.log

# Worker logs
pm2 logs sync-worker

# Database logs
tail -f /usr/local/var/log/postgres.log  # macOS
```

---

## 📊 System Monitoring

### **Queue Dashboard**

Access BullMQ dashboard:

```bash
npx bull-board
# Visit http://localhost:3000
```

### **Database Management**

```bash
npm run prisma:studio
# Visit http://localhost:5555
```

### **Health Checks**

```bash
# Backend health
curl http://localhost:4000/health

# Queue stats
curl http://localhost:4000/api/v1/sync/queue-stats
```

---

## 🎉 You're All Set!

Your Multi-Store HQ Management System is now ready. Here's what you can do:

1. ✅ Log in to HQ Dashboard
2. ✅ Add your 3 stores
3. ✅ Trigger initial sync
4. ✅ Monitor real-time data
5. ✅ Create price updates
6. ✅ Manage inventory transfers
7. ✅ View cross-store analytics
8. ✅ Configure promotions

**Need Help?**

- Check the logs in `hq-backend/logs/`
- Review sync status in HQ Admin Panel
- Test store connections individually
- Contact support or open an issue

---

**Built with ❤️ for Multi-Store Retail Management**
