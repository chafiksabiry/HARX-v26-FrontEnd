"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignInDialog from '../../components/auth/SignInDialog';
import RegistrationDialog from '../../components/auth/RegistrationDialog';
import PasswordRecoveryDialog from '../../components/auth/PasswordRecoveryDialog';
import { AuthProvider } from '../../context/AuthContext';
import { checkAndRedirect } from '../../utils/authRedirect';
import Cookies from 'js-cookie';

function AuthPageContent() {
  const [view, setView] = useState<'signin' | 'register' | 'recovery'>('signin');
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const redirectPath = await checkAndRedirect();
        if (redirectPath) {
          // Vérifier que nous ne sommes pas déjà sur la page de destination
          const currentPath = window.location.pathname;
          if (currentPath !== redirectPath && !currentPath.startsWith(redirectPath)) {
            console.log("User already authenticated, redirecting to:", redirectPath);
            router.push(redirectPath);
          } else {
            setIsChecking(false);
          }
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsChecking(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {view === 'signin' && (
        <SignInDialog
          onRegister={() => setView('register')}
          onForgotPassword={() => setView('recovery')}
        />
      )}
      {view === 'register' && (
        <RegistrationDialog onSignIn={() => setView('signin')} />
      )}
      {view === 'recovery' && (
        <PasswordRecoveryDialog onBack={() => setView('signin')} />
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <AuthProvider>
      <AuthPageContent />
    </AuthProvider>
  );
}


