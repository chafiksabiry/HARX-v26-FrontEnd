"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
}

export default function Header({ title, showLogout = true }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
      {showLogout && (
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      )}
    </header>
  );
}

