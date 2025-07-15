"use client";

import { useState, useRef } from "react";

interface LogoUploadProps {
  currentLogo?: string;
  onUpload: (logoUrl: string) => void;
  businessName: string;
}

export default function LogoUpload({ currentLogo, onUpload, businessName }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError("");
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('businessName', businessName);

      // Upload to your API endpoint
      const response = await fetch('/api/business/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const result = await response.json();
      onUpload(result.logoUrl);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Logo *
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Upload your business logo to complete your profile and start creating rewards.
        </p>
      </div>

      {/* Current Logo Display */}
      {currentLogo && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Current Logo:</p>
          <div className="flex items-center space-x-4">
            <img 
              src={currentLogo} 
              alt={`${businessName} logo`}
              className="h-16 w-16 object-contain border border-gray-200 rounded-lg"
            />
            <button
              onClick={triggerFileInput}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change Logo
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : currentLogo 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="text-4xl mb-2">
            {currentLogo ? "🖼️" : "📁"}
          </div>
          
          {currentLogo ? (
            <div>
              <p className="text-sm text-gray-600">
                Logo uploaded successfully!
              </p>
              <button
                onClick={triggerFileInput}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
              >
                Upload new logo
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">
                {dragActive ? "Drop your logo here" : "Drag and drop your logo here"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or click to browse
              </p>
              <button
                type="button"
                onClick={triggerFileInput}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Choose File"}
              </button>
            </div>
          )}
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Uploading...</p>
          </div>
        )}
      </div>

      {/* File Requirements */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          <strong>Requirements:</strong> JPEG, PNG, GIF, or WebP format. Max 5MB.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
} 