"use client";

import { useState, useEffect } from "react";
import CardAnimation from "@/components/CardAnimation";

interface Card {
  cardid: string;
  quantity: number;
  logokey?: string;
  header?: string;
  subheader?: string;
  addressurl?: string;
  addresstext?: string;
  expires?: string;
  businessId?: string;
}

interface EditRewardFormProps {
  card: Card;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRewardForm({ card, onClose, onSuccess }: EditRewardFormProps) {
  console.log('🔍 EditRewardForm: Card data received:', card);
  console.log('🔍 EditRewardForm: Card subheader:', card.subheader);
  
  const [formData, setFormData] = useState({
    subheader: card.subheader || "",
    quantity: card.quantity || 100,
    expires: card.expires || "",
  });
  
  console.log('🔍 EditRewardForm: Initial formData:', formData);
  
  // Monitor form data changes
  useEffect(() => {
    console.log('🔍 EditRewardForm: formData changed:', formData);
  }, [formData]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [prevDescription, setPrevDescription] = useState<string | null>(null);
  const [hasEnhanced, setHasEnhanced] = useState(false);

  // Extract business information from card data
  const businessInfo = {
    name: card.header || "Business Name",
    address: card.addresstext || card.addressurl || "Business Address",
    logo: card.logokey || "",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/business/rewards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardid: card.cardid,
          subheader: formData.subheader,
          quantity: formData.quantity,
          expires: formData.expires,
          // Keep existing values for fields that shouldn't change
          header: card.header,
          logokey: card.logokey,
          addressurl: card.addressurl,
          addresstext: card.addresstext,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Reward updated successfully:', result);
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update reward');
      }
    } catch (error) {
      console.error('Error updating reward:', error);
      alert('Failed to update reward');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "subheader" || name === "quantity" || name === "expires") {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEnhanceDescription = async () => {
    console.log('🔍 EditRewardForm: Enhance button clicked');
    console.log('🔍 EditRewardForm: Current subheader:', formData.subheader);
    console.log('🔍 EditRewardForm: subheader.trim():', formData.subheader.trim());
    console.log('🔍 EditRewardForm: isEnhancing state:', isEnhancing);
    
    setIsEnhancing(true);
    setPrevDescription(formData.subheader);
    
    // Test with a hardcoded description to see if the API works
    const testDescription = formData.subheader || "Get a free coffee";
    console.log('🔍 EditRewardForm: Using description for API:', testDescription);
    
    try {
      const res = await fetch("/api/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: testDescription }),
      });
      
      console.log('🔍 EditRewardForm: Response status:', res.status);
      console.log('🔍 EditRewardForm: Response ok:', res.ok);
      
      const data = await res.json();
      console.log('🔍 EditRewardForm: API response:', data);
      
      if (res.ok && data.enhancedDescription) {
        setFormData(prev => {
          console.log('🔍 EditRewardForm: Setting form data, prev:', prev);
          const newData = { ...prev, subheader: data.enhancedDescription };
          console.log('🔍 EditRewardForm: New form data:', newData);
          return newData;
        });
        setHasEnhanced(true);
        console.log('🔍 EditRewardForm: Enhanced description set successfully');
      } else {
        console.log('🔍 EditRewardForm: API response not ok or no enhanced description');
        console.log('🔍 EditRewardForm: res.ok:', res.ok);
        console.log('🔍 EditRewardForm: data.enhancedDescription:', data.enhancedDescription);
      }
    } catch (error) {
      console.error('🔍 EditRewardForm: Error during enhancement:', error);
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

  const clearExpiration = () => {
    setFormData(prev => ({
      ...prev,
      expires: ""
    }));
    setSelectedDate(null);
    setSelectedHour(12);
    setSelectedMinute(0);
    setSelectedPeriod('PM');
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Reward</h2>
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

          <div className="grid grid-cols-1 gap-8">
            {/* Form Section */}
            <div className="order-1">
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
                      value={businessInfo.name}
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
                      value={businessInfo.address}
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
                    <div className="flex items-center gap-2">
                      <textarea
                        id="subheader"
                        name="subheader"
                        value={formData.subheader}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base resize-none"
                        placeholder="Describe your reward offer (e.g., Get a free coffee with any purchase, 20% off your next visit, Buy one get one free)"
                        disabled={isEnhancing}
                      />
                      <button
                        type="button"
                        className="ml-1 px-2 py-1 text-xs rounded flex items-center text-gray-400 border border-gray-200 hover:text-gray-600 hover:border-gray-300 transition bg-white disabled:opacity-60"
                        style={{ minWidth: 32 }}
                        onClick={handleEnhanceDescription}
                        disabled={isEnhancing}
                        aria-label="Enhance with AI"
                        onMouseEnter={() => {
                          console.log('🔍 EditRewardForm: Enhance button hover - isEnhancing:', isEnhancing, 'subheader.trim():', formData.subheader.trim(), 'disabled:', isEnhancing || !formData.subheader.trim());
                        }}
                      >
                        {isEnhancing ? (
                          <span className="animate-spin mr-1 w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full"></span>
                        ) : (
                          <span className="flex items-center">✨<span className="ml-1 hidden sm:inline">Enhance</span></span>
                        )}
                      </button>
                      {hasEnhanced && (
                        <button
                          type="button"
                          className="ml-1 px-2 py-1 text-xs rounded text-gray-400 border border-gray-200 hover:text-gray-600 hover:border-gray-300 transition bg-white"
                          onClick={handleUndoEnhance}
                        >Undo</button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tell customers what they&apos;ll receive</p>
                  </div>

                  {/* Preview Section - Mobile */}
                  <div className="block lg:hidden">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-hidden">
                      <div className="max-w-xs mx-auto flex justify-center">
                        <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-green-500 p-0.5 rounded-lg inline-block">
                          <div className="bg-white rounded-lg overflow-hidden w-full h-full">
                            <CardAnimation 
                              card={{
                                cardid: "preview",
                                header: businessInfo.name,
                                logokey: businessInfo.logo,
                                addresstext: businessInfo.address,
                                addressurl: "",
                                subheader: formData.subheader || "Reward description will appear here",
                                expires: formData.expires ? new Date(formData.expires).toISOString() : "Demo Reward Not Valid",
                                quantity: formData.quantity
                              }}
                              playbackRate={1}
                              isPreview={true}
                            />
                          </div>
                        </div>
                      </div>
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

                    {/* Clear Button */}
                    {formData.expires && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={clearExpiration}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Clear expiration date
                        </button>
                      </div>
                    )}

                    {/* Status Display */}
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        {formData.expires ? (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Expires: {formatExpirationDate(formData.expires)}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            No expiration date set
                          </span>
                        )}
                      </p>
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
                      min="1"
                      max="1000"
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of rewards available</p>
                  </div>
                </div>

                <div className="pt-4 sm:pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.subheader.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none text-base"
                  >
                    {isSubmitting ? "Updating..." : "Update Reward"}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className="hidden lg:block order-2">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 overflow-hidden">
                <div className="max-w-sm mx-auto flex justify-center">
                  <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-green-500 p-0.5 rounded-lg inline-block">
                    <div className="bg-white rounded-lg overflow-hidden w-full h-full">
                      <CardAnimation 
                        card={{
                          cardid: "preview",
                          header: businessInfo.name,
                          logokey: businessInfo.logo,
                          addresstext: businessInfo.address,
                          addressurl: "",
                          subheader: formData.subheader || "Reward description will appear here",
                          expires: formData.expires ? new Date(formData.expires).toISOString() : "Demo Reward Not Valid",
                          quantity: formData.quantity
                        }}
                        playbackRate={1}
                        isPreview={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Scrollable Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
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
                      <div className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-sm">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Time</h4>
                <div className="grid grid-cols-3 gap-2">
                  {/* Hour Selection */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Hour</label>
                    <div className="h-24 overflow-y-auto border border-gray-200 rounded-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {generateHourOptions().map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          onClick={() => setSelectedHour(hour)}
                          className={`w-full px-3 py-2 text-center hover:bg-gray-50 transition-colors flex-shrink-0 ${
                            selectedHour === hour
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {hour}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minute Selection */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Minute</label>
                    <div className="h-24 overflow-y-auto border border-gray-200 rounded-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {generateMinuteOptions().map((minute) => (
                        <button
                          key={minute}
                          type="button"
                          onClick={() => setSelectedMinute(minute)}
                          className={`w-full px-3 py-2 text-center hover:bg-gray-50 transition-colors flex-shrink-0 ${
                            selectedMinute === minute
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {minute.toString().padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AM/PM Selection */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Period</label>
                    <div className="h-24 overflow-y-auto border border-gray-200 rounded-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {['AM', 'PM'].map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setSelectedPeriod(period as 'AM' | 'PM')}
                          className={`w-full px-3 py-2 text-center hover:bg-gray-50 transition-colors flex-shrink-0 ${
                            selectedPeriod === period
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelDateSelection}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyDateSelection}
                  disabled={!selectedDate}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
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