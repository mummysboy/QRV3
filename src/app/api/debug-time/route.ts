import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zipcode = searchParams.get('zip');
    
    const now = new Date();
    const serverTime = Date.now();
    
    const result = {
      success: true,
      timestamp: now.toISOString(),
      serverTime: serverTime,
      serverTimeISO: new Date(serverTime).toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utcOffset: now.getTimezoneOffset(),
      utcOffsetHours: now.getTimezoneOffset() / 60,
      environment: process.env.NODE_ENV || 'unknown',
      zipcode: zipcode || 'none provided',
      
      // Test with a sample expiration (2 hours from now)
      testExpiration: {
        value: new Date(serverTime + (2 * 60 * 60 * 1000)).toISOString(),
        isExpired: false,
        timeUntilExpiration: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
        timeUntilExpirationHours: 2
      },
      
      // Test with a sample expiration (2 hours ago)
      testExpired: {
        value: new Date(serverTime - (2 * 60 * 60 * 1000)).toISOString(),
        isExpired: true,
        timeSinceExpiration: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
        timeSinceExpirationHours: 2
      }
    };
    
    console.log('🔍 Time Debug API - Result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Time Debug API - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}


