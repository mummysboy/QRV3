import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(req: Request) {
  try {
    const { type, id } = await req.json();
    
    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing required fields: type, id" },
        { status: 400 }
      );
    }

    const client = generateClient();
    let result;

    if (type === 'signup') {
      // Delete Signup model
      const deleteResult = await client.graphql({
        query: `
          mutation DeleteSignup($input: DeleteSignupInput!) {
            deleteSignup(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: id,
          },
        },
      });

      result = (deleteResult as { data: { deleteSignup: { 
        id: string; 
      } } }).data.deleteSignup;

    } else if (type === 'business') {
      // Delete Business model
      const deleteResult = await client.graphql({
        query: `
          mutation DeleteBusiness($input: DeleteBusinessInput!) {
            deleteBusiness(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: id,
          },
        },
      });

      result = (deleteResult as { data: { deleteBusiness: { 
        id: string; 
      } } }).data.deleteBusiness;
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'signup' or 'business'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`,
      data: result,
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting signup:", error);
    return NextResponse.json(
      { error: "Failed to delete signup" },
      { status: 500 }
    );
  }
} 