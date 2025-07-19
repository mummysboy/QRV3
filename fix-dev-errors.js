#!/usr/bin/env node

/**
 * Development Environment Fix Script
 * 
 * This script helps resolve common development issues with Next.js.
 * 
 * Usage:
 * node fix-dev-errors.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Development Environment Issues...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.log('❌ Please run this script from your project root directory');
  process.exit(1);
}

try {
  // 1. Clear Next.js cache
  console.log('1. Clearing Next.js cache...');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('   ✅ Next.js cache cleared');
  } else {
    console.log('   ℹ️  No .next directory found');
  }

  // 2. Clear node_modules and reinstall
  console.log('\n2. Reinstalling dependencies...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
    console.log('   ✅ node_modules removed');
  }
  
  execSync('npm install', { stdio: 'inherit' });
  console.log('   ✅ Dependencies reinstalled');

  // 3. Clear browser cache instructions
  console.log('\n3. Browser Cache Issues:');
  console.log('   To fix "Could not establish connection" errors:');
  console.log('   - Disable browser extensions temporarily');
  console.log('   - Clear browser cache and cookies');
  console.log('   - Try incognito/private browsing mode');
  console.log('   - Restart your browser');

  // 4. Environment check
  console.log('\n4. Environment Variables Check:');
  const envFiles = ['.env.local', '.env.development', '.env'];
  let envFound = false;
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ Found ${file}`);
      envFound = true;
    }
  });
  
  if (!envFound) {
    console.log('   ⚠️  No environment files found');
    console.log('   Create .env.local with:');
    console.log('   JWT_SECRET=your-secret-key');
    console.log('   NEXT_PUBLIC_APP_URL=http://localhost:3000');
  }

  // 5. Port check
  console.log('\n5. Port Availability:');
  try {
    execSync('lsof -ti:3000', { stdio: 'pipe' });
    console.log('   ⚠️  Port 3000 is in use');
    console.log('   Try: kill $(lsof -ti:3000)');
  } catch (error) {
    console.log('   ✅ Port 3000 is available');
  }

  console.log('\n🎉 Development environment fixed!');
  console.log('\nNext steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Open http://localhost:3000 in your browser');
  console.log('3. Test the phone-only login at /admin/login');
  console.log('4. If issues persist, try a different browser');

} catch (error) {
  console.error('❌ Error fixing development environment:', error.message);
  console.log('\nManual steps:');
  console.log('1. Stop your development server (Ctrl+C)');
  console.log('2. Delete .next folder: rm -rf .next');
  console.log('3. Delete node_modules: rm -rf node_modules');
  console.log('4. Reinstall: npm install');
  console.log('5. Restart: npm run dev');
} 