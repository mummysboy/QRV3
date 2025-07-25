import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

const BUCKET_NAME = "qrewards-media6367c-dev";
const REGION = "us-west-1";

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
    console.log("[delete-logo] Starting logo deletion...");

    const { logoKey } = await request.json();

    if (!logoKey || typeof logoKey !== "string") {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Missing or invalid logoKey" },
          { status: 400 }
        )
      );
    }

    // Validate that the key is for a logo file
    if (!logoKey.startsWith('logos/')) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Invalid logo key format" },
          { status: 400 }
        )
      );
    }

    console.log("[delete-logo] Deleting logo with key:", logoKey);

    // Build S3 client
    const creds = await fromNodeProviderChain()();
    const s3Client = new S3Client({
      region: REGION,
      credentials: creds,
    });

    // Delete the object
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: logoKey,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));

    console.log("[delete-logo] Logo deleted successfully ✅");

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        message: "Logo deleted successfully",
        deletedKey: logoKey,
      })
    );
  } catch (err) {
    console.error("❌ Logo deletion error:", JSON.stringify(err, null, 2));

    let errorMessage = "Failed to delete logo.";
    if (err && typeof err === 'object' && 'name' in (err as Record<string, unknown>)) {
      const errorName = (err as { name?: string }).name;
      if (errorName === 'NoSuchKey') {
        errorMessage = 'Logo not found (may have already been deleted).';
      } else if (errorName === 'AccessDenied') {
        errorMessage = 'Access denied to S3 bucket. Check IAM permissions.';
      } else if (errorName === 'NoSuchBucket') {
        errorMessage = 'S3 bucket not found.';
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
          },
        },
        { status: 500 }
      )
    );
  }
} 