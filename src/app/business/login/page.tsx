"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoVideo from "@/components/LogoVideo";
import { detectSQLInjection, showSQLInjectionPopup } from "@/utils/sqlInjectionDetector";

export default function BusinessLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auto-redirect if session cookie is present
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/business/check-session');
        const data = await response.json();
        
        if (data.hasSession) {
          console.log('🔍 Login - Valid session found, redirecting to dashboard');
          window.location.replace('/business/dashboard');
        }
      } catch (error) {
        console.error('🔍 Login - Error checking session:', error);
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for SQL injection attempts in all form fields
    const allFields = Object.values(formData).join(' ');
    if (detectSQLInjection(allFields)) {
      showSQLInjectionPopup();
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/business-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      console.log('🔍 Login - Response data:', data);
      
      // Store the sessionToken in sessionStorage for dashboard use
      if (data.sessionToken) {
        sessionStorage.setItem('businessSessionToken', data.sessionToken);
        console.log('💾 Stored sessionToken in sessionStorage');
      }
      
      // Store user data in sessionStorage for dashboard access
      if (data.user) {
        sessionStorage.setItem('businessUser', JSON.stringify(data.user));
        console.log('💾 Stored user data in sessionStorage:', data.user);
      }
      
      // Store primary business data in sessionStorage for dashboard access
      if (data.business) {
        sessionStorage.setItem('businessData', JSON.stringify(data.business));
        console.log('💾 Stored business data in sessionStorage:', data.business);
      }
      
      // Store all businesses for business switching functionality
      if (data.allBusinesses) {
        sessionStorage.setItem('allBusinesses', JSON.stringify(data.allBusinesses));
        console.log('💾 Stored all businesses in sessionStorage:', data.allBusinesses.length, 'businesses');
      }
      
      // Store total business count
      if (data.totalBusinesses) {
        sessionStorage.setItem('totalBusinesses', data.totalBusinesses.toString());
        console.log('💾 Stored total business count in sessionStorage:', data.totalBusinesses);
      }
      
      console.log('✅ Login successful, redirecting to dashboard...');
      window.location.replace('/business/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove consent logic from login page
  // const handleConsentAccept = async () => {
  //   if (!pendingSessionToken) return;
  //   // Call set-session API to set the cookie
  //   await fetch('/api/business/set-session', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ sessionToken: pendingSessionToken }),
  //   });
  //   setShowConsent(false);
  //   setPendingSessionToken(null);
  //   router.replace('/business/dashboard');
  // };
  // const handleConsentDeny = () => {
  //   setShowConsent(false);
  //   setPendingSessionToken(null);
  //   // Optionally, show a message or stay on login
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24">
      {/* Logo Section - Positioned below global header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-4">
            <Link href="/" className="flex items-center justify-center w-full">
              <LogoVideo />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your business
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Access your QRewards business dashboard
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/business/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/business/signup" className="font-medium text-green-600 hover:text-green-500">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      {/* Remove consent banner rendering from login page */}
    </div>
  );
} 