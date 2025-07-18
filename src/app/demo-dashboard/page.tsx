"use client";

import { useState, useEffect } from "react";
import CreateRewardForm from "@/components/CreateRewardForm";
import EditRewardForm from "@/components/EditRewardForm";
import LogoUpload from "@/components/LogoUpload";
import CardAnimation from "@/components/CardAnimation";
import AddBusinessForm, { AddBusinessData } from "@/components/AddBusinessForm";

// Mock business user and business info
const mockBusiness = {
  id: "demo-business-1",
  name: "Mummy's Cafe",
  phone: "(415) 555-1234",
  email: "hello@mummys-cafe.com",
  zipCode: "94105",
  category: "Cafe",
  status: "Active",
  logo: "/mummy-cafe-logo.svg", // Mummy's Cafe logo
  address: "123 Main St",
  city: "San Francisco",
  state: "CA",
  website: "https://mummys-cafe.com",
  socialMedia: "@mummys_cafe",
  businessHours: "7am - 7pm",
  description: "A cozy spot for coffee lovers.",
  photos: "",
  primaryContactEmail: "hello@mummys-cafe.com",
  primaryContactPhone: "(415) 555-1234",
  createdAt: "2024-01-01",
  updatedAt: "2024-06-01",
  approvedAt: "2024-01-02",
};

const mockUser = {
  id: "demo-user-1",
  email: "hello@mummys-cafe.com",
  firstName: "Isaac",
  lastName: "Johnson",
  role: "owner",
  status: "active",
};

// Mock analytics data
const mockAnalytics = {
  totalRewards: 3,
  activeRewards: 2,
  totalClaims: 156,
  totalViews: 320,
  totalRedeemed: 89,
  recentClaims: [
    { id: "1", cardid: "demo-1", header: "Mummy's Cafe", claimed_at: new Date().toISOString(), delivery_method: "Email" },
    { id: "2", cardid: "demo-2", header: "Mummy's Cafe", claimed_at: new Date(Date.now() - 86400000).toISOString(), delivery_method: "SMS" },
  ],
  rewardsByStatus: { active: 2, inactive: 1 },
  claimsByMonth: [
    { month: "2024-04", count: 40 },
    { month: "2024-05", count: 60 },
    { month: "2024-06", count: 56 },
  ],
  claimsByDay: [
    { date: new Date().toISOString().slice(0, 10), count: 23 },
    { date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), count: 18 },
  ],
  claimsByWeek: [
    { week: "2024-W22", count: 30 },
    { week: "2024-W23", count: 40 },
    { week: "2024-W24", count: 25 },
  ],
  conversionRate: 48,
  redemptionRate: 57,
  rewardAnalytics: [
    {
      cardid: "demo-1",
      header: "Mummy's Cafe",
      subheader: "Sweetie, treat yourself to a free coffee on us! 💕",
      quantity: 100,
      claims: 56,
      views: 120,
      redeemed: 30,
      conversionRate: 47,
      redemptionRate: 54,
      lastClaimed: new Date().toISOString(),
      lastRedeemed: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      cardid: "demo-2",
      header: "Mummy's Cafe",
      subheader: "Darling, save 20% on your lunch - you deserve it! 🌟",
      quantity: 50,
      claims: 30,
      views: 80,
      redeemed: 20,
      conversionRate: 38,
      redemptionRate: 66,
      lastClaimed: new Date(Date.now() - 86400000).toISOString(),
      lastRedeemed: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      cardid: "demo-3",
      header: "Mummy's Cafe",
      subheader: "Honey, bring a friend this weekend - buy one, get one free! 💝",
      quantity: 30,
      claims: 10,
      views: 30,
      redeemed: 5,
      conversionRate: 33,
      redemptionRate: 50,
      lastClaimed: null,
      lastRedeemed: null,
    },
  ],
  viewsByDay: [
    { date: new Date().toISOString().slice(0, 10), count: 40 },
    { date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), count: 35 },
  ],
  redeemedByDay: [
    { date: new Date().toISOString().slice(0, 10), count: 12 },
    { date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), count: 8 },
  ],
};

// Mock cards data with dynamic expiration dates
const getMockCards = () => {
  const now = new Date();
  const oneHour = new Date(now.getTime() + 60 * 60 * 1000);
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return [
    {
      cardid: "demo-1",
      header: "Mummy's Cafe",
      subheader: "Sweetie, treat yourself to a free coffee on us! 💕",
      quantity: 100,
      logokey: "/mummy-cafe-logo.svg",
      addresstext: "123 Main St, San Francisco, CA 94105",
      addressurl: "",
      expires: oneHour.toISOString(),
    },
    {
      cardid: "demo-2",
      header: "Mummy's Cafe",
      subheader: "Darling, save 20% on your lunch - you deserve it! 🌟",
      quantity: 50,
      logokey: "/mummy-cafe-logo.svg",
      addresstext: "123 Main St, San Francisco, CA 94105",
      addressurl: "",
      expires: oneWeek.toISOString(),
    },
    {
      cardid: "demo-3",
      header: "Mummy's Cafe",
      subheader: "Honey, bring a friend this weekend - buy one, get one free! 💝",
      quantity: 30,
      logokey: "/mummy-cafe-logo.svg",
      addresstext: "123 Main St, San Francisco, CA 94105",
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
  const user = mockUser;
  const analytics = mockAnalytics;
  const [cards, setCards] = useState(getMockCards());

  // Check if profile is complete - for demo, always allow creation
  const isProfileComplete = true;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to get today's stats
  function getTodayStats(analytics: typeof mockAnalytics | null) {
    if (!analytics) {
      return {
        todayViews: "0",
        todayClaims: "0",
        conversionRate: "0",
        todayRedeemed: "0",
        redemptionRate: "0",
        totalRewards: "0"
      };
    }

    const todayViews = analytics.viewsByDay?.[0]?.count || 0;
    const todayClaims = analytics.claimsByDay?.[0]?.count || 0;
    const todayRedeemed = analytics.redeemedByDay?.[0]?.count || 0;
    const conversionRate = todayViews > 0 ? Math.round((todayClaims / todayViews) * 100) : 0;
    const redemptionRate = todayClaims > 0 ? Math.round((todayRedeemed / todayClaims) * 100) : 0;

    return {
      todayViews: todayViews.toString(),
      todayClaims: todayClaims.toString(),
      conversionRate: conversionRate.toString(),
      todayRedeemed: todayRedeemed.toString(),
      redemptionRate: redemptionRate.toString(),
      totalRewards: analytics.totalRewards.toString()
    };
  }

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

  const handleEditRewardSuccess = () => {
    setShowEditReward(false);
    setEditingCard(null);
  };

  const handleCloseEditReward = () => {
    setShowEditReward(false);
    setEditingCard(null);
  };

  const handleLogoUpload = async (_logoUrl: string) => {
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

  const handleAddBusinessSubmit = async (_data: AddBusinessData) => {
    // In demo, just close the modal
    setShowAddBusiness(false);
  };

  const handleDeleteReward = async (cardid: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    
    // Remove the reward from the cards array
    setCards((prev: ReturnType<typeof getMockCards>) => prev.filter(card => card.cardid !== cardid));
  };

  // Analytics View Component
  const AnalyticsView = () => (
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
          <div className="h-64 flex items-end justify-center space-x-2">
            {timeRange === 'day' && analytics?.claimsByDay?.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                  style={{ height: `${Math.min(Math.max(day.count * 8, 4), 200)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{day.date}</span>
              </div>
            ))}
            {timeRange === 'week' && analytics?.claimsByWeek?.map((week, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                  style={{ height: `${Math.min(Math.max(week.count * 8, 4), 200)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{week.week}</span>
              </div>
            ))}
            {timeRange === 'month' && analytics?.claimsByMonth?.map((month, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                  style={{ height: `${Math.min(Math.max(month.count * 8, 4), 200)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{month.month}</span>
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
              <div key={idx} className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{reward.header}</h4>
                    <p className="text-sm text-gray-600">{reward.subheader}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Quantity</div>
                    <div className="text-lg font-medium text-gray-900">{reward.quantity}</div>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.views}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.claims}</div>
                    <div className="text-sm text-gray-600">Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.redeemed}</div>
                    <div className="text-sm text-gray-600">Redeemed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.conversionRate}%</div>
                    <div className="text-sm text-gray-600">Conversion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.redemptionRate}%</div>
                    <div className="text-sm text-gray-600">Redemption</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">
                      {reward.lastRedeemed ? new Date(reward.lastRedeemed).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-sm text-gray-600">Last Redeemed</div>
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className={`transition-all duration-700 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-light text-gray-900">Demo Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

        {currentView === 'dashboard' ? (
          <>
            {/* Welcome Section */}
            <div className={`transition-all duration-600 delay-200 ease-in-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                    {business.logo && business.logo.trim() !== '' ? (
                      <img
                        src={business.logo}
                        alt="Business Logo"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <span className="text-2xl text-gray-600">🏪</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-light text-gray-900">Welcome back, {user.firstName}!</h2>
                    <p className="text-gray-600">Here&rsquo;s how your rewards are performing today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Stats Row */}
            <div className={`transition-all duration-600 delay-300 ease-in-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                {(() => {
                  const stats = getTodayStats(analytics);
                  return [
                    { icon: '📊', label: 'Total Views', value: stats.todayViews },
                    { icon: '✅', label: 'Total Claims', value: stats.todayClaims },
                    { icon: '🎯', label: 'Conversion Rate', value: `${stats.conversionRate}%` },
                    { icon: '🎉', label: 'Total Redeemed', value: stats.todayRedeemed },
                    { icon: '📈', label: 'Redemption Rate', value: `${stats.redemptionRate}%` },
                    { icon: '🎁', label: 'Total Rewards', value: stats.totalRewards },
                  ].map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <div className="text-3xl font-light text-gray-900 mb-1">{card.value}</div>
                      <div className="text-sm text-gray-600">{card.label}</div>
                    </div>
                  ));
                })()}
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
                {cards.map((card, idx) => (
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
                    {/* Action Buttons - side by side, mobile friendly */}
                    <div className="mt-4 flex space-x-2">
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
                ))}
              </div>
            </div>
          </>
        ) : currentView === 'analytics' ? (
          <AnalyticsView />
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
            onSuccess={handleEditRewardSuccess}
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