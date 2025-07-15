"use client";

import { useState, useEffect, useRef } from "react";

interface SignupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SignupData) => void;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
}

export default function SignupForm({ isOpen, onClose, onSubmit }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessZip: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);

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

  // Load Google Places API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'your_actual_api_key_here') {
      console.warn('Google Maps API key not configured. Address autocomplete will be disabled.');
      return;
    }

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }
  }, []);

  // AWS Address Autocomplete (fallback)
  useEffect(() => {
    // Only use AWS autocomplete if Google Maps is not available
    if (!window.google || !window.google.maps || !formData.businessAddress) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const controller = new AbortController();
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/address-autocomplete?q=${encodeURIComponent(formData.businessAddress)}`, { signal: controller.signal });
        if (!res.ok) return;
        const suggestions: { text: string }[] = await res.json();
        setAddressSuggestions(suggestions.map((s) => s.text));
        setShowSuggestions(true);
      } catch (err) {
        if ((err as { name?: string }).name !== "AbortError") {
          setAddressSuggestions([]);
          setShowSuggestions(false);
        }
      }
    };
    // Debounce
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [formData.businessAddress]);

  const initializeAutocomplete = () => {
    if (addressInputRef.current && window.google && window.google.maps) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.address_components) {
          let streetNumber = '';
          let route = '';
          let city = '';
          let state = '';
          let zipCode = '';

          for (const component of place.address_components) {
            const types = component.types;
            
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            } else if (types.includes('route')) {
              route = component.long_name;
            } else if (types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.short_name;
            } else if (types.includes('postal_code')) {
              zipCode = component.long_name;
            }
          }

          const fullAddress = `${streetNumber} ${route}`.trim();
          
          setFormData(prev => ({
            ...prev,
            businessAddress: fullAddress,
            businessCity: city,
            businessState: state,
            businessZip: zipCode,
          }));
        }
      });
      } catch (error) {
        console.error('Error initializing Google Maps autocomplete:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number format
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        businessName: "",
        businessAddress: "",
        businessCity: "",
        businessState: "",
        businessZip: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Format phone number as user types
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (name === "businessAddress") {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      businessAddress: suggestion
    }));
    setShowSuggestions(false);
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
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Get Started</h2>
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
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Personal Information</h3>
              
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4 pt-4">
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

              <div className="relative">
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address *
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Start typing your address..."
                  autoComplete="off"
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                  onFocus={() => formData.businessAddress && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {showSuggestions && addressSuggestions.length > 0 && (
                  <ul className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 w-full max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="px-3 sm:px-4 py-2 cursor-pointer hover:bg-green-100 text-sm sm:text-base"
                        onMouseDown={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
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
                  <label htmlFor="businessZip" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP *
                  </label>
                  <input
                    type="text"
                    id="businessZip"
                    name="businessZip"
                    value={formData.businessZip}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-base"
                    placeholder="12345"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:transform-none text-base"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 