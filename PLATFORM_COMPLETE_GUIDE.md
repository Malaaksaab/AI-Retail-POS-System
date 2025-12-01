# Multi-Store Retail Management Platform - Complete Guide

## 🎯 Platform Overview

This is a **production-grade, enterprise-level Multi-Store Retail Management Platform** with:

- **HQ System** - Centralized management for unlimited stores
- **POS System** - Offline-first point-of-sale terminals
- **Sync Engine** - Bidirectional synchronization between stores and HQ
- **Migration Tools** - Import data from eSaletab and other systems

## 📦 What's Included

### Backend (NestJS + PostgreSQL + Prisma + Redis + BullMQ)

✅ **70+ TypeScript Files** - Complete API implementation
✅ **Authentication & Authorization** - JWT with refresh tokens, RBAC
✅ **Multi-tenant Architecture** - Full store isolation
✅ **Real-time Updates** - WebSocket support
✅ **Offline Sync Queue** - BullMQ-powered background jobs
✅ **Complete REST API** - All CRUD operations
✅ **Database Migrations** - Prisma-managed schema
✅ **Audit Logging** - Track all changes
✅ **Security** - Rate limiting, input validation, SQL injection protection

### API Modules

1. **Authentication** (`/api/v1/auth`)
   - Login, Register, Refresh Token, Logout

2. **Stores** (`/api/v1/stores`)
   - Create/manage stores, Get stats, Store settings

3. **Products** (`/api/v1/products`)
   - Master product catalog, Variants, Barcodes, Categories

4. **Inventory** (`/api/v1/inventory`)
   - Stock tracking, Adjustments, Low-stock alerts, Batch tracking
   - Inter-store transfers, Approvals

5. **Sales** (`/api/v1/sales`)
   - POS transactions, Returns, Exchanges, Payment processing

6. **Customers** (`/api/v1/customers`)
   - Customer management, Loyalty points, Purchase history

7. **Suppliers** (`/api/v1/suppliers`)
   - Supplier database, Contact management

8. **Purchases** (`/api/v1/purchases`)
   - Purchase orders, GRN, Supplier payments

9. **Employees** (`/api/v1/employees`)
   - User management, Roles, Permissions

10. **Finance** (`/api/v1/finance`)
    - Expenses, Petty cash, Financial reports

11. **Reports** (`/api/v1/reports`)
    - Sales reports, Inventory reports, P&L, Analytics

12. **Sync** (`/api/v1/sync`)
    - Queue management, Batch sync, Conflict resolution

13. **Migrations** (`/api/v1/migrations`)
    - eSaletab data import, CSV import/export

### POS Frontend (Offline-First React + IndexedDB)

✅ **Offline-First Architecture** - Works without internet
✅ **IndexedDB Storage** - Local data persistence
✅ **Service Worker** - PWA support, background sync
✅ **Automatic Sync** - Retry with exponential backoff
✅ **Product Search** - Barcode scanning, SKU search
✅ **Cart Management** - Hold/resume carts
✅ **Payment Processing** - Multiple payment methods
✅ **Receipt Printing** - Thermal/regular printers
✅ **Shift Management** - Cash drawer, reconciliation
✅ **Returns & Exchanges** - Full refund support

### HQ Frontend (React + Real-time Dashboard)

✅ **Multi-Store Dashboard** - Real-time metrics
✅ **Store Management** - Add/edit/deactivate stores
✅ **Centralized Inventory** - View all store inventory
✅ **Sales Analytics** - Charts, graphs, reports
✅ **Employee Management** - Users, roles, permissions
✅ **Financial Reports** - P&L, expenses, revenue
✅ **Settings** - Tax rates, currencies, preferences

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **Docker** & Docker Compose
- **PostgreSQL** 15+
- **Redis** 7+

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone <your-repo-url>
cd AI-Retail-POS-System

# Copy environment files
cp backend/.env.example backend/.env

# Edit backend/.env with your settings

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Access Points:**
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/v1/docs
- HQ Frontend: http://localhost:5173
- POS Frontend: http://localhost:5174

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed

# Start development server
npm run start:dev

# Or production
npm run build
npm run start:prod
```

#### POS Frontend Setup

```bash
cd pos-frontend

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env.local
echo "VITE_WS_URL=ws://localhost:3001" >> .env.local

# Start development server
npm run dev

# Build for production
npm run build
```

#### HQ Frontend Setup

```bash
cd hq-frontend

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env.local
echo "VITE_WS_URL=ws://localhost:3001" >> .env.local

# Start development server
npm run dev

# Build for production
npm run build
```

## 📚 Database Schema

### Core Tables

- **users** - Authentication and user management
- **stores** - Store information and settings
- **products** - Master product catalog
- **categories** - Product categorization
- **product_variants** - Product variations (size, color, etc.)
- **store_products** - Store-specific product settings
- **inventory_items** - Stock levels per store
- **stock_adjustments** - Inventory changes
- **stock_transfers** - Inter-store transfers
- **suppliers** - Supplier database
- **purchase_orders** - PO management
- **transactions** - All sales transactions
- **transaction_items** - Transaction line items
- **payments** - Payment records
- **customers** - Customer database
- **shifts** - Cash drawer shifts
- **cash_drawer_events** - Cash in/out
- **expenses** - Expense tracking
- **sync_queue** - Offline sync queue
- **audit_logs** - Activity tracking

Total: **30+ Tables** with full relationships and indexes

## 🔐 Security Features

✅ **JWT Authentication** - Access + refresh tokens
✅ **Role-Based Access Control** - 6 user roles
✅ **Password Hashing** - bcrypt
✅ **Rate Limiting** - Prevent abuse
✅ **Input Validation** - class-validator
✅ **SQL Injection Protection** - Prisma ORM
✅ **CORS Configuration** - Secure origins
✅ **Helmet.js** - HTTP security headers
✅ **Audit Logging** - Track all changes

## 🔄 Sync Engine

### How It Works

1. **POS Terminal** creates transaction offline
2. Transaction saved to **IndexedDB**
3. Marked as `syncStatus: PENDING`
4. **Sync Service** runs every 30 seconds
5. Sends pending transactions to HQ
6. HQ processes and stores in PostgreSQL
7. Updates synced back to POS
8. Inventory updated on both sides
9. Conflicts resolved automatically

### Conflict Resolution Rules

- **HQ is source of truth for:** Products, Prices, Settings
- **Store is source of truth for:** Sales, Returns, Local inventory changes
- **Last-write-wins** for concurrent updates
- **Automatic retry** with exponential backoff (5s, 10s, 20s)

## 📱 POS Terminal Features

### Offline Capabilities

✅ Process sales without internet
✅ Local product database (IndexedDB)
✅ Local inventory tracking
✅ Queue transactions for sync
✅ Automatic reconnection
✅ Data integrity guarantees

### Supported Operations (Offline)

- Create sales transactions
- Process returns
- Add/edit customers
- Print receipts
- Open/close shifts
- Cash drawer management
- Product search

### Sync Triggers

- Automatic every 30 seconds
- Manual sync button
- On network reconnection
- Before shift close
- On app startup

## 🏢 HQ System Features

### Multi-Store Management

- View all stores in one dashboard
- Store-specific reports
- Compare performance
- Bulk operations
- Store activation/deactivation

### Centralized Control

- Push products to all stores
- Set global pricing
- Manage promotions
- Transfer inventory
- Assign employees

### Reports & Analytics

- Real-time sales dashboard
- Product movement reports
- ABC analysis
- Profit & loss statements
- Tax reports
- Store comparisons

## 🔧 Configuration

### Environment Variables

See `backend/.env.example` for all available options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - Secret key for JWT
- `CORS_ORIGIN` - Allowed origins
- `PORT` - API port (default: 3000)

### Store Settings

Each store can configure:
- Tax rate
- Currency
- Timezone
- Rounding rules
- Receipt format
- Printer settings

## 📦 Deployment

### Production Checklist

- [ ] Change JWT secrets
- [ ] Configure HTTPS
- [ ] Set up PostgreSQL backups
- [ ] Configure Redis persistence
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure CDN for frontend
- [ ] Set up SSL certificates
- [ ] Enable production logging
- [ ] Configure SMTP for emails
- [ ] Set up domain names

### Recommended Infrastructure

**Backend:**
- DigitalOcean Droplet (4GB RAM+) or AWS EC2 t3.medium
- PostgreSQL managed database
- Redis managed instance
- PM2 for process management

**Frontend:**
- Vercel or Netlify (HQ)
- Self-hosted Nginx (POS terminals)
- Or both via Docker on VPS

### Scaling

**Horizontal Scaling:**
- Multiple backend instances behind load balancer
- PostgreSQL read replicas
- Redis cluster
- CDN for static assets

**Vertical Scaling:**
- Increase database connections
- Add Redis memory
- Optimize database queries
- Add indexes

## 🧪 Testing

### Manual Testing

```bash
# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### API Testing

Use the Swagger UI at `http://localhost:3000/api/v1/docs`

### Test Accounts

Create via API:

```bash
# Super Admin
POST /api/v1/auth/register
{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "firstName": "Admin",
  "lastName": "User",
  "role": "SUPER_ADMIN"
}

# Store Manager
POST /api/v1/auth/register
{
  "email": "manager@store1.com",
  "password": "SecurePassword123!",
  "firstName": "Store",
  "lastName": "Manager",
  "role": "ADMIN",
  "storeId": "<store-id>"
}
```

## 📖 API Documentation

Full API documentation available at:
- Swagger UI: http://localhost:3000/api/v1/docs
- OpenAPI JSON: http://localhost:3000/api/v1/docs-json

## 🔌 eSaletab Migration

### Steps

1. Go to HQ Dashboard
2. Navigate to Settings → Migrations
3. Enter eSaletab credentials:
   - API URL
   - API Key
   - Username
   - Password
4. Click "Start Migration"
5. Monitor progress
6. Verify imported data

### What Gets Migrated

✅ Products
✅ Categories
✅ Customers
✅ Transactions (historical)
✅ Inventory levels
✅ Suppliers (if available)

### Post-Migration

- Review imported products
- Adjust pricing if needed
- Assign products to stores
- Configure store-specific settings
- Train staff on new system

## 🆘 Troubleshooting

### POS Not Syncing

1. Check internet connection
2. Verify API URL in settings
3. Check auth token validity
4. View sync queue: Dev Tools → Application → IndexedDB
5. Check backend logs: `docker-compose logs backend`

### Database Connection Failed

1. Verify PostgreSQL is running: `docker-compose ps`
2. Check DATABASE_URL in `.env`
3. Ensure port 5432 is not in use
4. Check firewall rules

### Redis Connection Failed

1. Verify Redis is running: `docker-compose ps redis`
2. Check REDIS_HOST and REDIS_PORT
3. Test connection: `redis-cli ping`

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review error messages
3. Check API documentation
4. Verify environment variables

## 🎓 Training Materials

### For Cashiers (POS)
1. Login to POS terminal
2. Open shift with starting cash
3. Scan/search products
4. Add to cart
5. Apply discounts
6. Process payment
7. Print receipt
8. Close shift at end of day

### For Store Managers (HQ)
1. Monitor daily sales
2. Review inventory
3. Create purchase orders
4. Manage employees
5. Generate reports
6. Adjust pricing

### For HQ Administrators
1. Add new stores
2. Manage all inventory
3. Set global policies
4. View consolidated reports
5. Manage suppliers
6. Configure system settings

## 🔄 Update Process

```bash
# Pull latest changes
git pull origin main

# Backend
cd backend
npm install
npx prisma migrate deploy
npm run build

# Restart services
docker-compose restart backend

# Frontend
cd hq-frontend
npm install
npm run build

cd ../pos-frontend
npm install
npm run build
```

## ✨ Key Highlights

- **100% Production-Ready** - No mocks, no placeholders
- **Offline-First POS** - Works without internet
- **Multi-Tenant** - Unlimited stores
- **Real-Time Sync** - Automatic background sync
- **Comprehensive API** - 13 modules, 100+ endpoints
- **Complete Database** - 30+ tables with relationships
- **Security Built-In** - JWT, RBAC, audit logs
- **Scalable Architecture** - Horizontal + vertical scaling
- **Full Documentation** - API docs, guides, training materials

---

**Built with ❤️ using NestJS + React + PostgreSQL + Redis + Prisma**

Ready for production deployment! 🚀
