import React, { useState } from 'react';
import { X, ArrowRight, Briefcase, Award, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/rep-profile/client'; // Using the unified client

interface WelcomeMessageProps {
  type: 'company' | 'rep';
  onClose: () => void;
}

export function WelcomeMessage({ type, onClose }: WelcomeMessageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = Cookies.get('userId');
  
  const handleContinue = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Sending request with:", {
        userId,
        newType: type,
      });

      // Using the unified client which handles base URL
      const response = await api.post('/auth/change-user-type', {
        userId,
        newType: type,
      });

      const data = response.data;
      console.log("Response from backend:", data);

      // Save new type in cookie
      Cookies.set('userType', type);

      // Redirect based on type - vers orchestrator approprié
      if (type === 'company') {
        const compOrchestratorUrl = process.env.NEXT_PUBLIC_COMP_ORCHESTRATOR_URL || '/comporchestrator';
        if (compOrchestratorUrl.startsWith('http')) {
          window.location.href = compOrchestratorUrl;
        } else {
          router.push(compOrchestratorUrl);
        }
      } else {
        const repOrchestratorUrl = process.env.NEXT_PUBLIC_REP_ORCHESTRATOR_URL || '/reporchestrator';
        if (repOrchestratorUrl.startsWith('http')) {
          window.location.href = repOrchestratorUrl;
        } else {
          router.push(repOrchestratorUrl);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      console.error("Error updating user type:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-custom flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl p-8 md:p-12 relative shadow-2xl border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to Harx!
            </h2>
            <p className="text-gray-600 text-lg">
              Let's get you started on your journey
            </p>
          </div>
          
          {type === 'company' ? (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 mb-8">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
                  Company Profile Setup
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  We're excited to have you join our platform! Before you can post your first gig, we need to set up your company profile. This will help professionals learn more about your organization and make informed decisions.
                </p>
                <p className="text-gray-700 mb-4 font-medium">
                  The next steps will guide you through creating your company profile, including:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start text-gray-700">
                    <div className="p-1 bg-blue-200 rounded-full mr-3 mt-1">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Company information and description</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <div className="p-1 bg-blue-200 rounded-full mr-3 mt-1">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Contact details and location</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <div className="p-1 bg-blue-200 rounded-full mr-3 mt-1">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Company logo and branding materials</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <div className="p-1 bg-blue-200 rounded-full mr-3 mt-1">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Work environment and culture details</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 mb-8">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-blue-600" />
                  Professional Profile Setup
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  We're thrilled to have you join our community of contact center professionals! Before you start exploring gigs, let's set up your professional profile to help you stand out to potential employers.
                </p>
                <p className="text-gray-700 mb-4 font-medium">
                  Your profile setup will include:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start text-gray-700">
                    <div className="p-1 bg-blue-200 rounded-full mr-3 mt-1">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Work experience and specialized skills</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <div className="p-1 bg-blue-200 rounded-full mr-3 mt-1">
                      <Award className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Certifications and achievements</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <div className="p-1 bg-blue-200 rounded-full mr-3 mt-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Availability and scheduling preferences</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <div className="p-1 bg-blue-200 rounded-full mr-3 mt-1">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Professional photo and personal statement</span>
                  </li>
                </ul>
                <p className="mt-6 text-gray-700 bg-white p-4 rounded-lg border border-blue-200">
                  <strong>Pro tip:</strong> A complete profile increases your chances of finding the perfect gig that matches your skills and preferences.
                </p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Setting up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
