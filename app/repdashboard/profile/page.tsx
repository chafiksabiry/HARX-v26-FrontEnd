"use client";

import React, { useState, useEffect } from 'react';
import { ProfileView } from '@/components/repdashboard/ProfileView';
import { ProfileEditView } from '@/components/repdashboard/ProfileEditView';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

// Helper function to normalize country data from backend format to frontend format
const normalizeCountryData = (country: any) => {
  if (!country || typeof country !== 'object') {
    return country;
  }
  
  // Handle backend Country format: { name: { common, official }, cca2 }
  if (country.name && typeof country.name === 'object') {
    return {
      ...country,
      countryName: country.countryName || country.name.common || country.name.official || '',
      countryCode: country.countryCode || country.cca2 || country.code || '',
      name: country.countryName || country.name.common || country.name.official || '',
      code: country.countryCode || country.cca2 || country.code || ''
    };
  }
  
  return country;
};

// Helper function to normalize profile data
const normalizeProfileData = (profile: any) => {
  if (!profile) return profile;
  
  // Normalize country data if it exists
  if (profile.personalInfo?.country && typeof profile.personalInfo.country === 'object') {
    profile.personalInfo.country = normalizeCountryData(profile.personalInfo.country);
  }
  
  return profile;
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = Cookies.get('userId');
        if (!userId) {
          setLoading(false);
          return;
        }

        const profileResponse = await api.get(`/profiles/${userId}`);
        if (profileResponse.data?.success && profileResponse.data.data) {
          const normalizedProfile = normalizeProfileData(profileResponse.data.data);
          setProfileData(normalizedProfile);
        }
      } catch (error: any) {
        // Only log if it's not a connection error (to reduce console spam)
        if (error.response) {
          console.warn('⚠️ Error fetching profile:', error.response.status);
        }
        // Connection errors are handled silently by the interceptor
        // Set profileData to null so the "No profile data available" message shows
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle profile update after editing
  const handleProfileUpdate = async (updatedProfile: any) => {
    try {
      console.log('📝 Updating local profile state with saved changes');
      setProfileData(updatedProfile);
      setIsEditing(false);
      
      // Refresh profile data from API
      const userId = Cookies.get('userId');
      if (userId) {
        const profileResponse = await api.get(`/profiles/${userId}`);
        if (profileResponse.data?.success && profileResponse.data.data) {
          const normalizedProfile = normalizeProfileData(profileResponse.data.data);
          setProfileData(normalizedProfile);
        }
      }
    } catch (error) {
      console.error('Error updating profile state:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-500 mb-2">No profile data available</div>
          <div className="text-sm text-gray-400">
            {typeof window !== 'undefined' && (
              <p>
                Backend may be offline. Please ensure the backend server is running on port 5000.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {isEditing ? (
        <ProfileEditView 
          profile={profileData} 
          onSave={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileView 
          profile={profileData} 
          onEditClick={() => setIsEditing(true)} 
        />
      )}
    </div>
  );
}

