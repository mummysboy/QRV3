"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CreateRewardForm from "@/components/CreateRewardForm";
import EditRewardForm from "@/components/EditRewardForm";
import LogoUpload from "@/components/LogoUpload";
import CardAnimation from "@/components/CardAnimation";
import AddBusinessForm, { AddBusinessData } from "@/components/AddBusinessForm";
import { getStorageUrlSync } from "@/lib/storage";
import { Plus, BarChart3, Building2, Settings, Eye, ArrowRight, CheckCircle, Target, PartyPopper, TrendingUp, Gift, QrCode } from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { X } from "lucide-react";
import { getCookie } from "@/lib/utils";


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
  const qrRef = useRef<HTMLDivElement>(null);

  // Consent banner state
  const [showConsent, setShowConsent] = useState(false);


  const router = useRouter();

  // Function to fetch user and business data from session
  const fetchUserDataFromSession = async () => {
    try {
      const response = await fetch('/api/business/check-session');
      const data = await response.json();
      
      if (data.hasSession && data.user && data.business) {
        setUser(data.user);
        setBusiness(data.business);
        console.log('🔍 Dashboard - Loaded user and business data from session');
      } else {
        console.error('🔍 Dashboard - No valid session data');
        router.push('/business/login');
      }
    } catch (error) {
      console.error('🔍 Dashboard - Error fetching user data from session:', error);
      router.push('/business/login');
    }
  };


  // Check if profile is complete
  const isProfileComplete = Boolean(business?.logo && business.logo.trim() !== '');

  // Check if logo is still processing (give it 30 seconds to process)
  const isLogoProcessing = logoProcessing && logoProcessingStartTime && 
    (Date.now() - logoProcessingStartTime) < 30000; // 30 seconds

  // Check if we should show logo processing message
  const shouldShowLogoProcessing = isLogoProcessing || 
    (business?.logo && business.logo.trim() !== '' && !isLogoProcessing && logoProcessingStartTime && 
     (Date.now() - logoProcessingStartTime) < 60000); // Show for 1 minute after upload

  useEffect(() => {
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

    // If no sessionStorage data, check if we have a valid session cookie
    if (!userData || !businessData) {
      const checkSessionAndRedirect = async () => {
        try {
          const response = await fetch('/api/business/check-session');
          const data = await response.json();
          
          if (data.hasSession) {
            console.log('🔍 Dashboard - Valid session cookie exists, fetching user data...');
            // We have a valid session, so we should stay on dashboard
            // Fetch user and business data from the session
            await fetchUserDataFromSession();
            setIsLoading(false);
            return;
          } else {
            console.log('🔍 Dashboard - No valid session, redirecting to login');
            router.push('/business/login');
            return;
          }
        } catch (error) {
          console.error('🔍 Dashboard - Error checking session:', error);
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
      
      console.log('🔍 Dashboard - Loaded business data:', businessObj);
      console.log('🔍 Dashboard - Business logo:', businessObj.logo);
      console.log('🔍 Dashboard - Business logo type:', typeof businessObj.logo);
      console.log('🔍 Dashboard - Business logo length:', businessObj.logo ? businessObj.logo.length : 0);
      
      setUser(userObj);
      setBusiness(businessObj);
      

    } catch (error) {
      console.error('Error parsing session data:', error);
      router.push('/business/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (business?.id) {
      fetchDashboardData();
    }
  }, [business?.id, currentView, timeRange]);

  // Refresh business data if logo is missing
  useEffect(() => {
    if (business?.id && (!business.logo || business.logo.trim() === '')) {
      console.log('🔄 Business logo is missing, refreshing data...');
      refreshBusinessData();
    }
  }, [business?.id, business?.logo]);

  useEffect(() => {
    if (user?.email) {
      fetchAllBusinesses();
    }
  }, [user?.email]);

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

  // Check for session and show consent banner if needed
  useEffect(() => {
    console.log('🔍 Dashboard - Consent check starting...');
    const sessionToken = sessionStorage.getItem('businessSessionToken');
    console.log('🔍 Dashboard - sessionToken:', sessionToken ? 'present' : 'missing');
    
    // Check if we have a valid session cookie via API
    const checkSession = async () => {
      try {
        const response = await fetch('/api/business/check-session');
        const data = await response.json();
        console.log('🔍 Dashboard - Session check result:', data);
        
        if (data.hasSession) {
          console.log('🔍 Dashboard - Valid session cookie exists, hiding consent banner');
          setShowConsent(false);
        } else if (sessionToken) {
          console.log('🔍 Dashboard - No cookie but has sessionToken, showing consent banner');
          setShowConsent(true);
        } else {
          console.log('🔍 Dashboard - No cookie or sessionToken, hiding consent banner');
          setShowConsent(false);
        }
      } catch (error) {
        console.error('🔍 Dashboard - Error checking session:', error);
        // Fallback: show consent banner if we have sessionToken
        if (sessionToken) {
          setShowConsent(true);
        }
      }
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);


  const fetchAllBusinesses = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/business/my-businesses', {
        headers: {
          'x-user-email': user.email,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllBusinesses(data.businesses || []);
      }
    } catch (error) {
      console.error('Error fetching all businesses:', error);
    }
  };

  // Add function to refresh business data from database
  const refreshBusinessData = async () => {
    if (!business?.id) return;
    
    try {
      console.log('🔄 Refreshing business data from database...');
      const response = await fetch(`/api/business/get-business?businessId=${business.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.business) {
          console.log('✅ Business data refreshed:', data.business);
          console.log('📋 Logo field:', data.business.logo);
          
          // Update session storage with fresh data
          sessionStorage.setItem('businessData', JSON.stringify(data.business));
          setBusiness(data.business);
        }
      } else {
        console.error('❌ Failed to refresh business data:', response.status);
      }
    } catch (error) {
      console.error('❌ Error refreshing business data:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!business?.id) return;
    
    setIsLoadingData(true);
    try {
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
  };





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
        alert('Reward deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete reward');
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert('Failed to delete reward');
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
        alert('Reward created successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to create reward:', error);
        alert(error.error || 'Failed to create reward');
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      alert('Failed to create reward');
    }
  };

  const handleQuickAction = (action: 'create' | 'analytics' | 'settings' | 'add-business' | 'qr-code') => {
    switch (action) {
      case 'create':
        // Refresh business data before opening create reward form
        refreshBusinessData().then(() => {
          setShowCreateReward(true);
        });
        break;
      case 'analytics':
        setCurrentView('analytics');
        break;
      case 'settings':
        setCurrentView('settings');
        break;
      case 'add-business':
        setShowAddBusiness(true);
        break;
      case 'qr-code':
        setShowQRCodeModal(true);
        break;
    }
  };

  const handleAddBusinessSubmit = async (data: AddBusinessData) => {
    try {
      const response = await fetch('/api/business/add-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
          'x-user-firstname': user?.firstName || '',
          'x-user-lastname': user?.lastName || '',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add business');
      }

      setShowAddBusiness(false);
      alert('Business added successfully! It is now pending approval from our admin team.');
      // Refresh the business list
      fetchAllBusinesses();
    } catch (error) {
      console.error('Error adding business:', error);
      throw error;
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
        medium: { width: 240, height: 300, qrSize: 115 },
        small: { width: 160, height: 200, qrSize: 80 },
        tiny: { width: 120, height: 150, qrSize: 60 }
      };
      
      const { width, height, qrSize } = cardSizes[size];
      
      return (
        <div 
          className="relative"
          style={{ width: `${width}px`, height: `${height}px` }}
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
          <div className="w-full max-w-[680px] h-auto bg-white p-4 sm:p-8 rounded-xl border-2 border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 justify-items-center">
              {Array.from({ length: 4 }).map((_, index) => (
                <QRRewardCard key={index} size="medium" />
              ))}
            </div>
          </div>
        );
      
      case '3x3':
        return (
          <div className="w-full max-w-[680px] h-auto bg-white p-3 sm:p-6 rounded-xl border-2 border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 justify-items-center">
              {Array.from({ length: 9 }).map((_, index) => (
                <QRRewardCard key={index} size="small" />
              ))}
            </div>
          </div>
        );
      
      case '4x4':
        return (
          <div className="w-full max-w-[680px] h-auto bg-white p-2 sm:p-4 rounded-xl border-2 border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 justify-items-center">
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
        <h2 className="text-3xl font-light text-gray-900">Analytics</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      {/* Time Range Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-light text-gray-900">Time Range</h3>
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
                {range.charAt(0).toUpperCase() + range.slice(1)}
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
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalClaims || 0}
          </div>
          <div className="text-sm text-gray-600">Total Claims</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <Target size={32} className="text-orange-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : `${analytics?.conversionRate || 0}%`}
          </div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <PartyPopper size={32} className="text-purple-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalRedeemed || 0}
          </div>
          <div className="text-sm text-gray-600">Total Redeemed</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <TrendingUp size={32} className="text-indigo-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : `${analytics?.redemptionRate || 0}%`}
          </div>
          <div className="text-sm text-gray-600">Redemption Rate</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="mb-2">
            <Gift size={32} className="text-pink-600" />
          </div>
          <div className="text-3xl font-light text-gray-900 mb-1">
            {isLoadingData ? "..." : analytics?.totalRewards || 0}
          </div>
          <div className="text-sm text-gray-600">Total Rewards</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-light text-gray-900 mb-6">Claims Over Time</h3>
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
          <h3 className="text-2xl font-light text-gray-900 mb-6">Reward Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Active Rewards</span>
              </div>
              <span className="text-2xl font-light text-gray-900">
                {isLoadingData ? "..." : analytics?.activeRewards || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="font-medium text-gray-900">Inactive Rewards</span>
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
        <h3 className="text-2xl font-light text-gray-900 mb-6">Reward Performance</h3>
        <div className="space-y-4">
          {analytics?.rewardAnalytics?.length ? (
            analytics.rewardAnalytics.map((reward, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className="mb-4 text-center">
                  <h4 className="text-lg font-medium text-gray-900">{reward.header}</h4>
                  <div className="text-gray-600 mt-1 mb-2">{reward.subheader}</div>
                  <div className="text-gray-500 text-base">Quantity</div>
                  <div className="text-2xl font-semibold text-gray-900">{reward.quantity}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.views}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.claims}</div>
                    <div className="text-sm text-gray-600">Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.redeemed}</div>
                    <div className="text-sm text-gray-600">Redeemed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.conversionRate}%</div>
                    <div className="text-sm text-gray-600">Conversion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">{reward.redemptionRate}%</div>
                    <div className="text-sm text-gray-600">Redemption</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-gray-900 mb-1">
                      {reward.lastRedeemed ? new Date(reward.lastRedeemed).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-sm text-gray-600">Last Redeemed</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No rewards found
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {analytics?.recentClaims?.length ? (
            analytics.recentClaims.map((claim, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">New reward claimed</div>
                  <div className="text-sm text-gray-600">{claim.header} • {claim.delivery_method}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(claim.claimed_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Settings view component
  const SettingsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light text-gray-900">Settings</h2>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Business Profile</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              value={business?.name || ""}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={business?.address || ""}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={business?.city || ""}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={business?.state || ""}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                value={business?.zipCode || ""}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={business?.category || ""}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
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
                    className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 logo-fallback absolute top-0 left-0"
                    style={{ display: 'none' }}
                  >
                                      <div className="text-center">
                    <Building2 className="w-8 h-8 text-gray-500 mx-auto" />
                    <span className="text-gray-400 text-xs block mt-1">Logo not found</span>
                  </div>
                  </div>
                </div>
              ) : null}
              <div 
                className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 logo-fallback"
                style={{ display: business?.logo && business.logo.trim() !== '' ? 'none' : 'flex' }}
              >
                <div className="text-center">
                  <Building2 className="w-8 h-8 text-gray-500 mx-auto" />
                  <span className="text-gray-400 text-xs block mt-1">No logo</span>
                </div>
              </div>
              <button
                onClick={() => setShowLogoUpload(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Upload Logo
              </button>
            </div>

          </div>

        </div>
      </div>


    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
    console.log('🔍 Consent Accept - sessionToken:', sessionToken ? 'present' : 'missing');
    if (!sessionToken) return;
    console.log('🔍 Consent Accept - calling set-session API...');
    try {
      const response = await fetch('/api/business/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken }),
      });
      console.log('🔍 Consent Accept - API response status:', response.status);
      const responseData = await response.json();
      console.log('🔍 Consent Accept - API response data:', responseData);
      console.log('🔍 Consent Accept - API call completed');
      setShowConsent(false);
      // Check if cookie was set via API
      setTimeout(async () => {
        try {
          const checkResponse = await fetch('/api/business/check-session');
          const checkData = await checkResponse.json();
          console.log('🔍 Consent Accept - Cookie check after API call:', checkData);
        } catch (error) {
          console.error('🔍 Consent Accept - Error checking cookie:', error);
        }
      }, 100);
      // Optionally, remove the sessionToken from sessionStorage
      // sessionStorage.removeItem('businessSessionToken');
    } catch (error) {
      console.error('🔍 Consent Accept - API call failed:', error);
    }
  };
  const handleConsentDeny = () => {
    setShowConsent(false);
  };

  // Logout is now handled by the Header component

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-16">
      {/* Header */}
      <div className={`transition-all duration-700 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            {/* Removed the <h1>Business Dashboard</h1> banner/header from the dashboard view */}
            
            {/* Business Switcher */}
            {allBusinesses.length > 1 && (
              <div className="ml-6">
                <select
                  value={business?.id || ''}
                  onChange={(e) => {
                    const selectedBusiness = allBusinesses.find(b => b.id === e.target.value);
                    if (selectedBusiness) {
                      setBusiness(selectedBusiness);
                      sessionStorage.setItem('businessData', JSON.stringify(selectedBusiness));
                    }
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {allBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.status === 'pending_approval' && '(Pending)'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Removed duplicate logout button - using header navigation instead */}
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
                  <div className="flex items-center justify-center">
                    {business?.logo && business.logo.trim() !== '' ? (
                      <img
                        src={
                          business.logo.startsWith('data:') || business.logo.startsWith('http')
                            ? business.logo
                            : getStorageUrlSync(business.logo)
                        }
                        alt="Business Logo"
                        className="w-28 h-28 rounded-full object-contain shadow-md bg-white mr-6"
                        style={{ minWidth: '112px', minHeight: '112px', maxWidth: '128px', maxHeight: '128px' }}
                      />
                    ) : (
                      <span className="text-4xl text-gray-600">🏪</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-light text-gray-900">Welcome back, {business?.name || 'Business'}!</h2>
                    <p className="text-gray-600">Here&rsquo;s how your rewards are performing today</p>
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
                    { icon: <BarChart3 size={32} className="text-blue-600" />, label: 'Today\'s Views', value: stats.todayViews },
                    { icon: <CheckCircle size={32} className="text-green-600" />, label: 'Today\'s Claims', value: stats.todayClaims },
                    { icon: <Target size={32} className="text-orange-600" />, label: 'Today\'s Conversion', value: `${stats.conversionRate}%` },
                    { icon: <PartyPopper size={32} className="text-purple-600" />, label: 'Today\'s Redeemed', value: stats.todayRedeemed },
                    { icon: <TrendingUp size={32} className="text-indigo-600" />, label: 'Today\'s Redemption', value: `${stats.redemptionRate}%` },
                    { icon: <Gift size={32} className="text-pink-600" />, label: 'Total Rewards', value: stats.totalRewards },
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
                <h3 className="text-2xl font-light text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <button 
                    onClick={() => handleQuickAction('create')}
                    className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all duration-200 ease-in-out"
                  >
                    <Plus size={24} className="text-green-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Create Reward</div>
                      <div className="text-sm text-gray-600">New offer in seconds</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('analytics')}
                    className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all duration-200 ease-in-out"
                  >
                    <BarChart3 size={24} className="text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">View Analytics</div>
                      <div className="text-sm text-gray-600">Detailed insights</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('qr-code')}
                    className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all duration-200 ease-in-out"
                  >
                    <QrCode size={24} className="text-indigo-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">My QR Code</div>
                      <div className="text-sm text-gray-600">Download & print</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('add-business')}
                    className="flex items-center space-x-4 p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-all duration-200 ease-in-out"
                  >
                    <Building2 size={24} className="text-orange-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Add Business</div>
                      <div className="text-sm text-gray-600">Register new location</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('settings')}
                    className="flex items-center space-x-4 p-4 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-all duration-200 ease-in-out"
                  >
                    <Settings size={24} className="text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Settings</div>
                      <div className="text-sm text-gray-600">Manage account</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Rewards Section */}
            <div className="transition-all duration-600 delay-500 ease-in-out mb-12">
              <div className="mb-6">
                <h3 className="text-2xl font-light text-gray-900">Your Rewards</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map((card, idx) => (
                  <div key={idx} className="group relative">
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
                        }}
                      />
                    </div>
                    {/* Active/Expired Notification above buttons */}
                    <div className="w-full flex justify-center mt-2 mb-2">
                      {(() => {
                        const now = new Date();
                        const exp = new Date(card.expires || "");
                        const isActive = exp.getTime() > now.getTime();
                        return (
                          <span className={`text-xs font-semibold ${isActive ? 'text-green-600' : 'text-red-600'}`}
                            style={{ minWidth: 70, textAlign: 'center' }}>
                            {isActive ? 'Active' : 'Expired'}
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
                        <Eye className="w-4 h-4 mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReward(card.cardid)}
                        className="flex-1 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out shadow-sm border border-red-100"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" /> Delete
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
          <SettingsView />
        )}

        {/* Create Reward Modal */}
        <CreateRewardForm
          isOpen={showCreateReward}
          onClose={() => setShowCreateReward(false)}
          onSubmit={handleCreateRewardSubmit}
          business={{
            id: business.id,
            name: business.name,
            address: business.address,
            city: business.city,
            state: business.state,
            zipCode: business.zipCode,
            category: business.category,
            logo: business.logo,
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
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 z-10"
              onClick={() => setShowQRCodeModal(false)}
              aria-label="Close QR code modal"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-center">My QRewards Code</h3>
            
            {/* Layout Selector */}
            <div className="mb-4 sm:mb-6 w-full max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 text-center">Choose Layout</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'single', label: 'Single', description: '1 Large' },
                  { value: '2x2', label: '2x2', description: '4 Medium' },
                  { value: '3x3', label: '3x3', description: '9 Small' },
                  { value: '4x4', label: '4x4', description: '16 Tiny' }
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
            <div ref={qrRef} className="flex justify-center w-full">
              {renderQRLayout()}
            </div>
            
            <button
              className="mb-4 sm:mb-6 mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow transition-all text-sm sm:text-base"
              onClick={handleDownloadQR}
            >
              Download {qrLayout === 'single' ? 'Single' : qrLayout === '2x2' ? '4 QR Codes' : qrLayout === '3x3' ? '9 QR Codes' : '16 QR Codes'}
            </button>
            <p className="mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm text-center px-4">
              {qrLayout === 'single' 
                ? 'Print and post this card anywhere you want to find customers!'
                : `Print and cut out ${qrLayout === '2x2' ? '4' : qrLayout === '3x3' ? '9' : '16'} QR codes to place around your business!`
              }
            </p>
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
    </main>
  );
} 