#!/usr/bin/env ts-node

/**
 * Challenge Audit Script for DoLearner Platform
 * 
 * This script audits the current state of challenges in both local files and database,
 * providing a detailed comparison and identifying any discrepancies.
 * 
 * Usage: npx ts-node scripts/audit-challenges.ts
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AuditResult {
  pathName: string;
  localCount: number;
  dbCount: number;
  missing: string[];
  extra: string[];
  status: 'complete' | 'missing' | 'extra' | 'mismatch';
}

/**
 * Get challenges from database grouped by path
 */
async function getDatabaseChallenges(): Promise<Record<string, Set<string>>> {
  console.log('📋 Fetching challenges from database...');
  
  const { data, error } = await supabase
    .from('challenges_new')
    .select(`
      legacy_id,
      path:learning_paths(slug)
    `)
    .eq('is_active', true);

  if (error) {
    console.error('❌ Error fetching database challenges:', error);
    throw error;
  }

  const challengesByPath: Record<string, Set<string>> = {};
  
  data?.forEach((challenge: any) => {
    const pathSlug = (challenge.path as any)?.slug;
    if (pathSlug) {
      if (!challengesByPath[pathSlug]) {
        challengesByPath[pathSlug] = new Set();
      }
      challengesByPath[pathSlug].add(challenge.legacy_id);
    }
  });

  return challengesByPath;
}

/**
 * Get local challenges grouped by path
 */
function getLocalChallenges(): Record<string, Challenge[]> {
  return {
    react: reactChallenges,
    css: cssChallenges,
    dsa: dsaChallenges
  };
}

/**
 * Audit a specific path
 */
function auditPath(
  pathName: string,
  localChallenges: Challenge[],
  dbChallenges: Set<string>
): AuditResult {
  const localIds = new Set(localChallenges.map(c => c.id));
  
  const missing = Array.from(localIds).filter(id => !dbChallenges.has(id));
  const extra = Array.from(dbChallenges).filter(id => !localIds.has(id));
  
  let status: AuditResult['status'];
  if (missing.length === 0 && extra.length === 0) {
    status = 'complete';
  } else if (missing.length > 0 && extra.length === 0) {
    status = 'missing';
  } else if (missing.length === 0 && extra.length > 0) {
    status = 'extra';
  } else {
    status = 'mismatch';
  }

  return {
    pathName,
    localCount: localChallenges.length,
    dbCount: dbChallenges.size,
    missing,
    extra,
    status
  };
}

/**
 * Display audit results
 */
function displayResults(results: AuditResult[]): void {
  console.log('\n📊 CHALLENGE AUDIT RESULTS');
  console.log('=' .repeat(60));

  results.forEach(result => {
    const statusIcon = {
      complete: '✅',
      missing: '❌',
      extra: '⚠️',
      mismatch: '🔄'
    }[result.status];

    console.log(`\n${statusIcon} ${result.pathName.toUpperCase()} PATH`);
    console.log(`   Local files: ${result.localCount} challenges`);
    console.log(`   Database: ${result.dbCount} challenges`);
    console.log(`   Status: ${result.status.toUpperCase()}`);

    if (result.missing.length > 0) {
      console.log(`   Missing from DB (${result.missing.length}):`);
      result.missing.forEach(id => console.log(`     - ${id}`));
    }

    if (result.extra.length > 0) {
      console.log(`   Extra in DB (${result.extra.length}):`);
      result.extra.forEach(id => console.log(`     + ${id}`));
    }
  });

  console.log('\n' + '=' .repeat(60));

  // Summary
  const totalLocal = results.reduce((sum, r) => sum + r.localCount, 0);
  const totalDb = results.reduce((sum, r) => sum + r.dbCount, 0);
  const totalMissing = results.reduce((sum, r) => sum + r.missing.length, 0);
  const completePaths = results.filter(r => r.status === 'complete').length;

  console.log('\n📈 SUMMARY');
  console.log(`   Total challenges in local files: ${totalLocal}`);
  console.log(`   Total challenges in database: ${totalDb}`);
  console.log(`   Total missing from database: ${totalMissing}`);
  console.log(`   Paths fully migrated: ${completePaths}/${results.length}`);

  if (totalMissing > 0) {
    console.log('\n🚨 ACTION REQUIRED');
    console.log('   Run migration script: npm run migrate-challenges');
  } else {
    console.log('\n🎉 ALL CHALLENGES MIGRATED');
    console.log('   Database is in sync with local files!');
  }
}

/**
 * Display detailed challenge information
 */
async function displayDetailedInfo(): Promise<void> {
  console.log('\n📋 DETAILED CHALLENGE INFORMATION');
  console.log('=' .repeat(60));

  const { data, error } = await supabase
    .from('challenges_new')
    .select(`
      legacy_id,
      title,
      challenge_type,
      order_index,
      path:learning_paths(name, slug)
    `)
    .eq('is_active', true)
    .order('path_id')
    .order('order_index');

  if (error) {
    console.error('❌ Error fetching detailed info:', error);
    return;
  }

  // Group by path
  const challengesByPath = data?.reduce((acc: Record<string, any[]>, challenge: any) => {
    const pathName = (challenge.path as any)?.name || 'Unknown';
    if (!acc[pathName]) acc[pathName] = [];
    acc[pathName].push(challenge);
    return acc;
  }, {} as Record<string, any[]>) || {};

  Object.entries(challengesByPath).forEach(([pathName, challenges]) => {
    const challengeList = challenges as any[];
    console.log(`\n${pathName} (${challengeList.length} challenges):`);
    challengeList.forEach((c: any) => {
      console.log(`  ${c.order_index}. ${c.legacy_id} - ${c.title} [${c.challenge_type}]`);
    });
  });
}

/**
 * Main audit function
 */
async function main(): Promise<void> {
  console.log('🔍 Starting DoLearner Challenge Audit');
  console.log('=' .repeat(60));

  try {
    // Get data from both sources
    const dbChallenges = await getDatabaseChallenges();
    const localChallenges = getLocalChallenges();

    // Audit each path
    const results: AuditResult[] = [];
    
    Object.entries(localChallenges).forEach(([pathSlug, challenges]) => {
      const dbSet = dbChallenges[pathSlug] || new Set();
      const result = auditPath(pathSlug, challenges, dbSet);
      results.push(result);
    });

    // Display results
    displayResults(results);

    // Display detailed information
    await displayDetailedInfo();

  } catch (error) {
    console.error('💥 Audit failed:', error);
    process.exit(1);
  }
}

// Run audit if this file is executed directly
if (require.main === module) {
  main();
}

export { main as auditChallenges };
