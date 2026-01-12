import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  Phone,
  BookOpen,
  UserCheck,
  Target
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  activePanel: string;
  setActivePanel: (panel: string) => void;
  user: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activePanel, setActivePanel, user }) => {
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const type = Cookies.get('userType');
    setUserType(type || null);
  }, []);

  const commonItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gigs', label: 'My Gigs', icon: Briefcase },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const companyItems = [
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'matching', label: 'Smart Matching', icon: Target },
    { id: 'agents', label: 'Agents', icon: UserCheck },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  ];

  const menuItems = userType === 'company' 
    ? [...commonItems.slice(0, 2), ...companyItems, ...commonItems.slice(2)]
    : commonItems;

  // Deduplicate items just in case
  const uniqueItems = Array.from(new Map(menuItems.map(item => [item.id, item])).values());

  const handleLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('token');
    Cookies.remove('userType');
    Cookies.remove('companyId');
    router.push('/auth');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
         <div className="relative w-32 h-10">
            <Image 
                src="/harx-blanc.jpg" 
                alt="Harx Logo" 
                fill
                className="object-contain object-left"
                priority
            />
         </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {user?.personalInfo?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.personalInfo?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            {userType && (
                <p className="text-xs text-blue-600 font-medium capitalize mt-1">{userType} Account</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {uniqueItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
