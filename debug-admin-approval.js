// Debug script for admin approval functionality
const BASE_URL = 'http://localhost:3000';

async function debugAdminApproval() {
  console.log('🔍 Debugging Admin Approval...\n');

  try {
    // Step 1: Get all businesses to find one to test with
    console.log('1. Fetching all businesses...');
    const signupsResponse = await fetch(`${BASE_URL}/api/admin/all-signups-simple`);
    
    if (!signupsResponse.ok) {
      console.log('❌ Failed to fetch signups:', signupsResponse.status, signupsResponse.statusText);
      const errorText = await signupsResponse.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const data = await signupsResponse.json();
    console.log('✅ Successfully fetched data');
    console.log(`   - Signups: ${data.signups?.length || 0}`);
    console.log(`   - Businesses: ${data.businesses?.length || 0}`);

    // Step 2: Find a business to test with
    if (!data.businesses || data.businesses.length === 0) {
      console.log('❌ No businesses found to test with');
      return;
    }

    const testBusiness = data.businesses[0];
    console.log(`\n2. Testing with business: ${testBusiness.name} (ID: ${testBusiness.id})`);
    console.log(`   Current status: ${testBusiness.status}`);

    // Step 3: Test the approval API
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
    console.log(`Response ok: ${approvalResponse.ok}`);

    if (approvalResponse.ok) {
      const approvalData = await approvalResponse.json();
      console.log('✅ Approval successful!');
      console.log('Response data:', approvalData);
    } else {
      console.log('❌ Approval failed');
      const errorData = await approvalResponse.json();
      console.log('Error response:', errorData);
      
      // Try to get more details
      console.log('\n4. Getting more error details...');
      const errorText = await approvalResponse.text();
      console.log('Raw error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Debug failed with error:', error);
    console.error('Error stack:', error.stack);
  }
}

debugAdminApproval(); 