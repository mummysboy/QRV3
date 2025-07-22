"use client";

// QRewards Homepage - Apple-inspired design with business and customer flows
import { useState, useEffect } from "react";
import LogoVideo from "@/components/LogoVideo";
import BusinessSignupForm, { BusinessSignupData } from "@/components/BusinessSignupForm";
import { FileText, CheckCircle, Gift, Smartphone, Mail, Building2, ArrowRight, Zap, Target, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

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
      business: "Brew & Bean",
      text: "So easy to set up. I created my first offer in under 2 minutes and had customers using it the same day. We've seen a 40% increase in afternoon traffic since using QR Rewards.",
      rating: 5,
      date: "2 weeks ago"
    },
    {
      name: "Sarah Johnson",
      role: "Boutique Owner",
      business: "Style Haven",
      text: "Love being able to create new offers instantly when we have slow periods. It really helps bring in extra customers. Our conversion rate went from 15% to 28% in just one month!",
      rating: 5,
      date: "1 week ago"
    },
    {
      name: "David Rodriguez",
      role: "Restaurant Manager",
      business: "Taco Fiesta",
      text: "Perfect for our afternoon slump. We can quickly create a happy hour special and have it live in seconds. Last week we filled 20 empty tables during our slow period.",
      rating: 5,
      date: "3 days ago"
    },
    {
      name: "Emily Chen",
      role: "Salon Owner",
      business: "Glamour Studio",
      text: "No complicated software to learn. I can update our offers from my phone whenever I want. Our clients love the instant rewards and we've increased our repeat bookings by 35%.",
      rating: 5,
      date: "5 days ago"
    },
    {
      name: "Michael Thompson",
      role: "Gym Owner",
      business: "FitLife Gym",
      text: "Great for filling empty class spots. I can create a last-minute offer and get people in the door quickly. We've increased our class attendance by 45% since implementing QR Rewards.",
      rating: 5,
      date: "1 week ago"
    },
    {
      name: "Lisa Park",
      role: "Bookstore Owner",
      business: "Chapter & Verse",
      text: "Simple and effective. Our customers love the instant rewards and we love how easy it is to manage. We've seen a 60% increase in foot traffic during our slow periods.",
      rating: 5,
      date: "4 days ago"
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

  // Navigation handlers for reviews
  const handlePreviousReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const businessSteps = [
    {
      title: "Sign up",
      caption:
        "Create your business profile and enter your location and brand info.",
      icon: FileText,
      color:
        "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border border-blue-100",
    },
    {
      title: "Get Approved",
      caption:
        "We verify your business and give you access to the dashboard.",
      icon: CheckCircle,
      color:
        "bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 border border-green-100",
    },
    {
      title: "Start Creating Rewards",
      caption:
        "Create AI-assisted advertisements that drive customers in real-time.",
      icon: Gift,
      color:
        "bg-gradient-to-br from-purple-50 to-violet-50 text-purple-600 border border-purple-100",
    },
  ];

  const customerSteps = [
    {
      title: "Discover Rewards",
      caption:
        "Customers generate a reward by scanning a QR code located in your area.",
      icon: Smartphone,
      color:
        "bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 border border-cyan-100",
    },
    {
      title: "Claim via Email or SMS",
      caption:
        "If relevant, customers will claim and receive the reward via email or SMS.",
      icon: Mail,
      color:
        "bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 border border-orange-100",
    },
    {
      title: "Redeem In-Store",
      caption:
        "Fast, easy redemption with just two taps in-store—no POS integration needed.",
      icon: Building2,
      color:
        "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 border border-emerald-100",
    },
  ];

  return (
    <main className="relative min-h-screen bg-white text-gray-900 overflow-hidden force-center home-page-text-center force-center-grid">
      {/* Enhanced animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.06),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(168,85,247,0.04),transparent_50%)]"></div>
      </div>

      {/* Logo Section - Minimal spacing from header */}
      <div
        className={`transition-all duration-1000 ease-out pt-17 w-full ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ background: "white" }}
      >
        <div className="flex justify-center items-center w-full">
          <LogoVideo />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full py-12 md:py-16 lg:py-20">
        <div
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Main headline */}
          <div
            className={`transition-all duration-1000 delay-300 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 mb-6 tracking-tight leading-tight text-center"
              style={{ textAlign: "center" }}
            >
              Helping small businesses increase profit margins
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl text-slate-600 font-light mb-8 tracking-wide max-w-3xl mx-auto text-center"
              style={{ textAlign: "center" }}
            >
              A low-cost, high-impact tool that allows you to advertise in real-time
            </p>
          </div>

          {/* Subtitle */}
          <div
            className={`transition-all duration-1000 delay-600 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <p
              className="text-base sm:text-lg text-slate-700 mb-12 max-w-2xl mx-auto leading-relaxed text-center"
              style={{ textAlign: "center" }}
            >
              Create real-time ads that respond to your workday. Whether it’s a
              rush or a lull, launch smart AI-assisted advertisements that bring in high-value
              customers.
            </p>
          </div>

          {/* Hero CTA Buttons */}
          <div
            className={`transition-all duration-1000 delay-900 ease-out flex flex-col items-center ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl shadow-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl mb-14 mt-10"
            >
              Start Free Trial
            </button>

            {/* Social Media Icons */}
            <div className="flex flex-col items-center space-y-3">
              <p className="text-sm text-slate-500 font-medium">
                Follow us on social media
              </p>
              <div className="flex items-center space-x-6">
                <a
                  href="#"
                  className="group transition-all duration-300"
                  aria-label="Follow us on Instagram"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                      fill="url(#instagram-gradient)"
                    />
                    <defs>
                      <linearGradient
                        id="instagram-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                  </svg>
                </a>
                <a
                  href="#"
                  className="group transition-all duration-300"
                  aria-label="Follow us on Facebook"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      fill="#1877F2"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="group transition-all duration-300"
                  aria-label="Follow us on TikTok"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                      fill="#000000"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: How Customers Redeem Rewards */}
      <section
        id="customer-steps"
        data-animate="slide-left"
        className={`transition-all duration-1000 ease-out force-center ${
          visibleSections.has("customer-steps")
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-12"
        }`}
      >
        <div
          className="w-full py-8 md:py-12 lg:py-16 text-center force-center"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className="text-center max-w-4xl mx-auto mb-8 force-center"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 tracking-tight text-slate-800 text-center"
              style={{ textAlign: "center", width: "100%" }}
            >
              How Customers Use QRewards
            </h2>
            <p
              className="text-slate-600 max-w-3xl mx-auto text-center"
              style={{ textAlign: "center", width: "100%" }}
            >
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
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-md`}
                >
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800 text-center">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base text-center">
                  {step.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Customer CTA */}
          <div className="text-center">
            <div className="mb-2 text-gray-500 text-base font-medium">Get the full customer experience!</div>
            <button
              onClick={() => setShowCustomerDemo(true)}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl shadow-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <span>Demo the Customer Experience</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 1: How Businesses Use QRewards */}
      <section
        id="business-steps"
        data-animate="slide-up"
        className={`transition-all duration-1000 ease-out bg-gradient-to-br from-slate-50 to-blue-50/30 force-center ${
          visibleSections.has("business-steps")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-12"
        }`}
      >
        <div
          className="w-full py-16 md:py-20 lg:py-24 text-center force-center"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className="text-center max-w-4xl mx-auto mb-16 force-center"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 tracking-tight text-slate-800 text-center !text-center"
              style={{ textAlign: "center", width: "100%" }}
            >
              How Businesses Use QRewards
            </h2>
            <p
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto text-center !text-center"
              style={{ textAlign: "center", width: "100%" }}
            >
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
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-md`}
                >
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800 text-center">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base text-center">
                  {step.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Business CTA */}
          <div className="text-center">
            <div className="mb-2 text-gray-500 text-base font-medium">Test our simple dashboard!</div>
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

      {/* Benefits section - Clean grid */}
      <section
        id="benefits"
        data-animate="fade-scale"
        className={`transition-all duration-1000 ease-out bg-gradient-to-br from-slate-50 to-purple-50/30 ${
          visibleSections.has("benefits")
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
      >
        <div className="w-full py-16 md:py-20 lg:py-24 text-center">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 tracking-tight text-slate-800 text-center"
              style={{ textAlign: "center" }}
            >
              Why Choose QRewards
            </h2>
            <p
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto text-center"
              style={{ textAlign: "center" }}
            >
              Powerful features that make customer acquisition simple and
              effective
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            <div className="text-center p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-slate-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-50 to-amber-50 text-amber-600 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Zap size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800 text-center">
                Instant Setup
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base text-center">
                Get your first reward live in under 2 minutes. No technical
                skills required.
              </p>
            </div>

            <div className="text-center p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-slate-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-50 to-pink-50 text-red-600 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Target size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800 text-center">
                Local Customers
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base text-center">
                Attract customers already in your area with location-based
                rewards.
              </p>
            </div>

            <div className="text-center p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-slate-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-xl md:text-2xl font-medium mb-4 text-slate-800 text-center">
                Track Results
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base text-center">
                See exactly how many customers your rewards are bringing in with
                real-time analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews section - Ultra Elegant */}
      <section
        id="reviews"
        data-animate="slide-right"
        className={`transition-all duration-1000 ease-out ${
          visibleSections.has("reviews")
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-12"
        }`}
      >
        <div className="w-full py-12 md:py-16 lg:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 tracking-tight text-slate-800">
              What our customers say
            </h2>
            <p
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto text-center"
              style={{ textAlign: "center" }}
            >
              Local businesses trust QR Rewards to grow their customer base
            </p>
          </div>

          {/* Carousel container */}
          <div className="relative max-w-3xl mx-auto">
            {/* Navigation arrows - ultra subtle */}
            <button
              onClick={handlePreviousReview}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 flex items-center justify-center hover:bg-white/80 transition-all duration-200 -translate-x-4 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={handleNextReview}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-slate-200/50 flex items-center justify-center hover:bg-white/80 transition-all duration-200 translate-x-4 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>

            {/* Review cards */}
            <div
              className="relative h-72 md:h-80 overflow-hidden px-8 group"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-800 ease-out ${
                    currentReview === index
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-full"
                  }`}
                >
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 md:p-10 shadow-sm border border-slate-200/30 h-full flex flex-col justify-center">
                    {/* Review text */}
                    <blockquote className="text-slate-700 text-lg md:text-xl mb-12 leading-relaxed text-center font-light">
                      &ldquo;{review.text}&rdquo;
                    </blockquote>

                    {/* Reviewer info - minimal */}
                    <div className="text-center">
                      <p className="font-medium text-slate-900 text-base mb-1">
                        {review.name}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {review.role} • {review.business}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots indicator - minimal */}
            <div className="flex justify-center space-x-1.5 mt-16">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    currentReview === index
                      ? "bg-slate-500"
                      : "bg-slate-300 hover:bg-slate-400"
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
          visibleSections.has("final-cta")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-16"
        }`}
      >
        <div className="w-full py-8 md:py-12 lg:py-16 text-center">
          <div className="text-center max-w-4xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 tracking-tight text-slate-800 text-center"
              style={{ textAlign: "center" }}
            >
              Ready to get more customers?
            </h2>
            <div className="flex flex-col items-center mb-6">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-lg font-medium px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl mb-14 mt-10"
              >
                Start Your Free Trial
              </button>
              <p className="text-base md:text-lg text-slate-500 text-center">
                Free to start • No setup fees • Cancel anytime
              </p>

              {/* Social Media Icons */}
              <div className="flex flex-col items-center space-y-3">
                <p className="text-sm text-slate-500 font-medium">
                  Follow us on social media
                </p>
                <div className="flex items-center space-x-6">
                  <a
                    href="#"
                    className="group transition-all duration-300"
                    aria-label="Follow us on Instagram"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                        fill="url(#instagram-gradient-2)"
                      />
                      <defs>
                        <linearGradient
                          id="instagram-gradient-2"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#f09433" />
                          <stop offset="25%" stopColor="#e6683c" />
                          <stop offset="50%" stopColor="#dc2743" />
                          <stop offset="75%" stopColor="#cc2366" />
                          <stop offset="100%" stopColor="#bc1888" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="group transition-all duration-300"
                    aria-label="Follow us on Facebook"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        fill="#1877F2"
                      />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="group transition-all duration-300"
                    aria-label="Follow us on TikTok"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                        fill="#000000"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle footer */}
      <footer className="w-full relative z-10 border-t border-slate-200/60 py-12 mt-20 bg-white">
        <div className="w-full text-center">
          <p className="text-slate-500 text-base md:text-lg text-center">
            © 2024 QRewards. Connecting businesses with customers.
          </p>
        </div>
      </footer>

      {/* Customer Demo Modal */}
      {showCustomerDemo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200/60">
            <h3 className="text-2xl font-semibold mb-6 text-slate-800">
              Try the Customer Experience
            </h3>
            <p className="text-slate-600 mb-8">
              Enter your zip code to see available rewards in your area:
            </p>
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
