import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface ApproveBusinessData {
  businessId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId }: ApproveBusinessData = body;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // First, get the business details to detect neighborhood
    const businessResult = await client.graphql({
      query: `
        query GetBusiness($id: String!) {
          getBusiness(id: $id) {
            id
            name
            address
            city
            state
            zipCode
            status
          }
        }
      `,
      variables: { id: businessId },
    });

    const business = (businessResult as { data: { getBusiness?: { 
      id: string; 
      name: string; 
      address: string; 
      city: string; 
      state: string; 
      zipCode: string; 
      status: string; 
    } } }).data.getBusiness;

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Detect neighborhood using AI
    let neighborhood = '';
    try {
      const detectRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3005'}/api/detect-neighborhood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: business.name,
          address: `${business.address}, ${business.city}, ${business.state} ${business.zipCode}`
        })
      });
      if (detectRes.ok) {
        const detectData = await detectRes.json();
        neighborhood = detectData.neighborhood || '';
        console.log('Detected neighborhood for business approval:', neighborhood);
      }
    } catch (err) {
      console.error('Neighborhood detection failed during approval:', err);
    }

    // Update business status to approved and add neighborhood
    const result = await client.graphql({
      query: `
        mutation UpdateBusiness($input: UpdateBusinessInput!) {
          updateBusiness(input: $input) {
            id
            name
            status
            approvedAt
            approvedBy
            neighborhood
          }
        }
      `,
      variables: {
        input: {
          id: businessId,
          status: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: "admin", // TODO: Get actual admin user ID
          neighborhood, // AI-detected neighborhood
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const updatedBusiness = (result as { data: { updateBusiness: { 
      id: string; 
      name: string; 
      status: string; 
      approvedAt: string; 
      approvedBy: string; 
      neighborhood: string;
    } } }).data.updateBusiness;

    // TODO: Send approval email to business owner
    // TODO: Send notification to business owner

    return NextResponse.json(
      { 
        success: true, 
        message: "Business approved successfully with neighborhood detection",
        business: updatedBusiness
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving business:", error);
    return NextResponse.json(
      { error: "Failed to approve business" },
      { status: 500 }
    );
  }
} 