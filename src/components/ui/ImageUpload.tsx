import React, { useRef, useState } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  className?: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  placeholder?: string;
  disabled?: boolean;
}

export const ImageUpload = ({
  currentImage,
  onImageUpload,
  isUploading = false,
  className,
  aspectRatio = 'landscape',
  placeholder = 'Upload Image',
  disabled = false
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (disabled || isUploading) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative group border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
          aspectRatioClasses[aspectRatio],
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'pointer-events-none'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt="Upload preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className={cn(
              'absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center',
              isUploading && 'opacity-100'
            )}>
              <div className="text-white text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm font-medium">Change Image</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <Upload className="w-8 h-8" />
                <div>
                  <p className="text-sm font-medium">{placeholder}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        disabled={disabled || isUploading}
      />
    </div>
  ); 