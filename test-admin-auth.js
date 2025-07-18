// Test script for admin authentication
const BASE_URL = 'http://localhost:3000';

async function testAdminAuth() {
  console.log('🔐 Testing Admin Authentication...\n');

  try {
    // Test 1: Login
    console.log('1. Testing admin login...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    console.log(`Login response status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData);
      
      // Get cookies from response
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('🍪 Cookies set:', cookies);
      
      // Test 2: Validate session
      console.log('\n2. Testing session validation...');
      const validateResponse = await fetch(`${BASE_URL}/api/admin/validate-session`, {
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      console.log(`Validation response status: ${validateResponse.status}`);
      
      if (validateResponse.ok) {
        const validateData = await validateResponse.json();
        console.log('✅ Session validation successful:', validateData);
      } else {
        console.log('❌ Session validation failed');
      }
      
      // Test 3: Access protected endpoint
      console.log('\n3. Testing protected endpoint access...');
      const protectedResponse = await fetch(`${BASE_URL}/api/admin/all-signups-simple`, {
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      console.log(`Protected endpoint response status: ${protectedResponse.status}`);
      
      if (protectedResponse.ok) {
        const protectedData = await protectedResponse.json();
        console.log('✅ Protected endpoint access successful');
        console.log(`   - Signups: ${protectedData.signups?.length || 0}`);
        console.log(`   - Businesses: ${protectedData.businesses?.length || 0}`);
      } else {
        console.log('❌ Protected endpoint access failed');
      }
      
      // Test 4: Logout
      console.log('\n4. Testing logout...');
      const logoutResponse = await fetch(`${BASE_URL}/api/admin/logout`, {
        method: 'POST',
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      console.log(`Logout response status: ${logoutResponse.status}`);
      
      if (logoutResponse.ok) {
        console.log('✅ Logout successful');
      } else {
        console.log('❌ Logout failed');
      }
      
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminAuth(); 