// Manual Cooldown Test Script
// Run this in your browser console on the claim-reward page

console.log('🧪 Manual Cooldown Test Starting...');

// Function to check current cooldown status
function checkCooldownStatus() {
  const claimedAt = localStorage.getItem("rewardClaimedAt");
  if (claimedAt) {
    const elapsed = Date.now() - parseInt(claimedAt, 10);
    const remaining = 900000 - elapsed; // 15 minutes in milliseconds
    if (remaining > 0) {
      console.log(`⏰ Cooldown active! Remaining: ${Math.floor(remaining / 1000 / 60)} minutes and ${Math.floor((remaining % 60000) / 1000)} seconds`);
      return remaining;
    } else {
      console.log('✅ No cooldown active');
      return 0;
    }
  } else {
    console.log('✅ No cooldown found in localStorage');
    return 0;
  }
}

// Function to simulate a recent claim (for testing)
function simulateRecentClaim(minutesAgo = 5) {
  const now = Date.now();
  const claimedAt = now - (minutesAgo * 60 * 1000);
  localStorage.setItem("rewardClaimedAt", claimedAt.toString());
  console.log(`🎯 Simulated claim ${minutesAgo} minutes ago`);
  checkCooldownStatus();
}

// Function to clear cooldown
function clearCooldown() {
  localStorage.removeItem("rewardClaimedAt");
  console.log('🗑️ Cooldown cleared');
}

// Function to test the page behavior
function testPageBehavior() {
  console.log('📋 Current page state:');
  console.log('- URL:', window.location.href);
  console.log('- Cooldown status:', checkCooldownStatus());
  
  // Check if thank you overlay is visible
  const thankYouOverlay = document.querySelector('.thank-you-overlay') || 
                         document.querySelector('[data-testid="thank-you-overlay"]') ||
                         document.querySelector('.fixed.inset-0.z-0');
  
  if (thankYouOverlay) {
    console.log('✅ Thank you overlay is visible');
  } else {
    console.log('❌ Thank you overlay not visible');
  }
  
  // Check if card is visible
  const cardElement = document.querySelector('.card-animation') || 
                     document.querySelector('[data-testid="card-animation"]');
  
  if (cardElement) {
    console.log('✅ Card is visible');
  } else {
    console.log('❌ Card not visible');
  }
}

// Function to run full test
function runFullTest() {
  console.log('🚀 Running full cooldown test...');
  
  // Step 1: Clear any existing cooldown
  clearCooldown();
  
  // Step 2: Check initial state
  console.log('\n📋 Step 1: Initial state');
  testPageBehavior();
  
  // Step 3: Simulate a recent claim
  console.log('\n📋 Step 2: Simulating recent claim');
  simulateRecentClaim(5); // 5 minutes ago
  
  // Step 4: Refresh the page
  console.log('\n📋 Step 3: Refreshing page...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Export functions for manual testing
window.cooldownTest = {
  checkStatus: checkCooldownStatus,
  simulateClaim: simulateRecentClaim,
  clear: clearCooldown,
  testPage: testPageBehavior,
  runFull: runFullTest
};

console.log('✅ Cooldown test functions loaded!');
console.log('Available commands:');
console.log('- cooldownTest.checkStatus() - Check current cooldown');
console.log('- cooldownTest.simulateClaim(5) - Simulate claim 5 minutes ago');
console.log('- cooldownTest.clear() - Clear cooldown');
console.log('- cooldownTest.testPage() - Test current page state');
console.log('- cooldownTest.runFull() - Run full test');

// Auto-check current status
checkCooldownStatus(); 