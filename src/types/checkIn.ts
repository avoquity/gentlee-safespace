
import React from 'react';

export interface CheckInState {
  shown: boolean;
  lastDismissed: number | null;
  dismissCount: number;
  optedIn: boolean;
  usedMoodSlider: boolean;
  moodValue: number | null;
  currentStep: 'mood' | 'optin' | 'success';
}

export type MoodValue = -2 | -1 | 0 | 1 | 2;

export interface MoodOption {
  value: MoodValue;
  icon: React.ReactNode;
  label: string;
}
