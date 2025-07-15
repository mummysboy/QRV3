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

    // Update business status to approved
    const result = await client.graphql({
      query: `
        mutation UpdateBusiness($input: UpdateBusinessInput!) {
          updateBusiness(input: $input) {
            id
            name
            status
            approvedAt
            approvedBy
          }
        }
      `,
      variables: {
        input: {
          id: businessId,
          status: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: "admin", // TODO: Get actual admin user ID
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
    } } }).data.updateBusiness;

    // TODO: Send approval email to business owner
    // TODO: Send notification to business owner

    return NextResponse.json(
      { 
        success: true, 
        message: "Business approved successfully",
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