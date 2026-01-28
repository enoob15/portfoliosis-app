# Image Upload Infrastructure Documentation

## Overview

Complete image upload system for the Manual Portfolio Creation feature with drag-and-drop, cropping, and Supabase Storage integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ImageUploader Component                   │
│  (React Dropzone + React Image Crop + Progress Tracking)    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   useImageUpload Hook                        │
│        (State Management + Upload Orchestration)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Image Upload Utilities                          │
│   (Validation + Path Generation + Supabase Operations)       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Storage                            │
│              Bucket: portfolio-images                        │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
lib/
├── storage/
│   └── image-upload.ts           # Core utilities
├── supabase/
│   └── client.ts                 # Supabase client wrapper
└── db/
    └── supabase.ts               # Base Supabase setup

hooks/
└── useImageUpload.ts             # Upload state management

components/
└── portfolio/
    └── shared/
        └── ImageUploader.tsx     # Main upload component
```

## Components

### 1. ImageUploader Component

**Location:** `C:\GitHub\Projects\portfoliosis-app\components\portfolio\shared\ImageUploader.tsx`

#### Features
- Drag-and-drop interface (react-dropzone)
- Click to browse file selection
- Image cropping with customizable aspect ratios (react-image-crop)
- Real-time preview
- Upload progress indicator
- Error handling with toast notifications
- Remove/replace functionality

#### Props Interface
```typescript
interface ImageUploaderProps {
  userId: string;                                      // User ID for scoped storage
  category: 'profile' | 'background' | 'project' | 'certificate';
  aspectRatio?: number;                                // e.g., 1 for square, 16/9 for landscape
  maxSize?: number;                                    // Max file size in bytes (default: 5MB)
  onUpload: (url: string) => void;                     // Callback on successful upload
  currentImage?: string;                               // URL of existing image
  label?: string;                                      // Custom label text
  className?: string;                                  // Additional CSS classes
}
```

#### Usage Example
```typescript
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';

<ImageUploader
  userId={user.id}
  category="profile"
  aspectRatio={1}                    // Square crop
  maxSize={5242880}                  // 5MB
  onUpload={(url) => {
    console.log('Uploaded:', url);
    // Save URL to your form state
  }}
  currentImage={formData.profileImage}
  label="Upload Profile Picture"
/>
```

#### Different Aspect Ratios
```typescript
// Square (Profile Pictures)
<ImageUploader aspectRatio={1} category="profile" {...props} />

// Landscape (Backgrounds)
<ImageUploader aspectRatio={16/9} category="background" {...props} />

// Portrait
<ImageUploader aspectRatio={3/4} category="project" {...props} />

// Custom
<ImageUploader aspectRatio={4/3} category="certificate" {...props} />
```

### 2. useImageUpload Hook

**Location:** `C:\GitHub\Projects\portfoliosis-app\hooks\useImageUpload.ts`

#### Features
- Upload state management
- Progress tracking
- Error handling
- Integration with Supabase storage
- Upload, remove, update, and reset operations

#### Interface
```typescript
interface UseImageUploadOptions {
  userId: string;
  category: 'profile' | 'background' | 'project' | 'certificate';
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

// Returns
{
  upload: (file: File) => Promise<ImageUploadResult>;
  remove: () => Promise<void>;
  update: (newFile: File) => Promise<ImageUploadResult>;
  reset: () => void;
  uploading: boolean;
  progress: number;
  imageUrl: string | null;
  imagePath: string | null;
  error: string | null;
}
```

#### Usage Example
```typescript
import { useImageUpload } from '@/hooks/useImageUpload';

const { upload, uploading, progress, imageUrl, error } = useImageUpload({
  userId: user.id,
  category: 'profile',
  onSuccess: (url) => console.log('Uploaded:', url),
  onError: (err) => console.error('Error:', err)
});

// Upload a file
const handleUpload = async (file: File) => {
  try {
    const result = await upload(file);
    console.log('Public URL:', result.publicUrl);
  } catch (err) {
    console.error('Upload failed:', err);
  }
};
```

### 3. Image Upload Utilities

**Location:** `C:\GitHub\Projects\portfoliosis-app\lib\storage\image-upload.ts`

#### Functions

##### validateImageFile(file: File)
Validates file size and format before upload.

```typescript
const validation = validateImageFile(file);
if (!validation.valid) {
  console.error(validation.error);
}
```

**Validation Rules:**
- Max size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF

##### generateImagePath(userId, category, fileName)
Generates unique, user-scoped storage path.

```typescript
const path = generateImagePath('user123', 'profile', 'avatar.jpg');
// Returns: "user123/profile/1737849600000_avatar.jpg"
```

**Path Structure:** `{userId}/{category}/{timestamp}_{sanitizedFileName}`

##### uploadImage(options)
Uploads image to Supabase Storage.

```typescript
const result = await uploadImage({
  file: file,
  userId: 'user123',
  category: 'profile',
  onProgress: (progress) => console.log(`${progress}%`)
});

console.log(result.publicUrl); // Public URL
console.log(result.path);      // Storage path
```

##### deleteImage(path)
Deletes image from Supabase Storage.

```typescript
await deleteImage('user123/profile/1737849600000_avatar.jpg');
```

##### updateImage(oldPath, newFile, userId, category)
Replaces existing image (deletes old, uploads new).

```typescript
const result = await updateImage(
  'user123/profile/old_avatar.jpg',
  newFile,
  'user123',
  'profile'
);
```

##### cropImage(file, crop)
Crops image on client-side before upload.

```typescript
const croppedFile = await cropImage(originalFile, {
  x: 100,
  y: 100,
  width: 300,
  height: 300
});
```

##### convertToWebP(file, quality)
Converts image to WebP format for better compression.

```typescript
const webpFile = await convertToWebP(jpegFile, 0.8); // 80% quality
```

## Supabase Storage Configuration

### Bucket: portfolio-images

**Configuration:**
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;
```

### Storage Policies

**Users can upload their own portfolio images:**
```sql
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Users can read all portfolio images (public):**
```sql
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');
```

**Users can delete their own images:**
```sql
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Users can update their own images:**
```sql
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Testing

### Test Page

**Location:** `C:\GitHub\Projects\portfoliosis-app\app\(dashboard)\dashboard\test-image-upload\page.tsx`

**Access:** Navigate to `/dashboard/test-image-upload` while logged in.

**Features Tested:**
- Profile image upload (1:1 aspect ratio)
- Background image upload (16:9 aspect ratio)
- Project image upload (4:3 aspect ratio)
- File validation
- Cropping functionality
- Progress tracking
- Error handling
- Remove/replace operations

### Manual Testing Checklist

- [ ] Drag-and-drop file upload works
- [ ] Click to browse file selection works
- [ ] File size validation (>5MB shows error)
- [ ] File format validation (invalid formats show error)
- [ ] Crop dialog opens after file selection
- [ ] Aspect ratio constraint works correctly
- [ ] Crop preview updates in real-time
- [ ] "Apply Crop" uploads cropped image
- [ ] Progress indicator shows during upload
- [ ] Success toast notification appears
- [ ] Image preview displays correctly
- [ ] "Remove" button deletes image
- [ ] Replace functionality works (hover over uploaded image)
- [ ] Public URL is generated correctly
- [ ] Image is accessible via public URL
- [ ] Images are stored in correct user folder
- [ ] Different aspect ratios work as expected

### Unit Tests

**File Validation:**
```typescript
import { validateImageFile } from '@/lib/storage/image-upload';

describe('validateImageFile', () => {
  test('accepts valid JPEG', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test('rejects oversized file', () => {
    const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('File size');
  });

  test('rejects invalid format', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('File must be');
  });
});
```

**Path Generation:**
```typescript
import { generateImagePath } from '@/lib/storage/image-upload';

describe('generateImagePath', () => {
  test('generates correct path structure', () => {
    const path = generateImagePath('user123', 'profile', 'avatar.jpg');
    expect(path).toMatch(/^user123\/profile\/\d+_avatar\.jpg$/);
  });

  test('sanitizes filename', () => {
    const path = generateImagePath('user123', 'profile', 'my avatar!@#.jpg');
    expect(path).toMatch(/my_avatar____\.jpg$/);
  });
});
```

## Integration Examples

### Basic Upload Form
```typescript
'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileForm() {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState('');

  const handleSubmit = async () => {
    // Save profileImage URL to database
    console.log('Saving profile with image:', profileImage);
  };

  return (
    <form onSubmit={handleSubmit}>
      <ImageUploader
        userId={user.id}
        category="profile"
        aspectRatio={1}
        onUpload={setProfileImage}
        currentImage={profileImage}
      />
      <button type="submit">Save Profile</button>
    </form>
  );
}
```

### Multi-Image Upload (Project Gallery)
```typescript
'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';

export default function ProjectForm() {
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);

  const addImage = (url: string) => {
    setImages([...images, url]);
  };

  return (
    <div>
      {images.map((img, idx) => (
        <div key={idx}>
          <img src={img} alt={`Project ${idx + 1}`} />
        </div>
      ))}

      <ImageUploader
        userId={user.id}
        category="project"
        aspectRatio={16/9}
        onUpload={addImage}
      />
    </div>
  );
}
```

### With Form State Management
```typescript
import { useForm } from 'react-hook-form';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';

interface FormData {
  name: string;
  profileImage: string;
  backgroundImage: string;
}

export default function CompleteProfileForm() {
  const { user } = useAuth();
  const { register, setValue, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    // Save to database
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />

      <ImageUploader
        userId={user.id}
        category="profile"
        aspectRatio={1}
        onUpload={(url) => setValue('profileImage', url)}
        label="Profile Picture"
      />

      <ImageUploader
        userId={user.id}
        category="background"
        aspectRatio={16/9}
        onUpload={(url) => setValue('backgroundImage', url)}
        label="Background Image"
      />

      <button type="submit">Save</button>
    </form>
  );
}
```

## Error Handling

### Common Errors and Solutions

**1. "Failed to upload image: Bucket not found"**
- Solution: Ensure Supabase storage bucket `portfolio-images` is created
- Run: Migration script with bucket creation SQL

**2. "File size must be less than 5MB"**
- Solution: User must compress image or select smaller file
- Consider adding client-side compression utility

**3. "Failed to get canvas context"**
- Solution: Browser doesn't support Canvas API (unlikely in modern browsers)
- Fallback: Upload without cropping

**4. "Missing Supabase environment variables"**
- Solution: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`

**5. RLS Policy Error**
- Solution: Ensure user is authenticated and RLS policies are correctly set up
- Check: User ID matches folder name in storage path

## Performance Optimization

### Recommendations

1. **Lazy Load react-image-crop CSS:**
```typescript
// Only load when needed
import('react-image-crop/dist/ReactCrop.css');
```

2. **Compress images before upload:**
```typescript
import { convertToWebP } from '@/lib/storage/image-upload';

const optimizedFile = await convertToWebP(originalFile, 0.8);
await upload(optimizedFile);
```

3. **Use loading states:**
```typescript
{uploading && <Skeleton className="w-full h-48" />}
```

4. **Cleanup object URLs:**
```typescript
useEffect(() => {
  return () => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);
```

## Security Considerations

1. **User-scoped paths:** All uploads are automatically scoped to user ID
2. **RLS policies:** Supabase RLS ensures users can only modify their own images
3. **File validation:** Size and format validation on client and server
4. **Public URLs:** Images are public but path guessing is difficult (timestamp + sanitized name)
5. **Authentication:** All upload operations require authenticated user

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs:**
- FileReader API
- Canvas API
- Blob API
- Drag and Drop API

## Dependencies

```json
{
  "react-dropzone": "^14.3.8",
  "react-image-crop": "^11.0.10",
  "@supabase/ssr": "latest",
  "sonner": "latest" // For toast notifications
}
```

## Troubleshooting

### Cropping not working
- Check that react-image-crop CSS is imported
- Verify aspect ratio is a valid number
- Ensure image loads before crop dialog opens

### Upload hangs at 0%
- Check network tab for Supabase API errors
- Verify storage bucket exists and is public
- Check authentication status

### Images not displaying
- Verify public URL is correctly generated
- Check CORS settings on Supabase project
- Ensure bucket is set to public

### Type errors
- Ensure all TypeScript types are imported
- Check that File API is available in browser
- Verify react-image-crop types are installed

## Future Enhancements

- [ ] Add image compression before upload
- [ ] Support multiple image upload at once
- [ ] Add image filters/effects
- [ ] Implement image resizing presets
- [ ] Add thumbnail generation
- [ ] Support video uploads
- [ ] Add progress indicator for large files
- [ ] Implement drag-to-reorder for multiple images
- [ ] Add undo/redo for crop operations
- [ ] Cache uploaded images locally

## Support

For issues or questions:
1. Check this documentation
2. Review test page implementation
3. Check browser console for errors
4. Verify Supabase configuration
5. Check RLS policies

## Changelog

### v1.0.0 (2026-01-25)
- Initial implementation
- ImageUploader component with crop functionality
- useImageUpload hook
- Image upload utilities
- Supabase Storage integration
- Test page created
- Documentation completed
