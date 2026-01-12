
"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  ArrowRightLeft, 
  Menu, 
  X,
  Settings,
  HelpCircle,
  LogOut,
  Building2
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import ProfileCreation from '@/components/comporchestrator/ProfileCreation';
import GigGeneration from '@/components/comporchestrator/GigGeneration';
import Matching from '@/components/comporchestrator/Matching';
import ApprovalPublishing from '@/components/comporchestrator/ApprovalPublishing';
import Optimization from '@/components/comporchestrator/Optimization';
import CompanyOnboarding from '@/components/comporchestrator/CompanyOnboarding';
import ZohoCallback from '@/components/comporchestrator/onboarding/ZohoCallback';
import ZohoAuth from '@/components/comporchestrator/onboarding/ZohoAuth';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function CompOrchestratorPage() {
  const [activeTab, setActiveTab] = useState('company-onboarding');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState<{ fullName?: string } | null>(null);
  const pathname = usePathname();
  const { logout } = useAuth();

  // Vérifier si nous sommes sur une page spéciale
  const isZohoCallback = pathname === '/comporchestrator/zoho-callback';
  const isZohoAuth = pathname === '/comporchestrator/zoho-auth';

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const userId = Cookies.get('userId');
    if (!userId && !isZohoCallback && !isZohoAuth) {
      console.log('User ID not found, redirecting to /auth');
      window.location.href = '/auth';
      return;
    }


    // Fetch user information from User collection
    const fetchUserInfo = async () => {
      try {
        const userId = Cookies.get('userId');
        if (!userId) return;

        // Try to get user info from /api/users/:userId endpoint
        try {
          const response = await api.get(`/users/${userId}`);
          if (response.data && response.data.success && response.data.data) {
            const user = response.data.data;
            setUserInfo({
              fullName: user.fullName
            });
            return;
          }
        } catch (userError: any) {
          // If endpoint doesn't exist, log error but don't set mock data
          console.error('User endpoint not available:', userError);
          // Ne pas définir de données mockées - l'utilisateur ne sera pas affiché
          return;
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Ne pas définir de données mockées
        return;
      }
    };

    if (!isZohoCallback && !isZohoAuth) {
      fetchUserInfo();
    }

    // Check localStorage for activeTab on mount
    const storedActiveTab = localStorage.getItem('activeTab');
    if (storedActiveTab) {
      setActiveTab(storedActiveTab);
      localStorage.removeItem('activeTab'); // Clear after reading
    }
  }, [isZohoCallback, isZohoAuth]);

  const handleLogout = () => {
    logout();
  };

  // Get user display name and initial
  const getUserDisplayName = (): string => {
    if (userInfo && userInfo.fullName) {
      return userInfo.fullName;
    }
    // Ne pas retourner de valeur par défaut - retourner une chaîne vide
    return '';
  };

  const getUserInitial = (): string => {
    const displayName = getUserDisplayName();
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    // Ne pas retourner de valeur par défaut
    return '';
  };

  const renderContent = () => {
    // Si nous sommes sur une page spéciale, afficher le composant correspondant
    if (isZohoCallback) {
      return <ZohoCallback />;
    }
    if (isZohoAuth) {
      return <ZohoAuth />;
    }

    switch (activeTab) {
      case 'profile-creation':
        return <ProfileCreation />;
      case 'gig-generation':
        return <GigGeneration />;
      case 'matching':
        return <Matching />;
      case 'approval-publishing':
        return <ApprovalPublishing />;
      case 'optimization':
        return <Optimization />;
      case 'company-onboarding':
      default:
        return <CompanyOnboarding />;
    }
  };

  // Si nous sommes sur une page spéciale, ne pas afficher la sidebar
  if (isZohoCallback || isZohoAuth) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Toaster position="top-right" />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-indigo-800">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="h-6 w-6" />
            <span className="text-xl font-bold">Smart Orchestrator</span>
          </div>
          <button 
            className="md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6 px-4">
          <div className="space-y-4">
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'company-onboarding' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('company-onboarding')}
            >
              <Building2 className="h-5 w-5" />
              <span>Company Onboarding</span>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-indigo-800 p-4">
            <div className="space-y-4">
              <button className="flex w-full items-center space-x-2 rounded-lg py-2 px-3 hover:bg-indigo-800">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <button className="flex w-full items-center space-x-2 rounded-lg py-2 px-3 hover:bg-indigo-800">
                <HelpCircle className="h-5 w-5" />
                <span>Help</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center space-x-2 rounded-lg py-2 px-3 hover:bg-indigo-800"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <button 
              className="md:hidden" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              {userInfo?.fullName && (
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                      {getUserInitial()}
                    </div>
                    <span className="font-medium">{getUserDisplayName()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

