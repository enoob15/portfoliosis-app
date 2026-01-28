-- =====================================================
-- PORTFOLIO IMAGES MIGRATION
-- Created: 2026-01-26
-- Purpose: Add image storage for manual portfolio creation
-- =====================================================

-- Add image URL columns to portfolios table
ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- Create index for image queries
CREATE INDEX IF NOT EXISTS idx_portfolios_images
ON portfolios(profile_image_url, background_image_url)
WHERE profile_image_url IS NOT NULL OR background_image_url IS NOT NULL;

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Users can upload their own portfolio images
CREATE POLICY "Users can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own portfolio images
CREATE POLICY "Users can update their portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own portfolio images
CREATE POLICY "Users can delete their portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Portfolio images are publicly viewable
CREATE POLICY "Portfolio images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
