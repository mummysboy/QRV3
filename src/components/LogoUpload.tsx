"use client";

import { useState, useRef } from "react";

interface LogoUploadProps {
  businessName: string;
  onUpload: (logoUrl: string) => void;
  currentLogo?: string;
  demoMode?: boolean;
}

export default function LogoUpload({ businessName, onUpload, currentLogo, demoMode }: LogoUploadProps) {
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
    
    console.log('🔄 LogoUpload: Starting file upload...');
    console.log('📋 LogoUpload: File name:', file.name);
    console.log('📋 LogoUpload: File size:', file.size);
    console.log('📋 LogoUpload: File type:', file.type);
    console.log('📋 LogoUpload: Business name:', businessName);
    
    // Only validate file size (max 5MB) - remove strict file type validation
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    if (demoMode) {
      // In demo mode, just use a local preview URL
      const url = URL.createObjectURL(file);
      onUpload(url);
      setIsUploading(false);
      return;
    }

    try {
      // Use server-side API instead of direct client-side upload
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('businessName', businessName);

      // Use the Next.js API route (this should work in both local and Amplify environments)
      const uploadEndpoint = process.env.NEXT_PUBLIC_LOGO_UPLOAD_API_URL || '/api/business/upload-logo';

      console.log('🔄 LogoUpload: Calling upload API at', uploadEndpoint);
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      console.log('📋 LogoUpload: API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ LogoUpload: Upload successful:', result);
        console.log('📋 LogoUpload: Logo URL:', result.logoUrl);
        onUpload(result.logoUrl);
      } else {
        // Handle different response types
        let errorMessage = 'Failed to upload logo';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `Upload failed (${response.status}): ${response.statusText}`;
        }
        
        // Special handling for 403 error (IAM permissions issue)
        if (response.status === 403) {
          errorMessage = 'Upload failed: Permission denied. Please contact support.';
          console.error('❌ LogoUpload: 403 Forbidden - IAM permissions issue');
        }
        
        console.error('❌ LogoUpload: API error:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ LogoUpload: Upload error:', error);
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
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors touch-manipulation bg-gray-50 hover:bg-blue-50 active:bg-blue-100 shadow-sm flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px] ${
          isUploading ? 'opacity-70 pointer-events-none' : ''
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        onTouchStart={(e) => { e.preventDefault(); }}
        onTouchEnd={(e) => { e.preventDefault(); triggerFileInput(); }}
        style={{ touchAction: 'manipulation' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="space-y-2 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading logo...</p>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center justify-center">
            <svg
              className="mx-auto h-12 w-12 text-blue-400"
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
            <p className="text-base text-blue-600 font-medium">Tap to upload</p>
            <p className="text-xs text-gray-500">Any image file up to 5MB</p>
            <p className="text-xs text-gray-400">📱 Choose from camera or photo library</p>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-4 text-sm text-red-500 text-center transition-opacity duration-300">{error}</p>
      )}
      {currentLogo && !isUploading && (
        <div className="mt-6 flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">Current logo:</span>
          <img
            src={(() => {
              // Handle different logo URL formats
              if (!currentLogo) return '';
              if (currentLogo.startsWith('http://') || currentLogo.startsWith('https://')) {
                return currentLogo;
              }
              if (currentLogo.startsWith('data:')) {
                return currentLogo;
              }
              // If it's an S3 key, construct the full URL
              return `https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/${currentLogo}`;
            })()}
            alt="Current logo"
            className="w-16 h-16 rounded-lg object-contain border border-gray-200 shadow-sm"
            onError={(e) => { 
              console.error('❌ Logo display error for:', currentLogo);
              e.currentTarget.style.display = 'none'; 
            }}
          />
        </div>
      )}
    </div>
  );
} 