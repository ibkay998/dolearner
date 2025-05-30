// Script to test admin functionality
// Run this with: npx tsx scripts/test-admin.ts

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env.local manually
try {
  const envFile = readFileSync('.env.local', 'utf8');
  const envVars = envFile.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {} as Record<string, string>);

  // Set environment variables
  Object.assign(process.env, envVars);
} catch (error) {
  console.error('Could not read .env.local file');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAdminSetup() {
  try {
    console.log('🔍 Testing admin setup...\n');

    // Test 1: Check if admin tables exist
    console.log('1. Checking admin tables...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);

    if (adminError) {
      console.error('❌ Admin users table not found:', adminError.message);
      return;
    }
    console.log('✅ Admin users table exists');

    // Test 2: Check if path categories exist
    console.log('\n2. Checking path categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('path_categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ Path categories table not found:', categoriesError.message);
      return;
    }
    console.log(`✅ Found ${categories?.length || 0} path categories`);
    categories?.forEach(cat => console.log(`   - ${cat.name} (${cat.slug})`));

    // Test 3: Check if learning paths exist
    console.log('\n3. Checking learning paths...');
    const { data: paths, error: pathsError } = await supabase
      .from('learning_paths')
      .select('*');

    if (pathsError) {
      console.error('❌ Learning paths table not found:', pathsError.message);
      return;
    }
    console.log(`✅ Found ${paths?.length || 0} learning paths`);
    paths?.forEach(path => console.log(`   - ${path.name} (${path.slug})`));

    // Test 4: Check if challenges_new table exists
    console.log('\n4. Checking challenges table...');
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges_new')
      .select('*')
      .limit(5);

    if (challengesError) {
      console.error('❌ Challenges table not found:', challengesError.message);
      return;
    }
    console.log(`✅ Challenges table exists (showing first ${challenges?.length || 0} entries)`);

    // Test 5: Check if test cases table exists
    console.log('\n5. Checking test cases table...');
    const { data: tests, error: testsError } = await supabase
      .from('challenge_tests_new')
      .select('*')
      .limit(5);

    if (testsError) {
      console.error('❌ Test cases table not found:', testsError.message);
      return;
    }
    console.log(`✅ Test cases table exists (showing first ${tests?.length || 0} entries)`);

    // Test 6: Check admin users
    console.log('\n6. Checking admin users...');
    const { data: admins, error: adminsError } = await supabase
      .from('admin_users')
      .select('*');

    if (adminsError) {
      console.error('❌ Error fetching admin users:', adminsError.message);
      return;
    }
    console.log(`✅ Found ${admins?.length || 0} admin users`);

    // Get user emails separately
    for (const admin of admins || []) {
      const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id);
      console.log(`   - ${userData.user?.email || 'Unknown'} (${admin.role})`);
    }

    console.log('\n🎉 Admin setup test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Sign in with your admin account: gbemiga46@gmail.com');
    console.log('3. Navigate to /admin to access the admin dashboard');
    console.log('4. Start creating learning paths and challenges!');

  } catch (error) {
    console.error('❌ Error during admin setup test:', error);
  }
}

testAdminSetup();
