import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// Create S3 client with proper configuration
const isAmplify = !process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY;
const s3Client = new S3Client({
  region: "us-west-1",
  credentials: fromNodeProviderChain(), // ✅ required for Amplify IAM role usage
});

console.log("[upload-logo] S3 region:", "us-west-1");
console.log("[upload-logo] Using IAM role:", isAmplify);
console.log("[upload-logo] Environment check - ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
console.log("[upload-logo] Environment check - SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);

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
    console.log("[upload-logo] Starting upload process...");
    
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('logo');
    const businessName = formData.get('businessName') || '';

    console.log("[upload-logo] Form data parsed - businessName:", businessName);
    console.log("[upload-logo] Form data parsed - file type:", typeof file);
    console.log("[upload-logo] Form data parsed - file instanceof Blob:", file instanceof Blob);

    if (!file || typeof file === 'string' || !(file instanceof Blob)) {
      console.log("[upload-logo] File validation failed");
      return addCorsHeaders(NextResponse.json({ error: 'No file uploaded.' }, { status: 400 }));
    }

    console.log("[upload-logo] File validation passed - size:", file.size, "type:", file.type);

    if (file.size > MAX_FILE_SIZE) {
      console.log("[upload-logo] File size validation failed");
      return addCorsHeaders(NextResponse.json({ error: 'File size exceeds 5MB.' }, { status: 400 }));
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.log("[upload-logo] File type validation failed");
      return addCorsHeaders(NextResponse.json({ error: 'Invalid file type.' }, { status: 400 }));
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    let imageBuffer = Buffer.from(new Uint8Array(arrayBuffer)) as Buffer;
    console.log("[upload-logo] File buffer type:", typeof imageBuffer, "size:", imageBuffer.length);

    // Resize image to max 512x512 (preserve aspect ratio)
    imageBuffer = await sharp(imageBuffer)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .toFormat('png')
      .toBuffer();
    console.log("[upload-logo] Resized image buffer size:", imageBuffer.length);

    // Generate S3 key
    const safeBusinessName = String(businessName).replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 32) || 'logo';
    const key = `logos/${safeBusinessName}-${uuidv4()}.png`;
    console.log("[upload-logo] businessName:", businessName, "key:", key);

    // Upload to S3 with cache-control
    const putParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png',
      CacheControl: 'no-cache, max-age=0, must-revalidate',
    };
    console.log("[upload-logo] S3 PutObjectCommand params:", JSON.stringify({ ...putParams, Body: `Buffer(${imageBuffer.length})` }, null, 2));
    
    console.log("[upload-logo] Attempting S3 upload...");
    await s3Client.send(new PutObjectCommand(putParams));
    console.log("[upload-logo] S3 upload successful");

    return addCorsHeaders(NextResponse.json({ success: true, logoUrl: key }));
  } catch (err) {
    console.error('Logo upload error:', JSON.stringify(err, null, 2));
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Failed to upload logo.';
    
    if (err && typeof err === 'object' && 'name' in err) {
      const errorName = (err as { name?: string }).name;
      if (errorName === 'AccessDenied') {
        errorMessage = 'Access denied to S3 bucket. Check IAM permissions.';
      } else if (errorName === 'NoSuchBucket') {
        errorMessage = 'S3 bucket not found.';
      } else if (errorName === 'InvalidAccessKeyId') {
        errorMessage = 'Invalid AWS credentials.';
      } else if (errorName === 'SignatureDoesNotMatch') {
        errorMessage = 'AWS signature mismatch.';
      }
    }
    
    return addCorsHeaders(NextResponse.json({ error: errorMessage }, { status: 500 }));
  }
} 