# BSK Providers POS - User Account Creation Guide

Since Supabase Auth requires email verification by default, you need to create user accounts through the Supabase Dashboard. Follow these steps:

## Option 1: Create Users via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://etridkucvvcmmkrmgabi.supabase.co
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** button
4. Create the following accounts:

### Admin Account
- **Email**: `admin@bskproviders.com`
- **Password**: `Admin123!@#`
- **Auto Confirm User**: ✅ YES (Enable this!)
- After creating, run this SQL to add profile:

```sql
INSERT INTO users (auth_user_id, email, name, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@bskproviders.com'),
  'admin@bskproviders.com',
  'System Administrator',
  'admin',
  true
);
```

### Manager Account
- **Email**: `manager@bskproviders.com`
- **Password**: `Manager123!@#`
- **Auto Confirm User**: ✅ YES
- Then run:

```sql
INSERT INTO users (auth_user_id, email, name, role, store_id, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'manager@bskproviders.com'),
  'manager@bskproviders.com',
  'Store Manager',
  'manager',
  'bf0557a9-ff92-46d4-bc95-73db78085bde', -- Downtown Store ID
  true
);
```

### Cashier Account
- **Email**: `cashier@bskproviders.com`
- **Password**: `Cashier123!@#`
- **Auto Confirm User**: ✅ YES
- Then run:

```sql
INSERT INTO users (auth_user_id, email, name, role, store_id, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'cashier@bskproviders.com'),
  'cashier@bskproviders.com',
  'Cashier User',
  'cashier',
  'bf0557a9-ff92-46d4-bc95-73db78085bde', -- Downtown Store ID
  true
);
```

## Option 2: Quick SQL Approach (If you have service key)

Run this complete SQL in the SQL Editor:

```sql
-- This creates user profiles linked to auth users
-- You still need to create the auth.users manually via dashboard

-- Wait for auth users to be created first, then run:
INSERT INTO users (auth_user_id, email, name, role, store_id, is_active)
SELECT
  au.id,
  au.email,
  CASE
    WHEN au.email = 'admin@bskproviders.com' THEN 'System Administrator'
    WHEN au.email = 'manager@bskproviders.com' THEN 'Store Manager'
    WHEN au.email = 'cashier@bskproviders.com' THEN 'Cashier User'
  END,
  CASE
    WHEN au.email = 'admin@bskproviders.com' THEN 'admin'
    WHEN au.email = 'manager@bskproviders.com' THEN 'manager'
    WHEN au.email = 'cashier@bskproviders.com' THEN 'cashier'
  END,
  CASE
    WHEN au.email IN ('manager@bskproviders.com', 'cashier@bskproviders.com')
    THEN (SELECT id FROM stores LIMIT 1)
    ELSE NULL
  END,
  true
FROM auth.users au
WHERE au.email IN ('admin@bskproviders.com', 'manager@bskproviders.com', 'cashier@bskproviders.com')
ON CONFLICT (auth_user_id) DO NOTHING;
```

## Login Credentials

Once created, you can log in with:

### Admin (Full System Access)
- **Email**: admin@bskproviders.com
- **Password**: Admin123!@#
- **Access**: All stores, all features, full control

### Manager (Store Management)
- **Email**: manager@bskproviders.com
- **Password**: Manager123!@#
- **Access**: Downtown Store only, management features

### Cashier (POS Terminal)
- **Email**: cashier@bskproviders.com
- **Password**: Cashier123!@#
- **Access**: Downtown Store only, POS terminal

---

## Need Help?

If you encounter issues, check:
1. Email confirmation is disabled (Auto Confirm User = YES)
2. Both auth.users AND users table have entries
3. RLS policies are properly configured
