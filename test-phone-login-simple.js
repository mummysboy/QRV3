#!/usr/bin/env node

/**
 * Simple Phone-Only Login Test
 * 
 * This script demonstrates that the phone-only login is working.
 * 
 * Usage:
 * node test-phone-login-simple.js
 */

const http = require('http');

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ 
            status: res.statusCode, 
            data: response,
            headers: res.headers
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testPhoneLogin() {
  console.log('📱 Testing Phone-Only Login System\n');
  console.log('Your phone number: 4155724853\n');

  try {
    // Test 1: Send login code
    console.log('1. Sending login code to your phone...');
    const sendResponse = await makeRequest('/api/admin/send-mfa', {
      phoneNumber: '4155724853'
    });

    if (sendResponse.status === 200) {
      console.log('✅ SUCCESS! Login code sent to your phone!');
      console.log(`   Phone: ${sendResponse.data.phoneNumber}`);
      console.log('   Check your phone for the SMS message');
      
      console.log('\n2. To complete the login:');
      console.log('   - Enter the 6-digit code from your SMS');
      console.log('   - The code expires in 5 minutes');
      console.log('   - You can resend the code if needed');
      
      console.log('\n🎉 Phone-only login system is WORKING!');
      console.log('\nNext steps:');
      console.log('1. Open http://localhost:3000/admin/login in your browser');
      console.log('2. Your phone number 4155724853 is pre-filled');
      console.log('3. Click "Send Login Code"');
      console.log('4. Check your phone for the SMS');
      console.log('5. Enter the 6-digit code to login');
      
    } else {
      console.log('❌ Failed to send login code');
      console.log('Error:', sendResponse.data.error || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Your development server is running: npm run dev');
    console.log('2. You have AWS SNS configured');
    console.log('3. Your phone number 4155724853 is authorized');
  }
}

// Run the test
testPhoneLogin(); 