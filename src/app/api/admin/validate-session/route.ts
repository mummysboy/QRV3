import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get('adminToken');
    
    if (!adminToken) {
      return NextResponse.json(
        { error: "No admin session found" },
        { status: 401 }
      );
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(adminToken.value, JWT_SECRET) as {
        id: string;
        username: string;
        role: string;
        email: string;
        iat: number;
        exp: number;
      };
      
      return NextResponse.json({
        success: true,
        user: { 
          id: decoded.id,
          username: decoded.username, 
          role: decoded.role,
          email: decoded.email
        }
      });
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 500 }
    );
  }
} 