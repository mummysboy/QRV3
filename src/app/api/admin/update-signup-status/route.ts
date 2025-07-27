import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface UpdateStatusData {
  type: 'signup' | 'business';
  id: string;
  status: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, id, status }: UpdateStatusData = body;

    if (!type || !id || !status) {
      return NextResponse.json(
        { error: "Type, ID, and status are required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    if (type === 'signup') {
      console.log("Updating signup with ID:", id, "to status:", status);
      
      await client.graphql({
        query: `
          mutation UpdateSignup($input: UpdateSignupInput!) {
            updateSignup(input: $input) {
              id
              status
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            id: id,
            status: status,
            updatedAt: new Date().toISOString(),
          },
        },
      });

    } else if (type === 'business') {
      console.log("Updating business with ID:", id, "to status:", status);
      
      // Get business details first - fetch all required fields
      const businessResult = await client.graphql({
        query: `
          query GetBusiness($id: String!) {
            getBusiness(id: $id) {
              id
              name
              email
              phone
              status
              zipCode
              category
              address
              city
              state
              neighborhood
            }
          }
        `,
        variables: { id },
      });

      console.log("Business query result:", businessResult);

      const business = (businessResult as { data: { getBusiness: {
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        zipCode: string;
        category: string;
        address: string;
        city: string;
        state: string;
        neighborhood: string;
      } | null } }).data.getBusiness;
      
      console.log("Business data:", business);
      
      if (!business) {
        return NextResponse.json(
          { error: "Business not found" },
          { status: 404 }
        );
      }

      // Detect neighborhood if approving the business
      let neighborhood = business.neighborhood || '';
      if (status === 'approved') {
        try {
          console.log('🔧 Admin status update: Detecting neighborhood for approval...');
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
            console.log('🔧 Admin status update: Detected neighborhood:', neighborhood);
          } else {
            console.error('🔧 Admin status update: Failed to detect neighborhood');
          }
        } catch (error) {
          console.error('🔧 Admin status update: Error detecting neighborhood:', error);
        }
      }

      // Update Business model - include all required fields from the existing business
      const updateData: {
        id: string;
        name: string;
        phone: string;
        email: string;
        zipCode: string;
        category: string;
        status: string;
        address: string;
        city: string;
        state: string;
        neighborhood: string;
        updatedAt: string;
        approvedAt?: string;
        approvedBy?: string;
      } = {
        id: id,
        name: business.name,
        phone: business.phone,
        email: business.email,
        zipCode: business.zipCode,
        category: business.category,
        status: status,
        address: business.address,
        city: business.city,
        state: business.state,
        neighborhood: neighborhood, // Include detected neighborhood
        updatedAt: new Date().toISOString(),
      };

      // If approving, add approval timestamp and admin info
      if (status === 'approved') {
        updateData.approvedAt = new Date().toISOString();
        updateData.approvedBy = 'admin'; // You can pass actual admin ID here
      }

      console.log("Business update data:", updateData);

      try {
        await client.graphql({
          query: `
            mutation UpdateBusinessStatus($input: UpdateBusinessInput!) {
              updateBusiness(input: $input) {
                id
                status
                neighborhood
                updatedAt
                approvedAt
                approvedBy
              }
            }
          `,
          variables: {
            input: updateData,
          },
        });

        console.log("Business update successful");
      } catch (graphqlError) {
        console.error("GraphQL mutation error:", graphqlError);
        console.error("GraphQL error details:", {
          message: graphqlError instanceof Error ? graphqlError.message : "Unknown error",
          stack: graphqlError instanceof Error ? graphqlError.stack : undefined,
          error: graphqlError
        });
        throw graphqlError;
      }

      // Send approval email if business is approved
      if (status === 'approved') {
        let userEmail = '';
        try {
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
            variables: { businessId: business.id },
          });
          const users = (usersResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string }> } } }).data.listBusinessUsers.items;
          if (users && users.length > 0) {
            userEmail = users[0].email;
          }
        } catch (userErr) {
          console.error("Failed to fetch business users for approval email:", userErr);
        }
        if (userEmail) {
          try {
            await sendApprovalEmail({
              businessName: business.name,
              userEmail: userEmail,
              loginUrl: 'https://www.qrewards.net/business/login',
            });
          } catch (emailError) {
            console.error("Failed to send approval email:", emailError);
            // Don't fail the entire request if email fails
          }
        } else {
          console.warn("No business user found to send approval email.");
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${type} status updated successfully`,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}

async function sendApprovalEmail({
  businessName,
  userEmail,
  loginUrl,
}: {
  businessName: string;
  userEmail: string;
  loginUrl: string;
}) {
  // Email sending logic here
  console.log(`Sending approval email to ${userEmail} for business ${businessName} with login URL: ${loginUrl}`);
} 