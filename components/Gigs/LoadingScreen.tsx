"use client";

import React from 'react';
import Image from 'next/image';
import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Analyzing your requirements..." 
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        {/* HARX Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="overflow-hidden rounded-2xl mb-4">
            <Image 
              src="/harx-blanc.jpg" 
              alt="HARX Logo" 
              width={320}
              height={112}
              className="w-64 h-32 md:w-80 md:h-[7rem] object-contain"
              priority
            />
          </div>
          <p className="text-sm text-gray-600">We inspire growth</p>
        </div>

        {/* Brain Icon with Animation */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            {/* Brain icon */}
            <div className="relative bg-white rounded-full p-6 shadow-lg">
              <Brain className="w-16 h-16 text-purple-600 animate-pulse" />
            </div>
          </div>
          
          {/* Loading message */}
          <p className="text-lg text-gray-700 font-medium">{message}</p>
          
          {/* Loading spinner */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

