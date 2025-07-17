"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateRewardForm from "@/components/CreateRewardForm";
import EditRewardForm from "@/components/EditRewardForm";
import LogoUpload from "@/components/LogoUpload";
import CardAnimation from "@/components/CardAnimation";



interface BusinessUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  category: string;
  status: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  website: string;
  socialMedia: string;
  businessHours: string;
  description: string;
  photos: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
}

interface Card {
  cardid: string;
  quantity: number;
  logokey?: string;
  header?: string;
  subheader?: string;
  addressurl?: string;
  addresstext?: string;
  expires?: string;
  businessId?: string;
}

interface AnalyticsData {
  totalRewards: number;
  activeRewards: number;
  totalClaims: number;
  totalViews: number;
  totalRedeemed: number;
  recentClaims: Array<{
    id: string;
    cardid: string;
    header: string;
    claimed_at: string;
    delivery_method: string;
  }>;
  rewardsByStatus: {
    active: number;
    inactive: number;
  };
  claimsByMonth: Array<{
    month: string;
    count: number;
  }>;
  claimsByDay: Array<{
    date: string;
    count: number;
  }>;
  claimsByWeek: Array<{
    week: string;
    count: number;
  }>;
  conversionRate: number;
  redemptionRate: number;
  rewardAnalytics: Array<{
    cardid: string;
    header: string;
    subheader: string;
    quantity: number;
    claims: number;
    views: number;
    redeemed: number;
    conversionRate: number;
    redemptionRate: number;
    lastClaimed?: string;
    lastRedeemed?: string;
  }>;
}

type TimeRange = 'day' | 'week' | 'month';

export default function BusinessDashboard() {
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showCreateReward, setShowCreateReward] = useState(false);
  const [showEditReward, setShowEditReward] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [isVisible, setIsVisible] = useState(false);
  
  const [editBusiness, setEditBusiness] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
    socialMedia: "",
    businessHours: "",
    description: "",
    logo: "",
    photos: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
  });
  
  const router = useRouter();



  // Check if profile is complete
  const isProfileComplete = Boolean(business?.logo && business.logo.trim() !== '');

  useEffect(() => {
    // Check if user is logged in
    const userData = sessionStorage.getItem('businessUser');
    const businessData = sessionStorage.getItem('businessData');

    if (!userData || !businessData) {
      router.push('/business/login');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      const businessObj = JSON.parse(businessData);
      
      setUser(userObj);
      setBusiness(businessObj);
      
      // Initialize edit business form
      setEditBusiness({
        name: businessObj.name || "",
        phone: businessObj.phone || "",
        email: businessObj.email || "",
        address: businessObj.address || "",
        city: businessObj.city || "",
        state: businessObj.state || "",
        zipCode: businessObj.zipCode || "",
        website: businessObj.website || "",
        socialMedia: businessObj.socialMedia || "",
        businessHours: businessObj.businessHours || "",
        description: businessObj.description || "",
        logo: businessObj.logo || "",
        photos: businessObj.photos || "",
        primaryContactEmail: businessObj.primaryContactEmail || "",
        primaryContactPhone: businessObj.primaryContactPhone || "",
      });
    } catch (error) {
      console.error('Error parsing session data:', error);
      router.push('/business/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (business?.id) {
      fetchDashboardData();
    }
  }, [business?.id]);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardData = async () => {
    if (!business?.id) return;
    
    setIsLoadingData(true);
    try {
      // Fetch rewards data
      const rewardsResponse = await fetch(`/api/business/rewards?businessId=${business.id}`);
      const rewardsData = await rewardsResponse.json();
      
      if (rewardsData.success) {
        setCards(rewardsData.cards || []);
      }

      // Fetch analytics data
      const analyticsResponse = await fetch(`/api/business/analytics?businessId=${business.id}&timeRange=${timeRange}`);
      const analyticsData = await analyticsResponse.json();
      
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('businessUser');
    sessionStorage.removeItem('businessData');
    router.push('/business/login');
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id) return;

    try {
      const response = await fetch('/api/business/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          ...editBusiness,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Business updated successfully:', result);
        
        // Update session storage
        const updatedBusiness = { ...business, ...editBusiness };
        sessionStorage.setItem('businessData', JSON.stringify(updatedBusiness));
        setBusiness(updatedBusiness);
        
        // Business updated successfully
        alert('Business information updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update business information');
      }
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Failed to update business information');
    }
  };

  const handleDeleteReward = async (cardid: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      const response = await fetch('/api/business/rewards', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardid }),
      });

      if (response.ok) {
        console.log('Reward deleted successfully');
        fetchDashboardData(); // Refresh data
        alert('Reward deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete reward');
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert('Failed to delete reward');
    }
  };

  const handleEditReward = (card: Card) => {
    setEditingCard(card);
    setShowEditReward(true);
  };

  const handleEditRewardSuccess = () => {
    setShowEditReward(false);
    setEditingCard(null);
    fetchDashboardData(); // Refresh data
  };

  const handleCloseEditReward = () => {
    setShowEditReward(false);
    setEditingCard(null);
  };

  const handleLogoUpload = async (logoUrl: string) => {
    if (!business?.id) return;

    try {
      const response = await fetch('/api/business/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          logo: logoUrl,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Logo updated successfully:', result);
        
        // Update session storage
        const updatedBusiness = { ...business, logo: logoUrl };
        sessionStorage.setItem('businessData', JSON.stringify(updatedBusiness));
        setBusiness(updatedBusiness);
        
        setShowLogoUpload(false);
        alert('Logo uploaded successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    }
  };

  const handleCreateRewardSubmit = async (rewardData: { 
    businessId: string;
    businessName: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessZipCode: string;
    businessCategory: string;
    businessLogo?: string;
    subheader: string;
    quantity: number;
    expires: string;
  }) => {
    const constructedAddress = `${rewardData.businessAddress}, ${rewardData.businessCity}, ${rewardData.businessState} ${rewardData.businessZipCode}`;
    
    const requestBody = {
      businessId: rewardData.businessId,
      header: rewardData.businessName,
      subheader: rewardData.subheader,
      quantity: rewardData.quantity,
      expires: rewardData.expires,
      logokey: rewardData.businessLogo || "",
      addressurl: constructedAddress,
      addresstext: constructedAddress,
    };

    try {
      const response = await fetch('/api/business/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Reward created successfully:', result);
        setShowCreateReward(false);
        fetchDashboardData();
        alert('Reward created successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to create reward:', error);
        alert(error.error || 'Failed to create reward');
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      alert('Failed to create reward');
    }
  };

  const handleQuickAction = (action: 'create' | 'analytics' | 'settings') => {
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
      
      {/* Time Range Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-light text-gray-900">Time Range</h3>
          <div className="flex space-x-2">
            {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
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
            {isLoadingData ? "..." : analytics?.totalViews || 0}
          </div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">👆</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalClaims || 0}
          </div>
          <div className="text-sm text-gray-600">Total Claims</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : `${analytics?.conversionRate || 0}%`}
          </div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalRedeemed || 0}
          </div>
          <div className="text-sm text-gray-600">Total Redeemed</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : `${analytics?.redemptionRate || 0}%`}
          </div>
          <div className="text-sm text-gray-600">Redemption Rate</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="text-2xl mb-2">🎁</div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalRewards || 0}
          </div>
          <div className="text-sm text-gray-600">Total Rewards</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-light text-gray-900 mb-6">Claims Over Time</h3>
          <div className="h-64 flex items-end justify-center space-x-2">
            {timeRange === 'day' && analytics?.claimsByDay?.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                  style={{ height: `${Math.max(day.count * 10, 4)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{day.date}</span>
              </div>
            ))}
            {timeRange === 'week' && analytics?.claimsByWeek?.map((week, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                  style={{ height: `${Math.max(week.count * 10, 4)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{week.week}</span>
              </div>
            ))}
            {timeRange === 'month' && analytics?.claimsByMonth?.map((month, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                  style={{ height: `${Math.max(month.count * 10, 4)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-light text-gray-900 mb-6">Reward Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Active Rewards</span>
              </div>
              <span className="text-2xl font-light text-gray-900">
                {isLoadingData ? "..." : analytics?.activeRewards || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="font-medium text-gray-900">Inactive Rewards</span>
              </div>
              <span className="text-2xl font-light text-gray-900">
                {isLoadingData ? "..." : (analytics?.totalRewards || 0) - (analytics?.activeRewards || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reward Analytics */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
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

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
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
              value={editBusiness.name}
              onChange={(e) => setEditBusiness(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={editBusiness.address}
              onChange={(e) => setEditBusiness(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={editBusiness.city}
                onChange={(e) => setEditBusiness(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={editBusiness.state}
                onChange={(e) => setEditBusiness(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                value={editBusiness.zipCode}
                onChange={(e) => setEditBusiness(prev => ({ ...prev, zipCode: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={business?.category || ""}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
            <div className="flex items-center space-x-4">
              {business?.logo ? (
                <img src={business.logo} alt="Business Logo" className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <span className="text-gray-500">No Logo</span>
                </div>
              )}
              <button
                onClick={() => setShowLogoUpload(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Upload Logo
              </button>
            </div>
          </div>
          <div className="pt-4">
            <button
              onClick={handleUpdateBusiness}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Account</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <div className="font-medium text-gray-900">Email</div>
              <div className="text-sm text-gray-600">{user?.email}</div>
            </div>
            <span className="text-sm text-gray-500">Primary</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <div className="font-medium text-gray-900">Role</div>
              <div className="text-sm text-gray-600">{user?.role}</div>
            </div>
            <span className="text-sm text-gray-500">Active</span>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !business) {
    return null;
  }

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
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Profile Completion Banner */}
        {!isProfileComplete && (
          <div className={`transition-all duration-1000 delay-300 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Your profile is incomplete
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Please upload your business logo to start creating rewards.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoUpload(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Upload Logo
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <h2 className="text-3xl font-light text-gray-900">Welcome back, {user.firstName}!</h2>
                    <p className="text-gray-600">Here&rsquo;s how your rewards are performing today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {/* Removed summary cards grid */}

            {/* Rewards Section */}
            <div className="transition-all duration-1000 delay-400 ease-out mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light text-gray-900">Your Rewards</h3>
                <button
                  onClick={() => setShowCreateReward(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl shadow transition-all duration-300"
                >
                  + Create Reward
                </button>
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

                    {/* Card Details Below */}
                    <div className="mt-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                      <div className="space-y-3">
                        <div className="border-b border-gray-100 pb-3">
                          <h4 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                            {card.subheader || "Reward description"}
                          </h4>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-medium">Quantity: {card.quantity}</span>
                            <span className="text-gray-500">
                              {card.expires ? new Date(card.expires).toLocaleDateString() : "No expiration"}
                            </span>
                          </div>
                        </div>
                        
                        {/* Card Status Indicators */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${card.quantity > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className={`text-xs font-medium ${card.quantity > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {card.quantity > 0 ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {card.cardid}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => handleEditReward(card)}
                          className="w-full bg-black/90 hover:bg-black text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm border border-gray-800/20"
                        >
                          Edit Reward
                        </button>
                        <button
                          onClick={() => handleDeleteReward(card.cardid)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300"
                        >
                          Delete Reward
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
          </>
        ) : currentView === 'analytics' ? (
          <AnalyticsView />
        ) : (
          <SettingsView />
        )}

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
      </div>
    </main>
  );
} 