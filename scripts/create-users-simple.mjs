import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser(email, password, name, role, storeId) {
  try {
    console.log(`Creating ${role}: ${email}...`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (authError) throw authError;

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

    if (userError) throw userError;

    console.log(`✅ ${name} created successfully`);
    return userData;

  } catch (error) {
    console.error(`❌ Error creating ${email}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('\n=== Creating Users ===\n');

  const { data: stores } = await supabase.from('stores').select('id').limit(1);
  const storeId = stores?.[0]?.id;

  await createUser('admin@bskproviders.com', 'Admin123!@#', 'System Administrator', 'admin', null);
  await new Promise(r => setTimeout(r, 1000));
  
  await createUser('manager@bskproviders.com', 'Manager123!@#', 'Store Manager', 'manager', storeId);
  await new Promise(r => setTimeout(r, 1000));
  
  await createUser('cashier@bskproviders.com', 'Cashier123!@#', 'Cashier User', 'cashier', storeId);

  console.log('\n=== Login Credentials ===\n');
  console.log('ADMIN:');
  console.log('  Email: admin@bskproviders.com');
  console.log('  Password: Admin123!@#\n');
  console.log('MANAGER:');
  console.log('  Email: manager@bskproviders.com');
  console.log('  Password: Manager123!@#\n');
  console.log('CASHIER:');
  console.log('  Email: cashier@bskproviders.com');
  console.log('  Password: Cashier123!@#\n');
}

main().then(() => process.exit(0)).catch(console.error);
