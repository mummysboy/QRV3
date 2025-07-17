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

      const responseData = await response.json();

      if (!response.ok) {
        // Throw error with the specific message from the API
        throw new Error(responseData.error || 'Failed to submit business signup');
      }

      // Do not close the signup form here; let the form handle its own overlay
    } catch (error) {
      console.error('Error submitting business signup:', error);
      // Re-throw the error so the form component can handle it
      throw error;
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