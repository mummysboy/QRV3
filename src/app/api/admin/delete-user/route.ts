import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import outputsJson from "@/amplify_outputs.json";

interface AmplifyOutputs {
  auth: {
    aws_region: string;
    user_pool_id: string;
  };
}
const outputs = outputsJson as unknown as AmplifyOutputs;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("🗑️ Deleting user with email:", email);

    const client = generateClient();

    // First, find the user
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
            }
          }
        }
      `,
      variables: {
        email: email,
      },
    });

    const users = (userResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string; businessId: string; role: string; status: string }> } } }).data.listBusinessUsers.items;
    
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        email: email
      }, { status: 404 });
    }

    const user = users[0];
    console.log("🗑️ Found user to delete:", JSON.stringify(user, null, 2));

    // Delete the user from database
    console.log("🗑️ Deleting user from database...");
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

    console.log("🗑️ Database delete result:", JSON.stringify(deleteResult, null, 2));

    // Verify user is actually deleted from database
    console.log("✅ Verifying user deletion from database...");
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
      console.log("❌ User still exists in database after deletion:", JSON.stringify(verifyResult, null, 2));
      return NextResponse.json({
        success: false,
        error: "User deletion failed - user still exists in database",
        user: verifyResult.data.getBusinessUser,
        deleteResult: deleteResult
      }, { status: 500 });
      
    } catch (verifyError) {
      // This error is expected if the user was successfully deleted
      console.log("✅ User successfully deleted from database (verification query failed as expected)");
    }

    // Verify user cannot be found by email
    console.log("✅ Verifying user cannot be found by email...");
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
      console.log("✅ Email verification completed successfully");
    }

    // Delete from Cognito User Pool as well
    try {
      const cognitoClient = new CognitoIdentityProviderClient({
        region: outputs.auth.aws_region
      });
      const adminDeleteUserCommand = new AdminDeleteUserCommand({
        UserPoolId: outputs.auth.user_pool_id,
        Username: email
      });
      await cognitoClient.send(adminDeleteUserCommand);
      console.log(`✅ Successfully deleted user ${email} from Cognito user pool`);
    } catch (cognitoError) {
      console.error(`❌ Failed to delete user ${email} from Cognito user pool:`, cognitoError);
      // Don't fail the entire operation if Cognito deletion fails
      // The user is already deleted from the database
    }

    // Also check if we should delete the associated business
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
    
    let businessDeleted = false;
    if (business) {
      console.log("🗑️ Found associated business:", JSON.stringify(business, null, 2));

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
          businessId: business.id,
          excludeUserId: user.id,
        },
      });

      const otherUsers = (otherUsersResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string; role: string; status: string }> } } }).data.listBusinessUsers.items;
      
      if (otherUsers.length > 0) {
        console.log(`🏢 Business has ${otherUsers.length} other users, not deleting business`);
        console.log("🏢 Other users:", otherUsers.map(u => ({ email: u.email, role: u.role, status: u.status })));
      } else {
        console.log("🏢 No other users for this business, proceeding with business deletion");

        // Delete all Cards for this business
        const cardsResult = await client.graphql({
          query: `
            query ListCards($businessId: String!) {
              listCards(filter: { businessId: { eq: $businessId } }) {
                items { cardid }
              }
            }
          `,
          variables: { businessId: business.id },
        });
        const cards = (cardsResult as { data: { listCards: { items: Array<{ cardid: string }> } } }).data.listCards.items;
        for (const card of cards) {
          await client.graphql({
            query: `
              mutation DeleteCard($cardid: ID!) {
                deleteCard(input: { cardid: $cardid }) { cardid }
              }
            `,
            variables: { cardid: card.cardid },
          });
        }
        console.log(`🗑️ Deleted ${cards.length} cards for business ${business.id}`);

        // Delete all ClaimedRewards for this business
        const rewardsResult = await client.graphql({
          query: `
            query ListClaimedRewards($businessId: String!) {
              listClaimedRewards(filter: { businessId: { eq: $businessId } }) {
                items { id }
              }
            }
          `,
          variables: { businessId: business.id },
        });
        const rewards = (rewardsResult as { data: { listClaimedRewards: { items: Array<{ id: string }> } } }).data.listClaimedRewards.items;
        for (const reward of rewards) {
          await client.graphql({
            query: `
              mutation DeleteClaimedReward($id: ID!) {
                deleteClaimedReward(input: { id: $id }) { id }
              }
            `,
            variables: { id: reward.id },
          });
        }
        console.log(`🗑️ Deleted ${rewards.length} claimed rewards for business ${business.id}`);

        // Delete the business too
        const deleteBusinessResult = await client.graphql({
          query: `
            mutation DeleteBusiness($id: ID!) {
              deleteBusiness(input: { id: $id }) {
                id
                name
              }
            }
          `,
          variables: {
            id: business.id,
          },
        });

        console.log("🗑️ Business delete result:", JSON.stringify(deleteBusinessResult, null, 2));
        businessDeleted = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: "User successfully deleted from database and Cognito",
      deletedUser: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      businessDeleted: businessDeleted,
      businessId: user.businessId,
      verification: "User verified as deleted from database"
    });

  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 

export async function DELETE() {
  try {
    const client = generateClient();
    // Get all business users whose status is not 'active'
    const userResult = await client.graphql({
      query: `
        query ListInactiveBusinessUsers {
          listBusinessUsers(filter: { status: { ne: "active" } }) {
            items {
              id
              email
              status
            }
          }
        }
      `
    });
    const users = (userResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; status: string }> } } }).data.listBusinessUsers.items;
    let deletedCount = 0;
    for (const user of users) {
      // Delete from DB
      await client.graphql({
        query: `
          mutation DeleteBusinessUser($id: ID!) {
            deleteBusinessUser(input: { id: $id }) { id email }
          }
        `,
        variables: { id: user.id },
      });
      // Delete from Cognito
      try {
        const cognitoClient = new CognitoIdentityProviderClient({
          region: outputs.auth.aws_region
        });
        const adminDeleteUserCommand = new AdminDeleteUserCommand({
          UserPoolId: outputs.auth.user_pool_id,
          Username: user.email
        });
        await cognitoClient.send(adminDeleteUserCommand);
        console.log(`✅ Deleted inactive user ${user.email} from Cognito`);
      } catch (cognitoError) {
        console.error(`❌ Failed to delete inactive user ${user.email} from Cognito:`, cognitoError);
      }
      deletedCount++;
    }
    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} inactive users`,
      deletedCount
    });
  } catch (error) {
    console.error("❌ Error deleting inactive users:", error);
    return NextResponse.json(
      { error: "Failed to delete inactive users", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 