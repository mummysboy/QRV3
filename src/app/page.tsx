"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoVideo from "@/components/LogoVideo";

export default function Home() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState("");

  const handleGetStarted = () => {
    if (zipCode.trim()) {
      router.push(`/claim-reward/${zipCode.trim()}`);
    } else {
      // Default to a sample zip code if none provided
      router.push("/claim-reward/12345");
    }
  };

  const handleEnterZipCode = (e: React.FormEvent) => {
    e.preventDefault();
    handleGetStarted();
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header with Logo */}
      <LogoVideo />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Boost Your Business with
            <span className="block text-green-600">QR Code Rewards</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Attract more customers and increase foot traffic with our innovative 
            QR code advertising platform. Showcase your rewards to local customers instantly!
          </p>

          {/* Demo Section */}
          <div className="max-w-md mx-auto mb-12">
            <p className="text-lg text-gray-700 mb-4">See how it works:</p>
            <form onSubmit={handleEnterZipCode} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter zip code to demo"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:border-green-500 focus:outline-none transition-colors"
                maxLength={10}
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                View Demo
              </button>
            </form>
          </div>
        </div>

        {/* Business Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 mb-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Increase Foot Traffic</h3>
            <p className="text-gray-600">
              Drive more customers to your location with engaging QR code rewards that create excitement and urgency.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Cost-Effective Advertising</h3>
            <p className="text-gray-600">
              Reach local customers without expensive traditional advertising. Pay only for results, not impressions.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Track Performance</h3>
            <p className="text-gray-600">
              Get detailed analytics on reward claims, customer engagement, and ROI to optimize your campaigns.
            </p>
          </div>
        </div>

        {/* How It Works for Businesses */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works for Your Business</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Create Your Reward</h3>
              <p className="text-gray-600 text-sm">
                Set up your exclusive offer with our easy-to-use dashboard
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Get Your QR Code</h3>
              <p className="text-gray-600 text-sm">
                Receive a unique QR code to display in your business
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Customers Scan & Claim</h3>
              <p className="text-gray-600 text-sm">
                Local customers discover and claim your rewards instantly
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Grow Your Business</h3>
              <p className="text-gray-600 text-sm">
                Watch your customer base and sales increase
              </p>
            </div>
          </div>
        </div>

        {/* Business Types Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-8 mb-16 text-white">
          <h2 className="text-3xl font-bold text-center mb-8">Perfect for All Business Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z" />
                </svg>
              </div>
              <h3 className="font-semibold">Restaurants</h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-semibold">Retail Stores</h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Service Providers</h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold">Local Businesses</h3>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of local businesses already using our platform to attract more customers!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white text-xl font-semibold px-12 py-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Start Advertising Today
            </button>
            <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-xl font-semibold px-12 py-4 rounded-full transition-all duration-200">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 QR Rewards. Helping local businesses grow through innovative advertising solutions.
          </p>
        </div>
      </footer>
    </main>
  );
}
