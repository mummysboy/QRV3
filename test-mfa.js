#!/usr/bin/env node

/**
 * MFA Test Script
 * 
 * This script tests the MFA functionality for the admin authentication system.
 * 
 * Usage:
 * node test-mfa.js
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

async function testMFA() {
  console.log('🧪 Testing MFA Functionality\n');
  console.log('This script will test the MFA system for admin authentication.\n');

  try {
    // Get base URL
    const baseUrl = await question('Enter your application URL (e.g., https://your-app.vercel.app): ');
    if (!baseUrl) {
      console.log('❌ Base URL is required');
      process.exit(1);
    }

    // Test 1: Send MFA Code
    console.log('\n1. Testing MFA Code Sending...');
    const phoneNumber = await question('Enter phone number to test (e.g., 4155724853): ');
    
    const sendMfaResponse = await makeRequest(`${baseUrl}/api/admin/send-mfa`, {
      phoneNumber
    });

    if (sendMfaResponse.status === 200) {
      console.log('✅ MFA code sent successfully!');
      console.log(`   Phone: ${sendMfaResponse.data.phoneNumber}`);
      
      // Extract cookies for next request
      const cookies = sendMfaResponse.headers['set-cookie'] || [];
      const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
      
      // Test 2: Verify MFA Code
      console.log('\n2. Testing MFA Code Verification...');
      const mfaCode = await question('Enter the 6-digit code you received: ');
      const username = await question('Enter admin username: ');
      const password = await question('Enter admin password: ');

      const verifyMfaResponse = await makeRequest(`${baseUrl}/api/admin/verify-mfa`, {
        username,
        password,
        mfaCode
      }, {
        'Cookie': cookieHeader
      });

      if (verifyMfaResponse.status === 200) {
        console.log('✅ MFA verification successful!');
        console.log('   Login completed with MFA protection');
        console.log(`   User: ${verifyMfaResponse.data.user.username}`);
        console.log(`   Role: ${verifyMfaResponse.data.user.role}`);
      } else {
        console.log('❌ MFA verification failed');
        console.log('Error:', verifyMfaResponse.data.error || 'Unknown error');
      }
    } else {
      console.log('❌ Failed to send MFA code');
      console.log('Error:', sendMfaResponse.data.error || 'Unknown error');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your application is deployed and accessible');
    console.log('2. Check that AWS SNS is configured correctly');
    console.log('3. Verify your phone number is in the correct format');
    console.log('4. Ensure your admin credentials are correct');
  } finally {
    rl.close();
  }
}

// Run the test
testMFA(); 