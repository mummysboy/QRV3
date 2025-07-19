"use client";

import { useState, useRef } from "react";

interface LogoUploadProps {
  businessName: string;
  onUpload: (logoUrl: string) => void;
  currentLogo?: string;
}

export default function LogoUpload({ businessName, onUpload, currentLogo }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    setError("");
    
    // Only validate file size (max 5MB) - remove strict file type validation
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Use server-side API instead of direct client-side upload
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('businessName', businessName);

      const response = await fetch('/api/business/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onUpload(result.logoUrl);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {/* Mobile-friendly upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors touch-manipulation ${
          isUploading
            ? "border-gray-300 bg-gray-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100"
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        onTouchStart={(e) => {
          // Prevent double-tap zoom on mobile
          e.preventDefault();
        }}
        onTouchEnd={(e) => {
          // Ensure touch events work properly on mobile
          e.preventDefault();
          triggerFileInput();
        }}
        style={{
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'manipulation'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0
          }}
        />
        
        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading logo...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Tap to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">Any image file up to 5MB</p>
              <p className="text-xs text-gray-400 mt-1">📱 Choose from camera or photo library</p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {currentLogo && !isUploading && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Current logo:</p>
          <img
            src={currentLogo.startsWith('http') ? currentLogo : `https://${currentLogo}`}
            alt="Current logo"
            className="h-16 w-16 object-contain border border-gray-200 rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
} 