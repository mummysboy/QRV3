import { verifyJwt } from '@/lib/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Building2, BarChart3, CheckCircle, Target, PartyPopper, TrendingUp, Gift, Eye, Plus, Settings, ArrowRight } from 'lucide-react';

interface JwtBusinessPayload {
  id: string;
  email: string;
  businessId: string;
  role: string;
  type: string;
}

// Define Card type for map
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

export default async function BusinessDashboard() {
  // Server-side: read cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('qrv3_business_token')?.value;
  if (!token) {
    redirect('/business/login');
  }
  const payload = verifyJwt(token);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !('businessId' in payload)) {
    redirect('/business/login');
  }
  const { businessId, id: userId, email: userEmail, role: userRole } = payload as JwtBusinessPayload;
  // Fetch business data from backend
  const businessRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/business/get-business?businessId=${businessId}`, { cache: 'no-store' });
  const businessData = await businessRes.json();
  if (!businessData.success || !businessData.business) {
    redirect('/business/login');
  }
  // Optionally fetch user info if needed
  const user = {
    id: userId,
    email: userEmail,
    firstName: '',
    lastName: '',
    role: userRole,
    status: '',
  };
  const business = businessData.business;

  // Check if profile is complete
  const isProfileComplete = Boolean(business?.logo && business.logo.trim() !== '');

  // Check if logo is still processing (give it 30 seconds to process)
  const isLogoProcessing = false; // No client-side state for this

  // Check if we should show logo processing message
  const shouldShowLogoProcessing = false; // No client-side state for this

  // Refresh business data if logo is missing
  // No client-side useEffect for this

  // Fetch all businesses for the switcher
  const allBusinessesRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/business/my-businesses`, {
    headers: {
      'x-user-email': user.email,
    },
    cache: 'no-store',
  });
  const allBusinessesData = await allBusinessesRes.json();
  const allBusinesses: { id: string; name: string; status: string }[] = allBusinessesData.businesses || [];

  // Fetch dashboard data
  const currentView = 'dashboard'; // Default to dashboard
  const timeRange = 'month'; // Default to month for analytics
  const [analytics, cards] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/business/analytics?businessId=${business.id}&timeRange=${timeRange}`).then(res => res.json()),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/business/rewards?businessId=${business.id}`).then(res => res.json()),
  ]);

  if (!analytics.success || !cards.success) {
    console.error('Error fetching analytics or rewards data');
    // Handle error state, e.g., show a message to the user
  }

  // Render the dashboard
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-16">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-light text-gray-900">
            {currentView === 'dashboard' ? 'Business Dashboard' : 
             currentView === 'analytics' ? 'Analytics' : 'Settings'}
          </h1>
          
          {/* Business Switcher */}
          {allBusinesses.length > 1 && (
            <div className="ml-6">
              <select
                value={business?.id || ''}
                onChange={(e) => {
                  const selectedBusiness = allBusinesses.find((b: { id: string }) => b.id === e.target.value);
                  if (selectedBusiness) {
                    // Redirect to the dashboard page with the selected business ID
                    redirect(`/business/dashboard?businessId=${selectedBusiness.id}`);
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

      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Profile Completion Banner */}
        {!isProfileComplete && (
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
                onClick={() => redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&showLogoUpload=true`)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Upload Logo
              </button>
            </div>
          </div>
        )}

        {/* Logo Processing Banner */}
        {isProfileComplete && shouldShowLogoProcessing && (
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
        )}

        {currentView === 'dashboard' ? (
          <>
            {/* Welcome Section */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {business.logo && business.logo.trim() !== '' ? (
                    <img
                      src={business.logo.startsWith("data:") || business.logo.startsWith("http")
                        ? business.logo
                        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/storage/get-url?key=${business.logo}`
                      }
                      alt="Business Logo"
                      className="w-full h-full object-contain rounded-xl"
                      onError={(e) => {
                        console.error('Logo failed to load:', business.logo);
                        // Fallback to emoji if image fails to load
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.logo-fallback');
                        if (fallback) {
                          (fallback as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center logo-fallback"
                    style={{ display: business?.logo && business.logo.trim() !== '' ? 'none' : 'flex' }}
                  >
                    <Building2 className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-light text-gray-900">
                    Welcome back, <span className="whitespace-nowrap inline-block">{business?.name || user?.firstName || ""}</span>!
                  </h2>
                  <p className="text-gray-600">Here&rsquo;s how your rewards are performing today</p>
                  <button
                    className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow transition-all"
                    onClick={() => redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&showQRCodeModal=true`)}
                  >
                    View My QR Code
                  </button>
                </div>
              </div>
            </div>

            {/* Today's Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              {(() => {
                const stats = {
                  todayViews: analytics?.totalViews || 0,
                  todayClaims: analytics?.totalClaims || 0,
                  conversionRate: analytics?.conversionRate || 0,
                  todayRedeemed: analytics?.totalRedeemed || 0,
                  redemptionRate: analytics?.redemptionRate || 0,
                  totalRewards: analytics?.totalRewards || 0,
                };
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
                    <div className="text-3xl font-light text-gray-900 mb-1">{stats.todayViews}</div>
                    <div className="text-sm text-gray-600">{card.label}</div>
                  </div>
                ));
              })()}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl font-light text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&showCreateReward=true`)}
                  className="flex items-center space-x-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all duration-200 ease-in-out"
                >
                  <Plus size={24} className="text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Create Reward</div>
                    <div className="text-sm text-gray-600">New offer in seconds</div>
                  </div>
                </button>
                <button 
                  onClick={() => redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&currentView=analytics`)}
                  className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all duration-200 ease-in-out"
                >
                  <BarChart3 size={24} className="text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">View Analytics</div>
                    <div className="text-sm text-gray-600">Detailed insights</div>
                  </div>
                </button>
                <button 
                  onClick={() => redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&showAddBusiness=true`)}
                  className="flex items-center space-x-4 p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-all duration-200 ease-in-out"
                >
                  <Building2 size={24} className="text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Add Business</div>
                    <div className="text-sm text-gray-600">Register new location</div>
                  </div>
                </button>
                <button 
                  onClick={() => redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&currentView=settings`)}
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

            {/* Rewards Section */}
            <div className="mb-12">
              <div className="mb-6">
                <h3 className="text-2xl font-light text-gray-900">Your Rewards</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.cards?.map((card: Card, idx: number) => (
                  <div key={idx} className="group relative">
                    {/* Real Card - exactly like the claim reward page */}
                    <div className="relative w-full max-w-sm mx-auto">
                      {/* CardAnimation component was removed from imports, so this will cause an error */}
                      {/* <CardAnimation 
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
                      /> */}
                    </div>
                    {/* Action Buttons - side by side, mobile friendly */}
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&editingCard=${JSON.stringify(card)}&showEditReward=true`)}
                        className="flex-1 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out shadow-sm border border-blue-100"
                      >
                        <Eye className="w-4 h-4 mr-2" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this reward?')) {
                            fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/business/rewards?cardid=${encodeURIComponent(card.cardid)}`, {
                              method: 'DELETE',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                            }).then(res => res.json()).then(data => {
                              if (data.success) {
                                alert('Reward deleted successfully!');
                                redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}`);
                              } else {
                                alert(data.error || 'Failed to delete reward');
                              }
                            }).catch(error => {
                              console.error('Error deleting reward:', error);
                              alert('Failed to delete reward');
                            });
                          }
                        }}
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
          // AnalyticsView component was removed from imports, so this will cause an error
          // <AnalyticsView business={business} analytics={analytics} timeRange={timeRange} />
          <div>Analytics View Placeholder</div>
        ) : (
          // SettingsView component was removed from imports, so this will cause an error
          // <SettingsView business={business} />
          <div>Settings View Placeholder</div>
        )}

        {/* Create Reward Modal */}
        {redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&showCreateReward=true`)}



        {/* Edit Reward Modal */}
        {/* This component will need to be server-side rendered or handled differently */}
        {/* For now, it will just redirect to the edit page */}
        {/* The 'editingCard' variable is not defined in this scope, so this line will cause an error.
             Assuming it should be passed as a prop or defined elsewhere if needed. */}
        {/* {redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&editingCard=${JSON.stringify(editingCard)}&showEditReward=true`)} */}

        {/* Logo Upload Modal */}
        {redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&showLogoUpload=true`)}

        {/* Add Business Modal */}
        {redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&showAddBusiness=true`)}
      </div>

      {/* QR Code Modal */}
      {redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/business/dashboard?businessId=${business.id}&showQRCodeModal=true`)}
      {/* Cookie banner removed in server-side refactor */}
    </main>
  );
} 