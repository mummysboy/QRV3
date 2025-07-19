#!/usr/bin/env node

/**
 * Phone-Only Login Test Script
 * 
 * This script tests the phone-only login functionality for the admin authentication system.
 * 
 * Usage:
 * node test-phone-login.js
 */

const readline = require('readline');
const https = require('https');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function makeRequest(url, data, cookies = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: new URL(url).hostname,
      port: new URL(url).port || 443,
      path: new URL(url).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...cookies
      }
    };

    const req = https.request(options, (res) => {
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
  console.log('This script will test the phone-only admin authentication.\n');

  try {
    // Get base URL
    const baseUrl = await question('Enter your application URL (e.g., https://your-app.vercel.app): ');
    if (!baseUrl) {
      console.log('❌ Base URL is required');
      process.exit(1);
    }

    // Test 1: Send Login Code
    console.log('\n1. Testing Login Code Sending...');
    const phoneNumber = await question('Enter phone number to test (e.g., 4155724853): ');
    
    const sendCodeResponse = await makeRequest(`${baseUrl}/api/admin/send-mfa`, {
      phoneNumber
    });

    if (sendCodeResponse.status === 200) {
      console.log('✅ Login code sent successfully!');
      console.log(`   Phone: ${sendCodeResponse.data.phoneNumber}`);
      
      // Extract cookies for next request
      const cookies = sendCodeResponse.headers['set-cookie'] || [];
      const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
      
      // Test 2: Verify Login Code
      console.log('\n2. Testing Login Code Verification...');
      const loginCode = await question('Enter the 6-digit code you received: ');

      const verifyCodeResponse = await makeRequest(`${baseUrl}/api/admin/verify-mfa`, {
        mfaCode: loginCode
      }, {
        'Cookie': cookieHeader
      });

      if (verifyCodeResponse.status === 200) {
        console.log('✅ Phone-only login successful!');
        console.log('   Authentication completed with phone verification');
        console.log(`   User: ${verifyCodeResponse.data.user.username}`);
        console.log(`   Role: ${verifyCodeResponse.data.user.role}`);
        console.log(`   Phone: ${verifyCodeResponse.data.user.phoneNumber}`);
        console.log('\n🎉 Phone-only login system is working perfectly!');
      } else {
        console.log('❌ Login verification failed');
        console.log('Error:', verifyCodeResponse.data.error || 'Unknown error');
      }
    } else {
      console.log('❌ Failed to send login code');
      console.log('Error:', sendCodeResponse.data.error || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your application is deployed and accessible');
    console.log('2. Check that AWS SNS is configured correctly');
    console.log('3. Verify your phone number is in the correct format');
    console.log('4. Ensure the phone number is authorized for admin access');
  } finally {
    rl.close();
  }
}

// Run the test
testPhoneLogin(); 