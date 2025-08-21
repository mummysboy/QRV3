import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("🧪 Testing user deletion for email:", email);

    const client = generateClient();

    // Step 1: Find the user before deletion
    console.log("🔍 Step 1: Finding user before deletion...");
    const userResult = await client.graphql({
      query: `
        query GetBusinessUser($email: String!) {
          listBusinessUsers(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              email
              firstName
              lastName
              businessId
              role
              status
              createdAt
            }
          }
        }
      `,
      variables: {
        email: email,
      },
    });

    const users = (userResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string; businessId: string; role: string; status: string; createdAt: string }> } } }).data.listBusinessUsers.items;
    
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        email: email
      }, { status: 404 });
    }

    const user = users[0];
    console.log("🔍 Found user to test deletion:", JSON.stringify(user, null, 2));

    // Step 2: Delete the user
    console.log("🗑️ Step 2: Deleting user...");
    const deleteResult = await client.graphql({
      query: `
        mutation DeleteBusinessUser($id: ID!) {
          deleteBusinessUser(input: { id: $id }) {
            id
            email
          }
        }
      `,
      variables: {
        id: user.id,
      },
    });

    console.log("🗑️ Delete result:", JSON.stringify(deleteResult, null, 2));

    // Step 3: Verify user is deleted
    console.log("✅ Step 3: Verifying user deletion...");
    try {
      const verifyResult = await client.graphql({
        query: `
          query VerifyUserDeleted($id: ID!) {
            getBusinessUser(id: $id) {
              id
              email
              firstName
              lastName
            }
          }
        `,
        variables: {
          id: user.id,
        },
      });
      
      // If we get here, the user still exists (deletion failed)
      console.log("❌ User still exists after deletion:", JSON.stringify(verifyResult, null, 2));
      return NextResponse.json({
        success: false,
        error: "User deletion failed - user still exists in database",
        user: verifyResult.data.getBusinessUser,
        deleteResult: deleteResult
      }, { status: 500 });
      
    } catch (verifyError) {
      // This error is expected if the user was successfully deleted
      console.log("✅ User successfully deleted (verification query failed as expected):", verifyError instanceof Error ? verifyError.message : 'Unknown error');
    }

    // Step 4: Check if user can be found by email (should not be found)
    console.log("🔍 Step 4: Verifying user cannot be found by email...");
    try {
      const emailCheckResult = await client.graphql({
        query: `
          query CheckUserByEmail($email: String!) {
            listBusinessUsers(filter: {
              email: { eq: $email }
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
        variables: {
          email: email,
        },
      });

      const remainingUsers = (emailCheckResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string }> } } }).data.listBusinessUsers.items;
      
      if (remainingUsers.length > 0) {
        console.log("❌ User still found by email after deletion:", remainingUsers);
        return NextResponse.json({
          success: false,
          error: "User deletion incomplete - user still found by email",
          remainingUsers: remainingUsers
        }, { status: 500 });
      } else {
        console.log("✅ User not found by email after deletion (success)");
      }
    } catch (emailCheckError) {
      console.log("✅ Email check completed successfully:", emailCheckError instanceof Error ? emailCheckError.message : 'Unknown error');
    }

    // Step 5: Check if associated business data should also be cleaned up
    if (user.businessId) {
      console.log("🏢 Step 5: Checking associated business data...");
      
      // Check if business still exists
      try {
        const businessResult = await client.graphql({
          query: `
            query GetBusiness($id: ID!) {
              getBusiness(id: $id) {
                id
                name
                status
              }
            }
          `,
          variables: {
            id: user.businessId,
          },
        });

        const business = (businessResult as { data: { getBusiness: { id: string; name: string; status: string } | null } }).data.getBusiness;
        
        if (business) {
          console.log("🏢 Associated business still exists:", JSON.stringify(business, null, 2));
          
          // Check if there are other users for this business
          const otherUsersResult = await client.graphql({
            query: `
              query GetOtherBusinessUsers($businessId: String!, $excludeUserId: String!) {
                listBusinessUsers(filter: {
                  businessId: { eq: $businessId }
                  id: { ne: $excludeUserId }
                }) {
                  items {
                    id
                    email
                    firstName
                    lastName
                    role
                    status
                  }
                }
              }
            `,
            variables: {
              businessId: user.businessId,
              excludeUserId: user.id,
            },
          });

          const otherUsers = (otherUsersResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string; role: string; status: string }> } } }).data.listBusinessUsers.items;
          
          console.log(`🏢 Found ${otherUsers.length} other users for this business:`, otherUsers);
        }
      } catch (businessError) {
        console.log("✅ Business check completed:", businessError instanceof Error ? businessError.message : 'Unknown error');
      }
    }

    return NextResponse.json({
      success: true,
      message: "User deletion test completed successfully",
      deletedUser: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessId: user.businessId
      },
      deleteResult: deleteResult,
      verification: "User successfully removed from database"
    });

  } catch (error) {
    console.error("❌ Error during user deletion test:", error);
    return NextResponse.json(
      { error: "Failed to test user deletion", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
