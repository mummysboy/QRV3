"use client";

import { useState } from "react";

interface BusinessSignupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusinessSignupData) => void;
}

export interface BusinessSignupData {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  category: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const BUSINESS_CATEGORIES = [
  "Restaurant",
  "Retail",
  "Fitness & Health",
  "Beauty & Salon",
  "Coffee & Tea",
  "Entertainment",
  "Professional Services",
  "Automotive",
  "Home & Garden",
  "Education",
  "Other"
];

export default function BusinessSignupForm({ isOpen, onClose, onSubmit }: BusinessSignupFormProps) {
  const [formData, setFormData] = useState<BusinessSignupData>({
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessZipCode: "",
    category: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Phone number formatting function
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number format
    const cleanPhone = formData.businessPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    // Validate zip code
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(formData.businessZipCode)) {
      alert("Please enter a valid zip code.");
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const finalCategory = formData.category === "Other" ? customCategory : formData.category;
      const submitData = {
        ...formData,
        category: finalCategory,
      };
      
      await onSubmit(submitData);
      // Reset form
      setFormData({
        businessName: "",
        businessPhone: "",
        businessAddress: "",
        businessCity: "",
        businessState: "",
        businessZipCode: "",
        category: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      });
      setCustomCategory("");
      setShowCustomCategory(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "businessPhone") {
      // Format phone number as user types
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else if (name === "category") {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      setShowCustomCategory(value === "Other");
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto mx-4">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Claim Your Business</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2"
              aria-label="Close form"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Business Information</h3>
              
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Phone Number *
                </label>
                <input
                  type="tel"
                  id="businessPhone"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />
              </div>

              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address *
                </label>
                <input
                  type="text"
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="businessCity" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="businessCity"
                    name="businessCity"
                    value={formData.businessCity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <label htmlFor="businessState" className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    id="businessState"
                    name="businessState"
                    value={formData.businessState}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label htmlFor="businessZipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="businessZipCode"
                    name="businessZipCode"
                    value={formData.businessZipCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                    placeholder="12345"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                >
                  <option value="">Select a category</option>
                  {BUSINESS_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {showCustomCategory && (
                <div>
                  <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Category *
                  </label>
                  <input
                    type="text"
                    id="customCategory"
                    name="customCategory"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                    placeholder="Enter your business category"
                  />
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="space-y-4 pt-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Account Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                  placeholder="At least 8 characters"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>
            </div>

            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none text-base"
              >
                {isSubmitting ? "Submitting..." : "Get Started"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    // TODO: Navigate to login page
                  }}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 