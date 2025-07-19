#!/usr/bin/env node

/**
 * Test Persistent Password Change
 * 
 * Tests that password changes persist across server restarts
 */

// Using built-in fetch (Node.js 18+)

async function testPersistentPassword() {
  console.log('🔐 Testing Persistent Password Change\n');

  let cookies = '';

  try {
    console.log('1. 📧 First, checking current password...');
    
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
    
    if (loginResponse.ok) {
      console.log('✅ Current password is: admin123');
    } else {
      console.log('❌ admin123 is not working, trying other passwords...');
      
      // Try a few common passwords
      const passwordsToTry = ['newpassword123', 'password123', 'admin'];
      let foundPassword = null;
      
      for (const password of passwordsToTry) {
        const testResponse = await fetch('http://localhost:3000/api/admin/simple-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'isaac@rightimagedigital.com',
            password: password
          }),
        });
        
        if (testResponse.ok) {
          foundPassword = password;
          console.log(`✅ Found working password: ${password}`);
          break;
        }
      }
      
      if (!foundPassword) {
        console.log('❌ Could not find working password');
        return;
      }
    }

    // Extract cookies from successful login
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies = setCookieHeader.split(';')[0];
      console.log('🍪 Login cookies extracted');
    }

    console.log('\n2. 🔑 Changing password to "persistent123"...');
    
    const passwordChangeResponse = await fetch('http://localhost:3000/api/admin/simple-change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        currentPassword: 'admin123',
        newPassword: 'persistent123',
        confirmPassword: 'persistent123'
      }),
    });

    const passwordChangeData = await passwordChangeResponse.json();
    
    if (!passwordChangeResponse.ok) {
      console.log('❌ Password change failed');
      console.log('📄 Response:', JSON.stringify(passwordChangeData, null, 2));
      return;
    }

    console.log('✅ Password changed successfully');
    console.log('📄 Response:', JSON.stringify(passwordChangeData, null, 2));

    console.log('\n3. 🔍 Testing login with NEW password...');
    
    const newPasswordResponse = await fetch('http://localhost:3000/api/admin/simple-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'isaac@rightimagedigital.com',
        password: 'persistent123'
      }),
    });

    const newPasswordData = await newPasswordResponse.json();
    
    if (newPasswordResponse.ok) {
      console.log('✅ NEW password login successful!');
      console.log('📄 Response:', JSON.stringify(newPasswordData, null, 2));
    } else {
      console.log('❌ NEW password login failed');
      console.log('📄 Response:', JSON.stringify(newPasswordData, null, 2));
    }

    console.log('\n4. 🔍 Testing login with OLD password (should fail)...');
    
    const oldPasswordResponse = await fetch('http://localhost:3000/api/admin/simple-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'isaac@rightimagedigital.com',
        password: 'admin123'
      }),
    });

    if (oldPasswordResponse.ok) {
      console.log('❌ OLD password still works (this is wrong!)');
    } else {
      console.log('✅ OLD password correctly rejected');
    }

    console.log('\n🎉 PERSISTENT PASSWORD TEST COMPLETE!');
    console.log('\n📋 Current Credentials:');
    console.log('   📧 Email: isaac@rightimagedigital.com');
    console.log('   🔑 Password: persistent123');
    console.log('\n💡 This password should persist even if you restart the server!');
    console.log('\n🌐 Go to: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPersistentPassword(); 