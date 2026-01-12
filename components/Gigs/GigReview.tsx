"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import Cookies from "js-cookie";
import {
  CheckCircle,
  DollarSign,
  Users,
  Brain,
  FileText,
  Star,
  Clock,
  Calendar,
  Briefcase,
  Award,
  Laptop,
  Coins,
  Edit3,
  Heart,
  MapPin,
  Building,
  Target,
  Zap,
  Languages,
  CheckSquare,
} from "lucide-react";
import { GigData } from "../../types/gigs";
import { predefinedOptions } from "../../lib/gigs/guidance";
import { validateGigData } from "../../lib/gigs/validation";
import { groupSchedules } from "../../lib/gigs/scheduleUtils";
import { fetchAllTimezones, fetchCompanyById, getCountryNameById, fetchAllCurrencies, fetchCurrencyById, Currency } from '../../lib/gigs/api';
// import { GigStatusBadge } from './GigStatusBadge';
import { 
  getIndustryNameById,
  loadLanguages,
  getLanguageNameById
} from '../../lib/gigs/activitiesIndustries';
import { skills, companies } from '../../lib/api';

interface GigReviewProps {
  data: GigData;
  onEdit: (section: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  onBack: () => void;
  skipValidation?: boolean;
  isEditMode?: boolean;
  editGigId?: string | null;
}

export function GigReview({
  data,
  onEdit,
  onSubmit,
  isSubmitting,
  onBack,
  skipValidation = false,
  isEditMode = false,
  editGigId = null,
}: GigReviewProps) {
  const validation = skipValidation ? { isValid: true, errors: {}, warnings: {} } : validateGigData(data);

  // State for skills data
  const [softSkills, setSoftSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [professionalSkills, setProfessionalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [technicalSkills, setTechnicalSkills] = useState<Array<{_id: string, name: string, description: string, category: string}>>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  // State for timezones and companies
  const [timezoneMap, setTimezoneMap] = useState<{ [key: string]: string }>({});
  const [companyMap, setCompanyMap] = useState<{ [key: string]: string }>({});
  const [countryName, setCountryName] = useState<string>('');
  
  // State for currencies
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  // Load skills and languages from API
  useEffect(() => {
    const fetchSkillsAndLanguages = async () => {
      try {
        setSkillsLoading(true);
        setLanguagesLoading(true);
        
        // Fetch all skills categories using centralized API service
        const [softResponse, professionalResponse, technicalResponse] = await Promise.all([
          skills.getByCategory('soft'),
          skills.getByCategory('professional'),
          skills.getByCategory('technical')
        ]);

        if (softResponse.success) {
          setSoftSkills(softResponse.data || []);
        }

        if (professionalResponse.success) {
          setProfessionalSkills(professionalResponse.data || []);
        }

        if (technicalResponse.success) {
          setTechnicalSkills(technicalResponse.data || []);
        }

        // Load languages using the utility function
        await loadLanguages();
      } catch (error) {
        console.error('Error fetching skills and languages:', error);
      } finally {
        setSkillsLoading(false);
        setLanguagesLoading(false);
      }
    };

    fetchSkillsAndLanguages();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all timezones and companies on mount
  useEffect(() => {
    const fetchMeta = async () => {
      // Fetch timezones
      try {
        const tzRes = await fetchAllTimezones();
        if (Array.isArray(tzRes)) {
          const tzMap: { [key: string]: string } = {};
          tzRes.forEach((tz: any) => {
            tzMap[tz._id] = tz.name || tz.label || tz.tz || tz._id;
          });
          setTimezoneMap(tzMap);
        }
      } catch (e) { /* ignore */ }
      // Fetch company by ID if we have a companyId
      if (data.companyId) {
        try {
          const company = await fetchCompanyById(data.companyId);
          
          if (company) {
            const cMap: { [key: string]: string } = {};
            cMap[company._id] = company.name || company._id;
            setCompanyMap(cMap);
        } else {
          }
        } catch (e) { 
        }
      }
      
      // Fetch country name if we have a destination_zone
      if (data.destination_zone) {
        try {
          const countryNameFromApi = await getCountryNameById(data.destination_zone);
          setCountryName(countryNameFromApi);
        } catch (e) { 
          console.error('❌ GigReview: Error fetching country name:', e);
          setCountryName(data.destination_zone); // Fallback to zone ID
        }
      }
    };
    fetchMeta();
  }, []);

  // Helper to get time zone name
  const getTimeZoneName = (zone: string) => {
    return timezoneMap[zone] || zone;
  };
  // Helper to get company name
  const getCompanyName = (id: string) => {
  
    const companyName = companyMap[id] || id;
    return companyName;
  };
  // Helper to get skill name by id
  const getSkillName = (skill: any, category: 'soft' | 'professional' | 'technical') => {
    // Handle both string and { $oid: string } formats
    let skillId: string;
    if (typeof skill === 'string') {
      skillId = skill;
    } else if (skill && typeof skill === 'object' && skill.$oid) {
      skillId = skill.$oid;
    } else {
      return 'Unknown Skill';
    }

    let arr: any[] = [];
    if (category === 'soft') arr = softSkills;
    if (category === 'professional') arr = professionalSkills;
    if (category === 'technical') arr = technicalSkills;
    const found = arr.find((s) => s._id === skillId);
    return found ? found.name : skillId;
  };

  // Helper to get language name by id
  const getLanguageName = (language: any) => {
    if (languagesLoading) {
      return 'Loading...';
    }
    
    // Handle both string and { $oid: string } formats
    let languageId: string;
    if (typeof language === 'string') {
      languageId = language;
    } else if (language && typeof language === 'object' && language.$oid) {
      languageId = language.$oid;
    } else {
      return '';
    }
    
    const languageName = getLanguageNameById(languageId);
    return languageName || languageId;
  };

  // Load currencies on component mount
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const fetchedCurrencies = await fetchAllCurrencies();
        setCurrencies(fetchedCurrencies);
      } catch (error) {
        console.error('Error loading currencies:', error);
      }
    };
    
    loadCurrencies();
  }, []);

  // Load selected currency when currency ID changes
  useEffect(() => {
    const loadSelectedCurrency = async () => {
      if (data?.commission?.currency && currencies.length > 0) {
        // First try to find in loaded currencies
        const foundCurrency = currencies.find(c => c._id === data.commission.currency);
        if (foundCurrency) {
          setSelectedCurrency(foundCurrency);
        } else {
          // If not found, fetch by ID
          try {
            const fetchedCurrency = await fetchCurrencyById(data.commission.currency);
            if (fetchedCurrency) {
              setSelectedCurrency(fetchedCurrency);
            }
          } catch (error) {
            console.error('Error fetching selected currency:', error);
          }
        }
      } else {
        setSelectedCurrency(null);
      }
    };

    loadSelectedCurrency();
  }, [data?.commission?.currency, currencies]);

  const getCurrencySymbol = () => {
    return selectedCurrency?.symbol || "€";
  };

  const getCurrencyCode = () => {
    return selectedCurrency?.code || data.commission?.currency || "";
  };

  const handlePublish = async () => {
    try {
      // Afficher d'abord une modal de confirmation
      const confirmResult = await Swal.fire({
        title: isEditMode ? "Update Gig?" : "Publish Gig?",
        text: isEditMode 
          ? "Are you sure you want to update this gig? The changes will be saved immediately."
          : "Are you sure you want to publish this gig? It will be saved and made available immediately.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Publish",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#667eea",
        cancelButtonColor: "#6b7280",
      });
      
      // Si l'utilisateur clique sur Cancel, ne rien faire
      if (!confirmResult.isConfirmed) {
        return;
      }
      
      // Si l'utilisateur clique sur OK, sauvegarder le gig
      // Let onSubmit handle the saving (it already calls saveGigData)
      await onSubmit();
      
      // Marquer le step "Create Gigs" comme complété AVANT d'afficher le message de succès
      if (!isEditMode) {
        try {
          const companyId = Cookies.get('companyId');
          if (companyId) {
            console.log('🔄 Updating onboarding step 4 to completed...');
            // Utiliser le service centralisé pour mettre à jour l'onboarding
            const stepResponse = await companies.updateOnboardingStepQuery(companyId, 2, 4, 'completed');
            if (stepResponse.success) {
              console.log('✅ Step 4 "Create Gigs" marked as completed:', stepResponse.data);
              
              // Notifier le composant parent
              window.dispatchEvent(new CustomEvent('stepCompleted', {
                detail: {
                  stepId: 4,
                  phaseId: 2,
                  status: 'completed',
                  completedSteps: [4]
                }
              }));
            } else {
              console.error('❌ Failed to update step progress:', stepResponse.error);
            }
          }
        } catch (error) {
          console.error('❌ Error updating step progress:', error);
          // Continue même si la mise à jour de l'onboarding échoue
        }
      }
      
      // Afficher la modal de succès
      const result = await Swal.fire({
        title: "Success!",
        text: isEditMode ? "Your gig has been updated successfully." : "Your gig has been published successfully.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#667eea",
      });
      
      // Rediriger après avoir cliqué sur OK
      if (result.isConfirmed) {
        // Rediriger vers le dashboard en mode édition
        if (isEditMode && editGigId) {
          // Redirection vers la page de détails du gig
          const gigUrl = `company#/gigs/${editGigId}`;
          console.log('Redirecting to:', gigUrl);
          window.location.href = gigUrl;
        } else {
          // Rediriger vers comporchestrator
          window.location.href = "/comporchestrator";
        }
      }
    } catch (error) {
      console.error('Error publishing gig:', error);
      await Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "An unknown error occurred.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  // Function to get header gradient based on section type
  const getHeaderGradient = (section: string) => {
    switch (section) {
      case 'basic':
        return 'from-blue-500 via-indigo-500 to-violet-500';
      case 'commission':
        return 'from-emerald-500 via-green-500 to-teal-500';
      case 'schedule':
        return 'from-purple-500 via-violet-500 to-indigo-500';
      case 'skills':
        return 'from-orange-500 via-amber-500 to-yellow-500';
      case 'team':
        return 'from-blue-500 via-indigo-500 to-violet-500';
      default:
        return 'from-blue-500 via-indigo-500 to-violet-500';
    }
  };

  const renderEditableSection = (title: string, section: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className={`bg-gradient-to-r ${getHeaderGradient(section)} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mr-3">
          {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-white/80 text-sm">Review and edit section details</p>
            </div>
          </div>
        <button
          onClick={() => onEdit(section)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );


  // Before return, define a variable for readable schedule time zones
  // Define a variable for the readable destination zone name
  const destinationZoneName = countryName || getTimeZoneName(data.destination_zone);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full px-6 py-8 max-w-7xl mx-auto">
        
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review & Publish</h1>
                <p className="text-gray-600">Review all details before publishing your gig</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                ← Previous
              </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {isEditMode ? 'Update Gig' : 'Publish Gig'}
                </>
              )}
            </button>
            </div>
          </div>
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Basic Information */}
            {renderEditableSection(
              "Basic Information",
              "basic",
              <Briefcase className="w-6 h-6 text-white" />,
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {data?.title || 'No title provided'}
                  </h1>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">{data?.description || 'No description provided'}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {data?.category && (
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                        {data.category}
                      </span>
                    )}
                    {data?.seniority?.level && (
                      <span className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 rounded-full text-sm font-semibold border border-violet-200">
                        {data.seniority.level}
                      </span>
                    )}
                    {data?.seniority?.yearsExperience && (
                      <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-200">
                        {data.seniority.yearsExperience} Years Experience
                      </span>
                    )}
                  </div>

                  {/* Industries Section */}
                  {data?.industries && data.industries.length > 0 && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Target className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900">Industries</h3>
                            <p className="text-sm text-blue-700">Relevant industries for this position</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.industries.map((industry, index) => {
                            const industryName = getIndustryNameById(industry);
                            return industryName ? (
                              <span key={index} className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200">
                                {industryName}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data?.destination_zone && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Destination Zone</h3>
                      </div>
                      <p className="text-gray-700 font-medium">{destinationZoneName}</p>
                    </div>
                  )}
                  
                  {data?.companyId && (
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="w-5 h-5 text-violet-600" />
                        <h3 className="font-semibold text-violet-900">Company</h3>
                      </div>
                      <p className="text-gray-700 font-medium">{getCompanyName(data.companyId)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Commission Structure */}
            {data?.commission && renderEditableSection(
              "Commission Structure",
              "commission",
              <DollarSign className="w-6 h-6 text-white" />,
              <div className="space-y-6">
                
                {/* 1. Currency - Full Width at Top */}
                {data.commission.currency && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">Currency</h3>
                        <p className="text-blue-700 text-sm">Commission payment currency</p>
                      </div>
                          </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {getCurrencySymbol()} - {getCurrencyCode() || 'N/A'}
                          </div>
                        </div>
                      )}

                {/* 2. Per Call & Transaction Commission - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Per Call Commission */}
                  {data.commission.base && data.commission.baseAmount && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-emerald-900">Commission Per Call</h3>
                          <p className="text-emerald-700 text-sm">Base commission amount</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-900 mb-2">
                          {getCurrencySymbol()}{data.commission.baseAmount}
                        </div>
                        <p className="text-emerald-700 text-sm">{data.commission.base}</p>
                    </div>
                  </div>
                )}

                {/* Transaction Commission */}
                  {data.commission.transactionCommission?.amount && (
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                          <Coins className="w-6 h-6 text-purple-600" />
                      </div>
                        <div>
                          <h3 className="text-lg font-semibold text-purple-900">Transaction Commission</h3>
                          <p className="text-purple-700 text-sm">Per transaction amount</p>
                      </div>
                    </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-900 mb-2">
                          {getCurrencySymbol()}{data.commission.transactionCommission.amount}
                        </div>
                        <p className="text-purple-700 text-sm">Per Transaction</p>
                    </div>
                  </div>
                )}
                </div>

                {/* 3. Bonus & Minimum Volume - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Bonus */}
                  {data.commission.bonusAmount && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
                          <Star className="w-6 h-6 text-amber-600" />
                      </div>
                        <div>
                          <h3 className="text-lg font-semibold text-amber-900">Bonus & Incentives</h3>
                          <p className="text-amber-700 text-sm">Performance bonus</p>
                      </div>
                    </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-900 mb-2">
                          {getCurrencySymbol()}{data.commission.bonusAmount}
                        </div>
                        {data.commission.bonus && (
                          <p className="text-amber-700 text-sm">{data.commission.bonus}</p>
                        )}
                    </div>
                  </div>
                )}

                  {/* Minimum Volume */}
                  {data.commission.minimumVolume?.amount && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                          <Target className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900">Minimum Volume</h3>
                          <p className="text-orange-700 text-sm">Required minimum</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-900 mb-2">
                          {getCurrencySymbol()}{data.commission.minimumVolume.amount}
                        </div>
                        <p className="text-orange-700 text-sm">
                          per {data.commission.minimumVolume.period || 'month'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Additional Details - Full Width at Bottom */}
                {data?.commission?.additionalDetails && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Additional Details</h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{data?.commission?.additionalDetails}</p>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Schedule */}
            {data?.schedule && renderEditableSection(
              "Schedule & Availability",
              "schedule",
              <Calendar className="w-6 h-6 text-white" />,
              <div className="space-y-6">
                  {data.schedule.schedules && data.schedule.schedules.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-purple-600" />
                          Working Days
                        </h3>
                        <div className="space-y-4">
                          {groupSchedules(data.schedule.schedules).map((group, index) => (
                            <div
                              key={`${group.hours.start}-${group.hours.end}-${index}`}
                          className="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
                            >
                              <div className="flex flex-wrap gap-2 mb-3">
                                {group.days.map((day, dayIndex) => (
                                  <span
                                    key={dayIndex}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold border border-purple-200"
                                  >
                                    {day}
                                  </span>
                                ))}
                              </div>
                          <div className="flex items-center gap-2 text-purple-700 font-semibold">
                                <Clock className="w-4 h-4" />
                                {group.hours.start} - {group.hours.end}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                )}

                {data.schedule.flexibility && data.schedule.flexibility.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                    <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-3">
                      <Clock className="w-6 h-6 text-indigo-600" />
                      Flexibility Options
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {data.schedule.flexibility.map((option) => (
                        <span
                          key={option}
                          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold border border-indigo-200"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Enhanced Skills Summary */}
            {renderEditableSection(
              "Skills & Qualifications",
              "skills",
              <Brain className="w-6 h-6 text-white" />,
              <div className="space-y-6">
                {/* Languages */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                      <Languages className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">Languages</span>
                      </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
                        {data.skills?.languages?.length || 0}
                      </span>
                    </div>
                    {data.skills?.languages && data.skills.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.skills.languages.map((lang, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200">
                            {getLanguageName(lang.language)} ({lang.proficiency})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                {/* Skills by Category */}
                <div className="space-y-4">
                  {/* Technical Skills */}
                  {data.skills?.technical && data.skills.technical.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
                      <div className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Laptop className="w-4 h-4" />
                        Technical Skills
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.technical.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm border border-purple-200">
                            {skillsLoading ? 'Loading...' : getSkillName(s.skill, 'technical')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional Skills */}
                  {data.skills?.professional && data.skills.professional.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Professional Skills
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.professional.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm border border-green-200">
                            {skillsLoading ? 'Loading...' : getSkillName(s.skill, 'professional')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Soft Skills */}
                  {data.skills?.soft && data.skills.soft.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                      <div className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Soft Skills
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.skills.soft.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm border border-orange-200">
                            {skillsLoading ? 'Loading...' : getSkillName(s.skill, 'soft')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Team Structure */}
            {data.team && renderEditableSection(
              "Team Structure",
              "team",
              <Users className="w-6 h-6 text-white" />,
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center border border-blue-200">
                  <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{data.team.size}</div>
                  <div className="text-base text-blue-700 font-semibold">Team Members</div>
                </div>
                
                {data.team.structure && data.team.structure.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Team Roles
                    </h3>
                    <div className="space-y-3">
                      {data.team.structure.map((role, index) => {
                        const roleInfo = predefinedOptions.team.roles.find((r: any) => r.id === role.roleId);
                        return (
                          <div key={index} className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg p-4 border border-violet-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-900">
                                {roleInfo ? roleInfo.name : role.roleId}
                              </div>
                              <div className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-sm font-semibold border border-violet-200">
                                {role.count}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-3 leading-relaxed">
                              {roleInfo ? roleInfo.description : ''}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium border border-indigo-200">
                                {role.seniority.level}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200">
                                {role.seniority.yearsExperience} years exp.
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}

