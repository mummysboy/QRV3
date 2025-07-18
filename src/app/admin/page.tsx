"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoVideo from "@/components/LogoVideo";

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

type TabType = 'signups' | 'businesses';

interface SelectedItem {
  type: 'signup' | 'business';
  data: Signup | Business;
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
    const items = activeTab === 'signups' ? signups : businesses;
    if (statusFilter === 'all') return items;
    return items.filter(item => item.status === statusFilter);
  };

  const getPendingBusinessesCount = () => {
    return businesses.filter(business => business.status === 'pending_approval').length;
  };

  const getPendingSignupsCount = () => {
    return signups.filter(signup => signup.status === 'pending').length;
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
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Pending Notifications */}
      {(getPendingBusinessesCount() > 0 || getPendingSignupsCount() > 0) && (
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
                    Pending approvals: {getPendingBusinessesCount()} businesses, {getPendingSignupsCount()} signups
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusFilter('pending')}
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
                Signups ({signups.length})
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
                {getPendingBusinessesCount() > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {getPendingBusinessesCount()}
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
                              ? `${(item as Signup).firstName} ${(item as Signup).lastName}`
                              : (item as Business).name
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.email}
                          </div>
                          {activeTab === 'signups' && (item as Signup).phone && (
                            <div className="text-sm text-gray-500">
                              {(item as Signup).phone}
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
                            ? `${(item as Signup).businessCity}, ${(item as Signup).businessState}`
                            : `${(item as Business).city}, ${(item as Business).state}`
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {activeTab === 'signups' 
                            ? (item as Signup).businessAddress
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
                              openActionModal(item, 'signup');
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
                  className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedItem.type, selectedItem.data.id, 'rejected')}
                  disabled={isProcessing}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedItem.type, selectedItem.data.id, 'paused')}
                  disabled={isProcessing}
                  className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                >
                  Pause
                </button>
                <button
                  onClick={() => handleDelete(selectedItem.type, selectedItem.data.id)}
                  disabled={isProcessing}
                  className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
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
                    className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('business', editingBusiness.id, 'rejected')}
                    disabled={isProcessing || editingBusiness.status === 'rejected'}
                    className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('business', editingBusiness.id, 'paused')}
                    disabled={isProcessing || editingBusiness.status === 'paused'}
                    className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('business', editingBusiness.id, 'pending_approval')}
                    disabled={isProcessing || editingBusiness.status === 'pending_approval'}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    🔐 Login As Business
                  </button>
                  <button
                    onClick={() => handleDelete('business', editingBusiness.id)}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
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
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? 'Updating...' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 