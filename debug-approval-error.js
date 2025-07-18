// Debug script for approval error
const BASE_URL = 'http://localhost:3000';

async function debugApprovalError() {
  console.log('🔍 Debugging Approval Error...\n');

  try {
    // Step 1: Test the approval endpoint directly without session validation
    console.log('1. Testing approval endpoint without session validation...');
    
    const approvalResponse = await fetch(`${BASE_URL}/api/admin/update-signup-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'business',
        id: 'test-business-id',
        status: 'approved'
      }),
    });

    console.log(`Response status: ${approvalResponse.status}`);
    console.log(`Response ok: ${approvalResponse.ok}`);

    if (approvalResponse.ok) {
      const data = await approvalResponse.json();
      console.log('✅ Approval successful:', data);
    } else {
      const errorData = await approvalResponse.json();
      console.log('❌ Approval failed:', errorData);
      
      // Check if it's a session validation error
      if (errorData.error && errorData.error.includes('session')) {
        console.log('🔍 This is a session validation error');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugApprovalError(); 