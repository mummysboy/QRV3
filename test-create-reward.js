// Test script to manually test the create reward form functionality
// Run this in the browser console on the dashboard page

console.log('🧪 Testing Create Reward Form Functionality');

// Check if the flag is set
const showCreateReward = sessionStorage.getItem('showCreateReward');
console.log('📋 showCreateReward flag:', showCreateReward);

// Manually set the flag to test
sessionStorage.setItem('showCreateReward', 'true');
console.log('✅ Set showCreateReward flag to true');

// Check current business
const businessData = sessionStorage.getItem('businessData');
const business = businessData ? JSON.parse(businessData) : null;
console.log('🏢 Current business:', business?.name);

console.log('🔄 Now reload the page to test automatic form display');
console.log('📝 The create reward form should automatically appear after reload');

// Instructions for testing
console.log(`
📋 Testing Instructions:
1. Reload the page (Ctrl+R or Cmd+R)
2. The create reward form should automatically appear
3. If it doesn't appear, check the browser console for any errors
4. You can also manually trigger it by running: sessionStorage.setItem('showCreateReward', 'true') then reload
`); 