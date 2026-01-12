import { useState, useEffect, useCallback } from 'react';
import * as profileApi from '../api';
import Cookies from 'js-cookie';

export const useProfile = (profileId?: string) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedUserId, setFetchedUserId] = useState<string | null>(null);

  // Helper to get userId from cookie
  const getUserIdFromCookie = () => {
    return Cookies.get('userId');
  };

  // Helper to check token existence
  const hasToken = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  };

  // The main function to fetch a profile
  const fetchProfile = useCallback(async (userId?: string) => {
    // Skip if no userId is provided and no token is available
    // But we might want to fetch by ID even if no token (if public)? No, API requires auth.
    // If we have a token but no userId, we can fetch /profiles (me).
    
    // If userId is provided, use it. If not, try cookie.
    const targetUserId = userId || getUserIdFromCookie();

    if (!targetUserId && !hasToken()) {
      // console.error('Cannot fetch profile: No user ID provided and no authentication token available');
      return null;
    }
    
    // If we've already fetched this profile and it matches the requested userId, return the cached profile
    if (profile && fetchedUserId === targetUserId) {
      return profile;
    }
    
    try {
      setLoading(true);
      const data = await profileApi.getProfile(targetUserId);
      
      if (data) {
        setProfile(data);
        if (targetUserId) setFetchedUserId(targetUserId);
        setError(null);
      } else {
        // Profile doesn't exist yet - this is normal, not an error
        setProfile(null);
        if (targetUserId) setFetchedUserId(targetUserId);
        setError(null); // Clear any previous error
      }
      
      return data;
    } catch (err: any) {
      // Only set error for non-404 errors (other API errors)
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile, fetchedUserId]);

  // Auto-fetch profile if profileId is provided to the hook
  useEffect(() => {
    if (profileId && profileId !== fetchedUserId && hasToken()) {
      fetchProfile(profileId);
    }
  }, [profileId, fetchedUserId, fetchProfile]);

  // Wrapper for fetchProfile to be used by components
  const getProfile = async (specificUserId?: string) => {
    return fetchProfile(specificUserId);
  };

  const createProfile = async (profileData: any) => {
    try {
      setLoading(true);
      const createdProfile = await profileApi.createProfile(profileData);
      setProfile(createdProfile);
      setError(null);
      return createdProfile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBasicInfo = async (id: string, basicInfo: any) => {
    try {
      setLoading(true);
      const updatedProfile = await profileApi.updateBasicInfo(id, basicInfo);
      setProfile(updatedProfile);
      setError(null);
      return updatedProfile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (id: string, profileData: any) => {
    try {
      setLoading(true);
      const updatedProfile = await profileApi.updateProfile(id, profileData);
      setProfile(updatedProfile);
      setError(null);
      return updatedProfile;
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExperience = async (id: string, experience: any) => {
    try {
      setLoading(true);
      const updatedProfile = await profileApi.updateExperience(id, experience);
      setProfile(updatedProfile);
      setError(null);
      return updatedProfile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSkills = async (id: string, skills: any) => {
    try {
      setLoading(true);
      const updatedProfile = await profileApi.updateSkills(id, skills);
      setProfile(updatedProfile);
      setError(null);
      return updatedProfile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addAssessment = async (id: string, assessment: any) => {
    try {
      setLoading(true);
      const updatedProfile = await profileApi.addAssessment(id, assessment);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setError(null);
      }
      return updatedProfile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLanguageAssessment = async (id: string, language: string, proficiency: string, results: any) => {
    try {
      setLoading(true);
      const updatedProfile = await profileApi.updateLanguageAssessment(id, language, proficiency, results);
      setProfile(updatedProfile);
      setError(null);
      return updatedProfile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addContactCenterAssessment = async (id: string, result: any) => {
    try {
      setLoading(true);
      const updatedProfile = await profileApi.addContactCenterAssessment(id, result);
      setProfile(updatedProfile);
      setError(null);
      return updatedProfile;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      setLoading(true);
      await profileApi.deleteProfile(id);
      setProfile(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    getProfile,
    createProfile,
    updateBasicInfo,
    updateExperience,
    updateSkills,
    updateProfileData,
    addAssessment,
    updateLanguageAssessment,
    addContactCenterAssessment,
    deleteProfile,
  };
};

