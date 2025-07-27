// Test script to manually set the sessionStorage flag for business switching
// Run this in the browser console to test the functionality

// Set the flag to show create reward form after business switch
sessionStorage.setItem('showCreateReward', 'true');

console.log('✅ Set showCreateReward flag to true');
console.log('🔄 Now reload the page to test the functionality');
console.log('📝 The create reward form should automatically appear after reload'); 