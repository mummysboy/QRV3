"use client";

import { useState, useEffect } from "react";

interface SignupSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function SignupSuccess({ isOpen, onClose, message }: SignupSuccessProps) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => setShow(true), 10);
    return () => setShow(false);
  }, []);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShow(false);
      setTimeout(onClose, 350); // match transition duration
    }
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 transition-colors duration-350 ${show ? 'bg-neutral-100/80' : 'bg-neutral-100/0'}`}
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-8 text-center transition-all duration-350 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Thank You!</h2>
        <p className="text-gray-600 mb-6 leading-relaxed text-base sm:text-lg">
          {message || "Your application has been submitted successfully. We'll review your information and send you an email when your account is approved."}
        </p>
        <button
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 350);
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
} 