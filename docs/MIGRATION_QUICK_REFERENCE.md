# Portfolio Images Migration - Quick Reference Card

**Status:** ✅ Ready for execution
**Risk Level:** LOW
**Estimated Time:** < 3 seconds

---

## Quick Start

### 1. Execute Migration (Choose One)

**Option A: Supabase Dashboard (Recommended)**
1. Open https://supabase.com/dashboard
2. Go to SQL Editor → New query
3. Paste contents of `supabase/migrations/20260126_portfolio_images.sql`
4. Click RUN

**Option B: Helper Script (Shows SQL)**
```bash
node scripts/run-portfolio-images-migration.js
```
_(Still requires manual paste into Supabase Dashboard)_

### 2. Verify Migration

```bash
node scripts/verify-migration.js
```

Expected output: "Migration verification SUCCESSFUL!"

### 3. Test Functionality

```bash
node scripts/test-image-upload.js
```

Follow manual testing instructions provided.

---

## What This Migration Does

1. ✅ Adds two columns to `portfolios` table:
   - `profile_image_url` (TEXT)
   - `background_image_url` (TEXT)

2. ✅ Creates `portfolio-images` storage bucket:
   - 5MB file size limit
   - Image types only (JPEG, PNG, WebP, GIF)
   - Public read access

3. ✅ Sets up 4 RLS policies:
   - Users can upload their own images
   - Users can update their own images
   - Users can delete their own images
   - Everyone can view portfolio images

4. ✅ Creates index for optimized queries

---

## Files Reference

| File | Purpose |
|------|---------|
| `supabase/migrations/20260126_portfolio_images.sql` | Main migration |
| `supabase/migrations/20260126_portfolio_images_rollback.sql` | Rollback |
| `scripts/verify-migration.js` | Verification |
| `scripts/test-image-upload.js` | Testing guide |
| `docs/MIGRATION_GUIDE_PORTFOLIO_IMAGES.md` | Full guide |
| `docs/MIGRATION_SAFETY_REPORT.md` | Safety assessment |

---

## Common Commands

**Verify migration:**
```bash
node scripts/verify-migration.js
```

**Test upload functionality:**
```bash
node scripts/test-image-upload.js
```

**Check database columns:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'portfolios'
AND column_name LIKE '%image%';
```

**Check storage bucket:**
```sql
SELECT * FROM storage.buckets WHERE id = 'portfolio-images';
```

**List policies:**
```sql
SELECT policyname FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%portfolio%';
```

---

## Rollback (If Needed)

1. Open Supabase Dashboard → SQL Editor
2. Paste contents of `supabase/migrations/20260126_portfolio_images_rollback.sql`
3. Click RUN

**Warning:** This will make uploaded images inaccessible (but not delete them).

---

## Troubleshooting

**Issue: "relation 'portfolios' does not exist"**
→ Run initial schema migration first

**Issue: "duplicate key value"**
→ Bucket already exists, safe to ignore

**Issue: "Upload fails with 403"**
→ Check user is authenticated and policies exist

**Issue: "Public URL returns 404"**
→ Verify bucket is public and file exists

---

## Next Steps After Migration

1. ✅ Run verification script
2. ✅ Test image upload in dev environment
3. ⚠️ Add privacy notice to upload UI
4. ⚠️ Implement image cleanup logic
5. ⚠️ Monitor storage usage in Supabase Dashboard

---

## Support

- **Full Guide:** `docs/MIGRATION_GUIDE_PORTFOLIO_IMAGES.md`
- **Safety Report:** `docs/MIGRATION_SAFETY_REPORT.md`
- **Supabase Docs:** https://supabase.com/docs/guides/storage

---

**Quick Reference Version:** 1.0
**Last Updated:** 2026-01-26
