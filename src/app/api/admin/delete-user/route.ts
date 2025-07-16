import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

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

    // Delete the user
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

    return NextResponse.json({
      success: true,
      message: "User and associated business deleted successfully",
      deletedUser: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      businessDeleted: businessDeleted,
      businessId: user.businessId
    });

  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 