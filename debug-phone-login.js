#!/usr/bin/env node

/**
 * Debug Phone-Only Login System
 * 
 * This script helps identify what's not working with the phone login.
 * 
 * Usage:
 * node debug-phone-login.js
 */

const http = require('http');

function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: data ? 'POST' : 'GET',
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      } : {}
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = data ? JSON.parse(body) : body;
          resolve({ 
            status: res.statusCode, 
            data: response,
            headers: res.headers
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode, 
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function debugPhoneLogin() {
  console.log('🔍 Debugging Phone-Only Login System\n');
  console.log('Your phone number: 4155724853\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    try {
      const homeResponse = await makeRequest('/');
      console.log(`✅ Server is running (Status: ${homeResponse.status})`);
    } catch (error) {
      console.log('❌ Server is not running');
      console.log('   Run: npm run dev');
      return;
    }

    // Test 2: Check admin login page
    console.log('\n2. Testing admin login page...');
    try {
      const loginResponse = await makeRequest('/admin/login');
      if (loginResponse.status === 200) {
        console.log('✅ Admin login page is accessible');
        if (loginResponse.data.includes('4155724853')) {
          console.log('✅ Phone number is pre-filled correctly');
        } else {
          console.log('⚠️  Phone number not found in page');
        }
      } else {
        console.log(`❌ Admin login page error (Status: ${loginResponse.status})`);
      }
    } catch (error) {
      console.log('❌ Cannot access admin login page:', error.message);
    }

    // Test 3: Test SMS sending
    console.log('\n3. Testing SMS sending...');
    try {
      const smsResponse = await makeRequest('/api/admin/send-mfa', {
        phoneNumber: '4155724853'
      });

      if (smsResponse.status === 200) {
        console.log('✅ SMS API is working');
        console.log(`   Response: ${JSON.stringify(smsResponse.data)}`);
        
        // Check for cookies
        const cookies = smsResponse.headers['set-cookie'];
        if (cookies) {
          console.log('✅ JWT cookies are being set');
        } else {
          console.log('⚠️  No JWT cookies found');
        }
      } else {
        console.log(`❌ SMS API error (Status: ${smsResponse.status})`);
        console.log(`   Error: ${JSON.stringify(smsResponse.data)}`);
      }
    } catch (error) {
      console.log('❌ SMS API failed:', error.message);
    }

    // Test 4: Check environment
    console.log('\n4. Environment check...');
    console.log('   - Server running on: http://localhost:3000');
    console.log('   - Admin login: http://localhost:3000/admin/login');
    console.log('   - SMS API: http://localhost:3000/api/admin/send-mfa');

    console.log('\n📱 Next steps to test manually:');
    console.log('1. Open http://localhost:3000/admin/login in your browser');
    console.log('2. Verify phone number 4155724853 is pre-filled');
    console.log('3. Click "Send Login Code" button');
    console.log('4. Check your phone for SMS message');
    console.log('5. Enter the 6-digit code to login');

    console.log('\n🔧 If SMS is not working:');
    console.log('- Check AWS SNS configuration');
    console.log('- Verify phone number is authorized in AWS');
    console.log('- Check AWS credentials and permissions');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugPhoneLogin(); 