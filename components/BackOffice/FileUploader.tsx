"use client";

import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { files } from '../../lib/api';

interface FileUploaderProps {
  onUploadComplete?: (fileData: any) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export default function FileUploader({ 
  onUploadComplete, 
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/*', 'application/pdf']
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${maxSize / 1024 / 1024}MB limit`;
    }
    
    if (!allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    })) {
      return 'File type not allowed';
    }

    return null;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    setSuccess(null);

    const { files: droppedFiles } = e.dataTransfer;
    if (!droppedFiles || !droppedFiles.length) return;

    const file = droppedFiles[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    await uploadFile(file);
  }, [maxSize, allowedTypes]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    await uploadFile(file);
  }, [maxSize, allowedTypes]);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const fileData = await files.upload(file, {
        lastModified: file.lastModified
      });

      setSuccess('File uploaded successfully');
      if (onUploadComplete) {
        onUploadComplete(fileData);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={`h-12 w-12 ${
              isDragging ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop your file here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Maximum file size: {maxSize / 1024 / 1024}MB
            </p>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{success}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



