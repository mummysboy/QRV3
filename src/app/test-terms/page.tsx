"use client";

import { useState } from "react";

export default function TestTermsPage() {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test the Terms and Conditions Integration</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Direct Link Test</h3>
              <a 
                href="/terms-and-conditions.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline"
              >
                Open Terms and Conditions in New Tab
              </a>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. Modal Test</h3>
              <button
                onClick={() => setShowTerms(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Open Terms in Modal
              </button>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Business Signup Form Test</h3>
              <a 
                href="/business/signup" 
                className="text-green-600 hover:text-green-700 underline"
              >
                Go to Business Signup Form
              </a>
            </div>
          </div>
        </div>

        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
                  <button
                    onClick={() => setShowTerms(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <iframe 
                  src="/terms-and-conditions.html" 
                  className="w-full h-[70vh] border-0"
                  title="Terms and Conditions"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 