"use client";

import { useState, useEffect } from "react";
import { detectSQLInjection, showSQLInjectionPopup } from "@/utils/sqlInjectionDetector";

interface AddBusinessFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddBusinessData) => void;
}

export interface AddBusinessData {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  category: string;
}

interface FieldErrors {
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessZipCode?: string;
  category?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  customCategory?: string;
  general?: string;
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

export default function AddBusinessForm({ isOpen, onClose, onSubmit }: AddBusinessFormProps) {
  const [formData, setFormData] = useState<AddBusinessData>({
    businessName: "",
    businessPhone: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessZipCode: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setFadeIn(true), 10);
    } else {
      setFadeIn(false);
    }
    return () => setFadeIn(false);
  }, [isOpen]);

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

  // Clear field errors when user starts typing
  const clearFieldError = (fieldName: keyof FieldErrors) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Validate individual field
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'businessPhone':
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
          return "Please enter a valid 10-digit phone number.";
        }
        break;
      case 'businessZipCode':
        const zipCodeRegex = /^\d{5}(-\d{4})?$/;
        if (!zipCodeRegex.test(value)) {
          return "Please enter a valid ZIP code.";
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address.";
        }
        break;
      case 'businessState':
        if (value.length !== 2) {
          return "Please enter a 2-letter state code (e.g., CA, NY).";
        }
        break;
      case 'customCategory':
        if (showCustomCategory && value.trim().length === 0) {
          return "Please enter a custom category.";
        }
        break;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    
    // Check for SQL injection attempts in all form fields
    const allFields = Object.values(formData).join(' ') + (customCategory ? ' ' + customCategory : '');
    if (detectSQLInjection(allFields)) {
      showSQLInjectionPopup();
      return;
    }
    
    // Validate all fields
    const errors: FieldErrors = {};
    let hasErrors = false;

    // Check required fields
    const requiredFields: (keyof AddBusinessData)[] = [
      'businessName', 'businessPhone', 'businessAddress', 'businessCity', 
      'businessState', 'businessZipCode', 'category'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `This field is required.`;
        hasErrors = true;
      }
    });

    // Check custom category if "Other" is selected
    if (formData.category === "Other" && (!customCategory || customCategory.trim() === '')) {
      errors.customCategory = "Please enter a custom category.";
      hasErrors = true;
    }

    // Validate specific fields
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof AddBusinessData;
      const value = formData[fieldName];
      const error = validateField(key, value);
      if (error) {
        errors[fieldName] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setFieldErrors(errors);
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
      });
      setCustomCategory("");
      setShowCustomCategory(false);
    } catch (error) {
      console.error('Error submitting business:', error);
      setFieldErrors({ general: error instanceof Error ? error.message : 'Failed to submit business' });
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
      clearFieldError('customCategory');
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear field error when user starts typing
    clearFieldError(name as keyof FieldErrors);
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setFadeIn(false);
      setTimeout(onClose, 500); // match transition duration
    }
  };

  // Helper function to get error styling for input fields
  const getInputErrorStyle = (fieldName: keyof FieldErrors) => {
    return fieldErrors[fieldName] 
      ? "border-red-500 focus:border-red-500" 
      : "border-gray-300 focus:border-green-500";
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 transition-colors duration-500 ${fadeIn ? 'bg-neutral-100/80' : 'bg-neutral-100/0'}`} style={{ backdropFilter: 'blur(4px)' }} onClick={handleBackdropClick}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-all duration-500 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Add New Business</h2>
            <button
              onClick={() => {
                setFadeIn(false);
                setTimeout(onClose, 500);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2"
              aria-label="Close form"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* General error message */}
          {fieldErrors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
              {fieldErrors.general}
            </div>
          )}

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
                  className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none transition-colors text-base ${getInputErrorStyle('businessName')}`}
                  placeholder="Your Business Name"
                />
                {fieldErrors.businessName && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.businessName}</p>
                )}
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
                  className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none transition-colors text-base ${getInputErrorStyle('businessPhone')}`}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />
                {fieldErrors.businessPhone && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.businessPhone}</p>
                )}
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
                  className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none transition-colors text-base ${getInputErrorStyle('businessAddress')}`}
                  placeholder="123 Main Street"
                />
                {fieldErrors.businessAddress && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.businessAddress}</p>
                )}
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
                    className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none transition-colors text-base ${getInputErrorStyle('businessCity')}`}
                    placeholder="City"
                  />
                  {fieldErrors.businessCity && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.businessCity}</p>
                  )}
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
                    className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none transition-colors text-base ${getInputErrorStyle('businessState')}`}
                    placeholder="CA"
                    maxLength={2}
                  />
                  {fieldErrors.businessState && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.businessState}</p>
                  )}
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
                    className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none transition-colors text-base ${getInputErrorStyle('businessZipCode')}`}
                    placeholder="90210"
                    maxLength={10}
                  />
                  {fieldErrors.businessZipCode && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.businessZipCode}</p>
                  )}
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
                  className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none transition-colors text-base ${getInputErrorStyle('category')}`}
                >
                  <option value="">Select a category</option>
                  {BUSINESS_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.category}</p>
                )}
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
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      clearFieldError('customCategory');
                    }}
                    required
                    className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:outline-none transition-colors text-base ${getInputErrorStyle('customCategory')}`}
                    placeholder="Enter your custom category"
                  />
                  {fieldErrors.customCategory && (
                    <p className="text-red-600 text-xs mt-1">{fieldErrors.customCategory}</p>
                  )}
                </div>
              )}
            </div>



            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Add Business"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 