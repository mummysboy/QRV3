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
    const { businessId, testEmail } = await req.json();
    
    console.log("🧪 Testing approval email for business:", businessId);
    console.log("🧪 Test email address:", testEmail);

    const client = generateClient();

    // Get business details
    const businessResult = await client.graphql({
      query: `
        query GetBusiness($id: ID!) {
          getBusiness(id: $id) {
            id
            name
            email
            phone
            status
            businessUsers {
              items {
                id
                email
                firstName
                lastName
              }
            }
          }
        }
      `,
      variables: { id: businessId },
    });

    const business = (businessResult as { data: { getBusiness: {
      id: string;
      name: string;
      email: string;
      phone: string;
      status: string;
      businessUsers?: {
        items: Array<{
          id: string;
          email: string;
          firstName: string;
          lastName: string;
        }>;
      };
    } | null } }).data.getBusiness;

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    console.log("🏢 Business found:", {
      id: business.id,
      name: business.name,
      status: business.status,
      userCount: business.businessUsers?.items?.length || 0
    });

    if (!business.businessUsers?.items || business.businessUsers.items.length === 0) {
      return NextResponse.json(
        { error: "No business users found for this business" },
        { status: 404 }
      );
    }

    const primaryUser = business.businessUsers.items[0];
    const targetEmail = testEmail || primaryUser.email;

    console.log("👤 Sending approval email to:", targetEmail);

    // Send the approval email
    try {
      await sendApprovalEmail({
        businessName: business.name,
        userEmail: targetEmail,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.qrewards.net'}/business/login`,
      });

      console.log("✅ Approval email sent successfully");

      return NextResponse.json({
        success: true,
        message: "Approval email sent successfully",
        data: {
          businessName: business.name,
          sentTo: targetEmail,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.qrewards.net'}/business/login`,
        }
      });

    } catch (emailError) {
      console.error("❌ Failed to send approval email:", emailError);
      return NextResponse.json(
        { error: "Failed to send approval email", details: emailError instanceof Error ? emailError.message : "Unknown error" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("❌ Error in test approval email:", error);
    return NextResponse.json(
      { error: "An error occurred while testing approval email" },
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