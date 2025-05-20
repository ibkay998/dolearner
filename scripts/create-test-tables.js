require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to check if a table exists
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    return !error;
  } catch (error) {
    return false;
  }
}

// Function to create a test case for a challenge
async function createTestCase(challengeId, description, testCode) {
  try {
    const { data, error } = await supabase
      .from('challenge_tests')
      .insert({
        challenge_id: challengeId,
        description,
        test_code: testCode,
        expected_result: { pass: true }
      });

    if (error) {
      console.error(`Error creating test case for ${challengeId}:`, error);
      return false;
    }

    console.log(`Created test case for ${challengeId}: ${description}`);
    return true;
  } catch (error) {
    console.error(`Error creating test case for ${challengeId}:`, error);
    return false;
  }
}

async function createTestTables() {
  console.log('Setting up challenge_tests table...');

  try {
    // Check if the table already exists
    const exists = await tableExists('challenge_tests');

    if (exists) {
      console.log('challenge_tests table already exists!');
      return { success: true };
    }

    // Create a sample test to see if the table exists
    const { error } = await supabase
      .from('challenge_tests')
      .insert({
        challenge_id: 'test',
        description: 'Test description',
        test_code: 'Test code',
        expected_result: { pass: true }
      });

    if (!error) {
      console.log('challenge_tests table exists and is working!');

      // Clean up the test entry
      await supabase
        .from('challenge_tests')
        .delete()
        .eq('challenge_id', 'test');

      return { success: true };
    }

    // If we get here, we need to create the table
    console.log('Creating challenge_tests table...');

    // Try to create the table using SQL
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS challenge_tests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          challenge_id TEXT NOT NULL,
          description TEXT NOT NULL,
          test_code TEXT NOT NULL,
          expected_result JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_challenge_tests_challenge_id ON challenge_tests(challenge_id);
      `
    });

    if (sqlError) {
      console.error('Error creating table with SQL:', sqlError);
      return { success: false, error: sqlError };
    }

    console.log('Successfully created challenge_tests table!');
    return { success: true };
  } catch (error) {
    console.error('Error creating tables:', error);
    return { success: false, error };
  }
}

// Execute the function
createTestTables()
  .then((result) => {
    if (result.success) {
      console.log('Database setup completed successfully!');
    } else {
      console.error('Database setup failed:', result.error);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
