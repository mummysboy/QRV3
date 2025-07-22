const puppeteer = require('puppeteer');

async function testCooldown() {
  console.log('🧪 Testing cooldown functionality...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to a claim-reward page
    console.log('📍 Navigating to claim-reward page...');
    await page.goto('http://localhost:3000/claim-reward/94105');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Check if there's a card displayed
    const cardElement = await page.$('[data-testid="card-animation"]') || await page.$('.card-animation');
    
    if (cardElement) {
      console.log('✅ Card is displayed initially');
      
      // Check if there's a claim button
      const claimButton = await page.$('button:contains("Claim Reward")') || await page.$('button');
      
      if (claimButton) {
        console.log('✅ Claim button found');
        
        // Click the claim button
        console.log('🖱️ Clicking claim button...');
        await claimButton.click();
        
        // Wait for the claim popup
        await page.waitForTimeout(2000);
        
        // Fill out the claim form (assuming it has email and phone fields)
        const emailInput = await page.$('input[type="email"]') || await page.$('input[placeholder*="email"]');
        const phoneInput = await page.$('input[type="tel"]') || await page.$('input[placeholder*="phone"]');
        
        if (emailInput && phoneInput) {
          await emailInput.type('test@example.com');
          await phoneInput.type('5551234567');
          
          // Submit the form
          const submitButton = await page.$('button[type="submit"]') || await page.$('button:contains("Submit")');
          if (submitButton) {
            console.log('📝 Submitting claim form...');
            await submitButton.click();
            
            // Wait for the thank you overlay
            await page.waitForTimeout(3000);
            
            // Check if thank you overlay is shown
            const thankYouOverlay = await page.$('.thank-you-overlay') || await page.$('[data-testid="thank-you-overlay"]');
            
            if (thankYouOverlay) {
              console.log('✅ Thank you overlay is displayed');
              
              // Now refresh the page
              console.log('🔄 Refreshing the page...');
              await page.reload();
              
              // Wait for the page to load
              await page.waitForTimeout(3000);
              
              // Check if the thank you overlay is still shown (should be due to cooldown)
              const thankYouOverlayAfterRefresh = await page.$('.thank-you-overlay') || await page.$('[data-testid="thank-you-overlay"]');
              
              if (thankYouOverlayAfterRefresh) {
                console.log('✅ SUCCESS: Thank you overlay is still displayed after refresh (cooldown working)');
                
                // Check if there's a countdown timer
                const countdownText = await page.evaluate(() => {
                  const text = document.body.innerText;
                  return text.includes('You can play again in:') || text.includes('15:') || text.includes('14:');
                });
                
                if (countdownText) {
                  console.log('✅ Countdown timer is displayed');
                } else {
                  console.log('⚠️ Countdown timer not found');
                }
              } else {
                console.log('❌ FAILED: Thank you overlay not displayed after refresh (cooldown not working)');
              }
            } else {
              console.log('❌ Thank you overlay not found after claim submission');
            }
          } else {
            console.log('❌ Submit button not found');
          }
        } else {
          console.log('❌ Email or phone input not found');
        }
      } else {
        console.log('❌ Claim button not found');
      }
    } else {
      console.log('❌ Card not displayed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

// Run the test
testCooldown().catch(console.error); 