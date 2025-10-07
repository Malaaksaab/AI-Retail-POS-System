# Full-Stack POS System - Architecture Documentation

## Overview

This is a **production-ready, full-stack Point of Sale (POS) system** built with React, TypeScript, Tailwind CSS, and Supabase. All data persists to a PostgreSQL database, and every module supports complete CRUD operations.

---

## Architecture Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Hooks (useState, useEffect)

### Backend & Database
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Database**: PostgreSQL 15+
- **Authentication**: Supabase Auth (email/password)
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage (for images/files)

### Security
- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (Admin, Manager, Cashier)
- **Data Validation**: Type-safe TypeScript interfaces

---

## Database Schema

### Core Tables

#### 1. Users & Authentication
- `users` - User accounts with roles (admin, manager, cashier)
- `user_permissions` - Granular permission management

#### 2. Store Management
- `stores` - Store locations and configurations
- `store_settings` - Currency, tax rates, receipt settings
- `hardware_config` - POS hardware configuration per store

#### 3. Products & Inventory
- `products` - Product catalog with pricing and stock
- `categories` - Product categories (hierarchical)
- `suppliers` - Supplier information
- `product_variants` - Product variations (size, color, etc.)
- `stock_adjustments` - Inventory adjustment history
- `auto_inventory_rules` - Automated reorder rules

#### 4. Customers & Loyalty
- `customers` - Customer information and loyalty data
- `loyalty_points` - Point transaction history
- `customer_preferences` - Purchase preferences
- `customer_anniversaries` - Special dates and rewards

#### 5. Transactions & Sales
- `transactions` - Sale transactions with payment info
- `transaction_items` - Line items for each transaction
- `held_orders` - Temporarily held orders
- `dual_payments` - Split payment tracking
- `cash_out_sessions` - Cashier session management

#### 6. Invoicing & Payments
- `invoices` - Customer invoices with line items
- `invoice_items` - Individual invoice line items
- `invoice_payments` - Payment tracking and application
- `tax_rates` - Configurable tax rates

#### 7. Transfers & Operations
- `inventory_transfers` - Inter-store inventory transfers
- `transfer_items` - Transfer line items
- `purchase_orders` - Supplier purchase orders
- `purchase_order_items` - PO line items

#### 8. Employee Management
- `employee_performance` - Stats and metrics
- `employee_goals` - Individual performance goals
- `employee_bonuses` - Bonus tracking
- `rota_schedules` - Work schedules
- `wage_management` - Payroll information

#### 9. Promotions & Analytics
- `promotions` - Promotional campaigns
- `gift_management` - Gift and reward items
- `weekly_challenges` - Employee competitions
- `ai_insights` - AI-generated business insights
- `system_alerts` - System notifications

---

## Project Structure

```
src/
├── components/          # React components
│   ├── LoginScreen.tsx         # Authentication UI
│   ├── Dashboard.tsx           # Main dashboard
│   ├── POSTerminal.tsx         # POS interface
│   ├── InventoryManager.tsx    # Product management
│   ├── CustomerManager.tsx     # Customer management
│   ├── StoreManager.tsx        # Store management
│   ├── UserManager.tsx         # User management
│   ├── TransactionManager.tsx  # Sales history
│   ├── InvoiceManagement.tsx   # Invoice creation
│   ├── PaymentTracking.tsx     # Payment tracking
│   ├── FinancialReports.tsx    # Financial analytics
│   └── ... (20+ more components)
│
├── services/           # Backend services
│   ├── auth.ts                 # Authentication service
│   ├── database.ts             # Database CRUD operations
│   └── initData.ts             # Demo data seeding
│
├── hooks/              # Custom React hooks
│   ├── useToast.ts             # Toast notifications
│   └── useRealtimeData.ts      # Real-time subscriptions
│
├── lib/                # Third-party integrations
│   └── supabase.ts             # Supabase client config
│
├── types/              # TypeScript definitions
│   └── index.ts                # All type definitions
│
└── utils/              # Utility functions
    ├── permissions.ts          # Role-based permissions
    └── hardware.ts             # Hardware integration

supabase/
└── migrations/         # Database migrations
    ├── 20251007191125_create_pos_system_schema.sql
    ├── 20251007192143_fix_security_performance_v2.sql
    └── 20251007194500_add_invoice_financial_system.sql
```

---

## Authentication Flow

### Demo Accounts

The system comes pre-configured with three demo accounts:

| Role     | Email                    | Password    | Access Level          |
|----------|--------------------------|-------------|-----------------------|
| Admin    | admin@retailpos.com      | admin123    | Full system access    |
| Manager  | manager@retailpos.com    | manager123  | Store-level access    |
| Cashier  | cashier@retailpos.com    | cashier123  | POS operations only   |

### Authentication Process

1. **Login**: User enters email and password
2. **Supabase Auth**: Validates credentials and returns JWT token
3. **User Profile**: Fetches user profile from `users` table
4. **Store Selection**: Auto-selects user's assigned store or first available store
5. **Session Persistence**: Session persists across page refreshes
6. **Auto-logout**: Session expires after inactivity

### Implementation

```typescript
// src/services/auth.ts
export const auth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // Fetch user profile from database
    const user = await db.users.getByEmail(email);
    return { authUser: data.user, user, session: data.session };
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      // Handle auth state changes
    });
  }
};
```

---

## Database Service Layer

All database operations are centralized in `src/services/database.ts`. Every table has a service with standard CRUD methods:

### Standard Methods

```typescript
{
  getAll(filters?): Promise<T[]>     // Fetch all records
  getById(id): Promise<T>             // Fetch single record
  create(data): Promise<T>            // Create new record
  update(id, data): Promise<T>        // Update existing record
  delete(id): Promise<void>           // Delete record
  subscribe(callback): Subscription   // Real-time updates
}
```

### Example: Products Service

```typescript
db.products: {
  async getAll(storeId?: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(id, name, color),
        suppliers(id, name)
      `)
      .order('created_at', { ascending: false });
    return data;
  },

  async create(product) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    return data;
  },

  // ... other methods
}
```

---

## Module Breakdown

### 1. Dashboard
- **Path**: `/dashboard`
- **Features**:
  - Sales overview (today, week, month, year)
  - Product & customer counts
  - Recent transactions
  - Low stock alerts
  - Quick actions
- **Database**: Reads from `transactions`, `products`, `customers`

### 2. POS Terminal
- **Path**: `/pos`
- **Features**:
  - Barcode scanning
  - Product search
  - Cart management
  - Multiple payment methods
  - Split payments
  - Receipt printing
  - Customer lookup
  - Loyalty points
- **Database**: Creates `transactions` and `transaction_items`, updates `products.stock`

### 3. Inventory Management
- **Path**: `/inventory`
- **Features**:
  - Product CRUD operations
  - Stock level tracking
  - Low stock alerts
  - Bulk import/export
  - Product variants
  - Category assignment
  - Supplier linking
- **Database**: Full CRUD on `products`, reads from `categories`, `suppliers`

### 4. Customer Management
- **Path**: `/customers`
- **Features**:
  - Customer CRUD operations
  - Loyalty points management
  - Purchase history
  - Customer tiers (Bronze, Silver, Gold, Platinum)
  - Contact information
  - Credit limit tracking
- **Database**: Full CRUD on `customers`, reads `transactions`

### 5. Invoice Management
- **Path**: `/invoices`
- **Features**:
  - Invoice creation
  - Line item management
  - Tax calculations
  - Payment terms
  - Invoice status tracking
  - Payment recording
  - Aging reports
- **Database**: Full CRUD on `invoices`, `invoice_items`, `invoice_payments`

### 6. Store Management
- **Path**: `/stores`
- **Features**:
  - Store CRUD operations
  - Store settings (currency, tax rates)
  - Hardware configuration
  - Staff assignment
- **Database**: Full CRUD on `stores`, `store_settings`, `hardware_config`

### 7. User Management
- **Path**: `/users`
- **Features**:
  - User CRUD operations
  - Role assignment
  - Permission management
  - Store assignment
  - Activity tracking
- **Database**: Full CRUD on `users`, `user_permissions`

### 8. Reports & Analytics
- **Path**: `/reports`
- **Features**:
  - Sales reports
  - Inventory reports
  - Customer analytics
  - Financial reports
  - Profit/loss analysis
  - Export to CSV/PDF
- **Database**: Reads from all transaction and inventory tables

---

## Real-time Features

### Subscriptions

The system uses Supabase Realtime to automatically update the UI when data changes:

```typescript
// Example: Real-time product updates
useEffect(() => {
  const subscription = db.products.subscribe((updatedProducts) => {
    setProducts(updatedProducts);
  }, storeId);

  return () => {
    subscription.unsubscribe();
  };
}, [storeId]);
```

### Supported Real-time Updates
- Product inventory changes
- New transactions
- Customer updates
- Store settings changes
- User status changes
- Alert notifications

---

## Security & Permissions

### Row Level Security (RLS)

Every table has RLS policies that enforce:
- **Store isolation**: Users can only see data from their assigned store
- **Role-based access**: Admins see all stores, managers/cashiers see only their store
- **Action restrictions**: Cashiers can't delete, managers can't access admin functions

### Permission System

```typescript
export const ROLE_PERMISSIONS = {
  admin: ['all'],
  manager: [
    'inventory_view', 'inventory_add', 'inventory_edit', 'inventory_delete',
    'customers_view', 'customers_add', 'customers_edit', 'customers_delete',
    'transactions_view', 'transactions_add', 'transactions_void',
    'reports_view', 'settings_edit'
  ],
  cashier: [
    'inventory_view',
    'customers_view', 'customers_add',
    'transactions_view', 'transactions_add'
  ]
};
```

---

## Running the Application

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### Installation & Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Environment variables** (already configured in `.env`):
```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **Run development server**:
```bash
npm run dev
```

The app will start on `http://localhost:5173`

4. **Build for production**:
```bash
npm run build
```

5. **Preview production build**:
```bash
npm run preview
```

### First Launch

On first launch, the app will automatically:
1. Initialize database schema (via Supabase migrations)
2. Create demo stores
3. Create demo users with authentication
4. Seed sample products, customers, and categories

---

## Data Flow Example: Making a Sale

1. **User Action**: Cashier scans product barcode
2. **Frontend**: `POSTerminal.tsx` calls `db.products.getByBarcode()`
3. **Backend**: Supabase queries `products` table
4. **Response**: Product added to cart
5. **User Action**: Customer completes payment
6. **Frontend**: Creates transaction via `db.transactions.create()`
7. **Backend**:
   - Inserts into `transactions` table
   - Inserts line items into `transaction_items`
   - Updates `products.stock` for each item
   - Updates customer `loyalty_points` if applicable
8. **Real-time**: All connected clients receive inventory update
9. **Frontend**: Receipt printed, cart cleared

---

## Deployment

### Supabase (Already Deployed)
- Database and authentication are live
- RLS policies active
- Realtime enabled

### Frontend Deployment Options

#### Option 1: Vercel
```bash
vercel --prod
```

#### Option 2: Netlify
```bash
netlify deploy --prod
```

#### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## API Reference

### Authentication API
```typescript
auth.signIn(email, password)      // Sign in user
auth.signOut()                     // Sign out user
auth.getCurrentUser()              // Get current session
auth.onAuthStateChange(callback)   // Listen to auth changes
```

### Database API
```typescript
// Products
db.products.getAll(storeId?)
db.products.getById(id)
db.products.getByBarcode(barcode)
db.products.create(product)
db.products.update(id, updates)
db.products.delete(id)
db.products.subscribe(callback, storeId?)

// Customers
db.customers.getAll()
db.customers.create(customer)
db.customers.update(id, updates)
db.customers.delete(id)

// Transactions
db.transactions.getAll(storeId?, limit?)
db.transactions.create(transaction)
db.transactions.update(id, updates)

// Invoices
db.invoices.getAll(storeId?)
db.invoices.create(invoice)
db.invoices.update(id, updates)

// ... and more (see src/services/database.ts)
```

---

## Testing

### Manual Testing Checklist

- [ ] Login with admin account
- [ ] Login with manager account
- [ ] Login with cashier account
- [ ] Create a new product
- [ ] Edit existing product
- [ ] Delete a product
- [ ] Create a new customer
- [ ] Edit customer details
- [ ] Make a sale transaction
- [ ] Create an invoice
- [ ] Record payment on invoice
- [ ] View reports
- [ ] Transfer inventory between stores
- [ ] Create a new user
- [ ] Update store settings

---

## Troubleshooting

### Issue: Login fails
**Solution**: Check Supabase credentials in `.env` file

### Issue: Data not loading
**Solution**: Check browser console for errors. Ensure RLS policies allow access.

### Issue: Real-time not working
**Solution**: Verify Supabase Realtime is enabled in project settings

### Issue: Build fails
**Solution**: Run `npm install` and ensure all dependencies are installed

---

## Future Enhancements

- Mobile responsive design improvements
- Offline mode with local storage sync
- Barcode generation for products
- Receipt email functionality
- Advanced analytics dashboard
- Multi-currency support
- Integration with payment processors (Stripe, Square)
- Employee time tracking
- Advanced reporting (PDF export)
- Multi-language support

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## License

This is a production-ready POS system built for demonstration purposes. All code is provided as-is.

---

**Built with React + TypeScript + Supabase + Tailwind CSS**
