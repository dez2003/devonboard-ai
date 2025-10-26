-- Migration: Add multi-source documentation support
-- Stage 5: Prepare for pulling content from Notion, Google Docs, Confluence, Slack, etc.

-- Add new columns to documentation_sources table (if not exists)
ALTER TABLE documentation_sources
ADD COLUMN IF NOT EXISTS source_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS filter_config JSONB,
ADD COLUMN IF NOT EXISTS sync_frequency VARCHAR(20) DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Update source_type to support more platforms
ALTER TABLE documentation_sources
ALTER COLUMN source_type TYPE VARCHAR(50);

-- Create step_sources table to track which steps came from which sources
CREATE TABLE IF NOT EXISTS step_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES onboarding_steps(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES documentation_sources(id) ON DELETE CASCADE,

  -- Mapping details
  source_section VARCHAR(255), -- Section/heading in source doc
  original_content_url TEXT, -- Direct link to source content

  created_at TIMESTAMP DEFAULT NOW(),

  -- Prevent duplicate mappings
  UNIQUE(step_id, source_id)
);

-- Create source_changes table for better change tracking
CREATE TABLE IF NOT EXISTS source_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID NOT NULL REFERENCES documentation_sources(id) ON DELETE CASCADE,

  detected_at TIMESTAMP DEFAULT NOW(),
  change_type VARCHAR(20) NOT NULL, -- 'content', 'structure', 'deletion'

  old_content TEXT,
  new_content TEXT,
  diff JSONB, -- Structured diff

  -- Impact assessment
  affected_steps UUID[], -- Array of step IDs
  severity INT CHECK (severity BETWEEN 1 AND 10), -- 1-10 scale
  auto_applied BOOLEAN DEFAULT false,

  processed_at TIMESTAMP,

  -- Index for querying unprocessed changes
  INDEX idx_source_changes_processed (processed_at NULLS FIRST)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_step_sources_step_id ON step_sources(step_id);
CREATE INDEX IF NOT EXISTS idx_step_sources_source_id ON step_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_source_changes_source_id ON source_changes(source_id);
CREATE INDEX IF NOT EXISTS idx_source_changes_detected_at ON source_changes(detected_at DESC);

-- Add updated_at trigger for documentation_sources
CREATE OR REPLACE FUNCTION update_documentation_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documentation_sources_updated_at ON documentation_sources;
CREATE TRIGGER documentation_sources_updated_at
  BEFORE UPDATE ON documentation_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_documentation_sources_updated_at();

-- Add helpful comments
COMMENT ON TABLE step_sources IS 'Tracks which onboarding steps were generated from which documentation sources';
COMMENT ON TABLE source_changes IS 'Tracks changes detected in documentation sources and their impact on onboarding steps';
COMMENT ON COLUMN documentation_sources.sync_frequency IS 'How often to sync: realtime, hourly, or daily';
COMMENT ON COLUMN source_changes.severity IS 'Impact severity from 1 (minor typo) to 10 (breaking change)';
COMMENT ON COLUMN source_changes.auto_applied IS 'Whether changes were automatically applied to steps without human review';
