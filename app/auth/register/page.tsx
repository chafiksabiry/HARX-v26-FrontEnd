"use client";

import React, { useState } from 'react';
import RegistrationDialog from '../../../components/auth/RegistrationDialog';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <RegistrationDialog onSignIn={() => router.push('/auth')} />
  );
}

