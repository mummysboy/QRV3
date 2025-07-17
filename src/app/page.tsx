"use client";

import { useState, useEffect } from "react";
import LogoVideo from "@/components/LogoVideo";
import BusinessSignupForm, { BusinessSignupData } from "@/components/BusinessSignupForm";
// Remove import of BusinessSignupSuccess

export default function Home() {
  const [zipCode, setZipCode] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);
  const [showBusinessSignupForm, setShowBusinessSignupForm] = useState(false);
  // Remove showBusinessSignupSuccess state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isHowItWorksVisible, setIsHowItWorksVisible] = useState(false);

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

  // Intersection Observer for "How it works" section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHowItWorksVisible(true);
        } else {
          setIsHowItWorksVisible(false);
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    const howItWorksSection = document.getElementById('how-it-works-section');
    if (howItWorksSection) {
      observer.observe(howItWorksSection);
    }

    return () => {
      if (howItWorksSection) {
        observer.unobserve(howItWorksSection);
      }
    };
  }, []);

  // Auto-advance sections for demo effect - only when visible
  useEffect(() => {
    if (!isHowItWorksVisible) return;
    
    const interval = setInterval(() => {
      setCurrentSection((prev) => (prev + 1) % 4);
    }, 6000); // Slower timing - increased from 4000ms to 6000ms
    return () => clearInterval(interval);
  }, [isHowItWorksVisible]);

  // Auto-advance reviews for demo effect - slower timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 12000); // Increased from 8000ms to 12000ms
    return () => clearInterval(interval);
  }, [reviews.length]);

  const handleGetStarted = () => {
    setShowBusinessSignupForm(true);
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
        // Throw error with the specific message from the API
        throw new Error(responseData.error || 'Failed to submit business signup');
      }

      setShowBusinessSignupForm(false); // Optionally close the form, or leave open for overlay
      // Do not show BusinessSignupSuccess
    } catch (error) {
      console.error('Error submitting business signup:', error);
      // Re-throw the error so the form component can handle it
      throw error;
    }
  };

  const handleCloseBusinessSignupForm = () => {
    setShowBusinessSignupForm(false);
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

  // Restore handleEnterZipCode for the zip code demo form
  const handleEnterZipCode = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedZipCode = zipCode.trim();
    if (trimmedZipCode) {
      // Basic zip code validation (5 digits or 5+4 format)
      const zipCodeRegex = /^\d{5}(-\d{4})?$/;
      if (zipCodeRegex.test(trimmedZipCode)) {
        window.open(`/claim-reward/${trimmedZipCode}`, '_blank');
      } else {
        alert('Please enter a valid zip code (e.g., 12345 or 12345-6789)');
      }
    } else {
      alert('Please enter a zip code');
    }
  };

  const sections = [
    {
      title: "Scan",
      subtitle: "A simple QR code",
      description: "Customers scan with their phone camera",
      icon: "📱"
    },
    {
      title: "Claim",
      subtitle: "Instant reward",
      description: "No apps, no accounts, just tap to claim",
      icon: "✨"
    },
    {
      title: "Visit",
      subtitle: "Bring them in",
      description: "Customers come to redeem their reward",
      icon: "🏪"
    },
    {
      title: "Grow",
      subtitle: "Build relationships",
      description: "Turn one-time visitors into loyal customers",
      icon: "📈"
    }
  ];

  return (
    <main className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_50%)]"></div>
      </div>

      {/* Header with Logo */}
      <div className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="flex justify-between items-center p-4">
          <LogoVideo />
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main headline with staggered animation */}
          <div className={`transition-all duration-1000 delay-300 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <h1 className="text-6xl md:text-8xl font-light text-gray-900 mb-6 tracking-tight">
              Get more customers with rewards
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 font-light mb-12 tracking-wide">
              Join thousands of businesses using QR Rewards to attract and retain customers
            </p>
          </div>

          {/* Subtitle with fade-in */}
          <div className={`transition-all duration-1000 delay-600 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-lg md:text-xl text-gray-700 mb-16 max-w-2xl mx-auto leading-relaxed">
              Create instant rewards that customers can claim with a simple QR code scan. 
              No apps, no complicated setup - just more customers walking through your door.
            </p>
          </div>

          {/* Interactive demo section */}
          <div className={`transition-all duration-1000 delay-900 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 shadow-xl max-w-md mx-auto mb-8">
              <p className="text-gray-800 mb-6 text-lg font-medium">See how it works</p>
              <form onSubmit={handleEnterZipCode} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter any zip code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-6 py-4 text-lg bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none transition-all duration-300 shadow-sm"
                  maxLength={10}
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-medium px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Try It Now
                </button>
              </form>
            </div>
            {/* Preview Business Dashboard Button */}
            <div className="flex justify-center mb-16">
              <a
                href="/demo-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-black/80 hover:bg-black text-white px-8 py-4 rounded-2xl shadow-xl font-medium text-lg transition-all duration-300 backdrop-blur-xl border border-gray-900/10"
                style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
              >
                <span>Preview Business Dashboard</span>
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M17 17V7H7"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* How it works - Minimalist carousel */}
        <div 
          id="how-it-works-section"
          className={`transition-all duration-1000 delay-1200 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-16 tracking-tight">
              How it works
            </h2>
            
            {/* Section indicators */}
            <div className="flex justify-center mb-12">
              <div className="flex space-x-3">
                {sections.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-700 ${
                      currentSection === index 
                        ? 'bg-green-500 scale-125' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content carousel */}
            <div className="relative h-64 mb-8">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-2000 ease-in-out ${
                    currentSection === index
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-6 animate-pulse">
                      {section.icon}
                    </div>
                    <h3 className="text-3xl font-light mb-4 tracking-wide">
                      {section.title}
                    </h3>
                    <p className="text-xl text-green-500 mb-3 font-medium">
                      {section.subtitle}
                    </p>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits section - Clean grid */}
        <div className={`transition-all duration-1000 delay-1500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-medium mb-4">Instant Setup</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your first reward live in under 2 minutes. No technical skills required.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-medium mb-4">Local Customers</h3>
              <p className="text-gray-600 leading-relaxed">
                Attract customers already in your area with location-based rewards.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-medium mb-4">Track Results</h3>
              <p className="text-gray-600 leading-relaxed">
                See exactly how many customers your rewards are bringing in with real-time analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Reviews section - Carousel */}
        <div className={`transition-all duration-1000 delay-1800 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight">
              Loved by businesses
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              See what local business owners are saying about QR Rewards
            </p>
          </div>
          
          {/* Carousel container */}
          <div className="relative max-w-4xl mx-auto mb-12">
            {/* Review cards with swipe functionality */}
            <div 
              className="relative h-80 overflow-hidden cursor-grab active:cursor-grabbing"
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
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full flex flex-col justify-center">
                    <div className="text-center mb-6">
                      <h4 className="font-semibold text-gray-900 text-xl mb-2">{review.name}</h4>
                      <p className="text-sm text-gray-600">{review.role}</p>
                    </div>
                    <div className="flex justify-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg italic text-center">
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-3">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReview(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-700 ${
                      currentReview === index 
                        ? 'bg-green-500 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA - Minimalist */}
        <div className={`transition-all duration-1000 delay-2100 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight">
              Ready to get more customers?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of businesses already using QR rewards to connect with their community.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white text-xl font-medium px-12 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl"
            >
              Start Your Free Trial
            </button>
            <p className="text-sm text-gray-500 mt-6">
              Free to start • No setup fees • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Subtle footer */}
      <footer className="relative z-10 border-t border-gray-200 py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 QR Rewards. Connecting businesses with communities.
          </p>
        </div>
      </footer>

      {/* Business Signup Form Modal */}
      <BusinessSignupForm
        isOpen={showBusinessSignupForm}
        onClose={handleCloseBusinessSignupForm}
        onSubmit={handleBusinessSignupSubmit}
      />
      {/* Remove BusinessSignupSuccess modal */}
    </main>
  );
}
