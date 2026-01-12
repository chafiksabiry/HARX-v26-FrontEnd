import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { CVParser } from '@/lib/rep-profile/parsers/cvParser';
import { useProfile } from '@/lib/rep-profile/hooks/useProfile';
import { getLanguageByCode } from '@/lib/rep-profile/api';
import { 
  extractBasicInfo, 
  analyzeExperience,
  analyzeSkills,
  analyzeAchievements,
  analyzeAvailability,
  generateSummary,
  mapSkillsToDatabase,
  searchIndustryByName,
  searchActivityByName,
  searchTimezoneByName,
  searchCountryByName,
  getDefaultSkill,
  getDefaultIndustry,
  getDefaultActivity
} from '@/lib/rep-profile/api';
import Cookies from 'js-cookie';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

interface AnalysisStep {
  text: string;
  error: boolean;
  timestamp: string;
}

export default function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const { createProfile } = useProfile();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [importType, setImportType] = useState('cv'); // unused for now
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [showGuidance, setShowGuidance] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);

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


  const generateProfileSummary = async (data: any) => {
    return await generateSummary(data);
  };

  const parseProfile = async (contentToProcess = text) => {
    setLoading(true);
    setError('');
    setProgress(0);
    setCurrentStep(3);
    setAnalysisSteps([]);

    try {
      console.log("contentToProcess :", contentToProcess);
      if (!contentToProcess.trim()) {
        throw new Error('Please provide some content to process');
      }

      addAnalysisStep("Starting CV analysis...");

      // Initial analysis to extract basic information
      const basicInfo = await extractBasicInfo(contentToProcess);
      addAnalysisStep("Basic information extracted");
      setProgress(20);

      // Analyze work experience
      const experience = await analyzeExperience(contentToProcess);
      addAnalysisStep("Work experience analyzed");
      setProgress(40);

      // Extract and categorize skills
      const skills = await analyzeSkills(contentToProcess);
      console.log("Skills extracted from CV:", {
        technical: skills.technical,
        professional: skills.professional,
        soft: skills.soft,
        languages: skills.languages
      });
      if (!skills.languages || skills.languages.length === 0) {
        throw new Error('Languages section is required to generate your profile. Please ensure your CV includes the languages you speak.');
      }
      
      // Match extracted languages with database languages
      addAnalysisStep("Matching languages with database...");
      const matchedLanguages = [];
      
      for (const extractedLang of skills.languages) {
        try {
          // getLanguageByCode in our new implementation fetches all languages and finds one
          // extractedLang.iso639_1 comes from AI analysis
          const dbLanguage = await getLanguageByCode(extractedLang.iso639_1);
          if (dbLanguage) {
            matchedLanguages.push({
                language: dbLanguage,
                proficiency: extractedLang.proficiency
            });
            console.log(`Matched language: ${extractedLang.language} (${extractedLang.iso639_1}) -> ${dbLanguage.name}`);
          } else {
             console.warn(`Could not match language code ${extractedLang.iso639_1} for ${extractedLang.language}`);
          }
        } catch (error) {
          console.warn(`Error matching language ${extractedLang.language}:`, error);
          // Skip languages that cannot be matched with the database
        }
      }
      
      if (matchedLanguages.length === 0) {
        throw new Error('No languages could be matched with our database. Please ensure your CV includes common languages.');
      }
      
      addAnalysisStep("Skills categorized and languages matched");
      setProgress(50);

      // Map skills to database IDs
      addAnalysisStep("Matching skills with database...");
      const mappedTechnicalSkills = await mapSkillsToDatabase(skills.technical || [], 'technical');
      const mappedProfessionalSkills = await mapSkillsToDatabase(skills.professional || [], 'professional');
      const mappedSoftSkills = await mapSkillsToDatabase(skills.soft || [], 'soft');
      
      // Note: If no skills are found, the backend will automatically add default skills
      // during profile creation. We just log a warning here.
      if (mappedTechnicalSkills.length === 0) {
        console.warn('No technical skills found in CV. Backend will add a default technical skill.');
      }
      
      if (mappedProfessionalSkills.length === 0) {
        console.warn('No professional skills found in CV. Backend will add a default professional skill.');
      }
      
      if (mappedSoftSkills.length === 0) {
        console.warn('No soft skills found in CV. Backend will add a default soft skill.');
      }
      
      console.log("Mapped skills:", {
        technical: mappedTechnicalSkills.length,
        professional: mappedProfessionalSkills.length,
        soft: mappedSoftSkills.length
      });
      setProgress(60);

      // Extract achievements and projects
      const achievements = await analyzeAchievements(contentToProcess);
      addAnalysisStep("Achievements extracted");
      setProgress(70);

      // Extract availability information
      const availability = await analyzeAvailability(contentToProcess);
      addAnalysisStep("Availability preferences analyzed");
      setProgress(75);

      // Map country and timezone with database
      addAnalysisStep("Matching country and timezone with database...");
      let mappedCountry = null;
      if (basicInfo.country) {
        const country = await searchCountryByName(basicInfo.country);
        if (country) {
          mappedCountry = country;
          console.log(`Matched country: ${basicInfo.country} -> ${country.name} (${country._id})`);
        } else {
          console.warn(`Country not found in database: "${basicInfo.country}"`);
        }
      }

      let mappedTimezone = null;
      if (availability.timeZone) {
        const timezone = await searchTimezoneByName(availability.timeZone);
        if (timezone) {
          mappedTimezone = timezone;
          console.log(`Matched timezone: ${availability.timeZone} -> ${timezone.name} (${timezone._id})`);
        } else {
          console.warn(`Timezone not found in database: "${availability.timeZone}"`);
        }
      }
      setProgress(80);

      // Map industries and activities from experience
      addAnalysisStep("Matching industries and activities with database...");
      const mappedIndustries = [];
      if (experience.industries && experience.industries.length > 0) {
        for (const industryName of experience.industries) {
          const industry = await searchIndustryByName(industryName);
          if (industry) {
            mappedIndustries.push(industry._id);
            console.log(`Matched industry: ${industryName} -> ${industry.name} (${industry._id})`);
          } else {
            console.warn(`Industry not found in database: "${industryName}"`);
          }
        }
      }
      
      // Note: If no industries are found, the backend will automatically add a default industry
      // during profile creation. We just log a warning here.
      if (mappedIndustries.length === 0) {
        console.warn('No industries found in CV. Backend will add a default industry.');
      }

      const mappedActivities = [];
      if (experience.activities && experience.activities.length > 0) {
        for (const activityName of experience.activities) {
          const activity = await searchActivityByName(activityName);
          if (activity) {
            mappedActivities.push(activity._id);
            console.log(`Matched activity: ${activityName} -> ${activity.name} (${activity._id})`);
          } else {
            console.warn(`Activity not found in database: "${activityName}"`);
          }
        }
      }
      
      // Note: If no activities are found, the backend will automatically add a default activity
      // during profile creation. We just log a warning here.
      if (mappedActivities.length === 0) {
        console.warn('No activities found in CV. Backend will add a default activity.');
      }
      
      setProgress(85);

      // Ensure all arrays exist with default empty arrays
      const defaultArrays = {
        technical: [],
        professional: [],
        soft: [],
        languages: [],
        keyAreas: [],
        notableCompanies: [],
        roles: [],
        items: [],
        technicalSkills: [],
        professionalSkills: [],
        softSkills: []
      };

      // Default availability if none found in CV
      const defaultAvailability = {
        schedule: availability.schedule || [],
        timeZone: mappedTimezone || null,
        flexibility: availability.flexibility || []
      };

      // Combine all data with proper error handling and defaults
      const combinedData = {
        personalInfo: {
          name: basicInfo.name || '',
          country: mappedCountry || basicInfo.country || '',
          email: basicInfo.email || '',
          phone: basicInfo.phone || '',
          languages: matchedLanguages || defaultArrays.languages
        },
        professionalSummary: {
          yearsOfExperience: Number(basicInfo.yearsOfExperience) || 0,
          currentRole: basicInfo.currentRole || '',
          industries: mappedIndustries,
          activities: mappedActivities,
          keyExpertise: experience.keyAreas || defaultArrays.keyAreas,
          notableCompanies: experience.notableCompanies || defaultArrays.notableCompanies
        },
        availability: defaultAvailability,
        skills: {
          technical: mappedTechnicalSkills,
          professional: mappedProfessionalSkills,
          soft: mappedSoftSkills
        },
        experience: (experience.roles || defaultArrays.roles).map((role: any) => {
          const startDate = new Date(role.startDate);
          let endDate: any = role.endDate === 'present' ? 'present' : new Date(role.endDate);
          
          if (endDate !== 'present' && isNaN(endDate.getTime())) {
            throw new Error(`Invalid end date: ${role.endDate}`);
          }

          return {
            title: role.title,
            company: role.company,
            startDate,
            endDate,
            responsibilities: role.responsibilities || [],
            achievements: role.achievements || []
          };
        })
      };

      addAnalysisStep("Generating professional summary");
      setProgress(90);

      // Log the combined data before generating summary
      console.log("Combined data to be sent to backend:", {
        skills: combinedData.skills,
        personalInfo: combinedData.personalInfo,
        professionalSummary: combinedData.professionalSummary
      });

      // Generate optimized summary
      const summary = await generateProfileSummary(combinedData);
      console.log("Generated summary:", summary);
      
      // Ensure we have a valid summary
      if (!summary) {
        throw new Error('Failed to generate summary');
      }

      // Update combinedData with the generated summary
      (combinedData.professionalSummary as any).profileDescription = summary;
      
      addAnalysisStep("Analysis complete!");
      setProgress(100);

      // Create profile in database and get MongoDB document
      console.log('Data to store in DB : ', combinedData);
      const createdProfileResponse = await createProfile(combinedData);
      
      // Extract the actual profile data from the response
      // createProfile returns { success: true, data: {...}, message: '...' }
      // We MUST use only the data property, not the root level properties
      let profileData = createdProfileResponse;
      
      // If the response has a 'data' property, use it (this is the correct structure)
      if (createdProfileResponse?.data && typeof createdProfileResponse.data === 'object') {
        profileData = createdProfileResponse.data;
      }
      
      // Remove any root-level properties that shouldn't be there (success, message, etc.)
      // These might be added by some middleware or transformation
      const { success, message, data, ...cleanProfile } = profileData;
      
      // We are in Next.js, using Cookies from 'js-cookie' client side
      if (cleanProfile._id) {
        Cookies.set('agentId', cleanProfile._id);
        localStorage.setItem('agentId', cleanProfile._id);
      }
      
      // Pass only the clean profile data with the generated summary
      onImport({ ...cleanProfile, generatedSummary: summary });

      console.log("createdProfile : ", cleanProfile);
      console.log("summary : ", summary);

      onClose();
    } catch (err: any) {
      console.error('Profile parsing error:', err);
      setError(err.message || 'Failed to parse profile. Please try again or use a different file.');
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

