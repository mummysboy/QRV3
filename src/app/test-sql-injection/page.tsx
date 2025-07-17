"use client";

import { useState } from "react";
import { detectSQLInjection, showSQLInjectionPopup } from "@/utils/sqlInjectionDetector";

export default function TestSQLInjection() {
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Check for SQL injection attempts
    if (detectSQLInjection(value)) {
      showSQLInjectionPopup();
      return;
    }
    
    setInput(value);
  };

  const testCases = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
    "<script>alert('xss')</script>",
    "'; UPDATE users SET password='hacked'; --",
    "1 UNION SELECT * FROM users",
    "'; DELETE FROM users; --",
    "javascript:alert('xss')",
    "'; CREATE TABLE hack (id int); --",
    "1' AND 1=1--"
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">SQL Injection Detection Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Input Field</h2>
          <p className="text-gray-600 mb-4">
            Try typing any of the test cases below into this input field to see the SQL injection detection in action:
          </p>
          
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Try typing a SQL injection attempt..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
          />
          
          <p className="text-sm text-gray-500 mt-2">
            Current input: {input || "(empty)"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          <p className="text-gray-600 mb-4">
            Copy and paste any of these into the input field above to test the detection:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCases.map((testCase, index) => (
              <div
                key={index}
                className="bg-gray-100 p-3 rounded border cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => {
                  if (detectSQLInjection(testCase)) {
                    showSQLInjectionPopup();
                  } else {
                    setInput(testCase);
                  }
                }}
              >
                <code className="text-sm text-red-600 break-all">{testCase}</code>
                <div className="text-xs text-gray-500 mt-1">
                  {detectSQLInjection(testCase) ? "🚨 SQL Injection Detected" : "✅ Safe"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">How it works:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• The system detects common SQL injection patterns in real-time</li>
                         <li>• When detected, it shows a popup saying &quot;Your mummy would not be proud&quot;</li>
            <li>• After 3 seconds, it redirects to www.youneedjesus.com</li>
            <li>• This protects all form inputs across the application</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 