import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

const PRESERVED_EMAILS = [
  "isaac@rightimagedigital.com",
  "gwbn.mariadaniel@gmail.com"
];

export async function POST(req: Request) {
  try {
    const { confirm } = await req.json();
    
    if (confirm !== "YES_DELETE_ALL") {
      return NextResponse.json(
        { error: "Confirmation required. Send confirm: 'YES_DELETE_ALL' to proceed." },
        { status: 400 }
      );
    }

    console.log("🧹 Starting business cleanup process...");
    console.log("📧 Preserving emails:", PRESERVED_EMAILS);

    const client = generateClient({ authMode: "apiKey" });
    const deletionSummary = {
      businessUsersDeleted: 0,
      businessesDeleted: 0,
      signupsDeleted: 0,
      cardsDeleted: 0,
      claimedRewardsDeleted: 0,
      cardViewsDeleted: 0,
      errors: [] as string[]
    };

    // Step 1: Get all business users
    console.log("🔍 Fetching all business users...");
    const allUsersResult = await client.graphql({
      query: `
        query GetAllBusinessUsers {
          listBusinessUsers {
            items {
              id
              email
              businessId
              firstName
              lastName
              role
              status
            }
          }
        }
      `
    });

    const allUsers = (allUsersResult as { data: { listBusinessUsers: { items: Array<{
      id: string;
      email: string;
      businessId: string;
      firstName: string;
      lastName: string;
      role: string;
      status: string;
    }> } } }).data.listBusinessUsers.items;

    console.log(`📋 Found ${allUsers.length} total business users`);

    // Step 2: Filter out users to preserve
    const usersToDelete = allUsers.filter(user => !PRESERVED_EMAILS.includes(user.email));
    const usersToPreserve = allUsers.filter(user => PRESERVED_EMAILS.includes(user.email));

    console.log(`🗑️ Users to delete: ${usersToDelete.length}`);
    console.log(`✅ Users to preserve: ${usersToPreserve.length}`);

    // Step 2.5: Delete all signups except preserved emails
    console.log("🗑️ Deleting signups...");
    try {
      const allSignupsResult = await client.graphql({
        query: `
          query ListAllSignups {
            listSignups {
              items {
                id
                email
                firstName
                lastName
                status
              }
            }
          }
        `
      });
      const allSignups = (allSignupsResult as { data: { listSignups: { items: Array<{ id: string; email: string; firstName: string; lastName: string; status: string }> } } }).data.listSignups.items;
      
      for (const signup of allSignups) {
        if (!PRESERVED_EMAILS.includes(signup.email)) {
          try {
            await client.graphql({
              query: `
                mutation DeleteSignup($input: DeleteSignupInput!) {
                  deleteSignup(input: $input) { id }
                }
              `,
              variables: { input: { id: signup.id } }
            });
            deletionSummary.signupsDeleted++;
            console.log(`✅ Deleted signup: ${signup.email} (${signup.id})`);
          } catch (error) {
            const errorMsg = `Failed to delete signup ${signup.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            deletionSummary.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }
      }
    } catch (error) {
      const errorMsg = `Failed to fetch all signups: ${error instanceof Error ? error.message : 'Unknown error'}`;
      deletionSummary.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }

    if (usersToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users to delete. All specified emails are already preserved.",
        summary: deletionSummary
      });
    }

    // Step 3: Get unique business IDs to delete and preserve
    const businessIdsToDelete = [...new Set(usersToDelete.map(user => user.businessId))];
    const preservedBusinessIds = [...new Set(usersToPreserve.map(user => user.businessId))];
    console.log(`🏢 Businesses to delete: ${businessIdsToDelete.length}`);
    console.log(`🏢 Preserved business IDs:`, preservedBusinessIds);

    // Step 4: Delete all cards NOT associated with preserved businesses
    console.log("🗑️ Deleting orphaned and non-preserved cards...");
    try {
      const allCardsResult = await client.graphql({
        query: `
          query ListAllCards {
            listCards {
              items {
                cardid
                businessId
              }
            }
          }
        `
      });
      const allCards = (allCardsResult as { data: { listCards: { items: Array<{ cardid: string; businessId?: string }> } } }).data.listCards.items;
      for (const card of allCards) {
        if (!card.businessId || !preservedBusinessIds.includes(card.businessId)) {
          try {
            await client.graphql({
              query: `
                mutation DeleteCard($input: DeleteCardInput!) {
                  deleteCard(input: $input) { cardid }
                }
              `,
              variables: { input: { cardid: card.cardid } }
            });
            deletionSummary.cardsDeleted++;
            console.log(`✅ Deleted card: ${card.cardid}`);
          } catch (error) {
            const errorMsg = `Failed to delete card ${card.cardid}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            deletionSummary.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }
      }
    } catch (error) {
      const errorMsg = `Failed to fetch all cards: ${error instanceof Error ? error.message : 'Unknown error'}`;
      deletionSummary.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }

    // Step 5: Delete all claimed rewards NOT associated with preserved businesses
    console.log("🗑️ Deleting orphaned and non-preserved claimed rewards...");
    try {
      const allClaimedRewardsResult = await client.graphql({
        query: `
          query ListAllClaimedRewards {
            listClaimedRewards {
              items {
                id
                businessId
              }
            }
          }
        `
      });
      const allClaimedRewards = (allClaimedRewardsResult as { data: { listClaimedRewards: { items: Array<{ id: string; businessId?: string }> } } }).data.listClaimedRewards.items;
      for (const reward of allClaimedRewards) {
        if (!reward.businessId || !preservedBusinessIds.includes(reward.businessId)) {
          try {
            await client.graphql({
              query: `
                mutation DeleteClaimedReward($input: DeleteClaimedRewardInput!) {
                  deleteClaimedReward(input: $input) { id }
                }
              `,
              variables: { input: { id: reward.id } }
            });
            deletionSummary.claimedRewardsDeleted++;
            console.log(`✅ Deleted claimed reward: ${reward.id}`);
          } catch (error) {
            const errorMsg = `Failed to delete claimed reward ${reward.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            deletionSummary.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }
      }
    } catch (error) {
      const errorMsg = `Failed to fetch all claimed rewards: ${error instanceof Error ? error.message : 'Unknown error'}`;
      deletionSummary.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }

    // Step 6: Delete all card views for these businesses
    console.log("🗑️ Deleting card views...");
    for (const businessId of businessIdsToDelete) {
      try {
        const cardViewsResult = await client.graphql({
          query: `
            query GetBusinessCardViews($businessId: String!) {
              listCardViews(filter: { businessId: { eq: $businessId } }) {
                items {
                  id
                }
              }
            }
          `,
          variables: { businessId }
        });

        const cardViews = (cardViewsResult as { data: { listCardViews: { items: Array<{ id: string }> } } }).data.listCardViews.items;
        
        for (const view of cardViews) {
          try {
            await client.graphql({
              query: `
                mutation DeleteCardView($input: DeleteCardViewInput!) {
                  deleteCardView(input: $input) {
                    id
                  }
                }
              `,
              variables: {
                input: { id: view.id }
              }
            });
            deletionSummary.cardViewsDeleted++;
            console.log(`✅ Deleted card view: ${view.id}`);
          } catch (error) {
            const errorMsg = `Failed to delete card view ${view.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            deletionSummary.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }
      } catch (error) {
        const errorMsg = `Failed to fetch card views for business ${businessId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        deletionSummary.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    // Step 7: Delete businesses
    console.log("🗑️ Deleting businesses...");
    for (const businessId of businessIdsToDelete) {
      try {
        await client.graphql({
          query: `
            mutation DeleteBusiness($input: DeleteBusinessInput!) {
              deleteBusiness(input: $input) {
                id
                name
              }
            }
          `,
          variables: {
            input: { id: businessId }
          }
        });
        deletionSummary.businessesDeleted++;
        console.log(`✅ Deleted business: ${businessId}`);
      } catch (error) {
        const errorMsg = `Failed to delete business ${businessId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        deletionSummary.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    // Step 8: Delete business users
    console.log("🗑️ Deleting business users...");
    for (const user of usersToDelete) {
      try {
        await client.graphql({
          query: `
            mutation DeleteBusinessUser($input: DeleteBusinessUserInput!) {
              deleteBusinessUser(input: $input) {
                id
                email
              }
            }
          `,
          variables: {
            input: { id: user.id }
          }
        });
        deletionSummary.businessUsersDeleted++;
        console.log(`✅ Deleted business user: ${user.email} (${user.id})`);
      } catch (error) {
        const errorMsg = `Failed to delete business user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        deletionSummary.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    console.log("🎉 Cleanup process completed!");
    console.log("📊 Deletion summary:", deletionSummary);

    return NextResponse.json({
      success: true,
      message: "Business cleanup completed successfully",
      summary: deletionSummary,
      preservedEmails: PRESERVED_EMAILS,
      preservedUsers: usersToPreserve.map(u => ({ email: u.email, businessId: u.businessId }))
    });

  } catch (error) {
    console.error("❌ Error during business cleanup:", error);
    return NextResponse.json(
      { 
        error: "Failed to complete business cleanup",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 