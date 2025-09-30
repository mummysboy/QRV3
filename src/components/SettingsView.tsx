"use client";

import { memo } from "react";
import { Building2, Trash2, Languages } from "lucide-react";
import { getStorageUrlSync } from "@/lib/storage";
import DefaultLogo from "@/components/DefaultLogo";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  category: string;
}

interface Business {
  id: string;
  name: string;
  logo: string;
}

interface SettingsViewProps {
  business: Business | null;
  profileFormData: ProfileFormData;
  isUpdatingProfile: boolean;
  onFieldChange: (field: string, value: string) => void;
  onUpdate: () => void;
  onBackToDashboard: () => void;
  onShowLogoUpload: () => void;
  onShowAddBusiness: () => void;
  onShowDeleteConfirmation: () => void;
}

// Memoized Profile Form Component
const ProfileForm = memo(({ 
  profileFormData, 
  onFieldChange, 
  onUpdate, 
  isUpdating 
}: {
  profileFormData: ProfileFormData;
  onFieldChange: (field: string, value: string) => void;
  onUpdate: () => void;
  isUpdating: boolean;
}) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
      <input
        type="text"
        value={profileFormData.name}
        onChange={(e) => onFieldChange('name', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
      <input
        type="text"
        value={profileFormData.address}
        onChange={(e) => onFieldChange('address', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
        <input
          type="text"
          value={profileFormData.city}
          onChange={(e) => onFieldChange('city', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
        <input
          type="text"
          value={profileFormData.state}
          onChange={(e) => onFieldChange('state', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
        <input
          type="text"
          value={profileFormData.zipCode}
          onChange={(e) => onFieldChange('zipCode', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <input
        type="text"
        value={profileFormData.category}
        onChange={(e) => onFieldChange('category', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
      />
    </div>

    {/* Update Button */}
    <div className="pt-4">
      <button
        onClick={onUpdate}
        disabled={isUpdating}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
      >
        {isUpdating ? 'Submitting...' : 'Update Profile'}
      </button>
    </div>
  </div>
));

ProfileForm.displayName = 'ProfileForm';

const SettingsView = memo(({
  business,
  profileFormData,
  isUpdatingProfile,
  onFieldChange,
  onUpdate,
  onBackToDashboard,
  onShowLogoUpload,
  onShowAddBusiness,
  onShowDeleteConfirmation
}: SettingsViewProps) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light text-gray-900">Settings</h2>
        <button
          onClick={onBackToDashboard}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
      <h3 className="text-2xl font-light text-gray-900 mb-6">Business Management</h3>
      <div className="space-y-6">
        {/* Logo Upload Section - Moved to top */}
        <div>
          <div className="flex items-center space-x-4">
            {business?.logo && business.logo.trim() !== '' ? (
              <div className="relative">
                <img
                  src={
                    business.logo.startsWith('data:') || business.logo.startsWith('http')
                      ? business.logo
                      : getStorageUrlSync(business.logo)
                  }
                  alt="Business Logo"
                  className="w-32 h-32 object-contain rounded-xl border-2 border-gray-200"
                  onError={(e) => {
                    console.error('Logo failed to load:', business.logo);
                    console.error('Logo URL:', business.logo.startsWith("data:") || business.logo.startsWith("http")
                      ? business.logo
                      : getStorageUrlSync(business.logo)
                    );
                    // Show fallback if image fails to load
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.logo-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                  onLoad={() => {
                    console.log('Logo loaded successfully:', business.logo);
                  }}
                />
                <div 
                  className="flex items-center justify-center border-2 border-dashed border-gray-300 logo-fallback absolute top-0 left-0"
                  style={{ display: 'none' }}
                >
                  <DefaultLogo 
                    businessName={business?.name || 'Business'} 
                    size="lg"
                    className="w-32 h-32"
                  />
                </div>
              </div>
            ) : null}
            <div 
              className="flex items-center justify-center border-2 border-dashed border-gray-300 logo-fallback"
              style={{ display: business?.logo && business.logo.trim() !== '' ? 'none' : 'flex' }}
            >
              <DefaultLogo 
                businessName={business?.name || 'Business'} 
                size="lg"
                className="w-32 h-32"
              />
            </div>
            <button
              onClick={onShowLogoUpload}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Upload Logo
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-xl font-light text-gray-900 mb-4">Business Profile</h4>
          <ProfileForm
            profileFormData={profileFormData}
            onFieldChange={onFieldChange}
            onUpdate={onUpdate}
            isUpdating={isUpdatingProfile}
          />
        </div>
        
        {/* Add New Business Section - Moved to bottom */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-xl font-light text-gray-900 mb-4">Business Management</h4>
          <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-all duration-200 ease-in-out cursor-pointer" onClick={onShowAddBusiness}>
            <Building2 size={24} className="text-orange-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Add New Business</div>
              <div className="text-sm text-gray-600">Register a new location</div>
            </div>
          </div>
        </div>
        
        {/* Language Selection Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-xl font-light text-gray-900 mb-4">Language Preference</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ${
                language === 'en'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-4xl mb-2">🇺🇸</span>
              <span className={`text-lg font-medium ${language === 'en' ? 'text-blue-600' : 'text-gray-900'}`}>
                English
              </span>
              {language === 'en' && (
                <span className="text-xs text-blue-600 mt-1">Current</span>
              )}
            </button>
            
            <button
              onClick={() => setLanguage('es')}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ${
                language === 'es'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-4xl mb-2">🇪🇸</span>
              <span className={`text-lg font-medium ${language === 'es' ? 'text-blue-600' : 'text-gray-900'}`}>
                Español
              </span>
              {language === 'es' && (
                <span className="text-xs text-blue-600 mt-1">Current</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Delete Account Section - At the very bottom */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-xl font-light text-gray-900 mb-4">Account Management</h4>
          <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-all duration-200 ease-in-out cursor-pointer" onClick={onShowDeleteConfirmation}>
            <Trash2 size={24} className="text-red-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Delete Account</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
});

SettingsView.displayName = 'SettingsView';

export default SettingsView; 