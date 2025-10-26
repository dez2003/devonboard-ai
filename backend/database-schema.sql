-- Devonboard AI - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Organizations
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- Users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  organization_id UUID REFERENCES organizations(id),
  role TEXT CHECK (role IN ('admin', 'developer', 'viewer')) DEFAULT 'developer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Onboarding Plans
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  repository_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Onboarding Steps
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES onboarding_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  step_type TEXT CHECK (step_type IN ('setup', 'documentation', 'task', 'verification')),
  content JSONB DEFAULT '{}'::jsonb,
  dependencies UUID[] DEFAULT ARRAY[]::UUID[],
  estimated_duration INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- User Progress
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES onboarding_plans(id),
  step_id UUID REFERENCES onboarding_steps(id),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  time_spent INTEGER DEFAULT 0,
  UNIQUE(user_id, plan_id, step_id)
);

-- ============================================
-- Documentation Sources (for auto-sync)
-- ============================================
CREATE TABLE IF NOT EXISTS documentation_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  plan_id UUID REFERENCES onboarding_plans(id),
  source_type TEXT CHECK (source_type IN ('github', 'notion', 'confluence')),
  source_url TEXT NOT NULL,
  file_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_synced_at TIMESTAMP,
  last_content_hash TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Change Log (for auto-sync tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES documentation_sources(id),
  detected_at TIMESTAMP DEFAULT NOW(),
  change_type TEXT CHECK (change_type IN ('added', 'modified', 'deleted')),
  file_path TEXT,
  old_content TEXT,
  new_content TEXT,
  change_summary TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP
);

-- ============================================
-- AI Interaction Log (for analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES onboarding_plans(id),
  interaction_type TEXT CHECK (interaction_type IN ('claude', 'analysis', 'chat')),
  query TEXT,
  response TEXT,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Analytics Events
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_plan_id ON onboarding_steps(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_plan_id ON user_progress(plan_id);
CREATE INDEX IF NOT EXISTS idx_change_log_source_id ON change_log(source_id);
CREATE INDEX IF NOT EXISTS idx_change_log_processed ON change_log(processed);
CREATE INDEX IF NOT EXISTS idx_documentation_sources_org_id ON documentation_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_plans_org_id ON onboarding_plans(organization_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (Public access for now - refine in production)
-- ============================================

-- Organizations: Anyone can read
CREATE POLICY "Public read access for organizations"
  ON organizations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);

-- Users: Anyone can read
CREATE POLICY "Public read access for users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Onboarding Plans: Public access for development
CREATE POLICY "Public access for onboarding_plans"
  ON onboarding_plans FOR ALL
  USING (true);

-- Onboarding Steps: Public access for development
CREATE POLICY "Public access for onboarding_steps"
  ON onboarding_steps FOR ALL
  USING (true);

-- User Progress: Public access for development
CREATE POLICY "Public access for user_progress"
  ON user_progress FOR ALL
  USING (true);

-- Documentation Sources: Public access for development
CREATE POLICY "Public access for documentation_sources"
  ON documentation_sources FOR ALL
  USING (true);

-- Change Log: Public access for development
CREATE POLICY "Public access for change_log"
  ON change_log FOR ALL
  USING (true);

-- AI Interactions: Public access for development
CREATE POLICY "Public access for ai_interactions"
  ON ai_interactions FOR ALL
  USING (true);

-- Analytics Events: Public access for development
CREATE POLICY "Public access for analytics_events"
  ON analytics_events FOR ALL
  USING (true);

-- ============================================
-- Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for onboarding_plans
CREATE TRIGGER update_onboarding_plans_updated_at
  BEFORE UPDATE ON onboarding_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for onboarding_steps
CREATE TRIGGER update_onboarding_steps_updated_at
  BEFORE UPDATE ON onboarding_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data:
/*
INSERT INTO organizations (name, slug) VALUES
  ('Acme Corp', 'acme-corp'),
  ('TechStart Inc', 'techstart-inc');

INSERT INTO users (email, name, organization_id, role) VALUES
  ('admin@acme.com', 'Admin User', (SELECT id FROM organizations WHERE slug = 'acme-corp'), 'admin'),
  ('dev@acme.com', 'Developer User', (SELECT id FROM organizations WHERE slug = 'acme-corp'), 'developer');
*/
