"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  UserCircle, 
  Menu, 
  X,
  Settings,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  Briefcase,
  ShoppingBag,
  Wallet,
  Award,
  PhoneCall,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Dashboard from '@/components/reporchestrator/components/Dashboard';
import Profile from '@/components/reporchestrator/components/Profile';
import Marketplace from '@/components/reporchestrator/components/Marketplace';
import WalletDashboard from '@/components/reporchestrator/components/WalletDashboard';
import CareerTrack from '@/components/reporchestrator/components/CareerTrack';
import Operations from '@/components/reporchestrator/components/Operations';
import QualityControl from '@/components/reporchestrator/components/QualityControl';
import Subscription from '@/components/reporchestrator/components/Subscription';
import Support from '@/components/reporchestrator/components/Support';
import SkillsAssessment from '@/components/reporchestrator/components/SkillsAssessment';

export default function RepOrchestratorPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState<{ fullName?: string } | null>(null);
  const [isCheckingAgent, setIsCheckingAgent] = useState(true);
  const [hasAgentId, setHasAgentId] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const redirectingRef = useRef(false);

  useEffect(() => {
    // Check if user has agentId, if not, redirect to profile creation
    const checkAgentProfile = async () => {
      // Prevent multiple redirects
      if (redirectingRef.current) {
        return;
      }

      try {
        const userId = Cookies.get('userId');
        if (!userId) {
          if (!redirectingRef.current) {
            redirectingRef.current = true;
            window.location.href = '/auth';
          }
          return;
        }

        // Check if agentId exists in cookies or localStorage
        let agentId = Cookies.get('agentId') || localStorage.getItem('agentId');
        
        // If no agentId, try to fetch it from the API
        if (!agentId) {
          try {
            const profileResponse = await api.get(`/profiles/${userId}`);
            if (profileResponse.data && profileResponse.data.success && profileResponse.data.data) {
              const agent = profileResponse.data.data;
              agentId = agent._id;
              // Store agentId in cookies and localStorage
              if (agentId) {
                Cookies.set('agentId', agentId);
                localStorage.setItem('agentId', agentId);
                // Profile found, continue with the page
                setHasAgentId(true);
                setIsCheckingAgent(false);
              }
            } else {
              // No profile found, redirect to profile creation
              if (!redirectingRef.current) {
                redirectingRef.current = true;
                window.location.href = '/repcreationprofile';
              }
              return;
            }
          } catch (profileError: any) {
            // If 404, no profile exists, redirect to profile creation
            if (profileError.response?.status === 404) {
              if (!redirectingRef.current) {
                redirectingRef.current = true;
                window.location.href = '/repcreationprofile';
              }
              return;
            }
            console.error('Error checking agent profile:', profileError);
            // Don't redirect on other errors, but don't allow page to load
            setIsCheckingAgent(false);
            return;
          }
        } else {
          // AgentId exists
          setHasAgentId(true);
          setIsCheckingAgent(false);
        }

        // Fetch user information from User collection
        const fetchUserInfo = async () => {
          try {
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
              console.error('User endpoint not available:', userError);
              return;
            }
          } catch (error) {
            console.error('Error fetching user info:', error);
            return;
          }
        };

        fetchUserInfo();
      } catch (error) {
        console.error('Error in checkAgentProfile:', error);
      }
    };

    checkAgentProfile();
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

  // Show loading while checking agent profile
  if (isCheckingAgent || !hasAgentId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'marketplace':
        return <Marketplace />;
      case 'wallet':
        return <WalletDashboard />;
      case 'career':
        return <CareerTrack />;
      case 'operations':
        return <Operations />;
      case 'quality':
        return <QualityControl />;
      case 'subscription':
        return <Subscription />;
      case 'support':
        return <Support />;
      case 'assessment':
        return <SkillsAssessment />;
      default:
        return <Dashboard />;
    }
  };

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
            <UserCircle className="h-6 w-6" />
            <span className="text-xl font-bold">REP Orchestrator</span>
          </div>
          <button 
            className="md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6 px-4 flex flex-col h-[calc(100vh-4rem)]">
          <div className="space-y-2 flex-1 overflow-y-auto">
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'dashboard' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'profile' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <UserCircle className="h-5 w-5" />
              <span>Profile</span>
            </button>
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'marketplace' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('marketplace')}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Marketplace</span>
            </button>
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'wallet' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('wallet')}
            >
              <Wallet className="h-5 w-5" />
              <span>Wallet</span>
            </button>
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'career' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('career')}
            >
              <Award className="h-5 w-5" />
              <span>Career Track</span>
            </button>
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'operations' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('operations')}
            >
              <PhoneCall className="h-5 w-5" />
              <span>Operations</span>
            </button>
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'quality' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('quality')}
            >
              <Shield className="h-5 w-5" />
              <span>Quality Control</span>
            </button>
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'subscription' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('subscription')}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Subscription</span>
            </button>
            <button
              className={`flex w-full items-center space-x-2 rounded-lg py-2 px-3 ${
                activeTab === 'assessment' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('assessment')}
            >
              <Award className="h-5 w-5" />
              <span>Skills Assessment</span>
            </button>
          </div>
          <div className="border-t border-indigo-800 p-4 mt-auto">
            <div className="space-y-2">
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
