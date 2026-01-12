"use client";

import React from 'react';
import SignInDialog from '../../../components/auth/SignInDialog';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <SignInDialog
      onRegister={() => router.push('/auth/register')}
      onForgotPassword={() => router.push('/auth/forgot-password')}
    />
  );
}

