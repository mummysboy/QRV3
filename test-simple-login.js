#!/usr/bin/env node

/**
 * Test Simple Login
 * 
 * Tests the simple email and password login system
 */

// Using built-in fetch (Node.js 18+)

async function testSimpleLogin() {
  console.log('🔐 Testing Simple Email/Password Login\n');

  try {
    console.log('📧 Testing with correct credentials...');
    
    const response = await fetch('http://localhost:3000/api/admin/simple-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'isaac@rightimagedigital.com',
        password: 'admin123'
      }),
    });

    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📄 Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('🎉 You can now use these credentials:');
      console.log('   📧 Email: isaac@rightimagedigital.com');
      console.log('   🔑 Password: admin123');
      console.log('\n🌐 Go to: http://localhost:3000/admin/login');
    } else {
      console.log('\n❌ Login failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimpleLogin(); 