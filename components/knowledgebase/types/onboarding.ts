import React from 'react';

export interface OnboardingProgress {
  currentPhase?: number;
  completedSteps?: number[];
  phases?: {
    id: number;
    status: 'pending' | 'in_progress' | 'completed';
    steps?: {
      id: number;
      status: 'pending' | 'in_progress' | 'completed';
      completedAt?: Date;
    }[];
  }[];
}

export interface Phase {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  steps: any[];
}
