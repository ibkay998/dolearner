// Script to make a user an admin
// Run this with: npx tsx scripts/make-admin.ts <user-email>

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
  console.error('Make sure .env.local contains:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_KEY');
  console.error('\nCurrent values:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function makeUserAdmin(email: string) {
  try {
    // Get user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      throw userError;
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    // Check if user is already an admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingAdmin) {
      console.log(`User ${email} is already an admin`);
      return;
    }

    // Make user an admin
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.id,
        role: 'admin',
        permissions: {
          manage_content: true,
          manage_users: false,
          view_analytics: true
        }
      });

    if (insertError) {
      throw insertError;
    }

    console.log(`Successfully made ${email} an admin`);
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: npx tsx scripts/make-admin.ts <user-email>');
  process.exit(1);
}

makeUserAdmin(email);
