import { NextResponse } from "next/server";
import { S3Client, HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import outputs from "../../../amplify_outputs.json";

const BUCKET_NAME = (outputs as any).storage?.bucket_name || "amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3";
const REGION = (outputs as any).storage?.aws_region || "us-west-1";

export async function GET() {
  try {
    console.log("🧪 Testing S3 credentials and permissions...");
    console.log("🔧 BUCKET_NAME:", BUCKET_NAME);
    console.log("🔧 REGION:", REGION);
    console.log("🔧 ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
    console.log("🔧 SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
    console.log("🔧 SESSION_TOKEN exists:", !!process.env.SESSION_TOKEN);
    console.log("🔧 AWS_REGION:", process.env.AWS_REGION);
    console.log("🔧 AWS_DEFAULT_REGION:", process.env.AWS_DEFAULT_REGION);

    // Build S3 client with proper configuration
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
      console.log("🔧 Using explicit credentials from environment");
    } else {
      console.log("🔧 No explicit credentials found, using IAM role");
    }

    const s3Client = new S3Client(s3ClientConfig);

    // Test 1: Check bucket access
    console.log("🧪 Test 1: Checking bucket access...");
    let bucketAccessible = false;
    let bucketError = null;
    
    try {
      const headCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
      await s3Client.send(headCommand);
      bucketAccessible = true;
      console.log("✅ Bucket is accessible");
    } catch (error) {
      bucketError = error;
      console.error("❌ Bucket access error:", error);
    }

    // Test 2: List objects in logos folder
    console.log("🧪 Test 2: Listing objects in logos folder...");
    let logosListed = false;
    let logosError = null;
    let logoCount = 0;
    
    if (bucketAccessible) {
      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: "logos/",
          MaxKeys: 10,
        });
        
        const result = await s3Client.send(listCommand);
        logosListed = true;
        logoCount = result.Contents?.length || 0;
        console.log("✅ Logos folder accessible, found", logoCount, "objects");
        
        if (result.Contents && result.Contents.length > 0) {
          console.log("🔍 Sample logos:", result.Contents.slice(0, 3).map(obj => obj.Key));
        }
      } catch (error) {
        logosError = error;
        console.error("❌ Logos listing error:", error);
      }
    }

    // Test 3: Check if we can generate presigned URLs
    console.log("🧪 Test 3: Testing presigned URL generation...");
    let presignedUrlGenerated = false;
    let presignedUrlError = null;
    
    if (bucketAccessible) {
      try {
        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
        const { PutObjectCommand } = await import("@aws-sdk/client-s3");
        
        const putObjectCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: "test-presigned-url-test.txt",
          ContentType: "text/plain",
        });
        
        const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
          expiresIn: 300,
        });
        
        presignedUrlGenerated = true;
        console.log("✅ Presigned URL generated successfully");
        console.log("🔍 Sample presigned URL:", presignedUrl.substring(0, 100) + "...");
      } catch (error) {
        presignedUrlError = error;
        console.error("❌ Presigned URL generation error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      bucketName: BUCKET_NAME,
      region: REGION,
      hasExplicitCredentials: !!(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY),
      bucketAccessible,
      bucketError: bucketError ? (bucketError as Error).message : null,
      logosListed,
      logoCount,
      logosError: logosError ? (logosError as Error).message : null,
      presignedUrlGenerated,
      presignedUrlError: presignedUrlError ? (presignedUrlError as Error).message : null,
      environment: {
        awsRegion: process.env.AWS_REGION,
        awsDefaultRegion: process.env.AWS_DEFAULT_REGION,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error("❌ S3 credentials test error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        bucketName: BUCKET_NAME,
        region: REGION
      },
      { status: 500 }
    );
  }
}
