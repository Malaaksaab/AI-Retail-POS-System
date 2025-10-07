/*
  # Invoice & Financial Management System

  1. New Tables
    - `invoices` - Customer invoices with line items, tax, totals
    - `invoice_items` - Individual line items on invoices
    - `invoice_payments` - Payment tracking and application
    - `tax_rates` - Configurable tax rates
    - `system_settings` - System-wide settings and preferences

  2. Extensions to Existing Tables
    - Add invoice tracking fields to customers
    - Add SKU and category fields to products

  3. Security
    - Enable RLS on all new tables
    - Policies for store-based and role-based access

  4. Automation
    - Auto-generate invoice numbers
    - Auto-update invoice totals
    - Auto-update customer balances
    - Auto-apply payments to invoices
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE RESTRICT,
  store_id uuid REFERENCES stores(id) ON DELETE RESTRICT,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  discount_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  amount_paid decimal(10,2) NOT NULL DEFAULT 0,
  balance_due decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes text,
  terms text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity decimal(10,2) NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  tax_rate decimal(5,2) NOT NULL DEFAULT 0,
  discount_percent decimal(5,2) NOT NULL DEFAULT 0,
  line_total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create invoice_payments table
CREATE TABLE IF NOT EXISTS invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE RESTRICT,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'check', 'other')),
  reference_number text,
  notes text,
  recorded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create tax_rates table
CREATE TABLE IF NOT EXISTS tax_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rate decimal(5,2) NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Add fields to customers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'credit_limit'
  ) THEN
    ALTER TABLE customers ADD COLUMN credit_limit decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'current_balance'
  ) THEN
    ALTER TABLE customers ADD COLUMN current_balance decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'payment_terms'
  ) THEN
    ALTER TABLE customers ADD COLUMN payment_terms text DEFAULT 'Net 30';
  END IF;
END $$;

-- Add fields to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku_code'
  ) THEN
    ALTER TABLE products ADD COLUMN sku_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE products ADD COLUMN cost_price decimal(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'tax_rate'
  ) THEN
    ALTER TABLE products ADD COLUMN tax_rate decimal(5,2) DEFAULT 0;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_store ON invoices(store_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_customers_balance ON customers(current_balance);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices from their store"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM users WHERE id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create invoices for their store"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    store_id IN (
      SELECT store_id FROM users WHERE id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update invoices from their store"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM users WHERE id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for invoice_items
CREATE POLICY "Users can view invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE
        store_id IN (SELECT store_id FROM users WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Users can manage invoice items"
  ON invoice_items FOR ALL
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE
        store_id IN (SELECT store_id FROM users WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- RLS Policies for invoice_payments
CREATE POLICY "Users can view invoice payments"
  ON invoice_payments FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE
        store_id IN (SELECT store_id FROM users WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Users can manage invoice payments"
  ON invoice_payments FOR ALL
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE
        store_id IN (SELECT store_id FROM users WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- RLS Policies for tax_rates
CREATE POLICY "Users can view active tax rates"
  ON tax_rates FOR SELECT
  TO authenticated
  USING (is_active = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage tax rates"
  ON tax_rates FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for system_settings
CREATE POLICY "Users can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage system settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Insert default tax rates
INSERT INTO tax_rates (name, rate, description, is_active)
VALUES
  ('Standard Rate', 8.5, 'Standard tax rate', true),
  ('Reduced Rate', 5.0, 'Reduced tax rate for specific items', true),
  ('Zero Rate', 0.0, 'No tax', true)
ON CONFLICT DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES
  ('invoice_prefix', '{"value": "INV"}', 'Prefix for invoice numbers'),
  ('invoice_terms', '{"value": "Payment due within 30 days"}', 'Default invoice payment terms'),
  ('default_currency', '{"code": "USD", "symbol": "$"}', 'Default currency settings'),
  ('aging_periods', '{"periods": [30, 60, 90]}', 'Aging report periods in days')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix text;
  next_num integer;
  new_invoice_num text;
BEGIN
  SELECT (setting_value->>'value') INTO prefix
  FROM system_settings
  WHERE setting_key = 'invoice_prefix';

  IF prefix IS NULL THEN
    prefix := 'INV';
  END IF;

  SELECT COUNT(*) + 1 INTO next_num FROM invoices;
  new_invoice_num := prefix || '-' || LPAD(next_num::text, 6, '0');

  WHILE EXISTS (SELECT 1 FROM invoices WHERE invoice_number = new_invoice_num) LOOP
    next_num := next_num + 1;
    new_invoice_num := prefix || '-' || LPAD(next_num::text, 6, '0');
  END LOOP;

  NEW.invoice_number := new_invoice_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON invoices;
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

-- Create function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET
    subtotal = (SELECT COALESCE(SUM(line_total), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id),
    tax_amount = (SELECT COALESCE(SUM(line_total * tax_rate / 100), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id),
    updated_at = now()
  WHERE id = NEW.invoice_id;

  UPDATE invoices
  SET
    total_amount = subtotal + tax_amount - discount_amount,
    balance_due = subtotal + tax_amount - discount_amount - amount_paid,
    updated_at = now()
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_invoice_totals ON invoice_items;
CREATE TRIGGER trigger_update_invoice_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_totals();

-- Create function to update customer balance
CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET current_balance = (
    SELECT COALESCE(SUM(balance_due), 0)
    FROM invoices
    WHERE customer_id = NEW.customer_id AND status != 'cancelled'
  )
  WHERE id = NEW.customer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customer_balance ON invoices;
CREATE TRIGGER trigger_update_customer_balance
  AFTER INSERT OR UPDATE OF balance_due ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_balance();

-- Create function to apply payment to invoice
CREATE OR REPLACE FUNCTION apply_payment_to_invoice()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET
    amount_paid = amount_paid + NEW.amount,
    balance_due = total_amount - (amount_paid + NEW.amount),
    status = CASE
      WHEN (amount_paid + NEW.amount) >= total_amount THEN 'paid'
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_apply_payment ON invoice_payments;
CREATE TRIGGER trigger_apply_payment
  AFTER INSERT ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION apply_payment_to_invoice();
