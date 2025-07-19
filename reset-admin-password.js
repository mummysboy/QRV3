#!/usr/bin/env node

/**
 * Reset Admin Password
 * 
 * Resets the admin password to a simple, known password
 */

import fs from 'fs';
import path from 'path';

// File path for storing admin credentials
const CREDENTIALS_FILE = path.join(process.cwd(), 'admin-credentials.json');

// New simple password
const NEW_PASSWORD = 'admin123';
const EMAIL = 'isaac@rightimagedigital.com';

console.log('🔐 RESETTING ADMIN PASSWORD\n');

try {
  // Write new credentials to file
  const credentials = {
    email: EMAIL,
    password: NEW_PASSWORD
  };
  
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), 'utf8');
  
  console.log('✅ Password reset successfully!');
  console.log('📄 Credentials file updated');
  
  console.log('\n📋 NEW ADMIN CREDENTIALS:');
  console.log('   📧 Email: isaac@rightimagedigital.com');
  console.log('   🔑 Password: admin123');
  console.log('   💾 Stored in: admin-credentials.json');
  
  console.log('\n🌐 LOGIN URL:');
  console.log('   http://localhost:3000/admin/login');
  
  console.log('\n🎉 You can now login with:');
  console.log('   Email: isaac@rightimagedigital.com');
  console.log('   Password: admin123');
  
  console.log('\n💡 If you still can\'t login:');
  console.log('   1. Make sure you\'re using: admin123');
  console.log('   2. Try opening in incognito window');
  console.log('   3. Clear browser cache and cookies');
  console.log('   4. Check browser console for errors');
  
} catch (error) {
  console.error('❌ Error resetting password:', error.message);
} 