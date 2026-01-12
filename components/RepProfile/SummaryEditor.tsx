"use client";

import React, { useState, useEffect, useRef } from 'react';
import AssessmentDialog from '@/components/onboarding/rep/AssessmentDialog';
import { useProfile } from '@/lib/rep-profile/hooks/useProfile';
import { api } from '@/lib/api';

interface SummaryEditorProps {
  profileData: any;
  generatedSummary: string;
  setGeneratedSummary: (summary: string) => void;
  onProfileUpdate: (data: any) => void;
}

interface ValidationErrors {
  languages: string;
  industries: string;
  companies: string;
  name: string;
  location: string;
  email: string;
  phone: string;
  currentRole: string;
  yearsExperience: string;
}

interface ProficiencyLevel {
  value: string;
  label: string;
  description: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface Experience {
  title: string;
  company: string;
  startDate: string | Date;
  endDate: string | Date | 'present';
  responsibilities: string[];
  achievements?: string[];
  isPresent?: boolean;
}

interface NewExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  isPresent: boolean;
}

function SummaryEditor({ profileData, generatedSummary, setGeneratedSummary, onProfileUpdate }: SummaryEditorProps) {
  const { updateBasicInfo, updateExperience, updateSkills, updateProfileData } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  console.log("generatedSummary : ", generatedSummary);
  const [editedSummary, setEditedSummary] = useState(generatedSummary);
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(() => {
    // Initialize with default structure if profileData is not available
    if (!profileData) {
      return {
        personalInfo: {
          name: '',
          location: '',
          email: '',
          phone: '',
          languages: []
        },
        professionalSummary: {
          yearsOfExperience: '',
          currentRole: '',
          industries: [],
          notableCompanies: [],
          profileDescription: ''
        },
        skills: {
          technical: [],
          professional: [],
          soft: []
        },
        experience: [],
        availability: {
          days: [],
          hours: { start: '', end: '' },
          timeZones: [],
          flexibility: []
        }
      };
    }
    // Transform languages to ensure they are in the correct format
    const transformedLanguages = (profileData.personalInfo?.languages || []).map((lang: any) => {
      // If lang.language is an object, extract the name
      if (lang.language && typeof lang.language === 'object') {
        return {
          language: lang.language.name || lang.language.nativeName || lang.language.code || '',
          proficiency: lang.proficiency || 'B1',
          _id: lang._id || lang.language._id
        };
      }
      // If lang.language is already a string, keep it as is
      return {
        language: typeof lang.language === 'string' ? lang.language : '',
        proficiency: lang.proficiency || 'B1',
        _id: lang._id
      };
    });

    return {
      ...profileData,
      personalInfo: {
        ...(profileData.personalInfo || {}),
        name: profileData.personalInfo?.name || '',
        location: profileData.personalInfo?.location || '',
        email: profileData.personalInfo?.email || '',
        phone: profileData.personalInfo?.phone || '',
        languages: transformedLanguages
      },
      professionalSummary: profileData.professionalSummary || {
        yearsOfExperience: '',
        currentRole: '',
        industries: [],
        notableCompanies: [],
        profileDescription: ''
      },
      skills: profileData.skills || {
        technical: [],
        professional: [],
        soft: []
      },
      experience: profileData.experience || [],
      availability: profileData.availability || {
        days: [],
        hours: { start: '', end: '' },
        timeZones: [],
        flexibility: []
      }
    };
  });
  const [tempLanguage, setTempLanguage] = useState({ language: '', proficiency: 'B1' });
  const [tempIndustry, setTempIndustry] = useState('');
  const [tempCompany, setTempCompany] = useState('');
  const [showAssessment, setShowAssessment] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    languages: '',
    industries: '',
    companies: '',
    name: '',
    location: '',
    email: '',
    phone: '',
    currentRole: '',
    yearsExperience: ''
  });
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [newExperience, setNewExperience] = useState<NewExperience>({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    responsibilities: [''],
    isPresent: false
  });
  const [showNewExperienceForm, setShowNewExperienceForm] = useState(false);
  const [tempSkill, setTempSkill] = useState({
    technical: '',
    professional: '',
    soft: ''
  });
  const [tempProfileDescription, setTempProfileDescription] = useState('');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const proficiencyLevels: ProficiencyLevel[] = [
    { value: 'A1', label: 'A1 - Beginner', description: 'Can understand and use basic phrases, introduce themselves' },
    { value: 'A2', label: 'A2 - Elementary', description: 'Can communicate in simple, routine situations' },
    { value: 'B1', label: 'B1 - Intermediate', description: 'Can deal with most situations while traveling, describe experiences' },
    { value: 'B2', label: 'B2 - Upper Intermediate', description: 'Can interact fluently with native speakers, produce clear text' },
    { value: 'C1', label: 'C1 - Advanced', description: 'Can use language flexibly, produce clear well-structured text' },
    { value: 'C2', label: 'C2 - Mastery', description: 'Can understand virtually everything, express spontaneously' }
  ];

  // Use a ref to track the last profileData._id we processed to prevent unnecessary updates
  const lastProfileId = useRef<string | null>(null);

  useEffect(() => {
    if (profileData && profileData._id !== lastProfileId.current) {
      lastProfileId.current = profileData._id;
      
      // Transform languages to ensure they are in the correct format
      const transformedLanguages = (profileData.personalInfo?.languages || []).map((lang: any) => {
        // If lang.language is an object, extract the name
        if (lang.language && typeof lang.language === 'object') {
          return {
            language: lang.language.name || lang.language.nativeName || lang.language.code || '',
            proficiency: lang.proficiency || 'B1',
            _id: lang._id || lang.language._id
          };
        }
        // If lang.language is already a string, keep it as is
        return {
          language: typeof lang.language === 'string' ? lang.language : '',
          proficiency: lang.proficiency || 'B1',
          _id: lang._id
        };
      });
      
      // Transform skills to ensure skill.skill is always a string
      const transformSkills = (skillsArray: any[]) => {
        return (skillsArray || []).map((skill: any) => {
          if (typeof skill === 'string') {
            return skill;
          }
          if (skill && typeof skill === 'object') {
            // If skill.skill is an object, extract the name
            if (skill.skill && typeof skill.skill === 'object') {
              return {
                ...skill,
                skill: skill.skill.name || skill.skill.nativeName || skill.skill.code || String(skill.skill._id || '')
              };
            }
            // If skill.skill is already a string, keep it
            return skill;
          }
          return skill;
        });
      };

      // Transform industries to ensure they are strings or have name extracted
      const transformedIndustries = (profileData.professionalSummary?.industries || []).map((ind: any) => {
        if (typeof ind === 'string') {
          return ind;
        }
        if (ind && typeof ind === 'object') {
          // If it's an object with _id, extract the name
          if (ind.name) {
            return ind.name;
          }
          // If it's an ObjectId, return as string
          return String(ind._id || ind);
        }
        return String(ind || '');
      });

      setEditedProfile({
        ...profileData,
        personalInfo: {
          ...(profileData.personalInfo || {}),
          name: profileData.personalInfo?.name || '',
          location: profileData.personalInfo?.location || '',
          email: profileData.personalInfo?.email || '',
          phone: profileData.personalInfo?.phone || '',
          languages: transformedLanguages
        },
        professionalSummary: {
          ...(profileData.professionalSummary || {}),
          yearsOfExperience: profileData.professionalSummary?.yearsOfExperience || '',
          currentRole: profileData.professionalSummary?.currentRole || '',
          industries: transformedIndustries,
          notableCompanies: profileData.professionalSummary?.notableCompanies || [],
          profileDescription: profileData.professionalSummary?.profileDescription || ''
        },
        skills: {
          technical: transformSkills(profileData.skills?.technical || []),
          professional: transformSkills(profileData.skills?.professional || []),
          soft: transformSkills(profileData.skills?.soft || [])
        },
        experience: profileData.experience || [],
        availability: profileData.availability || {
          days: [],
          hours: { start: '', end: '' },
          timeZones: [],
          flexibility: []
        }
      });
      setTempProfileDescription(profileData.professionalSummary?.profileDescription || '');
    }
  }, [profileData?._id, profileData]);

  // Use refs to track what we've already processed to prevent infinite loops
  const lastProcessedProfileId = useRef<string | null>(null);
  const lastProcessedSummary = useRef<string | null>(null);
  const isInitializingSummary = useRef(false);

  useEffect(() => {
    const initializeSummary = async () => {
      // Prevent concurrent initializations
      if (isInitializingSummary.current) {
        return;
      }

      const profileId = profileData?._id;
      const hasProfileDescription = profileData?.professionalSummary?.profileDescription;

      // Skip if we've already processed this exact combination
      if (lastProcessedProfileId.current === profileId && lastProcessedSummary.current === generatedSummary) {
        return;
      }

      // Don't do anything if profileId is undefined or invalid
      if (!profileId || typeof profileId !== 'string' || profileId === 'undefined') {
        return;
      }

      // If we have a generated summary from props but no profile description in the database
      if (generatedSummary && (!hasProfileDescription || hasProfileDescription === '')) {
        try {
          isInitializingSummary.current = true;
          
          // Mark as processed before making the API call
          lastProcessedProfileId.current = profileId;
          lastProcessedSummary.current = generatedSummary;

          // Update local state first
          setEditedSummary(generatedSummary);
          setEditedProfile((prev: any) => ({
      ...prev,
            professionalSummary: {
              ...(prev.professionalSummary || {
                yearsOfExperience: '',
                currentRole: '',
                industries: [],
                notableCompanies: [],
                profileDescription: ''
              }),
              profileDescription: generatedSummary
            }
          }));

          // Save to database
          await updateProfileData(profileId, {
            professionalSummary: {
              ...(profileData.professionalSummary || {
                yearsOfExperience: '',
                currentRole: '',
                industries: [],
                notableCompanies: [],
                profileDescription: ''
              }),
              profileDescription: generatedSummary
            }
          });

          console.log('Successfully saved initial generated summary to database');
        } catch (error) {
          console.error('Error saving initial generated summary:', error);
          // Reset the refs on error so we can retry
          lastProcessedProfileId.current = null;
          lastProcessedSummary.current = null;
        } finally {
          isInitializingSummary.current = false;
        }
      } else if (hasProfileDescription) {
        // If we already have a profile description in the database, use that
        lastProcessedProfileId.current = profileId;
        lastProcessedSummary.current = hasProfileDescription;
        setEditedSummary(hasProfileDescription);
      } else if (!generatedSummary && !hasProfileDescription) {
        // No summary to initialize, mark as processed
        lastProcessedProfileId.current = profileId;
        lastProcessedSummary.current = null;
      }
    };

    initializeSummary();
    // Only depend on the actual values we care about, not the functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData?._id, profileData?.professionalSummary?.profileDescription, generatedSummary]);

  const validateProfile = () => {
    const errors: Partial<ValidationErrors> = {};

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Phone validation regex - accepts various formats with optional country code
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

    // Validate languages (at least one required)
    if (!editedProfile.personalInfo?.languages?.length) {
      errors.languages = 'At least one language is required';
      console.error('Languages validation failed:', errors.languages);
    }

    // Validate name
    if (!editedProfile.personalInfo?.name?.trim()) {
      errors.name = 'Name is required';
      console.error('Name validation failed:', errors.name);
    }

    // Validate location
    if (!editedProfile.personalInfo?.location?.trim()) {
      errors.location = 'Location is required';
      console.error('Location validation failed:', errors.location);
    }

    // Validate email
    if (!editedProfile.professionalSummary?.currentRole?.trim()) {
      errors.currentRole = 'Current role is required';
      console.error('Current role validation failed:', errors.currentRole);
    }

    // Validate years of experience
    if (!editedProfile.professionalSummary?.yearsOfExperience?.trim()) {
      errors.yearsExperience = 'Years of experience is required';
      console.error('Years of experience validation failed:', errors.yearsExperience);
    }

    // Validate industries (at least one required)
    if (!editedProfile.professionalSummary?.industries?.length) {
      errors.industries = 'At least one industry is required';
      console.error('Industries validation failed:', errors.industries);
    }

    // Validate notable companies (at least one required)
    if (!editedProfile.professionalSummary?.notableCompanies?.length) {
      errors.companies = 'At least one notable company is required';
      console.error('Companies validation failed:', errors.companies);
    }  
    
    if (!editedProfile.personalInfo?.email?.trim()) {
      errors.email = 'Email is required';
      console.error('Email validation failed:', errors.email);
    } else if (!emailRegex.test(editedProfile.personalInfo.email)) {
      errors.email = 'Please enter a valid email address';
      console.error('Email validation failed:', errors.email);
    }

    // Validate phone
    if (!editedProfile.personalInfo?.phone?.trim()) {
      errors.phone = 'Phone number is required';
      console.error('Phone validation failed:', errors.phone);
    } else if (!phoneRegex.test(editedProfile.personalInfo.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
      console.error('Phone validation failed:', errors.phone);
    }

    console.log('Validation errors before setting state:', errors);
    setValidationErrors(errors as ValidationErrors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // Handle profile updates from AssessmentDialog
  const handleAssessmentUpdate = (updatedProfile: any) => {
    setEditedProfile(updatedProfile);
    if (onProfileUpdate) {
      onProfileUpdate(updatedProfile);
    }
  };

  const handleProfileChange = async (field: string, value: string) => {
    try {
      // Ensure personalInfo exists
      if (!editedProfile.personalInfo) {
        setEditedProfile(prev => ({
          ...prev,
          personalInfo: {
            name: '',
            location: '',
            email: '',
            phone: '',
            languages: []
          }
        }));
      }

      // Update the profile state immediately for UI responsiveness
      const updatedPersonalInfo = {
        ...(editedProfile.personalInfo || {
          name: '',
          location: '',
          email: '',
          phone: '',
          languages: []
        }),
        [field]: value
      };
  
      const updatedProfile = {
        ...editedProfile,
        personalInfo: updatedPersonalInfo
      };
  
      setEditedProfile(updatedProfile);
  
      // Validation rules
      const validations: Record<string, (val: string) => string> = {
        name: (val) => val.trim() ? '' : 'Name is required',
        location: (val) => val.trim() ? '' : 'Location is required',
        email: (val) => {
          if (!val.trim()) return 'Email is required';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(val) ? '' : 'Please enter a valid email address';
        },
        phone: (val) => {
          if (!val.trim()) return 'Phone is required';
          const phoneRegex = /^\+?[\d\s-]{10,}$/;
          return phoneRegex.test(val) ? '' : 'Please enter a valid phone number';
        }
      };
  
      // Get the appropriate validation function or use a default one
      const validateField = validations[field] || ((val) => val.trim() ? '' : `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
  
      // Run validation
      const validationError = validateField(value);
  
      // Update validation errors state
      setValidationErrors(prev => ({
        ...prev,
        [field]: validationError
      }));
  
      // Only update backend if there are no validation errors AND all required fields are filled
      const requiredFields = ['name', 'location', 'email', 'phone'];
      const currentValues = {
        ...(editedProfile.personalInfo || {
          name: '',
          location: '',
          email: '',
          phone: '',
          languages: []
        }),
        [field]: value
      };
  
      // Check if all required fields are valid
      const allFieldsValid = requiredFields.every(fieldName => {
        const fieldValue = currentValues[fieldName];
        const fieldValidation = validations[fieldName] || ((val) => val.trim() ? '' : 'Required');
        return !fieldValidation(fieldValue);
      });
  
      if (allFieldsValid && editedProfile._id) {
        await updateBasicInfo(editedProfile._id, updatedPersonalInfo);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Optionally revert the UI state if the update fails
      setEditedProfile(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo || {
            name: '',
            location: '',
            email: '',
            phone: '',
            languages: []
          }
        }
      }));
    }
  };
  
  const addIndustry = async () => {
    if (tempIndustry.trim()) {
      try {
        const currentIndustries = editedProfile.professionalSummary?.industries || [];
        const updatedIndustries = [
          ...currentIndustries,
          tempIndustry
        ];
        console.log("updated industries :", updatedIndustries);
        
        // Clear the industry validation error since we're adding one
        setValidationErrors(prev => ({
          ...prev,
          industries: ''
        }));

        if (editedProfile._id) {
          await updateProfileData(editedProfile._id, {
            professionalSummary: {
              ...(editedProfile.professionalSummary || {
                yearsOfExperience: '',
                currentRole: '',
                industries: [],
                notableCompanies: [],
                profileDescription: ''
              }),
              industries: updatedIndustries
            }
          });
        }

        setEditedProfile(prev => ({
          ...prev,
          professionalSummary: {
            ...(prev.professionalSummary || {
              yearsOfExperience: '',
              currentRole: '',
              industries: [],
              notableCompanies: [],
              profileDescription: ''
            }),
            industries: updatedIndustries
          }
        }));

        setTempIndustry('');
    } catch (error) {
        console.error('Error adding industry:', error);
      }
    }
  };

  const removeIndustry = async (index: number) => {
    try {
      const currentIndustries = editedProfile.professionalSummary?.industries || [];
      const updatedIndustries = currentIndustries.filter((_, i) => i !== index);

      // Set validation error if removing the last industry
      if (updatedIndustries.length === 0) {
        setValidationErrors(prev => ({
          ...prev,
          industries: 'At least one industry is required'
        }));
      }

      if (editedProfile._id) {
        await updateProfileData(editedProfile._id, {
          professionalSummary: {
            ...(editedProfile.professionalSummary || {
              yearsOfExperience: '',
              currentRole: '',
              industries: [],
              notableCompanies: [],
              profileDescription: ''
            }),
            industries: updatedIndustries
          }
        });
      }

      setEditedProfile(prev => ({
        ...prev,
        professionalSummary: {
          ...(prev.professionalSummary || {
            yearsOfExperience: '',
            currentRole: '',
            industries: [],
            notableCompanies: [],
            profileDescription: ''
          }),
          industries: updatedIndustries
        }
      }));
    } catch (error) {
      console.error('Error removing industry:', error);
    }
  };

  const addCompany = async () => {
    if (tempCompany.trim()) {
      try {
        const currentCompanies = editedProfile.professionalSummary?.notableCompanies || [];
        const updatedCompanies = [
          ...currentCompanies,
          tempCompany
        ];

        // Clear the companies validation error since we're adding one
        setValidationErrors(prev => ({
          ...prev,
          companies: ''
        }));

        if (editedProfile._id) {
          await updateProfileData(editedProfile._id, {
            professionalSummary: {
              ...(editedProfile.professionalSummary || {
                yearsOfExperience: '',
                currentRole: '',
                industries: [],
                notableCompanies: [],
                profileDescription: ''
              }),
              notableCompanies: updatedCompanies
            }
          });
        }

        setEditedProfile(prev => ({
          ...prev,
          professionalSummary: {
            ...(prev.professionalSummary || {
              yearsOfExperience: '',
              currentRole: '',
              industries: [],
              notableCompanies: [],
              profileDescription: ''
            }),
            notableCompanies: updatedCompanies
          }
        }));

        setTempCompany('');
      } catch (error) {
        console.error('Error adding company:', error);
      }
    }
  };

  const removeCompany = async (index: number) => {
    try {
      const currentCompanies = editedProfile.professionalSummary?.notableCompanies || [];
      const updatedCompanies = currentCompanies.filter((_, i) => i !== index);

      // Set validation error if removing the last company
      if (updatedCompanies.length === 0) {
        setValidationErrors(prev => ({
          ...prev,
          companies: 'At least one notable company is required'
        }));
      }

      if (editedProfile._id) {
        await updateProfileData(editedProfile._id, {
          professionalSummary: {
            ...(editedProfile.professionalSummary || {
              yearsOfExperience: '',
              currentRole: '',
              industries: [],
              notableCompanies: [],
              profileDescription: ''
            }),
            notableCompanies: updatedCompanies
          }
        });
      }

      setEditedProfile(prev => ({
        ...prev,
        professionalSummary: {
          ...(prev.professionalSummary || {
            yearsOfExperience: '',
            currentRole: '',
            industries: [],
            notableCompanies: [],
            profileDescription: ''
          }),
          notableCompanies: updatedCompanies
        }
      }));
    } catch (error) {
      console.error('Error removing company:', error);
    }
  };

  const addLanguage = async () => {
    console.log('editedProfile : ', editedProfile);
    if (!tempLanguage.language.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        languages: 'Language name is required'
      }));
      return;
    }
    try {
      const currentLanguages = editedProfile.personalInfo?.languages || [];
      const updatedLanguages = [
        ...currentLanguages,
        { ...tempLanguage }
      ];

      if (editedProfile._id) {
        await updateBasicInfo(editedProfile._id, {
          ...(editedProfile.personalInfo || {
            name: '',
            location: '',
            email: '',
            phone: '',
            languages: []
          }),
          languages: updatedLanguages
        });
      }

      setEditedProfile(prev => ({
        ...prev,
        personalInfo: {
          ...(prev.personalInfo || {
            name: '',
            location: '',
            email: '',
            phone: '',
            languages: []
          }),
          languages: updatedLanguages
        }
      }));

      setTempLanguage({ language: '', proficiency: 'B1' });
      setValidationErrors(prev => ({ ...prev, languages: '' }));
    } catch (error) {
      console.error('Error adding language:', error);
    }
  };

  const removeLanguage = async (index: number) => {
    console.log('editedProfile : ', editedProfile);
    try {
      const currentLanguages = editedProfile.personalInfo?.languages || [];
      if (currentLanguages.length <= 1) {
        setValidationErrors(prev => ({
          ...prev,
          languages: 'At least one language is required'
        }));
        return;
      }
      const updatedLanguages = currentLanguages.filter((_, i) => i !== index);

      if (editedProfile._id) {
        await updateBasicInfo(editedProfile._id, {
          ...(editedProfile.personalInfo || {
            name: '',
            location: '',
            email: '',
            phone: '',
            languages: []
          }),
          languages: updatedLanguages
        });
      }

      setEditedProfile(prev => ({
        ...prev,
        personalInfo: {
          ...(prev.personalInfo || {
            name: '',
            location: '',
            email: '',
            phone: '',
            languages: []
          }),
          languages: updatedLanguages
        }
      }));
    } catch (error) {
      console.error('Error removing language:', error);
    }
  };

  const updateLanguageProficiency = async (index: number, newProficiency: string) => {
    try {
      const currentLanguages = editedProfile.personalInfo?.languages || [];
      const updatedLanguages = currentLanguages.map((lang, i) => 
        i === index ? { ...lang, proficiency: newProficiency } : lang
      );

      if (editedProfile._id) {
        await updateBasicInfo(editedProfile._id, {
          ...(editedProfile.personalInfo || {
            name: '',
            location: '',
            email: '',
            phone: '',
            languages: []
          }),
          languages: updatedLanguages
        });
      }

      setEditedProfile(prev => ({
        ...prev,
        personalInfo: {
          ...(prev.personalInfo || {
            name: '',
            location: '',
            email: '',
            phone: '',
            languages: []
          }),
          languages: updatedLanguages
        }
      }));
    } catch (error) {
      console.error('Error updating language proficiency:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const regenerateSummary = async () => {
    try {
      setLoading(true);
      
      // Use backend API instead of client-side OpenAI
      const response = await api.post('/cv/generate-summary', {
        profileData: editedProfile
      });

      // The backend returns the summary directly as a string
      const newSummary = response.data;
      
      setEditedSummary(newSummary);
      setEditedProfile(prev => ({
        ...prev,
        professionalSummary: {
          ...prev.professionalSummary,
          profileDescription: newSummary
        }
      }));

      await updateProfileData(editedProfile._id, {
        professionalSummary: {
          ...editedProfile.professionalSummary,
          profileDescription: newSummary
        }
      });

      setIsEditing(false);
      showToast('Professional summary has been regenerated successfully!');
      
    } catch (error: any) {
      console.error('Failed to regenerate summary:', error);
      showToast('Failed to regenerate summary. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    try {
      await updateProfileData(editedProfile._id, {
        professionalSummary: {
          ...editedProfile.professionalSummary,
          profileDescription: editedSummary
        }
      });

      setEditedProfile(prev => ({
        ...prev,
        professionalSummary: {
          ...prev.professionalSummary,
          profileDescription: editedSummary
        }
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };

  const pushToRepsProfile = () => {
    const { isValid, errors } = validateProfile();
    console.log('validateProfile() result:', isValid);
    
    if (isValid) {
      setShowAssessment(true);
    } else {
      // Use setTimeout to ensure the DOM has updated with the error elements
      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        const errorElement = document.getElementById(`error-${firstErrorKey}`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          console.error('Error element not found:', firstErrorKey);
        }
      }, 0);
    }
  };

  // Render validation error message
  const renderError = (error: string, id: string) => {
    if (!error) return null;
  return (
      <div id={`error-${id}`} className="text-red-600 text-sm mt-1 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </div>
    );
  };

  const renderSkillSection = (title: string, skills: any[], type: string) => {
    const handleAdd = async () => {
      try {
        if (type === 'industries') {
          if (!tempIndustry.trim()) return;
          const currentIndustries = editedProfile.professionalSummary?.industries || [];
          const updatedIndustries = [...currentIndustries, tempIndustry];
          
          if (editedProfile._id) {
            await updateProfileData(editedProfile._id, {
              professionalSummary: {
                ...(editedProfile.professionalSummary || {
                  yearsOfExperience: '',
                  currentRole: '',
                  industries: [],
                  notableCompanies: [],
                  profileDescription: ''
                }),
                industries: updatedIndustries
              }
            });
          }
          setTempIndustry('');
          
          setEditedProfile(prev => ({
            ...prev,
            professionalSummary: {
              ...(prev.professionalSummary || {
                yearsOfExperience: '',
                currentRole: '',
                industries: [],
                notableCompanies: [],
                profileDescription: ''
              }),
              industries: updatedIndustries
            }
          }));
          
        } else if (type === 'notableCompanies') {
          if (!tempCompany.trim()) return;
          const currentCompanies = editedProfile.professionalSummary?.notableCompanies || [];
          const updatedCompanies = [...currentCompanies, tempCompany];
          
          if (editedProfile._id) {
            await updateProfileData(editedProfile._id, {
              professionalSummary: {
                ...(editedProfile.professionalSummary || {
                  yearsOfExperience: '',
                  currentRole: '',
                  industries: [],
                  notableCompanies: [],
                  profileDescription: ''
                }),
                notableCompanies: updatedCompanies
              }
            });
          }
          setTempCompany('');
          
          setEditedProfile(prev => ({
            ...prev,
            professionalSummary: {
              ...(prev.professionalSummary || {
                yearsOfExperience: '',
                currentRole: '',
                industries: [],
                notableCompanies: [],
                profileDescription: ''
              }),
              notableCompanies: updatedCompanies
            }
          }));
          
        } else {
          // Handle skills (technical, professional, soft)
          if (!tempSkill[type as keyof typeof tempSkill]?.trim()) return;
          
          const currentSkills = editedProfile.skills?.[type] || [];
          const newSkill = {
            skill: tempSkill[type as keyof typeof tempSkill],
            level: 1, // Default level
            details: '' // Optional details
          };
          const updatedSkills = [...currentSkills, newSkill];
          
          const newSkills = {
            ...(editedProfile.skills || {
              technical: [],
              professional: [],
              soft: []
            }),
            [type]: updatedSkills
          };
          
          // First update the backend
          if (editedProfile._id) {
            await updateSkills(editedProfile._id, newSkills);
          }
          
          // Then update local state
          setEditedProfile(prev => ({
            ...prev,
            skills: {
              ...(prev.skills || {
                technical: [],
                professional: [],
                soft: []
              }),
              [type]: updatedSkills
            }
          }));
          
          // Clear the input
          setTempSkill(prev => ({ ...prev, [type]: '' }));
        }
      } catch (error: any) {
        console.error(`Error adding ${type}:`, error);
        alert(`Failed to add ${type}: ${error.message}`);
      }
    };

    const handleRemove = async (index: number) => {
      try {
        if (type === 'industries' || type === 'notableCompanies') {
          const currentData = editedProfile.professionalSummary?.[type as keyof typeof editedProfile.professionalSummary] as any[] || [];
          const updatedData = currentData.filter((_: any, i: number) => i !== index);
          
          if (editedProfile._id) {
            await updateProfileData(editedProfile._id, {
              professionalSummary: {
                ...(editedProfile.professionalSummary || {
                  yearsOfExperience: '',
                  currentRole: '',
                  industries: [],
                  notableCompanies: [],
                  profileDescription: ''
                }),
                [type]: updatedData
              }
            });
          }
          
          setEditedProfile(prev => ({
            ...prev,
            professionalSummary: {
              ...(prev.professionalSummary || {
                yearsOfExperience: '',
                currentRole: '',
                industries: [],
                notableCompanies: [],
                profileDescription: ''
              }),
              [type]: updatedData
            }
          }));
        } else {
          const currentSkills = editedProfile.skills?.[type] || [];
          const updatedSkills = currentSkills.filter((_, i) => i !== index);
          
          const newSkills = {
            ...(editedProfile.skills || {
              technical: [],
              professional: [],
              soft: []
            }),
            [type]: updatedSkills
          };
          
          // First update the backend
          if (editedProfile._id) {
            await updateSkills(editedProfile._id, newSkills);
          }
          
          // Then update local state
          setEditedProfile(prev => ({
            ...prev,
            skills: {
              ...(prev.skills || {
                technical: [],
                professional: [],
                soft: []
              }),
              [type]: updatedSkills
            }
          }));
        }
      } catch (error: any) {
        console.error(`Error removing ${type}:`, error);
        alert(`Failed to remove ${type}: ${error.message}`);
      }
    };

    const getTempValue = () => {
      if (type === 'industries') return tempIndustry;
      if (type === 'notableCompanies') return tempCompany;
      return tempSkill[type as keyof typeof tempSkill] || '';
    };

    const handleTempChange = (value: string) => {
      if (type === 'industries') setTempIndustry(value);
      else if (type === 'notableCompanies') setTempCompany(value);
      else setTempSkill(prev => ({ ...prev, [type]: value }));
    };

    return (
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          {title === 'Technical Skills' && '🔧'}
          {title === 'Professional Skills' && '💼'}
          {title === 'Soft Skills' && '🤝'}
          {title === 'Notable Companies' && '🌟'}
          {title === 'Industries' && '🏭'}
          <span className="ml-2">{title}</span>
        </h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Array.isArray(skills) && skills.map((skill, index) => {
              // Extract skill name/string for display
              let skillName = '';
              if (typeof skill === 'string') {
                skillName = skill;
              } else if (skill && typeof skill === 'object') {
                // For skills: skill.skill can be an object with _id, name, etc., or a string
                if (skill.skill) {
                  if (typeof skill.skill === 'string') {
                    skillName = skill.skill;
                  } else if (skill.skill.name) {
                    skillName = skill.skill.name;
                  } else {
                    skillName = String(skill.skill);
                  }
                } else if (skill.name) {
                  // For industries/activities: direct name property
                  skillName = skill.name;
                } else {
                  skillName = String(skill);
                }
              } else {
                skillName = String(skill || '');
              }
              
              return (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
              >
                <span>{skillName}</span>
                {editingProfile && (
                  <button
                    onClick={() => handleRemove(index)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              );
            })}
          </div>
          {editingProfile && (
            <div className="flex gap-2">
              <input
                type="text"
                value={getTempValue()}
                onChange={(e) => handleTempChange(e.target.value)}
                className="flex-1 p-2 border rounded-md bg-white/50"
                placeholder={`Add ${title.toLowerCase()}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
              <button
                onClick={handleAdd}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExperienceSection = () => {
    const formatDate = (date: string | Date | 'present') => {
      if (date === 'present') return 'Present';
      if (!date) return '';
      try {
        const dateObj = new Date(date as string | Date);
        if (isNaN(dateObj.getTime())) return String(date);
        
        // Format as dd/mm/yyyy
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
        const year = dateObj.getFullYear();
        
        return `${day}/${month}/${year}`;
      } catch (error) {
        console.error('Error formatting date:', error);
        return String(date);
      }
    };

    interface ExperienceFormProps {
      experience: Experience | NewExperience;
      onSubmit: (data: any) => void;
      isNew?: boolean;
    }

    const ExperienceForm = ({ experience, onSubmit, isNew = false }: ExperienceFormProps) => {
      const [formData, setFormData] = useState({
        title: experience.title || '',
        company: experience.company || '',
        startDate: experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
        endDate: experience.endDate && experience.endDate !== 'present' ? new Date(experience.endDate).toISOString().split('T')[0] : '',
        responsibilities: experience.responsibilities || [''],
        isPresent: experience.endDate === 'present' || (experience as any).isPresent || false
      });

      const handleInputChange = (field: string, value: any) => {
        console.log(`Updating ${field} with value:`, value);
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      };

      const handleResponsibilityChange = (index: number, value: string) => {
        const updatedResponsibilities = [...formData.responsibilities];
        updatedResponsibilities[index] = value;
        setFormData(prev => ({
          ...prev,
          responsibilities: updatedResponsibilities
        }));
      };

      const addResponsibilityField = () => {
        setFormData(prev => ({
          ...prev,
          responsibilities: [...prev.responsibilities, '']
        }));
      };

      const removeResponsibilityField = (index: number) => {
        setFormData(prev => ({
          ...prev,
          responsibilities: prev.responsibilities.filter((_, i) => i !== index)
        }));
      };

      const handleSubmit = () => {
        console.log('Form data before submission:', formData);
        
        // Convert dates to proper format before submitting
        const experienceData = {
          ...formData,
          startDate: formData.startDate, // Keep as YYYY-MM-DD string
          endDate: formData.isPresent ? 'present' : formData.endDate // Keep as YYYY-MM-DD string or 'present'
        };

        console.log('Experience data being submitted:', experienceData);
        onSubmit(experienceData);
      };

      return (
        <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input 
                        type="text" 
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Software Engineer"
                    />
                </div>
                <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input 
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Tech Corp"
                    />
                </div>
                 <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  disabled={formData.isPresent}
                  className="flex-1 p-2 border rounded-md disabled:bg-gray-100"
                />
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.isPresent}
                    onChange={(e) => {
                      handleInputChange('isPresent', e.target.checked);
                      if (e.target.checked) {
                        handleInputChange('endDate', '');
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  Present
                </label>
                </div>
            </div>
        </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Add a responsibility"
                />
                <button
                  onClick={() => removeResponsibilityField(index)}
                  className="text-red-500 hover:text-red-700"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={addResponsibilityField}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Responsibility
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => isNew ? setShowNewExperienceForm(false) : setEditingExperience(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              type="button"
            >
              {isNew ? 'Add Experience' : 'Save Changes'}
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="mb-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Professional Experience</h3>
            {editingProfile && (
              <button
                onClick={() => setShowNewExperienceForm(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Experience
              </button>
            )}
          </div>

          {showNewExperienceForm && (
            <div className="mb-6">
              <ExperienceForm
                experience={newExperience}
                onSubmit={handleAddExperience}
                isNew={true}
              />
            </div>
          )}

          <div className="space-y-6">
            {editedProfile.experience?.map((role: Experience, index: number) => (
              <div key={index} className="relative">
                {editingExperience === role ? (
                  <ExperienceForm
                    experience={editingExperience}
                    onSubmit={handleExperienceUpdate}
                    isNew={false}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 relative group">
                    {editingProfile && (
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                        <button
                          onClick={() => setEditingExperience(role)}
                          className="p-2 text-blue-600 hover:text-blue-700 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveExperience(index)}
                          className="p-2 text-red-600 hover:text-red-700 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="flex justify-between items-start">
            <div>
                        <h4 className="text-lg font-semibold text-gray-800">{role.title}</h4>
                        <p className="text-gray-600">{role.company}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(role.startDate)} - {formatDate(role.endDate)}
                      </div>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {role.responsibilities?.map((resp, idx) => (
                        <li key={idx} className="text-gray-700 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleExperienceUpdate = async (updatedExperience: any) => {
    try {
      const updatedExperiences = [...editedProfile.experience];
      const index = editedProfile.experience.findIndex((exp: Experience) => exp === editingExperience);
      updatedExperiences[index] = updatedExperience;

      await updateExperience(editedProfile._id, updatedExperiences);

      setEditedProfile(prev => ({
        ...prev,
        experience: updatedExperiences
      }));
      setEditingExperience(null);
    } catch (error) {
      console.error('Error updating experience:', error);
    }
  };

  const handleAddExperience = async (experienceData: any) => {
    try {
      console.log('Raw experience data received:', experienceData);
      console.log('Raw startDate:', experienceData.startDate);
      console.log('Raw endDate:', experienceData.endDate);
      console.log('isPresent:', experienceData.isPresent);

      // Process the dates before creating the experience
      const processedExperience = {
        ...experienceData,
        startDate: new Date(experienceData.startDate),
        // Handle endDate specially
        endDate: experienceData.isPresent ? 'present' : new Date(experienceData.endDate)
      };

      console.log('Processed experience before validation:', processedExperience);
      console.log('Processed startDate type:', typeof processedExperience.startDate);
      console.log('Processed startDate value:', processedExperience.startDate);
      console.log('Processed endDate type:', typeof processedExperience.endDate);
      console.log('Processed endDate value:', processedExperience.endDate);

      // Validate the dates
      if (isNaN((processedExperience.startDate as Date).getTime())) {
        throw new Error('Invalid start date');
      }
      if (!experienceData.isPresent && isNaN((processedExperience.endDate as Date).getTime())) {
        throw new Error('Invalid end date');
      }

      // Create a new array with the new experience at the beginning
      const updatedExperiences = [
        processedExperience,
        ...(editedProfile.experience || [])
      ];

      console.log('Final data being sent to backend:', updatedExperiences);

      await updateExperience(editedProfile._id, updatedExperiences);

      setEditedProfile(prev => ({
        ...prev,
        experience: updatedExperiences
      }));
      setShowNewExperienceForm(false);
      setNewExperience({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        responsibilities: [''],
        isPresent: false
      });
    } catch (error: any) {
      console.error('Error adding experience:', error);
      alert('Error adding experience: ' + error.message);
    }
  };

  const handleRemoveExperience = async (index: number) => {
    try {
      const updatedExperiences = editedProfile.experience.filter((_: any, i: number) => i !== index);
      await updateExperience(editedProfile._id, updatedExperiences);

      setEditedProfile(prev => ({
        ...prev,
        experience: updatedExperiences
      }));
    } catch (error) {
      console.error('Error removing experience:', error);
    }
  };

  const handleAvailabilityChange = async (field: string, value: any) => {
    try {
      const updatedAvailability = {
        ...editedProfile.availability,
        [field]: value
      };

      await updateProfileData(editedProfile._id, {
        availability: updatedAvailability
      });

      setEditedProfile(prev => ({
        ...prev,
        availability: updatedAvailability
      }));
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Professional Story ✨</h2>
            <button
              onClick={() => {
                if (!editingProfile) {
                  setValidationErrors(prev => ({ ...prev, languages: '' }));
                }
                setEditingProfile(!editingProfile)
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              {editingProfile ? '💾 Save Profile' : '✏️ Edit Profile'}
            </button>
          </div>

          {/* Profile Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {editingProfile ? (
              <>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">👤 Name</h3>
                  <input
                    type="text"
                    value={editedProfile.personalInfo?.name || ''}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full p-2 border rounded-md bg-white/50"
                    placeholder="Enter your name"
                  />
                  {renderError(validationErrors.name, 'name')}
            </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📍 Location</h3>
                  <input
                    type="text"
                    value={editedProfile.personalInfo?.location || ''}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    className="w-full p-2 border rounded-md bg-white/50"
                    placeholder="Enter your location"
                  />
                  {renderError(validationErrors.location, 'location')}
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📧 Email</h3>
                  <input
                    type="email"
                    value={editedProfile.personalInfo?.email || ''}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full p-2 border rounded-md bg-white/50"
                    placeholder="Enter your email"
                  />
                  {renderError(validationErrors.email, 'email')}
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📱 Phone</h3>
                  <input
                    type="tel"
                    value={editedProfile.personalInfo?.phone || ''}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full p-2 border rounded-md bg-white/50"
                    placeholder="Enter your phone number"
                  />
                  {renderError(validationErrors.phone, 'phone')}
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">🌍 Languages</h3>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(editedProfile.personalInfo?.languages || []).map((lang: any, index: number) => {
                        // Ensure language is always a string
                        const languageName = typeof lang.language === 'string' 
                          ? lang.language 
                          : (lang.language?.name || lang.language?.nativeName || lang.language?.code || '');
                        
                        return (
                        <div key={index} className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-full group relative hover:bg-white transition-colors duration-200">
                          <span className="text-sm font-medium text-gray-700">
                            {languageName}
                          </span>
                          <div className="h-4 w-px bg-gray-300"></div>
                          <div className="relative inline-block min-w-[80px]">
                            <button
                              onClick={(e) => {
                                // Close all other dropdowns first
                                const allDropdowns = document.querySelectorAll('.language-proficiency-dropdown');
                                allDropdowns.forEach(d => d.classList.add('hidden'));
                                // Toggle current dropdown
                                const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                dropdown.classList.toggle('hidden');
                              }}
                              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              {lang.proficiency}
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <div className="language-proficiency-dropdown hidden absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48 z-20">
                              {proficiencyLevels.map(level => (
                                <button
                                  key={level.value}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center justify-between group/item ${
                                    lang.proficiency === level.value ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                                  }`}
                                  onClick={async () => {
                                    await updateLanguageProficiency(index, level.value);
                                    // Close the dropdown after selecting a value
                                    const dropdowns = document.querySelectorAll('.language-proficiency-dropdown');
                                    dropdowns.forEach(dropdown => dropdown.classList.add('hidden'));
                                  }}
                                >
                                  <span>{level.label}</span>
                                  {lang.proficiency === level.value && (
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  <div className="absolute hidden group-hover/item:block bg-black text-white text-xs rounded p-2 z-30 left-full ml-2 -translate-y-1/2 w-48">
                                    {level.description}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="h-4 w-px bg-gray-300"></div>
                          <button
                            onClick={() => removeLanguage(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                            title="Remove language"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        );
                      })}
                    </div>
                    {renderError(validationErrors.languages, 'languages')}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempLanguage.language}
                        onChange={(e) => setTempLanguage(prev => ({ ...prev, language: e.target.value }))}
                        className="flex-1 p-2 border rounded-md bg-white/50"
                        placeholder="Add a language"
                      />
                      <div className="relative inline-block min-w-[180px]">
                        <button
                          onClick={(e) => {
                            const dropdowns = document.querySelectorAll('.proficiency-dropdown');
                            dropdowns.forEach(dropdown => dropdown.classList.add('hidden'));
                            const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                            dropdown.classList.toggle('hidden');
                          }}
                          className="w-full flex items-center justify-between p-2 border rounded-md bg-white/50 text-sm text-gray-700"
                        >
                          <span>{proficiencyLevels.find(l => l.value === tempLanguage.proficiency)?.label}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="proficiency-dropdown hidden absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-full z-20">
                          {proficiencyLevels.map(level => (
                            <button
                              key={level.value}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center justify-between ${
                                tempLanguage.proficiency === level.value ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                              }`}
                              onClick={() => {
                                setTempLanguage(prev => ({ ...prev, proficiency: level.value }));
                                // Hide dropdown after selection
                                const dropdowns = document.querySelectorAll('.proficiency-dropdown');
                                dropdowns.forEach(dropdown => dropdown.classList.add('hidden'));
                              }}
                            >
                              <span>{level.label}</span>
                              {tempLanguage.proficiency === level.value && (
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={addLanguage}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </button>
                    </div>
                    
                    {/* Proficiency Level Descriptions */}
                    <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Language Proficiency Levels:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {proficiencyLevels.map(level => (
                          <div 
                            key={level.value}
                            className={`p-3 rounded-lg border ${
                              tempLanguage.proficiency === level.value 
                                ? 'border-blue-200 bg-blue-50' 
                                : 'border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-800">{level.label}</span>
                              {tempLanguage.proficiency === level.value && (
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{level.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">👤 Name</h3>
                  <p className="text-xl font-semibold text-gray-800">{editedProfile.personalInfo?.name || 'Not specified'}</p>
                  {renderError(validationErrors.name, 'name')}
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📍 Location</h3>
                  <p className="text-xl font-semibold text-gray-800">{editedProfile.personalInfo?.location || 'Not specified'}</p>
                  {renderError(validationErrors.location, 'location')}
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📧 Email</h3>
                  <p className="text-xl font-semibold text-gray-800">{editedProfile.personalInfo?.email || 'Not specified'}</p>
                  {renderError(validationErrors.email, 'email')}
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">📱 Phone</h3>
                  <p className="text-xl font-semibold text-gray-800">{editedProfile.personalInfo?.phone || 'Not specified'}</p>
                  {renderError(validationErrors.phone, 'phone')}
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">🌍 Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {(editedProfile.personalInfo?.languages || []).map((lang: any, index: number) => {
                      // Ensure language is always a string
                      const languageName = typeof lang.language === 'string' 
                        ? lang.language 
                        : (lang.language?.name || lang.language?.nativeName || lang.language?.code || '');
                      
                      return (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/50 text-gray-700 rounded-full text-sm font-medium group relative"
                      >
                        <span>{languageName}</span>
                        <span className="text-blue-600 ml-1">({lang.proficiency})</span>
                        <div className="absolute hidden group-hover:block bg-black text-white text-xs rounded p-2 z-10 bottom-full mb-1 left-1/2 transform -translate-x-1/2 w-48">
                          {proficiencyLevels.find(level => level.value === lang.proficiency)?.description}
                        </div>
                      </span>
                      );
                    })}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">⭐ Experience</h3>
                  <p className="text-xl font-semibold text-gray-800">{editedProfile.professionalSummary?.yearsOfExperience || 'Not specified'}</p>
                  {renderError(validationErrors.yearsExperience, 'yearsExperience')}
                </div>
              </>
            )}
        </div>

        {/* Experience Section */}
          {renderExperienceSection()}

          {/* Skills Sections */}
          <div className="space-y-6">
            {renderSkillSection('Technical Skills', editedProfile.skills?.technical || [], 'technical')}
            {renderSkillSection('Professional Skills', editedProfile.skills?.professional || [], 'professional')}
            {renderSkillSection('Soft Skills', editedProfile.skills?.soft || [], 'soft')}
            {renderSkillSection('Industries', editedProfile.professionalSummary?.industries || [], 'industries')}
            {renderSkillSection('Notable Companies', editedProfile.professionalSummary?.notableCompanies || [], 'notableCompanies')}
          </div>

          {/* Availability Section */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Working Hours & Availability</h3>
            
            {editingProfile ? (
              <div className="space-y-6">
                {/* Working Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <button
                        key={day}
                        onClick={() => {
                          const currentDays = editedProfile.availability?.days || [];
                          const updatedDays = currentDays.includes(day)
                            ? currentDays.filter(d => d !== day)
                            : [...currentDays, day];
                          handleAvailabilityChange('days', updatedDays);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          editedProfile.availability?.days?.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={editedProfile.availability?.hours?.start || ''}
                        onChange={(e) => handleAvailabilityChange('hours', {
                          ...editedProfile.availability?.hours,
                          start: e.target.value
                        })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">End Time</label>
                      <input
                        type="time"
                        value={editedProfile.availability?.hours?.end || ''}
                        onChange={(e) => handleAvailabilityChange('hours', {
                          ...editedProfile.availability?.hours,
                          end: e.target.value
                        })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Time Zones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zones</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'New York (EST/EDT)',
                      'Chicago (CST/CDT)',
                      'Denver (MST/MDT)',
                      'Los Angeles (PST/PDT)',
                      'London (GMT/BST)',
                      'Paris (CET/CEST)',
                      'Dubai (GST)',
                      'Singapore (SGT)',
                      'Tokyo (JST)',
                      'Sydney (AEST/AEDT)'
                    ].map((zone) => (
            <button
                        key={zone}
                        onClick={() => {
                          const currentZones = editedProfile.availability?.timeZones || [];
                          const updatedZones = currentZones.includes(zone)
                            ? currentZones.filter(z => z !== zone)
                            : [...currentZones, zone];
                          handleAvailabilityChange('timeZones', updatedZones);
                        }}
                        className={`p-2 rounded-lg text-sm font-medium text-left transition-colors duration-200 ${
                          editedProfile.availability?.timeZones?.includes(zone)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {zone}
            </button>
                    ))}
        </div>
      </div>

                {/* Schedule Flexibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Flexibility</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Remote Work Available',
                      'Flexible Hours',
                      'Weekend Rotation',
                      'Night Shift Available',
                      'Split Shifts',
                      'Part-Time Options',
                      'Compressed Work Week',
                      'Shift Swapping Allowed'
                    ].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          const currentFlexibility = editedProfile.availability?.flexibility || [];
                          const updatedFlexibility = currentFlexibility.includes(option)
                            ? currentFlexibility.filter(f => f !== option)
                            : [...currentFlexibility, option];
                          handleAvailabilityChange('flexibility', updatedFlexibility);
                        }}
                        className={`p-2 rounded-lg text-sm font-medium text-left transition-colors duration-200 ${
                          editedProfile.availability?.flexibility?.includes(option)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Working Days Display */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Working Days</h4>
                  <div className="flex flex-wrap gap-2">
                    {editedProfile.availability?.days?.map((day: string) => (
                      <span
                        key={day}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Working Hours Display */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Working Hours</h4>
                  <p className="text-lg font-semibold text-gray-800">
                    {editedProfile.availability?.hours?.start && editedProfile.availability?.hours?.end
                      ? `${editedProfile.availability.hours.start} - ${editedProfile.availability.hours.end}`
                      : 'Not specified'}
                  </p>
                </div>

                {/* Time Zones Display */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Time Zones</h4>
                  <div className="flex flex-wrap gap-2">
                    {editedProfile.availability?.timeZones?.map((zone: string) => (
                      <span
                        key={zone}
                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schedule Flexibility Display */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Schedule Flexibility</h4>
                  <div className="flex flex-wrap gap-2">
                    {editedProfile.availability?.flexibility?.map((option: string) => (
                      <span
                        key={option}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Professional Summary</h3>
              <button
                onClick={regenerateSummary}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? '✨ Working Magic...' : '🔄 Regenerate Summary'}
              </button>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="w-full h-64 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Edit your professional summary..."
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditedSummary(editedProfile.professionalSummary?.profileDescription || '');
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSummary}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                  <p className="text-gray-800 whitespace-pre-line text-lg leading-relaxed">
                    {editedProfile.professionalSummary?.profileDescription || 'No professional summary yet. Click "Regenerate Summary" to create one, or "Edit" to write your own.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-blue-600 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={pushToRepsProfile}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200 flex items-center gap-2"
            >
              <span>🚀 Confirm REPS Qualifications</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AssessmentDialog
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        languages={editedProfile.personalInfo?.languages || []}
        profileData={editedProfile}
        onProfileUpdate={handleAssessmentUpdate}
      />

      {/* Add Toast Component */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all transform duration-500 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryEditor;
