import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();
    
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token, and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Find the business user by email
    const userResult = await client.graphql({
      query: `
        query GetBusinessUserByEmail($email: String!) {
          listBusinessUsers(filter: { email: { eq: $email } }) {
            items {
              id
              email
              firstName
              lastName
              businessId
              status
            }
          }
        }
      `,
      variables: { email },
    });

    const users = (userResult as { data: { listBusinessUsers: { items: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      businessId: string;
      status: string;
    }> } } }).data.listBusinessUsers.items;

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 400 }
      );
    }

    // In a production environment, you would validate the token here
    // For now, we'll just check if the token exists (not secure for production)
    if (!token) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password
    const updateResult = await client.graphql({
      query: `
        mutation UpdateBusinessUserPassword($input: UpdateBusinessUserInput!) {
          updateBusinessUser(input: $input) {
            id
            email
            status
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          id: user.id,
          password: hashedPassword,
        },
      },
    });

    const updatedUser = (updateResult as { data: { updateBusinessUser: {
      id: string;
      email: string;
      status: string;
      updatedAt: string;
    } } }).data.updateBusinessUser;

    // In a production environment, you would invalidate the reset token here
    // by either deleting it from the database or marking it as used

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
      },
    });

  } catch (error) {
    console.error("Error in reset password:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting the password. Please try again." },
      { status: 500 }
    );
  }
} 