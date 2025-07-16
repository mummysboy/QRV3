import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(req: Request) {
  try {
    const { type, id, status } = await req.json();
    
    if (!type || !id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: type, id, status" },
        { status: 400 }
      );
    }

    const client = generateClient();
    let result;

    if (type === 'signup') {
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

      result = (updateResult as { data: { updateSignup: { 
        id: string; 
        status: string; 
        updatedAt: string; 
      } } }).data.updateSignup;

    } else if (type === 'business') {
      // Update Business model
      const updateData: {
        id: string;
        status: string;
        updatedAt: string;
        approvedAt?: string;
        approvedBy?: string;
      } = {
        id: id,
        status: status,
        updatedAt: new Date().toISOString(),
      };

      // If approving, add approval timestamp and admin info
      if (status === 'approved') {
        updateData.approvedAt = new Date().toISOString();
        updateData.approvedBy = 'admin'; // You can pass actual admin ID here
      }

      const updateResult = await client.graphql({
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

      result = (updateResult as { data: { updateBusiness: { 
        id: string; 
        status: string; 
        updatedAt: string; 
        approvedAt: string; 
        approvedBy: string; 
      } } }).data.updateBusiness;
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
    return NextResponse.json(
      { error: "Failed to update signup status" },
      { status: 500 }
    );
  }
} 