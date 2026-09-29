import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';

// Page index in OnboardingQuiz -> funnel step name. Keep in sync with the
// PagerView order there and with STEPS in admin/analytics/index.html.
export const ONBOARDING_STEP_NAMES: Record<number, string> = {
  0: 'Welcome',
  1: 'Hidden Costs',
  2: 'Quiz Intro',
  3: 'Quiz: Gender',
  4: 'Quiz: Motivations',
  5: 'Quiz: Onset',
  6: 'Quiz: Escalation',
  7: 'Quiz: Frequency',
  8: 'Quiz: Triggers',
  9: 'Quiz: Attempts',
  10: 'Quiz: Motivator',
  11: 'Name Input',
  12: 'Personalizing',
  13: 'Consequences',
  14: 'Dependency Score',
  15: 'Journey Chart',
  16: 'Commitment',
  17: 'Personalized Plan',
  18: 'Paywall',
};

// Terminal events, logged with completed = true.
export const ONBOARDING_FINISHED_STEP = { index: 19, name: 'Finished Without Purchase' };
export const ONBOARDING_CONVERTED_STEP = { index: 20, name: 'Paywall Converted' };

// One id per onboarding run, so events can be grouped before the user has
// typed a name (or when two users share one).
let sessionId: string | null = null;

const getSessionId = (): string => {
  if (!sessionId) sessionId = Crypto.randomUUID();
  return sessionId;
};

export const resetOnboardingAnalyticsSession = () => {
  sessionId = null;
};

/**
 * Fire-and-forget: records one onboarding step transition in
 * `onboarding_analytics`. Never throws and never blocks the UI.
 */
export const logOnboardingStep = (
  stepName: string,
  stepIndex: number,
  userName: string,
  completed = false,
): void => {
  const row = {
    session_id: getSessionId(),
    user_name: userName.trim() || null,
    step_index: stepIndex,
    step_name: stepName,
    completed,
    timestamp: new Date().toISOString(),
  };

  supabase
    .from('onboarding_analytics')
    .insert(row)
    .then(({ error }) => {
      if (error && __DEV__) console.warn('onboarding analytics insert failed:', error.message);
    }, () => {});
};
