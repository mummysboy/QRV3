"use client";

// QRewards Homepage - Apple-inspired design with business and customer flows
import { useState, useEffect } from "react";
import LogoVideo from "@/components/LogoVideo";
import BusinessSignupForm, { BusinessSignupData } from "@/components/BusinessSignupForm";
import { FileText, CheckCircle, Gift, Smartphone, Mail, Building2, ArrowRight, Zap, Target, BarChart3 } from "lucide-react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);
  const [showBusinessSignupForm, setShowBusinessSignupForm] = useState(false);
  const [showCustomerDemo, setShowCustomerDemo] = useState(false);
  const [customerZipCode, setCustomerZipCode] = useState("");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const reviews = [
    {
      name: "Marcus Chen",
      role: "Coffee Shop Owner",
      text: "So easy to set up. I created my first offer in under 2 minutes and had customers using it the same day."
    },
    {
      name: "Sarah Johnson",
      role: "Boutique Owner",
      text: "Love being able to create new offers instantly when we have slow periods. It really helps bring in extra customers."
    },
    {
      name: "David Rodriguez",
      role: "Restaurant Manager",
      text: "Perfect for our afternoon slump. We can quickly create a happy hour special and have it live in seconds."
    },
    {
      name: "Emily Chen",
      role: "Salon Owner",
      text: "No complicated software to learn. I can update our offers from my phone whenever I want."
    },
    {
      name: "Michael Thompson",
      role: "Gym Owner",
      text: "Great for filling empty class spots. I can create a last-minute offer and get people in the door quickly."
    },
    {
      name: "Lisa Park",
      role: "Bookstore Owner",
      text: "Simple and effective. Our customers love the instant rewards and we love how easy it is to manage."
    }
  ];

  // Progressive reveal effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  // Auto-advance reviews for demo effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const handleGetStarted = () => {
    setShowBusinessSignupForm(true);
  };

  const handleDemoDashboard = () => {
    console.log('Demo dashboard button clicked');
    window.open('/demo-dashboard', '_blank');
  };

  const handleBusinessSignupSubmit = async (data: BusinessSignupData) => {
    try {
      const response = await fetch('/api/business-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit business signup');
      }

      setShowBusinessSignupForm(false);
    } catch (error) {
      console.error('Error submitting business signup:', error);
      throw error;
    }
  };

  const handleCloseBusinessSignupForm = () => {
    setShowBusinessSignupForm(false);
  };

  const handleCustomerDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedZipCode = customerZipCode.trim();
    if (trimmedZipCode) {
      const zipCodeRegex = /^\d{5}(-\d{4})?$/;
      if (zipCodeRegex.test(trimmedZipCode)) {
        window.open(`/claim-reward/${trimmedZipCode}`, '_blank');
        setShowCustomerDemo(false);
        setCustomerZipCode("");
      } else {
        alert('Please enter a valid zip code (e.g., 12345 or 12345-6789)');
      }
    } else {
      alert('Please enter a zip code');
    }
  };

  const handleCloseCustomerDemo = () => {
    setShowCustomerDemo(false);
    setCustomerZipCode("");
  };

  // Swipe handlers for reviews carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }
    if (isRightSwipe) {
      setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  const businessSteps = [
    {
      title: "Sign up",
      caption: "Create your business profile and enter your location and brand info.",
      icon: FileText,
      color: "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border border-blue-100"
    },
    {
      title: "Get Approved",
      caption: "We verify your business to keep the platform clean and trustworthy.",
      icon: CheckCircle,
      color: "bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 border border-green-100"
    },
    {
      title: "Start Creating Rewards",
      caption: "Make compelling QR or geo-rewards your customers can redeem in-store.",
      icon: Gift,
      color: "bg-gradient-to-br from-purple-50 to-violet-50 text-purple-600 border border-purple-100"
    }
  ];

  const customerSteps = [
    {
      title: "Discover Rewards",
      caption: "Customers scan a QR code or tap on a geo-targeted ad.",
      icon: Smartphone,
      color: "bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 border border-cyan-100"
    },
    {
      title: "Claim via Email or SMS",
      caption: "They receive the reward directly to their inbox or phone.",
      icon: Mail,
      color: "bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 border border-orange-100"
    },
    {
      title: "Redeem In-Store",
      caption: "Fast, easy redemption with a few taps in-store.",
      icon: Building2,
      color: "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 border border-emerald-100"
    }
  ];

  return (
    <main className="relative min-h-screen bg-white text-gray-900 overflow-hidden pt-20">
      {/* Enhanced animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.06),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(168,85,247,0.04),transparent_50%)]"></div>
      </div>

      {/* Logo Section - Positioned below header */}
      <div className={`transition-all duration-1000 ease-out pt-4 pb-12 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="flex justify-center items-center">
          <LogoVideo />
        </div>
      </div>
  
      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <div className={`transition-all duration-1000 delay-300 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 mb-6 tracking-tight leading-tight">
              Helping small businesses do big things
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 font-light mb-8 tracking-wide max-w-3xl mx-auto">
              Low-cost, high-impact tools to attract and retain customers
            </p>
          </div>

          {/* Subtitle */}
          <div className={`transition-all duration-1000 delay-600 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-base sm:text-lg text-slate-700 mb-12 max-w-2xl mx-auto leading-relaxed">
              Create instant rewards that customers can claim with a simple QR code scan. 
              No apps, no complicated setup - just more customers walking through your door.
            </p>
          </div>

          {/* Hero CTA Buttons */}
          <div className={`transition-all duration-1000 delay-900 ease-out flex flex-col sm:flex-row gap-6 justify-center items-center ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
     
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Start Free Trial
            </button>

          </div>
        </div>
      </section>

      {/* Section 1: How Businesses Use QRewards */}
      <section 
        id="business-steps"
        data-animate="slide-up"
        className={`transition-all duration-1000 ease-out bg-gradient-to-br from-slate-50 to-blue-50/30 ${
          visibleSections.has('business-steps') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 tracking-tight text-slate-800">
              How Businesses Use QRewards
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Simple steps to start attracting more customers to your business
            </p>
          </div>

          {/* Business Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            {businessSteps.map((step, index) => (
              <div 
                key={index}
                className="text-center p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-slate-300"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-md`}>
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  {step.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Business CTA */}
          <div className="text-center">
            <button
              onClick={handleDemoDashboard}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <span>Demo the Business Dashboard</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: How Customers Redeem Rewards */}
      <section 
        id="customer-steps"
        data-animate="slide-left"
        className={`transition-all duration-1000 ease-out ${
          visibleSections.has('customer-steps') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
        }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 tracking-tight text-slate-800">
              How Customers Redeem Rewards
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              A seamless experience that keeps customers coming back
            </p>
          </div>

          {/* Customer Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            {customerSteps.map((step, index) => (
              <div 
                key={index}
                className="text-center p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-slate-300"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-md`}>
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  {step.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Customer CTA */}
          <div className="text-center">
            <button
              onClick={() => setShowCustomerDemo(true)}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <span>Demo the Customer Experience</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Benefits section - Clean grid */}
      <section 
        id="benefits"
        data-animate="fade-scale"
        className={`transition-all duration-1000 ease-out bg-gradient-to-br from-slate-50 to-purple-50/30 ${
          visibleSections.has('benefits') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 tracking-tight text-slate-800">
              Why Choose QRewards
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful features that make customer acquisition simple and effective
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            <div className="text-center p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-slate-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-50 to-amber-50 text-amber-600 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Zap size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800">Instant Setup</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                Get your first reward live in under 2 minutes. No technical skills required.
              </p>
            </div>
            
            <div className="text-center p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-slate-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-50 to-pink-50 text-red-600 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Target size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800">Local Customers</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                Attract customers already in your area with location-based rewards.
              </p>
            </div>
            
            <div className="text-center p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-slate-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800">Track Results</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                See exactly how many customers your rewards are bringing in with real-time analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews section - Carousel */}
      <section 
        id="reviews"
        data-animate="slide-right"
        className={`transition-all duration-1000 ease-out ${
          visibleSections.has('reviews') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
        }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 tracking-tight text-slate-800">
              Loved by businesses
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              See what local business owners are saying about QR Rewards
            </p>
          </div>
          
          {/* Carousel container */}
          <div className="relative max-w-5xl mx-auto mb-16">
            {/* Review cards with swipe functionality */}
            <div 
              className="relative h-80 md:h-96 overflow-hidden cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1500 ease-out ${
                    currentReview === index
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200/60 h-full flex flex-col justify-center">
                    <p className="text-gray-700 text-lg md:text-xl mb-8 italic leading-relaxed">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 text-lg md:text-xl">{review.name}</p>
                      <p className="text-gray-600 text-base md:text-lg">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Dots indicator */}
            <div className="flex justify-center space-x-3 mt-8">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                    currentReview === index 
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 scale-125 shadow-md' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Minimalist */}
      <section 
        id="final-cta"
        data-animate="bounce-up"
        className={`transition-all duration-1000 ease-out ${
          visibleSections.has('final-cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 text-center">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 tracking-tight text-slate-800">
              Ready to get more customers?
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg font-medium px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                Start Your Free Trial
              </button>
            </div>
            <p className="text-base md:text-lg text-slate-500">
              Free to start • No setup fees • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Subtle footer */}
      <footer className="relative z-10 border-t border-slate-200/60 py-12 mt-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-base md:text-lg">
            © 2024 QR Rewards. Connecting businesses with communities.
          </p>
        </div>
      </footer>

      {/* Customer Demo Modal */}
      {showCustomerDemo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200/60">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800">Try the Customer Experience</h3>
            <p className="text-slate-600 mb-8">Enter your zip code to see available rewards in your area:</p>
            <form onSubmit={handleCustomerDemoSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Enter zip code (e.g., 12345)"
                value={customerZipCode}
                onChange={(e) => setCustomerZipCode(e.target.value)}
                className="w-full border border-slate-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white/80 backdrop-blur-sm"
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-all duration-150 text-lg shadow-md hover:shadow-lg"
                >
                  View Rewards
                </button>
                <button
                  type="button"
                  onClick={handleCloseCustomerDemo}
                  className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-4 rounded-lg font-medium transition-colors duration-150 text-lg bg-white/80 backdrop-blur-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Signup Modal */}
      {showBusinessSignupForm && (
        <BusinessSignupForm
          isOpen={showBusinessSignupForm}
          onSubmit={handleBusinessSignupSubmit}
          onClose={handleCloseBusinessSignupForm}
        />
      )}
    </main>
  );
}
