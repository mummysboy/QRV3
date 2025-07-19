#!/usr/bin/env node

/**
 * Test Full Login Flow
 * 
 * This script tests the complete login flow to debug the verification issue.
 * 
 * Usage:
 * node test-full-login.js
 */

const http = require('http');

function makeRequest(url, data = null, cookies = null) {
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

    if (cookies) {
      options.headers['Cookie'] = cookies;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = data ? JSON.parse(body) : body;
          const responseCookies = res.headers['set-cookie'];
          resolve({ 
            status: res.statusCode, 
            data: response,
            cookies: responseCookies
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode, 
            data: body,
            cookies: res.headers['set-cookie']
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

function parseCookies(cookieHeaders) {
  if (!cookieHeaders) return '';
  return cookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
}

async function testFullLogin() {
  console.log('🔐 Testing Full Login Flow\n');

  try {
    // Step 1: Send MFA code
    console.log('1. Sending MFA code...');
    const sendResponse = await makeRequest('/api/admin/send-mfa', {
      email: 'isaac@rightimagedigital.com'
    });

    if (sendResponse.status !== 200) {
      console.log('❌ Failed to send code:', sendResponse.data);
      return;
    }

    console.log('✅ Code sent successfully');
    console.log(`📧 Email: ${sendResponse.data.email}`);
    console.log(`🔐 Code: ${sendResponse.data.debugCode}`);
    
    // Extract cookies
    const cookies = parseCookies(sendResponse.cookies);
    console.log(`🍪 Cookies: ${cookies ? 'Set' : 'None'}\n`);

    // Step 2: Verify MFA code
    console.log('2. Verifying MFA code...');
    const verifyResponse = await makeRequest('/api/admin/verify-mfa', {
      mfaCode: sendResponse.data.debugCode
    }, cookies);

    console.log(`📊 Status: ${verifyResponse.status}`);
    console.log(`📄 Response: ${JSON.stringify(verifyResponse.data, null, 2)}\n`);

    if (verifyResponse.status === 200) {
      console.log('🎉 LOGIN SUCCESSFUL!');
      console.log('You can now access the admin dashboard.');
    } else {
      console.log('❌ Login failed');
      console.log('Check the response above for details.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFullLogin(); 