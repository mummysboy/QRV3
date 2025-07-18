import fetch from 'node-fetch';

async function checkAndCleanup() {
  try {
    console.log('🔍 Checking current database state...');
    
    // First, check what's currently in the database
    const checkResponse = await fetch('http://localhost:3000/api/admin/test-current-data');
    const checkResult = await checkResponse.json();
    
    if (checkResult.success) {
      console.log('\n📊 Current Database State:');
      console.log('Business Users:', checkResult.summary.totalBusinessUsers);
      console.log('Signups:', checkResult.summary.totalSignups);
      console.log('Businesses:', checkResult.summary.totalBusinesses);
      console.log('Cards:', checkResult.summary.totalCards);
      console.log('\n🗑️ Items to be deleted:');
      console.log('Non-preserved Business Users:', checkResult.summary.nonPreservedBusinessUsers);
      console.log('Non-preserved Signups:', checkResult.summary.nonPreservedSignups);
      console.log('Non-preserved Businesses:', checkResult.summary.nonPreservedBusinesses);
      console.log('Orphaned Cards:', checkResult.summary.orphanedCards);
      
      if (checkResult.summary.nonPreservedBusinessUsers > 0 || 
          checkResult.summary.nonPreservedSignups > 0 || 
          checkResult.summary.nonPreservedBusinesses > 0 || 
          checkResult.summary.orphanedCards > 0) {
        
        console.log('\n🧹 Running cleanup...');
        
        // Run the cleanup
        const cleanupResponse = await fetch('http://localhost:3000/api/admin/cleanup-businesses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ confirm: 'YES_DELETE_ALL' })
        });
        
        const cleanupResult = await cleanupResponse.json();
        
        if (cleanupResult.success) {
          console.log('✅ Cleanup completed successfully!');
          console.log('📊 Cleanup Summary:', cleanupResult.summary);
        } else {
          console.log('❌ Cleanup failed:', cleanupResult.error);
        }
      } else {
        console.log('✅ No cleanup needed - all data is already clean!');
      }
    } else {
      console.log('❌ Failed to check current data:', checkResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check and cleanup
checkAndCleanup(); 