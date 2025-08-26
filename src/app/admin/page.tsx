"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoVideo from "@/components/LogoVideo";
import AdminPasswordChangeForm from "@/components/AdminPasswordChangeForm";

interface Signup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  status: string;
  createdAt: string;
}

interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  category: string;
  status: string;
  address: string;
  city: string;
  state: string;
  website: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
  approvedBy: string;
  businessUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
  }>;
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

type TabType = 'signups' | 'businesses' | 'analytics' | 'pending-updates';

interface SelectedItem {
  type: 'signup' | 'business';
  data: Signup | Business;
}

interface SignupWithType extends Signup {
  type?: 'signup';
}

interface BusinessAsSignup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  status: string;
  createdAt: string;
  type: 'business';
}

type SignupItem = SignupWithType | BusinessAsSignup;

interface PendingUpdate {
  id: string;
  businessId: string;
  userEmail: string;
  businessName: string;
  userFirstName: string;
  userLastName: string;
  currentData: string; // JSON string of current business data
  requestedUpdates: string; // JSON string of requested changes
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export default function AdminDashboard() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('signups');
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showBusinessEditModal, setShowBusinessEditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    zipCode: '',
    category: '',
    address: '',
    city: '',
    state: '',
    website: '',
    description: '',
    status: ''
  });

  // Analytics state
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('month');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('all');
  const [showAllBusinesses, setShowAllBusinesses] = useState<boolean>(true);
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  const [isLoadingPendingUpdates, setIsLoadingPendingUpdates] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Validate admin session with server
    const validateSession = async () => {
      try {
        const response = await fetch('/api/admin/validate-session');
        if (!response.ok) {
          // Session is invalid, redirect to login
          sessionStorage.removeItem('adminLoggedIn');
          sessionStorage.removeItem('adminUser');
          router.push('/admin/login');
          return;
        }
        
        // Session is valid, fetch data
        fetchAllSignups();
      } catch (error) {
        console.error('Session validation error:', error);
        // On error, redirect to login
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminUser');
        router.push('/admin/login');
      }
    };

    // Check if we have a session in sessionStorage first
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      router.push('/admin/login');
      return;
    }

    validateSession();
  }, [router]);

  // Fetch analytics when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'pending-updates') {
      fetchPendingUpdates();
    }
  }, [activeTab, selectedDateRange, selectedBusinessId, showAllBusinesses]);

  const fetchAllSignups = async () => {
    try {
      const response = await fetch('/api/admin/all-signups-simple');
      if (response.ok) {
        const data = await response.json();
        setSignups(data.signups || []);
        setBusinesses(data.businesses || []);
      } else {
        console.error('Failed to fetch signups');
      }
    } catch (error) {
      console.error('Error fetching signups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const params = new URLSearchParams({
        timeRange: selectedDateRange,
        businessId: selectedBusinessId,
        showAll: showAllBusinesses.toString()
      });
      
      const response = await fetch(`/api/admin/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchPendingUpdates = async () => {
    setIsLoadingPendingUpdates(true);
    try {
      console.log("🔍 Fetching pending updates from API...");
      const response = await fetch('/api/admin/pending-updates');
      console.log("🔍 API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("🔍 API response data:", data);
        
        if (data.pendingUpdates && data.pendingUpdates.length > 0) {
          console.log("✅ Found pending updates:", data.pendingUpdates.length);
          setPendingUpdates(data.pendingUpdates);
        } else {
          console.log("ℹ️ No pending updates found, keeping test data");
          // Keep existing test data if no real updates found
        }
      } else {
        console.error('❌ Failed to fetch pending updates, status:', response.status);
        // Keep existing test data on API failure
      }
    } catch (error) {
      console.error('❌ Error fetching pending updates:', error);
      // Keep existing test data on error
    } finally {
      setIsLoadingPendingUpdates(false);
    }
  };

  const handleUpdateAction = async (updateId: string, action: 'approve' | 'reject') => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/approve-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateId,
          action
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} update`);
      }

      alert(`Update ${action}ed successfully!`);
      fetchPendingUpdates(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing update:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${action} update`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = async (type: 'signup' | 'business', id: string, status: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/update-signup-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, id, status }),
      });

      if (response.ok) {
        // Refresh the data
        await fetchAllSignups();
        if (type === 'business' && editingBusiness) {
          setEditingBusiness(prev => prev ? { ...prev, status } : null);
          setEditFormData(prev => ({ ...prev, status }));
        }
        alert(`${type} status updated to ${status} successfully!`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || `Failed to update ${type} status`);
      }
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      alert(`Failed to update ${type} status`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (type: 'signup' | 'business', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/delete-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, id }),
      });

      if (response.ok) {
        // Refresh the data
        await fetchAllSignups();
        if (type === 'business') {
          setShowBusinessEditModal(false);
          setEditingBusiness(null);
        } else {
          setShowActionModal(false);
          setSelectedItem(null);
        }
        alert(`${type} deleted successfully!`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || `Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionModal = (item: Signup | Business, type: 'signup' | 'business') => {
    setSelectedItem({ type, data: item });
    setShowActionModal(true);
  };

  const openBusinessEditModal = (business: Business) => {
    setEditingBusiness(business);
    setEditFormData({
      name: business.name || '',
      phone: business.phone || '',
      email: business.email || '',
      zipCode: business.zipCode || '',
      category: business.category || '',
      address: business.address || '',
      city: business.city || '',
      state: business.state || '',
      website: business.website || '',
      description: business.description || '',
      status: business.status || ''
    });
    setShowBusinessEditModal(true);
  };

  const handleEditBusiness = async () => {
    if (!editingBusiness) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/update-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: editingBusiness.id,
          ...editFormData
        }),
      });

      if (response.ok) {
        await fetchAllSignups();
        alert('Business information updated successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update business information');
      }
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Failed to update business information');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoginAsBusiness = async () => {
    if (!editingBusiness) return;
    
    if (!confirm(`Are you sure you want to log in as ${editingBusiness.name}?`)) {
      return;
    }

    try {
      // Get the first business user for this business
      const response = await fetch('/api/admin/get-business-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId: editingBusiness.id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          // Store the business user data in session storage
          sessionStorage.setItem('businessUser', JSON.stringify(data.user));
          sessionStorage.setItem('businessData', JSON.stringify(editingBusiness));
          
          // Redirect to business dashboard
          router.push('/business/dashboard');
        } else {
          alert('No business user found for this business');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to get business user');
      }
    } catch (error) {
      console.error('Error logging in as business:', error);
      alert('Failed to log in as business');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('adminLoggedIn');
      sessionStorage.removeItem('adminUser');
      router.push('/admin/login');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredItems = () => {
    if (activeTab === 'signups') {
      // Include both signups and pending businesses in signups tab
      const allSignups = [...signups];
      const pendingBusinesses = businesses.filter(business => business.status === 'pending_approval');
      
      // Convert pending businesses to signup format for display
      const pendingBusinessesAsSignups: BusinessAsSignup[] = pendingBusinesses.map(business => ({
        id: business.id,
        firstName: business.name,
        lastName: '',
        email: business.email,
        phone: business.phone,
        businessName: business.name,
        businessAddress: business.address,
        businessCity: business.city,
        businessState: business.state,
        businessZip: business.zipCode,
        status: business.status,
        createdAt: business.createdAt,
        type: 'business'
      }));
      
      const allItems = [...allSignups, ...pendingBusinessesAsSignups];
      
      if (statusFilter === 'all') return allItems;
      return allItems.filter(item => item.status === statusFilter);
    } else {
      // Show all businesses in businesses tab, let status filter work properly
      if (statusFilter === 'all') return businesses;
      return businesses.filter(business => business.status === statusFilter);
    }
  };

  const getPendingSignupsCount = () => {
    const pendingSignups = signups.filter(signup => signup.status === 'pending').length;
    const pendingBusinesses = businesses.filter(business => business.status === 'pending_approval').length;
    return pendingSignups + pendingBusinesses;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
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
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Signup Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPasswordChangeForm(true)}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                Change Password
              </button>
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

      {/* Pending Notifications */}
      {getPendingSignupsCount() > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Pending approvals: {getPendingSignupsCount()} items need review
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('signups');
                  setStatusFilter('pending');
                }}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                View all pending
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('signups')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'signups'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Signups ({signups.length + businesses.filter(b => b.status === 'pending_approval').length})
                {getPendingSignupsCount() > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {getPendingSignupsCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('businesses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'businesses'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Businesses ({businesses.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics 📊
              </button>
              <button
                onClick={() => setActiveTab('pending-updates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending-updates'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Updates ({pendingUpdates.length})
                {pendingUpdates.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {pendingUpdates.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Status Filter */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'analytics' ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
              <p className="text-sm text-gray-600 mt-1">Comprehensive analytics across all businesses</p>
              
              {/* Analytics Filters */}
              <div className="mt-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Date Range:</label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="day">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Business:</label>
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Businesses</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">View:</label>
                  <select
                    value={showAllBusinesses ? 'all' : 'individual'}
                    onChange={(e) => setShowAllBusinesses(e.target.value === 'all')}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">Aggregated</option>
                    <option value="individual">Individual Businesses</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Analytics Content */}
            {isLoadingAnalytics ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading analytics...</p>
              </div>
            ) : analytics ? (
              <div className="p-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="text-2xl font-bold">{analytics.totalBusinesses}</div>
                    <div className="text-sm opacity-90">Total Businesses</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="text-2xl font-bold">{analytics.totalCardViews}</div>
                    <div className="text-sm opacity-90">Total Views</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="text-2xl font-bold">{analytics.totalClaims}</div>
                    <div className="text-sm opacity-90">Total Claims</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
                    <div className="text-sm opacity-90">Conversion Rate</div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Claims Over Time</h3>
                    <div className="h-64 flex items-end justify-center space-x-2">
                      {analytics.claimsByDay.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div 
                            className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                            style={{ height: `${Math.max(day.count * 10, 4)}px` }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
                    <div className="h-64 flex items-end justify-center space-x-2">
                      {analytics.viewsByDay.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div 
                            className="bg-blue-500 rounded-t-lg w-8 transition-all duration-300"
                            style={{ height: `${Math.max(day.count * 5, 4)}px` }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Performing Businesses */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Businesses</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claims</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.topPerformingBusinesses.map((business, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {business.businessName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {business.totalViews}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {business.totalClaims}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {business.conversionRate}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Individual Business Analytics */}
                {!showAllBusinesses && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Business Analytics</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rewards</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claims</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redeemed</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redemption</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics.businessAnalytics.map((business, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {business.businessName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.totalRewards} ({business.activeRewards} active)
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.totalViews}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.totalClaims}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.totalRedeemed}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.conversionRate}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {business.redemptionRate}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <span className="text-4xl mb-4 block">📊</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics data available</h3>
                <p className="text-gray-600">Analytics data will appear here once businesses start using the platform.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'pending-updates' ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Pending Profile Updates ({pendingUpdates.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Review and approve business profile update requests
              </p>
            </div>

            {isLoadingPendingUpdates ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading pending updates...</p>
              </div>
            ) : pendingUpdates.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl mb-4 block">✅</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending updates</h3>
                <p className="text-gray-600">All profile update requests have been processed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Changes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingUpdates.map((update) => (
                      <tr key={update.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {update.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {update.businessId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {update.userFirstName} {update.userLastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {update.userEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {(() => {
                              try {
                                const updates = JSON.parse(update.requestedUpdates) as Record<string, string>;
                                return Object.entries(updates).map(([field, value]) => (
                                  <div key={field} className="mb-1">
                                    <span className="font-medium">{field}:</span> {value}
                                  </div>
                                ));
                              } catch {
                                return <div className="text-red-500">Error parsing updates</div>;
                              }
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(update.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateAction(update.id, 'approve')}
                              disabled={isProcessing}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateAction(update.id, 'reject')}
                              disabled={isProcessing}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'signups' ? 'All Signups' : 'All Businesses'} ({getFilteredItems().length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === 'businesses' ? 'Click on any business to edit information, status, and login' : 'Manage and review all signups'}
              </p>
            </div>

          {getFilteredItems().length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-4 block">📋</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? `No ${activeTab} have been created yet.`
                  : `No ${activeTab} with status "${statusFilter}" found.`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'signups' ? 'Contact' : 'Business'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    {activeTab === 'signups' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredItems().map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-gray-50 ${
                        activeTab === 'businesses' ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (activeTab === 'businesses') {
                          openBusinessEditModal(item as Business);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {activeTab === 'signups' 
                              ? (item as SignupItem).type === 'business' 
                                ? (item as BusinessAsSignup).firstName // This is the business name
                                : `${(item as Signup).firstName} ${(item as Signup).lastName}`
                              : (item as Business).name
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.email}
                          </div>
                          {activeTab === 'signups' && (item as SignupItem).phone && (
                            <div className="text-sm text-gray-500">
                              {(item as SignupItem).phone}
                            </div>
                          )}
                          {activeTab === 'businesses' && (item as Business).phone && (
                            <div className="text-sm text-gray-500">
                              {(item as Business).phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {activeTab === 'signups' 
                            ? (item as SignupItem).type === 'business'
                              ? `${(item as BusinessAsSignup).businessCity}, ${(item as BusinessAsSignup).businessState}`
                              : `${(item as Signup).businessCity}, ${(item as Signup).businessState}`
                            : `${(item as Business).city}, ${(item as Business).state}`
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {activeTab === 'signups' 
                            ? (item as SignupItem).type === 'business'
                              ? (item as BusinessAsSignup).businessAddress
                              : (item as Signup).businessAddress
                            : (item as Business).address
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      {activeTab === 'signups' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const itemType = (item as SignupItem).type === 'business' ? 'business' : 'signup';
                              openActionModal(item, itemType);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Actions
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Action Modal for Signups */}
      {showActionModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manage {selectedItem.type === 'signup' ? 'Signup' : 'Business'}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {
                    selectedItem.type === 'signup' 
                      ? `${(selectedItem.data as Signup).firstName} ${(selectedItem.data as Signup).lastName}`
                      : (selectedItem.data as Business).name
                  }
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedItem.data.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {selectedItem.data.status}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handleStatusUpdate(selectedItem.type, selectedItem.data.id, 'approved')}
                  disabled={isProcessing}
                  className="bg-emerald-500 text-white px-3 py-2 rounded text-sm hover:bg-emerald-600 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedItem.type, selectedItem.data.id, 'rejected')}
                  disabled={isProcessing}
                  className="bg-rose-500 text-white px-3 py-2 rounded text-sm hover:bg-rose-600 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedItem.type, selectedItem.data.id, 'paused')}
                  disabled={isProcessing}
                  className="bg-amber-500 text-white px-3 py-2 rounded text-sm hover:bg-amber-600 disabled:opacity-50"
                >
                  Pause
                </button>
                <button
                  onClick={() => handleDelete(selectedItem.type, selectedItem.data.id)}
                  disabled={isProcessing}
                  className="bg-slate-500 text-white px-3 py-2 rounded text-sm hover:bg-slate-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
              
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedItem(null);
                }}
                className="w-full bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Business Edit Modal */}
      {showBusinessEditModal && editingBusiness && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  Edit Business: {editingBusiness.name}
                </h3>
                <button
                  onClick={() => {
                    setShowBusinessEditModal(false);
                    setEditingBusiness(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Management Section */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Status Management</h4>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-sm font-medium text-gray-700">Current Status:</span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(editingBusiness.status)}`}>
                    {editingBusiness.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleStatusUpdate('business', editingBusiness.id, 'approved')}
                    disabled={isProcessing || editingBusiness.status === 'approved'}
                    className="bg-emerald-500 text-white px-3 py-2 rounded text-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('business', editingBusiness.id, 'rejected')}
                    disabled={isProcessing || editingBusiness.status === 'rejected'}
                    className="bg-rose-500 text-white px-3 py-2 rounded text-sm hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('business', editingBusiness.id, 'paused')}
                    disabled={isProcessing || editingBusiness.status === 'paused'}
                    className="bg-amber-500 text-white px-3 py-2 rounded text-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('business', editingBusiness.id, 'pending_approval')}
                    disabled={isProcessing || editingBusiness.status === 'pending_approval'}
                    className="bg-sky-500 text-white px-3 py-2 rounded text-sm hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Set Pending
                  </button>
                </div>
              </div>

              {/* Business Information Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={editFormData.zipCode}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editFormData.website}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={editFormData.state}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex space-x-3">
                  <button
                    onClick={handleLoginAsBusiness}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                  >
                    🔐 Login As Business
                  </button>
                  <button
                    onClick={() => handleDelete('business', editingBusiness.id)}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-slate-500 text-white rounded-md hover:bg-slate-600 disabled:opacity-50 transition-colors"
                  >
                    🗑️ Delete Business
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowBusinessEditModal(false);
                      setEditingBusiness(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditBusiness}
                    disabled={isProcessing || !editFormData.name.trim() || !editFormData.email.trim()}
                    className="px-6 py-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Updating...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Form */}
      <AdminPasswordChangeForm
        isOpen={showPasswordChangeForm}
        onClose={() => setShowPasswordChangeForm(false)}
        onSuccess={() => {
          console.log('Password changed successfully');
        }}
      />
    </div>
  );
} 