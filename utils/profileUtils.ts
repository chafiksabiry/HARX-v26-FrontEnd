import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import { 
  updateBasicInfo as updateBasicInfoApi,
  updateExperience as updateExperienceApi,
  updateSkills as updateSkillsApi,
  updateProfile as updateProfileApi
} from '@/lib/rep-profile/api';

// Add Plan interfaces
interface Plan {
  _id: string;
  name: string;
  price: number;
  targetUserType: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanResponse {
  _id: string;
  userId: string;
  plan: Partial<Plan>;  // Using Partial to allow empty object
}

// Add interface for IP history
interface IpHistoryEntry {
  _id: string;
  ip: string;
  timestamp: string;
  action: string;
  locationInfo: {
    location?: {
      _id: string;
      countryCode: string;
      countryName: string;
      zoneName: string;
      gmtOffset: number;
    };
    region?: string;
    city?: string;
    isp?: string;
    postal?: string;
    coordinates?: string;
    countryCode?: string;
    countryName?: string;
  };
}

interface IpHistoryResponse {
  success: boolean;
  data: IpHistoryEntry[];
  message?: string;
}

/**
 * Get profile subscription plan
 */
export const getProfilePlan = async (profileId: string): Promise<PlanResponse> => {
  console.log('🔍 Fetching profile subscription plan...', { profileId });
  
  try {
    // Try to get plan from profile first (if it's populated)
    const profileResponse = await api.get(`/profiles/${profileId}`);
    
    if (profileResponse.data?.success && profileResponse.data.data) {
      const profile = profileResponse.data.data;
      
      // Check if plan is already in profile
      if (profile.plan) {
        console.log('✅ Plan found in profile:', profile.plan);
        return {
          _id: profile.plan._id || profileId,
          userId: profile.userId || profileId,
          plan: profile.plan.plan || profile.plan
        };
      }
    }
    
    // If no plan in profile, try to fetch from plans endpoint (if it exists)
    try {
      const planResponse = await api.get(`/plans/profile/${profileId}`);
      if (planResponse.data?.success && planResponse.data.data) {
        console.log('✅ Successfully fetched plan data:', planResponse.data.data);
        return planResponse.data.data;
      }
    } catch (planError: any) {
      console.log('Plan endpoint not available, returning empty plan');
    }
    
    // Return empty plan if not found
    return {
      _id: profileId,
      userId: profileId,
      plan: {}
    };
  } catch (error: any) {
    console.error('❌ Error fetching plan data:', error);
    // Return empty plan instead of throwing
    return {
      _id: profileId,
      userId: profileId,
      plan: {}
    };
  }
};

// Function to fetch user's IP history
export const fetchUserIpHistory = async (userId: string): Promise<IpHistoryResponse> => {
  try {
    const response = await api.get(`/users/${userId}/ip-history`);
    
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.data || response.data || []
      };
    }
    
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : []
    };
  } catch (error: any) {
    console.error('Error fetching IP history:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch IP history'
    };
  }
};

// Function to get the first login country code
export const getFirstLoginCountryCode = (ipHistory: IpHistoryEntry[]): string | null => {
  if (!ipHistory || ipHistory.length === 0) {
    return null;
  }
  
  // Filter only login actions and sort by timestamp (oldest first)
  const loginEntries = ipHistory
    .filter(entry => entry.action === 'login')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (loginEntries.length === 0) {
    return null;
  }

  // Return the country code of the first login
  const firstLogin = loginEntries[0];
  const countryCode = firstLogin.locationInfo?.location?.countryCode || 
                     firstLogin.locationInfo?.countryCode;
  
  return countryCode || null;
};

// Helper function to get userId
export const getUserId = (): string => {
  // Try to get userId from cookies (Next.js compatible)
  const userId = Cookies.get('userId') || 
                 (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
  
  if (!userId) {
    console.error('❌ No userId found');
    throw new Error('User ID not found');
  }
  
  console.log(`👤 Using userId: ${userId}`);
  return userId;
};

// Function to check country mismatch - now with automatic userId retrieval
export const checkCountryMismatch = async (
  selectedCountryCode: string,
  countries: any[]
): Promise<{
  hasMismatch: boolean;
  firstLoginCountry?: string;
  selectedCountry?: string;
  firstLoginCountryCode?: string;
} | null> => {
  try {
    // Get userId automatically
    const userId = getUserId();
    
    const ipHistoryResponse = await fetchUserIpHistory(userId);
    
    if (!ipHistoryResponse.success || !ipHistoryResponse.data || ipHistoryResponse.data.length === 0) {
      console.log('No IP history available');
      return null;
    }

    const firstLoginCountryCode = getFirstLoginCountryCode(ipHistoryResponse.data);
    
    if (!firstLoginCountryCode) {
      console.log('No login history found');
      return null;
    }

    // Check if there's a mismatch
    const hasMismatch = firstLoginCountryCode.toUpperCase() !== selectedCountryCode.toUpperCase();
    
    if (hasMismatch) {
      // Find country names for display
      const firstLoginCountryData = countries.find(c => 
        (c.countryCode || c.code || '').toUpperCase() === firstLoginCountryCode.toUpperCase()
      );
      const selectedCountryData = countries.find(c => 
        (c.countryCode || c.code || '').toUpperCase() === selectedCountryCode.toUpperCase()
      );
      
      return {
        hasMismatch: true,
        firstLoginCountry: firstLoginCountryData?.countryName || firstLoginCountryData?.name || firstLoginCountryCode,
        selectedCountry: selectedCountryData?.countryName || selectedCountryData?.name || selectedCountryCode,
        firstLoginCountryCode
      };
    }

    return { hasMismatch: false };
  } catch (error) {
    console.error('Error checking country mismatch:', error);
    return null;
  }
};

/**
 * Update basic info of a profile
 */
export const updateBasicInfo = async (id: string, basicInfo: any) => {
  try {
    console.log('🔄 Updating basic info...', { id, dataKeys: Object.keys(basicInfo) });
    const data = await updateBasicInfoApi(id, basicInfo);
    
    // Handle response structure
    if (data?.success && data.data) {
      return data.data;
    }
    return data;
  } catch (error: any) {
    console.error('❌ Error updating basic info:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update experience of a profile
 */
export const updateExperience = async (id: string, experience: any) => {
  try {
    console.log('🔄 Updating experience...', { id });
    const data = await updateExperienceApi(id, experience);
    
    // Handle response structure
    if (data?.success && data.data) {
      return data.data;
    }
    return data;
  } catch (error: any) {
    console.error('❌ Error updating experience:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update skills of a profile
 */
export const updateSkills = async (id: string, skills: any) => {
  try {
    console.log('🔄 Updating skills...', { id, skillTypes: Object.keys(skills) });
    const data = await updateSkillsApi(id, skills);
    
    // Handle response structure
    if (data?.success && data.data) {
      return data.data;
    }
    return data;
  } catch (error: any) {
    console.error('❌ Error updating skills:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update profile data
 */
export const updateProfileData = async (profileId: string, data: any) => {
  try {
    console.log('🔄 Updating profile data...', { profileId, dataKeys: Object.keys(data) });
    const result = await updateProfileApi(profileId, data);
    
    // Handle response structure
    if (result?.success && result.data) {
      return result.data;
    }
    return result;
  } catch (error: any) {
    console.error('❌ Error updating profile data:', error);
    throw error.response?.data || error;
  }
};

