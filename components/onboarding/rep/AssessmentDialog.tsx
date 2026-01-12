import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useProfile } from '@/lib/rep-profile/hooks/useProfile';
import LanguageAssessment from './assessments/LanguageAssessment';
import ContactCenterAssessment from './assessments/ContactCenterAssessment';
import REPSProfile from './profile/REPSProfile';
import { api as mainApi } from '@/lib/api'; // Use main API client for backend routes

interface AssessmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  languages: any[];
  profileData: any;
  onProfileUpdate?: (updatedProfile: any) => void;
}

export default function AssessmentDialog({ isOpen, onClose, languages, profileData, onProfileUpdate }: AssessmentDialogProps) {
  console.log('Profile Data :', profileData);
  const { updateLanguageAssessment, addContactCenterAssessment } = useProfile();
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const [assessmentResults, setAssessmentResults] = useState<any>({ languages: {}, contactCenter: {} });
  const [phase, setPhase] = useState<'language' | 'contact-center'>('language');
  const [showLanguageSummary, setShowLanguageSummary] = useState(false);
  const [showAllLanguagesSummary, setShowAllLanguagesSummary] = useState(false);
  const [finalRecommendations, setFinalRecommendations] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showingProfile, setShowingProfile] = useState(false);

  const handleLanguageAssessmentComplete = async (assessmentData: any) => {
    try {
      // Save language assessment results and proficiency to the database
      console.log('updateLanguageAssessment body : ', languages[currentLanguage].language, assessmentData);

      if (profileData?._id) {
        const updatedProfile = await updateLanguageAssessment(
            profileData._id,
            languages[currentLanguage].language,
            assessmentData.proficiency,
            assessmentData.results
        );

        console.log("updatedProfile : ", updatedProfile);
        
        // Update parent component's profileData
        if (onProfileUpdate) {
            onProfileUpdate(updatedProfile);
        }
      }

      setAssessmentResults((prev: any) => ({
        ...prev,
        languages: {
          ...prev.languages,
          [languages[currentLanguage].language]: assessmentData.results
        }
      }));

      setShowLanguageSummary(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error saving language assessment:', error);
    }
  };

  const handleNextLanguage = () => {
    if (currentLanguage < languages.length - 1) {
      setCurrentLanguage(prev => prev + 1);
      setShowLanguageSummary(false);
      // Scroll to top for next language
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowAllLanguagesSummary(true);
    }
  };

  const handlePreviousLanguage = () => {
    if (currentLanguage > 0) {
      setCurrentLanguage(prev => prev - 1);
      setShowLanguageSummary(true);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const moveToContactCenter = () => {
    setShowAllLanguagesSummary(false);
    setPhase('contact-center');
  };

  const saveContactCenterAssessmentResult = async (results: any) => {
    console.log('saveContactCenterAssessmentResult param:', results);
    try {
      // Send results directly to the backend
      if (profileData?._id) {
        const updatedProfile = await addContactCenterAssessment(profileData._id, results);
        console.log("Updated profile after assessment:", updatedProfile);

        // Update parent component's profileData
        if (onProfileUpdate) {
            onProfileUpdate(updatedProfile);
        }
      }

      // Update local state with the new assessment results
      setAssessmentResults((prev: any) => ({
        ...prev,
        contactCenter: {
          ...prev.contactCenter,
          [results.skill]: {
            category: results.category,
            score: results.assessmentResults?.score || results.score,
            proficiency: results.proficiency,
            strengths: results.assessmentResults?.strengths || results.strengths,
            improvements: results.assessmentResults?.improvements || results.improvements,
            feedback: results.assessmentResults?.feedback || results.feedback,
            tips: results.assessmentResults?.tips || results.tips,
            keyMetrics: results.assessmentResults?.keyMetrics || results.keyMetrics
          }
        }
      }));
    } catch (error) {
      console.error('Error saving contact center assessment:', error);
    }
  };

  const handleContactCenterAssessmentComplete = async (results: any) => {
    console.log('handleContactCenterAssessmentComplete param:', results);
    try {
      // Update the assessment results state with the new structure
      const updatedResult = {
        ...assessmentResults,
        contactCenter: results
      };
      
      setAssessmentResults(updatedResult);
      
      // Generate recommendations and show profile when all assessments are complete
      await generateFinalRecommendations(updatedResult);
      
    } catch (error) {
      console.error('Error handling contact center assessment completion:', error);
    }
  };

  const generateFinalRecommendations = async (results: any) => {
    setAnalyzing(true);
    try {
      // Use backend API route instead of OpenAI directly
      const response = await mainApi.post('/onboarding/assessments/recommendations', {
        results,
        profileData
      });

      if (response.data && response.data.success && response.data.data) {
        const recommendations = response.data.data;
        setFinalRecommendations(recommendations);
        setShowingProfile(true);
      } else if (response.data && !response.data.success) {
        throw new Error(response.data.error || 'Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Failed to generate recommendations. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              {showingProfile ? 'Your REPS Profile' : 'REPS Qualification Assessment'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!showingProfile && (
            <>
              {/* Progress Indicator */}
              <div className="sticky top-14 bg-white z-10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className={`h-2 flex-1 rounded-full ${phase === 'language' ? 'bg-blue-600' : 'bg-green-500'}`} />
                  <div className={`h-2 flex-1 rounded-full ${phase === 'contact-center' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Language Skills</span>
                  <span>Contact Center Skills</span>
                </div>
              </div>

              {/* All Languages Summary View */}
              {showAllLanguagesSummary ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Language Assessments Summary</h3>
                    <div className="space-y-6">
                      {languages.map((lang, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-lg font-semibold text-gray-800">{lang.language}</h4>
                            <span className="text-xl font-bold text-blue-600">
                              {assessmentResults.languages[lang.language]?.overall?.score || 0}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {assessmentResults.languages[lang.language] && Object.entries(assessmentResults.languages[lang.language])
                              .filter(([key]) => key !== 'overall' && key !== 'languageCheck' && key !== 'languageOrTextMismatch')
                              .map(([category, data]: [string, any]) => (
                                <div key={category} className="flex justify-between items-center">
                                  <span className="text-gray-600 capitalize">{category}:</span>
                                  <span className="font-medium text-gray-800">{(data === null) ? 0 : data.score}/100</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <button
                        onClick={moveToContactCenter}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <span>Continue to Contact Center Assessment</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Current Language Indicator */}
                  {phase === 'language' && languages.length > 0 && (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">
                            Testing: {languages[currentLanguage].language}
                          </h3>
                          <p className="text-sm text-blue-700">
                            Language {currentLanguage + 1} of {languages.length}
                          </p>
                        </div>
                        {currentLanguage > 0 && (
                          <button
                            onClick={handlePreviousLanguage}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous Language
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Assessment Content */}
                  {phase === 'language' ? (
                    showLanguageSummary ? (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {languages[currentLanguage].language} Assessment Results
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Overall Score:</span>
                              <span className="text-2xl font-bold text-blue-600">
                                {assessmentResults.languages[languages[currentLanguage].language]?.overall?.score}%
                              </span>
                            </div>
                            <div className="space-y-2">
                              {assessmentResults.languages[languages[currentLanguage].language] && Object.entries(assessmentResults.languages[languages[currentLanguage].language])
                                .filter(([key]) => key !== 'overall' && key !== 'languageCheck' && key !== 'languageOrTextMismatch')
                                .map(([category, data]: [string, any]) => (
                                  <div key={category} className="flex justify-between items-center">
                                    <span className="text-gray-600 capitalize">{category}:</span>
                                    <span className="font-medium text-gray-800">{(data === null) ? 0 : data.score}/100</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div className="mt-6">
                            <button
                              onClick={handleNextLanguage}
                              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              {currentLanguage < languages.length - 1 ? (
                                <>
                                  <span>Continue to Next Language</span>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  <span>View All Language Assessments Summary</span>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      languages.length > 0 && (
                        <LanguageAssessment
                          language={languages[currentLanguage].language}
                          onComplete={handleLanguageAssessmentComplete}
                        />
                      )
                    )
                  ) : (
                    <ContactCenterAssessment
                      saveResults={saveContactCenterAssessmentResult}
                      onComplete={handleContactCenterAssessmentComplete}
                      profileData={profileData}
                    />
                  )}
                </>
              )}
            </>
          )}

          {showingProfile && finalRecommendations && (
            <REPSProfile
              assessmentResults={{ ...finalRecommendations, languages: assessmentResults.languages, contactCenter: assessmentResults.contactCenter }}
              profileData={profileData}
            />
          )}

          {analyzing && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing assessment results and generating your REPS profile...</p>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
