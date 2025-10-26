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
  source_type: 'github' | 'notion' | 'confluence' | 'gdocs' | 'slack' | 'linear';
  source_url: string;
  source_name?: string;
  file_paths: string[];
  filter_config?: Record<string, any>; // Source-specific filters/queries
  is_active: boolean;
  last_synced_at?: string;
  last_content_hash?: string;
  sync_frequency: 'realtime' | 'hourly' | 'daily';
  created_at: string;
  updated_at?: string;
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

// Track which onboarding steps came from which sources
export interface StepSource {
  id: string;
  step_id: string;
  source_id: string;
  source_section?: string; // Section/heading in source doc
  original_content_url?: string; // Direct link to source
  created_at: string;
}

// Enhanced change detection and history
export interface SourceChange {
  id: string;
  source_id: string;
  detected_at: string;
  change_type: 'content' | 'structure' | 'deletion';
  old_content?: string;
  new_content?: string;
  diff?: Record<string, any>; // Structured diff
  affected_steps: string[]; // Array of step IDs
  severity: number; // 1-10
  auto_applied: boolean;
  processed_at?: string;
}

// Extended OnboardingStep with source information
export interface OnboardingStepWithSources extends OnboardingStep {
  sources?: {
    type: DocumentationSource['source_type'];
    name: string;
    url: string;
    section?: string;
  }[];
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
