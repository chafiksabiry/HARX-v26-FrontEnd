import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const { logout } = useAuth();
  // Utilisation de NEXT_PUBLIC_FRONT_URL pour le logo
  const frontUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_FRONT_URL || window.location.origin)
    : process.env.NEXT_PUBLIC_FRONT_URL || '';
  const logoUrl = `${frontUrl}/logo_harx.jpg`;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src={logoUrl} 
            alt="Harx Logo" 
            className="h-8 w-auto"
            onError={(e) => {
              // Fallback si l'image ne charge pas
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <div className="hidden text-xl font-bold text-gray-800 ml-2">
            <span className="text-blue-600">HARX</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Se déconnecter"
        >
          <LogOut size={18} className="mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header; 