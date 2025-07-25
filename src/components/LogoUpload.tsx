"use client";

import { useState, useRef } from "react";

interface LogoUploadProps {
  businessName: string;
  onUpload: (logoUrl: string) => void;
  currentLogo?: string;
  demoMode?: boolean;
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
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      console.log('🔄 LogoUpload: Starting upload process...');
      console.log('🔄 LogoUpload: File:', file.name, file.type, file.size);

      // Step 1: Get presigned URL
      const presignedResponse = await fetch('/api/business/presigned-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { presignedUrl, key } = await presignedResponse.json();
      console.log('✅ LogoUpload: Got presigned URL:', presignedUrl);

      // Step 2: Upload directly to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      console.log('✅ LogoUpload: Direct S3 upload successful');
      console.log('📋 LogoUpload: Logo key:', key);

      // Step 3: Delete old logo if it exists
      if (currentLogo && typeof currentLogo === "string" && currentLogo.trim() !== "") {
        try {
          console.log('🔄 LogoUpload: Deleting old logo:', currentLogo);
          
          // Extract the S3 key from the current logo URL
          let oldLogoKey = currentLogo;
          if (currentLogo.startsWith('http')) {
            const urlParts = currentLogo.split('/');
            if (urlParts.length > 3) {
              oldLogoKey = urlParts.slice(3).join('/');
            }
          }
          
          if (oldLogoKey.startsWith('logos/')) {
            const deleteResponse = await fetch('/api/business/delete-logo', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                logoKey: oldLogoKey,
              }),
            });
            
            if (deleteResponse.ok) {
              console.log('✅ LogoUpload: Old logo deleted successfully');
            } else {
              console.warn('⚠️ LogoUpload: Failed to delete old logo, but continuing...');
            }
          }
        } catch (deleteError) {
          console.warn('⚠️ LogoUpload: Error deleting old logo:', deleteError);
          // Continue even if deletion fails
        }
      }

      // Return the S3 key (not the full URL)
      onUpload(key);
      
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

  const cloudfrontBase = "https://d2rfrexwuran49.cloudfront.net"; // Updated to real CloudFront domain

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
              return `${cloudfrontBase}/${currentLogo}`;
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