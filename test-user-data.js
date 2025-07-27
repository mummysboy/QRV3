// Test script to check user data in sessionStorage
console.log('🔍 Testing user data in sessionStorage...');

const userData = sessionStorage.getItem('businessUser');
const businessData = sessionStorage.getItem('businessData');
const allBusinessesData = sessionStorage.getItem('allBusinesses');

console.log('📋 User data:', userData);
console.log('📋 Business data:', businessData);
console.log('📋 All businesses data:', allBusinessesData);

if (userData) {
  try {
    const userObj = JSON.parse(userData);
    console.log('✅ Parsed user object:', userObj);
    console.log('📧 User email:', userObj.email);
    console.log('👤 User firstName:', userObj.firstName);
    console.log('👤 User lastName:', userObj.lastName);
    console.log('🆔 User ID:', userObj.id);
    console.log('🎭 User role:', userObj.role);
    console.log('📊 User status:', userObj.status);
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
  }
} else {
  console.log('❌ No user data found in sessionStorage');
}

if (businessData) {
  try {
    const businessObj = JSON.parse(businessData);
    console.log('✅ Parsed business object:', businessObj);
    console.log('🏢 Business name:', businessObj.name);
    console.log('🆔 Business ID:', businessObj.id);
    console.log('📊 Business status:', businessObj.status);
  } catch (error) {
    console.error('❌ Error parsing business data:', error);
  }
} else {
  console.log('❌ No business data found in sessionStorage');
}

if (allBusinessesData) {
  try {
    const allBusinessesObj = JSON.parse(allBusinessesData);
    console.log('✅ Parsed all businesses:', allBusinessesObj);
    console.log('📊 Total businesses:', allBusinessesObj.length);
    allBusinessesObj.forEach((business, index) => {
      console.log(`🏢 Business ${index + 1}:`, business.name, `(${business.status})`);
    });
  } catch (error) {
    console.error('❌ Error parsing all businesses data:', error);
  }
} else {
  console.log('❌ No all businesses data found in sessionStorage');
} 