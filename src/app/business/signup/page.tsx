"use client";

import { useState } from "react";
import Link from "next/link";
import LogoVideo from "@/components/LogoVideo";
import BusinessSignupForm, { BusinessSignupData } from "@/components/BusinessSignupForm";
import BusinessSignupSuccess from "@/components/BusinessSignupSuccess";

export default function BusinessSignup() {
  const [showSignupForm, setShowSignupForm] = useState(true);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  const handleSignupSubmit = async (data: BusinessSignupData) => {
    try {
      const response = await fetch('/api/business-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit business signup');
      }

      setShowSignupForm(false);
      setShowSignupSuccess(true);
    } catch (error) {
      console.error('Error submitting business signup:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit business signup. Please try again.');
    }
  };

  const handleCloseSignupForm = () => {
    setShowSignupForm(false);
    // Redirect to home page
    window.location.href = '/';
  };

  const handleCloseSignupSuccess = () => {
    setShowSignupSuccess(false);
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <LogoVideo />
            </Link>
            <Link 
              href="/business/login"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Claim Your Business
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join thousands of businesses using QRewards to attract customers
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Started in Minutes
              </h3>
              <p className="text-gray-600 text-sm">
                Create your business profile and start attracting customers with QR rewards
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">1</span>
                </div>
                <span className="text-sm text-gray-700">Enter your business information</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">2</span>
                </div>
                <span className="text-sm text-gray-700">Complete your business profile</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">3</span>
                </div>
                <span className="text-sm text-gray-700">Start creating rewards</span>
              </div>
            </div>

            <button
              onClick={() => setShowSignupForm(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Get Started Now
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Free to start • No setup fees • Cancel anytime
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/business/login" className="font-medium text-green-600 hover:text-green-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Business Signup Form Modal */}
      <BusinessSignupForm
        isOpen={showSignupForm}
        onClose={handleCloseSignupForm}
        onSubmit={handleSignupSubmit}
      />

      {/* Business Signup Success Modal */}
      <BusinessSignupSuccess
        isOpen={showSignupSuccess}
        onClose={handleCloseSignupSuccess}
      />
    </div>
  );
} 