import { db } from './database';
import { supabase } from '../lib/supabase';

export async function initializeDemoData() {
  try {
    const existingUsers = await db.users.getAll();
    if (existingUsers.length > 0) {
      return;
    }

    const demoStores = [
      {
        name: 'Downtown Store',
        address: '123 Main St',
        phone: '(555) 123-4567',
        email: 'downtown@retailpos.com',
        status: 'active',
        manager: 'Mike Chen'
      },
      {
        name: 'Mall Location',
        address: '456 Shopping Center',
        phone: '(555) 987-6543',
        email: 'mall@retailpos.com',
        status: 'active',
        manager: 'Lisa Wong'
      },
      {
        name: 'Westside Branch',
        address: '789 West Ave',
        phone: '(555) 456-7890',
        email: 'westside@retailpos.com',
        status: 'active',
        manager: 'Tom Rodriguez'
      }
    ];

    const createdStores = [];
    for (const store of demoStores) {
      const newStore = await db.stores.create({
        ...store,
        settings: {
          currency: 'USD',
          currency_symbol: '$',
          tax_rate: 8.5,
          receipt_footer: 'Thank you for your business!',
          loyalty_enabled: true,
          offline_mode: false
        },
        hardware: {
          barcode_scanner: { enabled: true, type: 'usb', model: 'Honeywell Voyager 1200g' },
          printer: { enabled: true, type: 'thermal', model: 'Epson TM-T88V', paperSize: '80mm' },
          cash_drawer: { enabled: true, type: 'rj11', model: 'APG Vasario' },
          card_reader: { enabled: true, type: 'chip', model: 'Ingenico iCT250' },
          display: { customerDisplay: true, touchScreen: true, size: '15-inch' }
        }
      });
      createdStores.push(newStore);
    }

    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@retailpos.com',
        password: 'admin123',
        role: 'admin',
        store_id: null,
        is_active: true,
        ai_access: true,
        system_level: 'corporate'
      },
      {
        name: 'Manager User',
        email: 'manager@retailpos.com',
        password: 'manager123',
        role: 'manager',
        store_id: createdStores[0].id,
        is_active: true,
        ai_access: false,
        system_level: 'store'
      },
      {
        name: 'Cashier User',
        email: 'cashier@retailpos.com',
        password: 'cashier123',
        role: 'cashier',
        store_id: createdStores[0].id,
        is_active: true,
        ai_access: false,
        system_level: 'store'
      }
    ];

    for (const user of demoUsers) {
      const { password, ...userData } = user;

      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: user.email,
          password: password,
          options: {
            data: {
              name: user.name,
              role: user.role
            }
          }
        });

        if (signUpError && !signUpError.message.includes('already registered')) {
          console.error(`Failed to create auth user ${user.email}:`, signUpError);
        }

        await db.users.create(userData);
      } catch (err: any) {
        if (!err.message.includes('duplicate')) {
          console.error(`Error creating user ${user.email}:`, err);
        }
      }
    }

    const demoCategories = [
      { name: 'Electronics', description: 'Electronic devices and accessories', color: '#3b82f6', icon: 'Laptop', is_active: true },
      { name: 'Clothing', description: 'Apparel and accessories', color: '#8b5cf6', icon: 'Shirt', is_active: true },
      { name: 'Food & Beverages', description: 'Food items and drinks', color: '#10b981', icon: 'Coffee', is_active: true },
      { name: 'Home & Garden', description: 'Home improvement and garden supplies', color: '#f59e0b', icon: 'Home', is_active: true },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', color: '#ef4444', icon: 'Dumbbell', is_active: true }
    ];

    const createdCategories = [];
    for (const category of demoCategories) {
      const newCategory = await db.categories.create(category);
      createdCategories.push(newCategory);
    }

    const demoSuppliers = [
      {
        name: 'Tech Solutions Inc',
        contact_person: 'John Smith',
        email: 'john@techsolutions.com',
        phone: '(555) 111-2222',
        address: '100 Tech Drive, Silicon Valley, CA',
        payment_terms: 'Net 30',
        is_active: true
      },
      {
        name: 'Fashion Distributors',
        contact_person: 'Mary Johnson',
        email: 'mary@fashiondist.com',
        phone: '(555) 222-3333',
        address: '200 Fashion Ave, New York, NY',
        payment_terms: 'Net 45',
        is_active: true
      }
    ];

    const createdSuppliers = [];
    for (const supplier of demoSuppliers) {
      const newSupplier = await db.suppliers.create(supplier);
      createdSuppliers.push(newSupplier);
    }

    const demoProducts = [
      {
        name: 'Wireless Mouse',
        barcode: '1234567890123',
        category_id: createdCategories[0].id,
        price: 29.99,
        cost: 15.00,
        stock: 50,
        min_stock: 10,
        max_stock: 100,
        description: 'Ergonomic wireless mouse with USB receiver',
        store_id: createdStores[0].id,
        supplier_id: createdSuppliers[0].id,
        is_active: true,
        taxable: true,
        track_stock: true,
        sell_by_weight: false,
        age_restricted: false
      },
      {
        name: 'Cotton T-Shirt',
        barcode: '2345678901234',
        category_id: createdCategories[1].id,
        price: 19.99,
        cost: 8.00,
        stock: 100,
        min_stock: 20,
        max_stock: 200,
        description: '100% cotton comfortable t-shirt',
        store_id: createdStores[0].id,
        supplier_id: createdSuppliers[1].id,
        is_active: true,
        taxable: true,
        track_stock: true,
        sell_by_weight: false,
        age_restricted: false
      },
      {
        name: 'Coffee Beans',
        barcode: '3456789012345',
        category_id: createdCategories[2].id,
        price: 12.99,
        cost: 6.00,
        stock: 75,
        min_stock: 15,
        max_stock: 150,
        description: 'Premium arabica coffee beans',
        store_id: createdStores[0].id,
        is_active: true,
        taxable: false,
        track_stock: true,
        sell_by_weight: false,
        age_restricted: false
      }
    ];

    for (const product of demoProducts) {
      await db.products.create(product);
    }

    const demoCustomers = [
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        address: '123 Customer St',
        loyalty_points: 150,
        total_purchases: 450.00,
        tier: 'gold',
        is_active: true
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '(555) 234-5678',
        address: '456 Buyer Ave',
        loyalty_points: 75,
        total_purchases: 220.00,
        tier: 'silver',
        is_active: true
      }
    ];

    for (const customer of demoCustomers) {
      await db.customers.create(customer);
    }

    console.log('Demo data initialized successfully');
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}
