// Simple test for admin approval API
const BASE_URL = 'http://localhost:3000';

async function testApproval() {
  console.log('🧪 Testing Admin Approval API...\n');

  try {
    // Test the approval endpoint directly
    console.log('1. Testing approval endpoint...');
    
    // First, let's get a list of businesses
    const response = await fetch(`${BASE_URL}/api/admin/all-signups-simple`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ Failed to fetch data: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log('✅ Successfully fetched data');
    console.log(`   - Businesses: ${data.businesses?.length || 0}`);

    if (!data.businesses || data.businesses.length === 0) {
      console.log('❌ No businesses found to test with');
      return;
    }

    const testBusiness = data.businesses[0];
    console.log(`\n2. Testing with business: ${testBusiness.name} (ID: ${testBusiness.id})`);
    console.log(`   Current status: ${testBusiness.status}`);

    // Test the approval API
    console.log('\n3. Testing approval API...');
    const approvalResponse = await fetch(`${BASE_URL}/api/admin/update-signup-status`, {
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

    console.log(`Response status: ${approvalResponse.status}`);

    if (approvalResponse.ok) {
      const approvalData = await approvalResponse.json();
      console.log('✅ Approval successful!');
      console.log('Response:', approvalData);
    } else {
      console.log('❌ Approval failed');
      const errorData = await approvalResponse.json();
      console.log('Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApproval(); 