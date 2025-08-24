"use client";

import React, { useState } from "react";
import { useNotifications } from "@/components/NotificationProvider";
import Header from "@/components/Header";

interface NeighborhoodStatus {
  total: number;
  withNeighborhood: number;
  withoutNeighborhood: number;
  missingAddress: number;
  businesses: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    neighborhood: string;
    hasNeighborhood: boolean;
    missingAddress: boolean;
    status: string;
    createdAt: string;
  }>;
}

interface UpdateResult {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
  details: Array<{
    id: string;
    name: string;
    oldNeighborhood?: string;
    newNeighborhood: string;
    status: 'updated' | 'skipped' | 'error';
    error?: string;
  }>;
}

export default function NeighborhoodManagement() {
  const [status, setStatus] = useState<NeighborhoodStatus | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const checkNeighborhoodStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/check-neighborhood-status');
      const data = await response.json();
      
      if (response.ok) {
        setStatus(data.analysis);
        showSuccess('Status Check Complete', data.message);
      } else {
        throw new Error(data.error || 'Failed to check status');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      showError('Status Check Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAllNeighborhoods = async () => {
    if (!confirm('This will detect and update neighborhoods for all businesses that don\'t have them. Continue?')) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/update-all-neighborhoods', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        setUpdateResult(data.results);
        showSuccess('Update Complete', data.message);
        // Refresh status after update
        await checkNeighborhoodStatus();
      } else {
        throw new Error(data.error || 'Failed to update neighborhoods');
      }
    } catch (error) {
      console.error('Error updating neighborhoods:', error);
      showError('Update Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onContactClick={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Neighborhood Management</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Check Section */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">Check Current Status</h2>
              <p className="text-blue-700 mb-4">
                Check the current neighborhood status of all businesses in the system.
              </p>
              <button
                onClick={checkNeighborhoodStatus}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                {isLoading ? 'Checking...' : 'Check Status'}
              </button>
            </div>

            {/* Update Section */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">Update All Neighborhoods</h2>
              <p className="text-green-700 mb-4">
                Automatically detect and update neighborhoods for all businesses that don't have them.
              </p>
              <button
                onClick={updateAllNeighborhoods}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                {isUpdating ? 'Updating...' : 'Update All Neighborhoods'}
              </button>
            </div>
          </div>

          {/* Status Display */}
          {status && (
            <div className="mt-8 bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{status.total}</div>
                  <div className="text-sm text-blue-600">Total Businesses</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{status.withNeighborhood}</div>
                  <div className="text-sm text-green-600">With Neighborhood</div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{status.withoutNeighborhood}</div>
                  <div className="text-sm text-yellow-600">Without Neighborhood</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{status.missingAddress}</div>
                  <div className="text-sm text-red-600">Missing Address</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neighborhood</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {status.businesses.map((business) => (
                      <tr key={business.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{business.name}</div>
                          <div className="text-sm text-gray-500">{business.status}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {business.address}, {business.city}, {business.state} {business.zipCode}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            business.hasNeighborhood 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {business.hasNeighborhood ? business.neighborhood : 'Missing'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            business.missingAddress 
                              ? 'bg-red-100 text-red-800' 
                              : business.hasNeighborhood 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {business.missingAddress ? 'Missing Address' : business.hasNeighborhood ? 'Complete' : 'Needs Update'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Update Results Display */}
          {updateResult && (
            <div className="mt-8 bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{updateResult.total}</div>
                  <div className="text-sm text-blue-600">Total Processed</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{updateResult.updated}</div>
                  <div className="text-sm text-green-600">Updated</div>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{updateResult.skipped}</div>
                  <div className="text-sm text-yellow-600">Skipped</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{updateResult.errors}</div>
                  <div className="text-sm text-red-600">Errors</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Neighborhood</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Neighborhood</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {updateResult.details.map((detail) => (
                      <tr key={detail.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{detail.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{detail.oldNeighborhood || 'None'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{detail.newNeighborhood}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            detail.status === 'updated' 
                              ? 'bg-green-100 text-green-800' 
                              : detail.status === 'skipped'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                            {detail.error && `: ${detail.error}`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
