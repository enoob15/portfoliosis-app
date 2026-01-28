# Image Upload Infrastructure - Implementation Checklist

## Pre-Flight Checks

### Environment Setup
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Run `npm install` to ensure all dependencies are installed

### Supabase Configuration
- [ ] Create storage bucket `portfolio-images` in Supabase dashboard
- [ ] Set bucket to public
- [ ] Set file size limit to 5MB
- [ ] Set allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- [ ] Apply RLS policies (see migration SQL below)

#### Migration SQL
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Users can upload their own images
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Anyone can view portfolio images
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');

-- Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Files Verification

### Core Infrastructure
- [x] `lib/storage/image-upload.ts` - Upload utilities
- [x] `hooks/useImageUpload.ts` - Upload hook
- [x] `components/portfolio/shared/ImageUploader.tsx` - Main component
- [x] `lib/supabase/client.ts` - Supabase client wrapper

### Documentation
- [x] `docs/IMAGE_UPLOAD_INFRASTRUCTURE.md` - Complete documentation
- [x] `docs/IMAGE_UPLOAD_INTEGRATION_EXAMPLES.md` - Integration examples
- [x] `components/portfolio/shared/README.md` - Component quick reference
- [x] `IMAGE_UPLOAD_SUMMARY.md` - Implementation summary

### Testing
- [x] `app/(dashboard)/dashboard/test-image-upload/page.tsx` - Test page

## Testing Checklist

### Unit Testing
- [ ] File validation accepts valid JPEG
- [ ] File validation accepts valid PNG
- [ ] File validation accepts valid WebP
- [ ] File validation accepts valid GIF
- [ ] File validation rejects files > 5MB
- [ ] File validation rejects invalid formats
- [ ] Path generation creates correct structure
- [ ] Path generation sanitizes filenames

### Component Testing
- [ ] Component renders without errors
- [ ] Drag-and-drop area is visible
- [ ] Click to browse works
- [ ] File input accepts correct formats
- [ ] Crop dialog opens after file selection
- [ ] Crop aspect ratio is enforced
- [ ] Crop preview updates in real-time
- [ ] Apply crop uploads image
- [ ] Cancel crop closes dialog
- [ ] Progress indicator shows during upload
- [ ] Success state displays uploaded image
- [ ] Remove button deletes image
- [ ] Error states display correctly

### Integration Testing
- [ ] Navigate to `/dashboard/test-image-upload`
- [ ] Test profile upload (1:1 aspect ratio)
- [ ] Test background upload (16:9 aspect ratio)
- [ ] Test project upload (4:3 aspect ratio)
- [ ] Verify images upload to Supabase
- [ ] Verify images are in correct user folder
- [ ] Verify public URLs are accessible
- [ ] Test with different file sizes
- [ ] Test with different formats
- [ ] Test error cases (oversized, wrong format)
- [ ] Test on different browsers
- [ ] Test on mobile devices

### Security Testing
- [ ] Verify user must be authenticated
- [ ] Verify user can only access their own images
- [ ] Verify RLS policies are enforced
- [ ] Verify file paths are user-scoped
- [ ] Test with malicious filenames
- [ ] Verify file size limit is enforced
- [ ] Verify format restrictions are enforced

## Integration Steps

### Step 1: Personal Info (Profile Picture)
- [ ] Import `ImageUploader` component
- [ ] Add userId from `useAuth`
- [ ] Set category to `'profile'`
- [ ] Set aspectRatio to `1` (square)
- [ ] Add onUpload callback to update form state
- [ ] Pass currentImage from form state
- [ ] Test upload and form submission

### Step 2: Background Image
- [ ] Import `ImageUploader` component
- [ ] Add userId from `useAuth`
- [ ] Set category to `'background'`
- [ ] Set aspectRatio to `16/9` (landscape)
- [ ] Add onUpload callback to update theme state
- [ ] Pass currentImage from theme state
- [ ] Test upload and preview

### Step 3: Project Images
- [ ] Import `ImageUploader` component
- [ ] Add userId from `useAuth`
- [ ] Set category to `'project'`
- [ ] Set aspectRatio to `4/3` or `16/9`
- [ ] Handle multiple images (array of URLs)
- [ ] Add remove functionality for each image
- [ ] Test adding multiple images
- [ ] Test removing images

### Step 4: Certificates
- [ ] Import `ImageUploader` component
- [ ] Add userId from `useAuth`
- [ ] Set category to `'certificate'`
- [ ] Set aspectRatio to `3/4` (portrait)
- [ ] Add certificate metadata (title, issuer, date)
- [ ] Handle certificate gallery
- [ ] Test upload and display

## Browser Testing

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile

### Features to Test on Each Browser
- [ ] Drag-and-drop
- [ ] File selection
- [ ] Cropping interface
- [ ] Image preview
- [ ] Upload progress
- [ ] Error messages

## Performance Testing

- [ ] Test upload with 5MB image
- [ ] Test upload with 1MB image
- [ ] Measure upload time
- [ ] Verify progress indicator updates
- [ ] Test multiple simultaneous uploads
- [ ] Check memory usage
- [ ] Verify object URL cleanup
- [ ] Test on slow network (throttled)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces states
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA
- [ ] Error messages are accessible
- [ ] Progress indicators are announced

## Error Handling Testing

### File Validation Errors
- [ ] File too large (> 5MB)
- [ ] Invalid format (.pdf, .txt, etc.)
- [ ] Corrupted image file

### Upload Errors
- [ ] Network failure during upload
- [ ] Supabase storage unavailable
- [ ] Invalid authentication
- [ ] Bucket doesn't exist
- [ ] RLS policy rejection

### UI Errors
- [ ] Canvas context unavailable
- [ ] FileReader failure
- [ ] Blob creation failure

## Documentation Review

- [ ] Read `IMAGE_UPLOAD_SUMMARY.md`
- [ ] Review `docs/IMAGE_UPLOAD_INFRASTRUCTURE.md`
- [ ] Check integration examples in `docs/IMAGE_UPLOAD_INTEGRATION_EXAMPLES.md`
- [ ] Read component README in `components/portfolio/shared/README.md`

## Code Review Checklist

### TypeScript
- [x] All types properly defined
- [x] No `any` types used
- [x] Props interfaces exported
- [x] Return types specified

### React Best Practices
- [x] Hooks follow rules of hooks
- [x] useCallback for event handlers
- [x] Cleanup in useEffect
- [x] No inline object/array creation in render
- [x] Keys for list items

### Error Handling
- [x] Try-catch blocks for async operations
- [x] Error states displayed to user
- [x] Console errors for debugging
- [x] Toast notifications for user feedback

### Security
- [x] User authentication required
- [x] File validation on client
- [x] User-scoped storage paths
- [x] RLS policies enforced

### Performance
- [x] Client-side cropping (no server processing)
- [x] Progress tracking
- [x] Object URL cleanup
- [x] Lazy loading of dependencies

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Documentation complete
- [ ] Code reviewed

### Supabase Production
- [ ] Storage bucket created in production
- [ ] RLS policies applied
- [ ] Environment variables set
- [ ] CORS configured

### Monitoring
- [ ] Set up error tracking
- [ ] Monitor upload success rate
- [ ] Track upload times
- [ ] Monitor storage usage

## Post-Deployment Verification

- [ ] Test upload in production
- [ ] Verify images are accessible
- [ ] Check storage paths
- [ ] Test on production domain
- [ ] Verify RLS policies work
- [ ] Test error scenarios
- [ ] Monitor error logs

## Known Issues & Limitations

### Current Limitations
- Maximum file size: 5MB
- Formats: JPEG, PNG, WebP, GIF only
- Single file upload at a time
- No image compression (manual conversion needed)
- No thumbnail generation

### Future Enhancements
- [ ] Add image compression before upload
- [ ] Support multiple file upload
- [ ] Add thumbnail generation
- [ ] Implement image filters
- [ ] Add video support
- [ ] Drag-to-reorder for galleries

## Troubleshooting Common Issues

### Issue: "Bucket not found"
**Solution:** Create storage bucket in Supabase dashboard or run migration SQL

### Issue: "Missing environment variables"
**Solution:** Add Supabase credentials to `.env.local`

### Issue: "Upload hangs at 0%"
**Solution:** Check network tab, verify authentication, check RLS policies

### Issue: "Cropping not working"
**Solution:** Import react-image-crop CSS, verify browser Canvas support

### Issue: "Type errors"
**Solution:** Run `npm install`, verify all types are imported

### Issue: "Images not displaying"
**Solution:** Check public URL, verify bucket is public, check CORS

## Support & Resources

### Documentation
- Main: `docs/IMAGE_UPLOAD_INFRASTRUCTURE.md`
- Examples: `docs/IMAGE_UPLOAD_INTEGRATION_EXAMPLES.md`
- Component: `components/portfolio/shared/README.md`

### Source Code
- Utilities: `lib/storage/image-upload.ts`
- Hook: `hooks/useImageUpload.ts`
- Component: `components/portfolio/shared/ImageUploader.tsx`

### Testing
- Test Page: `/dashboard/test-image-upload`

### Handoff Document
- Main: `HANDOFF_MANUAL_CREATION.md` (lines 410-422)

## Sign-Off

### Developer
- [ ] All code implemented
- [ ] Tests written and passing
- [ ] Documentation complete
- [ ] Code reviewed

### QA
- [ ] All test cases passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Accessibility verified

### Product
- [ ] Features meet requirements
- [ ] UX is acceptable
- [ ] Ready for production

---

**Status:** Ready for Integration ✅
**Last Updated:** 2026-01-25
**Version:** 1.0.0
