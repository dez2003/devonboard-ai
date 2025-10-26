// Core type definitions for Devonboard AI

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  settings?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  organization_id?: string;
  role: 'admin' | 'developer' | 'viewer';
  created_at: string;
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
  estimated_duration: number; // in minutes
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  plan_id: string;
  step_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  notes?: string;
  time_spent: number; // in minutes
}

export interface DocumentationSource {
  id: string;
  organization_id: string;
  plan_id: string;
  source_type: 'github' | 'notion' | 'confluence';
  source_url: string;
  file_paths: string[];
  last_synced_at?: string;
  last_content_hash?: string;
  is_active: boolean;
  config?: Record<string, any>;
  created_at: string;
}

export interface ChangeLog {
  id: string;
  source_id: string;
  detected_at: string;
  change_type: 'added' | 'modified' | 'deleted';
  file_path: string;
  old_content?: string;
  new_content?: string;
  change_summary?: string;
  processed: boolean;
  processed_at?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Repository Analysis types (for Claude integration)
export interface RepositoryAnalysis {
  techStack: {
    languages: string[];
    frameworks: string[];
    tools: string[];
  };
  structure: {
    type: 'monorepo' | 'microservices' | 'standard';
    mainDirectories: string[];
    entryPoints: string[];
  };
  dependencies: {
    runtime: Record<string, string>;
    dev: Record<string, string>;
  };
  setupRequirements: {
    environment: string[];
    services: string[];
    credentials: string[];
  };
  onboardingSteps?: Partial<OnboardingStep>[];
}
