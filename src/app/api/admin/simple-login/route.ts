import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getAdminCredentials } from '@/lib/admin-credentials';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const credentials = getAdminCredentials();
    
    // Check credentials
    if (email === credentials.email && password === credentials.password) {
              // Create a JWT token for admin session
        const sessionToken = jwt.sign(
          {
            id: 'admin-user',
            username: 'admin',
            role: 'admin',
            email: credentials.email
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
      
      // Set session cookie
      const cookieStore = await cookies();
      cookieStore.set('adminToken', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

              return NextResponse.json({
          success: true,
          message: 'Login successful',
          user: {
            id: 'admin-user',
            email: credentials.email,
            role: 'admin'
          }
        });
    } else {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 