import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface RejectBusinessData {
  businessId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId }: RejectBusinessData = body;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Update business status to rejected
    const result = await client.graphql({
      query: `
        mutation UpdateBusiness($input: UpdateBusinessInput!) {
          updateBusiness(input: $input) {
            id
            name
            status
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          id: businessId,
          status: "rejected",
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const updatedBusiness = (result as { data: { updateBusiness: { 
      id: string; 
      name: string; 
      status: string; 
      updatedAt: string; 
    } } }).data.updateBusiness;

    // TODO: Send rejection email to business owner
    // TODO: Send notification to business owner

    return NextResponse.json(
      { 
        success: true, 
        message: "Business rejected successfully",
        business: updatedBusiness
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting business:", error);
    return NextResponse.json(
      { error: "Failed to reject business" },
      { status: 500 }
    );
  }
} 