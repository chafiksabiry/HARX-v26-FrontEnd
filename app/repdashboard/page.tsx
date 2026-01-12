"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

export default function RepDashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile by default (like App.tsx redirects to /profile)
    const checkAndRedirect = async () => {
      try {
        const userId = Cookies.get('userId');
        if (!userId) {
          router.push('/auth');
          return;
        }

        // Fetch profile to check phases
        try {
          const profileResponse = await api.get(`/profiles/${userId}`);
          if (profileResponse.data?.success && profileResponse.data.data) {
            const profile = profileResponse.data.data;
            const phases = profile.onboardingProgress?.phases;
            
            // Check if all phases 1-4 are completed
            const allPhasesComplete = [1, 2, 3, 4].every(phaseNum => {
              const phase = phases?.[`phase${phaseNum}`];
              if (!phase) return false;
              return phase.status === 'completed' || 
                (phase.requiredActions && 
                 typeof phase.requiredActions === 'object' &&
                 Object.values(phase.requiredActions).every((action: any) => action === true));
            });
            
            // Redirect to dashboard if all phases complete, otherwise to profile
            if (allPhasesComplete) {
              router.push('/repdashboard/dashboard');
            } else {
              router.push('/repdashboard/profile');
            }
          } else {
            router.push('/repdashboard/profile');
          }
        } catch (error) {
          router.push('/repdashboard/profile');
        }
      } catch (error) {
        router.push('/repdashboard/profile');
      }
    };

    checkAndRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">Redirecting...</div>
    </div>
  );
}
