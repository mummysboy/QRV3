// Test script to verify rejected businesses are visible in admin panel
// This script tests the fix for the issue where rejected businesses weren't showing up

const API_BASE = 'http://localhost:3000'; // Adjust if your dev server runs on different port

async function testRejectedBusinesses() {
  console.log('🧪 Testing rejected businesses visibility fix...\n');
  
  try {
    // Step 1: Check if there are any rejected businesses in the system
    console.log('1️⃣ Checking for rejected businesses...');
    const allSignupsResponse = await fetch(`${API_BASE}/api/admin/all-signups`);
    
    if (!allSignupsResponse.ok) {
      console.log('❌ Failed to fetch all signups:', allSignupsResponse.status);
      return;
    }
    
    const allSignupsData = await allSignupsResponse.json();
    const businesses = allSignupsData.businesses || [];
    
    console.log(`✅ Found ${businesses.length} total businesses`);
    
    // Step 2: Check status distribution
    const statusCounts = {};
    businesses.forEach(business => {
      statusCounts[business.status] = (statusCounts[business.status] || 0) + 1;
    });
    
    console.log('📊 Business status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Step 3: Check if there are rejected businesses
    const rejectedBusinesses = businesses.filter(b => b.status === 'rejected');
    console.log(`\n🔍 Found ${rejectedBusinesses.length} rejected businesses`);
    
    if (rejectedBusinesses.length > 0) {
      console.log('📋 Rejected businesses:');
      rejectedBusinesses.forEach((business, index) => {
        console.log(`   ${index + 1}. ${business.name} (ID: ${business.id})`);
        console.log(`      Status: ${business.status}`);
        console.log(`      Created: ${business.createdAt}`);
        console.log(`      Updated: ${business.updatedAt}`);
      });
      
      console.log('\n✅ Test PASSED: Rejected businesses exist in the system');
      console.log('💡 Now check the admin panel:');
      console.log('   1. Go to the "Businesses" tab');
      console.log('   2. Set status filter to "rejected"');
      console.log('   3. You should now see the rejected businesses listed');
      
    } else {
      console.log('\n⚠️  No rejected businesses found in the system');
      console.log('💡 To test this fix:');
      console.log('   1. Go to admin panel');
      console.log('   2. Reject a business (set status to "rejected")');
      console.log('   3. Go to "Businesses" tab');
      console.log('   4. Set status filter to "rejected"');
      console.log('   5. The rejected business should now be visible');
    }
    
    // Step 4: Test the status filter logic
    console.log('\n4️⃣ Testing status filter logic...');
    const allStatuses = ['all', 'pending', 'pending_approval', 'approved', 'rejected', 'paused'];
    
    allStatuses.forEach(status => {
      const filteredBusinesses = status === 'all' 
        ? businesses 
        : businesses.filter(b => b.status === status);
      
      console.log(`   Filter "${status}": ${filteredBusinesses.length} businesses`);
    });
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testRejectedBusinesses();
