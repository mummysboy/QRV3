#!/usr/bin/env node

/**
 * Debug Business Data
 * 
 * This script checks the current business data to see if the logo field is properly set.
 */

console.log('🔍 Debugging Business Data...\n');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  const businessUser = sessionStorage.getItem('businessUser');
  const businessData = sessionStorage.getItem('businessData');
  
  console.log('📋 Session Storage Data:');
  console.log('businessUser:', businessUser ? '✅ Found' : '❌ Not found');
  console.log('businessData:', businessData ? '✅ Found' : '❌ Not found');
  
  if (businessData) {
    try {
      const business = JSON.parse(businessData);
      console.log('\n🏢 Business Object:');
      console.log('ID:', business.id);
      console.log('Name:', business.name);
      console.log('Logo:', business.logo || '❌ No logo');
      console.log('Logo type:', typeof business.logo);
      console.log('Logo length:', business.logo ? business.logo.length : 0);
      
      if (business.logo) {
        console.log('Logo starts with http:', business.logo.startsWith('http'));
        console.log('Logo starts with data:', business.logo.startsWith('data:'));
      }
      
      console.log('\n📊 Full Business Object:');
      console.log(JSON.stringify(business, null, 2));
    } catch (error) {
      console.error('❌ Error parsing business data:', error.message);
    }
  }
} else {
  console.log('❌ This script needs to run in a browser environment');
  console.log('💡 Open the browser console and run this script there');
}

console.log('\n🔧 Next Steps:');
console.log('1. Open browser console on the business dashboard');
console.log('2. Run: console.log(sessionStorage.getItem("businessData"))');
console.log('3. Check if the logo field exists and has a value'); 