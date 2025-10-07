import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser(email, password, name, role, storeId = null) {
  try {
    console.log(`\nCreating user: ${email} (${role})...`);

    // First, create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role
      }
    });

    if (authError) {
      console.error(`  ❌ Auth error for ${email}:`, authError.message);
      return null;
    }

    console.log(`  ✓ Auth user created: ${authData.user.id}`);

    // Then create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email,
        name,
        role,
        store_id: storeId,
        is_active: true
      })
      .select()
      .single();

    if (userError) {
      console.error(`  ❌ Profile error for ${email}:`, userError.message);
      return null;
    }

    console.log(`  ✓ User profile created: ${userData.id}`);
    console.log(`  ✓ SUCCESS: ${name} (${role})`);

    return userData;

  } catch (error) {
    console.error(`  ❌ Unexpected error for ${email}:`, error);
    return null;
  }
}

async function main() {
  console.log('========================================');
  console.log('BSK Providers - User Creation Script');
  console.log('========================================');

  // Get first store ID
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name')
    .limit(1);

  const storeId = stores && stores.length > 0 ? stores[0].id : null;
  console.log(`\nUsing store: ${stores?.[0]?.name || 'No store found'}`);

  // Create users
  const users = [
    {
      email: 'admin@bskproviders.com',
      password: 'Admin123!@#',
      name: 'System Administrator',
      role: 'admin',
      storeId: null
    },
    {
      email: 'manager@bskproviders.com',
      password: 'Manager123!@#',
      name: 'Store Manager',
      role: 'manager',
      storeId: storeId
    },
    {
      email: 'cashier@bskproviders.com',
      password: 'Cashier123!@#',
      name: 'Cashier User',
      role: 'cashier',
      storeId: storeId
    }
  ];

  const results = [];
  for (const user of users) {
    const result = await createUser(
      user.email,
      user.password,
      user.name,
      user.role,
      user.storeId
    );
    if (result) {
      results.push({
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role
      });
    }
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n========================================');
  console.log('USER CREATION COMPLETED');
  console.log('========================================\n');

  console.log('✅ LOGIN CREDENTIALS:\n');
  results.forEach(user => {
    console.log(`${user.role.toUpperCase()}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Name:     ${user.name}`);
    console.log('');
  });

  console.log('========================================\n');

  process.exit(0);
}

main().catch(console.error);
