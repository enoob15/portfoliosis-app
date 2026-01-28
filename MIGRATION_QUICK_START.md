# Database Migration - Quick Start Guide

## CRITICAL: Run This Before Testing

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard

### 2. Select Your Project
Project ID: `gqroacvjeiexocovjxqo`
Project URL: https://gqroacvjeiexocovjxqo.supabase.co

### 3. Navigate to SQL Editor
Click "SQL Editor" in the left sidebar

### 4. Create New Query
Click the "New query" button

### 5. Paste This SQL

```sql
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
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

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
```

### 6. Run the Query
Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)

### 7. Verify Success
You should see:
- "Success. No rows returned" or similar success message
- No error messages in red

### 8. Verify Storage Bucket Created
1. Click "Storage" in the left sidebar
2. You should see a bucket named "portfolio-images"
3. Click on it to verify it's public and configured

### 9. Verify Table Columns Added
1. Click "Table Editor" in the left sidebar
2. Select "portfolios" table
3. You should see two new columns:
   - `profile_image_url`
   - `background_image_url`

## Done!

You can now test the image upload feature at:
- http://localhost:3001/dashboard/test-image-upload
- http://localhost:3001/dashboard/portfolios/new

## If Something Goes Wrong

### Error: "relation 'portfolios' does not exist"
- The portfolios table hasn't been created yet
- Run the main application migrations first
- Check your Supabase project is correct

### Error: "bucket already exists"
- This is OK! It means the bucket was already created
- The `ON CONFLICT DO NOTHING` clause handles this
- Continue with testing

### Error: "permission denied"
- Check you're logged in to Supabase Dashboard
- Verify you have owner/admin access to the project
- Try refreshing the page and logging in again

### Storage Bucket Not Appearing
- Refresh the Supabase Dashboard page
- Click "Storage" again
- Check the "All buckets" view
- Verify the SQL ran without errors

## Need Help?

Check the full deployment report: `PRODUCTION_DEPLOYMENT_REPORT.md`
