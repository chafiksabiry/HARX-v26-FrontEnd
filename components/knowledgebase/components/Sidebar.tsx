import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Search, Tag, BarChart2, Settings, Brain, Home, FileText, MessageSquare, Zap, Building, UserPlus, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { OnboardingProgress, Phase } from '../types/onboarding';

interface SidebarProps {
  progress: OnboardingProgress | null;
}

// Get the current user (in a real app, this would come from authentication)
const currentUser = mockUsers[0]; // Alex Morgan, admin at Acme Corporation

const Sidebar: React.FC<SidebarProps> = ({ progress }) => {
  const pathname = usePathname();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const isInAppMode = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_RUN_MODE || 'in-app') === 'in-app'
    : true;

  // Check if step 7 is completed using completedSteps array
  const isStep7Completed = progress?.completedSteps?.includes(7);

  // Condition plus claire : basée uniquement sur l'étape 7 comme point de basculement
  const canAccessOtherSections = !isInAppMode || (isInAppMode && isStep7Completed);
  
  // Define navigation items based on user role and progress
  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard', roles: ['admin', 'manager', 'rep'] },
    { path: '/contacts', icon: <Users size={20} />, label: 'Contacts', roles: ['admin', 'manager', 'rep'] },
    { path: '/search', icon: <Search size={20} />, label: 'AI Search', roles: ['admin', 'manager', 'rep'] },
    { path: '/upload', icon: <FileText size={20} />, label: 'Knowledge Base', roles: ['admin', 'manager', 'rep'] },
    { path: '/knowledge-insights', icon: <Brain size={20} />, label: 'KB Insights', roles: ['admin', 'manager'] },
    { path: '/knowledge-query', icon: <MessageSquare size={20} />, label: 'Ask KB', roles: ['admin', 'manager', 'rep'] },
    { path: '/script-generator', icon: <FileText size={20} />, label: 'Script Generator', roles: ['admin', 'manager', 'rep'] }, 
    { path: '/assistant', icon: <MessageSquare size={20} />, label: 'AI Assistant', roles: ['admin', 'manager', 'rep'] },
    { path: '/insights', icon: <Brain size={20} />, label: 'Contact Insights', roles: ['admin', 'manager', 'rep'] },
    { path: '/augmented-learning', icon: <Zap size={20} />, label: 'AI Learning', roles: ['admin'] },
    { path: '/tags', icon: <Tag size={20} />, label: 'Tags', roles: ['admin', 'manager'] },
    { path: '/analytics', icon: <BarChart2 size={20} />, label: 'Analytics', roles: ['admin', 'manager'] },
  ];
  
  // Admin-only items
  const adminItems = [
    { path: '/companies', icon: <Building size={20} />, label: 'Companies', roles: ['admin'] },
    { path: '/users', icon: <UserPlus size={20} />, label: 'User Management', roles: ['admin'] },
    { path: '/permissions', icon: <Shield size={20} />, label: 'Permissions', roles: ['admin'] },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings', roles: ['admin', 'manager'] },
  ];
  
  // Filter items based on user role and progress
  const filteredNavItems = navItems.filter(item => {
    const hasRole = currentUser.role && item.roles.includes(currentUser.role);
    if (item.path === '/upload') return hasRole; // Always show upload
    return hasRole && canAccessOtherSections;
  });

  const filteredAdminItems = adminItems.filter(item => {
    const hasRole = currentUser.role && item.roles.includes(currentUser.role);
    return hasRole && canAccessOtherSections;
  });

  return (
    <div className="bg-gray-800 text-white w-64 flex-shrink-0 h-screen overflow-y-auto">
      <div className="p-4 flex items-center space-x-2">
        <Brain size={24} className="text-blue-400" />
        <h1 className="text-xl font-bold">AI Knowledge Hub</h1>
      </div>
      
      <nav className="mt-4">
        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-4 py-2 text-sm ${
              pathname === item.path
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.label}</span>
          </Link>
        ))}
        
        {filteredAdminItems.length > 0 && (
          <>
            <button
              className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
            >
              <Settings size={20} />
              <span className="ml-3">Administration</span>
              {adminMenuOpen ? (
                <ChevronDown size={16} className="ml-auto" />
              ) : (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </button>
            
            {adminMenuOpen && (
              <div className="bg-gray-900">
                {filteredAdminItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-4 py-2 text-sm pl-11 ${
                      pathname === item.path
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;