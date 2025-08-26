import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import outputs from "../../../../amplify_outputs.json";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

// Get bucket name from Amplify outputs
const BUCKET_NAME = (outputs as any).storage?.bucket_name || "amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3";
const REGION = (outputs as any).storage?.aws_region || "us-west-1";

// CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    console.log("[presigned-upload] Starting presigned URL generation...");
    console.log("[presigned-upload] Environment - BUCKET_NAME:", BUCKET_NAME);
    console.log("[presigned-upload] Environment - REGION:", REGION);
    console.log("[presigned-upload] Environment - ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
    console.log("[presigned-upload] Environment - SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
    console.log("[presigned-upload] Environment - SESSION_TOKEN exists:", !!process.env.SESSION_TOKEN);

    const { businessName, fileName, contentType } = await request.json();
    
    console.log("[presigned-upload] Request data:", { businessName, fileName, contentType });

    if (!businessName || !fileName || !contentType) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Missing required fields: businessName, fileName, contentType" },
          { status: 400 }
        )
      );
    }

    // Validate content type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(contentType)) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Invalid content type. Allowed: " + allowedTypes.join(", ") },
          { status: 400 }
        )
      );
    }

    // Generate S3 key
    const safeBusinessName = String(businessName)
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .slice(0, 32) || "logo";
    
    const fileExtension = contentType.split('/')[1] || 'png';
    const key = `logos/${safeBusinessName}-${uuidv4()}.${fileExtension}`;

    console.log("[presigned-upload] Generated S3 key:", key);

    // Build S3 client with proper credentials for hosted environment
    const s3ClientConfig: any = {
      region: REGION,
    };

    // Add credentials if they exist in environment variables
    if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY) {
      s3ClientConfig.credentials = {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        ...(process.env.SESSION_TOKEN && { sessionToken: process.env.SESSION_TOKEN }),
      };
      console.log("[presigned-upload] Using explicit credentials from environment");
    } else {
      // Use credential provider chain for IAM roles
      const creds = await fromNodeProviderChain()();
      s3ClientConfig.credentials = creds;
      console.log("[presigned-upload] Using IAM role via credential provider chain");
    }

    const s3Client = new S3Client(s3ClientConfig);

    // Create presigned URL
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      CacheControl: "no-cache, max-age=0, must-revalidate",
    });

    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 300, // 5 minutes
    });

    console.log("[presigned-upload] Generated presigned URL successfully ✅");

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        presignedUrl,
        key,
        bucket: BUCKET_NAME,
        expiresIn: 300,
      })
    );
  } catch (err) {
    console.error("❌ Presigned URL generation error:", JSON.stringify(err, null, 2));

    let errorMessage = "Failed to generate presigned URL.";
    if (err && typeof err === 'object' && 'name' in (err as Record<string, unknown>)) {
      const errorName = (err as { name?: string }).name;
      if (errorName === 'AccessDenied') {
        errorMessage = 'Access denied to S3 bucket. Check IAM permissions.';
      } else if (errorName === 'NoSuchBucket') {
        errorMessage = 'S3 bucket not found.';
      } else if (errorName === 'InvalidAccessKeyId') {
        errorMessage = 'Invalid AWS credentials.';
      } else if (errorName === 'UnrecognizedClientException') {
        errorMessage = 'AWS credentials not configured properly.';
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
            code: errObj?.code,
          },
        },
        { status: 500 }
      )
    );
  }
} 