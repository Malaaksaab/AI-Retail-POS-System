/*
  # Initial POS System Database Schema

  ## Overview
  Creates the complete database structure for BSK Providers Enterprise POS System
  with comprehensive tables, relationships, security policies, and indexes.

  ## Tables Created
  
  ### User Management
  - `users` - System users (admin, manager, cashier) with profile data
  - `user_sessions` - Track user login sessions and activity
  
  ### Store Management
  - `stores` - Physical store locations and configuration
  - `store_settings` - Store-specific settings and preferences
  
  ### Inventory Management
  - `categories` - Product categories and hierarchies
  - `suppliers` - Supplier information and contacts
  - `products` - Product catalog with variants and pricing
  - `product_variants` - Product variations (size, color, etc.)
  - `inventory_adjustments` - Stock level changes and reasons
  - `inventory_transfers` - Inter-store inventory transfers
  
  ### Customer Management
  - `customers` - Customer profiles and contact information
  - `customer_tiers` - Loyalty tier definitions
  - `loyalty_transactions` - Points earned/redeemed history
  
  ### Sales & Transactions
  - `transactions` - Sales transactions (completed, temporary, refunded)
  - `transaction_items` - Line items for each transaction
  - `held_orders` - Orders on hold for later completion
  - `payment_details` - Payment information including dual payments
  
  ### Employee & Performance
  - `employee_performance` - Daily/weekly/monthly performance metrics
  - `employee_goals` - Individual performance goals
  - `employee_bonuses` - Bonus awards and tracking
  - `work_schedules` - Employee shift schedules (rota)
  
  ### Advanced Features
  - `promotions` - Discount and promotion campaigns
  - `gifts` - Gift management for anniversaries/events
  - `customer_anniversaries` - Track customer milestones
  - `system_alerts` - System-wide notifications and alerts
  - `audit_logs` - Complete audit trail of all actions
  - `hardware_config` - POS hardware configuration per store

  ## Security
  - Row Level Security (RLS) enabled on ALL tables
  - Policies restrict access based on user role and store assignment
  - Audit logging for compliance and security
  
  ## Indexes
  - Performance indexes on frequently queried columns
  - Foreign key indexes for relationship queries
  - Composite indexes for complex queries
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USER MANAGEMENT
-- =============================================

-- Users table (links to auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')),
  store_id uuid,
  avatar text,
  is_active boolean DEFAULT true,
  ai_access boolean DEFAULT false,
  system_level text CHECK (system_level IN ('store', 'regional', 'corporate')),
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid,
  login_time timestamptz DEFAULT now(),
  logout_time timestamptz,
  ip_address text,
  device_info text,
  is_active boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- =============================================
-- STORE MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  manager_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_manager_id ON stores(manager_id);

CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL UNIQUE,
  currency text DEFAULT 'GBP',
  currency_symbol text DEFAULT '£',
  tax_rate numeric(5,2) DEFAULT 20.00,
  receipt_footer text,
  loyalty_enabled boolean DEFAULT true,
  offline_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- INVENTORY MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id),
  store_id uuid REFERENCES stores(id),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  payment_terms text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id) NOT NULL,
  category_id uuid REFERENCES categories(id),
  supplier_id uuid REFERENCES suppliers(id),
  name text NOT NULL,
  description text,
  barcode text UNIQUE,
  sku text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  max_stock integer DEFAULT 100,
  location text,
  image text,
  is_active boolean DEFAULT true,
  taxable boolean DEFAULT true,
  track_stock boolean DEFAULT true,
  sell_by_weight boolean DEFAULT false,
  age_restricted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  value text NOT NULL,
  price numeric(10,2),
  stock integer DEFAULT 0,
  barcode text,
  sku text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('increase', 'decrease', 'set', 'damage', 'theft', 'correction', 'return', 'transfer_in', 'transfer_out')),
  quantity_before integer NOT NULL,
  quantity_after integer NOT NULL,
  quantity_changed integer NOT NULL,
  reason text NOT NULL,
  cost_impact numeric(10,2) DEFAULT 0,
  approved_by uuid REFERENCES users(id),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_store_id ON inventory_adjustments(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON inventory_adjustments(created_at);

CREATE TABLE IF NOT EXISTS inventory_transfers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_store_id uuid REFERENCES stores(id) NOT NULL,
  to_store_id uuid REFERENCES stores(id) NOT NULL,
  requested_by uuid REFERENCES users(id) NOT NULL,
  approved_by uuid REFERENCES users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  total_value numeric(10,2) DEFAULT 0,
  notes text,
  request_date timestamptz DEFAULT now(),
  approved_date timestamptz,
  completed_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_transfer_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_id uuid REFERENCES inventory_transfers(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL,
  unit_cost numeric(10,2) NOT NULL,
  total_cost numeric(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_transfers_from_store ON inventory_transfers(from_store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_to_store ON inventory_transfers(to_store_id);

-- =============================================
-- CUSTOMER MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS customer_tiers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE CHECK (name IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  min_points integer DEFAULT 0,
  discount_percentage numeric(5,2) DEFAULT 0,
  benefits jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Insert default tiers
INSERT INTO customer_tiers (name, min_points, discount_percentage, benefits) VALUES
  ('bronze', 0, 0, '["Basic rewards"]'::jsonb),
  ('silver', 500, 5, '["5% discount", "Birthday rewards"]'::jsonb),
  ('gold', 1500, 10, '["10% discount", "Priority support", "Early access"]'::jsonb),
  ('platinum', 5000, 15, '["15% discount", "VIP events", "Free shipping"]'::jsonb),
  ('diamond', 10000, 20, '["20% discount", "Concierge service", "Exclusive products"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  address text,
  loyalty_points integer DEFAULT 0,
  total_purchases numeric(10,2) DEFAULT 0,
  tier text DEFAULT 'bronze' REFERENCES customer_tiers(name),
  notes text,
  is_active boolean DEFAULT true,
  last_visit timestamptz,
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  transaction_id uuid,
  type text NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus', 'adjustment')),
  points integer NOT NULL,
  description text,
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);

CREATE TABLE IF NOT EXISTS customer_anniversaries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  anniversary_type text NOT NULL CHECK (anniversary_type IN ('registration', 'birthday', 'first_purchase')),
  date date NOT NULL,
  years_completed integer DEFAULT 0,
  gift_offered text,
  gift_value numeric(10,2) DEFAULT 0,
  is_redeemed boolean DEFAULT false,
  redeemed_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- SALES & TRANSACTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number text UNIQUE NOT NULL,
  store_id uuid REFERENCES stores(id) NOT NULL,
  cashier_id uuid REFERENCES users(id) NOT NULL,
  customer_id uuid REFERENCES customers(id),
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'on_hold', 'temporary', 'pending_approval', 'voided', 'cancelled')),
  basket_type text DEFAULT 'permanent' CHECK (basket_type IN ('temporary', 'permanent')),
  subtotal numeric(10,2) DEFAULT 0,
  tax numeric(10,2) DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile', 'gift_card', 'loyalty_points', 'dual')),
  cash_amount numeric(10,2) DEFAULT 0,
  card_amount numeric(10,2) DEFAULT 0,
  change_given numeric(10,2) DEFAULT 0,
  loyalty_points_earned integer DEFAULT 0,
  loyalty_points_used integer DEFAULT 0,
  reason text,
  notes text,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions(receipt_number);

CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL,
  discount numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON transaction_items(product_id);

CREATE TABLE IF NOT EXISTS held_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE NOT NULL,
  store_id uuid REFERENCES stores(id) NOT NULL,
  cashier_id uuid REFERENCES users(id) NOT NULL,
  customer_id uuid REFERENCES customers(id),
  subtotal numeric(10,2) DEFAULT 0,
  tax numeric(10,2) DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  reason text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'held' CHECK (status IN ('held', 'resumed', 'cancelled')),
  held_at timestamptz DEFAULT now(),
  resumed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS held_order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  held_order_id uuid REFERENCES held_orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL
);

-- =============================================
-- EMPLOYEE & PERFORMANCE
-- =============================================

CREATE TABLE IF NOT EXISTS employee_performance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) NOT NULL,
  date date NOT NULL,
  transactions_processed integer DEFAULT 0,
  total_sales numeric(10,2) DEFAULT 0,
  average_transaction_value numeric(10,2) DEFAULT 0,
  customers_served integer DEFAULT 0,
  hours_worked numeric(5,2) DEFAULT 0,
  efficiency_score numeric(5,2) DEFAULT 0,
  accuracy_score numeric(5,2) DEFAULT 0,
  customer_satisfaction numeric(5,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_break', 'offline')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, store_id, date)
);

CREATE INDEX IF NOT EXISTS idx_employee_performance_employee_id ON employee_performance(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_performance_date ON employee_performance(date);

CREATE TABLE IF NOT EXISTS employee_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric(10,2) NOT NULL,
  current_value numeric(10,2) DEFAULT 0,
  unit text NOT NULL,
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'cancelled')),
  progress numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employee_goals_employee_id ON employee_goals(employee_id);

CREATE TABLE IF NOT EXISTS employee_bonuses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('performance', 'sales', 'customer_service', 'attendance', 'challenge')),
  amount numeric(10,2) NOT NULL,
  reason text NOT NULL,
  period text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  date_awarded date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) NOT NULL,
  date date NOT NULL,
  shift_start time NOT NULL,
  shift_end time NOT NULL,
  break_start time,
  break_end time,
  role text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'absent', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, store_id, date, shift_start)
);

-- =============================================
-- PROMOTIONS & DISCOUNTS
-- =============================================

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'bundle')),
  value numeric(10,2) NOT NULL,
  minimum_purchase numeric(10,2) DEFAULT 0,
  maximum_discount numeric(10,2),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  applicable_products uuid[] DEFAULT '{}',
  applicable_categories uuid[] DEFAULT '{}',
  conditions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gifts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('product', 'discount', 'loyalty_points', 'voucher')),
  value numeric(10,2) NOT NULL,
  cost numeric(10,2) DEFAULT 0,
  eligibility_criteria text,
  validity_days integer DEFAULT 30,
  stock_quantity integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- SYSTEM & CONFIGURATION
-- =============================================

CREATE TABLE IF NOT EXISTS system_alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'critical')),
  category text NOT NULL CHECK (category IN ('system', 'inventory', 'sales', 'security', 'performance')),
  title text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  user_id uuid REFERENCES users(id),
  store_id uuid REFERENCES stores(id),
  is_read boolean DEFAULT false,
  action_required boolean DEFAULT false,
  auto_resolve boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_alerts_user_id ON system_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_system_alerts_is_read ON system_alerts(is_read);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) NOT NULL,
  store_id uuid REFERENCES stores(id),
  action text NOT NULL,
  module text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);

CREATE TABLE IF NOT EXISTS hardware_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL UNIQUE,
  barcode_scanner jsonb DEFAULT '{}'::jsonb,
  printer jsonb DEFAULT '{}'::jsonb,
  cash_drawer jsonb DEFAULT '{}'::jsonb,
  card_reader jsonb DEFAULT '{}'::jsonb,
  display jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_anniversaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE held_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE held_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_config ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Users: Can view own profile, admins can view all
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id OR EXISTS (
    SELECT 1 FROM users WHERE users.auth_user_id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.auth_user_id = auth.uid() AND users.role = 'admin'
  ));

-- Stores: All authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view stores"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage stores"
  ON stores FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.auth_user_id = auth.uid() AND users.role = 'admin'
  ));

-- Products: Users can view their store's products
CREATE POLICY "Users can view store products"
  ON products FOR SELECT
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM users WHERE auth_user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Managers and admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND (role IN ('admin', 'manager') AND (store_id = products.store_id OR role = 'admin'))
    )
  );

-- Transactions: Users can view their store's transactions
CREATE POLICY "Users can view store transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Cashiers can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    cashier_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Managers can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Customers: All authenticated users can view and manage
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (true);

-- Employee Performance: Users can view own performance, managers/admins can view all
CREATE POLICY "Users can view own performance"
  ON employee_performance FOR SELECT
  TO authenticated
  USING (
    employee_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Managers can manage performance data"
  ON employee_performance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- System Alerts: Users can view their own alerts
CREATE POLICY "Users can view own alerts"
  ON system_alerts FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR
    user_id IS NULL OR
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin')
  );

-- Audit Logs: Read-only for admins
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Generic policies for remaining tables (store-based access)
CREATE POLICY "Store-based access for categories" ON categories FOR ALL TO authenticated
  USING (store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "All authenticated can view suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage suppliers" ON suppliers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Store-based access for product_variants" ON product_variants FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND (products.store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'))));

CREATE POLICY "Store-based access for inventory_adjustments" ON inventory_adjustments FOR ALL TO authenticated
  USING (store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Store-based access for inventory_transfers" ON inventory_transfers FOR ALL TO authenticated
  USING (from_store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR to_store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "All authenticated can view customer_tiers" ON customer_tiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated can view loyalty_transactions" ON loyalty_transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "All authenticated can view customer_anniversaries" ON customer_anniversaries FOR ALL TO authenticated USING (true);

CREATE POLICY "Store-based access for transaction_items" ON transaction_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM transactions WHERE transactions.id = transaction_items.transaction_id AND (transactions.store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'))));

CREATE POLICY "Store-based access for held_orders" ON held_orders FOR ALL TO authenticated
  USING (store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Store-based access for held_order_items" ON held_order_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM held_orders WHERE held_orders.id = held_order_items.held_order_id AND (held_orders.store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'))));

CREATE POLICY "Managers can view employee_goals" ON employee_goals FOR ALL TO authenticated
  USING (employee_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Managers can view employee_bonuses" ON employee_bonuses FOR ALL TO authenticated
  USING (employee_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Store-based access for work_schedules" ON work_schedules FOR ALL TO authenticated
  USING (employee_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "All authenticated can view promotions" ON promotions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage promotions" ON promotions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "All authenticated can view gifts" ON gifts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Managers can manage gifts" ON gifts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Store-based access for user_sessions" ON user_sessions FOR ALL TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Store-based access for store_settings" ON store_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage store_settings" ON store_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Store-based access for hardware_config" ON hardware_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage hardware_config" ON hardware_config FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Store-based access for inventory_transfer_items" ON inventory_transfer_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM inventory_transfers WHERE inventory_transfers.id = inventory_transfer_items.transfer_id AND (inventory_transfers.from_store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR inventory_transfers.to_store_id IN (SELECT store_id FROM users WHERE auth_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'admin'))));
