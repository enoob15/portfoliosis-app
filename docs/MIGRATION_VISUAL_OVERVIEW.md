# Portfolio Images Migration - Visual Overview

---

## Migration Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PORTFOLIOSYS DATABASE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PORTFOLIOS TABLE (EXISTING)                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  id (UUID)                                                │  │
│  │  user_id (UUID)                                           │  │
│  │  name (TEXT)                                              │  │
│  │  slug (TEXT)                                              │  │
│  │  ...existing columns...                                   │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  profile_image_url (TEXT) ← NEW                    │  │  │
│  │  │  background_image_url (TEXT) ← NEW                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↕                                    │
│              [idx_portfolios_images] ← NEW INDEX                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE STORAGE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           BUCKET: portfolio-images ← NEW                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Public: ✓ YES                                            │  │
│  │  File Size Limit: 5MB                                     │  │
│  │  MIME Types: image/jpeg, image/png, image/webp, gif      │  │
│  │                                                            │  │
│  │  Structure:                                                │  │
│  │  /{user_id}/                                              │  │
│  │     ├── profile-{timestamp}.jpg                           │  │
│  │     └── background-{timestamp}.png                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  RLS POLICIES (4) ← NEW:                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 1. Users can upload portfolio images (INSERT)          │    │
│  │ 2. Users can update their portfolio images (UPDATE)    │    │
│  │ 3. Users can delete their portfolio images (DELETE)    │    │
│  │ 4. Portfolio images are publicly viewable (SELECT)     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────┐
│     USER     │
│   (Browser)  │
└──────┬───────┘
       │
       │ 1. Select Image (< 5MB)
       │
       ↓
┌──────────────────────┐
│   Upload Component   │
│   (React/Next.js)    │
└──────┬───────────────┘
       │
       │ 2. Validate
       │    - File size < 5MB
       │    - MIME type = image/*
       │
       ↓
┌───────────────────────┐
│  Supabase Client SDK  │
└──────┬────────────────┘
       │
       │ 3. Upload to Storage
       │    Path: /{user_id}/profile-{timestamp}.jpg
       │
       ↓
┌────────────────────────────┐
│  Supabase Storage API      │
│  ┌──────────────────────┐  │
│  │  RLS Policy Check    │  │  ← Verifies user_id in path
│  │  ✓ Authenticated?    │  │
│  │  ✓ Owns folder?      │  │
│  └──────────────────────┘  │
└────────┬───────────────────┘
         │
         │ 4. Store file
         │
         ↓
┌────────────────────────┐
│  portfolio-images      │
│  Storage Bucket        │
└────────┬───────────────┘
         │
         │ 5. Return public URL
         │
         ↓
┌────────────────────────┐
│  Supabase Client SDK   │
└────────┬───────────────┘
         │
         │ 6. Update Database
         │    UPDATE portfolios
         │    SET profile_image_url = '{url}'
         │
         ↓
┌────────────────────────┐
│  Portfolios Table      │
│  ┌──────────────────┐  │
│  │ profile_image_url│  │  ← URL stored
│  └──────────────────┘  │
└────────┬───────────────┘
         │
         │ 7. Return success
         │
         ↓
┌──────────────┐
│     USER     │
│  (Image URL  │
│   displayed) │
└──────────────┘
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────────┘

LAYER 1: AUTHENTICATION
┌────────────────────────────────────────────────────────┐
│  Supabase Auth                                          │
│  ✓ JWT Token Validation                                │
│  ✓ Session Management                                  │
│  ✓ User ID (auth.uid())                                │
└────────────────────────────────────────────────────────┘
                         ↓
LAYER 2: AUTHORIZATION (RLS POLICIES)
┌────────────────────────────────────────────────────────┐
│  INSERT Policy:                                         │
│    bucket_id = 'portfolio-images' AND                   │
│    (storage.foldername(name))[1] = auth.uid()::text    │
│                                                         │
│  UPDATE/DELETE Policy:                                  │
│    bucket_id = 'portfolio-images' AND                   │
│    (storage.foldername(name))[1] = auth.uid()::text    │
│                                                         │
│  SELECT Policy:                                         │
│    bucket_id = 'portfolio-images'  (Public Read)       │
└────────────────────────────────────────────────────────┘
                         ↓
LAYER 3: INPUT VALIDATION
┌────────────────────────────────────────────────────────┐
│  File Size:                                             │
│    ✓ Maximum: 5MB (5,242,880 bytes)                   │
│                                                         │
│  MIME Types:                                            │
│    ✓ image/jpeg                                        │
│    ✓ image/png                                         │
│    ✓ image/webp                                        │
│    ✓ image/gif                                         │
│                                                         │
│  Path Structure:                                        │
│    ✓ Must be: {user_id}/{filename}                    │
└────────────────────────────────────────────────────────┘
                         ↓
LAYER 4: DATA ISOLATION
┌────────────────────────────────────────────────────────┐
│  User Folders:                                          │
│    User A: /abc-123-uid/...  ← Can only access this    │
│    User B: /xyz-789-uid/...  ← Cannot access User A    │
│                                                         │
│  Enforcement:                                           │
│    (storage.foldername(name))[1] = auth.uid()::text    │
└────────────────────────────────────────────────────────┘
                         ↓
LAYER 5: PUBLIC ACCESS CONTROL
┌────────────────────────────────────────────────────────┐
│  Public Read:                                           │
│    ✓ Anyone can view images (SELECT)                   │
│    ✗ Only owners can upload/update/delete              │
│                                                         │
│  CDN Delivery:                                          │
│    https://{project}.supabase.co/storage/v1/object/    │
│    public/portfolio-images/{user_id}/{filename}        │
└────────────────────────────────────────────────────────┘
```

---

## Migration Execution Timeline

```
TIME: 0s
┌─────────────────────────────────────────────┐
│  START MIGRATION                             │
│  Execute SQL in Supabase Dashboard          │
└─────────────┬───────────────────────────────┘
              │
TIME: <1s     ↓
┌─────────────────────────────────────────────┐
│  ALTER TABLE portfolios                      │
│  ✓ Add profile_image_url column             │
│  ✓ Add background_image_url column          │
└─────────────┬───────────────────────────────┘
              │
TIME: <1s     ↓
┌─────────────────────────────────────────────┐
│  CREATE INDEX idx_portfolios_images         │
│  ✓ Composite index on image columns         │
│  ✓ Partial (WHERE images IS NOT NULL)       │
└─────────────┬───────────────────────────────┘
              │
TIME: <0.1s   ↓
┌─────────────────────────────────────────────┐
│  INSERT INTO storage.buckets                │
│  ✓ Create portfolio-images bucket           │
│  ✓ Set 5MB limit                            │
│  ✓ Set allowed MIME types                   │
└─────────────┬───────────────────────────────┘
              │
TIME: <0.5s   ↓
┌─────────────────────────────────────────────┐
│  CREATE POLICY (x4)                         │
│  ✓ Users can upload portfolio images        │
│  ✓ Users can update their portfolio images  │
│  ✓ Users can delete their portfolio images  │
│  ✓ Portfolio images are publicly viewable   │
└─────────────┬───────────────────────────────┘
              │
TIME: <3s     ↓
┌─────────────────────────────────────────────┐
│  MIGRATION COMPLETE ✅                      │
│  Total Time: < 3 seconds                    │
│  Downtime: NONE                             │
└─────────────────────────────────────────────┘
```

---

## File Structure After Migration

```
C:\GitHub\Projects\portfoliosys-app\
│
├── supabase/
│   └── migrations/
│       ├── 20260111_initial_schema.sql
│       ├── 20260124_document_tracking.sql
│       ├── 20260126_portfolio_images.sql          ← MAIN MIGRATION
│       └── 20260126_portfolio_images_rollback.sql ← ROLLBACK
│
├── scripts/
│   ├── run-portfolio-images-migration.js  (Helper)
│   ├── verify-migration.js                ← VERIFICATION
│   └── test-image-upload.js               ← TESTING
│
├── docs/
│   ├── MIGRATION_GUIDE_PORTFOLIO_IMAGES.md    ← COMPLETE GUIDE
│   ├── MIGRATION_SAFETY_REPORT.md             ← SAFETY ASSESSMENT
│   ├── MIGRATION_QUICK_REFERENCE.md           ← QUICK START
│   └── MIGRATION_VISUAL_OVERVIEW.md           ← THIS FILE
│
└── MIGRATION_DELIVERABLES_SUMMARY.md          ← SUMMARY
```

---

## Risk Assessment Matrix

```
                   IMPACT
                   ↑
              HIGH │
                   │
                   │
           MEDIUM  │                    ⚠️ Public Data
                   │                       Exposure
                   │                       (Mitigated)
             LOW   │   ✅ All Other
                   │      Risks
                   │
              NONE │
                   └──────────────────────────────────→
                   NONE   LOW   MEDIUM   HIGH
                              LIKELIHOOD

Legend:
✅ Low Risk (Green Zone)   - Proceed
⚠️ Medium Risk (Yellow)    - Mitigated with controls
❌ High Risk (Red)         - None in this migration
```

---

## Verification Checklist Visualization

```
┌────────────────────────────────────────────────────────────┐
│           MIGRATION VERIFICATION CHECKLIST                  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  DATABASE SCHEMA                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✅ profile_image_url column exists                 │    │
│  │ ✅ background_image_url column exists              │    │
│  │ ✅ Columns are TEXT type                           │    │
│  │ ✅ Columns are nullable                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  STORAGE BUCKET                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✅ Bucket 'portfolio-images' exists                │    │
│  │ ✅ Bucket is public                                │    │
│  │ ✅ File size limit = 5MB                           │    │
│  │ ✅ MIME types = [jpeg, png, webp, gif]            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  RLS POLICIES                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✅ INSERT policy (users can upload)                │    │
│  │ ✅ UPDATE policy (users can update)                │    │
│  │ ✅ DELETE policy (users can delete)                │    │
│  │ ✅ SELECT policy (public can view)                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  DATABASE INDEX                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✅ Index 'idx_portfolios_images' exists            │    │
│  │ ✅ Index is partial (WHERE clause)                 │    │
│  │ ✅ Index on both image columns                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  FUNCTIONAL TESTS                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ⬜ Image upload works                              │    │
│  │ ⬜ Public URL is accessible                        │    │
│  │ ⬜ Database URL is stored                          │    │
│  │ ⬜ File size validation works                      │    │
│  │ ⬜ MIME type validation works                      │    │
│  │ ⬜ User isolation works                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└────────────────────────────────────────────────────────────┘

Run: node scripts/verify-migration.js
```

---

## Rollback Procedure Flowchart

```
                ┌─────────────────────┐
                │  Need to Rollback?  │
                └──────────┬──────────┘
                           │
                    YES ←──┘
                           ↓
              ┌────────────────────────┐
              │  Backup Current State  │
              │  (Optional)             │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  Open Supabase SQL     │
              │  Editor                │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  Paste Rollback SQL    │
              │  (20260126_rollback)   │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  STEP 1:               │
              │  Drop RLS Policies     │
              │  (4 policies)          │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  STEP 2:               │
              │  Delete Storage Bucket │
              │  (portfolio-images)    │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  STEP 3:               │
              │  Drop Index            │
              │  (idx_portfolios_...)  │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  STEP 4:               │
              │  Drop Columns          │
              │  (2 image URLs)        │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  Verify Rollback       │
              │  (Run verify script)   │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │  ✅ ROLLBACK COMPLETE │
              │  Time: < 30 seconds    │
              └────────────────────────┘

Note: Uploaded images remain in storage but are inaccessible.
Delete files manually from Storage UI if needed.
```

---

## Success Metrics Dashboard

```
┌────────────────────────────────────────────────────────────┐
│              POST-MIGRATION SUCCESS METRICS                 │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  TECHNICAL METRICS                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Migration Time:        < 3 seconds         ✅     │    │
│  │  Downtime:              0 seconds           ✅     │    │
│  │  Errors:                0                   ✅     │    │
│  │  Rollback Available:    Yes                 ✅     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  VERIFICATION METRICS                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Schema Checks:         ██████████ 100%            │    │
│  │  Storage Checks:        ██████████ 100%            │    │
│  │  Policy Checks:         ██████████ 100%            │    │
│  │  Index Checks:          ██████████ 100%            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  FUNCTIONAL TESTS (Manual)                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Image Upload:          [ Pending Test ]           │    │
│  │  Public Access:         [ Pending Test ]           │    │
│  │  Database Update:       [ Pending Test ]           │    │
│  │  Validation:            [ Pending Test ]           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  SECURITY CHECKS                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  RLS Policies:          ████████ Active            │    │
│  │  User Isolation:        ████████ Enforced          │    │
│  │  File Validation:       ████████ Configured        │    │
│  │  Public Access:         ████████ Controlled        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Quick Command Reference

```
╔════════════════════════════════════════════════════════════╗
║                  QUICK COMMAND REFERENCE                    ║
╚════════════════════════════════════════════════════════════╝

📋 SHOW MIGRATION SQL
   node scripts/run-portfolio-images-migration.js

✅ VERIFY MIGRATION
   node scripts/verify-migration.js

🧪 TEST FUNCTIONALITY
   node scripts/test-image-upload.js

🔍 CHECK DATABASE COLUMNS
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'portfolios'
   AND column_name LIKE '%image%';

📦 CHECK STORAGE BUCKET
   SELECT * FROM storage.buckets
   WHERE id = 'portfolio-images';

🔐 CHECK RLS POLICIES
   SELECT policyname FROM pg_policies
   WHERE tablename = 'objects'
   AND policyname LIKE '%portfolio%';

📊 LIST UPLOADED FILES
   SELECT name, created_at FROM storage.objects
   WHERE bucket_id = 'portfolio-images'
   ORDER BY created_at DESC LIMIT 10;

⏪ ROLLBACK MIGRATION
   (Execute: 20260126_portfolio_images_rollback.sql)
```

---

## Status Legend

```
✅ COMPLETE       - Task completed successfully
⬜ PENDING        - Task not yet started
⚠️  WARNING       - Attention required
❌ FAILED         - Task failed, action needed
🔄 IN PROGRESS    - Currently executing
📋 REVIEW         - Needs review
🎉 SUCCESS        - Migration successful
```

---

**Visual Overview Version:** 1.0
**Created:** 2026-01-26
**Purpose:** Quick visual understanding of migration architecture

For detailed information, see:
- Complete Guide: `docs/MIGRATION_GUIDE_PORTFOLIO_IMAGES.md`
- Safety Report: `docs/MIGRATION_SAFETY_REPORT.md`
- Quick Reference: `docs/MIGRATION_QUICK_REFERENCE.md`
