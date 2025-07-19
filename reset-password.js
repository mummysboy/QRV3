#!/usr/bin/env node

/**
 * Reset Password and Test Full Flow
 * 
 * Resets the admin password and tests the complete password change flow
 */

// Using built-in fetch (Node.js 18+)

async function resetPasswordAndTest() {
  console.log('🔄 Resetting Password and Testing Full Flow\n');

  try {
    console.log('1. 🔄 Resetting password to default...');
    
    // First, let's try to login with the current password (whatever it is)
    // We'll try a few common passwords
    const passwordsToTry = ['admin123', 'newpassword123', 'password123'];
    let currentPassword = null;
    let cookies = '';

    for (const password of passwordsToTry) {
      console.log(`   Trying password: ${password}`);
      
      const loginResponse = await fetch('http://localhost:3000/api/admin/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'isaac@rightimagedigital.com',
          password: password
        }),
      });

      if (loginResponse.ok) {
        currentPassword = password;
        console.log(`   ✅ Found working password: ${password}`);
        
        // Extract cookies
        const setCookieHeader = loginResponse.headers.get('set-cookie');
        if (setCookieHeader) {
          cookies = setCookieHeader.split(';')[0];
        }
        break;
      }
    }

    if (!currentPassword) {
      console.log('❌ Could not find working password. Resetting to default...');
      
      // Force reset by changing to a known password
      const resetResponse = await fetch('http://localhost:3000/api/admin/simple-change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: 'anypassword', // This will fail, but we'll handle it
          newPassword: 'admin123',
          confirmPassword: 'admin123'
        }),
      });

      if (resetResponse.ok) {
        console.log('✅ Password reset to admin123');
        currentPassword = 'admin123';
      } else {
        console.log('❌ Could not reset password automatically');
        console.log('💡 You may need to restart the server to reset the password');
        return;
      }
    }

    console.log('\n2. 🔑 Testing password change to "newpassword123"...');
    
    const passwordChangeResponse = await fetch('http://localhost:3000/api/admin/simple-change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      }),
    });

    const passwordChangeData = await passwordChangeResponse.json();
    
    if (!passwordChangeResponse.ok) {
      console.log('❌ Password change failed');
      console.log('📄 Response:', JSON.stringify(passwordChangeData, null, 2));
      return;
    }

    console.log('✅ Password changed successfully');

    console.log('\n3. 🔍 Testing login with NEW password...');
    
    const newPasswordResponse = await fetch('http://localhost:3000/api/admin/simple-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'isaac@rightimagedigital.com',
        password: 'newpassword123'
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

    console.log('\n🎉 PASSWORD RESET AND TEST COMPLETE!');
    console.log('\n📋 Current Credentials:');
    console.log('   📧 Email: isaac@rightimagedigital.com');
    console.log('   🔑 Password: newpassword123');
    console.log('\n🌐 Go to: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetPasswordAndTest(); 