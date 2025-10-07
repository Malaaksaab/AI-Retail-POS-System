/*
  # Seed Initial Data for POS System

  ## Purpose
  Populates the database with initial data for testing and development.
*/

-- Insert default stores
INSERT INTO stores (name, address, phone, email, status) VALUES
  ('Downtown Store', '123 Main St, London', '(555) 123-4567', 'downtown@bskproviders.com', 'active'),
  ('Mall Location', '456 Shopping Center, Manchester', '(555) 987-6543', 'mall@bskproviders.com', 'active'),
  ('Westside Branch', '789 West Ave, Birmingham', '(555) 456-7890', 'westside@bskproviders.com', 'active');

-- Get the first store ID for linking
DO $$
DECLARE
  first_store_id uuid;
BEGIN
  SELECT id INTO first_store_id FROM stores LIMIT 1;

  -- Insert store settings
  INSERT INTO store_settings (store_id, currency, currency_symbol, tax_rate, receipt_footer, loyalty_enabled, offline_mode)
  SELECT id, 'GBP', '£', 20.00, 'Thank you for shopping with us!', true, false
  FROM stores
  ON CONFLICT (store_id) DO NOTHING;

  -- Insert hardware configurations
  INSERT INTO hardware_config (store_id, barcode_scanner, printer, cash_drawer, card_reader, display)
  SELECT 
    id,
    '{"enabled": true, "type": "usb", "model": "Zebra DS2208"}'::jsonb,
    '{"enabled": true, "type": "thermal", "model": "Epson TM-T88", "paperSize": "80mm"}'::jsonb,
    '{"enabled": true, "type": "rj11", "model": "APG Vasario"}'::jsonb,
    '{"enabled": true, "type": "contactless", "model": "Verifone V400"}'::jsonb,
    '{"customerDisplay": true, "touchScreen": true, "size": "15inch"}'::jsonb
  FROM stores
  ON CONFLICT (store_id) DO NOTHING;

  -- Insert suppliers
  INSERT INTO suppliers (name, contact_person, email, phone, address, payment_terms, is_active) VALUES
    ('Apple Inc', 'John Smith', 'orders@apple.com', '1-800-MY-APPLE', 'Cupertino, CA', 'Net 30', true),
    ('Samsung Electronics', 'Sarah Kim', 'b2b@samsung.com', '1-800-SAMSUNG', 'Seoul, South Korea', 'Net 30', true),
    ('Sony Corporation', 'Mike Johnson', 'wholesale@sony.com', '1-800-222-SONY', 'Tokyo, Japan', 'Net 45', true),
    ('Microsoft', 'Emily Davis', 'orders@microsoft.com', '1-800-MICROSOFT', 'Redmond, WA', 'Net 30', true);

  -- Insert product categories for first store
  INSERT INTO categories (name, description, store_id, is_active, display_order) VALUES
    ('Electronics', 'Electronic devices and accessories', first_store_id, true, 1),
    ('Computers', 'Laptops, desktops and accessories', first_store_id, true, 2),
    ('Mobile Phones', 'Smartphones and tablets', first_store_id, true, 3),
    ('Audio', 'Headphones, speakers and audio accessories', first_store_id, true, 4),
    ('Gaming', 'Gaming consoles and accessories', first_store_id, true, 5);

  -- Insert sample products
  INSERT INTO products (store_id, category_id, supplier_id, name, description, barcode, price, cost, stock, min_stock, max_stock, is_active, taxable, track_stock)
  SELECT 
    first_store_id,
    c.id,
    s.id,
    p.name,
    p.description,
    p.barcode,
    p.price,
    p.cost,
    p.stock,
    p.min_stock,
    p.max_stock,
    true,
    true,
    true
  FROM (VALUES
    ('Mobile Phones', 'Apple Inc', 'iPhone 15 Pro', 'Latest iPhone with advanced features', '123456789', 849.00, 650.00, 25, 5, 100),
    ('Mobile Phones', 'Samsung Electronics', 'Samsung Galaxy S24', 'Samsung flagship smartphone', '987654321', 699.00, 520.00, 30, 5, 100),
    ('Audio', 'Apple Inc', 'AirPods Pro', 'Wireless noise-canceling earbuds', '456789123', 219.00, 160.00, 50, 10, 100),
    ('Computers', 'Apple Inc', 'MacBook Air M2', 'Ultra-thin laptop with M2 chip', '789123456', 1199.00, 950.00, 3, 5, 50),
    ('Mobile Phones', 'Apple Inc', 'iPad Air', 'Versatile tablet for work and play', '321654987', 599.00, 450.00, 15, 8, 50),
    ('Gaming', 'Sony Corporation', 'PlayStation 5', 'Next-gen gaming console', '111222333', 449.00, 380.00, 12, 5, 30),
    ('Gaming', 'Microsoft', 'Xbox Series X', 'Powerful gaming console', '444555666', 449.00, 380.00, 8, 5, 30),
    ('Audio', 'Sony Corporation', 'Sony WH-1000XM5', 'Premium noise-canceling headphones', '777888999', 349.00, 250.00, 20, 10, 50)
  ) AS p(category_name, supplier_name, name, description, barcode, price, cost, stock, min_stock, max_stock)
  JOIN categories c ON c.name = p.category_name
  JOIN suppliers s ON s.name = p.supplier_name;

  -- Insert sample customers
  INSERT INTO customers (name, email, phone, address, loyalty_points, total_purchases, tier, is_active) VALUES
    ('John Smith', 'john@email.com', '555-0123', '123 Main St', 150, 2500, 'silver', true),
    ('Sarah Wilson', 'sarah@email.com', '555-0456', '456 Oak Ave', 300, 5200, 'gold', true),
    ('Mike Johnson', 'mike@email.com', '555-0789', '789 Pine St', 75, 1200, 'bronze', true),
    ('Emma Davis', 'emma@email.com', '555-0321', '321 Elm St', 450, 8900, 'gold', true),
    ('Alex Chen', 'alex@email.com', '555-0654', '654 Maple Ave', 200, 3400, 'silver', true);

END $$;
