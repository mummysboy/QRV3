"use client";

import { useState } from 'react';

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    summary?: {
      businessUsersDeleted: number;
      businessesDeleted: number;
      signupsDeleted: number;
      cardsDeleted: number;
      claimedRewardsDeleted: number;
      cardViewsDeleted: number;
      errors: string[];
    };
    preservedUsers?: Array<{ email: string; businessId: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState('');

  const handleCleanup = async () => {
    if (confirmation !== 'YES_DELETE_ALL') {
      setError('Please type YES_DELETE_ALL to confirm');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/cleanup-businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: confirmation })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to perform cleanup');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🧹 Business Cleanup
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    ⚠️ DANGEROUS OPERATION
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      This will permanently delete ALL business accounts except:
                    </p>
                    <ul className="list-disc list-inside mt-2">
                      <li><strong>isaac@rightimagedigital.com</strong></li>
                      <li><strong>gwbn.mariadaniel@gmail.com</strong></li>
                    </ul>
                    <p className="mt-2">
                      This includes all associated rewards, claimed rewards, and analytics data.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                Type &quot;YES_DELETE_ALL&quot; to confirm:
              </label>
              <input
                type="text"
                id="confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="YES_DELETE_ALL"
              />
            </div>

            <button
              onClick={handleCleanup}
              disabled={isLoading || confirmation !== 'YES_DELETE_ALL'}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                isLoading || confirmation !== 'YES_DELETE_ALL'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              }`}
            >
              {isLoading ? '🧹 Cleaning up...' : '🗑️ Delete All Businesses'}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p className="font-medium">{result.message}</p>
                      {result.summary && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Deletion Summary:</h4>
                                                     <ul className="list-disc list-inside space-y-1">
                             <li>Business Users: {result.summary.businessUsersDeleted}</li>
                             <li>Businesses: {result.summary.businessesDeleted}</li>
                             <li>Signups: {result.summary.signupsDeleted}</li>
                             <li>Cards/Rewards: {result.summary.cardsDeleted}</li>
                             <li>Claimed Rewards: {result.summary.claimedRewardsDeleted}</li>
                             <li>Card Views: {result.summary.cardViewsDeleted}</li>
                           </ul>
                          {result.summary.errors.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-red-800 mb-2">Errors ({result.summary.errors.length}):</h4>
                              <ul className="list-disc list-inside space-y-1 text-red-700">
                                {result.summary.errors.map((error: string, index: number) => (
                                  <li key={index} className="text-xs">{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {result.preservedUsers && result.preservedUsers.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Preserved Users:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {result.preservedUsers.map((user, index) => (
                              <li key={index}>{user.email} (Business ID: {user.businessId})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 