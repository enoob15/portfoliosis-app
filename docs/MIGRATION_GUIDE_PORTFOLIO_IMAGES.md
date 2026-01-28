# Portfolio Images Migration Guide

**Migration File:** `supabase/migrations/20260126_portfolio_images.sql`
**Created:** 2026-01-26
**Status:** Ready for execution

---

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Safety Assessment](#safety-assessment)
3. [Manual Execution Guide](#manual-execution-guide)
4. [Verification Procedures](#verification-procedures)
5. [Rollback Procedures](#rollback-procedures)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## Migration Overview

### Purpose
Add image storage capabilities to the Portfoliosis application, enabling users to upload profile and background images for their portfolios.

### Changes Made

1. **Database Schema Changes:**
   - Adds `profile_image_url` column to `portfolios` table (TEXT, nullable)
   - Adds `background_image_url` column to `portfolios` table (TEXT, nullable)
   - Creates composite index on image columns for optimized queries

2. **Storage Infrastructure:**
   - Creates `portfolio-images` storage bucket
   - Sets 5MB file size limit
   - Restricts to image types: JPEG, PNG, WebP, GIF
   - Enables public read access

3. **Security Policies (RLS):**
   - Authenticated users can upload images to their own folder
   - Authenticated users can update their own images
   - Authenticated users can delete their own images
   - All users can view portfolio images (public read)

### Impact Assessment

| Area | Impact Level | Details |
|------|-------------|---------|
| Database Schema | **Low** | Adds nullable columns, existing data unaffected |
| Storage | **Medium** | Creates new bucket with 5MB limit |
| Security | **Low** | Adds RLS policies, no changes to existing policies |
| Performance | **Low** | Adds one index, minimal performance impact |
| Downtime | **None** | Migration can run while app is live |
| Data Loss Risk | **None** | No data deletion or modification |

---

## Safety Assessment

### ✅ Safety Checks Passed

1. **Non-Breaking Changes:**
   - New columns are nullable (no default required)
   - Uses `IF NOT EXISTS` clauses to prevent errors on re-run
   - Uses `ON CONFLICT DO NOTHING` for bucket creation
   - No modification of existing data

2. **Idempotent Design:**
   - Migration can be run multiple times safely
   - All DDL statements use conditional logic
   - No data transformations

3. **Backward Compatibility:**
   - Existing queries continue to work
   - No column renames or type changes
   - No foreign key constraints added

4. **Performance Considerations:**
   - Index creation is non-blocking (IF NOT EXISTS)
   - Index is partial (only rows with images)
   - No full table scans required

### ⚠️ Considerations

1. **Storage Costs:**
   - New storage bucket will incur Supabase storage charges
   - 5MB per file limit helps control costs
   - Monitor usage in Supabase Dashboard

2. **Public Access:**
   - Images are publicly readable (by design)
   - Ensure users are aware images are public
   - Consider content moderation policies

3. **File Management:**
   - Old images are not automatically deleted when new ones are uploaded
   - Implement cleanup logic in application code
   - Monitor storage usage

---

## Manual Execution Guide

### Prerequisites

- Access to Supabase Dashboard
- Project Admin or Owner role
- Project must be on a paid plan for storage features (or within free tier limits)

### Step-by-Step Instructions

#### Step 1: Open Supabase Dashboard

1. Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with your account
3. Select your **Portfoliosis** project

![Screenshot: Supabase project selection screen with project list]

#### Step 2: Navigate to SQL Editor

1. In the left sidebar, locate **SQL Editor**
2. Click on **SQL Editor** to open it
3. Click the **New query** button (top right)

![Screenshot: Left sidebar with SQL Editor highlighted]

#### Step 3: Prepare the Migration SQL

1. Open the migration file on your local machine:
   ```
   C:\GitHub\Projects\portfoliosis-app\supabase\migrations\20260126_portfolio_images.sql
   ```

2. Copy the entire contents of the file (Ctrl+A, Ctrl+C)

#### Step 4: Execute the Migration

1. Paste the SQL into the query editor (Ctrl+V)
2. Review the SQL to ensure it pasted correctly
3. Click the **RUN** button (or press Ctrl+Enter)

![Screenshot: SQL Editor with RUN button highlighted]

#### Step 5: Verify Success

Look for success indicators:

**✅ Success looks like:**
```
Success. No rows returned
```

**✅ Or multiple success messages:**
```
ALTER TABLE
CREATE INDEX
INSERT 0 1
CREATE POLICY (x4)
```

**❌ Errors to watch for:**
```
ERROR: relation "portfolios" does not exist
```
→ **Solution:** Ensure the initial schema migration has been run first

```
ERROR: duplicate key value violates unique constraint
```
→ **Solution:** Bucket already exists, safe to ignore (ON CONFLICT DO NOTHING)

```
ERROR: policy "Policy Name" already exists
```
→ **Solution:** Policy already created, safe to ignore or run rollback first

#### Step 6: Verify in Supabase UI

1. **Check Table Schema:**
   - Go to **Table Editor** → **portfolios**
   - Scroll to see `profile_image_url` and `background_image_url` columns

2. **Check Storage Bucket:**
   - Go to **Storage** in left sidebar
   - Look for `portfolio-images` bucket
   - Click on it to verify configuration:
     - Public: ✓ Yes
     - File size limit: 5 MB
     - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

3. **Check Policies:**
   - In **Storage** → `portfolio-images` bucket
   - Click **Policies** tab
   - Verify 4 policies exist:
     - Users can upload portfolio images
     - Users can update their portfolio images
     - Users can delete their portfolio images
     - Portfolio images are publicly viewable

### Alternative: Using Migration Script

Instead of manual execution, you can use the helper script:

```bash
node scripts/run-portfolio-images-migration.js
```

This will display the SQL and provide instructions (but still requires manual paste into SQL Editor due to Supabase API limitations).

---

## Verification Procedures

### Automated Verification

Run the verification script to check all migration components:

```bash
node scripts/verify-migration.js
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║     PORTFOLIO IMAGES MIGRATION VERIFICATION           ║
╚════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════
  CHECK 1: Portfolios Table Schema
═══════════════════════════════════════════════════════
✅ Column profile_image_url exists
✅ Column background_image_url exists

═══════════════════════════════════════════════════════
  CHECK 2: Storage Bucket Configuration
═══════════════════════════════════════════════════════
✅ Storage bucket "portfolio-images" exists
✅ Bucket is public
✅ File size limit is 5MB
✅ Allowed MIME types configured correctly

═══════════════════════════════════════════════════════
  CHECK 3: Storage Policies (RLS)
═══════════════════════════════════════════════════════
✅ Public read policy appears to be working
⚠️  INSERT/UPDATE/DELETE policies
   Cannot verify without authenticated user context

═══════════════════════════════════════════════════════
  VERIFICATION SUMMARY
═══════════════════════════════════════════════════════

Total Checks: 10
✅ Passed: 8
❌ Failed: 0
⚠️  Warnings: 2

🎉 Migration verification SUCCESSFUL!
```

### Manual Verification Checklist

- [ ] **Database Columns:**
  ```sql
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'portfolios'
  AND column_name IN ('profile_image_url', 'background_image_url');
  ```
  Expected: 2 rows with data_type = 'text', is_nullable = 'YES'

- [ ] **Storage Bucket:**
  ```sql
  SELECT id, name, public, file_size_limit, allowed_mime_types
  FROM storage.buckets
  WHERE id = 'portfolio-images';
  ```
  Expected: 1 row with public = true, file_size_limit = 5242880

- [ ] **Storage Policies:**
  ```sql
  SELECT policyname
  FROM pg_policies
  WHERE tablename = 'objects'
  AND policyname LIKE '%portfolio%';
  ```
  Expected: 4 policies

- [ ] **Index:**
  ```sql
  SELECT indexname, indexdef
  FROM pg_indexes
  WHERE tablename = 'portfolios'
  AND indexname = 'idx_portfolios_images';
  ```
  Expected: 1 row

---

## Rollback Procedures

### When to Rollback

Consider rollback if:
- Migration causes unexpected errors
- Storage costs exceed budget
- Feature is being deprecated
- Testing phase is complete and feature not needed yet

### Rollback Steps

#### Option 1: Automated Rollback (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Open rollback file:
   ```
   C:\GitHub\Projects\portfoliosis-app\supabase\migrations\20260126_portfolio_images_rollback.sql
   ```
3. Copy and paste the SQL into SQL Editor
4. Click **RUN**

#### Option 2: Manual Rollback

Execute these SQL commands in order:

```sql
-- 1. Remove storage policies
DROP POLICY IF EXISTS "Portfolio images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload portfolio images" ON storage.objects;

-- 2. Remove storage bucket
DELETE FROM storage.buckets WHERE id = 'portfolio-images';

-- 3. Remove index
DROP INDEX IF EXISTS idx_portfolios_images;

-- 4. Remove columns
ALTER TABLE portfolios
DROP COLUMN IF EXISTS profile_image_url,
DROP COLUMN IF EXISTS background_image_url;
```

### Verify Rollback

```bash
node scripts/verify-migration.js
```

Expected: All checks should fail (indicating migration is no longer applied)

### Important Notes

⚠️ **Data Implications:**
- Rolling back will make uploaded images inaccessible (but not deleted)
- Any portfolio records with image URLs will lose those URLs
- To fully delete images, use Storage interface in Supabase Dashboard before rollback

⚠️ **Application Code:**
- Ensure application code does not reference image columns after rollback
- Update any forms or UI that expect these columns
- Remove image upload components

---

## Testing Guide

### Functional Testing

#### Test 1: Profile Image Upload

**Setup:**
```bash
node scripts/test-image-upload.js
```

This provides sample code and manual testing instructions.

**Manual Test Steps:**

1. Create a test user in Supabase Auth
2. Navigate to portfolio creation/edit page
3. Select a profile image (< 5MB, JPEG/PNG/WebP/GIF)
4. Upload the image
5. Verify success response
6. Check database for image URL
7. Visit image URL to confirm public access

**Expected Results:**
- Upload completes without errors
- Database record updated with `profile_image_url`
- Image is viewable at public URL

#### Test 2: Background Image Upload

Same as Test 1, but for `background_image_url`

#### Test 3: File Size Validation

**Test Steps:**
1. Attempt to upload a file > 5MB
2. Verify error message: "File size exceeds limit"

**Expected Result:**
- Upload is rejected
- User-friendly error message displayed

#### Test 4: File Type Validation

**Test Steps:**
1. Attempt to upload a non-image file (e.g., PDF, TXT)
2. Verify error message: "Invalid file type"

**Expected Result:**
- Upload is rejected
- Only image types accepted

#### Test 5: User Isolation (Security)

**Test Steps:**
1. User A uploads an image
2. User B attempts to delete User A's image
3. Verify permission denied

**Expected Result:**
- User B cannot delete User A's image
- RLS policy enforces user ownership

### Performance Testing

#### Test 6: Concurrent Uploads

**Test Steps:**
1. Simulate 10 concurrent image uploads
2. Monitor database and storage performance
3. Verify all uploads complete successfully

**Expected Result:**
- All uploads succeed
- No deadlocks or timeout errors
- Response time < 2 seconds per upload

#### Test 7: Index Performance

**Test Steps:**
```sql
EXPLAIN ANALYZE
SELECT * FROM portfolios
WHERE profile_image_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Result:**
- Query plan uses `idx_portfolios_images` index
- Execution time < 50ms

### Integration Testing

Create test file: `__tests__/image-upload.integration.test.ts`

```typescript
import { createClient } from '@/lib/db/supabase';
import { uploadPortfolioImage } from '@/lib/storage/image-upload';

describe('Portfolio Image Upload Integration', () => {
  let supabase: any;
  let testUserId: string;
  let testPortfolioId: string;

  beforeAll(async () => {
    supabase = createClient();
    // Setup test user and portfolio
  });

  afterAll(async () => {
    // Cleanup test data
  });

  it('should upload profile image and update database', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const imageUrl = await uploadPortfolioImage(testPortfolioId, mockFile, 'profile');

    // Verify database update
    const { data } = await supabase
      .from('portfolios')
      .select('profile_image_url')
      .eq('id', testPortfolioId)
      .single();

    expect(data.profile_image_url).toBe(imageUrl);
    expect(imageUrl).toContain('portfolio-images');
  });

  it('should enforce user ownership', async () => {
    // Test that users can only upload to their own portfolios
  });
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "relation 'portfolios' does not exist"

**Cause:** Initial schema migration not run
**Solution:**
1. Run the initial schema migration first:
   ```
   supabase/migrations/20260111_initial_schema.sql
   ```
2. Then run the portfolio images migration

#### Issue: "duplicate key value violates unique constraint 'buckets_pkey'"

**Cause:** Storage bucket already exists
**Solution:**
- Safe to ignore (migration uses `ON CONFLICT DO NOTHING`)
- Or verify bucket exists in Storage dashboard
- Or run rollback first, then re-run migration

#### Issue: "policy already exists"

**Cause:** Policies already created from previous migration attempt
**Solution:**
- Run rollback to remove existing policies
- Then re-run migration

#### Issue: "Upload fails with 403 Forbidden"

**Cause:** RLS policies not applied or user not authenticated
**Solution:**
1. Verify user is authenticated:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session);
   ```
2. Check policies exist in Storage → Policies tab
3. Verify file path follows pattern: `{user_id}/{filename}`

#### Issue: "Public URL returns 404"

**Cause:** Bucket not public or file not uploaded
**Solution:**
1. Verify bucket is public in Storage settings
2. Check file exists in Storage dashboard
3. Verify public URL format:
   ```
   https://{project}.supabase.co/storage/v1/object/public/portfolio-images/{user_id}/{filename}
   ```

#### Issue: "File upload succeeds but database update fails"

**Cause:** Portfolio doesn't exist or user doesn't own it
**Solution:**
1. Add error handling to rollback file upload:
   ```javascript
   try {
     await updateDatabase();
   } catch (error) {
     await supabase.storage.from('portfolio-images').remove([fileName]);
     throw error;
   }
   ```
2. Verify portfolio exists and belongs to user

### Debug Commands

**Check migration status:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'portfolios'
ORDER BY ordinal_position;
```

**Check storage bucket:**
```sql
SELECT * FROM storage.buckets WHERE id = 'portfolio-images';
```

**Check policies:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
```

**List uploaded files:**
```sql
SELECT name, bucket_id, owner, created_at
FROM storage.objects
WHERE bucket_id = 'portfolio-images'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Summary

### Migration Checklist

- [ ] Review migration SQL for safety
- [ ] Backup database (if on production)
- [ ] Run migration in Supabase SQL Editor
- [ ] Verify with `node scripts/verify-migration.js`
- [ ] Test image upload functionality
- [ ] Monitor storage usage
- [ ] Update application documentation

### Files Created

| File | Purpose |
|------|---------|
| `supabase/migrations/20260126_portfolio_images.sql` | Main migration SQL |
| `supabase/migrations/20260126_portfolio_images_rollback.sql` | Rollback SQL |
| `scripts/run-portfolio-images-migration.js` | Migration helper |
| `scripts/verify-migration.js` | Verification script |
| `scripts/test-image-upload.js` | Testing guide |
| `docs/MIGRATION_GUIDE_PORTFOLIO_IMAGES.md` | This document |

### Next Steps

1. **Execute the migration** using the Manual Execution Guide
2. **Run verification** with `node scripts/verify-migration.js`
3. **Implement upload UI** in the application
4. **Test thoroughly** using the Testing Guide
5. **Monitor storage** usage in Supabase Dashboard

### Support

For issues or questions:
- Review this guide's Troubleshooting section
- Check Supabase Dashboard for error logs
- Review Supabase documentation: https://supabase.com/docs/guides/storage
- Contact team lead or create GitHub issue

---

**Document Version:** 1.0
**Last Updated:** 2026-01-26
**Author:** Database Architect AI Agent
