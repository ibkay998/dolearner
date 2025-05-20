require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Create a Supabase client with the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define the challenges we want to migrate tests for
const challengeIds = [
  'button',
  'card',
  'counter',
  'data-fetching',
  'form',
  'tabs',
  'theme-switcher',
  'todo-list',
  'toggle'
];

// Function to extract test descriptions from test files
function extractTestDescriptions(fileContent) {
  const descriptions = [];
  const regex = /\/\/ Test \d+: (.*?)$/gm;
  let match;
  
  while ((match = regex.exec(fileContent)) !== null) {
    descriptions.push(match[1]);
  }
  
  return descriptions;
}

async function migrateTestsToDb() {
  console.log('Starting to migrate tests to the database...');
  
  try {
    // Process each challenge
    for (const challengeId of challengeIds) {
      console.log(`Processing tests for challenge: ${challengeId}`);
      
      // Read the test file
      const testFilePath = path.join(process.cwd(), 'tests', 'challenges', `${challengeId}.test.tsx`);
      
      if (!fs.existsSync(testFilePath)) {
        console.log(`Test file not found for challenge: ${challengeId}`);
        continue;
      }
      
      const testFileContent = fs.readFileSync(testFilePath, 'utf8');
      
      // Extract test descriptions
      const testDescriptions = extractTestDescriptions(testFileContent);
      
      if (testDescriptions.length === 0) {
        console.log(`No test descriptions found for challenge: ${challengeId}`);
        continue;
      }
      
      // Create test entries for each test
      for (let i = 0; i < testDescriptions.length; i++) {
        const description = testDescriptions[i];
        const testNumber = i + 1;
        
        // Create a test entry in the database
        const { data, error } = await supabase
          .from('challenge_tests')
          .upsert({
            challenge_id: challengeId,
            description: description,
            test_code: `// Test ${testNumber}: ${description}\n// This is a placeholder for the actual test code\n// The actual test implementation will be added later`,
            expected_result: { pass: true }
          }, {
            onConflict: 'challenge_id,description'
          });
        
        if (error) {
          console.error(`Error creating test for challenge ${challengeId}, test ${testNumber}:`, error);
        } else {
          console.log(`Created test for challenge ${challengeId}, test ${testNumber}: ${description}`);
        }
      }
    }
    
    console.log('Test migration completed!');
    return { success: true };
  } catch (error) {
    console.error('Error migrating tests:', error);
    return { success: false, error };
  }
}

// Execute the function
migrateTestsToDb()
  .then((result) => {
    if (result.success) {
      console.log('Test migration completed successfully!');
    } else {
      console.error('Test migration failed:', result.error);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
