import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// Create S3 client with proper configuration
const s3Client = new S3Client({
  region: "us-west-1",
  // Add credentials if they exist in environment variables (for local development)
  // When deployed on AWS, this will use the IAM role automatically
  ...(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY && {
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  }),
});

const BUCKET_NAME = "qrewards-media6367c-dev";

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  console.log('🔧 Logo upload: Handler reached');
  return NextResponse.json({ success: true });
} 