import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json();
    
    if (!businessId) {
      return NextResponse.json({ error: "Business ID is required" }, { status: 400 });
    }

    console.log("🧪 Testing table deletion for business:", businessId);

    const client = generateClient({ authMode: "apiKey" });

    // Step 1: Check what BusinessUser records exist before deletion
    console.log("🔍 Step 1: Checking existing BusinessUser records...");
    const beforeUsersResult = await client.graphql({
      query: `
        query GetBusinessUsersBefore($businessId: String!) {
          listBusinessUsers(filter: {
            businessId: { eq: $businessId }
          }) {
            items {
              id
              email
              firstName
              lastName
              businessId
              role
              status
            }
          }
        }
      `,
      variables: {
        businessId: businessId,
      },
    });

    const beforeUsers = (beforeUsersResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string; businessId: string; role: string; status: string }> } } }).data.listBusinessUsers.items;
    
    console.log(`📋 Found ${beforeUsers.length} BusinessUser records before deletion:`, beforeUsers);

    // Step 2: Delete one user as a test
    if (beforeUsers.length > 0) {
      const testUser = beforeUsers[0];
      console.log(`🗑️ Step 2: Testing deletion of user: ${testUser.email} (${testUser.id})`);
      
      try {
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
            id: testUser.id,
          },
        });
        
        console.log("✅ Delete result:", JSON.stringify(deleteResult, null, 2));
        
        // Step 3: Check if the user was actually deleted
        console.log("🔍 Step 3: Verifying deletion...");
        const afterUsersResult = await client.graphql({
          query: `
            query GetBusinessUsersAfter($businessId: String!) {
              listBusinessUsers(filter: {
                businessId: { eq: $businessId }
              }) {
                items {
                  id
                  email
                  firstName
                  lastName
                  businessId
                  role
                  status
                }
              }
            }
          `,
          variables: {
            businessId: businessId,
          },
        });

        const afterUsers = (afterUsersResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string; businessId: string; role: string; status: string }> } } }).data.listBusinessUsers.items;
        
        console.log(`📋 Found ${afterUsers.length} BusinessUser records after deletion:`, afterUsers);
        
        // Step 4: Try to get the specific deleted user
        try {
          const verifyResult = await client.graphql({
            query: `
              query VerifyUserDeleted($id: ID!) {
                getBusinessUser(id: $id) {
                  id
                  email
                }
              }
            `,
            variables: {
              id: testUser.id,
            },
          });
          console.log("❌ User still exists after deletion:", JSON.stringify(verifyResult, null, 2));
        } catch (verifyError) {
          console.log("✅ User successfully deleted (not found in verification):", verifyError instanceof Error ? verifyError.message : "Unknown error");
        }
        
        return NextResponse.json({
          success: true,
          businessId: businessId,
          beforeCount: beforeUsers.length,
          afterCount: afterUsers.length,
          deletedUser: testUser,
          beforeUsers: beforeUsers,
          afterUsers: afterUsers,
          deleteResult: deleteResult
        });
        
      } catch (deleteError) {
        console.error("❌ Deletion failed:", deleteError);
        return NextResponse.json({
          success: false,
          error: "Deletion failed",
          details: deleteError instanceof Error ? deleteError.message : "Unknown error",
          businessId: businessId,
          beforeCount: beforeUsers.length,
          beforeUsers: beforeUsers
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: true,
        message: "No users found to delete",
        businessId: businessId,
        beforeCount: 0
      });
    }

  } catch (error) {
    console.error("❌ Test error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 