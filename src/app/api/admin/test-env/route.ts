import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables
    const hasAdminEmail = !!process.env.ADMIN_EMAIL;
    const hasAdminPassword = !!process.env.ADMIN_PASSWORD;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    
    // Get additional environment info
    const nodeEnv = process.env.NODE_ENV;
    const adminEmail = process.env.ADMIN_EMAIL;
    
    // Check if we're in production
    const isProduction = nodeEnv === 'production';
    
    // Test admin credentials function
    const { getAdminCredentials } = await import('@/lib/admin-credentials');
    const credentials = getAdminCredentials();
    
    return NextResponse.json({
      success: true,
      environment: {
        nodeEnv,
        isProduction,
      },
      environmentVariables: {
        hasAdminEmail,
        hasAdminPassword,
        hasJwtSecret,
        adminEmail: hasAdminEmail ? adminEmail : 'NOT SET',
        adminPasswordSet: hasAdminPassword ? 'YES' : 'NO',
        jwtSecretSet: hasJwtSecret ? 'YES' : 'NO',
      },
      credentialsSource: {
        usingEnvVars: hasAdminEmail && hasAdminPassword,
        usingFileSystem: !hasAdminEmail && !hasAdminPassword,
        usingDefaults: !hasAdminEmail && !hasAdminPassword,
        currentEmail: credentials.email,
        currentPasswordSet: credentials.password ? 'YES' : 'NO',
      },
      cookieSettings: {
        secure: isProduction,
        sameSite: 'lax',
        httpOnly: true,
      },
      recommendations: {
        needsEnvVars: !hasAdminEmail || !hasAdminPassword || !hasJwtSecret,
        missingVars: [
          !hasAdminEmail && 'ADMIN_EMAIL',
          !hasAdminPassword && 'ADMIN_PASSWORD',
          !hasJwtSecret && 'JWT_SECRET'
        ].filter(Boolean),
      }
    });
  } catch (error) {
    console.error('Test environment endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
