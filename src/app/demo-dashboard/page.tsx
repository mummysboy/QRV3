"use client";

import { useState, useEffect, useMemo } from "react";
import CreateRewardForm from "@/components/CreateRewardForm";
import EditRewardForm from "@/components/EditRewardForm";
import LogoUpload from "@/components/LogoUpload";
import CardAnimation from "@/components/CardAnimation";
import AddBusinessForm from "@/components/AddBusinessForm";
import Header from "@/components/Header";
import { BarChart3, CheckCircle, Target, PartyPopper, TrendingUp, Gift } from "lucide-react";

// Mock business user and business info
const mockBusiness = {
  id: "demo-business-1",
  name: "Market Street Cafe",
  phone: "(415) 555-2020",
  email: "hello@marketstreetcafe.com",
  zipCode: "94105",
  category: "Cafe",
  status: "Active",
  logo: "/market-street-cafe-logo.png", // Market Street Cafe logo
  address: "500 Market St",
  city: "San Francisco",
  state: "CA",
  website: "https://marketstreetcafe.com",
  socialMedia: "@marketstreetcafe",
  businessHours: "7am - 9pm",
  description: "A sleek, professional cafe in the heart of San Francisco for creators and professionals.",
  photos: "",
  primaryContactEmail: "hello@marketstreetcafe.com",
  primaryContactPhone: "(415) 555-3030",
  createdAt: "2024-01-01",
  updatedAt: "2024-06-01",
  approvedAt: "2024-01-02",
};

// --- MOCK DATA GENERATION HELPERS ---
// Generate mock claims/views/redeemed for day, week, month
const generateMockAnalytics = () => {
  // Generate 7 months of data for the bar chart
  const baseMonth = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  let lastValue = 100;
  const claimsByMonth = Array.from({ length: 7 }, (_, i) => {
    // Make it generally increasing, with a few dips
    let change = Math.floor(Math.random() * 30 + 10); // +10 to +40
    if (i === 2 || i === 5) change = -Math.floor(Math.random() * 20 + 5); // dips at 3rd and 6th month
    lastValue = Math.max(60, lastValue + change);
    const monthDate = new Date(baseMonth);
    monthDate.setMonth(baseMonth.getMonth() + i);
    return {
      month: monthDate.toISOString().slice(0, 7),
      count: lastValue,
    };
  });

  // Generate 180 days of data (about 6 months)
  const days = Array.from({ length: 180 }, (_, i) => {
    const date = new Date(Date.now() - (179 - i) * 86400000);
    return {
      date: date.toISOString().slice(0, 10),
      count: Math.floor(20 + Math.random() * 10), // 20-30 claims/views per day
    };
  });
  // Hard-code today (last day) to single-digit values
  days[days.length - 1].count = 5; // e.g., 5 claims/views for today

  // Group by week (about 25 weeks)
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => {
    const weekStart = days[i * 7];
    return {
      week: `${weekStart.date}-W${i + 1}`,
      count: days.slice(i * 7, (i + 1) * 7).reduce((sum, d) => sum + d.count, 0),
    };
  });
  // Views are always higher than claims, redeemed is lower
  const monthsMap: { [month: string]: number } = {};
  days.forEach(d => {
    const month = d.date.slice(0, 7);
    monthsMap[month] = (monthsMap[month] || 0) + d.count;
  });
  // Views, claims, redeemed by day
  const viewsByDay = days.map((d, i) => ({ date: d.date, count: (i === days.length - 1 ? 3 : d.count * 2) })); // 3 views today
  const claimsByDay = days.map((d, i) => ({ date: d.date, count: (i === days.length - 1 ? 5 : d.count) })); // 5 claims today
  const redeemedByDay = days.map((d, i) => ({ date: d.date, count: (i === days.length - 1 ? 2 : Math.floor(d.count * 0.5)) })); // 2 redeemed today
  const claimsByWeek = weeks.map((w, i) => ({ week: w.week, count: claimsByDay.slice(i * 7, (i + 1) * 7).reduce((s, d) => s + d.count, 0) }));
  const viewsByWeek = weeks.map((w, i) => ({ week: w.week, count: viewsByDay.slice(i * 7, (i + 1) * 7).reduce((s, d) => s + d.count, 0) }));
  const redeemedByWeek = weeks.map((w, i) => ({ week: w.week, count: redeemedByDay.slice(i * 7, (i + 1) * 7).reduce((s, d) => s + d.count, 0) }));
  const viewsByMonth = claimsByMonth.map(m => ({ month: m.month, count: m.count * 2 }));
  const redeemedByMonth = claimsByMonth.map(m => ({ month: m.month, count: Math.floor(m.count * 0.5) }));

  // Generate recent claims (last 10 days)
  const recentClaims = days.slice(-10).map((d, i) => ({
    id: `${i + 1}`,
    cardid: `demo-${(i % 3) + 1}`,
    header: "Market Street Cafe",
    claimed_at: new Date(d.date).toISOString(),
    delivery_method: i % 2 === 0 ? "Email" : "SMS",
  })).reverse();

  // Generate reward analytics for 3 demo cards
  const rewardAnalytics = [1, 2, 3].map((n) => {
    // For each card, use a slice of the data
    const idx = n - 1;
    const cardClaims = claimsByDay.map((d, i) => (i % 3 === idx ? d.count : 0));
    const cardViews = viewsByDay.map((d, i) => (i % 3 === idx ? d.count : 0));
    const cardRedeemed = redeemedByDay.map((d, i) => (i % 3 === idx ? d.count : 0));
    const totalClaims = cardClaims.reduce((s, c) => s + c, 0);
    const totalViews = cardViews.reduce((s, c) => s + c, 0);
    const totalRedeemed = cardRedeemed.reduce((s, c) => s + c, 0);
    return {
      cardid: `demo-${n}`,
      header: "Market Street Cafe",
      subheader: [
        "Enjoy a complimentary single-origin espresso – crafted for creators.",
        "20% off your first pour-over – elevate your coffee ritual.",
        "Bring a friend – buy one, get one free on all signature drinks."
      ][idx],
      quantity: [100, 50, 30][idx],
      claims: totalClaims,
      views: totalViews,
      redeemed: totalRedeemed,
      conversionRate: totalViews > 0 ? Math.round((totalClaims / totalViews) * 100) : 0,
      redemptionRate: totalClaims > 0 ? Math.round((totalRedeemed / totalClaims) * 100) : 0,
      lastClaimed: totalClaims > 0 ? days[days.length - 1].date : null,
      lastRedeemed: totalRedeemed > 0 ? days[days.length - 1].date : null,
    };
  });

  // Add summary stats for convenience
  const totalClaims = claimsByMonth.reduce((sum, m) => sum + m.count, 0);
  const totalViews = viewsByMonth.reduce((sum, m) => sum + m.count, 0);
  const totalRedeemed = redeemedByMonth.reduce((sum, m) => sum + m.count, 0);
  const conversionRate = totalViews > 0 ? Math.round((totalClaims / totalViews) * 100) : 0;
  const redemptionRate = totalClaims > 0 ? Math.round((totalRedeemed / totalClaims) * 100) : 0;

  return {
    totalRewards: 3,
    activeRewards: 3,
    claimsByDay,
    claimsByWeek,
    claimsByMonth,
    viewsByDay,
    viewsByWeek,
    viewsByMonth,
    redeemedByDay,
    redeemedByWeek,
    redeemedByMonth,
    recentClaims,
    rewardAnalytics,
    totalClaims,
    totalViews,
    totalRedeemed,
    conversionRate,
    redemptionRate,
  };
};

const mockAnalytics = generateMockAnalytics();

// Mock cards data with dynamic expiration dates
const getMockCards = () => {
  const now = new Date();
  const oneHour = new Date(now.getTime() + 60 * 60 * 1000);
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return [
    {
      cardid: "demo-1",
      header: "Market Street Cafe",
      subheader: "Enjoy a complimentary single-origin espresso – crafted for creators.",
      quantity: 100,
      logokey: "/market-street-cafe-logo.png",
      addresstext: "500 Market St, San Francisco, CA 94105",
      addressurl: "",
      expires: oneHour.toISOString(),
    },
    {
      cardid: "demo-2",
      header: "Market Street Cafe",
      subheader: "20% off your first pour-over – elevate your coffee ritual.",
      quantity: 50,
      logokey: "/market-street-cafe-logo.png",
      addresstext: "500 Market St, San Francisco, CA 94105",
      addressurl: "",
      expires: oneWeek.toISOString(),
    },
    {
      cardid: "demo-3",
      header: "Market Street Cafe",
      subheader: "Bring a friend – buy one, get one free on all signature drinks.",
      quantity: 30,
      logokey: "/market-street-cafe-logo.png",
      addresstext: "500 Market St, San Francisco, CA 94105",
      addressurl: "",
      expires: oneMonth.toISOString(),
    },
  ];
};

export default function DemoDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');
  const [showCreateReward, setShowCreateReward] = useState(false);
  const [showEditReward, setShowEditReward] = useState(false);
  const [editingCard, setEditingCard] = useState<ReturnType<typeof getMockCards>[0] | null>(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');
  
  // Use mock data
  const business = mockBusiness;
  // Compute filtered analytics based on timeRange
  const filteredAnalytics = useMemo(() => {
    // Helper to sum counts
    const sumCounts = (arr: { count: number }[]) => arr.reduce((sum: number, item: { count: number }) => sum + (item.count || 0), 0);

    // Select correct arrays for time range
    let claimsBy: { count: number }[] = [];
    let viewsBy: { count: number }[] = [];
    let redeemedBy: { count: number }[] = [];
    let rewardAnalytics: Array<{
      cardid: string;
      header: string;
      subheader: string;
      quantity: number;
      claims: number;
      views: number;
      redeemed: number;
      conversionRate: number;
      redemptionRate: number;
      lastClaimed: string | null;
      lastRedeemed: string | null;
    }> = [];
    let recentClaims: Array<{
      id: string;
      cardid: string;
      header: string;
      claimed_at: string;
      delivery_method: string;
    }> = [];
    if (timeRange === 'day') {
      claimsBy = mockAnalytics.claimsByDay.slice(-1); // today only
      viewsBy = mockAnalytics.viewsByDay.slice(-1);
      redeemedBy = mockAnalytics.redeemedByDay.slice(-1);
      // Reward analytics for today only
      rewardAnalytics = mockAnalytics.rewardAnalytics.map((reward, idx) => {
        const claim = claimsBy[0]?.count && (idx === 0 ? claimsBy[0].count : 0);
        const view = viewsBy[0]?.count && (idx === 0 ? viewsBy[0].count : 0);
        const redeemed = redeemedBy[0]?.count && (idx === 0 ? redeemedBy[0].count : 0);
        return {
          ...reward,
          claims: claim || 0,
          views: view || 0,
          redeemed: redeemed || 0,
          conversionRate: view > 0 ? Math.round((claim / view) * 100) : 0,
          redemptionRate: claim > 0 ? Math.round((redeemed / claim) * 100) : 0,
          lastClaimed: claim > 0 ? mockAnalytics.claimsByDay[mockAnalytics.claimsByDay.length - 1].date : null,
          lastRedeemed: redeemed > 0 ? mockAnalytics.redeemedByDay[mockAnalytics.redeemedByDay.length - 1].date : null,
        };
      });
      recentClaims = mockAnalytics.recentClaims.slice(0, 2); // last 2 claims
    } else if (timeRange === 'week') {
      claimsBy = mockAnalytics.claimsByWeek.slice(-1); // this week
      viewsBy = mockAnalytics.viewsByWeek.slice(-1);
      redeemedBy = mockAnalytics.redeemedByWeek.slice(-1);
      // Reward analytics for this week
      rewardAnalytics = mockAnalytics.rewardAnalytics.map((reward, idx) => {
        const claim = claimsBy[0]?.count && (idx === 0 ? claimsBy[0].count : 0);
        const view = viewsBy[0]?.count && (idx === 0 ? viewsBy[0].count : 0);
        const redeemed = redeemedBy[0]?.count && (idx === 0 ? redeemedBy[0].count : 0);
        return {
          ...reward,
          claims: claim || 0,
          views: view || 0,
          redeemed: redeemed || 0,
          conversionRate: view > 0 ? Math.round((claim / view) * 100) : 0,
          redemptionRate: claim > 0 ? Math.round((redeemed / claim) * 100) : 0,
          lastClaimed: claim > 0 ? mockAnalytics.claimsByDay[mockAnalytics.claimsByDay.length - 1].date : null,
          lastRedeemed: redeemed > 0 ? mockAnalytics.redeemedByDay[mockAnalytics.redeemedByDay.length - 1].date : null,
        };
      });
      recentClaims = mockAnalytics.recentClaims.slice(0, 5); // last 5 claims
    } else if (timeRange === 'month') {
      claimsBy = mockAnalytics.claimsByMonth;
      viewsBy = mockAnalytics.viewsByMonth;
      redeemedBy = mockAnalytics.redeemedByMonth;
      rewardAnalytics = mockAnalytics.rewardAnalytics;
      recentClaims = mockAnalytics.recentClaims;
    }
    const totalClaims = sumCounts(claimsBy);
    const totalViews = sumCounts(viewsBy);
    const totalRedeemed = sumCounts(redeemedBy);
    const conversionRate = totalViews > 0 ? Math.round((totalClaims / totalViews) * 100) : 0;
    const redemptionRate = totalClaims > 0 ? Math.round((totalRedeemed / totalClaims) * 100) : 0;
    return {
      ...mockAnalytics,
      totalClaims,
      totalViews,
      totalRedeemed,
      conversionRate,
      redemptionRate,
      claimsByDay: timeRange === 'day' ? mockAnalytics.claimsByDay.slice(-1) : [],
      claimsByWeek: timeRange === 'week' ? mockAnalytics.claimsByWeek.slice(-1) : [],
      claimsByMonth: timeRange === 'month' ? mockAnalytics.claimsByMonth : [],
      viewsByDay: timeRange === 'day' ? mockAnalytics.viewsByDay.slice(-1) : [],
      redeemedByDay: timeRange === 'day' ? mockAnalytics.redeemedByDay.slice(-1) : [],
      rewardAnalytics,
      recentClaims,
    };
  }, [timeRange]);
  const [cards, setCards] = useState(getMockCards());

  // Check if profile is complete - for demo, always allow creation
  const isProfileComplete = true;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleQuickAction = (action: 'create' | 'analytics' | 'settings' | 'add-business') => {
    switch (action) {
      case 'create':
        setShowCreateReward(true);
        break;
      case 'analytics':
        setCurrentView('analytics');
        break;
      case 'settings':
        setCurrentView('settings');
        break;
      case 'add-business':
        setShowAddBusiness(true);
        break;
    }
  };

  const handleEditReward = (card: ReturnType<typeof getMockCards>[0]) => {
    setEditingCard(card);
    setShowEditReward(true);
  };

  const handleCloseEditReward = () => {
    setShowEditReward(false);
    setEditingCard(null);
  };

  const handleLogoUpload = async () => {
    // In demo, just close the modal
    setShowLogoUpload(false);
  };

  const handleCreateRewardSubmit = async (rewardData: {
    businessName: string;
    subheader: string;
    quantity: number | "";
    expires: string;
  }) => {
    // Validate quantity
    if (rewardData.quantity === "" || rewardData.quantity <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }

    // Add new reward to the cards array
    const newCard = {
      cardid: `demo-${Date.now()}`,
      header: rewardData.businessName || business.name,
      subheader: rewardData.subheader,
      quantity: rewardData.quantity as number, // Type assertion since we validated it above
      logokey: "/mummy-cafe-logo.svg",
      addresstext: `${business.address}, ${business.city}, ${business.state} ${business.zipCode}`,
      addressurl: "",
      expires: rewardData.expires,
    };
    
    setCards((prev: ReturnType<typeof getMockCards>) => [...prev, newCard]);
    setShowCreateReward(false);
  };

  const handleAddBusinessSubmit = async () => {
    // In demo, just close the modal
    setShowAddBusiness(false);
  };

  const handleDeleteReward = async (cardid: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    
    // Remove the reward from the cards array
    setCards((prev: ReturnType<typeof getMockCards>) => prev.filter(card => card.cardid !== cardid));
  };

  // Analytics View Component
  const AnalyticsView = ({ analytics }: { analytics: typeof mockAnalytics }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light text-gray-900">Analytics</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      {/* Time Range Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-light text-gray-900">Time Range</h3>
          <div className="flex space-x-2">
            {(['day', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {analytics?.totalViews || 0}
          </div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {analytics?.totalClaims || 0}
          </div>
          <div className="text-sm text-gray-600">Total Claims</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {`${analytics?.conversionRate || 0}%`}
          </div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {analytics?.totalRedeemed || 0}
          </div>
          <div className="text-sm text-gray-600">Total Redeemed</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {`${analytics?.redemptionRate || 0}%`}
          </div>
          <div className="text-sm text-gray-600">Redemption Rate</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">🎁</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {analytics?.totalRewards || 0}
          </div>
          <div className="text-sm text-gray-600">Total Rewards</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-light text-gray-900 mb-6">Claims Over Time</h3>
          <div className="h-64 flex items-end justify-center space-x-4 sm:space-x-6 md:space-x-8">
            {/* Always show all months, regardless of time filter */}
            {mockAnalytics.claimsByMonth.map((month, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                {/* Value label */}
                <span className="mb-2 text-base font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-200">
                  {month.count}
                </span>
                <div
                  className="w-10 sm:w-12 md:w-14 bg-green-500 rounded-t-2xl shadow-md group-hover:bg-green-600 transition-all duration-200"
                  style={{ height: `${Math.min(Math.max(month.count * 1.5, 24), 200)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {month.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-light text-gray-900 mb-6">Reward Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Active Rewards</span>
              </div>
              <span className="text-2xl font-light text-gray-900">
                {analytics?.activeRewards || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="font-medium text-gray-900">Inactive Rewards</span>
              </div>
              <span className="text-2xl font-light text-gray-900">
                {(analytics?.totalRewards || 0) - (analytics?.activeRewards || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reward Analytics */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Reward Performance</h3>
        <div className="space-y-4">
          {analytics?.rewardAnalytics?.length ? (
            analytics.rewardAnalytics.map((reward, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors flex flex-col items-center">
                {/* Centered logo */}
                <div className="flex justify-center mb-2 w-full">
                  <img
                    src={mockBusiness.logo}
                    alt="Business Logo"
                    className="w-12 h-12 object-contain rounded-lg mx-auto"
                    style={{ minWidth: '48px', minHeight: '48px', maxWidth: '64px', maxHeight: '64px' }}
                  />
                </div>
                {/* Centered business name and subheader */}
                <div className="w-full text-center mb-2">
                  <div className="font-semibold text-lg text-gray-900">{reward.header}</div>
                  <p className="text-sm text-gray-600 mb-1">{reward.subheader}</p>
                </div>
                {/* Centered quantity */}
                <div className="mb-4 text-center w-full">
                  <span className="text-sm text-gray-600">Quantity</span>
                  <div className="text-lg font-medium text-gray-900">{reward.quantity}</div>
                </div>
                {/* Responsive stats row: stack vertically on mobile, grid on desktop, centered */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 text-center w-full">
                  <div>
                    <div className="text-lg sm:text-2xl font-light text-gray-900 mb-1">{reward.views}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Views</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-light text-gray-900 mb-1">{reward.claims}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Claims</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-light text-gray-900 mb-1">{reward.redeemed}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Redeemed</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-light text-gray-900 mb-1">{reward.conversionRate}%</div>
                    <div className="text-xs sm:text-sm text-gray-600">Conversion</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-light text-gray-900 mb-1">{reward.redemptionRate}%</div>
                    <div className="text-xs sm:text-sm text-gray-600">Redemption</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-light text-gray-900 mb-1">{reward.lastRedeemed ? new Date(reward.lastRedeemed).toLocaleDateString() : 'Never'}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Last Redeemed</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No rewards found
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {analytics?.recentClaims?.length ? (
            analytics.recentClaims.map((claim, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">New reward claimed</div>
                  <div className="text-sm text-gray-600">{claim.header} • {claim.delivery_method}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(claim.claimed_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Settings View Component
  const SettingsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light text-gray-900">Settings</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Business Profile</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              value="Demo Coffee Shop"
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value="123 Main St, San Francisco, CA 94105"
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value="Cafe"
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
            <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <span className="text-gray-500">Upload Logo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <div className="font-medium text-gray-900">Email Notifications</div>
              <div className="text-sm text-gray-600">Get notified when rewards are claimed</div>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <div className="font-medium text-gray-900">SMS Notifications</div>
              <div className="text-sm text-gray-600">Receive text messages for important updates</div>
            </div>
            <div className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-16">
      <Header onContactClick={() => {}} />

      <div className="container mx-auto px-6 py-8">

        {currentView === 'dashboard' ? (
          <>
            {/* Welcome Section */}
            <div className={`transition-all duration-600 delay-200 ease-in-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center justify-center">
                    {business.logo && business.logo.trim() !== '' ? (
                      <img
                        src={business.logo}
                        alt="Business Logo"
                        className="w-20 h-20 rounded-full object-contain shadow-md bg-white mr-6"
                        style={{ minWidth: '80px', minHeight: '80px', maxWidth: '96px', maxHeight: '96px' }}
                      />
                    ) : (
                      <span className="text-4xl text-gray-600">🏪</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-light text-gray-900">Welcome back, {business.name}!</h2>
                    <p className="text-gray-600">Here&rsquo;s how your rewards are performing today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row (filtered by timeRange) */}
            <div className={`transition-all duration-600 delay-300 ease-in-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                {/* Hard-coded single-digit values for demo home page */}
                {[
                  { icon: <BarChart3 size={32} className="text-blue-600" />, label: 'Total Views', value: 12 },
                  { icon: <CheckCircle size={32} className="text-green-600" />, label: 'Total Claims', value: 10 },
                  { icon: <Target size={32} className="text-orange-600" />, label: 'Conversion Rate', value: '83%' },
                  { icon: <PartyPopper size={32} className="text-purple-600" />, label: 'Total Redeemed', value: 6 },
                  { icon: <TrendingUp size={32} className="text-indigo-600" />, label: 'Redemption Rate', value: '50%' },
                  { icon: <Gift size={32} className="text-pink-600" />, label: 'Total Rewards', value: filteredAnalytics.totalRewards },
                ].map((card, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                    <div className="mb-2">{card.icon}</div>
                    <div className="text-3xl font-light text-gray-900 mb-1">{card.value}</div>
                    <div className="text-sm text-gray-600">{card.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`transition-all duration-600 delay-400 ease-in-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
                <h3 className="text-2xl font-light text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button 
                    onClick={() => handleQuickAction('create')}
                    className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all duration-200 ease-in-out"
                  >
                    <span className="text-2xl">➕</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Create Reward</div>
                      <div className="text-sm text-gray-600">New offer in seconds</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('analytics')}
                    className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all duration-200 ease-in-out"
                  >
                    <span className="text-2xl">📊</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">View Analytics</div>
                      <div className="text-sm text-gray-600">Detailed insights</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('add-business')}
                    className="flex items-center space-x-4 p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-all duration-200 ease-in-out"
                  >
                    <span className="text-2xl">🏢</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Add Business</div>
                      <div className="text-sm text-gray-600">Register new location</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('settings')}
                    className="flex items-center space-x-4 p-4 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-all duration-200 ease-in-out"
                  >
                    <span className="text-2xl">⚙️</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Settings</div>
                      <div className="text-sm text-gray-600">Manage account</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Rewards Section */}
            <div className="transition-all duration-600 delay-500 ease-in-out mb-12">
              <div className="mb-6">
                <h3 className="text-2xl font-light text-gray-900">Your Rewards</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map((card, idx) => {
                  return (
                    <div key={idx} className="group relative">
                      {/* Real Card - exactly like the claim reward page */}
                      <div className="relative w-full max-w-sm mx-auto">
                        <CardAnimation 
                          card={{
                            cardid: card.cardid,
                            header: card.header || business.name,
                            logokey: card.logokey || business.logo,
                            addresstext: card.addresstext || `${business.address}, ${business.city}, ${business.state} ${business.zipCode}`,
                            addressurl: card.addressurl || "",
                            subheader: card.subheader || "Reward description",
                            expires: card.expires || "",
                            quantity: card.quantity,
                          }}
                        />
                      </div>
                      {/* Active/Expired Notification above buttons */}
                      <div className="w-full flex justify-center mt-2 mb-2">
                        {(() => {
                          const now = new Date();
                          const exp = new Date(card.expires);
                          const isActive = exp.getTime() > now.getTime();
                          return (
                            <span className={`text-xs font-semibold ${isActive ? 'text-green-600' : 'text-red-600'}`}
                              style={{ minWidth: 70, textAlign: 'center' }}>
                              {isActive ? 'Active' : 'Expired'}
                            </span>
                          );
                        })()}
                      </div>
                      {/* Action Buttons - side by side, mobile friendly */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditReward(card)}
                          className="flex-1 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out shadow-sm border border-blue-100"
                        >
                          <span className="mr-2">✏️</span> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReward(card.cardid)}
                          className="flex-1 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out shadow-sm border border-red-100"
                        >
                          <span className="mr-2">🗑️</span> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : currentView === 'analytics' ? (
          <AnalyticsView analytics={filteredAnalytics} />
        ) : currentView === 'settings' ? (
          <SettingsView />
        ) : null}

        {/* Create Reward Modal */}
        <CreateRewardForm
          isOpen={showCreateReward}
          onClose={() => setShowCreateReward(false)}
          onSubmit={handleCreateRewardSubmit}
          business={{
            id: business.id,
            name: business.name,
            address: business.address,
            city: business.city,
            state: business.state,
            zipCode: business.zipCode,
            category: business.category,
            logo: business.logo,
          }}
          isProfileComplete={isProfileComplete}
        />

        {/* Edit Reward Modal */}
        {showEditReward && editingCard && (
          <EditRewardForm
            card={editingCard}
            onClose={handleCloseEditReward}
            onSuccess={(updatedData) => {
              if (updatedData) {
                setCards((prevCards) => prevCards.map(card =>
                  card.cardid === editingCard.cardid
                    ? { ...card, ...updatedData }
                    : card
                ));
              }
              setShowEditReward(false);
              setEditingCard(null);
            }}
            localEditOnly={true}
          />
        )}

        {/* Logo Upload Modal */}
        {showLogoUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Business Logo</h3>
                <button
                  onClick={() => setShowLogoUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <LogoUpload
                currentLogo={business?.logo}
                onUpload={handleLogoUpload}
                businessName={business?.name || "Business"}
              />
            </div>
          </div>
        )}

        {/* Add Business Modal */}
        <AddBusinessForm
          isOpen={showAddBusiness}
          onClose={() => setShowAddBusiness(false)}
          onSubmit={handleAddBusinessSubmit}
        />
      </div>
    </main>
  );
} 