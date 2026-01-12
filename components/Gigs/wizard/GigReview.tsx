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
} from "lucide-react";
import { GigData } from "@/types/gigs";
// import { predefinedOptions } from "../lib/guidance"; // Need to migrate this
import { validateGigData } from "@/lib/gigs/validation";
import { groupSchedules } from "@/lib/gigs/scheduleUtils"; 
import { fetchAllTimezones, fetchCompanyById, getCountryNameById } from '@/lib/gigs/api';

// Placeholder for missing lib
const predefinedOptions = {
    team: { roles: [] },
    commission: { currencies: [{ code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' }] }
};
// const groupSchedules = (schedules: any[]) => { return schedules.map(s => ({ days: [s.day], hours: s.hours })); }; // Mock removed
const getIndustryNameById = (id: string) => id;
const loadLanguages = async () => {};
const getLanguageNameById = (id: string) => id;

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
  // const validation = skipValidation ? { isValid: true, errors: {}, warnings: {} } : validateGigData(data);

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

  // Load skills and languages from API
  useEffect(() => {
    const fetchSkillsAndLanguages = async () => {
      try {
        setSkillsLoading(true);
        setLanguagesLoading(true);
        
        // Placeholder for skill loading - would call api.fetchSoftSkills etc
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
        if (tzRes && Array.isArray(tzRes)) {
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
          }
        } catch (e) { }
      }
      
      // Fetch country name if we have a destination_zone
      if (data.destination_zone) {
        try {
          const countryNameFromApi = await getCountryNameById(data.destination_zone);
          setCountryName(countryNameFromApi);
        } catch (e) { 
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
    let skillId: string;
    if (typeof skill === 'string') {
      skillId = skill;
    } else if (skill && typeof skill === 'object' && skill.$oid) {
      skillId = skill.$oid;
    } else {
      return 'Unknown Skill';
    }
    return skillId; // Simplified for now
  };

  // Helper to get language name by id
  const getLanguageName = (language: any) => {
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

  const getCurrencySymbol = () => {
    if (!data.commission) {
      return "€";
    }
    return data.commission.currency
      ? predefinedOptions.commission.currencies.find(
          (c) => c.code === data.commission.currency
        )?.symbol || "€"
      : "€";
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
      await onSubmit();
      
      // Marquer le step "Create Gigs" comme complété
      try {
        const companyId = Cookies.get('companyId');
        if (companyId) {
          await axios.put(
            `${process.env.NEXT_PUBLIC_COMPANY_API_URL}/companies/${companyId}/onboarding/phases/2/steps/4`,
            { status: 'completed' }
          );
          console.log('✅ Step 4 "Create Gigs" marked as completed');
        }
      } catch (error) {
        console.error('Error updating step progress:', error);
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
        // Rediriger vers comporchestrator
        window.location.href = "/comporchestrator";
      }
    } catch (error) {
      console.error('Error publishing gig:', error);
      await Swal.fire({
        title: "Error!",
        text: "Failed to publish gig.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const getHeaderGradient = (section: string) => {
    switch (section) {
      case 'basic': return 'from-blue-500 via-indigo-500 to-violet-500';
      case 'commission': return 'from-emerald-500 via-green-500 to-teal-500';
      case 'schedule': return 'from-purple-500 via-violet-500 to-indigo-500';
      case 'skills': return 'from-orange-500 via-amber-500 to-yellow-500';
      case 'team': return 'from-blue-500 via-indigo-500 to-violet-500';
      default: return 'from-blue-500 via-indigo-500 to-violet-500';
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

  const destinationZoneName = countryName || getTimeZoneName(data.destination_zone);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full px-6 py-8 max-w-7xl mx-auto">
        
        {/* Header */}
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
              <button onClick={onBack} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold">
                ← Previous
              </button>
              <button onClick={handlePublish} disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl font-semibold">
                {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Gig' : 'Publish Gig')}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {renderEditableSection("Basic Information", "basic", <Briefcase className="w-6 h-6 text-white" />, 
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">{data?.title || 'No title'}</h1>
                <p className="text-gray-700">{data?.description}</p>
                <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{data.category}</span>
                    <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold">{data.seniority?.level}</span>
                </div>
              </div>
            )}
            
            {data?.commission && renderEditableSection("Commission", "commission", <DollarSign className="w-6 h-6 text-white" />,
                <div className="space-y-4">
                    <div className="text-2xl font-bold">{getCurrencySymbol()}{data.commission.baseAmount} Base</div>
                </div>
            )}
          </div>
          
          <div className="space-y-8">
             {renderEditableSection("Skills", "skills", <Brain className="w-6 h-6 text-white" />,
                <div>
                    {data.skills?.languages?.map((l, i) => <div key={i}>{getLanguageName(l.language)}: {l.proficiency}</div>)}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
