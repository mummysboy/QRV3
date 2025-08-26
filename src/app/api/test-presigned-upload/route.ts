import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import outputs from "../../../amplify_outputs.json";

const BUCKET_NAME = (outputs as any).storage?.bucket_name || "amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3";
const REGION = (outputs as any).storage?.aws_region || "us-west-1";

// Test endpoint for presigned upload functionality - Updated for environment variable testing
export async function GET(request: NextRequest) {
  console.log("🧪 Testing presigned upload generation...");
  
  try {
    // Test 1: Check environment variables
    console.log("🧪 Test 1: Environment variables...");
    console.log("🧪 ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
    console.log("🧪 SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
    console.log("🧪 SESSION_TOKEN exists:", !!process.env.SESSION_TOKEN);
    console.log("🧪 BUCKET_NAME:", BUCKET_NAME);
    console.log("🧪 REGION:", REGION);
    
    // Test 2: Create S3 client
    console.log("🧪 Test 2: Creating S3 client...");
    const s3ClientConfig: any = {
      region: REGION,
    };
    
    if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY) {
      s3ClientConfig.credentials = {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        ...(process.env.SESSION_TOKEN && { sessionToken: process.env.SESSION_TOKEN }),
      };
      console.log("🧪 Using explicit credentials from environment");
    } else {
      console.log("🧪 No explicit credentials found, using IAM role");
    }
    
    const s3Client = new S3Client(s3ClientConfig);
    console.log("✅ S3 client created successfully");
    
    // Test 3: Generate presigned URL
    console.log("🧪 Test 3: Generating presigned URL...");
    const testKey = `test-logos/test-${uuidv4()}.png`;
    
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      ContentType: "image/png",
      CacheControl: "no-cache, max-age=0, must-revalidate",
    });
    
    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 300, // 5 minutes
    });
    
    console.log("✅ Presigned URL generated successfully");
    console.log("🧪 Test key:", testKey);
    console.log("🧪 Presigned URL length:", presignedUrl.length);
    
    return NextResponse.json({
      success: true,
      message: "Presigned upload test completed successfully",
      bucketName: BUCKET_NAME,
      region: REGION,
      testKey,
      presignedUrlGenerated: true,
      presignedUrlLength: presignedUrl.length,
      environmentVariables: {
        accessKeyId: !!process.env.ACCESS_KEY_ID,
        secretAccessKey: !!process.env.SECRET_ACCESS_KEY,
        sessionToken: !!process.env.SESSION_TOKEN,
      },
      analysis: {
        usingExplicitCredentials: !!(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY),
        usingIAMRole: !(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY),
        s3ClientCreated: true,
        presignedUrlGenerated: true,
      }
    });
    
  } catch (error) {
    console.error("❌ Presigned upload test failed:", error);
    
    // Log detailed error information
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      console.error("❌ Error details:", {
        name: errorObj.name,
        message: errorObj.message,
        code: errorObj.code,
        $metadata: errorObj.$metadata,
      });
    }
    
    return NextResponse.json({
      success: false,
      message: "Presigned upload test failed",
      bucketName: BUCKET_NAME,
      region: REGION,
      error: {
        name: (error as any)?.name || "Unknown",
        message: (error as any)?.message || "Unknown error",
        code: (error as any)?.code || "Unknown",
        $metadata: (error as any)?.$metadata || "None",
      },
      environmentVariables: {
        accessKeyId: !!process.env.ACCESS_KEY_ID,
        secretAccessKey: !!process.env.SECRET_ACCESS_KEY,
        sessionToken: !!process.env.SESSION_TOKEN,
      },
      analysis: {
        usingExplicitCredentials: !!(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY),
        usingIAMRole: !(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY),
        s3ClientCreated: false,
        presignedUrlGenerated: false,
        recommendation: "Check AWS credentials and IAM permissions for S3:PutObject"
      }
    }, { status: 500 });
  }
}
