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

export default function BusinessDashboard() {
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
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
    } catch (error) {
      console.error('Error parsing session data:', error);
      router.push('/business/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('businessUser');
    sessionStorage.removeItem('businessData');
    router.push('/business/login');
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
                            <p className="text-2xl font-bold text-gray-900">0</p>
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
                            <p className="text-2xl font-bold text-gray-900">0</p>
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
                            <p className="text-2xl font-bold text-gray-900">0</p>
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
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-600">No recent activity yet</p>
                      <p className="text-sm text-gray-500 mt-2">Start creating rewards to see activity here</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "rewards" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Create Reward
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <span className="text-4xl mb-4 block">🎁</span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards yet</h3>
                    <p className="text-gray-600 mb-4">Create your first reward to start attracting customers</p>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      Create Your First Reward
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "business-info" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
                  
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
                  
                  <div className="mt-6">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Edit Business Information
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <span className="text-4xl mb-4 block">📊</span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics coming soon</h3>
                    <p className="text-gray-600">Track your rewards performance and customer engagement</p>
                  </div>
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
    </div>
  );
} 