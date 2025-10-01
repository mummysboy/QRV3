#!/usr/bin/env node

const { generateClient } = require('aws-amplify/api');
const bcrypt = require('bcryptjs');
const { Amplify } = require('aws-amplify');

// Configure Amplify
const amplifyConfig = {
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_AMPLIFY_API_ENDPOINT || 'https://your-api-endpoint.appsync-api.us-west-1.amazonaws.com/graphql',
      region: 'us-west-1',
      defaultAuthMode: 'apiKey',
      apiKey: process.env.NEXT_PUBLIC_AMPLIFY_API_KEY || 'your-api-key'
    }
  }
};

Amplify.configure(amplifyConfig);

async function createAdminUser() {
  try {
    console.log('🔧 Setting up admin user...');
    
    const client = generateClient({ authMode: 'apiKey' });
    
    // Check if admin user already exists
    const existingUsers = await client.graphql({
      query: `
        query ListAdminUsers {
          listAdminUsers {
            items {
              id
              email
              username
            }
          }
        }
      `
    });

    const users = existingUsers.data.listAdminUsers.items;
    console.log(`📋 Found ${users.length} existing admin users`);

    if (users.length > 0) {
      console.log('✅ Admin user already exists. Users found:');
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.email})`);
      });
      return;
    }

    // Create admin user
    const adminEmail = 'isaac@rightimagedigital.com';
    const adminPassword = 'admin123!'; // Change this in production
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = {
      id: `admin-${Date.now()}`,
      username: 'admin',
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Isaac',
      lastName: 'Hirsch',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('👤 Creating admin user...');
    const result = await client.graphql({
      query: `
        mutation CreateAdminUser($input: CreateAdminUserInput!) {
          createAdminUser(input: $input) {
            id
            username
            email
            firstName
            lastName
            role
            status
          }
        }
      `,
      variables: {
        input: adminUser
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the setup
createAdminUser();
