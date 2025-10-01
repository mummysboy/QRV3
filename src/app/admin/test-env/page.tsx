"use client";

import { useState, useEffect } from 'react';

interface EnvTestResult {
  success: boolean;
  environment: {
    nodeEnv: string;
    isProduction: boolean;
  };
  environmentVariables: {
    hasAdminEmail: boolean;
    hasAdminPassword: boolean;
    hasJwtSecret: boolean;
    adminEmail: string;
    adminPasswordSet: string;
    jwtSecretSet: string;
  };
  credentialsSource: {
    usingEnvVars: boolean;
    usingFileSystem: boolean;
    usingDefaults: boolean;
    currentEmail: string;
    currentPasswordSet: string;
  };
  cookieSettings: {
    secure: boolean;
    sameSite: string;
    httpOnly: boolean;
  };
  recommendations: {
    needsEnvVars: boolean;
    missingVars: string[];
  };
  error?: string;
}

export default function TestEnvironmentPage() {
  const [result, setResult] = useState<EnvTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/test-env');
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to run test');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusText = (status: boolean) => {
    return status ? '✅ SET' : '❌ NOT SET';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Environment Test</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Test environment variables and configuration for admin authentication
                </p>
              </div>
              <button
                onClick={runTest}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Testing...' : 'Run Test'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Running environment test...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Test Failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Environment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Environment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Node Environment:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${result.environment.isProduction ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {result.environment.nodeEnv}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Production Mode:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${result.environment.isProduction ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {result.environment.isProduction ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Environment Variables */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Environment Variables</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">ADMIN_EMAIL:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.environmentVariables.hasAdminEmail)}`}>
                        {getStatusText(result.environmentVariables.hasAdminEmail)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">ADMIN_PASSWORD:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.environmentVariables.hasAdminPassword)}`}>
                        {getStatusText(result.environmentVariables.hasAdminPassword)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">JWT_SECRET:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.environmentVariables.hasJwtSecret)}`}>
                        {getStatusText(result.environmentVariables.hasJwtSecret)}
                      </span>
                    </div>
                    {result.environmentVariables.hasAdminEmail && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Admin Email:</span>
                        <span className="text-sm text-gray-600">{result.environmentVariables.adminEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Credentials Source */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Credentials Source</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Using Environment Variables:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.credentialsSource.usingEnvVars)}`}>
                        {getStatusText(result.credentialsSource.usingEnvVars)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Using File System:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.credentialsSource.usingFileSystem)}`}>
                        {getStatusText(result.credentialsSource.usingFileSystem)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Using Defaults:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.credentialsSource.usingDefaults)}`}>
                        {getStatusText(result.credentialsSource.usingDefaults)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Current Email:</span>
                      <span className="text-sm text-gray-600">{result.credentialsSource.currentEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Cookie Settings */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Secure:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.cookieSettings.secure)}`}>
                        {result.cookieSettings.secure ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">SameSite:</span>
                      <span className="text-sm text-gray-600">{result.cookieSettings.sameSite}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">HttpOnly:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.cookieSettings.httpOnly)}`}>
                        {result.cookieSettings.httpOnly ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {result.recommendations.needsEnvVars && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p className="font-medium">Missing environment variables:</p>
                          <ul className="mt-1 list-disc list-inside">
                            {result.recommendations.missingVars.map((variable, index) => (
                              <li key={index}>{variable}</li>
                            ))}
                          </ul>
                          <p className="mt-2">
                            Set these environment variables in your hosting platform to enable admin login.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!result.recommendations.needsEnvVars && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Configuration Complete</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>All required environment variables are set. Admin login should work properly.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
