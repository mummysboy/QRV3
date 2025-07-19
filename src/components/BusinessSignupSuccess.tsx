"use client";

import { useState } from "react";
import { CheckCircle, Search, FileText, Gift } from "lucide-react";

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
      icon: Search
    },
    {
      title: "Business Profile Setup",
      description: "Add your business details, hours, and photos to complete your profile.",
      icon: FileText
    },
    {
      title: "Review & Approval",
      description: "We&apos;ll review your business profile and approve it within 24 hours.",
      icon: CheckCircle
    },
    {
      title: "Start Creating Rewards",
      description: "Once approved, you&apos;ll have access to your business dashboard to create rewards.",
      icon: Gift
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
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome to QRewards!
            </h2>

            <p className="text-gray-600 mb-8">
              Your business signup has been submitted successfully. Here&apos;s what happens next:
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
                  <div className="flex-shrink-0">
                    <step.icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center space-x-2 mb-8">
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

            {/* CTA Button */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 