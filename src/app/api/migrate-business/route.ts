import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting business migration...');
    
    const client = generateClient({ authMode: "apiKey" });
    
    // Business data to recreate (you can modify these values)
    const businessData = {
      id: "cffb81b1-6d57-425a-9770-fe48e0e1b7bc", // Keep the same ID
      name: "Nalu Health Bar", // From your session
      phone: "+1-555-0123", // You'll need to provide the real phone
      email: "isaac@rightimagedigital.com", // From your session
      zipCode: "96731", // From your session
      category: "Health & Wellness", // You can modify this
      status: "approved", // Set as approved
      logo: "", // Will be updated when you upload
      address: "131 Hekili St", // From your session
      city: "Kailua", // From your session
      state: "HI", // From your session
      neighborhood: "", // Will be detected automatically
      website: "", // Optional
      socialMedia: "", // Optional
      businessHours: "", // Optional
      description: "Health and wellness business", // You can modify this
      photos: "", // Optional
      primaryContactEmail: "isaac@rightimagedigital.com",
      primaryContactPhone: "+1-555-0123", // You'll need to provide the real phone
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: "migration-script",
    };
    
    // Business user data
    const userData = {
      id: "user-" + Date.now(), // Generate new user ID
      email: "isaac@rightimagedigital.com",
      password: "temporary-password-123", // Temporary password - you can change this later
      firstName: "Isaac", // You can modify this
      lastName: "Hirsch", // You can modify this
      role: "owner",
      status: "active",
      businessId: businessData.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('🔧 Creating business...');
    
    // Step 1: Create the business
    const businessResult = await client.graphql({
      query: `
        mutation CreateBusiness($input: CreateBusinessInput!) {
          createBusiness(input: $input) {
            id
            name
            status
            email
            neighborhood
          }
        }
      `,
      variables: {
        input: businessData,
      },
    });
    
    console.log('✅ Business created:', businessResult);
    
    // Step 2: Create the business user
    console.log('👤 Creating business user...');
    const userResult = await client.graphql({
      query: `
        mutation CreateBusinessUser($input: CreateBusinessUserInput!) {
          createBusinessUser(input: $input) {
            id
            email
            businessId
            status
          }
        }
      `,
      variables: {
        input: userData,
      },
    });
    
    console.log('✅ Business user created:', userResult);
    
    // Step 3: Detect neighborhood for the business
    console.log('🔍 Detecting neighborhood...');
    try {
      const detectRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/detect-neighborhood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessData.name,
          address: `${businessData.address}, ${businessData.city}, ${businessData.state} ${businessData.zipCode}`
        })
      });
      
      if (detectRes.ok) {
        const detectData = await detectRes.json();
        const neighborhood = detectData.neighborhood || '';
        console.log('🔍 Detected neighborhood:', neighborhood);
        
        // Update business with detected neighborhood
        if (neighborhood) {
          const updateResult = await client.graphql({
            query: `
              mutation UpdateBusiness($input: UpdateBusinessInput!) {
                updateBusiness(input: $input) {
                  id
                  name
                  neighborhood
                }
              }
            `,
            variables: {
              input: {
                id: businessData.id,
                neighborhood: neighborhood,
              },
            },
          });
          console.log('✅ Business updated with neighborhood:', updateResult);
        }
      }
    } catch (error) {
      console.error('⚠️ Neighborhood detection failed:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: "Business migration completed successfully!",
      business: (businessResult as any).data.createBusiness,
      user: (userResult as any).data.createBusinessUser,
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      { error: "Migration failed", details: error },
      { status: 500 }
    );
  }
}
