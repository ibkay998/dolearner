// Script to populate the database with tests for challenges
import { createClient } from '@supabase/supabase-js';
import { allTests } from '../app/admin/tests/all-tests';

// This script should be run with environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateTests() {
  console.log('Starting to populate tests...');

  // For each challenge
  for (const [challengeId, tests] of Object.entries(allTests)) {
    console.log(`Processing tests for challenge: ${challengeId}`);

    // For each test in the challenge
    for (const [testName, testCode] of Object.entries(tests)) {
      // Format the test name for description (convert camelCase to spaces)
      const description = testName.split(/(?=[A-Z])/).join(' ');
      
      console.log(`  - Adding test: ${description}`);

      try {
        // Check if the test already exists
        const { data: existingTests, error: queryError } = await supabase
          .from('challenge_tests')
          .select('*')
          .eq('challenge_id', challengeId)
          .eq('description', description);

        if (queryError) {
          console.error(`Error checking for existing test: ${queryError.message}`);
          continue;
        }

        // If the test already exists, update it
        if (existingTests && existingTests.length > 0) {
          const { error: updateError } = await supabase
            .from('challenge_tests')
            .update({
              test_code: testCode,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingTests[0].id);

          if (updateError) {
            console.error(`Error updating test: ${updateError.message}`);
          } else {
            console.log(`    Updated existing test: ${description}`);
          }
        } else {
          // Otherwise, insert a new test
          const { error: insertError } = await supabase
            .from('challenge_tests')
            .insert({
              challenge_id: challengeId,
              description,
              test_code: testCode,
              expected_result: { pass: true },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error(`Error inserting test: ${insertError.message}`);
          } else {
            console.log(`    Added new test: ${description}`);
          }
        }
      } catch (error) {
        console.error(`Error processing test ${description}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  console.log('Finished populating tests!');
}

// Run the function
populateTests()
  .catch(error => {
    console.error('Error in populate-tests script:', error);
    process.exit(1);
  });
