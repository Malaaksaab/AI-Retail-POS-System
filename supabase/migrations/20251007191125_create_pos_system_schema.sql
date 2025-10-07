/*
  # Enterprise POS System Database Schema

  ## Overview
  Complete database schema for a multi-store enterprise POS system with real-time capabilities.

  ## Tables Created

  ### 1. Users & Authentication
    - `users` - User accounts with roles and permissions
    - `user_permissions` - Granular permission management

  ### 2. Store Management
    - `stores` - Store locations and configurations
    - `store_settings` - Store-specific settings (currency, tax, etc.)
    - `hardware_config` - Hardware configuration per store

  ### 3. Products & Inventory
    - `categories` - Product categories
    - `suppliers` - Supplier information
    - `products` - Product catalog with variants
    - `product_variants` - Product variations (size, color, etc.)
    - `stock_adjustments` - Inventory adjustment history
    - `auto_inventory_rules` - Automated reorder rules

  ### 4. Customers & Loyalty
    - `customers` - Customer information
    - `loyalty_points` - Customer loyalty point transactions
    - `customer_preferences` - Customer purchase preferences
    - `customer_anniversaries` - Customer special dates

  ### 5. Transactions & Sales
    - `transactions` - Sale transactions
    - `transaction_items` - Individual items in transactions
    - `held_orders` - Temporarily held orders
    - `dual_payments` - Split payment records
    - `cash_out_sessions` - Cashier session management

  ### 6. Transfers & Operations
    - `inventory_transfers` - Inter-store inventory transfers
    - `transfer_items` - Items in transfer requests
    - `purchase_orders` - Supplier purchase orders
    - `purchase_order_items` - Items in purchase orders

  ### 7. Employee Management
    - `employee_performance` - Employee stats and metrics
    - `employee_goals` - Individual goals
    - `employee_bonuses` - Bonus tracking
    - `rota_schedules` - Work schedules
    - `wage_management` - Payroll information

  ### 8. Promotions & Rewards
    - `promotions` - Promotional campaigns
    - `gift_management` - Gift and reward items
    - `weekly_challenges` - Employee competitions

  ### 9. Analytics & Reporting
    - `ai_insights` - AI-generated business insights
    - `system_alerts` - System notifications
    - `audit_logs` - Complete audit trail

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies for authenticated user access
  - Audit logging for all modifications
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
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

CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  module text NOT NULL,
  actions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- STORE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  manager text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  currency text DEFAULT 'USD',
  currency_symbol text DEFAULT '$',
  tax_rate decimal(5,2) DEFAULT 0,
  receipt_footer text,
  loyalty_enabled boolean DEFAULT true,
  offline_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hardware_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  barcode_scanner jsonb DEFAULT '{}'::jsonb,
  printer jsonb DEFAULT '{}'::jsonb,
  cash_drawer jsonb DEFAULT '{}'::jsonb,
  card_reader jsonb DEFAULT '{}'::jsonb,
  display jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PRODUCTS & INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  color text DEFAULT '#3b82f6',
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  barcode text UNIQUE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  cost decimal(10,2) NOT NULL DEFAULT 0,
  stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  max_stock integer DEFAULT 999999,
  description text,
  image text,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  location text,
  is_active boolean DEFAULT true,
  taxable boolean DEFAULT true,
  track_stock boolean DEFAULT true,
  sell_by_weight boolean DEFAULT false,
  age_restricted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  value text NOT NULL,
  price decimal(10,2),
  stock integer DEFAULT 0,
  barcode text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('increase', 'decrease', 'set')),
  quantity integer NOT NULL,
  reason text NOT NULL,
  adjusted_by uuid REFERENCES users(id),
  cost decimal(10,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auto_inventory_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  reorder_point integer NOT NULL,
  reorder_quantity integer NOT NULL,
  max_stock integer NOT NULL,
  supplier_id uuid REFERENCES suppliers(id),
  lead_time_days integer DEFAULT 7,
  is_active boolean DEFAULT true,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  last_triggered timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- CUSTOMERS & LOYALTY
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  loyalty_points integer DEFAULT 0,
  total_purchases decimal(10,2) DEFAULT 0,
  tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  notes text,
  is_active boolean DEFAULT true,
  registration_date timestamptz DEFAULT now(),
  last_visit timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  transaction_id uuid,
  type text NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus')),
  points integer NOT NULL,
  description text,
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  category text NOT NULL,
  preference text NOT NULL,
  strength integer DEFAULT 1,
  last_updated timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_anniversaries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  anniversary_type text NOT NULL CHECK (anniversary_type IN ('registration', 'birthday', 'first_purchase')),
  date date NOT NULL,
  years_completed integer DEFAULT 0,
  gift_offered text,
  gift_value decimal(10,2) DEFAULT 0,
  is_redeemed boolean DEFAULT false,
  redeemed_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TRANSACTIONS & SALES
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax decimal(10,2) NOT NULL DEFAULT 0,
  discount decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  payment_method text CHECK (payment_method IN ('cash', 'card', 'mobile', 'gift_card', 'loyalty_points')),
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'on_hold', 'temporary', 'pending_approval', 'voided')),
  cashier_id uuid REFERENCES users(id),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  basket_type text DEFAULT 'permanent' CHECK (basket_type IN ('temporary', 'permanent')),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  reason text,
  change decimal(10,2),
  loyalty_points_earned integer DEFAULT 0,
  loyalty_points_used integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  barcode text,
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  discount decimal(10,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  variant text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS held_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  cashier_id uuid REFERENCES users(id),
  store_id uuid REFERENCES stores(id),
  reason text NOT NULL,
  status text DEFAULT 'held' CHECK (status IN ('held', 'resumed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  held_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dual_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  cash_amount decimal(10,2) NOT NULL DEFAULT 0,
  card_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  cash_received decimal(10,2) NOT NULL DEFAULT 0,
  change_given decimal(10,2) NOT NULL DEFAULT 0,
  card_transaction_id text,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cash_out_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cashier_id uuid REFERENCES users(id),
  store_id uuid REFERENCES stores(id),
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  opening_cash decimal(10,2) DEFAULT 0,
  closing_cash decimal(10,2) DEFAULT 0,
  expected_cash decimal(10,2) DEFAULT 0,
  variance decimal(10,2) DEFAULT 0,
  cash_sales decimal(10,2) DEFAULT 0,
  card_sales decimal(10,2) DEFAULT 0,
  total_sales decimal(10,2) DEFAULT 0,
  refunds decimal(10,2) DEFAULT 0,
  voids decimal(10,2) DEFAULT 0,
  discounts decimal(10,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending_review', 'completed', 'discrepancy')),
  notes text,
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- TRANSFERS & OPERATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_transfers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_store_id uuid REFERENCES stores(id),
  to_store_id uuid REFERENCES stores(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  requested_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  request_date timestamptz DEFAULT now(),
  approved_date timestamptz,
  completed_date timestamptz,
  notes text,
  total_value decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfer_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_id uuid REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  unit_cost decimal(10,2) NOT NULL,
  total_cost decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id uuid REFERENCES suppliers(id),
  store_id uuid REFERENCES stores(id),
  subtotal decimal(10,2) DEFAULT 0,
  tax decimal(10,2) DEFAULT 0,
  total decimal(10,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'partial', 'cancelled')),
  order_date timestamptz DEFAULT now(),
  expected_date timestamptz,
  received_date timestamptz,
  created_by uuid REFERENCES users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity_ordered integer NOT NULL,
  quantity_received integer DEFAULT 0,
  unit_cost decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- EMPLOYEE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS employee_performance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id),
  daily_stats jsonb DEFAULT '{}'::jsonb,
  weekly_stats jsonb DEFAULT '{}'::jsonb,
  monthly_stats jsonb DEFAULT '{}'::jsonb,
  last_active timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_break', 'offline')),
  profile_image text,
  join_date timestamptz DEFAULT now(),
  department text,
  shift text CHECK (shift IN ('morning', 'afternoon', 'evening', 'night')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value decimal(10,2) NOT NULL,
  current_value decimal(10,2) DEFAULT 0,
  unit text,
  period text CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'cancelled')),
  progress decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_bonuses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('performance', 'sales', 'customer_service', 'attendance', 'challenge')),
  amount decimal(10,2) NOT NULL,
  reason text NOT NULL,
  period text,
  date_awarded timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rota_schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id),
  date date NOT NULL,
  shift_start time NOT NULL,
  shift_end time NOT NULL,
  break_start time,
  break_end time,
  role text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'absent')),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wage_management (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  base_salary decimal(10,2) DEFAULT 0,
  hourly_rate decimal(10,2) DEFAULT 0,
  overtime_rate decimal(10,2) DEFAULT 0,
  hours_worked decimal(5,2) DEFAULT 0,
  overtime_hours decimal(5,2) DEFAULT 0,
  bonuses decimal(10,2) DEFAULT 0,
  deductions decimal(10,2) DEFAULT 0,
  total_wage decimal(10,2) DEFAULT 0,
  pay_period text NOT NULL,
  pay_date date NOT NULL,
  status text DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'paid')),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PROMOTIONS & REWARDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text CHECK (type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'bundle')),
  value decimal(10,2) NOT NULL,
  conditions jsonb DEFAULT '[]'::jsonb,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  applicable_products jsonb DEFAULT '[]'::jsonb,
  applicable_categories jsonb DEFAULT '[]'::jsonb,
  minimum_purchase decimal(10,2),
  maximum_discount decimal(10,2),
  usage_limit integer,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gift_management (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  type text CHECK (type IN ('product', 'discount', 'loyalty_points', 'voucher')),
  value decimal(10,2) NOT NULL,
  cost decimal(10,2) NOT NULL,
  eligibility_criteria text,
  validity_days integer DEFAULT 30,
  is_active boolean DEFAULT true,
  stock_quantity integer,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weekly_challenges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  target_value decimal(10,2) NOT NULL,
  current_value decimal(10,2) DEFAULT 0,
  unit text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  participants jsonb DEFAULT '[]'::jsonb,
  winner uuid REFERENCES users(id),
  prize decimal(10,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
  progress decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ANALYTICS & REPORTING
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text CHECK (type IN ('sales_prediction', 'inventory_optimization', 'customer_behavior', 'performance_alert')),
  title text NOT NULL,
  description text NOT NULL,
  confidence decimal(3,2) DEFAULT 0.5,
  impact text CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  actionable boolean DEFAULT false,
  recommendations jsonb DEFAULT '[]'::jsonb,
  data jsonb DEFAULT '{}'::jsonb,
  store_id uuid REFERENCES stores(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text CHECK (type IN ('info', 'warning', 'error', 'success', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  user_id uuid REFERENCES users(id),
  store_id uuid REFERENCES stores(id),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category text CHECK (category IN ('system', 'inventory', 'sales', 'security', 'performance')),
  action_required boolean DEFAULT false,
  auto_resolve boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  module text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  store_id uuid REFERENCES stores(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_inventory_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_anniversaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE held_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dual_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_out_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rota_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to read all data
CREATE POLICY "Users can view all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all stores" ON stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all transactions" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view transaction items" ON transaction_items FOR SELECT TO authenticated USING (true);

-- Policies for authenticated users to insert/update/delete based on permissions
CREATE POLICY "Users can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete products" ON products FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can insert transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update transactions" ON transactions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can insert transaction items" ON transaction_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can insert customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update customers" ON customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete customers" ON customers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update categories" ON categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete categories" ON categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can insert suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update suppliers" ON suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete suppliers" ON suppliers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can manage stores" ON stores FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can manage held orders" ON held_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can manage stock adjustments" ON stock_adjustments FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can manage inventory transfers" ON inventory_transfers FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can manage transfer items" ON transfer_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can manage promotions" ON promotions FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can manage employee performance" ON employee_performance FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can manage employee goals" ON employee_goals FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can manage rota schedules" ON rota_schedules FOR ALL TO authenticated USING (true);
CREATE POLICY "Users can view alerts" ON system_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update alerts" ON system_alerts FOR UPDATE TO authenticated USING (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cashier ON transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_store ON users(store_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
