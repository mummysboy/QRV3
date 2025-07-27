"use client";

import { useState, useEffect, useMemo } from "react";
import CardAnimation from "@/components/CardAnimation";
import BusinessDropdown from "@/components/BusinessDropdown";

interface Business {
  id: string;
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  category: string;
  status: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  website: string;
  socialMedia: string;
  businessHours: string;
  description: string;
  photos: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
}

interface CreateRewardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RewardData) => void;
  business: Business;
  allBusinesses: Business[];
  onBusinessChange: (business: Business) => void;
  isProfileComplete: boolean;
  isLogoProcessing?: boolean;
  shouldShowLogoProcessing?: boolean;
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
  quantity: number | "";
  expires: string;
}

export default function CreateRewardForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  business, 
  allBusinesses,
  onBusinessChange,
  isProfileComplete,
  isLogoProcessing = false,
  shouldShowLogoProcessing = false
}: CreateRewardFormProps) {
  // Ensure business.logo is never undefined
  const businessWithLogo = useMemo(() => ({
    ...business,
    logo: business.logo || ''
  }), [business.id, business.name, business.address, business.city, business.state, business.zipCode, business.category, business.logo]);

  const [formData, setFormData] = useState<RewardData>({
    businessId: businessWithLogo.id,
    businessName: businessWithLogo.name,
    businessAddress: businessWithLogo.address,
    businessCity: businessWithLogo.city,
    businessState: businessWithLogo.state,
    businessZipCode: businessWithLogo.zipCode,
    businessCategory: businessWithLogo.category,
    businessLogo: businessWithLogo.logo,
    subheader: "",
    quantity: "", // Start blank
    expires: "",
  });

  // Debug: Log the business logo value (only when component mounts or business changes)
  useEffect(() => {
    console.log('CreateRewardForm - business.logo:', business.logo);
    console.log('CreateRewardForm - formData.businessLogo:', formData.businessLogo);
    console.log('CreateRewardForm - business object:', business);
    console.log('CreateRewardForm - isProfileComplete:', isProfileComplete);
  }, [business.id, business.logo, isProfileComplete]);

  // Update formData when business data changes
  useEffect(() => {
    console.log('CreateRewardForm - useEffect triggered, business.logo:', business.logo);
    setFormData(prev => ({
      ...prev,
      businessId: business.id,
      businessName: business.name,
      businessAddress: business.address,
      businessCity: business.city,
      businessState: business.state,
      businessZipCode: business.zipCode,
      businessCategory: business.category,
      businessLogo: business.logo || '',
    }));
  }, [business.id, business.name, business.address, business.city, business.state, business.zipCode, business.category, business.logo]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [prevDescription, setPrevDescription] = useState<string | null>(null);
  const [hasEnhanced, setHasEnhanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isProfileComplete) {
      alert("Please complete your business profile by uploading a logo before creating rewards.");
      return;
    }

    // Ensure we have the business logo
    if (!formData.businessLogo || formData.businessLogo.trim() === '') {
      console.warn('⚠️ Business logo is missing in form data, using business.logo as fallback');
      formData.businessLogo = businessWithLogo.logo || '';
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        businessId: businessWithLogo.id,
        businessName: businessWithLogo.name,
        businessAddress: businessWithLogo.address,
        businessCity: businessWithLogo.city,
        businessState: businessWithLogo.state,
        businessZipCode: businessWithLogo.zipCode,
        businessCategory: businessWithLogo.category,
        businessLogo: businessWithLogo.logo,
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
    // Allow editing of subheader (description), quantity, and expires (expiration date)
    if (name === "subheader" || name === "quantity" || name === "expires") {
      setFormData(prev => ({
        ...prev,
        [name]: name === "quantity" ? (value === "" ? "" : parseInt(value)) : value
      }));
    }
  };

  const formatExpirationDate = (dateString: string) => {
    if (!dateString) return "No expiration date set";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const setQuickExpiration = (hours: number) => {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    const year = expirationDate.getFullYear();
    const month = String(expirationDate.getMonth() + 1).padStart(2, '0');
    const day = String(expirationDate.getDate()).padStart(2, '0');
    const hoursStr = String(expirationDate.getHours()).padStart(2, '0');
    const minutes = String(expirationDate.getMinutes()).padStart(2, '0');
    const dateTimeString = `${year}-${month}-${day}T${hoursStr}:${minutes}`;
    
    setFormData(prev => ({
      ...prev,
      expires: dateTimeString
    }));
  };

  const applyDateSelection = () => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      let hour = selectedHour;
      if (selectedPeriod === 'PM' && hour !== 12) hour += 12;
      if (selectedPeriod === 'AM' && hour === 12) hour = 0;
      
      date.setHours(hour, selectedMinute, 0, 0);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hoursStr = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const dateTimeString = `${year}-${month}-${day}T${hoursStr}:${minutes}`;
      
      setFormData(prev => ({
        ...prev,
        expires: dateTimeString
      }));
    }
    setShowDatePicker(false);
  };

  const cancelDateSelection = () => {
    setShowDatePicker(false);
  };

  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      options.push(date);
    }
    return options;
  };

  const generateHourOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  const generateMinuteOptions = () => {
    return Array.from({ length: 60 }, (_, i) => i);
  };

  const handleEnhanceDescription = async () => {
    setIsEnhancing(true);
    setPrevDescription(formData.subheader);
    try {
      const res = await fetch("/api/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: formData.subheader }),
      });
      const data = await res.json();
      if (res.ok && data.enhancedDescription) {
        setFormData(prev => ({ ...prev, subheader: data.enhancedDescription }));
        setHasEnhanced(true);
      }
    } catch {
      // Optionally show error
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUndoEnhance = () => {
    if (prevDescription !== null) {
      setFormData(prev => ({ ...prev, subheader: prevDescription }));
      setPrevDescription(null);
      setHasEnhanced(false);
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
      className="fixed inset-0 bg-neutral-100/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Reward</h2>
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

          {/* Logo Processing Notice */}
          {isProfileComplete && shouldShowLogoProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {isLogoProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    {isLogoProcessing ? 'Logo Processing...' : 'Logo Update Complete'}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      {isLogoProcessing 
                        ? 'Your logo is being processed. Please wait a moment before creating rewards to ensure it displays correctly.'
                        : 'Your logo has been updated and should now appear in your rewards.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            {/* Form Section */}
            <div className="order-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header with Business Selection */}
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Reward Details</h3>
                  <div className="flex-shrink-0">
                    <BusinessDropdown
                      businesses={allBusinesses}
                      selectedBusiness={business}
                      onBusinessChange={onBusinessChange}
                      className="w-48"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subheader" className="block text-sm font-medium text-gray-700 mb-1">
                      Reward Description *
                    </label>
                    <div className="relative">
                      <textarea
                        id="subheader"
                        name="subheader"
                        value={formData.subheader}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-3 sm:px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:border-gray-400 focus:outline-none transition-colors text-base resize-none"
                        placeholder="Describe your reward offer (e.g., Get a free coffee with any purchase, 20% off your next visit, Buy one get one free)"
                        disabled={isEnhancing}
                        maxLength={80}
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-2">
                        {formData.subheader.trim() && (
                          <button
                            type="button"
                            className="px-1.5 py-0.5 text-xs flex items-center text-blue-300 hover:text-blue-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleEnhanceDescription}
                            disabled={isEnhancing}
                            aria-label="Enhance with AI"
                          >
                            {isEnhancing ? (
                              <span className="animate-spin mr-1 w-3 h-3 border border-blue-200 border-t-transparent rounded-full"></span>
                            ) : (
                              <span className="flex items-center">✨<span className="ml-1">Enhance with AI</span></span>
                            )}
                          </button>
                        )}
                        {hasEnhanced && (
                          <button
                            type="button"
                            className="px-1.5 py-0.5 text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            onClick={handleUndoEnhance}
                          >Undo</button>
                        )}
                        <span className={`text-xs ${
                          formData.subheader.length > 70 
                            ? 'text-red-500' 
                            : 'text-gray-400'
                        }`}>
                          {formData.subheader.length}/80
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tell customers what they&apos;ll receive</p>
                  </div>

                  {/* Preview Section - Under Description */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">Preview</h4>
                    <div className="flex justify-center items-center">
                      <CardAnimation 
                        card={{
                          cardid: "preview",
                          header: formData.businessName,
                          logokey: formData.businessLogo,
                          addresstext: `${formData.businessAddress}, ${formData.businessCity}, ${formData.businessState} ${formData.businessZipCode}`,
                          addressurl: "",
                          subheader: formData.subheader || "Reward description will appear here",
                          expires: formData.expires,
                          quantity: typeof formData.quantity === 'number' ? formData.quantity : 0
                        }}
                        isPreview={true}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="expires" className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date & Time
                    </label>
                    
                    {/* Quick Preset Buttons */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Quick options:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickExpiration(1)}
                          className="px-3 py-2 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                        >
                          1 Hour
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickExpiration(24)}
                          className="px-3 py-2 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                        >
                          1 Day
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickExpiration(168)}
                          className="px-3 py-2 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                        >
                          1 Week
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickExpiration(720)}
                          className="px-3 py-2 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                        >
                          1 Month
                        </button>
                      </div>
                    </div>

                    {/* Custom Date/Time Picker Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(true)}
                        className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base text-left bg-white hover:bg-gray-50"
                      >
                        {formData.expires ? (
                          <span className="text-gray-900">{formatExpirationDate(formData.expires)}</span>
                        ) : (
                          <span className="text-gray-500">Select date and time</span>
                        )}
                      </button>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Available
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      max="1000"
                      inputMode="numeric"
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-gray-400 focus:outline-none transition-colors text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <div className="pt-4 sm:pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isProfileComplete || !formData.subheader.trim() || !formData.expires.trim() || !formData.quantity || formData.quantity <= 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none text-base"
                  >
                    {isSubmitting ? "Creating..." : "Create Reward"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-neutral-100/80 backdrop-blur-sm flex items-center justify-center z-60 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto transition-all duration-300 transform scale-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Select Date & Time</h3>
                <button
                  onClick={cancelDateSelection}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Date</h4>
                <div className="h-40 overflow-y-auto border border-gray-200 rounded-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {generateDateOptions().map((date, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex-shrink-0 ${
                        selectedDate && selectedDate.toDateString() === date.toDateString()
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="font-medium">
                        {index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-sm">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Time</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hour</label>
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      {generateHourOptions().map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Minute</label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      {generateMinuteOptions().map((minute) => (
                        <option key={minute} value={minute}>
                          {String(minute).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Period</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as 'AM' | 'PM')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDateSelection}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyDateSelection}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 