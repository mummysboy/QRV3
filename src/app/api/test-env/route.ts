import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      jwt_secret_available: !!process.env.JWT_SECRET,
      jwt_secret_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      node_env: process.env.NODE_ENV,
      all_env_vars: Object.keys(process.env).filter(key => key.includes('JWT') || key.includes('NODE'))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
