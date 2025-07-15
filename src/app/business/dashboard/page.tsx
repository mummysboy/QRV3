"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoVideo from "@/components/LogoVideo";

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
  totalScans: number;
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
}

export default function BusinessDashboard() {
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showCreateReward, setShowCreateReward] = useState(false);
  const [showEditBusiness, setShowEditBusiness] = useState(false);
  const [newReward, setNewReward] = useState({
    header: "",
    subheader: "",
    quantity: 100,
    expires: "",
    logokey: "",
    addressurl: "",
    addresstext: "",
  });
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
      const analyticsResponse = await fetch(`/api/business/analytics?businessId=${business.id}`);
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

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id) return;

    try {
      const response = await fetch('/api/business/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          ...newReward,
        }),
      });

      if (response.ok) {
        setShowCreateReward(false);
        setNewReward({
          header: "",
          subheader: "",
          quantity: 100,
          expires: "",
          logokey: "",
          addressurl: "",
          addresstext: "",
        });
        fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create reward');
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      alert('Failed to create reward');
    }
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
        setBusiness(result.business);
        sessionStorage.setItem('businessData', JSON.stringify(result.business));
        setShowEditBusiness(false);
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
      const response = await fetch(`/api/business/rewards?cardid=${cardid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
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

  const navigation = [
    { name: "Overview", id: "overview", icon: "📊" },
    { name: "Rewards", id: "rewards", icon: "🎁" },
    { name: "Business Info", id: "business-info", icon: "🏢" },
    { name: "Analytics", id: "analytics", icon: "📈" },
    { name: "Support", id: "support", icon: "💬" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <LogoVideo />
              </Link>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900">{business.name}</h1>
                <p className="text-sm text-gray-600">Business Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === "overview" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                  
                  {/* Welcome Section */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Welcome back, {user.firstName}!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Here&apos;s what&apos;s happening with your business today.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-white rounded-lg p-4 flex-1 min-w-48">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-2xl">🎁</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Active Rewards</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {isLoadingData ? "..." : analytics?.activeRewards || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 flex-1 min-w-48">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <span className="text-2xl">👥</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Total Claims</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {isLoadingData ? "..." : analytics?.totalClaims || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 flex-1 min-w-48">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <span className="text-2xl">📱</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">QR Scans</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {isLoadingData ? "..." : analytics?.totalScans || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setActiveTab("rewards")}
                        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">➕</span>
                          <div>
                            <p className="font-medium">Create Your First Reward</p>
                            <p className="text-sm opacity-90">Start attracting customers today</p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("business-info")}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">✏️</span>
                          <div>
                            <p className="font-medium">Complete Business Profile</p>
                            <p className="text-sm opacity-90">Add photos and details</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    {analytics?.recentClaims && analytics.recentClaims.length > 0 ? (
                      <div className="space-y-3">
                        {analytics.recentClaims.slice(0, 5).map((claim) => (
                          <div key={claim.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{claim.header}</p>
                                <p className="text-sm text-gray-600">
                                  Claimed via {claim.delivery_method}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  {new Date(claim.claimed_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-600">No recent activity yet</p>
                        <p className="text-sm text-gray-500 mt-2">Start creating rewards to see activity here</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "rewards" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
                    <button 
                      onClick={() => setShowCreateReward(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Create Reward
                    </button>
                  </div>
                  
                  {cards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cards.map((card) => (
                        <div key={card.cardid} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {card.header || "Untitled Reward"}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              card.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {card.quantity > 0 ? 'Active' : 'Out of Stock'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{card.subheader}</p>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Quantity:</span> {card.quantity}
                            </p>
                            {card.expires && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Expires:</span> {card.expires}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteReward(card.cardid)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <span className="text-4xl mb-4 block">🎁</span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards yet</h3>
                      <p className="text-gray-600 mb-4">Create your first reward to start attracting customers</p>
                      <button 
                        onClick={() => setShowCreateReward(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Create Your First Reward
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "business-info" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                    <button 
                      onClick={() => setShowEditBusiness(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Edit Business Information
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Business Name</label>
                          <p className="text-gray-900">{business.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Category</label>
                          <p className="text-gray-900">{business.category}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <p className="text-gray-900">{business.phone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="text-gray-900">{business.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <p className="text-gray-900">{business.address || "Not set"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <p className="text-gray-900">{business.city || "Not set"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <p className="text-gray-900">{business.state || "Not set"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                          <p className="text-gray-900">{business.zipCode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
                  
                  {analytics ? (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-green-600">Total Rewards</p>
                          <p className="text-2xl font-bold text-green-900">{analytics.totalRewards}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-600">Active Rewards</p>
                          <p className="text-2xl font-bold text-blue-900">{analytics.activeRewards}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-purple-600">Total Claims</p>
                          <p className="text-2xl font-bold text-purple-900">{analytics.totalClaims}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-orange-600">QR Scans</p>
                          <p className="text-2xl font-bold text-orange-900">{analytics.totalScans}</p>
                        </div>
                      </div>

                      {/* Claims by Month */}
                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Claims by Month</h3>
                        <div className="space-y-2">
                          {analytics.claimsByMonth.map((month) => (
                            <div key={month.month} className="flex justify-between items-center">
                              <span className="text-gray-600">{month.month}</span>
                              <span className="font-medium">{month.count} claims</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Claims */}
                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Claims</h3>
                        {analytics.recentClaims.length > 0 ? (
                          <div className="space-y-3">
                            {analytics.recentClaims.map((claim) => (
                              <div key={claim.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                                <div>
                                  <p className="font-medium text-gray-900">{claim.header}</p>
                                  <p className="text-sm text-gray-600">via {claim.delivery_method}</p>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(claim.claimed_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">No recent claims</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <span className="text-4xl mb-4 block">📊</span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics loading...</h3>
                      <p className="text-gray-600">Track your rewards performance and customer engagement</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "support" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Support & Help</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                      <p className="text-gray-600 mb-4">Get help with your QRewards business account</p>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Contact Support
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Getting Started Guide</li>
                        <li>• Best Practices</li>
                        <li>• FAQ</li>
                        <li>• Video Tutorials</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Reward Modal */}
      {showCreateReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Reward</h3>
            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reward Title</label>
                <input
                  type="text"
                  value={newReward.header}
                  onChange={(e) => setNewReward({...newReward, header: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={newReward.subheader}
                  onChange={(e) => setNewReward({...newReward, subheader: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={newReward.quantity}
                  onChange={(e) => setNewReward({...newReward, quantity: parseInt(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                <input
                  type="date"
                  value={newReward.expires}
                  onChange={(e) => setNewReward({...newReward, expires: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Create Reward
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateReward(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {showEditBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Business Information</h3>
            <form onSubmit={handleUpdateBusiness} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <input
                    type="text"
                    value={editBusiness.name}
                    onChange={(e) => setEditBusiness({...editBusiness, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={editBusiness.phone}
                    onChange={(e) => setEditBusiness({...editBusiness, phone: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editBusiness.email}
                    onChange={(e) => setEditBusiness({...editBusiness, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    value={editBusiness.zipCode}
                    onChange={(e) => setEditBusiness({...editBusiness, zipCode: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={editBusiness.address}
                    onChange={(e) => setEditBusiness({...editBusiness, address: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={editBusiness.city}
                    onChange={(e) => setEditBusiness({...editBusiness, city: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    value={editBusiness.state}
                    onChange={(e) => setEditBusiness({...editBusiness, state: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    value={editBusiness.website}
                    onChange={(e) => setEditBusiness({...editBusiness, website: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editBusiness.description}
                  onChange={(e) => setEditBusiness({...editBusiness, description: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Update Business
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditBusiness(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 