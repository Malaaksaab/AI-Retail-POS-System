/*
  # Fix Security and Performance Issues - Version 2

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - Indexes for all foreign key columns to improve query performance

  ### 2. Remove Duplicate Indexes
  - Drop redundant indexes

  ### 3. Add Missing RLS Policies
  - Add policies for tables with RLS enabled but no policies

  ### 4. Fix Function Search Paths
  - Set search_path to empty for security functions
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- AI Insights
CREATE INDEX IF NOT EXISTS idx_ai_insights_store_id ON ai_insights(store_id);

-- Audit Logs  
CREATE INDEX IF NOT EXISTS idx_audit_logs_store_id ON audit_logs(store_id);

-- Auto Inventory Rules
CREATE INDEX IF NOT EXISTS idx_auto_inventory_rules_product_id ON auto_inventory_rules(product_id);
CREATE INDEX IF NOT EXISTS idx_auto_inventory_rules_store_id ON auto_inventory_rules(store_id);
CREATE INDEX IF NOT EXISTS idx_auto_inventory_rules_supplier_id ON auto_inventory_rules(supplier_id);

-- Cash Out Sessions
CREATE INDEX IF NOT EXISTS idx_cash_out_sessions_cashier_id ON cash_out_sessions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_cash_out_sessions_reviewed_by ON cash_out_sessions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_cash_out_sessions_store_id ON cash_out_sessions(store_id);

-- Customer Anniversaries
CREATE INDEX IF NOT EXISTS idx_customer_anniversaries_customer_id ON customer_anniversaries(customer_id);

-- Customer Preferences
CREATE INDEX IF NOT EXISTS idx_customer_preferences_customer_id ON customer_preferences(customer_id);

-- Dual Payments
CREATE INDEX IF NOT EXISTS idx_dual_payments_transaction_id ON dual_payments(transaction_id);

-- Employee Bonuses
CREATE INDEX IF NOT EXISTS idx_employee_bonuses_employee_id ON employee_bonuses(employee_id);

-- Employee Performance
CREATE INDEX IF NOT EXISTS idx_employee_performance_store_id ON employee_performance(store_id);

-- Purchase Orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_store_id ON purchase_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON purchase_orders(created_by);

-- Purchase Order Items
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items(product_id);

-- Rota Schedules
CREATE INDEX IF NOT EXISTS idx_rota_schedules_employee_id ON rota_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_rota_schedules_store_id ON rota_schedules(store_id);

-- Stock Adjustments
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product_id ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_store_id ON stock_adjustments(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_adjusted_by ON stock_adjustments(adjusted_by);

-- System Alerts
CREATE INDEX IF NOT EXISTS idx_system_alerts_user_id ON system_alerts(user_id);

-- Transfer Items
CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer_id ON transfer_items(transfer_id);
CREATE INDEX IF NOT EXISTS idx_transfer_items_product_id ON transfer_items(product_id);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_approved_by ON transactions(approved_by);

-- User Permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Wage Management
CREATE INDEX IF NOT EXISTS idx_wage_management_employee_id ON wage_management(employee_id);

-- Weekly Challenges
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_winner ON weekly_challenges(winner);

-- Products Supplier
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);

-- Loyalty Points
CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);

-- Inventory Transfers
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_approved_by ON inventory_transfers(approved_by);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_requested_by ON inventory_transfers(requested_by);

-- Held Orders
CREATE INDEX IF NOT EXISTS idx_held_orders_cashier_id ON held_orders(cashier_id);
CREATE INDEX IF NOT EXISTS idx_held_orders_customer_id ON held_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_held_orders_store_id ON held_orders(store_id);

-- ============================================================================
-- 2. REMOVE DUPLICATE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_products_store;
DROP INDEX IF EXISTS idx_transactions_cashier;
DROP INDEX IF EXISTS idx_transactions_customer;
DROP INDEX IF EXISTS idx_transactions_store;
DROP INDEX IF EXISTS idx_users_store;

-- ============================================================================
-- 3. ADD MISSING RLS POLICIES
-- ============================================================================

-- AI Insights
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_insights' AND policyname = 'Authenticated users can view ai_insights'
  ) THEN
    CREATE POLICY "Authenticated users can view ai_insights" ON ai_insights
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_insights' AND policyname = 'Admins can manage ai_insights'
  ) THEN
    CREATE POLICY "Admins can manage ai_insights" ON ai_insights
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid()) AND users.role = 'admin'
        )
      );
  END IF;
END $$;

-- Auto Inventory Rules
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'auto_inventory_rules' AND policyname = 'Authenticated users can view auto_inventory_rules'
  ) THEN
    CREATE POLICY "Authenticated users can view auto_inventory_rules" ON auto_inventory_rules
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'auto_inventory_rules' AND policyname = 'Managers can manage auto_inventory_rules'
  ) THEN
    CREATE POLICY "Managers can manage auto_inventory_rules" ON auto_inventory_rules
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'manager')
        )
      );
  END IF;
END $$;

-- Cash Out Sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cash_out_sessions' AND policyname = 'Users can view own cash_out_sessions'
  ) THEN
    CREATE POLICY "Users can view own cash_out_sessions" ON cash_out_sessions
      FOR SELECT TO authenticated
      USING (
        cashier_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cash_out_sessions' AND policyname = 'Cashiers can manage own cash_out_sessions'
  ) THEN
    CREATE POLICY "Cashiers can manage own cash_out_sessions" ON cash_out_sessions
      FOR ALL TO authenticated
      USING (
        cashier_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'manager')
        )
      );
  END IF;
END $$;

-- Customer Preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customer_preferences' AND policyname = 'Authenticated users can manage customer_preferences'
  ) THEN
    CREATE POLICY "Authenticated users can manage customer_preferences" ON customer_preferences
      FOR ALL TO authenticated
      USING (true);
  END IF;
END $$;

-- Dual Payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'dual_payments' AND policyname = 'Authenticated users can manage dual_payments'
  ) THEN
    CREATE POLICY "Authenticated users can manage dual_payments" ON dual_payments
      FOR ALL TO authenticated
      USING (true);
  END IF;
END $$;

-- Gift Management
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gift_management' AND policyname = 'Authenticated users can view gift_management'
  ) THEN
    CREATE POLICY "Authenticated users can view gift_management" ON gift_management
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gift_management' AND policyname = 'Managers can manage gift_management'
  ) THEN
    CREATE POLICY "Managers can manage gift_management" ON gift_management
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'manager')
        )
      );
  END IF;
END $$;

-- Loyalty Points
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loyalty_points' AND policyname = 'Authenticated users can manage loyalty_points'
  ) THEN
    CREATE POLICY "Authenticated users can manage loyalty_points" ON loyalty_points
      FOR ALL TO authenticated
      USING (true);
  END IF;
END $$;

-- Purchase Orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Authenticated users can view purchase_orders'
  ) THEN
    CREATE POLICY "Authenticated users can view purchase_orders" ON purchase_orders
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'purchase_orders' AND policyname = 'Managers can manage purchase_orders'
  ) THEN
    CREATE POLICY "Managers can manage purchase_orders" ON purchase_orders
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'manager')
        )
      );
  END IF;
END $$;

-- Purchase Order Items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'purchase_order_items' AND policyname = 'Authenticated users can manage purchase_order_items'
  ) THEN
    CREATE POLICY "Authenticated users can manage purchase_order_items" ON purchase_order_items
      FOR ALL TO authenticated
      USING (true);
  END IF;
END $$;

-- User Permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_permissions' AND policyname = 'Users can view own permissions'
  ) THEN
    CREATE POLICY "Users can view own permissions" ON user_permissions
      FOR SELECT TO authenticated
      USING (user_id = (select auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_permissions' AND policyname = 'Admins can manage user_permissions'
  ) THEN
    CREATE POLICY "Admins can manage user_permissions" ON user_permissions
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid()) AND users.role = 'admin'
        )
      );
  END IF;
END $$;

-- Wage Management
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wage_management' AND policyname = 'Users can view own wage_management'
  ) THEN
    CREATE POLICY "Users can view own wage_management" ON wage_management
      FOR SELECT TO authenticated
      USING (
        employee_id = (select auth.uid()) OR
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role IN ('admin', 'manager')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wage_management' AND policyname = 'Admins can manage wage_management'
  ) THEN
    CREATE POLICY "Admins can manage wage_management" ON wage_management
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid()) AND users.role = 'admin'
        )
      );
  END IF;
END $$;

-- Weekly Challenges
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'weekly_challenges' AND policyname = 'Authenticated users can view weekly_challenges'
  ) THEN
    CREATE POLICY "Authenticated users can view weekly_challenges" ON weekly_challenges
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'weekly_challenges' AND policyname = 'Admins can manage weekly_challenges'
  ) THEN
    CREATE POLICY "Admins can manage weekly_challenges" ON weekly_challenges
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid()) AND users.role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 4. FIX FUNCTION SEARCH PATHS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
