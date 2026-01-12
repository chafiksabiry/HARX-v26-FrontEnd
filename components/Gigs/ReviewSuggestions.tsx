"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Briefcase, 
  FileText,
  Globe2,
  Clock,
  DollarSign,
  Award,
  Users,
  CalendarDays,
  MapPin,
  TrendingUp,
  Zap,
  Lightbulb,
  Code,
  MessageSquare,
  Check,
  Plus,
  Info,
  Edit2,
  Trash2,
  X,
  Save,
  ArrowUp,
  Sun,
  Moon
} from "lucide-react";
import { GigSuggestion } from "../../types/gigs";
import Logo from "./Logo";
import { 
  fetchAllCountries, 
  Country, 
  fetchAllTimezones, 
  Timezone,
  fetchSoftSkills,
  fetchTechnicalSkills,
  fetchProfessionalSkills,
  getCountryNameById,
  fetchAllCurrencies,
  fetchCurrencyById,
  Currency
} from "../../lib/gigs/api";
import { 
  loadActivities, 
  loadIndustries, 
  loadLanguages,
  getActivityOptions, 
  getIndustryOptions,
  getLanguageOptions,
  getActivityNameById,
  getIndustryNameById,
  getLanguageNameById
} from "../../lib/gigs/activitiesIndustries";
import { predefinedOptions } from "../../lib/gigs/guidance";

interface ReviewSuggestionsProps {
  input: string;
  onBack: () => void;
  onConfirm: (suggestions: GigSuggestion) => void;
  initialSuggestions?: GigSuggestion | null;
}

export const ReviewSuggestions: React.FC<ReviewSuggestionsProps> = ({ 
  input, 
  onBack, 
  onConfirm, 
  initialSuggestions 
}) => {
  const [suggestions, setSuggestions] = useState<GigSuggestion | null>(initialSuggestions || null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);
  
  // Data loading states
  const [countries, setCountries] = useState<Country[]>([]);
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [activities, setActivities] = useState<Array<{ value: string; label: string; category: string }>>([]);
  const [industries, setIndustries] = useState<Array<{ value: string; label: string }>>([]);
  const [languages, setLanguages] = useState<Array<{ value: string; label: string; code: string }>>([]);
  const [softSkills, setSoftSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [technicalSkills, setTechnicalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [professionalSkills, setProfessionalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  
  const [loading, setLoading] = useState(true);

  // Editing states
  const [editingJobTitleIndex, setEditingJobTitleIndex] = useState<number | null>(null);
  const [editingHighlightIndex, setEditingHighlightIndex] = useState<number | null>(null);
  const [editingDeliverableIndex, setEditingDeliverableIndex] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  
  // New item states
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  // Show add form states
  const [showAddJobTitle, setShowAddJobTitle] = useState(false);
  const [showAddHighlight, setShowAddHighlight] = useState(false);
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  
  // Selected values for dropdowns
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedDestinationZone, setSelectedDestinationZone] = useState('');
  const [selectedSeniorityLevel, setSelectedSeniorityLevel] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [selectedFlexibility, setSelectedFlexibility] = useState('');
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  // Log suggestions on mount and set first job title as selected
  useEffect(() => {
    console.log("📋 REVIEW SUGGESTIONS - Initial suggestions:", initialSuggestions);
    console.log("📋 REVIEW SUGGESTIONS - Input:", input);
    console.log("🏭 REVIEW SUGGESTIONS - Industries in suggestions:", initialSuggestions?.industries);
    console.log("🎯 REVIEW SUGGESTIONS - Activities in suggestions:", initialSuggestions?.activities);
    if (initialSuggestions) {
      setSuggestions(initialSuggestions);
      // Always select the first job title if available
      const firstTitle = initialSuggestions.selectedJobTitle || initialSuggestions.jobTitles?.[0] || null;
      setSelectedJobTitle(firstTitle);
      if (firstTitle && !initialSuggestions.selectedJobTitle) {
        // Update suggestions to include selectedJobTitle
        setSuggestions({
          ...initialSuggestions,
          selectedJobTitle: firstTitle
        });
      }
      console.log("📋 REVIEW SUGGESTIONS - Selected job title:", firstTitle);
      console.log("📋 REVIEW SUGGESTIONS - All job titles:", initialSuggestions.jobTitles);
    }
  }, [initialSuggestions, input]);

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        console.log("📋 REVIEW SUGGESTIONS - Loading all data...");
        
        // Load countries
        const countriesData = await fetchAllCountries();
        setCountries(countriesData);
        console.log("📋 REVIEW SUGGESTIONS - Loaded countries:", countriesData.length);
        
        // Load timezones
        const timezonesData = await fetchAllTimezones();
        setTimezones(timezonesData);
        console.log("📋 REVIEW SUGGESTIONS - Loaded timezones:", timezonesData.length);
        
        // Load currencies
        const currenciesData = await fetchAllCurrencies();
        setCurrencies(currenciesData);
        console.log("📋 REVIEW SUGGESTIONS - Loaded currencies:", currenciesData.length);
        
        // Load activities, industries, languages
        await loadActivities();
        await loadIndustries();
        await loadLanguages();
        
        const activityOptions = getActivityOptions();
        const industryOptions = getIndustryOptions();
        const languageOptions = getLanguageOptions();
        
        setActivities(activityOptions);
        setIndustries(industryOptions);
        setLanguages(languageOptions);
        console.log("📋 REVIEW SUGGESTIONS - Loaded activities:", activityOptions.length);
        console.log("📋 REVIEW SUGGESTIONS - Loaded industries:", industryOptions.length);
        console.log("📋 REVIEW SUGGESTIONS - Loaded languages:", languageOptions.length);
        
        // Load skills
        const { data: softSkillsData } = await fetchSoftSkills();
        const { data: technicalSkillsData } = await fetchTechnicalSkills();
        const { data: professionalSkillsData } = await fetchProfessionalSkills();
        
        // Ensure we have arrays
        const softSkillsArray = Array.isArray(softSkillsData) ? softSkillsData : [];
        const technicalSkillsArray = Array.isArray(technicalSkillsData) ? technicalSkillsData : [];
        const professionalSkillsArray = Array.isArray(professionalSkillsData) ? professionalSkillsData : [];
        
        setSoftSkills(softSkillsArray);
        setTechnicalSkills(technicalSkillsArray);
        setProfessionalSkills(professionalSkillsArray);
        console.log("📋 REVIEW SUGGESTIONS - Loaded soft skills:", softSkillsArray.length);
        console.log("📋 REVIEW SUGGESTIONS - Loaded technical skills:", technicalSkillsArray.length);
        console.log("📋 REVIEW SUGGESTIONS - Loaded professional skills:", professionalSkillsArray.length);
        console.log("📋 REVIEW SUGGESTIONS - Soft skills data type:", typeof softSkillsData, Array.isArray(softSkillsData));
        console.log("📋 REVIEW SUGGESTIONS - Technical skills data type:", typeof technicalSkillsData, Array.isArray(technicalSkillsData));
        console.log("📋 REVIEW SUGGESTIONS - Professional skills data type:", typeof professionalSkillsData, Array.isArray(professionalSkillsData));
        
      } catch (error) {
        console.error("❌ REVIEW SUGGESTIONS - Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, []);

  // Load selected currency when currency ID changes
  useEffect(() => {
    const loadSelectedCurrency = async () => {
      if (suggestions?.commission?.currency && currencies.length > 0) {
        // First try to find in loaded currencies
        const foundCurrency = currencies.find(c => c._id === suggestions.commission.currency);
        if (foundCurrency) {
          setSelectedCurrency(foundCurrency);
          console.log("💰 REVIEW SUGGESTIONS - Selected currency from list:", foundCurrency);
        } else {
          // If not found, fetch by ID
          try {
            const fetchedCurrency = await fetchCurrencyById(suggestions.commission.currency);
            if (fetchedCurrency) {
              setSelectedCurrency(fetchedCurrency);
              console.log("💰 REVIEW SUGGESTIONS - Selected currency from API:", fetchedCurrency);
            }
          } catch (error) {
            console.error("❌ Error fetching selected currency:", error);
          }
        }
      } else {
        setSelectedCurrency(null);
      }
    };

    loadSelectedCurrency();
  }, [suggestions?.commission?.currency, currencies]);

  // Helper functions
  const getCountryName = (countryId: string): string => {
    const country = countries.find(c => c._id === countryId);
    return country ? country.name.common : countryId;
  };

  const getTimezoneName = (timezoneId: string): string => {
    const timezone = timezones.find(tz => tz._id === timezoneId);
    if (timezone) {
      const offsetHours = timezone.gmtOffset / 3600;
      const offsetString = offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`;
      return `${timezone.zoneName} (${timezone.countryName}) UTC${offsetString}`;
    }
    return timezoneId;
  };

  const getSkillName = (skillId: string, category: 'soft' | 'technical' | 'professional'): string => {
    // Ensure we're working with arrays
    let skillArray: Array<{_id: string, name: string, description: string, category: string}> = [];
    
    if (category === 'soft') {
      skillArray = Array.isArray(softSkills) ? softSkills : [];
    } else if (category === 'technical') {
      skillArray = Array.isArray(technicalSkills) ? technicalSkills : [];
    } else {
      skillArray = Array.isArray(professionalSkills) ? professionalSkills : [];
    }
    
    if (!Array.isArray(skillArray) || skillArray.length === 0) {
      // Skills not loaded yet - this is expected during initial render
      // Only log in debug mode to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.debug(`📋 REVIEW SUGGESTIONS - ${category} skills array not loaded yet (this is normal during initial render)`);
      }
      return skillId;
    }
    
    const skill = skillArray.find(s => s._id === skillId);
    return skill ? skill.name : skillId;
  };

  // Ensure first job title is selected on mount
  useEffect(() => {
    if (suggestions && suggestions.jobTitles && suggestions.jobTitles.length > 0 && !selectedJobTitle) {
      const firstTitle = suggestions.jobTitles[0];
      setSelectedJobTitle(firstTitle);
      setSuggestions({
        ...suggestions,
        selectedJobTitle: firstTitle
      });
      console.log("📋 REVIEW SUGGESTIONS - Auto-selected first job title:", firstTitle);
    }
  }, [suggestions, selectedJobTitle]);

  const handleJobTitleSelect = (title: string) => {
    setSelectedJobTitle(title);
    if (suggestions) {
      setSuggestions({
        ...suggestions,
        selectedJobTitle: title
      });
      console.log("📋 REVIEW SUGGESTIONS - Selected job title:", title);
    }
  };

  // Job Titles handlers
  const handleAddJobTitle = () => {
    if (!newJobTitle.trim() || !suggestions) return;
    const updatedTitles = [...(suggestions.jobTitles || []), newJobTitle.trim()];
    setSuggestions({
      ...suggestions,
      jobTitles: updatedTitles
    });
    setNewJobTitle('');
    setShowAddJobTitle(false);
    console.log("📋 REVIEW SUGGESTIONS - Added job title:", newJobTitle.trim());
  };

  const handleEditJobTitle = (index: number) => {
    setEditingJobTitleIndex(index);
    setNewJobTitle(suggestions?.jobTitles?.[index] || '');
  };

  const handleSaveJobTitle = (index: number) => {
    if (!newJobTitle.trim() || !suggestions) return;
    const updatedTitles = [...(suggestions.jobTitles || [])];
    updatedTitles[index] = newJobTitle.trim();
    const newSelected = selectedJobTitle === suggestions.jobTitles?.[index] ? newJobTitle.trim() : (selectedJobTitle || undefined);
    setSuggestions({
      ...suggestions,
      jobTitles: updatedTitles,
      selectedJobTitle: newSelected
    });
    if (newSelected) {
      setSelectedJobTitle(newSelected);
    }
    setEditingJobTitleIndex(null);
    setNewJobTitle('');
    console.log("📋 REVIEW SUGGESTIONS - Saved job title:", newJobTitle.trim());
  };

  const handleDeleteJobTitle = (index: number) => {
    if (!suggestions) return;
    const updatedTitles = [...(suggestions.jobTitles || [])];
    const deletedTitle = updatedTitles[index];
    updatedTitles.splice(index, 1);
    
    // If deleted title was selected, select first remaining title
    let newSelected: string | null = selectedJobTitle;
    if (selectedJobTitle === deletedTitle && updatedTitles.length > 0) {
      newSelected = updatedTitles[0];
      setSelectedJobTitle(newSelected);
    } else if (updatedTitles.length === 0) {
      newSelected = null;
      setSelectedJobTitle(null);
    }
    
    setSuggestions({
      ...suggestions,
      jobTitles: updatedTitles,
      selectedJobTitle: newSelected || undefined
    });
    console.log("📋 REVIEW SUGGESTIONS - Deleted job title:", deletedTitle);
  };

  // Highlights handlers
  const handleAddHighlight = () => {
    if (!newHighlight.trim() || !suggestions) return;
    const updatedHighlights = [...(suggestions.highlights || []), newHighlight.trim()];
    setSuggestions({
      ...suggestions,
      highlights: updatedHighlights
    });
    setNewHighlight('');
    setShowAddHighlight(false);
    console.log("📋 REVIEW SUGGESTIONS - Added highlight:", newHighlight.trim());
  };

  const handleEditHighlight = (index: number) => {
    setEditingHighlightIndex(index);
    setNewHighlight(suggestions?.highlights?.[index] || '');
  };

  const handleSaveHighlight = (index: number) => {
    if (!newHighlight.trim() || !suggestions) return;
    const updatedHighlights = [...(suggestions.highlights || [])];
    updatedHighlights[index] = newHighlight.trim();
    setSuggestions({
      ...suggestions,
      highlights: updatedHighlights
    });
    setEditingHighlightIndex(null);
    setNewHighlight('');
    console.log("📋 REVIEW SUGGESTIONS - Saved highlight:", newHighlight.trim());
  };

  const handleDeleteHighlight = (index: number) => {
    if (!suggestions) return;
    const updatedHighlights = [...(suggestions.highlights || [])];
    updatedHighlights.splice(index, 1);
    setSuggestions({
      ...suggestions,
      highlights: updatedHighlights
    });
    console.log("📋 REVIEW SUGGESTIONS - Deleted highlight at index:", index);
  };

  // Deliverables handlers
  const handleAddDeliverable = () => {
    if (!newDeliverable.trim() || !suggestions) return;
    const updatedDeliverables = [...(suggestions.deliverables || []), newDeliverable.trim()];
    setSuggestions({
      ...suggestions,
      deliverables: updatedDeliverables
    });
    setNewDeliverable('');
    setShowAddDeliverable(false);
    console.log("📋 REVIEW SUGGESTIONS - Added deliverable:", newDeliverable.trim());
  };

  const handleEditDeliverable = (index: number) => {
    setEditingDeliverableIndex(index);
    setNewDeliverable(suggestions?.deliverables?.[index] || '');
  };

  const handleSaveDeliverable = (index: number) => {
    if (!newDeliverable.trim() || !suggestions) return;
    const updatedDeliverables = [...(suggestions.deliverables || [])];
    updatedDeliverables[index] = newDeliverable.trim();
    setSuggestions({
      ...suggestions,
      deliverables: updatedDeliverables
    });
    setEditingDeliverableIndex(null);
    setNewDeliverable('');
    console.log("📋 REVIEW SUGGESTIONS - Saved deliverable:", newDeliverable.trim());
  };

  const handleDeleteDeliverable = (index: number) => {
    if (!suggestions) return;
    const updatedDeliverables = [...(suggestions.deliverables || [])];
    updatedDeliverables.splice(index, 1);
    setSuggestions({
      ...suggestions,
      deliverables: updatedDeliverables
    });
    console.log("📋 REVIEW SUGGESTIONS - Deleted deliverable at index:", index);
  };

  // Description handler
  const handleSaveDescription = () => {
    if (!suggestions) return;
    setSuggestions({
      ...suggestions,
      description: newDescription.trim() || suggestions.description
    });
    setEditingDescription(false);
    setNewDescription('');
    console.log("📋 REVIEW SUGGESTIONS - Saved description");
  };

  // Sector handler - Add to array instead of replace
  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sector = e.target.value;
    if (sector && sector.trim() && suggestions) {
      // Convert category to sectors array if needed
      const currentSectors = suggestions.sectors || [];
      // If category exists and not in sectors array, add it
      if (suggestions.category && !currentSectors.includes(suggestions.category)) {
        currentSectors.push(suggestions.category);
      }
      // Add new sector if not already in array
      if (!currentSectors.includes(sector)) {
        setSuggestions({
          ...suggestions,
          sectors: [...currentSectors, sector],
          category: sector.trim() // Keep category for backward compatibility
        });
        setSelectedSector('');
        console.log("📋 REVIEW SUGGESTIONS - Added sector:", sector);
      }
    }
  };

  // Industry handler
  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const industryId = e.target.value;
    if (industryId && suggestions) {
      const currentIndustries = suggestions.industries || [];
      if (!currentIndustries.includes(industryId)) {
        setSuggestions({
          ...suggestions,
          industries: [...currentIndustries, industryId]
        });
        setSelectedIndustry('');
        console.log("📋 REVIEW SUGGESTIONS - Added industry:", industryId);
      }
    }
  };

  // Activity handler
  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const activityId = e.target.value;
    if (activityId && suggestions) {
      const currentActivities = suggestions.activities || [];
      if (!currentActivities.includes(activityId)) {
        setSuggestions({
          ...suggestions,
          activities: [...currentActivities, activityId]
        });
        setSelectedActivity('');
        console.log("📋 REVIEW SUGGESTIONS - Added activity:", activityId);
      }
    }
  };

  // Remove handlers
  const handleRemoveSector = (sector?: string) => {
    if (suggestions) {
      if (sector) {
        // Remove specific sector from array
        const currentSectors = suggestions.sectors || [];
        const updatedSectors = currentSectors.filter(s => s !== sector);
        const updatedCategory = updatedSectors.length > 0 ? updatedSectors[0] : '';
        setSuggestions({
          ...suggestions,
          sectors: updatedSectors,
          category: updatedCategory
        });
        console.log("📋 REVIEW SUGGESTIONS - Removed sector:", sector);
      } else {
        // Remove all sectors (backward compatibility)
        setSuggestions({
          ...suggestions,
          category: '',
          sectors: []
        });
        console.log("📋 REVIEW SUGGESTIONS - Removed all sectors");
      }
    }
  };

  const handleRemoveIndustry = (industryId: string) => {
    if (suggestions) {
      const currentIndustries = suggestions.industries || [];
      setSuggestions({
        ...suggestions,
        industries: currentIndustries.filter(id => id !== industryId)
      });
      console.log("📋 REVIEW SUGGESTIONS - Removed industry:", industryId);
    }
  };

  const handleRemoveActivity = (activityId: string) => {
    if (suggestions) {
      const currentActivities = suggestions.activities || [];
      setSuggestions({
        ...suggestions,
        activities: currentActivities.filter(id => id !== activityId)
      });
      console.log("📋 REVIEW SUGGESTIONS - Removed activity:", activityId);
    }
  };

  // Destination Zone handler
  const handleDestinationZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = e.target.value;
    if (countryId && suggestions) {
      const currentZones = suggestions.destinationZones || [];
      if (!currentZones.includes(countryId)) {
        setSuggestions({
          ...suggestions,
          destinationZones: [...currentZones, countryId]
        });
        setSelectedDestinationZone('');
        console.log("📋 REVIEW SUGGESTIONS - Added destination zone:", countryId);
      }
    }
  };

  const handleRemoveDestinationZone = (zoneId: string) => {
    if (suggestions) {
      const currentZones = suggestions.destinationZones || [];
      setSuggestions({
        ...suggestions,
        destinationZones: currentZones.filter(id => id !== zoneId)
      });
      console.log("📋 REVIEW SUGGESTIONS - Removed destination zone:", zoneId);
    }
  };

  // Seniority handlers
  const handleSeniorityLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value;
    if (level && suggestions) {
      setSuggestions({
        ...suggestions,
        seniority: {
          ...suggestions.seniority,
          level: level
        }
      });
      setSelectedSeniorityLevel('');
      console.log("📋 REVIEW SUGGESTIONS - Updated seniority level:", level);
    }
  };

  const handleYearsExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const years = parseInt(e.target.value) || 0;
    if (suggestions) {
      setSuggestions({
        ...suggestions,
        seniority: {
          ...suggestions.seniority,
          yearsExperience: years
        }
      });
      console.log("📋 REVIEW SUGGESTIONS - Updated years of experience:", years);
    }
  };

  // Timezone handler
  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timezoneId = e.target.value;
    if (timezoneId && suggestions) {
      const availability = suggestions.availability || {};
      const schedule = suggestions.schedule || {};
      setSuggestions({
        ...suggestions,
        availability: {
          ...availability,
          time_zone: timezoneId,
          timeZones: [timezoneId]
        },
        schedule: {
          ...schedule,
          time_zone: timezoneId,
          timeZones: [timezoneId]
        }
      });
      setSelectedTimezone('');
      setTimezoneSearch('');
      console.log("📋 REVIEW SUGGESTIONS - Updated timezone:", timezoneId);
    }
  };

  // Flexibility handler
  const handleFlexibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const flexibility = e.target.value;
    if (flexibility && suggestions) {
      const availability = suggestions.availability || {};
      const schedule = suggestions.schedule || {};
      const currentFlexibility = availability.flexibility || schedule.flexibility || [];
      if (!currentFlexibility.includes(flexibility)) {
        setSuggestions({
          ...suggestions,
          availability: {
            ...availability,
            flexibility: [...currentFlexibility, flexibility]
          },
          schedule: {
            ...schedule,
            flexibility: [...currentFlexibility, flexibility]
          }
        });
        setSelectedFlexibility('');
        console.log("📋 REVIEW SUGGESTIONS - Added flexibility:", flexibility);
      }
    }
  };

  const handleRemoveFlexibility = (flexibility: string) => {
    if (suggestions) {
      const availability = suggestions.availability || {};
      const schedule = suggestions.schedule || {};
      const currentFlexibility = availability.flexibility || schedule.flexibility || [];
      const updatedFlexibility = currentFlexibility.filter(f => f !== flexibility);
      setSuggestions({
        ...suggestions,
        availability: {
          ...availability,
          flexibility: updatedFlexibility
        },
        schedule: {
          ...schedule,
          flexibility: updatedFlexibility
        }
      });
      console.log("📋 REVIEW SUGGESTIONS - Removed flexibility:", flexibility);
    }
  };

  // Minimum Hours handlers
  const handleMinimumHoursChange = (type: 'daily' | 'weekly' | 'monthly', value: number) => {
    if (suggestions) {
      const availability = suggestions.availability || {};
      const schedule = suggestions.schedule || {};
      const currentMinimumHours = availability.minimumHours || schedule.minimumHours || { daily: 0, weekly: 0, monthly: 0 };
      setSuggestions({
        ...suggestions,
        availability: {
          ...availability,
          minimumHours: {
            ...currentMinimumHours,
            [type]: value
          }
        },
        schedule: {
          ...schedule,
          minimumHours: {
            ...currentMinimumHours,
            [type]: value
          }
        }
      });
      console.log("📋 REVIEW SUGGESTIONS - Updated minimum hours:", type, value);
    }
  };

  if (!suggestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Generating suggestions...</p>
      </div>
    );
  }

  console.log("📋 REVIEW SUGGESTIONS - Rendering with suggestions:", suggestions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto py-8 px-4 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo className="mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI-Powered Gig Creation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review and refine the AI-generated suggestions for your gig. Customize each section to match your specific requirements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Input
          </button>
          <button
            className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all shadow-sm font-medium"
          >
            Review & Refine Suggestions
          </button>
          <button
            onClick={() => {
              console.log("📋 REVIEW SUGGESTIONS - Confirming suggestions:", suggestions);
              onConfirm(suggestions);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Confirm & Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestions Sections */}
        <div className="space-y-6 pb-4">
          {/* Basic Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Basic Information</h3>
                  <p className="text-blue-100 text-sm">Core details and requirements for your gig</p>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-6">
              {/* Job Titles */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-3 border border-blue-200 shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-lg font-semibold text-gray-900">Available Job Titles</h5>
                    <span className="text-sm text-gray-500">Click to select your main position</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(suggestions.jobTitles || []).map((title, index) => {
                      const isSelected = selectedJobTitle === title || (!selectedJobTitle && index === 0);
                      const isEditing = editingJobTitleIndex === index;
                      
                      return (
                        <div key={index} className="relative group">
                          {isEditing ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-400 rounded-lg">
                              <input
                                type="text"
                                value={newJobTitle}
                                onChange={(e) => setNewJobTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveJobTitle(index);
                                  } else if (e.key === 'Escape') {
                                    setEditingJobTitleIndex(null);
                                    setNewJobTitle('');
                                  }
                                }}
                                className="flex-1 outline-none text-gray-900"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveJobTitle(index)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingJobTitleIndex(null);
                                  setNewJobTitle('');
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleJobTitleSelect(title)}
                                className={`group relative inline-flex items-center px-4 py-3 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 shadow-lg transform scale-105'
                                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200 hover:border-blue-300 hover:shadow-md hover:scale-102'
                                }`}
                              >
                                {isSelected && <CheckCircle className="w-5 h-5 mr-2" />}
                                {title}
                              </button>
                              <button
                                onClick={() => handleEditJobTitle(index)}
                                className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                                  isSelected ? 'text-white hover:bg-white/20' : 'text-blue-600 hover:bg-blue-100'
                                }`}
                                title="Click to edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              {(suggestions.jobTitles?.length || 0) > 1 && (
                                <button
                                  onClick={() => handleDeleteJobTitle(index)}
                                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                                    isSelected ? 'text-white hover:bg-white/20' : 'text-red-600 hover:bg-red-100'
                                  }`}
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {showAddJobTitle ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-400 rounded-lg">
                        <input
                          type="text"
                          value={newJobTitle}
                          onChange={(e) => setNewJobTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddJobTitle();
                            } else if (e.key === 'Escape') {
                              setShowAddJobTitle(false);
                              setNewJobTitle('');
                            }
                          }}
                          placeholder="Enter job title..."
                          className="flex-1 outline-none text-gray-900"
                          autoFocus
                        />
                        <button
                          onClick={handleAddJobTitle}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShowAddJobTitle(false);
                            setNewJobTitle('');
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddJobTitle(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-lg p-3 border border-green-200 shadow-md">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-gray-900">Key Highlights</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(suggestions.highlights || []).map((highlight, index) => {
                      const isEditing = editingHighlightIndex === index;
                      
                      return (
                        <div key={index} className="flex items-center gap-1">
                          {isEditing ? (
                            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                              <input
                                type="text"
                                value={newHighlight}
                                onChange={(e) => setNewHighlight(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveHighlight(index);
                                  } else if (e.key === 'Escape') {
                                    setEditingHighlightIndex(null);
                                    setNewHighlight('');
                                  }
                                }}
                                className="flex-1 outline-none bg-transparent text-green-900 text-sm min-w-[150px]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveHighlight(index)}
                                className="text-green-700 hover:text-green-800"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingHighlightIndex(null);
                                  setNewHighlight('');
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="group relative px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {highlight}
                                <button
                                  onClick={() => handleEditHighlight(index)}
                                  className="ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteHighlight(index)}
                                  className="ml-1 p-1 text-gray-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                    {showAddHighlight ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                        <input
                          type="text"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddHighlight();
                            } else if (e.key === 'Escape') {
                              setShowAddHighlight(false);
                              setNewHighlight('');
                            }
                          }}
                          placeholder="Enter highlight..."
                          className="flex-1 outline-none bg-transparent text-green-900 text-sm min-w-[150px]"
                          autoFocus
                        />
                        <button
                          onClick={handleAddHighlight}
                          className="text-green-700 hover:text-green-800"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setShowAddHighlight(false);
                            setNewHighlight('');
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddHighlight(true)}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-full text-sm hover:bg-gray-200 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Description - Full Width */}
              <div className="bg-white rounded-lg p-4 border border-yellow-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-gray-900">Job Description</h4>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={editingDescription ? newDescription : (suggestions.description || '')}
                      onChange={(e) => {
                        setNewDescription(e.target.value);
                        if (!editingDescription) {
                          setEditingDescription(true);
                        }
                      }}
                      onFocus={() => {
                        if (!editingDescription) {
                          setEditingDescription(true);
                          setNewDescription(suggestions.description || '');
                        }
                      }}
                      onBlur={() => {
                        // Auto-save on blur if content changed
                        if (editingDescription && newDescription !== suggestions.description) {
                          handleSaveDescription();
                        }
                      }}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 cursor-text"
                      rows={6}
                      placeholder="Enter job description..."
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {(editingDescription ? newDescription : (suggestions.description || '')).length} characters
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 text-right">
                      Detailed description helps attract the right candidates
                    </p>
                  </div>
                </div>
              </div>

              {/* Sectors (formerly Category) */}
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-lg p-4 border border-purple-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-gray-900">Sectors</h4>
                  </div>
                  <div className="space-y-3">
                    <select
                      value={selectedSector}
                      onChange={handleSectorChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23333'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">Select a sector...</option>
                      {predefinedOptions.sectors
                        .filter((sector) => {
                          const currentSectors = suggestions.sectors || [];
                          const categorySector = suggestions.category;
                          return !currentSectors.includes(sector) && sector !== categorySector;
                        })
                        .map((sector) => (
                          <option key={sector} value={sector}>
                            {sector}
                          </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {(suggestions.sectors || (suggestions.category ? [suggestions.category] : [])).map((sector, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium inline-flex items-center gap-2"
                        >
                          {sector}
                          <button
                            onClick={() => handleRemoveSector(sector)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Remove sector"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Industries Section (formerly Sectors) */}
          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-lg p-4 border border-pink-200 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">Industries</h4>
              </div>
              <div className="space-y-3">
                <select
                  value={selectedIndustry}
                  onChange={handleIndustryChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23333'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Select an industry...</option>
                  {industries
                    .filter((industry) => !(suggestions.industries || []).includes(industry.value))
                    .map((industry) => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  {(suggestions.industries || []).map((industryId, index) => {
                    const industryName = getIndustryNameById(industryId) || industryId;
                    return (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                      >
                        {industryName}
                        <button
                          onClick={() => handleRemoveIndustry(industryId)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Remove industry"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Activities Section */}
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-lg p-4 border border-blue-200 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">Activities</h4>
              </div>
              <div className="space-y-3">
                <select
                  value={selectedActivity}
                  onChange={handleActivityChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23333'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Select an activity...</option>
                  {activities
                    .filter((activity) => !(suggestions.activities || []).includes(activity.value))
                    .map((activity) => (
                      <option key={activity.value} value={activity.value}>
                        {activity.label}
                      </option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  {(suggestions.activities || []).map((activityId, index) => {
                    const activityName = getActivityNameById(activityId) || activityId;
                    return (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                      >
                        {activityName}
                        <button
                          onClick={() => handleRemoveActivity(activityId)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Remove activity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Deliverables Section */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-lg p-4 border border-green-200 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">Deliverables</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {(suggestions.deliverables || []).map((deliverable, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium inline-flex items-center gap-2"
                  >
                    {deliverable}
                    <button
                      onClick={() => handleDeleteDeliverable(index)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Remove deliverable"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {showAddDeliverable ? (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                    <input
                      type="text"
                      value={newDeliverable}
                      onChange={(e) => setNewDeliverable(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddDeliverable();
                        } else if (e.key === 'Escape') {
                          setShowAddDeliverable(false);
                          setNewDeliverable('');
                        }
                      }}
                      placeholder="Enter deliverable..."
                      className="flex-1 outline-none bg-transparent text-green-900 text-sm min-w-[200px]"
                      autoFocus
                    />
                    <button
                      onClick={handleAddDeliverable}
                      className="text-green-700 hover:text-green-800"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddDeliverable(false);
                        setNewDeliverable('');
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddDeliverable(true)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-full text-sm hover:bg-gray-200 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Destination Zones Section */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">Destination Zones</h4>
              </div>
              <div className="space-y-3">
                <select
                  value={selectedDestinationZone}
                  onChange={handleDestinationZoneChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23333'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Add destination zone...</option>
                  {countries
                    .filter((country) => !(suggestions.destinationZones || []).includes(country._id))
                    .map((country) => (
                      <option key={country._id} value={country._id}>
                        {country.name.common}
                      </option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  {(suggestions.destinationZones || []).map((zoneId, index) => {
                    const zoneName = getCountryName(zoneId);
                    return (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                      >
                        {zoneName}
                        <button
                          onClick={() => handleRemoveDestinationZone(zoneId)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Remove destination zone"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 italic text-center">
                  {countries.length} countries available for selection
                </p>
              </div>
            </div>
          </div>

          {/* Seniority Level Section */}
          <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-lg p-4 border border-orange-200 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">Seniority Level</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={suggestions.seniority?.level || selectedSeniorityLevel}
                    onChange={handleSeniorityLevelChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23333'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select level...</option>
                    {predefinedOptions.basic.seniorityLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    value={suggestions.seniority?.yearsExperience || 0}
                    onChange={handleYearsExperienceChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Availability Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header with purple gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Schedule & Availability</h2>
                  <p className="text-purple-100 text-sm">Working hours, timezones, and flexibility options</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Working Days & Hours Section */}
              {(
                (suggestions.schedule?.schedules && suggestions.schedule.schedules.length > 0) ||
                (suggestions.availability?.schedule && suggestions.availability.schedule.length > 0) ||
                true // Always show this section
              ) && (
                <>
                  {/* Working Days */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="w-5 h-5 text-gray-700" />
                        <h4 className="text-lg font-semibold text-gray-900">Working Days</h4>
                      </div>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete schedule group"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const scheduleData = suggestions.schedule?.schedules || suggestions.availability?.schedule || [];
                        const isSelected = scheduleData.some((s: any) => 
                          (s.day === day) || (s.days && Array.isArray(s.days) && s.days.includes(day))
                        );
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              // Toggle day selection
                              const scheduleData = suggestions.schedule?.schedules || suggestions.availability?.schedule || [];
                              const availability = suggestions.availability || {};
                              const schedule = suggestions.schedule || {};
                              
                              if (isSelected) {
                                // Remove day
                                const updatedSchedules = scheduleData.filter((s: any) => 
                                  s.day !== day && (!s.days || !s.days.includes(day))
                                ).map((s: any) => {
                                  // Convert to availability format if needed
                                  if (s.days && Array.isArray(s.days)) {
                                    return {
                                      days: s.days.filter((d: string) => d !== day),
                                      hours: s.hours
                                    };
                                  }
                                  return s;
                                });
                                setSuggestions({
                                  ...suggestions,
                                  schedule: {
                                    ...schedule,
                                    schedules: updatedSchedules.map((s: any) => ({
                                      day: s.day || (s.days && s.days[0]) || '',
                                      hours: s.hours
                                    })) as any
                                  },
                                  availability: {
                                    ...availability,
                                    schedule: updatedSchedules.map((s: any) => ({
                                      days: s.days || (s.day ? [s.day] : []),
                                      hours: s.hours
                                    })) as any
                                  }
                                } as any);
                              } else {
                                // Add day
                                const newScheduleForSchedule = {
                                  day: day,
                                  hours: {
                                    start: startTime,
                                    end: endTime
                                  }
                                };
                                const newScheduleForAvailability = {
                                  days: [day],
                                  hours: {
                                    start: startTime,
                                    end: endTime
                                  }
                                };
                                setSuggestions({
                                  ...suggestions,
                                  schedule: {
                                    ...schedule,
                                    schedules: [...(schedule.schedules || []), newScheduleForSchedule] as any
                                  },
                                  availability: {
                                    ...availability,
                                    schedule: [...(availability.schedule || []), newScheduleForAvailability] as any
                                  }
                                } as any);
                              }
                            }}
                            className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Working Hours</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => {
                              setStartTime(e.target.value);
                              // Update all schedules with new start time
                              const scheduleData = suggestions.schedule?.schedules || suggestions.availability?.schedule || [];
                              const updatedSchedules = scheduleData.map((s: any) => ({
                                ...s,
                                hours: { ...s.hours, start: e.target.value }
                              }));
                              setSuggestions({
                                ...suggestions,
                                schedule: {
                                  ...suggestions.schedule,
                                  schedules: updatedSchedules
                                },
                                availability: {
                                  ...suggestions.availability,
                                  schedule: updatedSchedules
                                }
                              });
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          />
                          <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => {
                              setEndTime(e.target.value);
                              // Update all schedules with new end time
                              const scheduleData = suggestions.schedule?.schedules || suggestions.availability?.schedule || [];
                              const updatedSchedules = scheduleData.map((s: any) => ({
                                ...s,
                                hours: { ...s.hours, end: e.target.value }
                              }));
                              setSuggestions({
                                ...suggestions,
                                schedule: {
                                  ...suggestions.schedule,
                                  schedules: updatedSchedules
                                },
                                availability: {
                                  ...suggestions.availability,
                                  schedule: updatedSchedules
                                }
                              });
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          />
                          <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-center mb-4">
                      {startTime.replace(':', 'h')} - {endTime.replace(':', 'h')}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStartTime('09:00');
                          setEndTime('17:00');
                          const scheduleData = suggestions.schedule?.schedules || suggestions.availability?.schedule || [];
                          const updatedSchedules = scheduleData.map((s: any) => ({
                            ...s,
                            hours: { start: '09:00', end: '17:00' }
                          }));
                          setSuggestions({
                            ...suggestions,
                            schedule: {
                              ...suggestions.schedule,
                              schedules: updatedSchedules
                            },
                            availability: {
                              ...suggestions.availability,
                              schedule: updatedSchedules
                            }
                          });
                        }}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                          startTime === '09:00' && endTime === '17:00'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Sun className="w-5 h-5" />
                          <span className="text-sm font-medium">9-5</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStartTime('06:00');
                          setEndTime('14:00');
                          const scheduleData = suggestions.schedule?.schedules || suggestions.availability?.schedule || [];
                          const updatedSchedules = scheduleData.map((s: any) => ({
                            ...s,
                            hours: { start: '06:00', end: '14:00' }
                          }));
                          setSuggestions({
                            ...suggestions,
                            schedule: {
                              ...suggestions.schedule,
                              schedules: updatedSchedules
                            },
                            availability: {
                              ...suggestions.availability,
                              schedule: updatedSchedules
                            }
                          });
                        }}
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 transition-all"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <ArrowUp className="w-5 h-5" />
                          <span className="text-sm font-medium">Early</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStartTime('14:00');
                          setEndTime('22:00');
                          const scheduleData = suggestions.schedule?.schedules || suggestions.availability?.schedule || [];
                          const updatedSchedules = scheduleData.map((s: any) => ({
                            ...s,
                            hours: { start: '14:00', end: '22:00' }
                          }));
                          setSuggestions({
                            ...suggestions,
                            schedule: {
                              ...suggestions.schedule,
                              schedules: updatedSchedules
                            },
                            availability: {
                              ...suggestions.availability,
                              schedule: updatedSchedules
                            }
                          });
                        }}
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 transition-all"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Clock className="w-5 h-5" />
                          <span className="text-sm font-medium">Late</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStartTime('17:00');
                          setEndTime('01:00');
                          const scheduleData = suggestions.schedule?.schedules || suggestions.availability?.schedule || [];
                          const updatedSchedules = scheduleData.map((s: any) => ({
                            ...s,
                            hours: { start: '17:00', end: '01:00' }
                          }));
                          setSuggestions({
                            ...suggestions,
                            schedule: {
                              ...suggestions.schedule,
                              schedules: updatedSchedules
                            },
                            availability: {
                              ...suggestions.availability,
                              schedule: updatedSchedules
                            }
                          });
                        }}
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 transition-all"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Moon className="w-5 h-5" />
                          <span className="text-sm font-medium">Evening</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Add Schedule Group Button */}
              <button
                type="button"
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Add Schedule Group</div>
                  <div className="text-sm text-purple-100">Create a new time slot</div>
                </div>
              </button>
            </div>
          </div>

          {/* Other Schedule Sections (Minimum Hours, Time Zone, Flexibility) */}
          <div className="space-y-4 mt-4">

            {/* Minimum Hours Requirements */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-lg p-4 border border-green-200 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Minimum Hours Requirements</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Daily Hours</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={suggestions.schedule?.minimumHours?.daily || suggestions.availability?.minimumHours?.daily || 0}
                        onChange={(e) => handleMinimumHoursChange('daily', parseInt(e.target.value) || 0)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        min="0"
                      />
                      <span className="text-sm text-gray-600">hrs</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Hours</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={suggestions.schedule?.minimumHours?.weekly || suggestions.availability?.minimumHours?.weekly || 0}
                        onChange={(e) => handleMinimumHoursChange('weekly', parseInt(e.target.value) || 0)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        min="0"
                      />
                      <span className="text-sm text-gray-600">hrs</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Hours</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={suggestions.schedule?.minimumHours?.monthly || suggestions.availability?.minimumHours?.monthly || 0}
                        onChange={(e) => handleMinimumHoursChange('monthly', parseInt(e.target.value) || 0)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        min="0"
                      />
                      <span className="text-sm text-gray-600">hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Zone */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-lg p-4 border border-purple-200 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe2 className="w-5 h-5 text-purple-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Time Zone</h4>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={timezoneSearch}
                    onChange={(e) => setTimezoneSearch(e.target.value)}
                    placeholder="Search timezones by name, country, or abbreviation..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                  <select
                    value={selectedTimezone}
                    onChange={handleTimezoneChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23333'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select timezone...</option>
                    {timezones
                      .filter((tz) => {
                        if (!timezoneSearch) return true;
                        const search = timezoneSearch.toLowerCase();
                        return tz.zoneName.toLowerCase().includes(search) ||
                               tz.countryName.toLowerCase().includes(search);
                      })
                      .filter((tz) => {
                        const currentTimezone = suggestions.schedule?.time_zone || suggestions.availability?.time_zone;
                        return tz._id !== currentTimezone;
                      })
                      .map((tz) => {
                        const offsetHours = tz.gmtOffset / 3600;
                        const offsetString = offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`;
                        const displayName = `${tz.zoneName} - ${tz.countryName} (GMT${offsetString})`;
                        return (
                          <option key={tz._id} value={tz._id}>
                            {displayName}
                          </option>
                        );
                      })}
                  </select>
                  {(suggestions.schedule?.time_zone || suggestions.availability?.time_zone) && (
                    <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">
                      {getTimezoneName(suggestions.schedule?.time_zone || suggestions.availability?.time_zone || '')}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 italic text-center">
                    {timezones.length} timezones available worldwide
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Flexibility */}
            <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-lg p-4 border border-yellow-200 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Schedule Flexibility</h4>
                </div>
                <div className="space-y-3">
                  <select
                    value={selectedFlexibility}
                    onChange={handleFlexibilityChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23333'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Add flexibility option...</option>
                    {predefinedOptions.schedule.flexibility
                      .filter((flex) => {
                        const currentFlexibility = suggestions.schedule?.flexibility || suggestions.availability?.flexibility || [];
                        return !currentFlexibility.includes(flex);
                      })
                      .map((flex) => (
                        <option key={flex} value={flex}>
                          {flex}
                        </option>
                      ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {(suggestions.schedule?.flexibility || suggestions.availability?.flexibility || []).map((flex, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium inline-flex items-center gap-2"
                      >
                        {flex}
                        <button
                          onClick={() => handleRemoveFlexibility(flex)}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                          title="Remove flexibility"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic text-center">
                    Select all applicable schedule flexibility options
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Structure Section */}
          {suggestions.commission && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Commission Structure</h2>
                    <p className="text-green-100 text-sm">Compensation details and performance incentives</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Currency</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Base currency for payments</p>
                    <div className="text-lg font-semibold text-blue-900">
                      {selectedCurrency ? `${selectedCurrency.symbol} ${selectedCurrency.code}` : (suggestions.commission.currency || "EUR")}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Commission Per Call</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Base amount per successful call</p>
                    <div className="text-lg font-semibold text-green-900">
                      ${suggestions.commission.baseAmount || 0}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Transaction Commission</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Commission per transaction</p>
                    <div className="text-lg font-semibold text-purple-900">
                      ${suggestions.commission.transactionCommission?.amount || 0}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold text-gray-900">Bonus & Incentives</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Performance bonus amount</p>
                    <div className="text-lg font-semibold text-orange-900">
                      ${suggestions.commission.bonusAmount || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills & Qualifications Section */}
          {suggestions.skills && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Skills & Qualifications</h2>
                    <p className="text-purple-100 text-sm">Required technical, professional, and soft skills</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Languages */}
                {suggestions.skills.languages && suggestions.skills.languages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Globe2 className="w-5 h-5 text-blue-600" />
                        Languages
                      </h4>
                      <span className="text-sm text-gray-500">{languages.length} available</span>
                    </div>
                    <div className="space-y-2">
                      {suggestions.skills.languages.map((lang, index) => {
                        const languageName = getLanguageNameById(lang.language) || lang.language;
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <span className="text-gray-900 font-medium">{languageName}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 transition-all"
                                  style={{ width: `${((['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(lang.proficiency) + 1) / 6) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 font-medium">{lang.proficiency}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Professional Skills */}
                {suggestions.skills.professional && suggestions.skills.professional.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-green-600" />
                        Professional Skills
                      </h4>
                      <span className="text-sm text-gray-500">{Array.isArray(professionalSkills) ? professionalSkills.length : 0} available</span>
                    </div>
                    <div className="space-y-2">
                      {suggestions.skills.professional.map((skill, index) => {
                        const skillId = typeof skill.skill === 'object' && skill.skill?.$oid 
                          ? skill.skill.$oid 
                          : (typeof skill.skill === 'string' ? skill.skill : String(skill.skill));
                        const skillName = getSkillName(skillId, 'professional');
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <span className="text-gray-900 font-medium">{skillName}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-600 transition-all"
                                  style={{ width: `${(skill.level / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 font-medium">
                                {['Basic', 'Intermediate', 'Advanced', 'Expert', 'Master'][skill.level - 1] || 'Basic'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Technical Skills */}
                {suggestions.skills.technical && suggestions.skills.technical.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Code className="w-5 h-5 text-purple-600" />
                        Technical Skills
                      </h4>
                      <span className="text-sm text-gray-500">{Array.isArray(technicalSkills) ? technicalSkills.length : 0} available</span>
                    </div>
                    <div className="space-y-2">
                      {suggestions.skills.technical.map((skill, index) => {
                        const skillId = typeof skill.skill === 'object' && skill.skill?.$oid 
                          ? skill.skill.$oid 
                          : (typeof skill.skill === 'string' ? skill.skill : String(skill.skill));
                        const skillName = getSkillName(skillId, 'technical');
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <span className="text-gray-900 font-medium">{skillName}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-600 transition-all"
                                  style={{ width: `${(skill.level / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 font-medium">
                                {['Basic', 'Intermediate', 'Advanced', 'Expert', 'Master'][skill.level - 1] || 'Basic'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {suggestions.skills.soft && suggestions.skills.soft.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        Soft Skills
                      </h4>
                      <span className="text-sm text-gray-500">{Array.isArray(softSkills) ? softSkills.length : 0} available</span>
                    </div>
                    <div className="space-y-2">
                      {suggestions.skills.soft.map((skill, index) => {
                        let skillId: string;
                        if (typeof skill.skill === 'object' && skill.skill?.$oid) {
                          skillId = skill.skill.$oid;
                        } else if (typeof skill.skill === 'string') {
                          skillId = skill.skill;
                        } else {
                          skillId = String(skill.skill);
                        }
                        const skillName = getSkillName(skillId, 'soft');
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <span className="text-gray-900 font-medium">{skillName}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-orange-600 transition-all"
                                  style={{ width: `${(skill.level / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 font-medium">
                                {['Basic', 'Intermediate', 'Advanced', 'Expert', 'Master'][skill.level - 1] || 'Basic'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Structure Section */}
          {suggestions.team && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Team Structure</h2>
                    <p className="text-blue-100 text-sm">Team composition, roles, and territories</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Team Roles */}
                {suggestions.team.structure && suggestions.team.structure.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">Team Roles</h4>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Total: {suggestions.team.structure.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {suggestions.team.structure.map((role, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-gray-900">Role #{index + 1}</h5>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Role Type</label>
                              <div className="p-2 bg-white border border-gray-300 rounded-lg">
                                <span className="text-gray-900">{role.roleId || "Not specified"}</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Members</label>
                              <div className="p-2 bg-white border border-gray-300 rounded-lg">
                                <span className="text-gray-900">{role.count || 0}</span>
                              </div>
                            </div>
                            {role.seniority && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
                                  <div className="p-2 bg-white border border-gray-300 rounded-lg">
                                    <span className="text-gray-900">{role.seniority.level || "Not specified"}</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
                                  <div className="p-2 bg-white border border-gray-300 rounded-lg">
                                    <span className="text-gray-900">{role.seniority.yearsExperience || 0}</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Territories */}
                {suggestions.team.territories && suggestions.team.territories.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Territories</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.team.territories.map((territoryId, index) => {
                        const territoryName = getCountryName(territoryId);
                        return (
                          <span
                            key={index}
                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3" />
                            {territoryName}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {countries.length} countries available for selection
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
          <div className="max-w-6xl mx-auto flex justify-end gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Input
            </button>
            <button
              onClick={() => {
                console.log("📋 REVIEW SUGGESTIONS - Final confirmation with suggestions:", suggestions);
                onConfirm(suggestions);
              }}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
            >
              Confirm & Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
