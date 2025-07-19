#!/usr/bin/env node

/**
 * AWS SNS Phone Verification Helper
 * 
 * This script helps you verify your phone number in AWS SNS.
 * 
 * Usage:
 * node verify-phone-aws.js
 */

console.log('📱 AWS SNS Phone Verification Guide\n');
console.log('Your phone number: 4155724853 (+14155724853)\n');

console.log('🔧 Steps to verify your phone number in AWS SNS:\n');

console.log('1. Go to AWS SNS Console:');
console.log('   https://console.aws.amazon.com/sns/\n');

console.log('2. Click "Text messaging (SMS)" in the left sidebar\n');

console.log('3. Check your SMS status:');
console.log('   - If "Sandbox mode" is enabled, you need to verify your number');
console.log('   - If "Production mode" is enabled, you can send to any number\n');

console.log('4. To verify your phone number:');
console.log('   - Click "Request production access" or "Verify a phone number"');
console.log('   - Enter your phone number: +14155724853');
console.log('   - AWS will send you a verification code');
console.log('   - Enter the code to verify your number\n');

console.log('5. Alternative: Request Production Access');
console.log('   - Fill out the production access form');
console.log('   - Explain your use case (admin login verification)');
console.log('   - AWS will review and approve within 24-48 hours\n');

console.log('6. Check SMS Spending Limits:');
console.log('   - Go to "SMS preferences"');
console.log('   - Set a monthly spending limit (e.g., $10)');
console.log('   - Default limit might be $0, preventing SMS sending\n');

console.log('📋 Quick Fixes to Try:\n');

console.log('A. Test with a different phone number:');
console.log('   - Try your home phone or another mobile number');
console.log('   - Some carriers block AWS SNS messages\n');

console.log('B. Check AWS Region:');
console.log('   - Make sure you\'re using us-west-1 region');
console.log('   - Check your AWS credentials are correct\n');

console.log('C. Temporary Workaround:');
console.log('   - Use email verification instead of SMS');
console.log('   - Or implement a test mode that shows the code in console\n');

console.log('🎯 Most likely solution:');
console.log('   Your AWS SNS account is in sandbox mode and needs phone verification.');
console.log('   Follow steps 1-4 above to verify your phone number.\n'); 