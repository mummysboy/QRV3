import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import { sendStatusChangeEmail } from "../../../../lib/email-notifications";

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

    // Send rejection email to business owner
    try {
      // Get business users to find the primary contact
      const usersResult = await client.graphql({
        query: `
          query GetBusinessUsers($businessId: String!) {
            listBusinessUsers(filter: {
              businessId: { eq: $businessId }
            }) {
              items {
                id
                email
                firstName
                lastName
              }
            }
          }
        `,
        variables: { businessId },
      });
      
      const users = (usersResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string }> } } }).data.listBusinessUsers.items;
      
      if (users && users.length > 0) {
        const primaryUser = users[0];
        
        await sendStatusChangeEmail({
          userEmail: primaryUser.email,
          businessName: updatedBusiness.name,
          userName: `${primaryUser.firstName} ${primaryUser.lastName}`,
          status: 'rejected',
          reason: 'Your business application did not meet our current approval criteria. Please review your information and consider resubmitting with additional details or documentation.',
        });
      }
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
      // Don't fail the entire request if email fails
    }

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