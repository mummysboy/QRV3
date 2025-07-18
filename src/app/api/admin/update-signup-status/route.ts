import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: "us-west-1",
  // Use default credential provider chain
});

export async function POST(req: Request) {
  try {
    const { type, id, status } = await req.json();
    
    console.log("Update signup status request:", { type, id, status });
    
    if (!type || !id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: type, id, status" },
        { status: 400 }
      );
    }

    const client = generateClient();
    let result;

    if (type === 'signup') {
      console.log("Updating signup with ID:", id, "to status:", status);
      
      // Update Signup model
      const updateResult = await client.graphql({
        query: `
          mutation UpdateSignupStatus($input: UpdateSignupInput!) {
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
          },
        },
      });

      console.log("Signup update result:", updateResult);

      result = (updateResult as { data: { updateSignup: { 
        id: string; 
        status: string; 
        updatedAt: string; 
      } } }).data.updateSignup;

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
      } | null } }).data.getBusiness;
      
      console.log("Business data:", business);
      
      if (!business) {
        return NextResponse.json(
          { error: "Business not found" },
          { status: 404 }
        );
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
        updatedAt: new Date().toISOString(),
      };

      // If approving, add approval timestamp and admin info
      if (status === 'approved') {
        updateData.approvedAt = new Date().toISOString();
        updateData.approvedBy = 'admin'; // You can pass actual admin ID here
      }

      console.log("Business update data:", updateData);

      let updateResult;
      try {
        updateResult = await client.graphql({
          query: `
            mutation UpdateBusinessStatus($input: UpdateBusinessInput!) {
              updateBusiness(input: $input) {
                id
                status
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

        console.log("Business update result:", updateResult);
      } catch (graphqlError) {
        console.error("GraphQL mutation error:", graphqlError);
        console.error("GraphQL error details:", {
          message: graphqlError instanceof Error ? graphqlError.message : "Unknown error",
          stack: graphqlError instanceof Error ? graphqlError.stack : undefined,
          error: graphqlError
        });
        throw graphqlError;
      }

      result = (updateResult as { data: { updateBusiness: { 
        id: string; 
        status: string; 
        updatedAt: string; 
        approvedAt: string; 
        approvedBy: string; 
      } } }).data.updateBusiness;

      // Send approval email if business is approved
      if (status === 'approved') {
        // Fetch business users separately
        let userEmail = null;
        try {
          const usersResult = await client.graphql({
            query: `
              query ListBusinessUsers($businessId: String!) {
                listBusinessUsers(filter: { businessId: { eq: $businessId } }) {
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
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'signup' or 'business'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${type} status updated successfully`,
      data: result,
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating signup status:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      } else if (error.message.includes("unauthorized") || error.message.includes("permission")) {
        return NextResponse.json(
          { error: "Unauthorized to perform this action" },
          { status: 403 }
        );
      } else if (error.message.includes("validation")) {
        return NextResponse.json(
          { error: "Invalid data provided" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to update signup status" },
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
  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL || "QRewards@qrewards.net",
    Destination: {
      ToAddresses: [userEmail],
    },
    Message: {
      Subject: {
        Data: "🎉 Your QRewards Business Account Has Been Approved!",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
                <div style="text-align: center;">
                  <img src="https://www.qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
                  <h1 style="color: #16a34a; margin-bottom: 8px; font-size: 28px;">Congratulations!</h1>
                  <p style="font-size: 18px; margin-bottom: 16px; color: #374151;">Your business account has been approved!</p>
                  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <h2 style="color: #166534; margin: 0 0 8px 0; font-size: 20px;">${businessName}</h2>
                    <p style="color: #166534; margin: 0; font-size: 16px;">You can now start creating and managing rewards for your customers!</p>
                  </div>
                </div>

                <div style="margin: 32px 0;">
                  <h3 style="color: #374151; margin-bottom: 16px; font-size: 18px;">Next Steps:</h3>
                  <ol style="color: #6b7280; line-height: 1.6; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Sign in to your business dashboard using your email and password</li>
                    <li style="margin-bottom: 8px;">Complete your business profile with additional details</li>
                    <li style="margin-bottom: 8px;">Create your first reward offer</li>
                    <li style="margin-bottom: 8px;">Generate QR codes for your customers to scan</li>
                  </ol>
                </div>

                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${loginUrl}" style="
                    background-color: #16a34a;
                    color: #ffffff;
                    padding: 16px 32px;
                    font-size: 16px;
                    border-radius: 8px;
                    text-decoration: none;
                    display: inline-block;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
                  ">Sign In to Dashboard</a>
                </div>

                <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 24px 0;">
                  <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px;">🔐 Login Information</h4>
                  <p style="color: #92400e; margin: 0 0 4px 0; font-size: 14px;"><strong>Email:</strong> ${userEmail}</p>
                  <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>Password:</strong> Use the password you created during signup</p>
                  <p style="color: #92400e; margin: 8px 0 0 0; font-size: 14px;">If you forgot your password, you can reset it from the login page.</p>
                </div>

                <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

                <div style="text-align: center;">
                  <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
                    Need help getting started? Check out our 
                    <a href="https://www.qrewards.net/help" style="color: #16a34a; text-decoration: none;">help center</a> 
                    or contact our support team.
                  </p>
                  <p style="font-size: 12px; color: #9ca3af;">
                    You received this email because your business account was approved on QRewards.<br/>
                    If you have any questions, please contact our support team.
                  </p>
                </div>
              </div>
            </div>
          `,
          Charset: "UTF-8",
        },
      },
    },
  });

  await sesClient.send(command);
} 