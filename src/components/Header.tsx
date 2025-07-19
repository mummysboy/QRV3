"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Mail, LogOut, Lock, Rocket, User } from "lucide-react";

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

export default function Header({
  onContactClick,
}: {
  onContactClick: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log('Header component mounted');
  }, []);

  // Check if user is logged into dashboard
  useEffect(() => {
    const userData = sessionStorage.getItem('businessUser');
    const businessData = sessionStorage.getItem('businessData');

    if (userData && businessData) {
      try {
        const userObj = JSON.parse(userData);
        const businessObj = JSON.parse(businessData);
        setUser(userObj);
        setBusiness(businessObj);
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
  }, []);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 10;
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setScrolled(isScrolled);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close menu on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('businessUser');
    sessionStorage.removeItem('businessData');
    setIsMenuOpen(false);
    router.push('/business/login');
  };

  const handleMenuToggle = () => {
    console.log('Menu toggle clicked, current state:', isMenuOpen);
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 w-full text-white shadow-lg z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-emerald-700 shadow-xl' 
          : 'bg-emerald-600'
      } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      style={{ 
        minHeight: '64px',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.15)'
      }}
    >
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold text-white hover:text-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <span className="text-white">
                QRewards
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Show for logged in users */}
          {user && business && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/business/dashboard"
                className="text-white !text-white hover:text-gray-100 transition-all duration-300 hover:scale-105 font-medium"
                style={{ color: 'white !important' }}
              >
                Dashboard
              </Link>
              <button
                onClick={onContactClick}
                className="text-white !text-white hover:text-gray-100 transition-all duration-300 hover:scale-105 font-medium"
                style={{ color: 'white !important' }}
              >
                Contact
              </button>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 border border-white/20"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Desktop Navigation - Show for non-logged in users */}
          {!user && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/business/login"
                className="text-white hover:text-gray-100 transition-all duration-300 hover:scale-105 font-medium"
                style={{ color: 'white !important' }}
              >
                Login
              </Link>
              <Link
                href="/business/signup"
                className="text-white hover:text-gray-100 transition-all duration-300 hover:scale-105 font-medium"
                style={{ color: 'white !important' }}
              >
                Sign up
              </Link>
              <button
                onClick={onContactClick}
                className="text-white hover:text-gray-100 transition-all duration-300 hover:scale-105 font-medium"
                style={{ color: 'white !important' }}
              >
                Contact
              </button>
            </div>
          )}

          {/* Hamburger Menu */}
          <div className="relative md:hidden" ref={menuRef}>
            <button
              id="menuToggle"
              onClick={handleMenuToggle}
              className={`flex flex-col justify-center items-center gap-1 w-10 h-10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent ${
                isMenuOpen 
                  ? 'bg-white/20 border border-white/30' 
                  : 'hover:bg-white/10 border border-white/20'
              }`}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-gray-900 shadow-xl rounded-xl border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-300">
                {user && business ? (
                  // Logged in user menu
                  <>
                    <div className="px-6 py-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/business/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left px-6 py-4 hover:bg-gray-50 border-b border-gray-100 transition-all duration-200 text-sm font-medium group"
                    >
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-900">Dashboard</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onContactClick();
                      }}
                      className="block w-full text-left px-6 py-4 hover:bg-gray-50 border-b border-gray-100 transition-all duration-200 text-sm font-medium group"
                    >
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span>Contact</span>
                      </div>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-6 py-4 text-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-medium group rounded-b-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <LogOut className="w-5 h-5 text-gray-600" />
                        <span>Sign out</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Non-logged in user menu */}
                    <Link
                      href="/business/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left px-6 py-4 hover:bg-gray-50 border-b border-gray-100 transition-all duration-200 text-sm font-medium group"
                    >
                      <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <span>Login</span>
                      </div>
                    </Link>
                    <Link
                      href="/business/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left px-6 py-4 hover:bg-gray-50 border-b border-gray-100 transition-all duration-200 text-sm font-medium group"
                    >
                      <div className="flex items-center space-x-3">
                        <Rocket className="w-5 h-5 text-gray-600" />
                        <span>Signup</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onContactClick();
                      }}
                      className="block w-full text-left px-6 py-4 hover:bg-gray-50 transition-all duration-200 text-sm font-medium group rounded-b-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span>Contact</span>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
