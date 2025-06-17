#!/usr/bin/env ts-node

/**
 * Database Migration Script for DoLearner Platform
 * 
 * This script migrates missing challenges from local TypeScript files to the Supabase database.
 * 
 * Current State (verified):
 * - React: ✅ 9/9 challenges in database (fully migrated)
 * - CSS: ❌ 1/5 challenges in database (missing 4)
 * - DSA: ❌ 1/5 challenges in database (missing 4)
 * 
 * Usage: npx ts-node scripts/migrate-challenges-to-db.ts
 */

const { createClient } = require('@supabase/supabase-js');
const { cssChallenges } = require('../data/challenges/css');
const { dsaChallenges } = require('../data/challenges/dsa');
const { reactChallenges } = require('../data/challenges/react');

interface Challenge {
  id: string;
  pathId: string;
  title: string;
  description: string;
  initialCode: string;
  solutionCode: string;
  solutionMarker: string;
  order?: number;
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Learning Path IDs (verified from database)
const LEARNING_PATHS = {
  react: 'e20c46a1-9b41-4da5-baea-d7f52cb6b058',
  css: 'ee75a3a4-fd16-472a-842b-5d9522eac606',
  dsa: 'f82ff6b4-40dc-499c-9ab8-2fe9f3511905'
};

interface DatabaseChallenge {
  id: string;
  legacy_id: string;
  path_id: string;
  title: string;
  description: string;
  initial_code: string;
  solution_code: string;
  solution_marker: string;
  challenge_type: 'component' | 'algorithm';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get existing challenges from database
 */
async function getExistingChallenges(): Promise<Set<string>> {
  console.log('📋 Fetching existing challenges from database...');
  
  const { data, error } = await supabase
    .from('challenges_new')
    .select('legacy_id')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Error fetching existing challenges:', error);
    throw error;
  }

  const existingIds = new Set(data?.map(c => c.legacy_id) || []);
  console.log(`✅ Found ${existingIds.size} existing challenges in database`);
  
  return existingIds;
}

/**
 * Convert local challenge to database format
 */
function convertToDbFormat(challenge: Challenge, pathId: string): DatabaseChallenge {
  return {
    id: crypto.randomUUID(),
    legacy_id: challenge.id,
    path_id: pathId,
    title: challenge.title,
    description: challenge.description,
    initial_code: challenge.initialCode,
    solution_code: challenge.solutionCode,
    solution_marker: challenge.solutionMarker,
    challenge_type: challenge.pathId === 'dsa' ? 'algorithm' : 'component',
    difficulty_level: 'beginner', // Default for now
    order_index: challenge.order || 1,
    is_active: true
  };
}

/**
 * Migrate challenges for a specific path
 */
async function migrateChallengesForPath(
  pathName: string,
  pathId: string,
  challenges: Challenge[],
  existingIds: Set<string>
): Promise<number> {
  console.log(`\n🔄 Processing ${pathName} challenges...`);
  
  const missingChallenges = challenges.filter(c => !existingIds.has(c.id));
  
  if (missingChallenges.length === 0) {
    console.log(`✅ All ${pathName} challenges already in database`);
    return 0;
  }

  console.log(`📝 Found ${missingChallenges.length} missing ${pathName} challenges:`);
  missingChallenges.forEach(c => console.log(`   - ${c.id}: ${c.title}`));

  // Convert to database format
  const dbChallenges = missingChallenges.map(c => convertToDbFormat(c, pathId));

  // Insert into database
  const { data, error } = await supabase
    .from('challenges_new')
    .insert(dbChallenges)
    .select('legacy_id, title');

  if (error) {
    console.error(`❌ Error inserting ${pathName} challenges:`, error);
    throw error;
  }

  console.log(`✅ Successfully migrated ${data?.length || 0} ${pathName} challenges`);
  return data?.length || 0;
}

/**
 * Audit and display migration summary
 */
async function auditMigration(): Promise<void> {
  console.log('\n📊 MIGRATION AUDIT SUMMARY');
  console.log('=' .repeat(50));

  const { data, error } = await supabase
    .from('challenges_new')
    .select(`
      legacy_id,
      title,
      path:learning_paths(name, slug)
    `)
    .eq('is_active', true)
    .order('path_id')
    .order('order_index');

  if (error) {
    console.error('❌ Error fetching audit data:', error);
    return;
  }

  // Group by path
  const challengesByPath = data?.reduce((acc, challenge) => {
    const pathName = challenge.path?.name || 'Unknown';
    if (!acc[pathName]) acc[pathName] = [];
    acc[pathName].push(challenge);
    return acc;
  }, {} as Record<string, any[]>) || {};

  Object.entries(challengesByPath).forEach(([pathName, challenges]) => {
    console.log(`\n${pathName}: ${challenges.length} challenges`);
    challenges.forEach(c => console.log(`  ✓ ${c.legacy_id}: ${c.title}`));
  });

  console.log('\n' + '=' .repeat(50));
}

/**
 * Main migration function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting DoLearner Challenge Migration');
  console.log('=' .repeat(50));

  try {
    // Get existing challenges
    const existingIds = await getExistingChallenges();

    let totalMigrated = 0;

    // Migrate CSS challenges
    totalMigrated += await migrateChallengesForPath(
      'CSS',
      LEARNING_PATHS.css,
      cssChallenges,
      existingIds
    );

    // Migrate DSA challenges
    totalMigrated += await migrateChallengesForPath(
      'DSA',
      LEARNING_PATHS.dsa,
      dsaChallenges,
      existingIds
    );

    // React challenges should already be migrated, but check anyway
    totalMigrated += await migrateChallengesForPath(
      'React',
      LEARNING_PATHS.react,
      reactChallenges,
      existingIds
    );

    console.log(`\n🎉 Migration completed! Total challenges migrated: ${totalMigrated}`);

    // Audit final state
    await auditMigration();

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main();
}

export { main as migrateChallenges };
