/**
 * Migration script to enroll existing users in learning paths
 * based on their completed challenges.
 * 
 * Run this script to automatically enroll users who have completed
 * challenges but haven't been enrolled in any paths yet.
 */

async function migrateExistingUsers() {
  try {
    console.log('🚀 Starting migration of existing users...');
    
    const response = await fetch('/api/migrate-user-enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Migration failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Results:`, result);
    
    return result;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function checkMigrationStatus() {
  try {
    console.log('🔍 Checking migration status...');
    
    const response = await fetch('/api/migrate-user-enrollments', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    const status = await response.json();
    
    console.log('📊 Migration Status:', status);
    
    if (status.migrationNeeded) {
      console.log('⚠️  Migration is needed');
    } else {
      console.log('✅ No migration needed');
    }
    
    return status;
  } catch (error) {
    console.error('❌ Status check failed:', error);
    throw error;
  }
}

// Export functions for use in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  window.migrateExistingUsers = migrateExistingUsers;
  window.checkMigrationStatus = checkMigrationStatus;
  
  console.log('🔧 Migration functions available:');
  console.log('- checkMigrationStatus() - Check if migration is needed');
  console.log('- migrateExistingUsers() - Run the migration');
} else {
  // Node.js environment
  module.exports = {
    migrateExistingUsers,
    checkMigrationStatus,
  };
}
