import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "us-west-1" });
const S3_BUCKET = "qrewards-media6367c-dev";

export async function DELETE(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    console.log(`🗑️ Starting account deletion for user: ${userEmail}`);

    const client = generateClient({ authMode: "apiKey" });

    // Step 1: Get all business users for this email
    const businessUsersResult = await client.graphql({
      query: `
        query GetBusinessUsers($email: String!) {
          listBusinessUsers(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              businessId
              email
              firstName
              lastName
            }
          }
        }
      `,
      variables: { email: userEmail },
    });

    const businessUsers = (businessUsersResult as any).data.listBusinessUsers.items;
    console.log(`📋 Found ${businessUsers.length} business users to delete`);

    // Step 2: Delete all businesses and associated data for each business user
    for (const businessUser of businessUsers) {
      const businessId = businessUser.businessId;

      // Get business details for S3 cleanup
      const businessResult = await client.graphql({
        query: `
          query GetBusiness($id: ID!) {
            getBusiness(id: $id) {
              id
              name
              logo
            }
          }
        `,
        variables: { id: businessId },
      });

      const business = (businessResult as any).data.getBusiness;
      if (business) {
        // Delete business logos from S3
        if (business.logo && business.logo.trim() !== '') {
          try {
            let logoKey = business.logo;
            
            // If it's a full URL, extract just the key
            if (business.logo.startsWith('http')) {
              const urlParts = business.logo.split('/');
              if (urlParts.length > 3) {
                logoKey = urlParts.slice(3).join('/');
              }
            }

            if (logoKey.startsWith('logos/')) {
              console.log(`🖼️ Deleting logo: ${logoKey}`);
              await s3Client.send(new DeleteObjectCommand({
                Bucket: S3_BUCKET,
                Key: logoKey
              }));
            }
          } catch (error) {
            console.warn(`⚠️ Failed to delete logo ${business.logo}:`, error);
          }
        }

        // Delete all cards for this business
        const cardsResult = await client.graphql({
          query: `
            query GetCards($businessId: String!) {
              listCards(filter: {
                businessId: { eq: $businessId }
              }) {
                items {
                  cardid
                }
              }
            }
          `,
          variables: { businessId },
        });

        const cards = (cardsResult as any).data.listCards.items;
        console.log(`🎁 Deleting ${cards.length} cards for business ${businessId}`);

        for (const card of cards) {
          await client.graphql({
            query: `
              mutation DeleteCard($input: DeleteCardInput!) {
                deleteCard(input: $input) {
                  cardid
                }
              }
            `,
            variables: { input: { cardid: card.cardid } },
          });
        }

        // Delete all claimed rewards for this business
        const claimedRewardsResult = await client.graphql({
          query: `
            query GetClaimedRewards($businessId: String!) {
              listClaimedRewards(filter: {
                businessId: { eq: $businessId }
              }) {
                items {
                  id
                }
              }
            }
          `,
          variables: { businessId },
        });

        const claimedRewards = (claimedRewardsResult as any).data.listClaimedRewards.items;
        console.log(`📝 Deleting ${claimedRewards.length} claimed rewards for business ${businessId}`);

        for (const claimedReward of claimedRewards) {
          await client.graphql({
            query: `
              mutation DeleteClaimedReward($input: DeleteClaimedRewardInput!) {
                deleteClaimedReward(input: $input) {
                  id
                }
              }
            `,
            variables: { input: { id: claimedReward.id } },
          });
        }

        // Delete all card views for this business
        const cardViewsResult = await client.graphql({
          query: `
            query GetCardViews($businessId: String!) {
              listCardViews(filter: {
                businessId: { eq: $businessId }
              }) {
                items {
                  id
                }
              }
            }
          `,
          variables: { businessId },
        });

        const cardViews = (cardViewsResult as any).data.listCardViews.items;
        console.log(`👁️ Deleting ${cardViews.length} card views for business ${businessId}`);

        for (const cardView of cardViews) {
          await client.graphql({
            query: `
              mutation DeleteCardView($input: DeleteCardViewInput!) {
                deleteCardView(input: $input) {
                  id
                }
              }
            `,
            variables: { input: { id: cardView.id } },
          });
        }

        // Delete all analytics for this business
        const analyticsResult = await client.graphql({
          query: `
            query GetBusinessAnalytics($businessId: String!) {
              listBusinessAnalytics(filter: {
                businessId: { eq: $businessId }
              }) {
                items {
                  id
                }
              }
            }
          `,
          variables: { businessId },
        });

        const analytics = (analyticsResult as any).data.listBusinessAnalytics.items;
        console.log(`📊 Deleting ${analytics.length} analytics records for business ${businessId}`);

        for (const analytic of analytics) {
          await client.graphql({
            query: `
              mutation DeleteBusinessAnalytics($input: DeleteBusinessAnalyticsInput!) {
                deleteBusinessAnalytics(input: $input) {
                  id
                }
              }
            `,
            variables: { input: { id: analytic.id } },
          });
        }

        // Delete the business
        await client.graphql({
          query: `
            mutation DeleteBusiness($input: DeleteBusinessInput!) {
              deleteBusiness(input: $input) {
                id
                name
              }
            }
          `,
          variables: { input: { id: businessId } },
        });
      }
    }

    // Step 3: Delete all business users for this email
    for (const businessUser of businessUsers) {
      await client.graphql({
        query: `
          mutation DeleteBusinessUser($input: DeleteBusinessUserInput!) {
            deleteBusinessUser(input: $input) {
              id
              email
            }
          }
        `,
        variables: { input: { id: businessUser.id } },
      });
    }

    // Step 4: Clear any remaining S3 objects for this user
    try {
      const listResponse = await s3Client.send(new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: `logos/`
      }));

      if (listResponse.Contents) {
        for (const object of listResponse.Contents) {
          if (object.Key && object.Key.includes(userEmail.replace('@', '-').replace('.', '-'))) {
            console.log(`🗑️ Deleting S3 object: ${object.Key}`);
            await s3Client.send(new DeleteObjectCommand({
              Bucket: S3_BUCKET,
              Key: object.Key
            }));
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to clean up S3 objects:`, error);
    }

    console.log(`✅ Account deletion completed for user: ${userEmail}`);

    return NextResponse.json({ 
      success: true, 
      message: "Account and all associated data deleted successfully" 
    });

  } catch (error) {
    console.error("❌ Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
} 