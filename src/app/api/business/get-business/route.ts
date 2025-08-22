import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  category: string;
  status: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  neighborhood: string;
  website: string;
  socialMedia: string;
  businessHours: string;
  description: string;
  photos: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching business with ID: ${businessId}`);
    
    let client;
    try {
      client = generateClient({ authMode: "apiKey" });
      console.log("✅ GraphQL client created successfully");
      
      // Test client configuration
      console.log("🔧 Client config:", {
        authMode: "apiKey",
        endpoint: "configured"
      });
      
    } catch (clientError) {
      console.error("❌ Failed to create GraphQL client:", clientError);
      throw new Error(`GraphQL client initialization failed: ${clientError instanceof Error ? clientError.message : 'Unknown error'}`);
    }

    // First, try a minimal query to test basic connectivity
    try {
      console.log("🧪 Testing minimal GraphQL query...");
      const testResult = await client.graphql({
        query: `
          query TestBusiness($id: String!) {
            getBusiness(id: $id) {
              id
              name
            }
          }
        `,
        variables: {
          id: businessId,
        },
      });
      console.log("✅ Minimal query successful:", JSON.stringify(testResult, null, 2));
    } catch (testError) {
      console.error("❌ Minimal query failed:", testError);
      throw testError;
    }

    // Test query with logo field specifically
    try {
      console.log("🧪 Testing query with logo field...");
      const logoTestResult = await client.graphql({
        query: `
          query TestBusinessLogo($id: String!) {
            getBusiness(id: $id) {
              id
              name
              logo
            }
          }
        `,
        variables: {
          id: businessId,
        },
      });
      console.log("✅ Logo query successful:", JSON.stringify(logoTestResult, null, 2));
    } catch (logoTestError) {
      console.error("❌ Logo query failed:", logoTestError);
      throw logoTestError;
    }

    // Get business information
    const businessResult = await client.graphql({
      query: `
        query GetBusiness($id: String!) {
          getBusiness(id: $id) {
            id
            name
            phone
            email
            zipCode
            category
            status
            logo
            address
            city
            state
            neighborhood
            website
            socialMedia
            businessHours
            description
            photos
            primaryContactEmail
            primaryContactPhone
            createdAt
            updatedAt
            approvedAt
          }
        }
      `,
      variables: {
        id: businessId,
      },
    });

    console.log(`✅ GraphQL response received:`, JSON.stringify(businessResult, null, 2));

    const business = (businessResult as { data: { getBusiness: Business | null } }).data.getBusiness;

    if (!business) {
      console.log(`❌ Business not found for ID: ${businessId}`);
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    console.log(`✅ Business data retrieved successfully:`, {
      id: business.id,
      name: business.name,
      logo: business.logo,
      hasLogo: !!business.logo
    });

    return NextResponse.json({
      success: true,
      business: business,
    });
  } catch (error) {
    console.error("❌ Error fetching business:", error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
    }
    
    // Check if it's a GraphQL error
    if (error && typeof error === 'object' && 'errors' in error) {
      console.error("❌ GraphQL errors:", JSON.stringify(error.errors, null, 2));
    }
    
    return NextResponse.json(
      { error: "Failed to fetch business information", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 