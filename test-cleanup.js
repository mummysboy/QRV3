import fetch from 'node-fetch';

async function testCleanup() {
  try {
    console.log('🧪 Testing cleanup endpoint...');
    
    // First, test without confirmation
    console.log('\n1️⃣ Testing without confirmation (should fail)...');
    const response1 = await fetch('http://localhost:3000/api/admin/cleanup-businesses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ confirm: 'wrong' })
    });
    
    const result1 = await response1.json();
    console.log('Response:', result1);
    
    if (result1.error && result1.error.includes('Confirmation required')) {
      console.log('✅ Confirmation check working correctly');
    } else {
      console.log('❌ Confirmation check failed');
      return;
    }
    
    // Now test with proper confirmation
    console.log('\n2️⃣ Testing with proper confirmation...');
    const response2 = await fetch('http://localhost:3000/api/admin/cleanup-businesses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ confirm: 'YES_DELETE_ALL' })
    });
    
    const result2 = await response2.json();
    console.log('Response:', result2);
    
    if (result2.success) {
      console.log('✅ Cleanup completed successfully!');
      console.log('📊 Summary:', result2.summary);
      console.log('✅ Preserved users:', result2.preservedUsers);
    } else {
      console.log('❌ Cleanup failed:', result2.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCleanup(); 