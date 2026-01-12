"use client";

import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/repdashboard/Dashboard';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          setProfileData(profileResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <Dashboard 
      profile={profileData} 
      userId={Cookies.get('userId') || ''} 
    />
  );
}

