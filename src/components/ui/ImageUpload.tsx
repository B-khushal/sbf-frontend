import React, { useRef, useState } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
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
    
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Upload error:', error);
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
          'relative group border-2 border-dashed rounded-lg transition-all duration-200',
          aspectRatioClasses[aspectRatio],
          dragOver ? 'border-primary bg-primary/5' : 'border-gray-300',
          disabled && 'opacity-50',
          isUploading && 'pointer-events-none'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && !isUploading) {
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
          }
        }}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        {currentImage ? (
          <div className="relative w-full h-full">
            <img
              src={currentImage}
              alt="Upload preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100">
              {isUploading ? (
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-4">
            {isUploading ? (
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">{placeholder}</p>
                <p className="text-xs text-gray-400 mt-1">Click or drag to upload</p>
              </>
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
          if (file) handleFileSelect(file);
        }}
        disabled={disabled || isUploading}
      />
    </div>
  );
}; 