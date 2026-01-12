import { GigData } from '../../types/gigs';
import Cookies from 'js-cookie';
import api from '@/lib/rep-profile/client'; // Use the central axios client

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types for countries API
export interface Country {
  _id: string;
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, {
      official: string;
      common: string;
      _id: string;
    }>;
  };
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
  cca2: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface CountriesResponse {
  success: boolean;
  data: Country[];
}

export interface CountryResponse {
  success: boolean;
  data: Country;
}

// Types for timezones API
export interface Timezone {
  _id: string;
  countryCode: string;
  countryName: string;
  zoneName: string;
  gmtOffset: number;
  lastUpdated: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimezonesResponse {
  success: boolean;
  data: Timezone[];
  count: number;
}

export interface TimezoneResponse {
  success: boolean;
  data: Timezone;
}

// Types for currencies API
export interface Currency {
  _id: string;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Types for skills API
export interface TechnicalSkill {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface SoftSkill {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalSkill {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillsResponse {
  success: boolean;
  data: TechnicalSkill[] | SoftSkill[] | ProfessionalSkill[];
  total?: number;
  message?: string;
}

export interface CurrenciesResponse {
  success: boolean;
  data: Currency[];
  total: number;
  message: string;
}

export interface CurrencyResponse {
  success: boolean;
  data: Currency;
  message: string;
}

// Countries API functions
export async function fetchAllCountries(): Promise<Country[]> {
  try {
    const { data } = await api.get('/countries');
    
    if (!data.success) {
      throw new Error('Failed to fetch countries');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
}

export async function fetchCountryById(countryId: string): Promise<Country> {
  try {
    const { data } = await api.get(`/countries/${countryId}`);
    
    if (!data.success) {
      throw new Error('Failed to fetch country');
    }
    
    return data.data;
  } catch (error: any) {
    // If 404, try to find country in the list
    if (error.response?.status === 404) {
      console.warn(`Country ${countryId} not found, trying to fetch from list...`);
      try {
        const allCountries = await fetchAllCountries();
        const country = allCountries.find(c => c._id === countryId);
        if (country) {
          return country;
        }
      } catch (listError) {
        console.error('Error fetching countries list:', listError);
      }
    }
    console.error('Error fetching country:', error);
    throw error;
  }
}

export async function getCountryNameById(countryId: string): Promise<string> {
  try {
    const country = await fetchCountryById(countryId);
    return country.name.common;
  } catch (error) {
    console.error('Error getting country name:', error);
    // Try to get from cached list if available
    try {
      const allCountries = await fetchAllCountries();
      const country = allCountries.find(c => c._id === countryId);
      if (country) {
        return country.name.common;
      }
    } catch (listError) {
      console.error('Error fetching countries list as fallback:', listError);
    }
    return 'Unknown Country';
  }
}

// Timezones API functions
export async function fetchAllTimezones(): Promise<Timezone[]> {
  try {
    const { data } = await api.get('/timezones');
    
    if (!data.success) {
      throw new Error('Failed to fetch timezones');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching timezones:', error);
    throw error;
  }
}

export async function fetchTimezoneById(timezoneId: string): Promise<Timezone> {
  try {
    const { data } = await api.get(`/timezones/${timezoneId}`);
    
    if (!data.success) {
      throw new Error('Failed to fetch timezone');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching timezone:', error);
    throw error;
  }
}

export async function getTimezoneNameById(timezoneId: string): Promise<string> {
  try {
    const timezone = await fetchTimezoneById(timezoneId);
    return `${timezone.zoneName} (${timezone.countryName})`;
  } catch (error) {
    console.error('Error getting timezone name:', error);
    return 'Unknown Timezone';
  }
}

export async function fetchCompanies() {
  try {
    const { data } = await api.get('/companies');
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch companies');
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ API: Error fetching companies:', error);
    throw error;
  }
}

export async function fetchCompanyById(companyId: string) {
  try {
    const { data } = await api.get(`/companies/${companyId}`);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch company');
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ API: Error fetching company:', error);
    throw error;
  }
}

interface Company {
  _id: string;
  userId: string | { $oid: string };
  name: string;
  industry: string;
}

// Function to fix schedule data automatically
function fixScheduleData(data: GigData): GigData {
  const workingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Fix availability.schedule
  if (data.availability && data.availability.schedule) {
    const fixedAvailabilitySchedule = data.availability.schedule.map((schedule, index) => {
      if (!schedule.day) {
        const dayIndex = index % workingDays.length;
        return {
          ...schedule,
          day: workingDays[dayIndex]
        };
      }
      return schedule;
    });
    
    data.availability.schedule = fixedAvailabilitySchedule;
  }
  
  // Fix schedule.schedules
  if (data.schedule && data.schedule.schedules) {
    const fixedScheduleSchedules = data.schedule.schedules.map((schedule, index) => {
      if (!schedule.day) {
        const dayIndex = index % workingDays.length;
        return {
          ...schedule,
          day: workingDays[dayIndex]
        };
      }
      return schedule;
    });
    
    data.schedule.schedules = fixedScheduleSchedules;
  }
  
  return data;
}

export async function updateGigData(gigId: string, gigData: GigData): Promise<{ data: any; error?: Error }> {
  try {
    const userId = Cookies.get('userId') ?? "";
    
    if (!userId) {
      throw new Error('User ID not found in cookies');
    }

    const companyId = Cookies.get('companyId') ?? "";
    const fixedGigData = fixScheduleData(gigData);
    
    // Format skills data
    const formattedSkills = {
      ...fixedGigData.skills,
      languages: fixedGigData.skills.languages.map(lang => ({
        language: typeof lang.language === 'object' && (lang.language as any).$oid ? (lang.language as any).$oid : lang.language,
        proficiency: lang.proficiency,
        iso639_1: lang.iso639_1
      })),
      soft: fixedGigData.skills.soft.map(skill => ({
        skill: typeof skill.skill === 'object' && (skill.skill as any).$oid ? (skill.skill as any).$oid : skill.skill,
        level: skill.level,
        details: (skill as any).details || ''
      })),
      professional: fixedGigData.skills.professional.map(skill => ({
        skill: typeof skill.skill === 'object' && (skill.skill as any).$oid ? (skill.skill as any).$oid : skill.skill,
        level: skill.level,
        details: (skill as any).details || ''
      })),
      technical: fixedGigData.skills.technical.map(skill => ({
        skill: typeof skill.skill === 'object' && (skill.skill as any).$oid ? (skill.skill as any).$oid : skill.skill,
        level: skill.level,
        details: (skill as any).details || ''
      }))
    };

    // Format availability data
    const formattedAvailability = {
      ...fixedGigData.availability,
      time_zone: (() => {
        const firstTimezone = fixedGigData.availability.timeZones?.[0];
        if (typeof firstTimezone === 'string') {
          return firstTimezone;
        }
        return fixedGigData.availability.time_zone || 'UTC';
      })(),
      schedule: (() => {
        const scheduleData = fixedGigData.availability?.schedule || fixedGigData.schedule?.schedules || [];
        return scheduleData.map(schedule => ({
          day: schedule.day,
          hours: schedule.hours
        }));
      })()
    };

    // Format destination zone
    const formattedDestinationZone = (() => {
      if (fixedGigData.destination_zone) {
        if (typeof fixedGigData.destination_zone === 'string' && fixedGigData.destination_zone.length === 24) {
          console.log('💾 UPDATE GIG - Using MongoDB ObjectId for destination_zone:', fixedGigData.destination_zone);
          return fixedGigData.destination_zone;
        }
        console.log('⚠️ UPDATE GIG - destination_zone is not a valid MongoDB ObjectId, omitting from request');
        return undefined;
      }
      console.log('💾 UPDATE GIG - No destination_zone provided, omitting from request');
      return undefined;
    })();

    const { schedule, time_zone, destinationZones, ...cleanGigData } = fixedGigData;
    
    const gigDataWithIds = {
      ...cleanGigData,
      userId,
      companyId,
      skills: formattedSkills,
      availability: formattedAvailability,
      ...(formattedDestinationZone && { destination_zone: formattedDestinationZone })
    };

    const response = await api.put(`/gigs/${gigId}`, gigDataWithIds);
    // const responseText = await response.text(); // Axios returns parsed data

    // if (!response.ok) { ... } // Axios throws on error usually, or we check response.status

    if (response.status !== 200) {
       return { data: null, error: new Error('Failed to update gig data') };
    }
    
    return { data: response.data, error: undefined };

  } catch (error: any) {
    console.error('Error in updateGigData:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message || 'Unknown error occurred') };
  }
}

export async function saveGigData(gigData: GigData): Promise<{ data: any; error?: Error }> {
  try {
    const userId = Cookies.get('userId') ?? "";
    
    if (!userId) {
      throw new Error('User ID not found in cookies');
    }

    const companyId = Cookies.get('companyId') ?? "";
    const fixedGigData = fixScheduleData(gigData);
    
    // ... (formatting code remains same, omitted for brevity in replace block if possible, but context needed)
    const formattedSkills = {
      ...fixedGigData.skills,
      languages: fixedGigData.skills.languages.map(lang => ({
        language: typeof lang.language === 'object' && (lang.language as any).$oid ? (lang.language as any).$oid : lang.language,
        proficiency: lang.proficiency,
        iso639_1: lang.iso639_1
      })),
      soft: fixedGigData.skills.soft.map(skill => ({
        skill: typeof skill.skill === 'object' && (skill.skill as any).$oid ? (skill.skill as any).$oid : skill.skill,
        level: skill.level,
        details: (skill as any).details || ''
      })),
      professional: fixedGigData.skills.professional.map(skill => ({
        skill: typeof skill.skill === 'object' && (skill.skill as any).$oid ? (skill.skill as any).$oid : skill.skill,
        level: skill.level,
        details: (skill as any).details || ''
      })),
      technical: fixedGigData.skills.technical.map(skill => ({
        skill: typeof skill.skill === 'object' && (skill.skill as any).$oid ? (skill.skill as any).$oid : skill.skill,
        level: skill.level,
        details: (skill as any).details || ''
      }))
    };

    const formattedAvailability = {
      ...fixedGigData.availability,
      time_zone: (() => {
        const firstTimezone = fixedGigData.availability.timeZones?.[0];
        if (typeof firstTimezone === 'string') {
          return firstTimezone;
        }
        return fixedGigData.availability.time_zone || 'UTC';
      })(),
      schedule: (() => {
        const scheduleData = fixedGigData.availability?.schedule || fixedGigData.schedule?.schedules || [];
        return scheduleData.map(schedule => ({
          day: schedule.day,
          hours: schedule.hours
        }));
      })()
    };

    const formattedDestinationZone = (() => {
      if (fixedGigData.destination_zone) {
        if (typeof fixedGigData.destination_zone === 'string' && fixedGigData.destination_zone.length === 24) {
          console.log('💾 SAVE GIG - Using MongoDB ObjectId for destination_zone:', fixedGigData.destination_zone);
          return fixedGigData.destination_zone;
        }
        console.log('⚠️ SAVE GIG - destination_zone is not a valid MongoDB ObjectId, omitting from request');
        return undefined;
      }
      console.log('💾 SAVE GIG - No destination_zone provided, omitting from request');
      return undefined;
    })();

    const { schedule, time_zone, destinationZones, ...cleanGigData } = fixedGigData;
    
    const gigDataWithIds = {
      ...cleanGigData,
      userId,
      companyId,
      skills: formattedSkills,
      availability: formattedAvailability,
      ...(formattedDestinationZone && { destination_zone: formattedDestinationZone })
    };

    console.log('📤 Sending gig data to backend:', JSON.stringify(gigDataWithIds, null, 2));
    const response = await api.post('/gigs', gigDataWithIds);

    if (response.status !== 201 && response.status !== 200) {
      const errorMessage = response.data?.message || 'Failed to save gig data';
      console.error('❌ Backend returned error status:', response.status, errorMessage);
      return { data: null, error: new Error(errorMessage) };
    }
    
    console.log('✅ Gig saved successfully:', response.data);
    return { data: response.data, error: undefined };

  } catch (error: any) {
    console.error('❌ Error in saveGigData:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
    console.error('❌ Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: errorMessage
    });
    return { data: null, error: error instanceof Error ? error : new Error(errorMessage) };
  }
}

export async function getGig(gigId: string | null) {
  try {
    if (!gigId) {
      const { data } = await api.get('/gigs');
      return { data, error: null };
    } else {
      const { data } = await api.get(`/gigs/${gigId}`);
      return { data: [data], error: null };
    }
  } catch (error) {
    console.error('Error fetching gig:', error);
    return { data: null, error };
  }
}

export async function fetchSoftSkills(): Promise<{ data: SoftSkill[]; error: string | null }> {
  try {
    const { data } = await api.get('/skills?category=soft');
    if (!data.success) return { data: [], error: data.message };
    return { data: data.data || [], error: null };
  } catch (error) {
    console.error('Error fetching soft skills:', error);
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fetchTechnicalSkills(): Promise<{ data: TechnicalSkill[]; error: string | null }> {
  try {
    const { data } = await api.get('/skills?category=technical');
    if (!data.success) return { data: [], error: data.message };
    return { data: data.data || [], error: null };
  } catch (error) {
    console.error('Error fetching technical skills:', error);
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fetchProfessionalSkills(): Promise<{ data: ProfessionalSkill[]; error: string | null }> {
  try {
    const { data } = await api.get('/skills?category=professional');
    if (!data.success) return { data: [], error: data.message };
    return { data: data.data || [], error: null };
  } catch (error) {
    console.error('Error fetching professional skills:', error);
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

import { SkillData } from './skillsManager';

// Skill CRUD operations
export async function saveSkillToDatabase(skillData: Omit<SkillData, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    const { data } = await api.post('/skills', skillData);
    if (!data.success) throw new Error(data.message || 'Failed to save skill');
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Error saving skill:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function updateSkillInDatabase(skillId: string, updates: Partial<SkillData>) {
  try {
    const { data } = await api.put(`/skills/${skillId}`, updates);
    if (!data.success) throw new Error(data.message || 'Failed to update skill');
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Error updating skill:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function deleteSkillFromDatabase(skillId: string) {
  try {
    const { data } = await api.delete(`/skills/${skillId}`);
    if (!data.success) throw new Error(data.message || 'Failed to delete skill');
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Error deleting skill:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function getSkillById(skillId: string, category?: 'soft' | 'technical' | 'professional') {
  try {
    const { data } = await api.get(`/skills/${skillId}${category ? `?category=${category}` : ''}`);
    if (!data.success) throw new Error(data.message || 'Failed to get skill');
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Error getting skill:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function searchSkillsByName(name: string, category?: 'soft' | 'technical' | 'professional') {
  try {
    const { data } = await api.get(`/skills/search?name=${encodeURIComponent(name)}${category ? `&category=${category}` : ''}`);
    if (!data.success) throw new Error(data.message || 'Failed to search skills');
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Error searching skills:', error);
    return { data: [], error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export async function syncSkillsToDatabase(skills: Array<Omit<SkillData, '_id' | 'createdAt' | 'updatedAt'>>) {
  try {
    const { data } = await api.post('/skills/sync', { skills });
    if (!data.success) throw new Error(data.message || 'Failed to sync skills');
    return { data: data.data, error: null };
  } catch (error) {
    console.error('Error syncing skills:', error);
    return { data: [], error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

// Interfaces for API responses
interface Activity {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface Industry {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface Language {
  _id: string;
  code: string;
  name: string | { common: string; official: string; nativeName?: { [key: string]: { common: string; official: string } } };
  nativeName: string;
  __v: number;
  createdAt: string;
  lastUpdated: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: any;
  message: string;
}

export async function fetchActivities(): Promise<{ data: Activity[]; error?: Error }> {
  try {
    const { data } = await api.get('/activities');
    
    if (!data.success) throw new Error(data.message || 'Failed to fetch activities');
    return { data: data.data };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { data: [], error: error as Error };
  }
}

export async function fetchIndustries(): Promise<{ data: Industry[]; error?: Error }> {
  try {
    const { data } = await api.get('/industries');
    
    if (!data.success) throw new Error(data.message || 'Failed to fetch industries');
    return { data: data.data };
  } catch (error) {
    console.error('Error fetching industries:', error);
    return { data: [], error: error as Error };
  }
}

export async function fetchLanguages(): Promise<{ data: Language[]; error?: Error }> {
  try {
    const { data } = await api.get('/languages');
    
    if (!data.success) throw new Error(data.message || 'Failed to fetch languages');
    return { data: data.data };
  } catch (error) {
    console.error('Error fetching languages:', error);
    return { data: [], error: error as Error };
  }
}

export async function fetchAllCurrencies(): Promise<Currency[]> {
  try {
    const { data } = await api.get('/currencies');
    
    if (!data.success) throw new Error(data.message || 'Failed to fetch currencies');
    return data.data;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return [];
  }
}

export async function fetchCurrencyById(currencyId: string): Promise<Currency | null> {
  try {
    const { data } = await api.get(`/currencies/${currencyId}`);
    
    if (!data.success) throw new Error(data.message || 'Failed to fetch currency');
    return data.data;
  } catch (error: any) {
    // If 404 or 500, try to find currency in the list as fallback
    if (error.response?.status === 404 || error.response?.status === 500) {
      console.warn(`Currency ${currencyId} not found via API (status: ${error.response?.status}), trying to fetch from list...`);
      try {
        const allCurrencies = await fetchAllCurrencies();
        const currency = allCurrencies.find(c => c._id === currencyId);
        if (currency) {
          console.log(`✅ Found currency ${currencyId} in list:`, currency.name);
          return currency;
        }
      } catch (listError) {
        console.error('Error fetching currencies list:', listError);
      }
    }
    console.error(`❌ Error fetching currency ${currencyId}:`, error.response?.data || error.message);
    return null;
  }
}
