"use client";

import React, { useState } from 'react';
import { ChevronLeft, Zap, DollarSign, HeadphonesIcon, ArrowUpRight, Shield, Check, XCircle } from 'lucide-react';

import type { CompanyProfile } from './api/openaiBackend';
import { saveCompanyData } from './api/companyApi';
import Cookies from 'js-cookie';

interface Props {
  profile: CompanyProfile;
  onBack: () => void;
}

export function DifferentiatorsPanel({ profile, onBack }: Props) {
  const [selectedDifferentiators, setSelectedDifferentiators] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const differentiators = [
    {
      id: 'fast-payment',
      title: 'Fast Payment',
      description: 'Quick and reliable payment processing for all partners',
      icon: DollarSign,
    },
    {
      id: 'continuous-support',
      title: 'Continuous Support',
      description: '24/7 dedicated support system for partners',
      icon: HeadphonesIcon,
    },
    {
      id: 'growth-opportunities',
      title: 'Growth Opportunities',
      description: 'Clear career progression and advancement paths',
      icon: ArrowUpRight,
    },
    {
      id: 'support-system',
      title: 'Support System',
      description: 'Robust infrastructure and tools for success',
      icon: Shield,
    },
  ];

  const toggleDifferentiator = (id: string) => {
    setSelectedDifferentiators((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    const companyData = {
      ...profile,
      differentiators: selectedDifferentiators,
    };

    try {
      const response = await saveCompanyData(companyData);
      console.log('Complete API Response:', JSON.stringify(response, null, 2));
      
      if (response && response.data && response.data._id) {
        console.log('Company created successfully with ID:', response.data._id);
        
        // Store company ID in a cookie that expires in 30 days
        Cookies.set('companyId', response.data._id, { expires: 30 });
        console.log("Company ID being saved to cookie:", response.data._id);
        const savedId = Cookies.get('companyId');
        console.log("Verified saved Company ID from cookie:", savedId);

        // Initialize onboarding progress
        console.log('Starting onboarding initialization for company:', response.data._id);
        try {
          console.log('Making API call to initialize onboarding...');
          // Use NEXT_PUBLIC_API_URL or default to /api
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
          const onboardingResponse = await fetch(`${apiUrl}/onboarding/companies/${response.data._id}/onboarding`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('Onboarding API response status:', onboardingResponse.status);
          
          if (!onboardingResponse.ok) {
            const errorText = await onboardingResponse.text();
            console.error('Failed to initialize onboarding progress. Status:', onboardingResponse.status);
            console.error('Error details:', errorText);
            throw new Error(`Failed to initialize onboarding: ${errorText}`);
          }

          const onboardingData = await onboardingResponse.json();
          console.log('Successfully initialized onboarding progress. Response:', onboardingData);
          console.log('Current phase:', onboardingData.currentPhase);
          console.log('Completed steps:', onboardingData.completedSteps);
          
          // Only redirect after successful onboarding initialization
          console.log('Redirecting to company page...');
          window.location.href = "/app11";
        } catch (error: unknown) {
          console.error('Error initializing onboarding progress:', error);
          if (error instanceof Error) {
            console.error('Error stack:', error.stack);
          }
          setError('Failed to initialize onboarding process. Please try again.');
          return; // Don't redirect on error
        }
      } else {
        console.error("No company ID found in response. Full response:", response);
        setError('Failed to create company profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving company data:', error);
      setTimeout(() => setError('Company already exist. Please try again.'), 0);
      console.log("Error State:", error);
    }
  };
  const handleClose = () => {
    setError(null);
    window.location.href ="/app3"
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-500 mt-1">Select Your Key Differentiators</p>
          </div>
        </div>

        <div className="space-y-12">
          <div className="grid md:grid-cols-2 gap-6">
            {differentiators.map((diff) => (
              <button
                key={diff.id}
                onClick={() => toggleDifferentiator(diff.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedDifferentiators.includes(diff.id) ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300 bg-white'
                }`}
              >
                {selectedDifferentiators.includes(diff.id) && (
                  <div className="absolute top-4 right-4">
                    <Check className="text-indigo-500" size={20} />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    selectedDifferentiators.includes(diff.id) ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-indigo-50'
                  }`}>
                  <diff.icon
                    size={24}
                    className={
                      selectedDifferentiators.includes(diff.id) ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-500'
                    }
                  />
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                    selectedDifferentiators.includes(diff.id) ? 'text-indigo-900' : 'text-gray-900'
                  }`}>
                  {diff.title}
                </h3>
                <p className={`text-sm transition-colors ${
                    selectedDifferentiators.includes(diff.id) ? 'text-indigo-700' : 'text-gray-600'
                  }`}>
                  {diff.description}
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button onClick={onBack} className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors">
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={selectedDifferentiators.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Zap size={18} />
              Complete Profile
            </button>
          </div>
        </div>
      </div>

      {error && (
        
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <XCircle className="text-red-500 mx-auto" size={40} />
            <h2 className="text-xl font-bold text-gray-900 mt-4">Error</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <button onClick={handleClose} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



