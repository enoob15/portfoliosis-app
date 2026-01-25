-- Add document tracking to portfolios
-- Created: 2026-01-24

-- =====================================================
-- DOCUMENTS TABLE (for tracking uploaded files)
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  
  -- Extracted content
  extracted_text TEXT,
  parsed_data JSONB,
  
  -- Processing status
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'parsed', 'failed')),
  error_message TEXT,
  
  -- AI processing
  ai_enhanced_data JSONB,
  enhancement_status TEXT DEFAULT 'pending' CHECK (enhancement_status IN ('pending', 'processing', 'enhanced', 'failed')),
  
  -- Metadata
  source_type TEXT NOT NULL CHECK (source_type IN ('resume', 'linkedin', 'github', 'manual')),
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_portfolio_id ON documents(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);

-- =====================================================
-- RLS POLICIES FOR DOCUMENTS
-- =====================================================

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create documents
CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- UPDATE PORTFOLIOS TABLE
-- =====================================================

-- Add document relationship to portfolios
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS primary_document_id UUID REFERENCES documents(id) ON DELETE SET NULL;

-- =====================================================
-- STORAGE BUCKET FOR DOCUMENTS
-- =====================================================

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);