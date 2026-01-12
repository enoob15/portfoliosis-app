-- Portfoliosis Initial Database Schema
-- Created: 2026-01-11
-- Author: Devon Cross (CTO)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PORTFOLIOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'tech-professional',

  -- Source data (from various imports)
  resume_data JSONB,
  linkedin_data JSONB,
  github_data JSONB,
  manual_data JSONB,

  -- AI-enhanced profile data
  enhanced_profile JSONB NOT NULL DEFAULT '{}',

  -- Design customization
  customization JSONB DEFAULT '{}',
  theme JSONB DEFAULT '{}',

  -- Deployment configuration
  deployment_config JSONB,
  deployment_url TEXT,
  custom_domain TEXT,

  -- Status and visibility
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_public BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for portfolios
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON portfolios(status);

-- =====================================================
-- AI JOBS TABLE (for tracking AI processing)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  job_type TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for ai_jobs
CREATE INDEX IF NOT EXISTS idx_ai_jobs_portfolio_id ON ai_jobs(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_created_at ON ai_jobs(created_at);

-- =====================================================
-- PORTFOLIO VERSIONS TABLE (for version history)
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portfolio_id, version_number)
);

-- Indexes for portfolio_versions
CREATE INDEX IF NOT EXISTS idx_portfolio_versions_portfolio_id ON portfolio_versions(portfolio_id);

-- =====================================================
-- TEMPLATES TABLE (for predefined portfolio templates)
-- =====================================================
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  preview_url TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default templates
INSERT INTO templates (id, name, description, category, config) VALUES
  ('tech-professional', 'Tech Professional', 'Clean, modern design for software engineers and tech professionals', 'technology', '{"colors": {"primary": "#3B82F6", "secondary": "#1E40AF"}, "layout": "modern"}'),
  ('creative-director', 'Creative Director', 'Bold, visual portfolio for designers and creative professionals', 'creative', '{"colors": {"primary": "#EC4899", "secondary": "#BE185D"}, "layout": "visual"}'),
  ('business-executive', 'Business Executive', 'Professional, corporate design for executives and business leaders', 'business', '{"colors": {"primary": "#059669", "secondary": "#047857"}, "layout": "corporate"}'),
  ('academic-researcher', 'Academic Researcher', 'Scholarly design for researchers and academics', 'academic', '{"colors": {"primary": "#7C3AED", "secondary": "#6D28D9"}, "layout": "publications"}'),
  ('freelancer', 'Freelancer', 'Versatile portfolio for freelancers and consultants', 'general', '{"colors": {"primary": "#F59E0B", "secondary": "#D97706"}, "layout": "projects"}')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PORTFOLIO ANALYTICS TABLE (for tracking views/engagement)
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  visitor_id TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_event_type ON portfolio_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_created_at ON portfolio_analytics(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on portfolios table
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Users can view their own portfolios
CREATE POLICY "Users can view their own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create portfolios
CREATE POLICY "Users can create portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolios
CREATE POLICY "Users can update their own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own portfolios
CREATE POLICY "Users can delete their own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Public portfolios are viewable by everyone
CREATE POLICY "Public portfolios are viewable by everyone"
  ON portfolios FOR SELECT
  USING (is_public = true);

-- Enable RLS on ai_jobs table
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view AI jobs for their portfolios
CREATE POLICY "Users can view AI jobs for their portfolios"
  ON ai_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = ai_jobs.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Enable RLS on portfolio_versions
ALTER TABLE portfolio_versions ENABLE ROW LEVEL SECURITY;

-- Users can view versions for their portfolios
CREATE POLICY "Users can view versions for their portfolios"
  ON portfolio_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_versions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Templates are viewable by everyone
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates are viewable by everyone"
  ON templates FOR SELECT
  USING (is_active = true);

-- Analytics can be viewed by portfolio owners
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view analytics for their portfolios"
  ON portfolio_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_analytics.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for portfolios table
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON portfolios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS (for file uploads)
-- =====================================================

-- Create storage bucket for portfolio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolios', 'portfolios', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio files
CREATE POLICY "Users can upload portfolio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolios' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their portfolio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolios' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their portfolio files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolios' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Portfolio files are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
