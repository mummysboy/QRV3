import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface Card {
  cardid: string;
  quantity: number;
  header: string;
  subheader: string;
  businessId: string;
}

interface ClaimedReward {
  id: string;
  cardid: string;
  header: string;
  claimed_at: string;
  redeemed_at: string;
  delivery_method: string;
  businessId: string;
}

interface CardView {
  id: string;
  cardid: string;
  businessId: string;
  viewed_at: string;
  ip_address: string;
  user_agent: string;
}

interface Business {
  id: string;
  name: string;
  status: string;
}

interface AdminAnalytics {
  totalBusinesses: number;
  activeBusinesses: number;
  totalSignups: number;
  totalCardViews: number;
  totalClaims: number;
  totalRedeemed: number;
  conversionRate: number;
  redemptionRate: number;
  topPerformingBusinesses: Array<{
    businessId: string;
    businessName: string;
    totalViews: number;
    totalClaims: number;
    conversionRate: number;
  }>;
  claimsByMonth: Array<{
    month: string;
    count: number;
  }>;
  claimsByDay: Array<{
    date: string;
    count: number;
  }>;
  viewsByDay: Array<{
    date: string;
    count: number;
  }>;
  businessAnalytics: Array<{
    businessId: string;
    businessName: string;
    totalRewards: number;
    activeRewards: number;
    totalViews: number;
    totalClaims: number;
    totalRedeemed: number;
    conversionRate: number;
    redemptionRate: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    const businessId = searchParams.get('businessId') || 'all';
    const showAll = searchParams.get('showAll') === 'true';

    const client = generateClient();

    // Calculate date range based on timeRange parameter
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all businesses
    const businessesResult = await client.graphql({
      query: `
        query GetBusinesses {
          listBusinesses {
            items {
              id
              name
              status
            }
          }
        }
      `,
    });

    const businesses = (businessesResult as { data: { listBusinesses: { items: Business[] } } }).data.listBusinesses.items;
    const activeBusinesses = businesses.filter(b => b.status === 'approved').length;

    // Get all cards
    const cardsResult = await client.graphql({
      query: `
        query GetCards {
          listCards {
            items {
              cardid
              quantity
              header
              subheader
              businessId
            }
          }
        }
      `,
    });

    const cards = (cardsResult as { data: { listCards: { items: Card[] } } }).data.listCards.items;

    // Get all claimed rewards
    const claimedRewardsResult = await client.graphql({
      query: `
        query GetClaimedRewards {
          listClaimedRewards {
            items {
              id
              cardid
              header
              claimed_at
              redeemed_at
              delivery_method
              businessId
            }
          }
        }
      `,
    });

    const claimedRewards = (claimedRewardsResult as { data: { listClaimedRewards: { items: ClaimedReward[] } } }).data.listClaimedRewards.items;

    // Get all card views
    const cardViewsResult = await client.graphql({
      query: `
        query GetCardViews {
          listCardViews {
            items {
              id
              cardid
              businessId
              viewed_at
              ip_address
              user_agent
            }
          }
        }
      `,
    });

    const cardViews = (cardViewsResult as { data: { listCardViews: { items: CardView[] } } }).data.listCardViews.items;

    // Filter data based on business selection
    let filteredCards = cards;
    let filteredClaimedRewards = claimedRewards;
    let filteredCardViews = cardViews;

    if (businessId !== 'all') {
      filteredCards = cards.filter(card => card.businessId === businessId);
      filteredClaimedRewards = claimedRewards.filter(claim => claim.businessId === businessId);
      filteredCardViews = cardViews.filter(view => view.businessId === businessId);
    }

    // Filter data based on time range
    const timeFilteredClaimedRewards = filteredClaimedRewards.filter(claim => {
      const claimDate = new Date(claim.claimed_at);
      return claimDate >= startDate;
    });

    const timeFilteredCardViews = filteredCardViews.filter(view => {
      const viewDate = new Date(view.viewed_at);
      return viewDate >= startDate;
    });

    // Calculate analytics
    const totalBusinesses = businessId === 'all' ? businesses.length : 1;
    const totalCardViews = timeFilteredCardViews.length;
    const totalClaims = timeFilteredClaimedRewards.length;
    const totalRedeemed = timeFilteredClaimedRewards.filter(claim => claim.redeemed_at).length;
    const conversionRate = totalCardViews > 0 ? Math.round((totalClaims / totalCardViews) * 100) : 0;
    const redemptionRate = totalClaims > 0 ? Math.round((totalRedeemed / totalClaims) * 100) : 0;

    // Calculate top performing businesses
    const businessPerformance = new Map<string, { views: number; claims: number; name: string }>();
    
    timeFilteredCardViews.forEach(view => {
      const business = businesses.find(b => b.id === view.businessId);
      if (business) {
        const current = businessPerformance.get(view.businessId) || { views: 0, claims: 0, name: business.name };
        current.views++;
        businessPerformance.set(view.businessId, current);
      }
    });

    timeFilteredClaimedRewards.forEach(claim => {
      const business = businesses.find(b => b.id === claim.businessId);
      if (business) {
        const current = businessPerformance.get(claim.businessId) || { views: 0, claims: 0, name: business.name };
        current.claims++;
        businessPerformance.set(claim.businessId, current);
      }
    });

    const topPerformingBusinesses = Array.from(businessPerformance.entries())
      .map(([businessId, data]) => ({
        businessId,
        businessName: data.name,
        totalViews: data.views,
        totalClaims: data.claims,
        conversionRate: data.views > 0 ? Math.round((data.claims / data.views) * 100) : 0
      }))
      .sort((a, b) => b.totalClaims - a.totalClaims)
      .slice(0, 10);

    // Calculate claims by day (last 7 days)
    const claimsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const dayKey = date.toISOString().slice(0, 10);
      const dayClaims = timeFilteredClaimedRewards.filter(claim => {
        const claimDate = new Date(claim.claimed_at);
        return claimDate >= date && claimDate < nextDate;
      }).length;
      claimsByDay.push({
        date: dayKey,
        count: dayClaims,
      });
    }

    // Calculate views by day (last 7 days)
    const viewsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const dayKey = date.toISOString().slice(0, 10);
      const dayViews = timeFilteredCardViews.filter(view => {
        const viewDate = new Date(view.viewed_at);
        return viewDate >= date && viewDate < nextDate;
      }).length;
      viewsByDay.push({
        date: dayKey,
        count: dayViews,
      });
    }

    // Calculate individual business analytics
    const businessAnalytics = businesses.map(business => {
      const businessCards = filteredCards.filter(card => card.businessId === business.id);
      const businessViews = timeFilteredCardViews.filter(view => view.businessId === business.id);
      const businessClaims = timeFilteredClaimedRewards.filter(claim => claim.businessId === business.id);
      const businessRedeemed = businessClaims.filter(claim => claim.redeemed_at);

      const totalRewards = businessCards.length;
      const activeRewards = businessCards.filter(card => card.quantity > 0).length;
      const totalViews = businessViews.length;
      const totalClaims = businessClaims.length;
      const totalRedeemed = businessRedeemed.length;
      const conversionRate = totalViews > 0 ? Math.round((totalClaims / totalViews) * 100) : 0;
      const redemptionRate = totalClaims > 0 ? Math.round((totalRedeemed / totalClaims) * 100) : 0;

      return {
        businessId: business.id,
        businessName: business.name,
        totalRewards,
        activeRewards,
        totalViews,
        totalClaims,
        totalRedeemed,
        conversionRate,
        redemptionRate,
      };
    });

    // Calculate claims by month (last 6 months)
    const claimsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      
      const monthClaims = timeFilteredClaimedRewards.filter(claim => {
        const claimDate = new Date(claim.claimed_at);
        return claimDate.getFullYear() === date.getFullYear() && 
               claimDate.getMonth() === date.getMonth();
      }).length;

      claimsByMonth.push({
        month: monthKey,
        count: monthClaims,
      });
    }

    const analytics: AdminAnalytics = {
      totalBusinesses,
      activeBusinesses,
      totalSignups: 0, // This would need to be calculated from signups table
      totalCardViews,
      totalClaims,
      totalRedeemed,
      conversionRate,
      redemptionRate,
      topPerformingBusinesses,
      claimsByMonth,
      claimsByDay,
      viewsByDay,
      businessAnalytics: showAll ? businessAnalytics : [],
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
} 