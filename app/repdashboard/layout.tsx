"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserCircle, 
  Monitor,
  Menu, 
  X,
  Settings,
  LogOut
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface Phase {
  status: string;
  completedAt?: string;
  requiredActions?: any;
  optionalActions?: any;
}

interface Phases {
  phase1: Phase;
  phase2: Phase;
  phase3: Phase;
  phase4: Phase;
}

export default function RepDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState<{ fullName?: string } | null>(null);
  const [phases, setPhases] = useState<Phases | undefined>(undefined);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    // Fetch user information and profile data
    const fetchUserData = async () => {
      try {
        const userId = Cookies.get('userId');
        if (!userId) return;

        // Fetch user info
        try {
          const userResponse = await api.get(`/users/${userId}`);
          if (userResponse.data && userResponse.data.success && userResponse.data.data) {
            const user = userResponse.data.data;
            setUserInfo({
              fullName: user.fullName
            });
          }
        } catch (userError: any) {
          // Only log if it's not a connection error (to reduce console spam)
          if (userError.response) {
            console.warn('⚠️ User endpoint not available:', userError.response.status);
          }
          // Connection errors are handled silently by the interceptor
        }

        // Fetch profile data to get onboarding phases
        try {
          const profileResponse = await api.get(`/profiles/${userId}`);
          if (profileResponse.data && profileResponse.data.success && profileResponse.data.data) {
            const profile = profileResponse.data.data;
            if (profile.onboardingProgress && profile.onboardingProgress.phases) {
              setPhases(profile.onboardingProgress.phases);
              console.log('📊 Phases loaded in layout:', profile.onboardingProgress.phases);
              console.log('📊 Phase 4 status:', profile.onboardingProgress.phases.phase4);
              console.log('📊 All phases 1-4 complete?', [1, 2, 3, 4].every(phaseNum => {
                const phase = profile.onboardingProgress.phases[`phase${phaseNum}`];
                return phase?.status === 'completed' || 
                  (phase?.requiredActions && 
                   typeof phase.requiredActions === 'object' &&
                   Object.values(phase.requiredActions).every((action: any) => action === true));
              }));
            } else {
              console.warn('⚠️ No phases found in profile');
            }
          }
        } catch (profileError: any) {
          // Only log if it's not a connection error (to reduce console spam)
          if (profileError.response) {
            console.warn('⚠️ Error fetching profile:', profileError.response.status);
          }
          // Connection errors are handled silently by the interceptor
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  // Get user display name and initial
  const getUserDisplayName = (): string => {
    if (userInfo && userInfo.fullName) {
      return userInfo.fullName;
    }
    return '';
  };

  const getUserInitial = (): string => {
    const displayName = getUserDisplayName();
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    return '';
  };

  // Check if phase is completed
  const isPhaseCompleted = (phaseNumber: number): boolean => {
    if (!phases) {
      console.log(`🔒 Phase ${phaseNumber}: No phases data`);
      return false;
    }
    const phase = phases[`phase${phaseNumber}` as keyof Phases];
    if (!phase) {
      console.log(`🔒 Phase ${phaseNumber}: Phase not found`);
      return false;
    }
    
    console.log(`🔍 Checking Phase ${phaseNumber}:`, {
      status: phase.status,
      requiredActions: phase.requiredActions
    });
    
    if (phase.status === 'completed') {
      console.log(`✅ Phase ${phaseNumber}: Completed by status`);
      return true;
    }
    
    if (phase.requiredActions && typeof phase.requiredActions === 'object') {
      const allRequiredCompleted = Object.values(phase.requiredActions).every((action: any) => action === true);
      if (allRequiredCompleted) {
        console.log(`✅ Phase ${phaseNumber}: Completed by requiredActions`);
        return true;
      }
    }
    
    console.log(`❌ Phase ${phaseNumber}: Not completed`);
    return false;
  };
  
  // Check if all phases 1-4 are completed (for dashboard access)
  const areAllPhasesComplete = (): boolean => {
    if (!phases) {
      console.log('🔒 All phases: No phases data');
      return false;
    }
    const result = [1, 2, 3, 4].every(phaseNum => isPhaseCompleted(phaseNum));
    console.log('🔒 All phases 1-4 complete?', result);
    return result;
  };

  // Check if current route is active
  const isActiveRoute = (route: string): boolean => {
    return pathname === `/repdashboard${route}` || pathname === `/repdashboard${route}/`;
  };

  const navigateTo = (route: string) => {
    router.push(`/repdashboard${route}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img 
              src="/harx_ai_logo.jpeg"
              alt="HARX.AI Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
          <button 
            className="md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6 flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 overflow-y-auto px-2">
            {/* Profile - Always accessible */}
            <button
              className={`flex w-full items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActiveRoute('/profile') ? 'bg-blue-50 text-blue-600' : ''
              }`}
              onClick={() => navigateTo('/profile')}
            >
              <UserCircle className="w-5 h-5 mr-3" />
              <span>Profile</span>
            </button>
            
            {/* Dashboard - Requires all phases 1-4 completed */}
            {areAllPhasesComplete() && (
              <button
                className={`flex w-full items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActiveRoute('/dashboard') ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => navigateTo('/dashboard')}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </button>
            )}
            
            {/* Marketplace - Requires Phase 4 completed */}
            {(isPhaseCompleted(4) || !phases) && (
              <button
                className={`flex w-full items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActiveRoute('/gigs-marketplace') ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => navigateTo('/gigs-marketplace')}
              >
                <Briefcase className="w-5 h-5 mr-3" />
                <span>Marketplace</span>
                {!isPhaseCompleted(4) && phases && (
                  <span className="ml-auto text-xs text-gray-400">(Phase 4 required)</span>
                )}
              </button>
            )}
            
            {/* Workspace - Requires all phases 1-4 completed */}
            {(areAllPhasesComplete() || !phases) && (
              <button
                className={`flex w-full items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActiveRoute('/workspace') ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => navigateTo('/workspace')}
              >
                <Monitor className="w-5 h-5 mr-3" />
                <span>Workspace</span>
                {!areAllPhasesComplete() && phases && (
                  <span className="ml-auto text-xs text-gray-400">(All phases required)</span>
                )}
              </button>
            )}
            
            {/* Operations - Requires all phases 1-4 completed */}
            {(areAllPhasesComplete() || !phases) && (
              <button
                className={`flex w-full items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActiveRoute('/operations') ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => navigateTo('/operations')}
              >
                <Settings className="w-5 h-5 mr-3" />
                <span>Operations</span>
                {!areAllPhasesComplete() && phases && (
                  <span className="ml-auto text-xs text-gray-400">(All phases required)</span>
                )}
              </button>
            )}
            
            {/* Dashboard - Requires all phases 1-4 completed */}
            {(areAllPhasesComplete() || !phases) && (
              <button
                className={`flex w-full items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActiveRoute('/dashboard') ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => navigateTo('/dashboard')}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
                {!areAllPhasesComplete() && phases && (
                  <span className="ml-auto text-xs text-gray-400">(All phases required)</span>
                )}
              </button>
            )}
          </div>
          <div className="border-t border-gray-200 p-4 mt-auto">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <button 
              className="md:hidden" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4 ml-auto">
              {userInfo?.fullName && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {getUserInitial()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{getUserDisplayName()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

