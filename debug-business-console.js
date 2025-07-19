// Browser Console Debug Script
// Run this in the browser console on the business dashboard page

console.log('🔍 Debugging Business Data in Browser Console...\n');

// Check session storage
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
      console.log('Logo starts with https:', business.logo.startsWith('https'));
    }
    
    console.log('\n📊 Full Business Object:');
    console.log(JSON.stringify(business, null, 2));
  } catch (error) {
    console.error('❌ Error parsing business data:', error.message);
  }
}

// Check if CreateRewardForm is in the DOM
const createRewardForm = document.querySelector('[data-testid="create-reward-form"]') || 
                        document.querySelector('.fixed.inset-0.bg-neutral-100\\/80');
console.log('\n🎯 CreateRewardForm in DOM:', !!createRewardForm);

// Check React component state (if React DevTools is available)
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('🔧 React DevTools available');
} else {
  console.log('⚠️ React DevTools not available - install React Developer Tools extension');
}

console.log('\n🔧 Next Steps:');
console.log('1. Check if business.logo has a value above');
console.log('2. If logo is missing, try uploading a logo first');
console.log('3. If logo exists but CreateRewardForm shows undefined, check the component props');
console.log('4. Try refreshing the page and check again');

// Test API call to get fresh business data
console.log('\n🔄 Testing API call to get fresh business data...');
if (businessData) {
  const business = JSON.parse(businessData);
  fetch(`/api/business/get-business?businessId=${business.id}`)
    .then(response => response.json())
    .then(data => {
      console.log('✅ API Response:', data);
      if (data.success && data.business) {
        console.log('📋 Fresh business logo:', data.business.logo || 'No logo');
      }
    })
    .catch(error => {
      console.error('❌ API call failed:', error);
    });
} 