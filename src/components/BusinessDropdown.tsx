"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { createPortal } from "react-dom";

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
  userRole?: string;
  userStatus?: string;
}

interface BusinessDropdownProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onBusinessChange: (business: Business) => void;
  className?: string;
}

export default function BusinessDropdown({
  businesses,
  selectedBusiness,
  onBusinessChange,
  className = ""
}: BusinessDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sort businesses by creation date (earliest first)
  const sortedBusinesses = [...businesses].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateA - dateB;
  });

  // Calculate dropdown position when opening
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 320, // Position dropdown to align with right edge of button
        width: Math.min(320, rect.width)
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleBusinessSelect = (business: Business) => {
    onBusinessChange(business);
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  // Helper function to extract street address
  const getStreetAddress = (address: string): string => {
    if (!address) return "";
    // Take the first part of the address (before any comma)
    const parts = address.split(',');
    return parts[0]?.trim() || "";
  };

  // Helper function to format creation date
  const formatCreationDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (businesses.length <= 1) {
    return null;
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Dropdown Button */}
        <button
          ref={buttonRef}
          onClick={handleToggleDropdown}
          className="flex items-center justify-between w-full max-w-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-left hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm sm:max-w-sm"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center min-w-0 flex-1">
            <Building2 className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {selectedBusiness?.name || "Select Business"}
              </div>
              {selectedBusiness && (
                <div className="text-xs text-gray-500 truncate">
                  {getStreetAddress(selectedBusiness.address)}
                </div>
              )}
            </div>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </div>

      {/* Dropdown Menu - Rendered as Portal */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 z-[99999] bg-black/10" 
            onClick={() => setIsOpen(false)}
            style={{ zIndex: 99999 }}
          />
          
          {/* Dropdown content */}
          <div
            ref={dropdownRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 100000
            }}
          >
            <div className="py-1">
              {sortedBusinesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => handleBusinessSelect(business)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 ${
                    selectedBusiness?.id === business.id ? 'bg-green-50 border-l-2 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="min-w-0 flex-1">
                      {/* Business Name */}
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {business.name}
                        {business.status === 'pending_approval' && (
                          <span className="ml-1 text-xs text-yellow-600 font-normal">
                            (Pending)
                          </span>
                        )}
                      </div>
                      
                      {/* Street Address */}
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {getStreetAddress(business.address)}
                      </div>
                      
                      {/* Creation Date */}
                      <div className="text-xs text-gray-400 mt-0.5">
                        Created {formatCreationDate(business.createdAt)}
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedBusiness?.id === business.id && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
} 