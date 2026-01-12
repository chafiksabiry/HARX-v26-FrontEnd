import React, { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { CVParser } from '@/lib/parsers/cvParser';
import { useProfile } from '@/lib/rep-profile/hooks/useProfile';
import { analyzeCV } from '@/lib/rep-profile/api';
// import { LinkedInClient } from './lib/linkedin/linkedinClient'; // TODO: Migrate to backend

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export default function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const { createProfile } = useProfile();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importType, setImportType] = useState('cv');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [showGuidance, setShowGuidance] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<{text: string; error?: boolean; timestamp: string}[]>([]);

  const addAnalysisStep = (text: string, error = false) => {
    setAnalysisSteps(prev => [...prev, { text, error, timestamp: new Date().toISOString() }]);
  };

  const steps = [
    {
      title: "Choose Your CV Format",
      description: "We support PDF, DOC, DOCX, and TXT files. Make sure your CV is up-to-date and includes your key achievements."
    },
    {
      title: "Review Content",
      description: "We'll extract the important information from your CV. You can review and edit before proceeding."
    },
    {
      title: "AI Enhancement",
      description: "Our AI will analyze your CV to create a compelling professional summary and highlight your key skills."
    }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      setProgress(25);
      setShowGuidance(false);
      const cvParser = new CVParser();
      const extractedText = await cvParser.parse(file);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the file');
      }

      setText(extractedText);
      setError('');
      setProgress(100);
      setUploadSuccess(true);
      setCurrentStep(2);
    } catch (err: any) {
      setError(`Failed to read file: ${err.message}`);
      console.error('File upload error:', err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleLinkedInAuth = () => {
      // TODO: Implement backend OAuth flow
      alert("LinkedIn integration coming soon!");
    /*
    try {
      setShowGuidance(false);
      const linkedinClient = new LinkedInClient();
      const authUrl = linkedinClient.getAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError(`LinkedIn authentication failed: ${err.message}`);
      console.error('LinkedIn auth error:', err);
    }
    */
  };

  const parseProfile = async (contentToProcess = text) => {
    setLoading(true);
    setError('');
    setProgress(0);
    setCurrentStep(3);
    setAnalysisSteps([]);

    try {
      if (!contentToProcess.trim()) {
        throw new Error('Please provide some content to process');
      }

      addAnalysisStep("Starting CV analysis...");
      setProgress(20);

      // Call Unified Backend API
      const result = await analyzeCV(contentToProcess);

      if (!result.success) {
          throw new Error(result.message || 'Analysis failed');
      }

      const { data: combinedData, summary } = result;

      addAnalysisStep("Analysis complete!");
      setProgress(100);

      // Create profile in database
      console.log('Data to store in DB : ', combinedData);
      const createdProfile = await createProfile({ ...combinedData, generatedSummary: summary });
      
      // Extract profile data from response
      const profileData = createdProfile.success && createdProfile.data 
        ? createdProfile.data 
        : createdProfile;
      
      onImport({ ...profileData, generatedSummary: summary });

      console.log("createdProfile : ", createdProfile);
      console.log("profileData : ", profileData);
      console.log("summary : ", summary);

      onClose();
    } catch (err: any) {
      console.error('Profile parsing error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to parse profile. Please try again or use a different file.';
      setError(errorMessage);
      addAnalysisStep(`Error: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] relative flex flex-col">
          {/* Fixed Header */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <Dialog.Title className="text-2xl font-bold text-gray-900">Import Your Professional Profile</Dialog.Title>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-grow">
            {showGuidance && (
              <div className="mb-8">
                <div className="bg-blue-50 p-6 rounded-xl mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Welcome to the Profile Import Wizard! 🚀</h3>
                  <p className="text-blue-800 mb-4">
                    We'll guide you through the process of creating your professional profile. Here's what to expect:
                  </p>
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-blue-900 font-medium">{step.title}</h4>
                          <p className="text-blue-700 text-sm">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                    uploadSuccess ? 'border-green-500 bg-green-50' : 'hover:border-blue-500 hover:bg-blue-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  {uploadSuccess ? (
                    <div className="text-green-600">
                      <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="mt-2 text-lg font-medium">CV Successfully Uploaded!</p>
                      <p className="text-sm text-green-500">Click to upload a different file</p>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-4 text-lg font-medium text-gray-900">
                        Drop your CV here
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        or click to browse your files
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supports PDF, DOC, DOCX, TXT (max 5MB)
                      </p>
                    </>
                  )}
                </div>
                
                {/* LinkedIn Option - Disabled for now */}
                {/*
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or</span>
                    </div>
                </div>

                <button
                    onClick={handleLinkedInAuth}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0077b5] hover:bg-[#006396] focus:outline-none"
                >
                    Connect with LinkedIn
                </button>
                */}

              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="space-y-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Step {currentStep} of 3</span>
                    <span>
                      {progress < 25 && "Preparing..."}
                      {progress >= 25 && progress < 50 && "Analyzing CV..."}
                      {progress >= 50 && progress < 75 && "Extracting information..."}
                      {progress >= 75 && "Generating summary..."}
                    </span>
                  </div>
                  {analysisSteps.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {analysisSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`text-sm ${step.error ? 'text-red-600' : 'text-gray-600'}`}
                        >
                          {step.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0 bg-white">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            {text && (
              <button
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
                onClick={() => parseProfile()}
                disabled={loading || !text}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Generate Summary'
                )}
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

