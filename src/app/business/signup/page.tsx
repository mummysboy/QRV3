"use client";

import { useState } from "react";
import BusinessSignupForm, { BusinessSignupData } from "@/components/BusinessSignupForm";

export default function BusinessSignup() {
  const [showSignupForm, setShowSignupForm] = useState(true);

  const handleSignupSubmit = async (data: BusinessSignupData) => {
    try {
      const response = await fetch('/api/business-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit business signup');
      }

      // Do not close the signup form here; let the form handle its own overlay
    } catch (error) {
      console.error('Error submitting business signup:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit business signup. Please try again.');
    }
  };

  const handleCloseSignupForm = () => {
    setShowSignupForm(false);
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <>
      {showSignupForm ? (
        <BusinessSignupForm
          isOpen={showSignupForm}
          onClose={handleCloseSignupForm}
          onSubmit={handleSignupSubmit}
        />
      ) : null}
    </>
  );
} 