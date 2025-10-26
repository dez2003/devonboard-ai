// Type definitions for Devonboard AI extension

export interface OnboardingStep {
  id: string;
  plan_id: string;
  title: string;
  description?: string;
  order_index: number;
  step_type: 'setup' | 'documentation' | 'task' | 'verification';
  content: {
    instructions: string;
    code?: string;
    commands?: string[];
    verificationSteps?: string[];
  };
  dependencies: string[];
  estimated_duration: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingPlan {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  repository_url?: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface StepProgress {
  stepId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: number;
  completedAt?: number;
  timeSpent: number; // milliseconds
}

export interface ProgressState {
  planId: string;
  steps: Record<string, StepProgress>;
}
