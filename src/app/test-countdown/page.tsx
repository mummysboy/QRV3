"use client";

import { useState } from "react";
import CardAnimation from "@/components/CardAnimation";

export default function TestCountdownPage() {
  const [testCard] = useState({
    cardid: "test-countdown",
    header: "Test Business",
    subheader: "This is a test reward that expires in less than 24 hours",
    addresstext: "123 Test St, Test City, TS",
    addressurl: "https://example.com",
    logokey: "",
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    quantity: 10
  });

  const [regularCard] = useState({
    cardid: "test-regular",
    header: "Regular Business",
    subheader: "This is a regular reward that expires in more than 24 hours",
    addresstext: "456 Regular St, Regular City, RC",
    addressurl: "https://example.com",
    logokey: "",
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    quantity: 10
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Countdown Timer Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card with countdown timer (expires in < 24 hours) */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Card with Countdown Timer</h2>
            <p className="text-sm text-gray-600 mb-4">
              This card expires in 2 hours, so it should show a countdown timer instead of a date.
            </p>
            <CardAnimation card={testCard} />
          </div>

          {/* Regular card (expires in > 24 hours) */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Regular Card</h2>
            <p className="text-sm text-gray-600 mb-4">
              This card expires in 3 days, so it should show a regular date.
            </p>
            <CardAnimation card={regularCard} />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">How it works</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Cards that expire in <strong>less than 24 hours</strong> show a countdown timer (HH:MM:SS)</li>
            <li>• Cards that expire in <strong>more than 24 hours</strong> show a regular date</li>
            <li>• The countdown timer updates every second</li>
            <li>• When the countdown reaches 00:00:00, the card is considered expired</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 