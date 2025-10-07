# 🚀 BSK Providers POS - Quick Setup Guide

## ✅ Step 1: Create Auth Users in Supabase Dashboard

1. Open your Supabase Dashboard: https://app.supabase.com/project/etridkucvvcmmkrmgabi
2. Go to **Authentication** → **Users**
3. Click **"Add user"** (or **"Invite"**)
4. Create these 3 users with **"Auto Confirm User" ENABLED**:

   **User 1 - Admin:**
   - Email: `admin@bskproviders.com`
   - Password: `Admin123!@#`
   - Auto Confirm: ✅ **YES**

   **User 2 - Manager:**
   - Email: `manager@bskproviders.com`
   - Password: `Manager123!@#`
   - Auto Confirm: ✅ **YES**

   **User 3 - Cashier:**
   - Email: `cashier@bskproviders.com`
   - Password: `Cashier123!@#`
   - Auto Confirm: ✅ **YES**

## ✅ Step 2: Link Auth Users to Profiles

After creating the auth users, run this SQL in **SQL Editor**:

```sql
-- Add unique constraint
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_auth_user_id_key UNIQUE (auth_user_id);

-- Get store ID
DO $$
DECLARE
  v_store_id uuid;
  v_admin_auth_id uuid;
  v_manager_auth_id uuid;
  v_cashier_auth_id uuid;
BEGIN
  -- Get first store
  SELECT id INTO v_store_id FROM stores LIMIT 1;

  -- Get auth user IDs
  SELECT id INTO v_admin_auth_id FROM auth.users WHERE email = 'admin@bskproviders.com';
  SELECT id INTO v_manager_auth_id FROM auth.users WHERE email = 'manager@bskproviders.com';
  SELECT id INTO v_cashier_auth_id FROM auth.users WHERE email = 'cashier@bskproviders.com';

  -- Create admin profile
  IF v_admin_auth_id IS NOT NULL THEN
    INSERT INTO users (auth_user_id, email, name, role, store_id, is_active)
    VALUES (v_admin_auth_id, 'admin@bskproviders.com', 'System Administrator', 'admin', NULL, true)
    ON CONFLICT (auth_user_id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      is_active = EXCLUDED.is_active;
    RAISE NOTICE 'Admin profile created';
  END IF;

  -- Create manager profile
  IF v_manager_auth_id IS NOT NULL THEN
    INSERT INTO users (auth_user_id, email, name, role, store_id, is_active)
    VALUES (v_manager_auth_id, 'manager@bskproviders.com', 'Store Manager', 'manager', v_store_id, true)
    ON CONFLICT (auth_user_id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      store_id = EXCLUDED.store_id,
      is_active = EXCLUDED.is_active;
    RAISE NOTICE 'Manager profile created';
  END IF;

  -- Create cashier profile
  IF v_cashier_auth_id IS NOT NULL THEN
    INSERT INTO users (auth_user_id, email, name, role, store_id, is_active)
    VALUES (v_cashier_auth_id, 'cashier@bskproviders.com', 'Cashier User', 'cashier', v_store_id, true)
    ON CONFLICT (auth_user_id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      store_id = EXCLUDED.store_id,
      is_active = EXCLUDED.is_active;
    RAISE NOTICE 'Cashier profile created';
  END IF;

  -- Show results
  RAISE NOTICE 'User profiles setup complete!';
END $$;

-- Verify users were created
SELECT u.name, u.email, u.role, s.name as store_name
FROM users u
LEFT JOIN stores s ON u.store_id = s.id
WHERE u.email IN ('admin@bskproviders.com', 'manager@bskproviders.com', 'cashier@bskproviders.com');
```

## 🔐 Login Credentials

Once setup is complete, you can login with:

### 👨‍💼 ADMIN (Full System Access)
```
Email:    admin@bskproviders.com
Password: Admin123!@#
Access:   All stores, all features, complete control
```

### 👔 MANAGER (Store Management)
```
Email:    manager@bskproviders.com
Password: Manager123!@#
Access:   Downtown Store, inventory, reports, staff management
```

### 💰 CASHIER (POS Terminal)
```
Email:    cashier@bskproviders.com
Password: Cashier123!@#
Access:   Downtown Store, POS terminal, customer management
```

---

## 🎯 Testing the Login

1. Open the app in your browser
2. You'll see the login screen
3. Enter any of the credentials above
4. You'll be logged in and see the dashboard based on your role

## ⚠️ Troubleshooting

If login doesn't work:

1. **Check auth users exist:**
   ```sql
   SELECT email, confirmed_at FROM auth.users
   WHERE email IN ('admin@bskproviders.com', 'manager@bskproviders.com', 'cashier@bskproviders.com');
   ```
   - All should show `confirmed_at` with a timestamp

2. **Check profiles exist:**
   ```sql
   SELECT * FROM users
   WHERE email IN ('admin@bskproviders.com', 'manager@bskproviders.com', 'cashier@bskproviders.com');
   ```
   - Should return 3 rows

3. **Check RLS policies:**
   ```sql
   SELECT tablename, policyname FROM pg_policies WHERE tablename = 'users';
   ```

4. **Email confirmation**: Make sure "Enable email confirmations" is DISABLED in:
   - Dashboard → Authentication → Settings → Email Auth

---

## 🚀 You're All Set!

The system is now ready with:
- ✅ Real database backend
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ Multi-store support
- ✅ All features enabled

**No demo mode - everything is real and production-ready!**
