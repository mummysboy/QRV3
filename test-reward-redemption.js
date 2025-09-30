// Test script to verify reward redemption fix
// This script tests the scenario where multiple users try to claim and redeem the same reward

const API_BASE = 'http://localhost:3000'; // Adjust if your dev server runs on different port

async function testRewardRedemption() {
  console.log('🧪 Testing reward redemption fix...\n');
  
  try {
    // Step 1: Create a test reward (you'll need to have a business set up)
    console.log('1️⃣ Creating test reward...');
    // Note: You'll need to manually create a reward through your business interface first
    // or modify this script to use an existing reward ID
    
    const testCardId = 'test-card-123'; // Replace with actual card ID from your system
    
    // Step 2: Simulate first user claiming the reward
    console.log('2️⃣ First user claiming reward...');
    const claim1Response = await fetch(`${API_BASE}/api/claim-reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardid: testCardId,
        email: 'user1@test.com',
        delivery_method: 'email'
      })
    });
    
    if (!claim1Response.ok) {
      const error = await claim1Response.json();
      console.log('❌ First claim failed:', error);
      return;
    }
    
    const claim1Result = await claim1Response.json();
    console.log('✅ First claim successful:', claim1Result);
    
    // Step 3: Simulate first user redeeming the reward
    console.log('3️⃣ First user redeeming reward...');
    const redeem1Response = await fetch(`${API_BASE}/api/redeem-reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claimedRewardId: claim1Result.data?.id || 'test-id'
      })
    });
    
    if (!redeem1Response.ok) {
      const error = await redeem1Response.json();
      console.log('❌ First redemption failed:', error);
      return;
    }
    
    const redeem1Result = await redeem1Response.json();
    console.log('✅ First redemption successful:', redeem1Result);
    
    // Step 4: Try to access the redeemed reward (should fail)
    console.log('4️⃣ Trying to access redeemed reward...');
    const accessResponse = await fetch(`${API_BASE}/api/get-claimed-reward?id=${testCardId}`);
    
    if (accessResponse.ok) {
      console.log('❌ BUG: Redeemed reward still accessible!');
      const data = await accessResponse.json();
      console.log('Data returned:', data);
    } else {
      console.log('✅ Good: Redeemed reward no longer accessible');
      const error = await accessResponse.json();
      console.log('Error message:', error);
    }
    
    // Step 5: Try to claim the same reward again (should fail)
    console.log('5️⃣ Trying to claim same reward again...');
    const claim2Response = await fetch(`${API_BASE}/api/claim-reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardid: testCardId,
        email: 'user2@test.com',
        delivery_method: 'email'
      })
    });
    
    if (claim2Response.ok) {
      console.log('❌ BUG: Same reward can be claimed multiple times!');
      const data = await claim2Response.json();
      console.log('Second claim successful:', data);
    } else {
      console.log('✅ Good: Same reward cannot be claimed multiple times');
      const error = await claim2Response.json();
      console.log('Error message:', error);
    }
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testRewardRedemption();
