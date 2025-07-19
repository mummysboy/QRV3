// Simple Cooldown Test
// Copy and paste this into your browser console on the claim-reward page

console.log('🧪 Simple Cooldown Test');

// Test 1: Check current state
console.log('\n📋 Test 1: Current state');
console.log('URL:', window.location.href);

const claimedAt = localStorage.getItem("rewardClaimedAt");
if (claimedAt) {
  const elapsed = Date.now() - parseInt(claimedAt, 10);
  const remaining = 900000 - elapsed;
  if (remaining > 0) {
    console.log(`⏰ Cooldown active! ${Math.floor(remaining / 1000 / 60)}m ${Math.floor((remaining % 60000) / 1000)}s remaining`);
  } else {
    console.log('✅ No cooldown active');
  }
} else {
  console.log('✅ No cooldown found');
}

// Test 2: Check page elements
console.log('\n📋 Test 2: Page elements');
const thankYouOverlay = document.querySelector('.fixed.inset-0.z-0');
const cardElement = document.querySelector('.card-animation');

console.log('Thank you overlay visible:', !!thankYouOverlay);
console.log('Card visible:', !!cardElement);

// Test 3: Simulate cooldown
console.log('\n📋 Test 3: Simulating cooldown');
localStorage.setItem("rewardClaimedAt", (Date.now() - 300000).toString()); // 5 minutes ago
console.log('✅ Set cooldown to 5 minutes ago');

// Test 4: Refresh suggestion
console.log('\n📋 Test 4: Ready to test');
console.log('Now refresh the page (F5) and check the console for:');
console.log('- "⏰ Cooldown active" message');
console.log('- "⏸️ Cooldown active - showing thank you overlay, skipping card fetch"');
console.log('- No "🔍 Fetching card" messages');

// Helper functions
window.cooldownTest = {
  check: () => {
    const claimedAt = localStorage.getItem("rewardClaimedAt");
    if (claimedAt) {
      const elapsed = Date.now() - parseInt(claimedAt, 10);
      const remaining = 900000 - elapsed;
      if (remaining > 0) {
        console.log(`⏰ Cooldown: ${Math.floor(remaining / 1000 / 60)}m ${Math.floor((remaining % 60000) / 1000)}s`);
        return remaining;
      }
    }
    console.log('✅ No cooldown');
    return 0;
  },
  set: (minutesAgo) => {
    localStorage.setItem("rewardClaimedAt", (Date.now() - (minutesAgo * 60000)).toString());
    console.log(`✅ Set cooldown to ${minutesAgo} minutes ago`);
  },
  clear: () => {
    localStorage.removeItem("rewardClaimedAt");
    console.log('🗑️ Cooldown cleared');
  }
};

console.log('\n✅ Test functions loaded: cooldownTest.check(), cooldownTest.set(5), cooldownTest.clear()'); 