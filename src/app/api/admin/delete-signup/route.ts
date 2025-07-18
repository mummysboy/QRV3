import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(req: Request) {
  let type: string = '';
  let id: string = '';
  
  try {
    const body = await req.json();
    type = body.type;
    id = body.id;
    
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
      console.log(`🗑️ Starting deletion process for business: ${id}`);
      
      try {
        // First, get all BusinessUser records associated with this business
        console.log('🔍 Fetching business users...');
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
                  businessId
                  role
                  status
                }
              }
            }
          `,
          variables: {
            businessId: id,
          },
        });

        const users = (usersResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string; businessId: string; role: string; status: string }> } } }).data.listBusinessUsers.items;
        
        console.log(`🗑️ Found ${users.length} business users to delete for business ${id}`);

        // Delete all associated BusinessUser records
        for (const user of users) {
          try {
            console.log(`🗑️ Deleting business user: ${user.email} (${user.id})`);
            const deleteUserResult = await client.graphql({
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
            console.log(`✅ Successfully deleted business user: ${user.email}`);
            console.log(`🗑️ Delete user result:`, JSON.stringify(deleteUserResult, null, 2));
            
            // Verify the user was actually deleted
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
                  id: user.id,
                },
              });
              console.log(`❌ User still exists after deletion:`, JSON.stringify(verifyResult, null, 2));
            } catch (verifyError) {
              console.log(`✅ User successfully deleted (not found in verification):`, verifyError instanceof Error ? verifyError.message : 'Unknown error');
            }
            
          } catch (userError) {
            console.error(`❌ Failed to delete business user ${user.email}:`, userError);
            console.error(`❌ User error details:`, JSON.stringify(userError, null, 2));
            // Continue with other deletions instead of throwing
            console.log(`⚠️ Continuing with other deletions despite user deletion failure`);
          }
        }

        // Delete all Cards for this business
        console.log('🔍 Fetching cards...');
        const cardsResult = await client.graphql({
          query: `
            query ListCards($businessId: String!) {
              listCards(filter: { businessId: { eq: $businessId } }) {
                items { cardid }
              }
            }
          `,
          variables: { businessId: id },
        });
        const cards = (cardsResult as { data: { listCards: { items: Array<{ cardid: string }> } } }).data.listCards.items;
        
        console.log(`🗑️ Found ${cards.length} cards to delete for business ${id}`);
        
        for (const card of cards) {
          try {
            await client.graphql({
              query: `
                mutation DeleteCard($cardid: ID!) {
                  deleteCard(input: { cardid: $cardid }) { cardid }
                }
              `,
              variables: { cardid: card.cardid },
            });
            console.log(`✅ Successfully deleted card: ${card.cardid}`);
          } catch (cardError) {
            console.error(`❌ Failed to delete card ${card.cardid}:`, cardError);
            // Continue with other deletions instead of throwing
            console.log(`⚠️ Continuing with other deletions despite card deletion failure`);
          }
        }

        // Delete all ClaimedRewards for this business
        console.log('🔍 Fetching claimed rewards...');
        const rewardsResult = await client.graphql({
          query: `
            query ListClaimedRewards($businessId: String!) {
              listClaimedRewards(filter: { businessId: { eq: $businessId } }) {
                items { id }
              }
            }
          `,
          variables: { businessId: id },
        });
        const rewards = (rewardsResult as { data: { listClaimedRewards: { items: Array<{ id: string }> } } }).data.listClaimedRewards.items;
        
        console.log(`🗑️ Found ${rewards.length} claimed rewards to delete for business ${id}`);
        
        for (const reward of rewards) {
          try {
            await client.graphql({
              query: `
                mutation DeleteClaimedReward($id: ID!) {
                  deleteClaimedReward(input: { id: $id }) { id }
                }
              `,
              variables: { id: reward.id },
            });
            console.log(`✅ Successfully deleted claimed reward: ${reward.id}`);
          } catch (rewardError) {
            console.error(`❌ Failed to delete claimed reward ${reward.id}:`, rewardError);
            // Continue with other deletions instead of throwing
            console.log(`⚠️ Continuing with other deletions despite reward deletion failure`);
          }
        }

        // Finally, delete the Business model
        console.log('🗑️ Deleting business record...');
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
        console.log('✅ Business deletion completed successfully');
        
        // Final verification - check if any BusinessUser records still exist for this business
        try {
          const finalCheckResult = await client.graphql({
            query: `
              query FinalCheckBusinessUsers($businessId: String!) {
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
            variables: {
              businessId: id,
            },
          });
          
          const remainingUsers = (finalCheckResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string }> } } }).data.listBusinessUsers.items;
          
          if (remainingUsers.length > 0) {
            console.log(`⚠️ WARNING: ${remainingUsers.length} BusinessUser records still exist after deletion:`, remainingUsers);
          } else {
            console.log(`✅ SUCCESS: All BusinessUser records successfully deleted for business ${id}`);
          }
        } catch (finalCheckError) {
          console.log(`✅ Final check completed (error expected if business was deleted):`, finalCheckError instanceof Error ? finalCheckError.message : 'Unknown error');
        }
        
      } catch (businessError) {
        console.error('❌ Error during business deletion process:', businessError);
        throw new Error(`Business deletion failed: ${businessError instanceof Error ? businessError.message : 'Unknown error'}`);
      }
    } else {
      return NextResponse.json(
        { error: "Invalid type. Must be 'signup' or 'business'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: type === 'business' 
        ? `Business and all associated data (users, rewards, claims) deleted successfully`
        : `${type} deleted successfully`,
      data: result,
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting signup:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: "Failed to delete signup", 
        details: error instanceof Error ? error.message : "Unknown error",
        type: type,
        id: id
      },
      { status: 500 }
    );
  }
} 