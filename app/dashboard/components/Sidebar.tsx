"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  Settings,
  Plug,
  Briefcase,
  ClipboardCheck,
  ScrollText,
  UserPlus,
  Building2,
  Calendar,
  DollarSign,
  ContactIcon,
  Book,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  activePanel?: string;
  setActivePanel?: (panel: string) => void;
}

export default function Sidebar({ activePanel, setActivePanel }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout } = useAuth();

  // Get hidden sections from configuration (simplified for now)
  const hiddenSections: string[] = [];

  const allMenuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', panel: 'overview', key: 'overview', route: '/company/dashboard/overview' },
    { icon: <Building2 size={20} />, label: 'Company', panel: 'company', key: 'company', route: '/company/dashboard/details' },
    { icon: <Briefcase size={20} />, label: 'Gigs', panel: 'gigs', key: 'gigs', route: '/company/dashboard/gigs' },
    { icon: <UserPlus size={20} />, label: 'Leads', panel: 'leads', key: 'leads', route: '/company/dashboard/leads' },
    { icon: <Users size={20} />, label: 'Rep Matching', panel: 'rep-matching', key: 'rep-matching', route: '/company/dashboard/rep-matching' },
    // { icon: <Phone size={20} />, label: 'Calls', panel: 'calls', key: 'calls', route: '/company/dashboard/calls' },
    // { icon: <Calendar size={20} />, label: 'Scheduler', panel: 'scheduler', key: 'scheduler', route: '/company/dashboard/scheduler' },
    { icon: <Phone size={20} />, label: 'Telnyx Call Test', panel: 'telnyx-call-test', key: 'telnyx-call-test', route: '/company/dashboard/telnyx-call-test' },
    // { icon: <Mail size={20} />, label: 'Emails', panel: 'emails', key: 'emails', route: '/company/dashboard/emails' },
    // { icon: <MessageSquare size={20} />, label: 'Live Chat', panel: 'chat', key: 'live-chat', route: '/company/dashboard/chat' },
    // { icon: <ClipboardCheck size={20} />, label: 'Quality Assurance', panel: 'quality-assurance', key: 'quality-assurance', route: '/company/dashboard/quality-assurance' },
    // { icon: <ScrollText size={20} />, label: 'Operations', panel: 'operations', key: 'operations', route: '/company/dashboard/operations' },
    // { icon: <TrendingUp size={20} />, label: 'Analytics', panel: 'analytics', key: 'analytics', route: '/company/dashboard/analytics' },
    // { icon: <Plug size={20} />, label: 'Integrations', panel: 'integrations', key: 'integrations', route: '/company/dashboard/integrations' },
    { icon: <Settings size={20} />, label: 'Settings', panel: 'settings', key: 'settings', route: '/company/dashboard/settings' },
  ];

  // Filter out hidden sections
  const menuItems = allMenuItems.filter(item => !hiddenSections.includes(item.key));

  const handlePanelChange = (route: string, panel: string) => {
    if (setActivePanel) {
      setActivePanel(panel);
    }
    router.push(route);
  };

  // Determine current panel from pathname
  const getCurrentPanel = () => {
    // First, try to use the activePanel prop if provided
    if (activePanel) return activePanel;
    
    // Otherwise, derive from pathname
    if (pathname?.startsWith('/company/dashboard/')) {
      // Remove trailing slash and extract the panel segment
      const cleanPath = pathname.replace(/\/$/, ''); // Remove trailing slash
      const panelFromPath = cleanPath.replace('/company/dashboard/', '').split('/')[0];
      
      // Map route segments to panel keys
      const routeToPanelMap: { [key: string]: string } = {
        'details': 'company',
        'overview': 'overview',
        'dashboard': 'overview',
        'rep-matching': 'rep-matching',
        'live-chat': 'chat',
        'quality-assurance': 'quality-assurance',
        'telnyx-call-test': 'telnyx-call-test',
      };
      
      const mappedPanel = routeToPanelMap[panelFromPath] || panelFromPath || 'overview';
      return mappedPanel;
    }
    
    if (pathname?.startsWith('/dashboard')) {
      const panelFromQuery = searchParams?.get('panel');
      return panelFromQuery || 'overview';
    }
    
    return 'overview';
  };

  // Use useMemo to recalculate currentPanel when pathname or activePanel changes
  const currentPanel = useMemo(() => {
    const panel = getCurrentPanel();
    if (typeof window !== 'undefined') {
      console.log('Sidebar Debug:', {
        pathname,
        calculatedPanel: panel,
        activePanel,
        pathSegment: pathname?.replace('/company/dashboard/', '').split('/')[0],
      });
    }
    return panel;
  }, [pathname, activePanel, searchParams]);

  // Force re-render when pathname changes
  useEffect(() => {
    // This ensures the component updates when navigation occurs
  }, [pathname]);

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 text-white p-4 flex flex-col">
      {/* Sidebar Header */}
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard className="w-8 h-8 text-blue-500" />
        <span className="text-xl font-bold">HARX</span>
      </div>

      {/* Scrollable Menu with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            // Normalize paths (remove trailing slashes)
            const normalizedPathname = pathname?.replace(/\/$/, '') || '';
            const normalizedRoute = item.route.replace(/\/$/, '');
            
            // Extract path segments for comparison
            const pathSegment = normalizedPathname.replace('/company/dashboard/', '').split('/')[0] || '';
            const routeSegment = normalizedRoute.replace('/company/dashboard/', '').split('/')[0] || '';
            
            // Check if current route matches exactly or starts with the item route
            const isRouteMatch = normalizedPathname === normalizedRoute || 
                                (normalizedPathname.startsWith(normalizedRoute + '/') && normalizedRoute !== '');
            
            // Check if pathname segment matches the route segment (most reliable for /company/dashboard routes)
            const isSegmentMatch = pathSegment === routeSegment && pathSegment !== '';
            
            // Check if current panel matches item panel or key
            const isPanelMatch = currentPanel === item.panel || currentPanel === item.key;
            
            // Special case: 'details' route should match 'company' panel
            const isDetailsMatch = (pathSegment === 'details' || normalizedPathname.includes('/details')) && 
                                  (item.panel === 'company' || item.key === 'company');
            
            // Combine all checks - prioritize segment match for /company/dashboard routes
            const isActive = isSegmentMatch || isRouteMatch || isPanelMatch || isDetailsMatch;
            
            // Debug for specific item (remove in production)
            if (item.panel === 'company' && typeof window !== 'undefined') {
              console.log(`Company item check:`, {
                pathSegment,
                routeSegment,
                isSegmentMatch,
                isRouteMatch,
                isPanelMatch,
                isDetailsMatch,
                currentPanel,
                itemPanel: item.panel,
                isActive,
              });
            }
            
            return (
              <button
                key={item.label}
                onClick={() => handlePanelChange(item.route, item.panel)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 text-gray-300 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Knowledge Base - Collapsible Section */}
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full p-3 rounded-lg transition-colors hover:bg-gray-800 text-gray-300 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <Book size={20} />
                <span>Knowledge Base</span>
              </div>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isExpanded && (
              <div className="ml-6 space-y-2">
                <button
                  onClick={() => handlePanelChange('/company/dashboard/knowledge', 'knowledge')}
                  className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
                    currentPanel === 'knowledge'
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-300 hover:text-white"
                  }`}
                >
                  <Book size={18} />
                  <span>Knowledge Base</span>
                </button>
                <button
                  onClick={() => handlePanelChange('/company/dashboard/kb-insight', 'kb-insight')}
                  className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors ${
                    currentPanel === 'kb-insight'
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 text-gray-300 hover:text-white"
                  }`}
                >
                  <Lightbulb size={18} />
                  <span>KB Insight</span>
                </button>
              </div>
            )}
          </div>

        </nav>
      </div>

      {/* Logout Button */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full p-3 rounded-lg transition-colors hover:bg-red-600 text-gray-300 hover:text-white"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
