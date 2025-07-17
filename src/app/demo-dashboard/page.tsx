"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CreateRewardForm, { RewardData } from "@/components/CreateRewardForm";
import CardAnimation from "@/components/CardAnimation";

// Mock business user and business info
const mockBusiness = {
  id: "demo-business-1",
  name: "Demo Coffee Shop",
  phone: "(415) 555-1234",
  email: "demo@coffeeshop.com",
  zipCode: "94105",
  category: "Cafe",
  status: "Active",
  logo: undefined, // Optionally use a public asset
  address: "123 Main St",
  city: "San Francisco",
  state: "CA",
  website: "https://demo-coffee.com",
  socialMedia: "@democoffee",
  businessHours: "7am - 7pm",
  description: "A cozy spot for coffee lovers.",
  photos: "",
  primaryContactEmail: "demo@coffeeshop.com",
  primaryContactPhone: "(415) 555-1234",
  createdAt: "2024-01-01",
  updatedAt: "2024-06-01",
  approvedAt: "2024-01-02",
};

// Mock analytics data
const mockAnalytics = {
  totalRewards: 3,
  activeRewards: 2,
  totalClaims: 156,
  totalViews: 320,
  totalRedeemed: 89,
  recentClaims: [
    { id: "1", cardid: "demo-1", header: "Free Coffee", claimed_at: new Date().toISOString(), delivery_method: "Email" },
    { id: "2", cardid: "demo-2", header: "20% Off Lunch", claimed_at: new Date(Date.now() - 86400000).toISOString(), delivery_method: "SMS" },
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
      header: "Free Coffee",
      subheader: "Get a free coffee with any purchase!",
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
      header: "20% Off Lunch",
      subheader: "Enjoy 20% off your lunch order.",
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
      header: "Weekend Special",
      subheader: "Buy one get one free on weekends!",
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

export default function DemoDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');
  const [showCreate, setShowCreate] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editRewardData, setEditRewardData] = useState<RewardData | null>(null);
  // Use mock business and analytics
  const business = mockBusiness;
  // Demo rewards state from mock analytics
  const [rewards, setRewards] = useState<RewardData[]>([
    ...mockAnalytics.rewardAnalytics.map((r) => ({
      businessId: business.id,
      businessName: business.name,
      businessAddress: business.address,
      businessCity: business.city,
      businessState: business.state,
      businessZipCode: business.zipCode,
      businessCategory: business.category,
      businessLogo: business.logo,
      subheader: r.subheader,
      quantity: r.quantity,
      expires: r.lastClaimed || '',
    })),
  ]);

  // For edit reward form
  const [isEnhancingEdit, setIsEnhancingEdit] = useState(false);
  const [prevEditDescription, setPrevEditDescription] = useState<string | null>(null);
  const [hasEnhancedEdit, setHasEnhancedEdit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Total Rewards", value: "24", change: "+12%", icon: "🎁" },
    { label: "Active Offers", value: "8", change: "+3", icon: "✨" },
    { label: "Claims Today", value: "156", change: "+23%", icon: "📱" },
    { label: "New Customers", value: "89", change: "+18%", icon: "👥" }
  ];

  // Handlers for create/edit
  const handleCreateReward = (data: RewardData) => {
    setRewards((prev) => [...prev, data]);
    setShowCreate(false);
  };
  const openEditReward = (idx: number) => {
    console.log('openEditReward called with index:', idx);
    console.log('Current rewards:', rewards);
    console.log('Reward to edit:', rewards[idx]);
    setEditIndex(idx);
    setEditRewardData(rewards[idx]);
    console.log('Edit state set - editIndex:', idx, 'editRewardData:', rewards[idx]);
  };

  // Handle edit form submission
  const handleEditSubmit = (data: { subheader: string; quantity: number; expires: string }) => {
    if (editIndex !== null) {
      setRewards((prev) => prev.map((r, i) => 
        i === editIndex ? { 
          ...r, 
          subheader: data.subheader,
          quantity: data.quantity,
          expires: data.expires
        } : r
      ));
      setEditIndex(null);
      setEditRewardData(null);
    }
  };

  // Enhance logic for edit
  const handleEnhanceEditDescription = async (desc: string, setDesc: (d: string) => void) => {
    console.log('🔍 DemoDashboard: Enhance button clicked');
    console.log('🔍 DemoDashboard: Current description:', desc);
    
    setIsEnhancingEdit(true);
    setPrevEditDescription(desc);
    
    // Use fallback description if empty
    const testDescription = desc || "Get a free coffee";
    console.log('🔍 DemoDashboard: Using description for API:', testDescription);
    
    try {
      const res = await fetch("/api/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: testDescription }),
      });
      
      console.log('🔍 DemoDashboard: Response status:', res.status);
      console.log('🔍 DemoDashboard: Response ok:', res.ok);
      
      const data = await res.json();
      console.log('🔍 DemoDashboard: API response:', data);
      
      if (res.ok && data.enhancedDescription) {
        setDesc(data.enhancedDescription);
        setHasEnhancedEdit(true);
        console.log('🔍 DemoDashboard: Enhanced description set successfully');
      } else {
        console.log('🔍 DemoDashboard: API response not ok or no enhanced description');
        console.log('🔍 DemoDashboard: res.ok:', res.ok);
        console.log('🔍 DemoDashboard: data.enhancedDescription:', data.enhancedDescription);
      }
    } catch (error) {
      console.error('🔍 DemoDashboard: Error during enhancement:', error);
    } finally {
      setIsEnhancingEdit(false);
    }
  };
  const handleUndoEnhanceEdit = (setDesc: (d: string) => void) => {
    if (prevEditDescription !== null) {
      setDesc(prevEditDescription);
      setPrevEditDescription(null);
      setHasEnhancedEdit(false);
    }
  };

  // Custom edit form component for demo
  const DemoEditForm = ({ card, onClose }: { 
    card: {
      cardid: string;
      header: string;
      logokey?: string;
      addresstext: string;
      addressurl: string;
      subheader: string;
      expires: string;
      quantity: number;
    }; 
    onClose: () => void 
  }) => {
    const [formData, setFormData] = useState({
      subheader: card.subheader || "",
      quantity: card.quantity || 100,
      expires: card.expires || "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      // Simulate API delay
      setTimeout(() => {
        handleEditSubmit(formData);
        setIsSubmitting(false);
      }, 500);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === "subheader" || name === "quantity" || name === "expires") {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Reward</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2"
                aria-label="Close form"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information (Read-only) */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Business Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={card.header}
                    disabled
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={card.addresstext}
                    disabled
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Editable Reward Information */}
              <div className="space-y-4 pt-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Reward Details</h3>
                
                <div className="relative">
                  <textarea
                    id="subheader"
                    name="subheader"
                    value={formData.subheader}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base resize-none"
                    placeholder="Describe your reward offer (e.g., Get a free coffee with any purchase, 20% off your next visit, Buy one get one free)"
                    disabled={isEnhancingEdit}
                    maxLength={80}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEnhanceEditDescription(formData.subheader, (desc) => setFormData(prev => ({ ...prev, subheader: desc })))}
                        disabled={isEnhancingEdit}
                        className="px-2 py-1 text-xs rounded flex items-center text-gray-400 border border-gray-200 hover:text-gray-600 hover:border-gray-300 transition bg-white disabled:opacity-60"
                        aria-label="Enhance with AI"
                      >
                        {isEnhancingEdit ? (
                          <span className="animate-spin mr-1 w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full"></span>
                        ) : (
                          <span className="flex items-center">✨<span className="ml-1 hidden sm:inline">Enhance</span></span>
                        )}
                      </button>
                      {hasEnhancedEdit && (
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded text-gray-400 border border-gray-200 hover:text-gray-600 hover:border-gray-300 transition bg-white"
                          onClick={() => handleUndoEnhanceEdit((desc) => setFormData(prev => ({ ...prev, subheader: desc })))}
                        >Undo</button>
                      )}
                    </div>
                    <span className={`text-xs ${formData.subheader.length > 70 ? 'text-red-500' : 'text-gray-500'}`}>
                      {formData.subheader.length}/80
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tell customers what they&rsquo;ll receive</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Available
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of rewards available</p>
                </div>

                <div>
                  <label htmlFor="expires" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="expires"
                    name="expires"
                    value={formData.expires}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                </div>
              </div>

              <div className="pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.subheader.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none text-base"
                >
                  {isSubmitting ? 'Updating...' : 'Update Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const handleQuickAction = (action: 'create' | 'analytics' | 'settings') => {
    switch (action) {
      case 'create':
        setShowCreate(true);
        break;
      case 'analytics':
        setCurrentView('analytics');
        break;
      case 'settings':
        setCurrentView('settings');
        break;
    }
  };

  // Analytics view component
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-3xl font-light text-gray-900 mb-1">1,247</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">👆</div>
          <div className="text-3xl font-light text-gray-900 mb-1">892</div>
          <div className="text-sm text-gray-600">Total Claims</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-3xl font-light text-gray-900 mb-1">71.5%</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-3xl font-light text-gray-900 mb-1">$12,450</div>
          <div className="text-sm text-gray-600">Revenue Generated</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { time: "2 minutes ago", action: "New reward claimed", user: "Sarah M.", reward: "Free Coffee" },
            { time: "5 minutes ago", action: "New reward claimed", user: "Mike R.", reward: "20% Off Lunch" },
            { time: "12 minutes ago", action: "Reward created", user: "You", reward: "Weekend Special" },
            { time: "1 hour ago", action: "New reward claimed", user: "Lisa K.", reward: "Free Coffee" },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.action}</div>
                <div className="text-sm text-gray-600">{activity.user} • {activity.reward}</div>
              </div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Settings view component
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
      <div className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-2xl font-light text-gray-900">
              {currentView === 'dashboard' ? 'Business Dashboard' : 
               currentView === 'analytics' ? 'Analytics' : 'Settings'}
            </h1>
          </div>
          <div className="text-sm text-gray-500">Demo Preview</div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {currentView === 'dashboard' ? (
          <>
            {/* Welcome Section */}
            <div className={`transition-all duration-1000 delay-300 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-light text-gray-900">Welcome back, Demo Business</h2>
                    <p className="text-gray-600">Here&rsquo;s how your rewards are performing today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className={`transition-all duration-1000 delay-600 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                    </div>
                    <div className="text-3xl font-light text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Rewards Section */}
            <div className="transition-all duration-1000 delay-400 ease-out mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light text-gray-900">Your Rewards</h3>
                <button
                  onClick={() => setShowCreate(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl shadow transition-all duration-300"
                >
                  + Create Reward
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rewards.map((reward, idx) => (
                  <div key={idx} className="group relative">
                    {/* Real Card - exactly like the claim reward page */}
                    <div className="relative w-full max-w-sm mx-auto">
                      <CardAnimation 
                        card={{
                          cardid: `demo-${idx}`,
                          header: reward.businessName,
                          logokey: reward.businessLogo,
                          addresstext: `${reward.businessAddress}, ${reward.businessCity}, ${reward.businessState} ${reward.businessZipCode}`,
                          addressurl: "",
                          subheader: reward.subheader,
                          expires: reward.expires,
                          quantity: reward.quantity,
                        }}
                      />
                    </div>

                    {/* Card Details Below */}
                    <div className="mt-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                      <div className="space-y-3">
                        <div className="border-b border-gray-100 pb-3">
                          <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                            {reward.subheader}
                          </h4>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-medium">Quantity: {reward.quantity}</span>
                            <span className="text-gray-500">
                              {reward.expires ? new Date(reward.expires).toLocaleDateString() : "No expiration"}
                            </span>
                          </div>
                        </div>
                        
                        {/* Card Status Indicators */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">Active</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: DEMO-{String(idx + 1).padStart(3, '0')}
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            console.log('Edit button clicked for index:', idx);
                            openEditReward(idx);
                          }}
                          className="w-full bg-black/90 hover:bg-black text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm border border-gray-800/20"
                        >
                          Edit Reward
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`transition-all duration-1000 delay-1200 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
                <h3 className="text-2xl font-light text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => handleQuickAction('create')}
                    className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors"
                  >
                    <span className="text-2xl">➕</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Create Reward</div>
                      <div className="text-sm text-gray-600">New offer in seconds</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('analytics')}
                    className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-2xl">📊</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">View Analytics</div>
                      <div className="text-sm text-gray-600">Detailed insights</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('settings')}
                    className="flex items-center space-x-4 p-4 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors"
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

            {/* CTA Section */}
            <div className={`transition-all duration-1000 delay-1500 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-center bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-8 text-white">
                <h3 className="text-3xl font-light mb-4">Ready to get started?</h3>
                <p className="text-xl mb-8 opacity-90">This is just a preview. Sign up to create your own dashboard.</p>
                <Link 
                  href="/business/signup"
                  className="inline-block bg-white text-green-600 font-medium px-8 py-4 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  Start Your Free Trial
                </Link>
              </div>
            </div>
          </>
        ) : currentView === 'analytics' ? (
          <AnalyticsView />
        ) : (
          <SettingsView />
        )}

        {/* Create Reward Modal */}
        <CreateRewardForm
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateReward}
          business={mockBusiness}
          isProfileComplete={true}
        />
        {/* Edit Reward Modal */}
        {editIndex !== null && editRewardData && (
          <>
            {console.log('Rendering DemoEditForm with:', { editIndex, editRewardData })}
            <DemoEditForm
              card={{
                cardid: `demo-${editIndex}`,
                header: editRewardData.businessName,
                logokey: editRewardData.businessLogo,
                addresstext: `${editRewardData.businessAddress}, ${editRewardData.businessCity}, ${editRewardData.businessState} ${editRewardData.businessZipCode}`,
                addressurl: "",
                subheader: editRewardData.subheader,
                expires: editRewardData.expires,
                quantity: editRewardData.quantity,
              }}
              onClose={() => { 
                console.log('Closing edit modal');
                setEditIndex(null); 
                setEditRewardData(null); 
              }}
            />
          </>
        )}
      </div>
    </main>
  );
} 