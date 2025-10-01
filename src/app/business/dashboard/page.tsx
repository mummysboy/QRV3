"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import CreateRewardForm from "@/components/CreateRewardForm";
import EditRewardForm from "@/components/EditRewardForm";
import LogoUpload from "@/components/LogoUpload";
import CardAnimation from "@/components/CardAnimation";
import AddBusinessForm, { AddBusinessData } from "@/components/AddBusinessForm";
import { getStorageUrlSync } from "@/lib/storage";
import { Plus, BarChart3, Eye, ArrowRight, CheckCircle, Target, PartyPopper, TrendingUp, Gift, QrCode, Camera, Trash2 } from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { X } from "lucide-react";
import { getCookie } from "@/lib/utils";
import Header from "@/components/Header";
import DefaultLogo from "@/components/DefaultLogo";
import SettingsView from "@/components/SettingsView";
import ContactPopup from "@/components/Popups/ContactPopup";
import BusinessDropdown from "@/components/BusinessDropdown";
import { useNotifications } from "@/components/NotificationProvider";
import { dashboardTranslations } from "@/translations/dashboard";
import { useLanguage } from "@/contexts/LanguageContext";


interface BusinessUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

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

interface Card {
  cardid: string;
  quantity: number;
  logokey?: string;
  header?: string;
  subheader?: string;
  addressurl?: string;
  addresstext?: string;
  neighborhood?: string;
  expires?: string;
  businessId?: string;
}

interface AnalyticsData {
  totalRewards: number;
  activeRewards: number;
  totalClaims: number;
  totalViews: number;
  totalRedeemed: number;
  recentClaims: Array<{
    id: string;
    cardid: string;
    header: string;
    claimed_at: string;
    delivery_method: string;
  }>;
  rewardsByStatus: {
    active: number;
    inactive: number;
  };
  claimsByMonth: Array<{
    month: string;
    count: number;
  }>;
  claimsByDay: Array<{
    date: string;
    count: number;
  }>;
  claimsByWeek: Array<{
    week: string;
    count: number;
  }>;
  conversionRate: number;
  redemptionRate: number;
  rewardAnalytics: Array<{
    cardid: string;
    header: string;
    subheader: string;
    quantity: number;
    claims: number;
    views: number;
    redeemed: number;
    conversionRate: number;
    redemptionRate: number;
    lastClaimed?: string;
    lastRedeemed?: string;
  }>;
  viewsByDay: Array<{ date: string; count: number }>;
  redeemedByDay: Array<{ date: string; count: number }>;
}

type TimeRange = 'day' | 'week' | 'month';

// Helper to get today's date in YYYY-MM-DD format


export default function BusinessDashboard() {
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();
  const { language } = useLanguage();
  
  // Get translation function
  const t = (key: keyof typeof dashboardTranslations.en) => {
    return dashboardTranslations[language][key];
  };
  
  // Test notification on component mount (commented out for now)
  // React.useEffect(() => {
  //   console.log('🔔 BusinessDashboard: Testing notification system');
  //   showSuccess('Test Notification', 'This is a test notification to verify the system is working');
  // }, [showSuccess]);
  
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showCreateReward, setShowCreateReward] = useState(false);
  const [showEditReward, setShowEditReward] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [isVisible, setIsVisible] = useState(false);
  const [logoProcessing, setLogoProcessing] = useState(false);
  const [logoProcessingStartTime, setLogoProcessingStartTime] = useState<number | null>(null);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [qrLayout, setQrLayout] = useState<'single' | '2x2' | '3x3' | '4x4'>('single');
  const [showCameraIcon, setShowCameraIcon] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  // Consent banner state
  const [showConsent, setShowConsent] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    socialMedia: '',
    businessHours: '',
    description: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Handle browser back button navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If we're on analytics or settings view, prevent leaving the page
      // and instead return to dashboard home view
      if (currentView !== 'dashboard') {
        event.preventDefault();
        setCurrentView('dashboard');
        // Push a new state to prevent the back button from working again
        window.history.pushState({ view: 'dashboard' }, '', window.location.pathname);
      }
    };

    // Add event listener for popstate (back/forward button)
    window.addEventListener('popstate', handlePopState);

    // Push initial state when component mounts (only if not already set)
    if (window.history.state === null) {
      window.history.replaceState({ view: 'dashboard' }, '', window.location.pathname);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentView]);

  // Handle page refresh - restore saved view state or default to dashboard
  useEffect(() => {
    // Check if there's a saved view state from business switching
    const savedView = sessionStorage.getItem('currentView') as 'dashboard' | 'analytics' | 'settings' | null;
    if (savedView && ['dashboard', 'analytics', 'settings'].includes(savedView)) {
      setCurrentView(savedView);
      // Clear the saved view state after restoring it
      sessionStorage.removeItem('currentView');
    } else {
      // If user refreshes the page normally, start on dashboard view
      setCurrentView('dashboard');
    }
  }, []);

  // Function to fetch user and business data from session
  const fetchUserDataFromSession = useCallback(async () => {
    try {
      // Check for last business ID in sessionStorage
      const lastBusinessId = sessionStorage.getItem('lastBusinessId');
      
      const headers: Record<string, string> = {};
      if (lastBusinessId) {
        headers['x-last-business-id'] = lastBusinessId;
      }
      
      const response = await fetch('/api/business/check-session', {
        headers
      });
      const data = await response.json();
      
      if (data.hasSession && data.user && data.business) {
        // Store user data in sessionStorage for consistency
        sessionStorage.setItem('businessUser', JSON.stringify(data.user));
        sessionStorage.setItem('businessData', JSON.stringify(data.business));
        
        // Store the current business ID as the last used business
        if (data.business?.id) {
          const existingLastBusinessId = sessionStorage.getItem('lastBusinessId');
          if (existingLastBusinessId !== data.business.id) {
            sessionStorage.setItem('lastBusinessId', data.business.id);
          }
        }
        
        setUser(data.user);
        setBusiness(data.business);
      } else {
        router.push('/business/login');
      }
    } catch (error) {
      console.error('Error fetching user data from session:', error);
      router.push('/business/login');
    }
  }, [router]);

  // Function to fetch dashboard data (rewards and analytics)
  const fetchDashboardData = useCallback(async () => {
    if (!business?.id) return;
    
    setIsLoadingData(true);
    try {
      // Clear existing data first
      setCards([]);
      setAnalytics(null);
      
      // Fetch rewards data
      const rewardsResponse = await fetch(`/api/business/rewards?businessId=${business.id}`);
      const rewardsData = await rewardsResponse.json();
      
      if (rewardsData.success) {
        setCards(rewardsData.cards || []);
      }

      // Fetch analytics data - use 'day' for dashboard view, selected timeRange for analytics view
      const analyticsTimeRange = currentView === 'dashboard' ? 'day' : timeRange;
      const analyticsResponse = await fetch(`/api/business/analytics?businessId=${business.id}&timeRange=${analyticsTimeRange}`);
      const analyticsData = await analyticsResponse.json();
      
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [business?.id, currentView, timeRange]);

  // Function to fetch all businesses for the user
  const fetchAllBusinesses = useCallback(async () => {
    if (!user?.email) return;
    
    // If we already have businesses loaded from sessionStorage, don't fetch again
    if (allBusinesses.length > 0) {
      return;
    }
    
    try {
      const response = await fetch('/api/business/my-businesses', {
        headers: {
          'x-user-email': user.email,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const fetchedBusinesses = data.businesses || [];
        
        // Merge with existing businesses (if any) and update sessionStorage
        const mergedBusinesses = [...allBusinesses, ...fetchedBusinesses];
        setAllBusinesses(mergedBusinesses);
        sessionStorage.setItem('allBusinesses', JSON.stringify(mergedBusinesses));
        sessionStorage.setItem('totalBusinesses', mergedBusinesses.length.toString());
      }
    } catch (error) {
      console.error('Error fetching all businesses:', error);
    }
  }, [user?.email, allBusinesses]);

  // Add function to refresh business data from database
  const refreshBusinessData = useCallback(async () => {
    if (!business?.id || !business?.name || isLoading) {
      console.log('Skipping refreshBusinessData - business not fully loaded or still loading');
      return;
    }
    
    try {
      const response = await fetch(`/api/business/get-business?businessId=${business.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.business) {
          
          // Update session storage with fresh data
          sessionStorage.setItem('businessData', JSON.stringify(data.business));
          setBusiness(data.business);
        } else {
          console.error('Failed to refresh business data:', response.status, data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to refresh business data:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error refreshing business data:', error);
    }
  }, [business?.id, business?.name, isLoading]);

  // Check if profile is complete
  const isProfileComplete = Boolean(business?.logo && business.logo.trim() !== '');

  // Check if logo is still processing (give it 30 seconds to process)
  const isLogoProcessing = logoProcessing && logoProcessingStartTime && 
    (Date.now() - logoProcessingStartTime) < 30000; // 30 seconds

  // Check if we should show logo processing message
  const shouldShowLogoProcessing = isLogoProcessing || 
    (business?.logo && business.logo.trim() !== '' && !isLogoProcessing && logoProcessingStartTime && 
     (Date.now() - logoProcessingStartTime) < 60000); // Show for 1 minute after upload

  // Add ref to track if we've already checked the session to prevent duplicate calls
  const hasCheckedSession = useRef(false);

  useEffect(() => {
    // Prevent duplicate session checks
    if (hasCheckedSession.current) {
      return;
    }
    hasCheckedSession.current = true;

    // Check if user is logged in via cookie
    if (typeof window !== "undefined") {
      const session = getCookie("qrewards_session");
      // Only show consent if cookie is not set and sessionToken is available
      const sessionToken = sessionStorage.getItem('businessSessionToken');
      if (!session && sessionToken) {
        setShowConsent(true);
      }
    }

    // Check if user is logged in
    const userData = sessionStorage.getItem('businessUser');
    const businessData = sessionStorage.getItem('businessData');
    const allBusinessesData = sessionStorage.getItem('allBusinesses');

    // If no sessionStorage data, check if we have a valid session cookie
    if (!userData || !businessData) {
      const checkSessionAndRedirect = async () => {
        try {
          // Check for last business ID in sessionStorage
          const lastBusinessId = sessionStorage.getItem('lastBusinessId');
          
          const headers: Record<string, string> = {};
          if (lastBusinessId) {
            headers['x-last-business-id'] = lastBusinessId;
          }
          
          const response = await fetch('/api/business/check-session', {
            headers
          });
          const data = await response.json();
          
          if (data.hasSession) {
            // We have a valid session, so we should stay on dashboard
            // Fetch user and business data from the session
            await fetchUserDataFromSession();
            setIsLoading(false);
            return;
          } else {
            router.push('/business/login');
            return;
          }
        } catch (error) {
          console.error('Error checking session:', error);
          router.push('/business/login');
          return;
        }
      };
      
      checkSessionAndRedirect();
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      const businessObj = JSON.parse(businessData);
      

      
      setUser(userObj);
      setBusiness(businessObj);
      
      // Store the current business ID as the last used business
      if (businessObj?.id) {
        const existingLastBusinessId = sessionStorage.getItem('lastBusinessId');
        if (existingLastBusinessId !== businessObj.id) {
          sessionStorage.setItem('lastBusinessId', businessObj.id);
        }
      }
      
      // Load all businesses from sessionStorage if available
      if (allBusinessesData) {
        try {
          const allBusinessesObj = JSON.parse(allBusinessesData);
          setAllBusinesses(allBusinessesObj);
        } catch (error) {
          console.error('Error parsing all businesses data:', error);
        }
      }

    } catch (error) {
      console.error('Error parsing session data:', error);
      router.push('/business/login');
      return;
    }

    setIsLoading(false);
  }, [router, fetchUserDataFromSession]);

  useEffect(() => {
    if (business?.id) {
      fetchDashboardData();
    }
  }, [business?.id, fetchDashboardData]);

  // Refresh business data if logo is missing
  useEffect(() => {
    if (business?.id && business?.name && (!business.logo || business.logo.trim() === '') && !isLoading) {
      refreshBusinessData();
    }
  }, [business?.id, business?.logo, business?.name, isLoading, refreshBusinessData]);

  useEffect(() => {
    if (user?.email) {
      fetchAllBusinesses();
    }
  }, [user?.email, fetchAllBusinesses]);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Clear logo processing state after timeout
  useEffect(() => {
    if (logoProcessing && logoProcessingStartTime) {
      const timer = setTimeout(() => {
        setLogoProcessing(false);
      }, 30000); // 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [logoProcessing, logoProcessingStartTime]);

  // Note: Session check and consent banner logic moved to the main useEffect above to prevent duplicate API calls



  // Initialize profile form data when business data loads
  useEffect(() => {
    if (business) {
      setProfileFormData({
        name: business.name || '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        zipCode: business.zipCode || '',
        category: business.category || '',
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || '',
        socialMedia: business.socialMedia || '',
        businessHours: business.businessHours || '',
        description: business.description || ''
      });
    }
  }, [business]);

  // Hide camera icon when user scrolls or moves mouse
  useEffect(() => {
    const handleUserInteraction = () => {
      setShowCameraIcon(false);
    };

    window.addEventListener('scroll', handleUserInteraction);
    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Check for showCreateReward flag and automatically show create reward form
  useEffect(() => {
    const shouldShowCreateReward = sessionStorage.getItem('showCreateReward');
    if (shouldShowCreateReward === 'true') {
      setShowCreateReward(true);
      sessionStorage.removeItem('showCreateReward');
    }
  }, []);


  const handleDeleteReward = async (cardid: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      const response = await fetch(`/api/business/rewards?cardid=${encodeURIComponent(cardid)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Reward deleted successfully');
        fetchDashboardData(); // Refresh data
        showSuccess('Reward Deleted', 'Reward deleted successfully!');
      } else {
        const error = await response.json();
        showError('Delete Failed', error.error || 'Failed to delete reward');
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      showError('Delete Failed', 'Failed to delete reward');
    }
  };

  const handleEditReward = (card: Card) => {
    setEditingCard(card);
    setShowEditReward(true);
  };

  const handleEditRewardSuccess = () => {
    setShowEditReward(false);
    setEditingCard(null);
    fetchDashboardData(); // Refresh data
  };

  const handleCloseEditReward = () => {
    setShowEditReward(false);
    setEditingCard(null);
  };

  const handleLogoUpload = async (logoUrl: string) => {
    if (!business?.id) {
      console.error('❌ handleLogoUpload: No business ID available');
      alert('Business ID not found. Please refresh the page and try again.');
      return;
    }

    console.log('🔄 handleLogoUpload: Starting logo update process...');
    console.log('📋 handleLogoUpload: Business ID:', business.id);
    console.log('📋 handleLogoUpload: Logo URL:', logoUrl);
    console.log('📋 handleLogoUpload: Current business logo:', business.logo);

    // Set logo processing state
    setLogoProcessing(true);
    setLogoProcessingStartTime(Date.now());

    try {
      console.log('🔄 handleLogoUpload: Calling business update API...');
      const response = await fetch('/api/business/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          logo: logoUrl,
        }),
      });

      console.log('📋 handleLogoUpload: API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ handleLogoUpload: Logo updated successfully:', result);
        
        // Update session storage
        const updatedBusiness = { ...business, logo: logoUrl };
        console.log('📋 handleLogoUpload: Updated business object:', updatedBusiness);
        sessionStorage.setItem('businessData', JSON.stringify(updatedBusiness));
        setBusiness(updatedBusiness);
        
        setShowLogoUpload(false);
        
        console.log('🔄 handleLogoUpload: Refreshing page...');
        // Refresh the page immediately
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('❌ handleLogoUpload: API error:', error);
        alert(error.error || 'Failed to upload logo');
        // Reset processing state on error
        setLogoProcessing(false);
        setLogoProcessingStartTime(null);
      }
    } catch (error) {
      console.error('❌ handleLogoUpload: Network error:', error);
      alert('Failed to upload logo - network error');
      // Reset processing state on error
      setLogoProcessing(false);
      setLogoProcessingStartTime(null);
    }
  };

  const handleCreateRewardSubmit = async (rewardData: { 
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
  }) => {
    // Validate quantity
    if (rewardData.quantity === "" || rewardData.quantity <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }

    // Ensure we have the business logo
    const businessLogo = rewardData.businessLogo || business?.logo || '';
    console.log('🔍 CreateReward - Using logo:', businessLogo);

    const constructedAddress = `${rewardData.businessAddress}, ${rewardData.businessCity}, ${rewardData.businessState} ${rewardData.businessZipCode}`;
    
    const requestBody = {
      businessId: rewardData.businessId,
      header: rewardData.businessName,
      subheader: rewardData.subheader,
      quantity: rewardData.quantity as number, // Type assertion since we validated it above
      expires: rewardData.expires,
      logokey: businessLogo,
      addressurl: constructedAddress,
      addresstext: constructedAddress,
    };

    console.log('🔍 CreateReward - Request body:', requestBody);

    try {
      const response = await fetch('/api/business/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Reward created successfully:', result);
        setShowCreateReward(false);
        fetchDashboardData();
        // Don't show success here - let CreateRewardForm handle it
      } else {
        const error = await response.json();
        console.error('Failed to create reward:', error);
        
        // Check if it's a content moderation error
        if (error.message?.includes('explicit content') || error.isExplicit) {
          // Throw error with specific flag so CreateRewardForm can handle it
          const contentError = new Error(error.message || 'Content moderation failed') as Error & { isExplicit: boolean };
          contentError.isExplicit = true;
          throw contentError;
        } else {
          // Throw error so CreateRewardForm can handle it
          throw new Error(error.error || error.message || 'Failed to create reward');
        }
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      // Only re-throw the error - let CreateRewardForm show the notification
      throw error;
    }
  };

  const handleQuickAction = (action: 'create' | 'analytics' | 'add-business' | 'qr-code') => {
    switch (action) {
      case 'create':
        // Refresh business data before opening create reward form
        refreshBusinessData().then(() => {
          setShowCreateReward(true);
        });
        break;
      case 'analytics':
        setCurrentView('analytics');
        // Push state to browser history for analytics view
        window.history.pushState({ view: 'analytics' }, '', window.location.pathname);
        break;
      case 'add-business':
        console.log('🔍 Opening add business form. User state:', {
          user: user,
          userEmail: user?.email,
          userFirstName: user?.firstName,
          userLastName: user?.lastName,
          isUserLoaded: !!user
        });
        setShowAddBusiness(true);
        break;
      case 'qr-code':
        setShowQRCodeModal(true);
        break;
    }
  };

  const handleAddBusinessSubmit = async (data: AddBusinessData) => {
    // Get user data from state or fallback to sessionStorage
    let userEmail = user?.email;
    let userFirstName = user?.firstName;
    let userLastName = user?.lastName;

    console.log('🔍 Add Business - Initial user state:', {
      user: user,
      userEmail: userEmail,
      userFirstName: userFirstName,
      userLastName: userLastName
    });

    // If user state is not available, try to get from sessionStorage
    if (!userEmail || !userFirstName || !userLastName) {
      console.log('⚠️ User state not available, trying sessionStorage...');
      try {
        const userData = sessionStorage.getItem('businessUser');
        console.log('📋 SessionStorage user data:', userData);
        
        if (userData) {
          const userObj = JSON.parse(userData);
          userEmail = userObj.email;
          userFirstName = userObj.firstName;
          userLastName = userObj.lastName;
          console.log('✅ Retrieved user data from sessionStorage:', {
            email: userEmail,
            firstName: userFirstName,
            lastName: userLastName
          });
        }
      } catch (error) {
        console.error('❌ Error parsing user data from sessionStorage:', error);
      }
    }

    // If still no user data, try to get from business data (skip session API to avoid extra calls)
    // The session should already be validated when the dashboard loaded

    // Final validation - if still no user data, try to get from business data
    if (!userEmail || !userFirstName || !userLastName) {
      console.log('⚠️ Session API also failed, trying business data...');
      try {
        const businessData = sessionStorage.getItem('businessData');
        if (businessData) {
          const businessObj = JSON.parse(businessData);
          userEmail = businessObj.email;
          userFirstName = businessObj.name?.split(' ')[0] || 'User';
          userLastName = businessObj.name?.split(' ').slice(1).join(' ') || 'Name';
          
          console.log('✅ Retrieved user data from business data:', {
            email: userEmail,
            firstName: userFirstName,
            lastName: userLastName
          });
        }
      } catch (error) {
        console.error('❌ Error parsing business data:', error);
      }
    }

    // Validate that user data exists
    if (!userEmail || !userFirstName || !userLastName) {
      console.error('❌ User information missing after all fallbacks:', { 
        email: userEmail, 
        firstName: userFirstName, 
        lastName: userLastName 
      });
      
      // Log all available data for debugging
      console.log('🔍 Debug - All available data:');
      console.log('📋 React user state:', user);
      console.log('📋 SessionStorage businessUser:', sessionStorage.getItem('businessUser'));
      console.log('📋 SessionStorage businessData:', sessionStorage.getItem('businessData'));
      console.log('📋 SessionStorage allBusinesses:', sessionStorage.getItem('allBusinesses'));
      
      throw new Error('User information not found. Please refresh the page and try again.');
    }

    try {
      console.log('🔄 Adding business with user info:', {
        email: userEmail,
        firstName: userFirstName,
        lastName: userLastName
      });

      const response = await fetch('/api/business/add-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'x-user-firstname': userFirstName,
          'x-user-lastname': userLastName,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ Add business API error:', responseData);
        throw new Error(responseData.error || 'Failed to add business');
      }

      console.log('✅ Business added successfully:', responseData);
      setShowAddBusiness(false);
      alert('Business added successfully! It is now pending approval from our admin team.');
      
      // Refresh the business list by clearing sessionStorage and fetching fresh data
      sessionStorage.removeItem('allBusinesses');
      sessionStorage.removeItem('totalBusinesses');
      setAllBusinesses([]);
      await fetchAllBusinesses();
    } catch (error) {
      console.error('❌ Error adding business:', error);
      throw error;
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      alert('User email not found');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch('/api/business/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Clear all session data
      sessionStorage.removeItem('businessUser');
      sessionStorage.removeItem('businessData');
      sessionStorage.removeItem('businessSessionToken');
      
      // Clear session cookie
      try {
        await fetch('/api/business/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error clearing session cookie:', error);
      }

      alert('Account deleted successfully');
      router.push('/business/login');
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Stable onChange handler to prevent re-renders
  const handleProfileFieldChange = useCallback((field: string, value: string) => {
    setProfileFormData(prev => ({ ...prev, [field]: value }));
  }, []);







  const handleUpdateProfile = async () => {
    if (!business?.id || !user?.email) {
      alert('Business or user information not found');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const response = await fetch('/api/business/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          userEmail: user.email,
          updates: {
            name: profileFormData.name,
            address: profileFormData.address,
            city: profileFormData.city,
            state: profileFormData.state,
            zipCode: profileFormData.zipCode,
            category: profileFormData.category
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit profile update');
      }

      const result = await response.json();
      alert(result.message || 'Profile update submitted successfully! Your changes will be reviewed by our admin team and applied once approved.');
      
      // Reset form data to current business data
      if (business) {
        setProfileFormData({
          name: business.name || '',
          address: business.address || '',
          city: business.city || '',
          state: business.state || '',
          zipCode: business.zipCode || '',
          category: business.category || '',
          phone: business.phone || '',
          email: business.email || '',
          website: business.website || '',
          socialMedia: business.socialMedia || '',
          businessHours: business.businessHours || '',
          description: business.description || ''
        });
      }
      
      // Refresh business data
      await refreshBusinessData();
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit profile update');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Helper to get today's stats from analytics
  // When timeRange is 'day', analytics already contains only today's data
  function getTodayStats(analytics: AnalyticsData | null) {
    // For dashboard view, analytics is already filtered for today only
    const todayViews = analytics?.totalViews || 0;
    const todayClaims = analytics?.totalClaims || 0;
    const todayRedeemed = analytics?.totalRedeemed || 0;
    const conversionRate = analytics?.conversionRate || 0;
    const redemptionRate = analytics?.redemptionRate || 0;
    
    return {
      todayViews,
      todayClaims,
      conversionRate,
      todayRedeemed,
      redemptionRate,
      totalRewards: analytics?.totalRewards || 0,
    };
  }

  const handleDownloadQR = async () => {
    if (qrRef.current) {
      const dataUrl = await toPng(qrRef.current);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QRRewards-QRCode-${business?.zipCode || ''}-${qrLayout}.png`;
      link.click();
    }
  };

  const renderQRLayout = () => {
    const qrValue = `https://www.qrewards.net/claim-reward/${business?.zipCode || ''}`;
    
    const QRRewardCard = ({ size = 'large' }: { size?: 'large' | 'medium' | 'small' | 'tiny' }) => {
      const cardSizes = {
        large: { width: 340, height: 480, qrSize: 170 },
        medium: { width: 200, height: 250, qrSize: 90 },
        small: { width: 140, height: 180, qrSize: 60 },
        tiny: { width: 100, height: 130, qrSize: 40 }
      };
      
      const { width, height, qrSize } = cardSizes[size];
      
      return (
        <div 
          className="relative"
          style={{ 
            width: `min(${width}px, 100%)`, 
            height: `min(${height}px, 100%)`,
            maxWidth: `${width}px`,
            maxHeight: `${height}px`
          }}
        >
          {/* Background Image */}
          <img
            src="/blankReward.png"
            alt="QRewards Card Background"
            className="w-full h-full object-contain"
            style={{ zIndex: 1 }}
          />
          
          {/* QR Code */}
          <div className="absolute left-1/2" style={{ top: '55%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
            <QRCodeCanvas
              value={qrValue}
              size={qrSize}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
      );
    };
    
    switch (qrLayout) {
      case 'single':
        return <QRRewardCard size="large" />;
      
      case '2x2':
        return (
          <div className="w-full max-w-[600px] sm:max-w-[800px] h-auto bg-white p-6 sm:p-12 rounded-xl border-2 border-gray-200">
            <div className="grid grid-cols-2 gap-6 sm:gap-12 justify-items-center">
              {Array.from({ length: 4 }).map((_, index) => (
                <QRRewardCard key={index} size="medium" />
              ))}
            </div>
          </div>
        );
      
      case '3x3':
        return (
          <div className="w-full max-w-[600px] sm:max-w-[800px] h-auto bg-white p-4 sm:p-8 rounded-xl border-2 border-gray-200">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 justify-items-center">
              {Array.from({ length: 9 }).map((_, index) => (
                <QRRewardCard key={index} size="small" />
              ))}
            </div>
          </div>
        );
      
      case '4x4':
        return (
          <div className="w-full max-w-[600px] sm:max-w-[800px] h-auto bg-white p-3 sm:p-6 rounded-xl border-2 border-gray-200">
            <div className="grid grid-cols-4 gap-2 sm:gap-4 justify-items-center">
              {Array.from({ length: 16 }).map((_, index) => (
                <QRRewardCard key={index} size="tiny" />
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Analytics view component
  const AnalyticsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light text-gray-900">{t('analytics')}</h2>
        <button
          onClick={() => {
            setCurrentView('dashboard');
            // Replace current history state to go back to dashboard
            window.history.replaceState({ view: 'dashboard' }, '', window.location.pathname);
          }}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t('backToDashboard')}
        </button>
      </div>
      
      {/* Time Range Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-light text-gray-900">{t('timeRange')}</h3>
          <div className="flex space-x-2">
            {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'day' ? t('day') : range === 'week' ? t('week') : t('month')}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <BarChart3 size={32} className="text-blue-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalViews || 0}
          </div>
          <div className="text-sm text-gray-600">{t('totalViews')}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalClaims || 0}
          </div>
          <div className="text-sm text-gray-600">{t('totalClaims')}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <Target size={32} className="text-orange-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : `${analytics?.conversionRate || 0}%`}
          </div>
          <div className="text-sm text-gray-600">{t('conversionRate')}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <PartyPopper size={32} className="text-purple-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalRedeemed || 0}
          </div>
          <div className="text-sm text-gray-600">{t('totalRedeemed')}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <TrendingUp size={32} className="text-indigo-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : `${analytics?.redemptionRate || 0}%`}
          </div>
          <div className="text-sm text-gray-600">{t('redemptionRate')}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <Gift size={32} className="text-pink-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalRewards || 0}
          </div>
          <div className="text-sm text-gray-600">{t('totalRewards')}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-light text-gray-900 mb-6">{t('claimsOverTime')}</h3>
          <div className="h-64 flex items-end justify-center space-x-2">
            {timeRange === 'day' && analytics?.claimsByDay?.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                  style={{ height: `${Math.max(day.count * 10, 4)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{day.date}</span>
              </div>
            ))}
            {timeRange === 'week' && analytics?.claimsByWeek?.map((week, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                  style={{ height: `${Math.max(week.count * 10, 4)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{week.week}</span>
              </div>
            ))}
            {timeRange === 'month' && analytics?.claimsByMonth?.map((month, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="bg-green-500 rounded-t-lg w-8 transition-all duration-300"
                  style={{ height: `${Math.max(month.count * 10, 4)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-light text-gray-900 mb-6">{t('rewardStatus')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">{t('activeRewards')}</span>
              </div>
              <span className="text-2xl font-light text-gray-900">
                {isLoadingData ? "..." : analytics?.activeRewards || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="font-medium text-gray-900">{t('inactiveRewards')}</span>
              </div>
              <span className="text-2xl font-light text-gray-900">
                {isLoadingData ? "..." : (analytics?.totalRewards || 0) - (analytics?.activeRewards || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reward Analytics */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">{t('rewardPerformance')}</h3>
        <div className="space-y-4">
          {analytics?.rewardAnalytics?.length ? (
            analytics.rewardAnalytics.map((reward, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className="mb-4 text-center">
                  <h4 className="text-lg font-medium text-gray-900">{reward.header}</h4>
                  <div className="text-gray-600 mt-1 mb-2">{reward.subheader}</div>
                  <div className="text-gray-500 text-base">{t('quantity')}</div>
                  <div className="text-2xl font-semibold text-gray-900">{reward.quantity}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.views}</div>
                    <div className="text-sm text-gray-600">{t('views')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.claims}</div>
                    <div className="text-sm text-gray-600">{t('claims')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.redeemed}</div>
                    <div className="text-sm text-gray-600">{t('redeemed')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.conversionRate}%</div>
                    <div className="text-sm text-gray-600">{t('conversion')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.redemptionRate}%</div>
                    <div className="text-sm text-gray-600">{t('redemption')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">
                      {reward.lastRedeemed ? new Date(reward.lastRedeemed).toLocaleDateString() : t('never')}
                    </div>
                    <div className="text-sm text-gray-600">{t('lastRedeemed')}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('noRewards')}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">{t('recentActivity')}</h3>
        <div className="space-y-4">
          {analytics?.recentClaims?.length ? (
            analytics.recentClaims.map((claim, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{t('newRewardClaimed')}</div>
                  <div className="text-sm text-gray-600">{claim.header} • {claim.delivery_method}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(claim.claimed_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('noActivity')}
            </div>
          )}
        </div>
      </div>
    </div>
  );



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  if (!user || !business) {
    return null;
  }

  // Consent banner handlers
  const handleConsentAccept = async () => {
    const sessionToken = sessionStorage.getItem('businessSessionToken');
    if (!sessionToken) return;
    try {
      await fetch('/api/business/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken }),
      });
      setShowConsent(false);
    } catch (error) {
      console.error('Error setting session:', error);
    }
  };
  const handleConsentDeny = () => {
    setShowConsent(false);
  };

  // Logout is now handled by the Header component

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-16">
      <Header 
        onContactClick={() => setShowContactPopup(true)}
        isDashboard={true}
        onSettingsClick={() => {
          setCurrentView('settings');
          // Push state to browser history for settings view
          window.history.pushState({ view: 'settings' }, '', window.location.pathname);
        }}
      />
      {/* Header */}
      <div className={`transition-all duration-700 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            {/* Left side content can go here if needed */}
          </div>

          {/* Business Switcher - Positioned on the right */}
          <div className="flex items-center">
            <BusinessDropdown
              businesses={allBusinesses}
              selectedBusiness={business}
              onBusinessChange={async (selectedBusiness) => {
                // Update the current business in state
                setBusiness(selectedBusiness);
                
                // Update sessionStorage with the new business
                sessionStorage.setItem('businessData', JSON.stringify(selectedBusiness));
                
                // Store the selected business ID as the last used business
                sessionStorage.setItem('lastBusinessId', selectedBusiness.id);
                
                // Store the current view state to restore after reload
                sessionStorage.setItem('currentView', currentView);
                
                // Update the session cookie with the new business ID
                try {
                  const sessionToken = sessionStorage.getItem('businessSessionToken');
                  if (sessionToken) {
                    const response = await fetch('/api/business/set-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        sessionToken,
                        businessId: selectedBusiness.id 
                      }),
                    });
                    
                    if (response.ok) {
                      // Show a brief message before reloading
                      const message = document.createElement('div');
                      message.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: #10B981;
                        color: white;
                        padding: 12px 24px;
                        border-radius: 8px;
                        z-index: 9999;
                        font-weight: 500;
                      `;
                      message.textContent = `Switching to ${selectedBusiness.name}...`;
                      document.body.appendChild(message);
                      
                      // Force page reload to ensure everything updates
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    } else {
                      console.error('Failed to update session for new business');
                    }
                  }
                } catch (error) {
                  console.error('Error updating session for new business:', error);
                }
              }}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Profile Completion Banner */}
        {!isProfileComplete && (
          <div className={`transition-all duration-600 delay-200 ease-in-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Your profile is incomplete
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Please upload your business logo to start creating rewards.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoUpload(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Upload Logo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logo Processing Banner */}
        {isProfileComplete && shouldShowLogoProcessing && (
          <div className={`transition-all duration-600 delay-200 ease-in-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
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
            </div>
          </div>
        )}

        {currentView === 'dashboard' ? (
          <>
            {/* Welcome Section (Demo Style) */}
            <div className={`transition-all duration-1000 delay-200 ease-in-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center justify-center relative">
                    <div 
                      className="cursor-pointer relative group"
                      onClick={() => setShowLogoUpload(true)}
                    >
                      {business?.logo && business.logo.trim() !== '' ? (
                        <img
                          src={
                            business.logo.startsWith('data:') || business.logo.startsWith('http')
                              ? business.logo
                              : getStorageUrlSync(business.logo)
                          }
                          alt="Business Logo"
                          className="w-28 h-28 rounded-full object-contain shadow-md bg-white mr-6 transition-transform group-hover:scale-105"
                          style={{ minWidth: '112px', minHeight: '112px', maxWidth: '128px', maxHeight: '128px' }}
                        />
                      ) : (
                        <div className="mr-6 transition-transform group-hover:scale-105">
                          <DefaultLogo 
                            businessName={business?.name || 'Business'} 
                            size="xl"
                          />
                        </div>
                      )}
                      
                      {/* Camera Icon Overlay */}
                      {showCameraIcon && (
                        <div className="absolute -bottom-4 right-17 transform -translate-x-1/2 transition-opacity duration-2000 ease-in-out">
                          <Camera size={12} className="text-gray-400 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-light text-gray-900">{t('welcomeBack')}, {business?.name || 'Business'}!</h2>
                    <p className="text-gray-600">{t('performanceToday')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Stats Row */}
            <div className={`transition-all duration-600 delay-300 ease-in-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                {(() => {
                  const stats = getTodayStats(analytics);
                  return [
                    { icon: <BarChart3 size={32} className="text-blue-600" />, label: t('todayViews'), value: stats.todayViews },
                    { icon: <CheckCircle size={32} className="text-green-600" />, label: t('todayClaims'), value: stats.todayClaims },
                    { icon: <Target size={32} className="text-orange-600" />, label: t('todayConversion'), value: `${stats.conversionRate}%` },
                    { icon: <PartyPopper size={32} className="text-purple-600" />, label: t('todayRedeemed'), value: stats.todayRedeemed },
                    { icon: <TrendingUp size={32} className="text-indigo-600" />, label: t('todayRedemption'), value: `${stats.redemptionRate}%` },
                    { icon: <Gift size={32} className="text-pink-600" />, label: t('totalRewards'), value: stats.totalRewards },
                  ].map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                      <div className="mb-2">{card.icon}</div>
                      <div className="text-3xl font-light text-gray-900 mb-1">{isLoadingData ? "..." : card.value}</div>
                      <div className="text-sm text-gray-600">{card.label}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`transition-all duration-600 delay-400 ease-in-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
                <h3 className="text-2xl font-light text-gray-900 mb-6">{t('quickActions')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button 
                    onClick={() => handleQuickAction('create')}
                    className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all duration-200 ease-in-out"
                  >
                    <Plus size={24} className="text-green-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{t('createReward')}</div>
                      <div className="text-sm text-gray-600">{t('createRewardDesc')}</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('analytics')}
                    className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all duration-200 ease-in-out"
                  >
                    <BarChart3 size={24} className="text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{t('viewAnalytics')}</div>
                      <div className="text-sm text-gray-600">{t('viewAnalyticsDesc')}</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('qr-code')}
                    className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all duration-200 ease-in-out"
                  >
                    <QrCode size={24} className="text-indigo-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{t('myQRCode')}</div>
                      <div className="text-sm text-gray-600">{t('myQRCodeDesc')}</div>
                    </div>
                  </button>


                </div>
              </div>
            </div>

            {/* Rewards Section */}
            <div key={`rewards-${business?.id}`} className="transition-all duration-600 delay-500 ease-in-out mb-12">
              <div className="mb-6">
                <h3 className="text-2xl font-light text-gray-900">{t('yourRewards')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map((card, idx) => (
                  <div key={`${business?.id}-${card.cardid}-${idx}`} className="group relative">
                    {/* Real Card - exactly like the claim reward page */}
                    <div className="relative w-full max-w-sm mx-auto">
                      <CardAnimation 
                        card={{
                          cardid: card.cardid,
                          header: card.header || business.name,
                          logokey: card.logokey || business.logo,
                          addresstext: card.addresstext || `${business.address}, ${business.city}, ${business.state} ${business.zipCode}`,
                          addressurl: card.addressurl || "",
                          subheader: card.subheader || "Reward description",
                          expires: card.expires || "",
                          quantity: card.quantity,
                          neighborhood: card.neighborhood,
                        }}
                      />
                    </div>
                    {/* Active/Expired Notification above buttons */}
                    <div className="w-full flex justify-center mt-2 mb-2">
                      {(() => {
                        // Use Date.now() for consistent timezone handling
                        const now = Date.now();
                        const exp = new Date(card.expires || "");
                        const isActive = exp.getTime() > now;
                        return (
                          <span className={`text-xs font-semibold ${isActive ? 'text-green-600' : 'text-red-600'}`}
                            style={{ minWidth: 70, textAlign: 'center' }}>
                            {isActive ? t('active') : t('expired')}
                          </span>
                        );
                      })()}
                    </div>
                    {/* Action Buttons - side by side, mobile friendly */}
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleEditReward(card)}
                        className="flex-1 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out shadow-sm border border-blue-100"
                      >
                        <Eye className="w-4 h-4 mr-2" /> {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteReward(card.cardid)}
                        className="flex-1 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out shadow-sm border border-red-100"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" /> {t('delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : currentView === 'analytics' ? (
          <AnalyticsView />
        ) : (
          <SettingsView
            business={business}
            profileFormData={profileFormData}
            isUpdatingProfile={isUpdatingProfile}
            onFieldChange={handleProfileFieldChange}
            onUpdate={handleUpdateProfile}
            onBackToDashboard={() => {
              setCurrentView('dashboard');
              // Replace current history state to go back to dashboard
              window.history.replaceState({ view: 'dashboard' }, '', window.location.pathname);
            }}
            onShowLogoUpload={() => setShowLogoUpload(true)}
            onShowAddBusiness={() => setShowAddBusiness(true)}
            onShowDeleteConfirmation={() => setShowDeleteConfirmation(true)}
          />
        )}

        {/* Create Reward Modal */}
        <CreateRewardForm
          isOpen={showCreateReward}
          onClose={() => setShowCreateReward(false)}
          onSubmit={handleCreateRewardSubmit}
          business={business}
          allBusinesses={allBusinesses}
          onBusinessChange={async (selectedBusiness) => {
            // Update the current business in state
            setBusiness(selectedBusiness);
            
            // Update sessionStorage with the new business
            sessionStorage.setItem('businessData', JSON.stringify(selectedBusiness));
            
            // Store the selected business ID as the last used business
            sessionStorage.setItem('lastBusinessId', selectedBusiness.id);
            
            // Store the current view state to restore after reload
            sessionStorage.setItem('currentView', currentView);
            
            // Set flag to show create reward form after reload
            sessionStorage.setItem('showCreateReward', 'true');
            
            // Update the session cookie with the new business ID
            try {
              const sessionToken = sessionStorage.getItem('businessSessionToken');
              if (sessionToken) {
                const response = await fetch('/api/business/set-session', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    sessionToken,
                    businessId: selectedBusiness.id 
                  }),
                });
                
                if (response.ok) {
                  // Show a brief message before reloading
                  const message = document.createElement('div');
                  message.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #10B981;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    z-index: 9999;
                    font-weight: 500;
                  `;
                  message.textContent = `Switching to ${selectedBusiness.name}...`;
                  document.body.appendChild(message);
                  
                  // Force page reload to ensure everything updates
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                } else {
                  console.error('Failed to update session for new business');
                }
              }
            } catch (error) {
              console.error('Error updating session for new business:', error);
            }
          }}
          isProfileComplete={isProfileComplete}
          isLogoProcessing={isLogoProcessing || false}
          shouldShowLogoProcessing={shouldShowLogoProcessing || false}
        />



        {/* Edit Reward Modal */}
        {showEditReward && editingCard && (
          <EditRewardForm
            card={editingCard}
            onClose={handleCloseEditReward}
            onSuccess={handleEditRewardSuccess}
          />
        )}

        {/* Logo Upload Modal */}
        {showLogoUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-500 animate-fade-in p-2 sm:p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md mx-auto flex flex-col items-center animate-fade-in">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
                onClick={() => setShowLogoUpload(false)}
                aria-label="Close logo upload modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Upload Business Logo</h2>
              <LogoUpload
                currentLogo={business?.logo}
                onUpload={handleLogoUpload}
                businessName={business?.name || "Business"}
              />
            </div>
            <style jsx global>{`
              @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
              .animate-fade-in { animation: fade-in 0.4s; }
            `}</style>
          </div>
        )}

        {/* Add Business Modal */}
        <AddBusinessForm
          isOpen={showAddBusiness}
          onClose={() => setShowAddBusiness(false)}
          onSubmit={handleAddBusinessSubmit}
        />
      </div>

      {/* QR Code Modal */}
      {showQRCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-6xl mx-auto flex flex-col items-center max-h-[95vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 z-10"
              onClick={() => setShowQRCodeModal(false)}
              aria-label={t('closeButton')}
            >
              <X size={24} />
            </button>
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-center">{t('myQRCodeTitle')}</h3>
            
            {/* Layout Selector */}
            <div className="mb-4 sm:mb-6 w-full max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 text-center">{t('chooseLayout')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'single', label: t('single'), description: t('large') },
                  { value: '2x2', label: t('grid2x2'), description: t('medium') },
                  { value: '3x3', label: t('grid3x3'), description: t('small') },
                  { value: '4x4', label: t('grid4x4'), description: t('tiny') }
                ].map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() => setQrLayout(layout.value as 'single' | '2x2' | '3x3' | '4x4')}
                    className={`p-2 sm:p-3 rounded-xl border-2 transition-all ${
                      qrLayout === layout.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-medium">{layout.label}</div>
                    <div className="text-xs text-gray-500">{layout.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* QR Code Display */}
            <div ref={qrRef} className="flex justify-center w-full p-4">
              {renderQRLayout()}
            </div>
            
            <button
              className="mb-4 sm:mb-6 mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow transition-all text-sm sm:text-base"
              onClick={handleDownloadQR}
            >
              {qrLayout === 'single' ? t('downloadSingle') : qrLayout === '2x2' ? t('download4') : qrLayout === '3x3' ? t('download9') : t('download16')}
            </button>
            <p className="mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm text-center px-4">
              {qrLayout === 'single' 
                ? t('qrInstructions')
                : t('qrInstructionsMulti').replace('{count}', qrLayout === '2x2' ? '4' : qrLayout === '3x3' ? '9' : '16')
              }
            </p>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action will permanently delete:
              </p>
              <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  All your business information
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  All uploaded logos and images
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  All created rewards and their data
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  All analytics and claim history
                </li>
              </ul>
              <p className="text-red-600 text-sm font-medium mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  disabled={isDeletingAccount}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConsent && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-full max-w-md px-4">
          <div className="bg-white/90 border border-gray-200 shadow-xl rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex-1 text-gray-800 text-sm mb-2 sm:mb-0">
              Stay logged in? We use cookies to keep you signed in and personalize your experience.
            </div>
            <div className="flex gap-2">
              <button onClick={handleConsentAccept} className="px-4 py-2 bg-green-100 hover:bg-green-200 rounded-xl text-green-700 font-medium text-sm transition-colors border border-green-300 shadow-sm">Stay logged in</button>
              <button onClick={handleConsentDeny} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium text-sm transition-colors border border-gray-300 shadow-sm">No thanks</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Popup */}
      {showContactPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
          <ContactPopup onClose={() => setShowContactPopup(false)} />
        </div>
      )}
    </main>
  );
} 