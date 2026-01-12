"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();
  const { token, loading } = useAuth();

  useEffect(() => {
    // Liste des routes publiques qui ne nécessitent pas d'authentification
    const publicRoutes = ['/auth'];
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

    // Si c'est une route publique, autoriser l'accès
    if (isPublicRoute) {
      setIsAuthenticated(true);
      return;
    }

    // Vérifier l'authentification pour toutes les autres routes
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        return;
      }

      const userId = Cookies.get('userId');
      const tokenFromStorage = localStorage.getItem('token') || token;

      if (!userId || !tokenFromStorage) {
        setIsAuthenticated(false);
        // Rediriger vers /auth avec window.location.href pour forcer une redirection complète
        // Ne rien afficher pendant la redirection
        window.location.href = '/auth';
        return;
      }

      setIsAuthenticated(true);
    };

    // Attendre que le contexte d'authentification soit chargé
    if (!loading) {
      checkAuth();
    }
  }, [pathname, token, loading]);

  // Afficher rien pendant la vérification ou si non authentifié
  if (isAuthenticated === null || loading || !isAuthenticated) {
    return null;
  }

  // Si authentifié, afficher le contenu
  return <>{children}</>;
}

