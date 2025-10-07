# Developer Guide - Full-Stack POS System

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Login with Demo Account
```
Email: admin@retailpos.com
Password: admin123
```

That's it! The app will auto-initialize the database on first load.

---

## Development Workflow

### Adding a New Product
```typescript
import { db } from './services/database';

const newProduct = await db.products.create({
  name: 'New Product',
  barcode: '1234567890123',
  price: 29.99,
  cost: 15.00,
  stock: 50,
  category_id: categoryId,
  store_id: storeId,
  is_active: true
});
```

### Making a Sale
```typescript
const transaction = await db.transactions.create({
  customer_id: customerId,
  subtotal: 100.00,
  tax: 8.50,
  total: 108.50,
  payment_method: 'card',
  status: 'completed',
  cashier_id: userId,
  store_id: storeId,
  items: [
    {
      product_id: productId,
      product_name: 'Product Name',
      quantity: 2,
      price: 50.00,
      total: 100.00
    }
  ]
});
```

### Creating a Customer
```typescript
const customer = await db.customers.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  loyalty_points: 0,
  is_active: true
});
```

---

## Project Structure

```
src/
├── components/          # All UI components
├── services/           # Backend services
│   ├── auth.ts         # Authentication
│   ├── database.ts     # Database operations
│   └── initData.ts     # Demo data seeding
├── hooks/              # Custom React hooks
├── lib/                # Third-party configs
├── types/              # TypeScript types
└── utils/              # Helper functions
```

---

## Component Architecture

### Standard Component Pattern

```typescript
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { User, Store } from '../types';

interface ComponentProps {
  user: User;
  store: Store | null;
}

export const Component: React.FC<ComponentProps> = ({ user, store }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [store]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await db.tableName.getAll(store?.id);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (item) => {
    await db.tableName.create(item);
    loadData(); // Refresh
  };

  return (
    // JSX here
  );
};
```

---

## Database Operations

### Basic CRUD

```typescript
// READ
const items = await db.products.getAll();
const item = await db.products.getById(id);

// CREATE
const newItem = await db.products.create({
  name: 'Product',
  price: 29.99
});

// UPDATE
const updated = await db.products.update(id, {
  price: 24.99
});

// DELETE
await db.products.delete(id);
```

### Real-time Subscriptions

```typescript
useEffect(() => {
  const subscription = db.products.subscribe((products) => {
    setProducts(products);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Adding a New Module

### Step 1: Create the Component
```bash
touch src/components/NewModule.tsx
```

```typescript
import React, { useState, useEffect } from 'react';
import { User, Store } from '../types';
import { db } from '../services/database';

interface NewModuleProps {
  user: User;
  store: Store | null;
}

export const NewModule: React.FC<NewModuleProps> = ({ user, store }) => {
  // Component logic here
  return <div>New Module</div>;
};
```

### Step 2: Add Route to App.tsx
```typescript
case 'new-module':
  return <NewModule user={currentUser} store={currentStore} />;
```

### Step 3: Add to Sidebar
```typescript
// In Sidebar.tsx
{
  icon: Icon,
  label: 'New Module',
  view: 'new-module',
  permission: PERMISSIONS.MODULE_VIEW
}
```

---

## Database Schema Reference

### Products Table
```sql
CREATE TABLE products (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  barcode text UNIQUE,
  price decimal(10,2) NOT NULL,
  cost decimal(10,2) NOT NULL,
  stock integer DEFAULT 0,
  category_id uuid REFERENCES categories(id),
  store_id uuid REFERENCES stores(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id uuid PRIMARY KEY,
  receipt_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  subtotal decimal(10,2) NOT NULL,
  tax decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  payment_method text,
  status text DEFAULT 'completed',
  cashier_id uuid REFERENCES users(id),
  store_id uuid REFERENCES stores(id),
  created_at timestamptz DEFAULT now()
);
```

See `supabase/migrations/` for complete schema.

---

## Authentication

### Protected Routes
```typescript
if (!currentUser) {
  return <LoginScreen onLogin={handleLogin} />;
}
```

### Permission Checking
```typescript
import { hasPermission, PERMISSIONS } from '../utils/permissions';

if (hasPermission(user, PERMISSIONS.INVENTORY_ADD)) {
  // Show add button
}
```

### Role-based Access
```typescript
const ROLE_PERMISSIONS = {
  admin: ['all'],
  manager: ['inventory_view', 'inventory_add', ...],
  cashier: ['inventory_view', 'transactions_add']
};
```

---

## Styling

### Tailwind CSS Classes
```typescript
// Primary Button
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Click Me
</button>

// Input Field
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />

// Card
<div className="bg-white rounded-lg shadow-md p-6">
  Content
</div>
```

### Theme Consistency
- Primary color: `blue-600`
- Success: `green-600`
- Warning: `yellow-600`
- Error: `red-600`
- Gray scale: `gray-50` to `gray-900`

---

## Error Handling

### Standard Pattern
```typescript
try {
  setLoading(true);
  setError(null);
  const result = await db.something.create(data);
  // Success handling
} catch (err: any) {
  setError(err.message || 'Something went wrong');
  console.error('Error:', err);
} finally {
  setLoading(false);
}
```

### Display Errors
```typescript
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
    {error}
  </div>
)}
```

---

## Testing

### Manual Testing
1. Login with different roles
2. Test CRUD operations
3. Test real-time updates (open in two tabs)
4. Test error scenarios
5. Test on mobile viewport

### Test Data
Use the demo accounts:
- `admin@retailpos.com` / `admin123`
- `manager@retailpos.com` / `manager123`
- `cashier@retailpos.com` / `cashier123`

---

## Common Tasks

### Add a New Field to Product
1. Create migration:
```sql
ALTER TABLE products ADD COLUMN new_field text;
```

2. Update TypeScript type:
```typescript
interface Product {
  // ... existing fields
  newField?: string;
}
```

3. Update form in component:
```typescript
<input
  value={formData.newField}
  onChange={(e) => setFormData({ ...formData, newField: e.target.value })}
/>
```

### Add a New Permission
1. Update `utils/permissions.ts`:
```typescript
export const PERMISSIONS = {
  // ... existing
  NEW_FEATURE_VIEW: 'new_feature_view',
  NEW_FEATURE_ADD: 'new_feature_add'
};
```

2. Update role permissions:
```typescript
const ROLE_PERMISSIONS = {
  admin: ['all'],
  manager: [...existing, 'new_feature_view', 'new_feature_add'],
  cashier: [...existing, 'new_feature_view']
};
```

3. Check permission in component:
```typescript
{hasPermission(user, PERMISSIONS.NEW_FEATURE_ADD) && (
  <button>Add Feature</button>
)}
```

---

## Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Environment Variables

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Important**: Never commit real credentials to Git!

---

## Debugging Tips

### Check Supabase Connection
```typescript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

### Check Auth State
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);
```

### Check Database Query
```typescript
const { data, error } = await supabase.from('products').select('*');
console.log('Data:', data);
console.log('Error:', error);
```

### Check RLS Policies
If data isn't loading, check RLS policies in Supabase dashboard.

---

## Performance Optimization

### Lazy Loading
```typescript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### Memoization
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### Debouncing
```typescript
const debouncedSearch = useCallback(
  debounce((term) => {
    performSearch(term);
  }, 300),
  []
);
```

---

## Resources

- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Lucide Icons](https://lucide.dev)

---

## Need Help?

1. Check browser console for errors
2. Check Supabase dashboard logs
3. Verify RLS policies
4. Check environment variables
5. Review this guide and FULLSTACK_ARCHITECTURE.md

---

**Happy Coding!** 🚀
