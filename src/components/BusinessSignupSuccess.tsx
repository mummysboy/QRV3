"use client";

import { useState } from "react";

interface BusinessSignupSuccessProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessSignupSuccess({ isOpen, onClose }: BusinessSignupSuccessProps) {
  const [currentStep] = useState(0);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const steps = [
    {
      title: "Let&apos;s find your business",
      description: "We&apos;ll search our database to see if your business already exists.",
      icon: "🔍"
    },
    {
      title: "Business Profile Setup",
      description: "Add your business details, hours, and photos to complete your profile.",
      icon: "📝"
    },
    {
      title: "Review & Approval",
      description: "We&apos;ll review your business profile and approve it within 24 hours.",
      icon: "✅"
    },
    {
      title: "Start Creating Rewards",
      description: "Once approved, you&apos;ll have access to your business dashboard to create rewards.",
      icon: "🎉"
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="p-6 sm:p-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome to QRewards!
            </h2>

            <p className="text-gray-600 mb-8">
              Your business signup has been submitted successfully. Here's what happens next:
            </p>

            {/* Steps */}
            <div className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    currentStep === index 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentStep === index 
                        ? 'bg-green-500 scale-125' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  // TODO: Navigate to business profile setup
                  onClose();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Continue to Profile Setup
              </button>

              <button
                onClick={onClose}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-6 transition-colors"
              >
                I'll do this later
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              We&apos;ll send you an email with next steps and your login credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 