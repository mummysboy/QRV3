"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoVideo from "@/components/LogoVideo";

interface PendingBusiness {
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
  createdAt: string;
  businessUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export default function AdminDashboard() {
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<PendingBusiness | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!adminLoggedIn) {
      router.push('/admin/login');
      return;
    }
    
    fetchPendingBusinesses();
  }, [router]);

  const fetchPendingBusinesses = async () => {
    try {
      const response = await fetch('/api/admin/pending-businesses');
      if (response.ok) {
        const data = await response.json();
        setPendingBusinesses(data.businesses);
      } else {
        console.error('Failed to fetch pending businesses');
      }
    } catch (error) {
      console.error('Error fetching pending businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (businessId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/approve-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      });

      if (response.ok) {
        // Remove from pending list
        setPendingBusinesses(prev => prev.filter(b => b.id !== businessId));
        setShowApprovalModal(false);
        setSelectedBusiness(null);
        alert('Business approved successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to approve business');
      }
    } catch (error) {
      console.error('Error approving business:', error);
      alert('Failed to approve business');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (businessId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/reject-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      });

      if (response.ok) {
        // Remove from pending list
        setPendingBusinesses(prev => prev.filter(b => b.id !== businessId));
        setShowApprovalModal(false);
        setSelectedBusiness(null);
        alert('Business rejected successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to reject business');
      }
    } catch (error) {
      console.error('Error rejecting business:', error);
      alert('Failed to reject business');
    } finally {
      setIsProcessing(false);
    }
  };

  const openApprovalModal = (business: PendingBusiness) => {
    setSelectedBusiness(business);
    setShowApprovalModal(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
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
                <p className="text-sm text-gray-600">Business Approval System</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Business Approvals ({pendingBusinesses.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve new business applications
            </p>
          </div>

          {pendingBusinesses.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-4 block">✅</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending approvals</h3>
              <p className="text-gray-600">All business applications have been reviewed.</p>
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
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{business.name}</div>
                          <div className="text-sm text-gray-500">{business.category}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{business.email}</div>
                          <div className="text-sm text-gray-500">{business.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {business.city}, {business.state} {business.zipCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(business.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openApprovalModal(business)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review Business Application
                </h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Business Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedBusiness.name}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {selectedBusiness.category}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedBusiness.phone}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedBusiness.email}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Location</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Address:</span> {selectedBusiness.address || "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">City:</span> {selectedBusiness.city || "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">State:</span> {selectedBusiness.state || "Not provided"}
                    </div>
                    <div>
                      <span className="font-medium">ZIP:</span> {selectedBusiness.zipCode}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Business Owner</h4>
                {selectedBusiness.businessUsers.map((user) => (
                  <div key={user.id} className="text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {user.email}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Application Details</h4>
                <div className="text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Submitted:</span> {new Date(selectedBusiness.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedBusiness.id)}
                disabled={isProcessing}
                className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Rejecting..." : "Reject"}
              </button>
              <button
                onClick={() => handleApprove(selectedBusiness.id)}
                disabled={isProcessing}
                className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 