#!/usr/bin/env node

/**
 * Test Login Page
 * 
 * Tests the admin login page functionality
 */

// Using built-in fetch (Node.js 18+)

async function testLoginPage() {
  console.log('🔐 Testing Admin Login Page\n');

  try {
    console.log('1. 📧 Testing login with correct credentials...');
    
    const loginResponse = await fetch('http://localhost:3000/api/admin/simple-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'isaac@rightimagedigital.com',
        password: 'persistent123'
      }),
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ API Login successful!');
      console.log('📄 Response:', JSON.stringify(loginData, null, 2));
    } else {
      console.log('❌ API Login failed');
      console.log('📄 Response:', JSON.stringify(loginData, null, 2));
      return;
    }

    console.log('\n2. 🌐 Testing login page accessibility...');
    
    const pageResponse = await fetch('http://localhost:3000/admin/login');
    
    if (pageResponse.ok) {
      console.log('✅ Login page is accessible');
      console.log('📊 Status:', pageResponse.status);
      
      const pageText = await pageResponse.text();
      if (pageText.includes('Admin Login')) {
        console.log('✅ Login page contains "Admin Login" text');
      } else {
        console.log('❌ Login page missing expected content');
      }
      
      if (pageText.includes('isaac@rightimagedigital.com')) {
        console.log('✅ Login page has pre-filled email');
      } else {
        console.log('❌ Login page missing pre-filled email');
      }
      
      if (pageText.includes('form')) {
        console.log('✅ Login page contains form element');
      } else {
        console.log('❌ Login page missing form element');
      }
      
    } else {
      console.log('❌ Login page not accessible');
      console.log('📊 Status:', pageResponse.status);
    }

    console.log('\n3. 🔍 Testing session validation...');
    
    // Extract cookies from successful login
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    let cookies = '';
    if (setCookieHeader) {
      cookies = setCookieHeader.split(';')[0];
      console.log('🍪 Login cookies extracted');
    }

    if (cookies) {
      const sessionResponse = await fetch('http://localhost:3000/api/admin/validate-session', {
        method: 'GET',
        headers: {
          'Cookie': cookies
        },
      });

      const sessionData = await sessionResponse.json();
      
      if (sessionResponse.ok) {
        console.log('✅ Session validation successful');
        console.log('📄 Response:', JSON.stringify(sessionData, null, 2));
      } else {
        console.log('❌ Session validation failed');
        console.log('📄 Response:', JSON.stringify(sessionData, null, 2));
      }
    } else {
      console.log('⚠️  No cookies found for session validation');
    }

    console.log('\n🎉 LOGIN PAGE TEST COMPLETE!');
    console.log('\n📋 Current Working Credentials:');
    console.log('   📧 Email: isaac@rightimagedigital.com');
    console.log('   🔑 Password: persistent123');
    console.log('\n🌐 Go to: http://localhost:3000/admin/login');
    console.log('\n💡 If you can\'t login in the browser:');
    console.log('   1. Make sure you\'re using the correct password: persistent123');
    console.log('   2. Check browser console for JavaScript errors');
    console.log('   3. Try clearing browser cache and cookies');
    console.log('   4. Make sure JavaScript is enabled');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLoginPage(); 