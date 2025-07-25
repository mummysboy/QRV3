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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

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
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('logo');
    const businessName = formData.get('businessName') || '';

    if (!file || typeof file === 'string' || !(file instanceof Blob)) {
      return addCorsHeaders(NextResponse.json({ error: 'No file uploaded.' }, { status: 400 }));
    }

    if (file.size > MAX_FILE_SIZE) {
      return addCorsHeaders(NextResponse.json({ error: 'File size exceeds 5MB.' }, { status: 400 }));
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid file type.' }, { status: 400 }));
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    let imageBuffer = Buffer.from(new Uint8Array(arrayBuffer)) as Buffer;

    // Resize image to max 512x512 (preserve aspect ratio)
    imageBuffer = await sharp(imageBuffer)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .toFormat('png')
      .toBuffer();

    // Generate S3 key
    const safeBusinessName = String(businessName).replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 32) || 'logo';
    const key = `logos/${safeBusinessName}-${uuidv4()}.png`;

    // Upload to S3 with cache-control
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png',
      CacheControl: 'no-cache, max-age=0, must-revalidate',
    }));

    return addCorsHeaders(NextResponse.json({ success: true, logoUrl: key }));
  } catch (err) {
    console.error('Logo upload error:', err);
    return addCorsHeaders(NextResponse.json({ error: 'Failed to upload logo.' }, { status: 500 }));
  }
} 