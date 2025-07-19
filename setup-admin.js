#!/usr/bin/env node

/**
 * Admin Setup Script
 * 
 * This script creates the initial admin user for the QRewards system.
 * Run this script after deploying the application to set up the first admin account.
 * 
 * Usage:
 * node setup-admin.js
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

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: new URL(url).hostname,
      port: new URL(url).port || 443,
      path: new URL(url).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
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
          resolve({ status: res.statusCode, data: response });
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

async function setupAdmin() {
  console.log('🔧 QRewards Admin Setup\n');
  console.log('This script will create the initial admin user for your QRewards system.\n');

  try {
    // Get base URL
    const baseUrl = await question('Enter your application URL (e.g., https://your-app.vercel.app): ');
    if (!baseUrl) {
      console.log('❌ Base URL is required');
      process.exit(1);
    }

    // Get admin details
    const username = await question('Enter admin username: ');
    if (!username) {
      console.log('❌ Username is required');
      process.exit(1);
    }

    const email = await question('Enter admin email: ');
    if (!email) {
      console.log('❌ Email is required');
      process.exit(1);
    }

    const firstName = await question('Enter admin first name: ');
    if (!firstName) {
      console.log('❌ First name is required');
      process.exit(1);
    }

    const lastName = await question('Enter admin last name: ');
    if (!lastName) {
      console.log('❌ Last name is required');
      process.exit(1);
    }

    const password = await question('Enter admin password (min 8 characters): ');
    if (!password || password.length < 8) {
      console.log('❌ Password must be at least 8 characters long');
      process.exit(1);
    }

    const confirmPassword = await question('Confirm admin password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      process.exit(1);
    }

    console.log('\n🔄 Creating admin user...');

    const adminData = {
      username,
      email,
      password,
      firstName,
      lastName
    };

    const response = await makeRequest(`${baseUrl}/api/admin/create-admin`, adminData);

    if (response.status === 200) {
      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Admin Details:');
      console.log(`   Username: ${username}`);
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${firstName} ${lastName}`);
      console.log('\n🔐 You can now log in to the admin dashboard at:');
      console.log(`${baseUrl}/admin/login`);
      console.log('\n⚠️  Important: Keep these credentials secure!');
    } else {
      console.log('❌ Failed to create admin user');
      console.log('Error:', response.data.error || 'Unknown error');
      if (response.data.details) {
        console.log('Details:', response.data.details);
      }
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your application is deployed and accessible');
    console.log('2. Check that the API endpoint is working');
    console.log('3. Verify your database schema includes the AdminUser model');
    console.log('4. Ensure your environment variables are set correctly');
  } finally {
    rl.close();
  }
}

// Run the setup
setupAdmin(); 