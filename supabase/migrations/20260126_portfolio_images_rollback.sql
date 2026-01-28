-- =====================================================
-- PORTFOLIO IMAGES MIGRATION ROLLBACK
-- Created: 2026-01-26
-- Purpose: Rollback the portfolio images migration
-- =====================================================

-- WARNING: This will remove the storage policies, bucket, and columns
-- Any uploaded images will become inaccessible (but not deleted)
-- Run this only if you need to revert the migration

-- =====================================================
-- REMOVE STORAGE POLICIES
-- =====================================================

-- Drop storage policies
DROP POLICY IF EXISTS "Portfolio images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload portfolio images" ON storage.objects;

-- =====================================================
-- REMOVE STORAGE BUCKET
-- =====================================================

-- Note: This will NOT delete the files, just make them inaccessible
-- To fully delete files, use Supabase Dashboard Storage interface first
DELETE FROM storage.buckets WHERE id = 'portfolio-images';

-- =====================================================
-- REMOVE TABLE COLUMNS
-- =====================================================

-- Drop index first
DROP INDEX IF EXISTS idx_portfolios_images;

-- Remove columns from portfolios table
ALTER TABLE portfolios
DROP COLUMN IF EXISTS profile_image_url,
DROP COLUMN IF EXISTS background_image_url;

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================

-- Verification query to confirm rollback:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'portfolios'
-- AND column_name IN ('profile_image_url', 'background_image_url');
-- (Should return 0 rows)
--
-- SELECT id FROM storage.buckets WHERE id = 'portfolio-images';
-- (Should return 0 rows)
