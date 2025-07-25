import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const BUCKET_NAME = "qrewards-media6367c-dev";
const REGION = "us-west-1";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

// CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    console.log("[upload-logo] Starting upload process...");

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("logo");
    const businessName = formData.get("businessName") || "";

    console.log("[upload-logo] Received businessName:", businessName);
    console.log(
      "[upload-logo] File type:",
      typeof file,
      "instanceof Blob:",
      file instanceof Blob
    );

    if (!file || typeof file === "string" || !(file instanceof Blob)) {
      return addCorsHeaders(
        NextResponse.json({ error: "No file uploaded." }, { status: 400 })
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return addCorsHeaders(
        NextResponse.json({ error: "File size exceeds 5MB." }, { status: 400 })
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return addCorsHeaders(
        NextResponse.json({ error: "Invalid file type." }, { status: 400 })
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    let imageBuffer = Buffer.from(arrayBuffer as ArrayBufferLike);
    console.log("[upload-logo] File buffer type:", typeof imageBuffer, "size:", imageBuffer.length);

    // Resize and convert to PNG
    imageBuffer = await sharp(imageBuffer)
      .resize(512, 512, { fit: "inside", withoutEnlargement: true })
      .toFormat("png")
      .toBuffer();

    const safeBusinessName =
      String(businessName)
        .replace(/[^a-zA-Z0-9-_]/g, "")
        .slice(0, 32) || "logo";
    const key = `logos/${safeBusinessName}-${uuidv4()}.png`;

    console.log("[upload-logo] Generated S3 key:", key);
    console.log("[upload-logo] Resized image size:", imageBuffer.length);

    // Build S3 client
    const creds = await fromNodeProviderChain()();
    const s3Client = new S3Client({
      region: REGION,
      credentials: creds,
    });

    console.log("✅ Resolved IAM credentials:", JSON.stringify(creds, null, 2));

    const putParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/png",
      CacheControl: "no-cache, max-age=0, must-revalidate",
    };

    console.log(
      "[upload-logo] Uploading to S3:",
      JSON.stringify(
        { ...putParams, Body: `Buffer(${imageBuffer.length})` },
        null,
        2
      )
    );

    await s3Client.send(new PutObjectCommand(putParams));

    console.log("[upload-logo] Upload successful ✅");
    return addCorsHeaders(NextResponse.json({ success: true, logoUrl: key }));
  } catch (err) {
    console.error("❌ Logo upload error:", JSON.stringify(err, null, 2));

    let errorMessage = "Failed to upload logo.";
    if (err && typeof err === 'object' && 'name' in (err as Record<string, unknown>)) {
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

    const errObj = err as Record<string, unknown>;
    return addCorsHeaders(
      NextResponse.json(
        {
          error: errorMessage,
          details: {
            name: errObj?.name,
            message: errObj?.message,
            $metadata: errObj?.$metadata,
          },
        },
        { status: 500 }
      )
    );
  }
}