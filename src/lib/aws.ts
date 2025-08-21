// lib/aws.ts - Updated to use GraphQL instead of direct DynamoDB

import { generateClient } from "aws-amplify/api";
import "../../lib/amplify-client";

// Initialize GraphQL client
const client = generateClient({ authMode: 'apiKey' });

export async function decrementCardQuantity(cardid: string) {
  console.log("➡️ Attempting to decrement card:", cardid);
  
  try {
    // First get the current card to check quantity
    const getCardResult = await client.graphql({
      query: `
        query GetCard($cardid: String!) {
          getCard(cardid: $cardid) {
            cardid
            quantity
          }
        }
      `,
      variables: { cardid },
    });

    const card = getCardResult.data.getCard;
    if (!card) {
      throw new Error("Card not found");
    }

    if (card.quantity <= 0) {
      throw new Error("Card quantity is already 0");
    }

    // Update the card quantity
    const updateResult = await client.graphql({
      query: `
        mutation UpdateCard($input: UpdateCardInput!) {
          updateCard(input: $input) {
            cardid
            quantity
          }
        }
      `,
      variables: {
        input: {
          cardid,
          quantity: card.quantity - 1,
        },
      },
    });

    console.log("✅ Quantity decremented:", updateResult.data.updateCard);
    return updateResult.data.updateCard;
  } catch (err) {
    console.error("❌ Failed to decrement quantity:", err);
    throw err;
  }
}

export async function logClaimedReward(data: Record<string, unknown>) {
  try {
    console.log("📝 Logging claimed reward:", JSON.stringify(data, null, 2));
    
    const createResult = await client.graphql({
      query: `
        mutation CreateClaimedReward($input: CreateClaimedRewardInput!) {
          createClaimedReward(input: $input) {
            id
            cardid
            email
            claimed_at
          }
        }
      `,
      variables: {
        input: data,
      },
    });

    console.log("✅ Successfully logged claimed reward:", createResult.data.createClaimedReward);
    return createResult.data.createClaimedReward;
  } catch (error) {
    console.error("❌ Failed to log claimed reward:", error);
    throw error;
  }
}
