#!/usr/bin/env node

/**
 * Test Login Code Display
 * 
 * This script will show you the login code directly.
 * 
 * Usage:
 * node test-login-code.js
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
            data: response
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

async function testLoginCode() {
  console.log('🔐 Testing Login Code Generation\n');
  console.log('📱 Your phone number: 4155724853\n');
  console.log('🔄 Sending request to generate login code...\n');

  try {
    const response = await makeRequest('/api/admin/send-mfa', {
      phoneNumber: '4155724853'
    });

    if (response.status === 200) {
      console.log('✅ API Response:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Phone: ${response.data.phoneNumber}\n`);
      
      console.log('🔍 Now check your server terminal for the login code!');
      console.log('   Look for lines like:');
      console.log('   🔐 TEMPORARY: Your login code is: XXXXXX');
      console.log('   📱 This code was sent to: +14155724853\n');
      
      console.log('📋 If you don\'t see the code in your server terminal:');
      console.log('   1. Make sure you\'re looking at the terminal where "npm run dev" is running');
      console.log('   2. The code should appear right after this request');
      console.log('   3. Try refreshing your server terminal window');
      
    } else {
      console.log('❌ API Error:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(response.data)}`);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\nMake sure your server is running: npm run dev');
  }
}

// Run the test
testLoginCode(); 