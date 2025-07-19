import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, firstName, lastName } = body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Check if admin user already exists
    const existingAdminResult = await client.graphql({
      query: `
        query CheckExistingAdmin($username: String!, $email: String!) {
          listAdminUsers(filter: {
            or: [
              { username: { eq: $username } },
              { email: { eq: $email } }
            ]
          }) {
            items {
              id
              username
              email
            }
          }
        }
      `,
      variables: {
        username,
        email,
      },
    });

    const existingAdmins = (existingAdminResult as { data: { listAdminUsers: { items: Array<{ 
      id: string; 
      username: string; 
      email: string; 
    }> } } }).data.listAdminUsers.items;

    if (existingAdmins.length > 0) {
      const existingUsername = existingAdmins.find(admin => admin.username === username);
      const existingEmail = existingAdmins.find(admin => admin.email === email);
      
      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }
      
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const createResult = await client.graphql({
      query: `
        mutation CreateAdminUser($input: CreateAdminUserInput!) {
          createAdminUser(input: $input) {
            id
            username
            email
            firstName
            lastName
            role
            status
            createdAt
          }
        }
      `,
      variables: {
        input: {
          id: uuidv4(),
          username,
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: "admin",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const newAdmin = (createResult as { data: { createAdminUser: { 
      id: string; 
      username: string; 
      email: string;
      firstName: string;
      lastName: string;
      role: string; 
      status: string; 
      createdAt: string; 
    } } }).data.createAdminUser;

    console.log("✅ Admin user created:", { 
      id: newAdmin.id, 
      username: newAdmin.username, 
      email: newAdmin.email 
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        role: newAdmin.role,
        status: newAdmin.status,
      }
    });
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 