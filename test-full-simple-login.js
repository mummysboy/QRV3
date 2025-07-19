#!/usr/bin/env node

/**
 * Test Full Simple Login Flow
 * 
 * Tests the complete login flow including session validation
 */

// Using built-in fetch (Node.js 18+)

async function testFullSimpleLogin() {
  console.log('🔐 Testing Full Simple Login Flow\n');

  let cookies = '';

  try {
    console.log('1. 📧 Logging in with credentials...');
    
    const loginResponse = await fetch('http://localhost:3000/api/admin/simple-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'isaac@rightimagedigital.com',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    
    console.log(`📊 Login Status: ${loginResponse.status}`);
    console.log('📄 Login Response:', JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok) {
      console.log('\n❌ Login failed');
      return;
    }

    // Extract cookies from response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies = setCookieHeader.split(';')[0];
      console.log('🍪 Cookies extracted:', cookies);
    }

    console.log('\n2. 🔍 Validating session...');
    
    const validateResponse = await fetch('http://localhost:3000/api/admin/validate-session', {
      headers: {
        'Cookie': cookies
      }
    });

    const validateData = await validateResponse.json();
    
    console.log(`📊 Validation Status: ${validateResponse.status}`);
    console.log('📄 Validation Response:', JSON.stringify(validateData, null, 2));

    if (validateResponse.ok) {
      console.log('\n✅ SESSION VALIDATION SUCCESSFUL!');
    } else {
      console.log('\n❌ Session validation failed');
    }

    console.log('\n3. 🏠 Testing admin dashboard access...');
    
    const dashboardResponse = await fetch('http://localhost:3000/admin', {
      headers: {
        'Cookie': cookies
      }
    });

    console.log(`📊 Dashboard Status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.ok) {
      console.log('✅ Dashboard accessible!');
    } else {
      console.log('❌ Dashboard access failed');
    }

    console.log('\n🎉 FULL LOGIN FLOW TEST COMPLETE!');
    console.log('\n📋 Your Login Credentials:');
    console.log('   📧 Email: isaac@rightimagedigital.com');
    console.log('   🔑 Password: admin123');
    console.log('\n🌐 Go to: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFullSimpleLogin(); 