#!/usr/bin/env node

/**
 * Get Login Code
 * 
 * This script gets your login code directly.
 * 
 * Usage:
 * node get-login-code.js
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

async function getLoginCode() {
  console.log('🔐 Getting your login code...\n');

  try {
    const response = await makeRequest('/api/admin/send-mfa', {
      email: 'isaac@rightimagedigital.com'
    });

    if (response.status === 200) {
      console.log('✅ SUCCESS!');
      console.log(`📧 Email: ${response.data.email}`);
      console.log(`🔐 Your login code is: ${response.data.debugCode}`);
      console.log(`💬 Message: ${response.data.message}\n`);
      
      console.log('📋 Next steps:');
      console.log('1. Go to: http://localhost:3000/admin/login');
      console.log('2. Your email is pre-filled: isaac@rightimagedigital.com');
      console.log('3. Click "Send Login Code"');
      console.log(`4. Enter the code: ${response.data.debugCode}`);
      console.log('5. Click "Login"');
      
    } else {
      console.log('❌ Error:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

// Run the script
getLoginCode(); 