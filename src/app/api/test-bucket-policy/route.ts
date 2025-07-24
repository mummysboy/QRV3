import { NextResponse } from "next/server";
import { S3Client, GetBucketPolicyCommand, GetBucketAclCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-west-1",
});

const BUCKET_NAME = "qrewards-media6367c-dev";

export async function GET() {
  try {
    console.log("🔍 Testing bucket policy and ACL...");
    
    const results: {
      bucketName: string;
      region: string;
      hasPolicy: boolean;
      hasACL: boolean;
      policyDetails: string | null;
      aclDetails: { owner: unknown; grants: unknown } | null;
      error: string | null;
    } = {
      bucketName: BUCKET_NAME,
      region: "us-west-1",
      hasPolicy: false,
      hasACL: false,
      policyDetails: null,
      aclDetails: null,
      error: null
    };

    // Test 1: Check bucket policy
    try {
      const policyCommand = new GetBucketPolicyCommand({ Bucket: BUCKET_NAME });
      const policyResponse = await s3Client.send(policyCommand);
      results.hasPolicy = true;
      results.policyDetails = policyResponse.Policy || null;
      console.log("✅ Bucket has policy");
    } catch (error) {
      if (error instanceof Error && error.name === 'NoSuchBucketPolicy') {
        console.log("ℹ️ No bucket policy (this is normal)");
      } else {
        console.error("❌ Error checking bucket policy:", error);
        results.error = error instanceof Error ? error.message : "Unknown error";
      }
    }

    // Test 2: Check bucket ACL
    try {
      const aclCommand = new GetBucketAclCommand({ Bucket: BUCKET_NAME });
      const aclResponse = await s3Client.send(aclCommand);
      results.hasACL = true;
      results.aclDetails = {
        owner: aclResponse.Owner,
        grants: aclResponse.Grants
      };
      console.log("✅ Bucket has ACL");
    } catch (error) {
      console.error("❌ Error checking bucket ACL:", error);
      if (!results.error) {
        results.error = error instanceof Error ? error.message : "Unknown error";
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      recommendations: results.error ? [
        "Check if bucket exists and is accessible",
        "Verify IAM role has s3:GetBucketPolicy and s3:GetBucketAcl permissions",
        "Check if bucket has restrictive policies"
      ] : [
        "Bucket appears to be accessible",
        "If uploads still fail, check IAM role permissions"
      ]
    });
  } catch (error) {
    console.error("❌ Bucket policy test error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        bucketName: BUCKET_NAME
      },
      { status: 500 }
    );
  }
} 