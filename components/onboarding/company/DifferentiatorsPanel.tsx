import React, { useState } from 'react';
import { ChevronLeft, Zap, DollarSign, HeadphonesIcon, ArrowUpRight, Shield, Check, XCircle } from 'lucide-react';

import type { CompanyProfile } from '@/lib/company/api';
import { createCompanyProfile } from '@/lib/company/api';
import { companies } from '@/lib/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface Props {
  profile: CompanyProfile;
  onBack: () => void;
}

export function DifferentiatorsPanel({ profile, onBack }: Props) {
  const router = useRouter();
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
    const userId = Cookies.get('userId');
    if (!userId) {
      setError('User not logged in. Please log in to continue.');
      return;
    }

    const companyData: CompanyProfile = {
      ...profile,
      userId: userId, // Ensure userId is attached
      differentiators: selectedDifferentiators,
    };

    try {
      console.log('Creating company profile for user:', userId);
      // createCompanyProfile returns the CompanyProfile object directly
      const createdCompany = await createCompanyProfile(companyData);
      console.log('API Response (Created Company):', createdCompany);
      
      if (createdCompany && createdCompany._id) {
        console.log('Company created successfully with ID:', createdCompany._id);
        
        // Store company ID in a cookie that expires in 30 days
        Cookies.set('companyId', createdCompany._id, { expires: 30 });
        
        // Initialize onboarding progress
        console.log('Starting onboarding initialization for company:', createdCompany._id);
        try {
          const onboardingData = await companies.createOnboarding(createdCompany._id);
          console.log('Successfully initialized onboarding progress:', onboardingData);
          
          // Only redirect after successful onboarding initialization
          // Redirect to company orchestrator
          console.log('Redirecting to company orchestrator: /comporchestrator');
          router.push('/comporchestrator');
        } catch (error: any) {
          console.error('Error initializing onboarding progress:', error);
          const errorMessage = error.response?.data?.error || error.message || 'Failed to initialize onboarding process';
          setError(`Failed to initialize onboarding process: ${errorMessage}`);
          return; // Don't redirect on error
        }
      } else {
        console.error("No company ID found in response:", createdCompany);
        setError('Failed to create company profile. Please try again.');
      }
    } catch (error: any) {
      console.error('Error saving company data:', error);
      setError(error.message || 'Failed to create company profile.');
    }
  };

  const handleClose = () => {
    setError(null);
    // Don't redirect on close error modal, just stay
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
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

