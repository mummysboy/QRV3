"use client";

import { useState } from "react";

interface CreateRewardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RewardData) => void;
  business: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    category: string;
    logo?: string;
  };
  isProfileComplete: boolean;
}

export interface RewardData {
  businessId: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  businessCategory: string;
  businessLogo?: string;
  subheader: string;
  quantity: number;
  expires: string;
}

export default function CreateRewardForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  business, 
  isProfileComplete 
}: CreateRewardFormProps) {
  const [formData, setFormData] = useState<RewardData>({
    businessId: business.id,
    businessName: business.name,
    businessAddress: business.address,
    businessCity: business.city,
    businessState: business.state,
    businessZipCode: business.zipCode,
    businessCategory: business.category,
    businessLogo: business.logo,
    subheader: "",
    quantity: 100, // Default quantity
    expires: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isProfileComplete) {
      alert("Please complete your business profile by uploading a logo before creating rewards.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        businessId: business.id,
        businessName: business.name,
        businessAddress: business.address,
        businessCity: business.city,
        businessState: business.state,
        businessZipCode: business.zipCode,
        businessCategory: business.category,
        businessLogo: business.logo,
        subheader: "",
        quantity: 100,
        expires: "",
      });
    } catch (error) {
      console.error("Error creating reward:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Only allow editing of subheader (description) and expires (expiration date)
    if (name === "subheader" || name === "expires") {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatExpirationDate = (dateString: string) => {
    if (!dateString) return "No expiration date set";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto mx-4">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Create New Reward</h2>
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

          {/* Profile Completion Warning */}
          {!isProfileComplete && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Profile Incomplete
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Please upload your business logo to start creating rewards.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pre-filled Business Information (Read-only) */}
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Business Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      disabled
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address
                    </label>
                    <input
                      type="text"
                      value={`${formData.businessAddress}, ${formData.businessCity}, ${formData.businessState} ${formData.businessZipCode}`}
                      disabled
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.businessCategory}
                      disabled
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Editable Reward Information */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Reward Details</h3>
                  
                  <div>
                    <label htmlFor="subheader" className="block text-sm font-medium text-gray-700 mb-1">
                      Reward Description *
                    </label>
                    <textarea
                      id="subheader"
                      name="subheader"
                      value={formData.subheader}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base resize-none"
                      placeholder="Describe your reward offer (e.g., Get a free coffee with any purchase, 20% off your next visit, Buy one get one free)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tell customers what they&apos;ll receive</p>
                  </div>

                  <div>
                    <label htmlFor="expires" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date & Time
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        id="expires"
                        name="expires"
                        value={formData.expires}
                        onChange={handleInputChange}
                        min={getMinDateTime()}
                        className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.expires ? `Expires: ${formatExpirationDate(formData.expires)}` : "Leave empty for no expiration"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Available
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      disabled
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default quantity: 100 rewards</p>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-base"
                  >
                    Preview Reward
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !isProfileComplete || !formData.subheader.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none text-base"
                  >
                    {isSubmitting ? "Creating..." : "Create Reward"}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className="hidden lg:block">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto">
                  {/* Business Logo */}
                  {formData.businessLogo ? (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={formData.businessLogo} 
                        alt={`${formData.businessName} logo`}
                        className="h-16 w-16 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">🏢</span>
                      </div>
                    </div>
                  )}

                  {/* Business Info */}
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-gray-900">{formData.businessName}</h4>
                    <p className="text-sm text-gray-600">{formData.businessCategory}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.businessAddress}, {formData.businessCity}, {formData.businessState} {formData.businessZipCode}
                    </p>
                  </div>

                  {/* Reward Info */}
                  <div className="border-t pt-4">
                    <h5 className="font-bold text-lg text-gray-900 mb-2">
                      {formData.businessName}
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      {formData.subheader || "Reward description will appear here"}
                    </p>
                    
                    <div className="flex justify-between text-sm text-gray-500 mb-3">
                      <span>Quantity: {formData.quantity}</span>
                      <span>Expires: {formData.expires ? formatExpirationDate(formData.expires) : "No expiration"}</span>
                    </div>

                    <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium">
                      Claim Reward
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reward Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                {/* Business Logo */}
                {formData.businessLogo ? (
                  <div className="flex justify-center mb-3">
                    <img 
                      src={formData.businessLogo} 
                      alt={`${formData.businessName} logo`}
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center mb-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xl">🏢</span>
                    </div>
                  </div>
                )}

                {/* Business Info */}
                <div className="text-center mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm">{formData.businessName}</h4>
                  <p className="text-xs text-gray-600">{formData.businessCategory}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.businessAddress}, {formData.businessCity}, {formData.businessState} {formData.businessZipCode}
                  </p>
                </div>

                {/* Reward Info */}
                <div className="border-t pt-3">
                  <h5 className="font-bold text-base text-gray-900 mb-2">
                    {formData.businessName}
                  </h5>
                  <p className="text-xs text-gray-600 mb-2">
                    {formData.subheader || "Reward description will appear here"}
                  </p>
                  
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Qty: {formData.quantity}</span>
                    <span>Expires: {formData.expires ? formatExpirationDate(formData.expires) : "No expiration"}</span>
                  </div>

                  <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium text-sm">
                    Claim Reward
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 