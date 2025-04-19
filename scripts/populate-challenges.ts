import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually import the challenge data
const reactChallengesPath = path.join(process.cwd(), 'data', 'challenges', 'react.ts');
const cssChallengesPath = path.join(process.cwd(), 'data', 'challenges', 'css.ts');

// Read and parse the challenge files
const readChallengesFile = (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf8');
  // Extract the array from the file content using regex
  const match = content.match(/export const \w+Challenges: Challenge\[\] = \[(.*?)\];/s);
  if (!match || !match[1]) {
    console.error(`Failed to parse challenges from ${filePath}`);
    return [];
  }

  // Create a temporary file to evaluate the challenges
  const tempFile = path.join(process.cwd(), 'temp-challenges.js');
  fs.writeFileSync(tempFile, `module.exports = [${match[1]}];`);

  try {
    // Require the temporary file to get the challenges
    const challenges = require(tempFile);
    // Clean up the temporary file
    fs.unlinkSync(tempFile);
    return challenges;
  } catch (error) {
    console.error(`Error evaluating challenges from ${filePath}:`, error);
    // Clean up the temporary file if it exists
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    return [];
  }
};

// Get the challenges
const reactChallenges = readChallengesFile(reactChallengesPath);
const cssChallenges = readChallengesFile(cssChallengesPath);

// Combine all challenges
const allChallenges = [...reactChallenges, ...cssChallenges];

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateChallenges() {
  console.log('Starting to populate challenges...');

  try {
    // Convert challenges to the format expected by the database
    const challengesForDb = allChallenges.map(challenge => ({
      id: challenge.id,
      path_id: challenge.pathId,
      title: challenge.title,
      description: challenge.description,
      initial_code: challenge.initialCode,
      solution_code: challenge.solutionCode,
      solution_marker: challenge.solutionMarker,
      order_num: challenge.order || 0
    }));

    // Insert challenges into the database
    const { data, error } = await supabase
      .from('challenges')
      .upsert(challengesForDb, {
        onConflict: 'id'
      });

    if (error) {
      throw error;
    }

    console.log(`Successfully populated ${challengesForDb.length} challenges!`);
    return { success: true, count: challengesForDb.length };
  } catch (error) {
    console.error('Error populating challenges:', error);
    return { success: false, error };
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  populateChallenges()
    .then(result => {
      if (result.success) {
        console.log('Challenges population completed successfully!');
        process.exit(0);
      } else {
        console.error('Failed to populate challenges:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export { populateChallenges };
