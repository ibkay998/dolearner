require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const path = require('path');

console.log('Setting up the test system...');

// Step 1: Create the database tables
console.log('\n--- Step 1: Creating database tables ---');
try {
  execSync('node scripts/create-test-tables.js', { stdio: 'inherit' });
  console.log('✅ Database tables created successfully');
} catch (error) {
  console.error('❌ Failed to create database tables:', error);
  process.exit(1);
}

// Step 2: Migrate existing tests to the database
console.log('\n--- Step 2: Migrating existing tests to the database ---');
try {
  execSync('node scripts/migrate-tests-to-db.js', { stdio: 'inherit' });
  console.log('✅ Tests migrated successfully');
} catch (error) {
  console.error('❌ Failed to migrate tests:', error);
  process.exit(1);
}

console.log('\n✨ Test system setup completed successfully!');
console.log('\nYou can now:');
console.log('1. Access the admin interface at /admin/tests to manage test cases');
console.log('2. Run tests for challenges using the existing UI');
