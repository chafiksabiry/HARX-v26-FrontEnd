"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  userId: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  setToken: () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only access localStorage on client side
    const storedToken = localStorage.getItem('token');
    setTokenState(storedToken);
  }, []);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(newToken);
  };

  const logout = () => {
    // Supprimer toutes les données de localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('agentId');
      localStorage.removeItem('zoho_token');
      localStorage.removeItem('zoho_access_token');
      
      // Supprimer tous les cookies
      Cookies.remove('token', { path: '/' });
      Cookies.remove('userId', { path: '/' });
      Cookies.remove('agentId', { path: '/' });
      Cookies.remove('gigId', { path: '/' });
      
      // Supprimer aussi avec le domaine pour être sûr
      const hostname = window.location.hostname;
      Cookies.remove('token', { path: '/', domain: hostname });
      Cookies.remove('userId', { path: '/', domain: hostname });
      Cookies.remove('agentId', { path: '/', domain: hostname });
      Cookies.remove('gigId', { path: '/', domain: hostname });
      
      // Réinitialiser l'état
      setTokenState(null);
      setUser(null);
      
      // Rediriger vers /auth
      window.location.href = '/auth';
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        if (decoded.exp * 1000 < Date.now()) {
          setToken(null);
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (error) {
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, loading, token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

