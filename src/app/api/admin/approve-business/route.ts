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

    const client = generateClient({ authMode: "apiKey" });

    // First, get the business details to detect neighborhood
    const businessResult = await client.graphql({
              query: `
          query GetBusiness($id: ID!) {
            getBusiness(id: $id) {
              id
              name
              address
              city
              state
              zipCode
              status
              neighborhood
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
      neighborhood: string; 
    } } }).data.getBusiness;

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Always detect neighborhood using AI (in case it wasn't detected during signup)
    let neighborhood = business.neighborhood || '';
    try {
      console.log('🔧 Admin approval: Detecting neighborhood...');
      const detectRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/detect-neighborhood`, {
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
        console.log('🔧 Admin approval: Detected neighborhood:', neighborhood);
      } else {
        console.error('🔧 Admin approval: Failed to detect neighborhood');
      }
    } catch (error) {
      console.error('🔧 Admin approval: Error detecting neighborhood:', error);
    }

    // Update business status to approved and include neighborhood
    const updateResult = await client.graphql({
      query: `
        mutation UpdateBusiness($input: UpdateBusinessInput!) {
          updateBusiness(input: $input) {
            id
            name
            status
            neighborhood
            updatedAt
            approvedAt
            approvedBy
          }
        }
      `,
      variables: {
        input: {
          id: businessId,
          status: "approved",
          neighborhood: neighborhood, // Always update neighborhood
          updatedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          approvedBy: "admin",
        },
      },
    });

    const updatedBusiness = (updateResult as { data: { updateBusiness: { 
      id: string; 
      name: string; 
      status: string; 
      neighborhood: string; 
      updatedAt: string; 
      approvedAt: string; 
      approvedBy: string; 
    } } }).data.updateBusiness;

    console.log('🔧 Admin approval: Successfully approved business:', {
      id: updatedBusiness.id,
      name: updatedBusiness.name,
      neighborhood: updatedBusiness.neighborhood,
      status: updatedBusiness.status
    });

    return NextResponse.json({
      success: true,
      message: "Business approved successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error('🔧 Admin approval: Error approving business:', error);
    return NextResponse.json(
      { error: "Failed to approve business" },
      { status: 500 }
    );
  }
} 