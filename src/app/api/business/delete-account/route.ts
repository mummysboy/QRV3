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

    const client = generateClient();

    // Step 1: Find all business users for this email
    const userResult = await client.graphql({
      query: `
        query GetBusinessUser($email: String!) {
          listBusinessUsers(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              businessId
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
        email: userEmail,
      },
    });

    const users = (userResult as { data: { listBusinessUsers: { items: Array<{ 
      id: string; 
      businessId: string; 
      email: string; 
      firstName: string; 
      lastName: string; 
      role: string; 
      status: string; 
    }> } } }).data.listBusinessUsers.items;

    console.log(`📋 Found ${users.length} business users to delete`);

    if (users.length === 0) {
      return NextResponse.json({ 
        error: "No user found with this email" 
      }, { status: 404 });
    }

    // Step 2: For each user, delete their associated business and data
    for (const user of users) {
      console.log(`🗑️ Processing user: ${user.email} with business: ${user.businessId}`);

      // Get the business details
      const businessResult = await client.graphql({
        query: `
          query GetBusiness($id: String!) {
            getBusiness(id: $id) {
              id
              name
              logo
              status
            }
          }
        `,
        variables: {
          id: user.businessId,
        },
      });

      const business = (businessResult as { data: { getBusiness: { 
        id: string; 
        name: string; 
        logo: string; 
        status: string; 
      } | null } }).data.getBusiness;

      if (business) {
        console.log(`🏢 Found business: ${business.name}`);

        // Delete all Cards for this business
        const cardsResult = await client.graphql({
          query: `
            query ListCards($businessId: String!) {
              listCards(filter: { businessId: { eq: $businessId } }) {
                items {
                  cardid
                  businessId
                }
              }
            }
          `,
          variables: { businessId: business.id },
        });

        const cards = (cardsResult as { data: { listCards: { items: Array<{ 
          cardid: string; 
          businessId: string; 
        }> } } }).data.listCards.items;

        console.log(`🎁 Deleting ${cards.length} cards for business ${business.id}`);

        for (const card of cards) {
          try {
            await client.graphql({
              query: `
                mutation DeleteCard($cardid: ID!) {
                  deleteCard(input: { cardid: $cardid }) {
                    cardid
                  }
                }
              `,
              variables: { cardid: card.cardid },
            });
          } catch (error) {
            console.warn(`⚠️ Failed to delete card ${card.cardid}:`, error);
          }
        }

        // Delete all ClaimedRewards for this business
        const rewardsResult = await client.graphql({
          query: `
            query ListClaimedRewards($businessId: String!) {
              listClaimedRewards(filter: { businessId: { eq: $businessId } }) {
                items {
                  id
                  businessId
                }
              }
            }
          `,
          variables: { businessId: business.id },
        });

        const rewards = (rewardsResult as { data: { listClaimedRewards: { items: Array<{ 
          id: string; 
          businessId: string; 
        }> } } }).data.listClaimedRewards.items;

        console.log(`📝 Deleting ${rewards.length} claimed rewards for business ${business.id}`);

        for (const reward of rewards) {
          try {
            await client.graphql({
              query: `
                mutation DeleteClaimedReward($id: ID!) {
                  deleteClaimedReward(input: { id: $id }) {
                    id
                  }
                }
              `,
              variables: { id: reward.id },
            });
          } catch (error) {
            console.warn(`⚠️ Failed to delete claimed reward ${reward.id}:`, error);
          }
        }

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

        // Delete the business
        try {
          await client.graphql({
            query: `
                      mutation DeleteBusiness($id: String!) {
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
          console.log(`✅ Deleted business: ${business.name}`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete business ${business.id}:`, error);
        }
      } else {
        console.log(`⚠️ Business ${user.businessId} not found`);
      }

      // Delete the business user
      try {
        await client.graphql({
          query: `
                    mutation DeleteBusinessUser($id: String!) {
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
        console.log(`✅ Deleted business user: ${user.email}`);
      } catch (error) {
        console.warn(`⚠️ Failed to delete business user ${user.id}:`, error);
      }
    }

    // Step 3: Clear any remaining S3 objects for this user
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