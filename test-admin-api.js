// Test script for admin API endpoints
const BASE_URL = 'http://localhost:3003';

async function testAdminAPI() {
  console.log('🧪 Testing Admin API Endpoints...\n');

  try {
    // Test 1: Get all signups
    console.log('1. Testing GET /api/admin/all-signups');
    const signupsResponse = await fetch(`${BASE_URL}/api/admin/all-signups`);
    const signupsData = await signupsResponse.json();
    
    if (signupsResponse.ok) {
      console.log('✅ Success: Fetched all signups');
      console.log(`   - Signups: ${signupsData.signups?.length || 0}`);
      console.log(`   - Businesses: ${signupsData.businesses?.length || 0}`);
    } else {
      console.log('❌ Failed to fetch signups:', signupsData.error);
    }

    // Test 2: Test status update (if we have data)
    if (signupsData.signups && signupsData.signups.length > 0) {
      console.log('\n2. Testing POST /api/admin/update-signup-status');
      const testSignup = signupsData.signups[0];
      
      const updateResponse = await fetch(`${BASE_URL}/api/admin/update-signup-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'signup',
          id: testSignup.id,
          status: 'approved'
        }),
      });
      
      const updateData = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ Success: Updated signup status');
        console.log(`   - Updated ID: ${updateData.data.id}`);
        console.log(`   - New Status: ${updateData.data.status}`);
      } else {
        console.log('❌ Failed to update signup status:', updateData.error);
      }
    }

    // Test 3: Test business status update (if we have data)
    if (signupsData.businesses && signupsData.businesses.length > 0) {
      console.log('\n3. Testing POST /api/admin/update-signup-status (business)');
      const testBusiness = signupsData.businesses[0];
      
      const updateResponse = await fetch(`${BASE_URL}/api/admin/update-signup-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'business',
          id: testBusiness.id,
          status: 'approved'
        }),
      });
      
      const updateData = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ Success: Updated business status');
        console.log(`   - Updated ID: ${updateData.data.id}`);
        console.log(`   - New Status: ${updateData.data.status}`);
      } else {
        console.log('❌ Failed to update business status:', updateData.error);
      }
    }

    console.log('\n🎉 Admin API tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAdminAPI(); 