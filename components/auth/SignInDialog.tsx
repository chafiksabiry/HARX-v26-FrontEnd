"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, RefreshCw, Linkedin } from 'lucide-react';
import axios from 'axios';
import { auth } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
//import { sendVerificationEmail } from '../../utils/aws';
import Cookies from 'js-cookie';
import { handleLinkedInSignIn } from '../../utils/Linkedin';
import { jwtDecode } from "jwt-decode";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type SignInStep = 'credentials' | '2fa' | 'success';

interface SignInDialogProps {
  onRegister: () => void;
  onForgotPassword: () => void;
}

export default function SignInDialog({ onRegister, onForgotPassword }: SignInDialogProps) {
  const { setToken } = useAuth();
  const [step, setStep] = useState<SignInStep>('credentials');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    verificationCode: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkExistingUser = async () => {
      const userId = Cookies.get('userId') || localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const hasRedirected = localStorage.getItem('hasRedirected');

      if (userId && token && !hasRedirected) {
        try {
          const checkFirstLogin = await auth.checkFirstLogin(userId);
          const checkUserType = await auth.checkUserType(userId);

          // Si l'utilisateur n'existe pas (404 géré silencieusement), nettoyer les credentials
          if (!checkFirstLogin.success || !checkUserType.success) {
            Cookies.remove('userId');
            localStorage.removeItem('userId');
            localStorage.removeItem('token');
            localStorage.removeItem('hasRedirected');
            return;
          }

          let redirectTo;

          // Extraire les valeurs depuis la structure de réponse { success: true, data: {...} }
          const isFirstLogin = checkFirstLogin.data?.isFirstLogin ?? checkFirstLogin.isFirstLogin ?? false;
          const userType = checkUserType.data?.userType ?? checkUserType.userType;

          console.log("checkExistingUser - isFirstLogin:", isFirstLogin, "userType:", userType);

          // Toujours utiliser getAuthRedirect qui vérifie automatiquement
          // si l'utilisateur a une company ou un profil rep, même si userType est null
          try {
            const { getAuthRedirect } = await import('../../utils/authRedirect');
            const redirectPath = await getAuthRedirect(userId, token);
            redirectTo = redirectPath;
            console.log("Redirecting user to:", redirectTo, "(userType:", userType, ")");
          } catch (redirectError: any) {
            console.error('Error getting redirect path:', redirectError);
            // Si erreur UNAUTHORIZED, ne pas rediriger
            if (redirectError.message === 'UNAUTHORIZED') {
              return;
            }
            // Fallback selon le type si disponible
            if (userType === 'company') {
              const compOrchestratorUrl = process.env.NEXT_PUBLIC_COMP_ORCHESTRATOR_URL || '/comporchestrator';
              redirectTo = compOrchestratorUrl;
            } else if (userType === 'rep') {
              redirectTo = '/repcreationprofile';
            } else {
              redirectTo = '/onboarding/choice';
            }
          }

          setIsAlreadyLoggedIn(true);
          setRedirectPath(redirectTo || '/');
          localStorage.setItem('hasRedirected', 'true');

          // Redirect after showing the message for 2 seconds
          setTimeout(() => {
            if (redirectTo) {
              router.push(redirectTo);
            }
          }, 2000);
        } catch (error: any) {
          // Si erreur d'authentification (401), nettoyer les credentials silencieusement
          if (error.response?.status === 401) {
            // Unauthorized - clear stale session silently
            Cookies.remove('userId');
            localStorage.removeItem('userId');
            localStorage.removeItem('token');
            localStorage.removeItem('hasRedirected');
            return;
          }
          // Pour les autres erreurs, les logger
          console.error('Error checking user type:', error);
          localStorage.removeItem('hasRedirected');
        }
      }
    };

    checkExistingUser();

    // Cleanup function to remove the redirect flag when component unmounts
    return () => {
      localStorage.removeItem('hasRedirected');
    };
  }, [router]);

  useEffect(() => {
    let timer: number;
    if (resendTimeout > 0) {
      timer = window.setInterval(() => {
        setResendTimeout(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimeout]);

  const handleResendOTP = async () => {
    if (resendTimeout > 0) return;

    setError(null);
    setIsLoading(true);

    try {
      await auth.resendVerification(formData.email);
      setResendTimeout(30); // 30 seconds cooldown
      setFormData(prev => ({ ...prev, verificationCode: '' }));
    } catch (err) {
      setError('Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (step === 'credentials') {
        if (!formData.email || !formData.password) {
          setError('Please enter both email and password.');
          return;
        }

        try {
          const result = await auth.login({ email: formData.email, password: formData.password });
          console.log("result", result);

          // Handle non-throwing errors (due to axios validateStatus < 500)
          if (result && result.success === false) {
            throw new Error(result.error || 'Login failed');
          }

          // Récupérer le code depuis la réponse du login
          // Support multiple response structures and ensure we catch it
          const loginData = result.data || result;
          const verificationCode = loginData.code || loginData.data?.code || (typeof result === 'object' ? (result as any).code : undefined);

          if (!verificationCode) {
            console.error("⚠️ Verification code not found in login response:", result);
          } else {
            console.log("✅ Verification code received:", verificationCode);
          }

          try {
            const verification = await auth.sendVerificationEmail(formData.email, verificationCode);

            // Si mode dev ou email désactivé, afficher le code
            const codeToDisplay = verification.code
              || verification.data?.code
              || verificationCode;

            const isDevMode = verification.devMode || verification.data?.devMode || process.env.NODE_ENV === 'development';

            if (isDevMode || !verification.success) {
              console.log("📧 Showing code fallback:", codeToDisplay);
              // Even in production, if we have the code but email failed, show it to prevent lockout
              // This is a temporary measure for stability
              if (codeToDisplay) {
                setError(`Verification code: ${codeToDisplay} (Email sending failed)`);
                setStep('2fa');
                setResendTimeout(30);
                return;
              }
            }

            setStep('2fa');
            setResendTimeout(30);

          } catch (emailErr: any) {
            console.error("❌ Email sending error caught:", emailErr);

            // Fallback: Always try to show the code if we have it, even in production
            // because the email service (Brevo) is blocking IPs
            if (verificationCode) {
              const errorMsg = emailErr.response?.data?.message || emailErr.message || "Email service error";

              // More user friendly message that includes the code
              setError(`Email service error: ${errorMsg}. Your ID code is: ${verificationCode}`);
              setStep('2fa');
              setResendTimeout(30);
            } else {
              setError('Failed to send verification email and code is unavailable.');
            }
          }
        } catch (err: any) {
          console.error('Login error:', err);

          // Handle different error types
          if (err.status === 503 || err.response?.status === 503) {
            setError('Database connection error. Please check if MongoDB is running and try again later.');
          } else if (err.status === 400 || err.response?.status === 400) {
            // Invalid credentials (user doesn't exist or wrong password)
            const errorMsg = err.message || err.response?.data?.error || 'Invalid email or password. Please try again.';
            setError(errorMsg);
          } else if (err.status === 401 || err.response?.status === 401) {
            // Unauthorized
            setError('Invalid email or password. Please try again.');
          } else if (err.status === 404 || err.response?.status === 404) {
            // User not found
            setError('Invalid email or password. Please try again.');
          } else if (err.message && err.message.includes('Network')) {
            // Network errors
            setError('Network error. Please check your connection and try again.');
          } else {
            // Show the actual error message if available
            const errorMessage = err.message || err.response?.data?.error || 'An error occurred. Please try again.';
            setError(errorMessage);
          }
          return;
        }
      } else if (step === '2fa') {
        if (formData.verificationCode.length !== 6) {
          setError('Please enter a valid verification code.');
          return;
        }

        const resultverificationEmail = await auth.verifyEmail({
          email: formData.email,
          code: formData.verificationCode
        });

        console.log("resultverificationEmail", resultverificationEmail);

        // Vérifier si la vérification a réussi
        if (!resultverificationEmail.success || resultverificationEmail.error) {
          setError(resultverificationEmail.error || 'Invalid email verification code');
          return;
        }

        // Si succès, continuer avec l'authentification
        if (resultverificationEmail.token) {
          // Decode the token to get the payload
          const decoded: any = jwtDecode(resultverificationEmail.token);
          // Assuming userId is in the payload, like: { userId: "12345", ... }
          const userId = decoded.userId;
          setToken(resultverificationEmail.token);
          localStorage.setItem('token', resultverificationEmail.token); // Store token in localStorage
          Cookies.set('userId', userId); // Save only the userId
          console.log("userId", Cookies.get('userId'));
          setStep('success');

          try {
            const checkFirstLogin = await auth.checkFirstLogin(userId);
            console.log("checkFirstLogin", checkFirstLogin);
            const checkUserType = await auth.checkUserType(userId);
            console.log("checkUserType", checkUserType);
            let redirectTo;

            // Extraire les valeurs depuis la structure de réponse { success: true, data: {...} }
            const isFirstLogin = checkFirstLogin.data?.isFirstLogin ?? checkFirstLogin.isFirstLogin ?? false;
            const userType = checkUserType.data?.userType ?? checkUserType.userType;

            console.log("isFirstLogin:", isFirstLogin, "userType:", userType);

            // Si l'utilisateur a déjà un type défini, rediriger selon le type (ignorer isFirstLogin)
            // Sinon, si premier login OU pas de type → rediriger vers choice page
            if (userType === 'company') {
              // Si type company → utiliser authRedirect pour vérifier les phases d'onboarding
              try {
                const { getAuthRedirect } = await import('../../utils/authRedirect');
                const redirectPath = await getAuthRedirect(userId, resultverificationEmail.token);
                redirectTo = redirectPath;
                console.log("Redirecting company user to:", redirectTo);
              } catch (redirectError: any) {
                console.error('Error getting redirect path for company:', redirectError);
                // Fallback vers orchestrator si erreur
                const compOrchestratorUrl = process.env.NEXT_PUBLIC_COMP_ORCHESTRATOR_URL || '/comporchestrator';
                redirectTo = compOrchestratorUrl;
              }
            } else if (userType === 'rep') {
              // Si type rep → rediriger vers orchestrator rep
              const repOrchestratorUrl = process.env.NEXT_PUBLIC_REP_ORCHESTRATOR_URL || '/reporchestrator';
              redirectTo = repOrchestratorUrl;
              console.log("Redirecting rep user to orchestrator:", redirectTo);
            } else {
              // Fallback vers choice si type inconnu
              redirectTo = '/onboarding/choice';
            }
            setTimeout(() => {
              if (redirectTo) {
                if (redirectTo.startsWith('http')) {
                  window.location.href = redirectTo;
                } else {
                  router.push(redirectTo);
                }
              }
            }, 1500);
          } catch (redirectErr: any) {
            console.error('Error during redirect logic:', redirectErr);
            // Ne pas afficher d'erreur si c'est juste un problème de redirection
            // L'utilisateur est déjà authentifié
          }
        } else {
          setError('Token not received from verification');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <Image
                src="/harx_ai_logo.jpeg"
                alt="HARX Logo"
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <h1 className="text-2xl font-bold text-gray-800">HARX</h1>
              <p className="text-sm text-gray-600">We inspire growth</p>
            </div>
          </div>

          {isAlreadyLoggedIn ? (
            <div className="space-y-4 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Already Logged In</h2>
              <p className="text-gray-600">You are already logged in. Redirecting you to your dashboard...</p>
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <>
              {step === 'credentials' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>

                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your password"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Remember me</span>
                      </label>

                      <button
                        onClick={onForgotPassword}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === '2fa' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">Email Verification</h2>
                  <p className="text-gray-600">We sent a 6-digit code to {formData.email}. Please enter it to complete the login process.</p>

                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.verificationCode}
                      onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '') })}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter 6-digit code"
                    />
                  </div>

                  <button
                    onClick={handleResendOTP}
                    disabled={resendTimeout > 0 || isLoading}
                    className={`w-full flex items-center justify-center space-x-2 text-sm ${resendTimeout > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                      }`}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>
                      {resendTimeout > 0
                        ? `Resend code in ${resendTimeout}s`
                        : 'Resend verification code'}
                    </span>
                  </button>
                </div>
              )}

              {step === 'success' && (
                <div className="space-y-4 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">Login Successful!</h2>
                  <p className="text-gray-600">Redirecting to dashboard...</p>
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {step === 'credentials' && (
                <div className="space-y-4">
                  <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                  >
                    {isLoading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLinkedInSignIn}
                    className="w-full flex items-center justify-center space-x-2 bg-[#0077b5] text-white py-3 px-4 rounded-lg hover:bg-[#006396] transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span>Sign in with LinkedIn</span>
                  </button>
                </div>
              )}

              {step === '2fa' && (
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    'Verify'
                  )}
                </button>
              )}

              {step === 'credentials' && (
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={onRegister}
                    className="text-blue-600 hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

