import Cookies from 'js-cookie';
import { api } from '@/lib/api';

interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
  currentRole?: string;
}

/**
 * Get user info from profile or user data
 */
export const getUserInfo = (): UserInfo | null => {
  try {
    // Try to get from localStorage first (cached profile data)
    if (typeof window !== 'undefined') {
      const cachedProfile = localStorage.getItem('profileData');
      if (cachedProfile) {
        try {
          const profile = JSON.parse(cachedProfile);
          return {
            name: profile.personalInfo?.name,
            email: profile.personalInfo?.email,
            phone: profile.personalInfo?.phone,
            photo: profile.personalInfo?.photo?.url,
            currentRole: profile.professionalSummary?.currentRole
          };
        } catch (e) {
          console.error('Error parsing cached profile:', e);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

/**
 * Get user ID from cookies or localStorage
 */
export const getUserId = (): string | null => {
  return Cookies.get('userId') || 
         (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
};

/**
 * Get agent ID from cookies or localStorage
 */
export const getAgentId = (): string | null => {
  return Cookies.get('agentId') || 
         (typeof window !== 'undefined' ? localStorage.getItem('agentId') : null);
};

