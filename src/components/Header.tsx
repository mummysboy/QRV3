"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  return (
    <div className="w-full flex justify-end p-4 bg-green-800 text-white">
      <div className="relative" ref={menuRef}>
        <button
          id="menuToggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex flex-col justify-center items-center gap-1 w-10 h-6"
        >
          <span className="block w-6 h-0.5 bg-white" />
          <span className="block w-6 h-0.5 bg-white" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded z-50">
            {user && business ? (
              // Logged in user menu
              <>
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <Link
                  href="/business/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onContactClick();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                >
                  Contact
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              // Non-logged in user menu
              <>
                <Link
                  href="/business/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                >
                  Business Login
                </Link>
                <Link
                  href="/business/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                >
                  Business Signup
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onContactClick();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Contact
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
