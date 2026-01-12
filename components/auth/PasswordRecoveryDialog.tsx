"use client";

import React, { useState } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import { auth } from '../../lib/api';
import Image from 'next/image';

type RecoveryStep = 'email' | 'verification' | 'new-password' | 'success';

interface PasswordRecoveryDialogProps {
  onBack: () => void;
}

export default function PasswordRecoveryDialog({ onBack }: PasswordRecoveryDialogProps) {
  const [step, setStep] = useState<RecoveryStep>('email');
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    setError(null);
    
    switch (step) {
      case 'email':
        if (!formData.email) {
          setError('Please enter your email address');
          return;
        }
        try {
            const verificationCode = await auth.generateVerificationCode(formData.email);
            console.log("verificationCode", verificationCode);
            // Response structure: {success: true, data: {verificationCode: '...', result: {...}}}
            const code = verificationCode.data?.verificationCode || verificationCode.verificationCode;
            if (!code) {
              setError('Failed to generate verification code');
              return;
            }
            const verification = await auth.sendVerificationEmail(formData.email, code);
            console.log("verificationRECOVERY", verification);
            
            // Si mode dev ou email désactivé, afficher le code
            const codeToDisplay = verification.code || verification.data?.code || code;
            if (verification.devMode || verification.data?.devMode || verification.success === false) {
              const devMessage = verification.error 
                ? `Mode développement: Email non envoyé (${verification.error}). Votre code de vérification est: ${codeToDisplay}`
                : `Mode développement: Votre code de vérification est: ${codeToDisplay}. Entrez-le ci-dessous.`;
              setError(devMessage);
              console.log('📧 [DEV MODE] Verification code:', codeToDisplay);
            }
            
            setStep('verification');
        } catch (e: any) {
            // En cas d'erreur, afficher le code si disponible
            const errorMessage = e.response?.data?.error || e.message || 'Error sending verification email';
            const codeFromError = e.response?.data?.code;
            if (codeFromError) {
              setError(`Mode développement: ${errorMessage}. Votre code de vérification est: ${codeFromError}`);
              console.log('📧 [DEV MODE] Verification code (error case):', codeFromError);
            } else {
              setError(errorMessage);
            }
        }
        break;
        
      case 'verification':
        if (formData.verificationCode.length !== 6) {
          setError('Please enter a valid 6-digit code');
          return;
        }
        try {
          const resultverificationEmail = await auth.verifyEmail({
            email: formData.email,
            code: formData.verificationCode
          });
          console.log("resultverificationEmail", resultverificationEmail);
          
          if (!resultverificationEmail.success || resultverificationEmail.error) {
            setError(resultverificationEmail.error || 'Invalid email verification code');
          } else {
            // Token is available in resultverificationEmail.token if needed
            setStep('new-password');
          }
        } catch (e: any) {
          setError(e.response?.data?.error || e.message || 'Error verifying code');
        }
        break;
        
      case 'new-password':
        if (formData.newPassword.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        try {
          console.log("formData.confirmPassword", formData.confirmPassword);
          const changepassword = await auth.changePassword(formData.email, formData.confirmPassword);
          console.log("changepassword", changepassword);
          if (!changepassword.success && changepassword.error) {
            setError(changepassword.error);
            return;
          }
          setStep('success');
        } catch (e: any) {
          setError(e.response?.data?.error || e.message || 'Error changing password');
        }
        break;
        
      case 'success':
        onBack();
        break;
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

          {step === 'email' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Reset Your Password</h2>
              <p className="text-gray-600">Enter your registered email to reset your password.</p>
              
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
            </div>
          )}

          {step === 'verification' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Verify Your Identity</h2>
              <p className="text-gray-600">We sent a 6-digit code to {formData.email}. Please enter it below to verify your identity.</p>
              
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter 6-digit code"
                />
              </div>
            </div>
          )}

          {step === 'new-password' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800">Create New Password</h2>
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Password Reset Successful!</h2>
                <p className="text-gray-600">Your password has been reset successfully. You can now log in with your new password.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {step === 'success' ? 'Back to Sign In' : 'Continue'}
            </button>
            
            {step === 'email' && (
              <button
                onClick={onBack}
                className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


