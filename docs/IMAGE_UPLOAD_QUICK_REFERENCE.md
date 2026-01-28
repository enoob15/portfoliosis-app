# Image Upload - Quick Reference Guide

## TL;DR - Copy & Paste Examples

### Basic Upload (Profile Picture)

```typescript
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileForm() {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState('');

  return (
    <ImageUploader
      userId={user.id}
      category="profile"
      aspectRatio={1}
      onUpload={setProfileImage}
      currentImage={profileImage}
    />
  );
}
```

### Background Image

```typescript
<ImageUploader
  userId={user.id}
  category="background"
  aspectRatio={16/9}
  onUpload={(url) => setBackgroundImage(url)}
  currentImage={backgroundImage}
  label="Upload Background"
/>
```

### Project Image Gallery

```typescript
const [images, setImages] = useState<string[]>([]);

<ImageUploader
  userId={user.id}
  category="project"
  aspectRatio={4/3}
  onUpload={(url) => setImages([...images, url])}
/>
```

## Common Aspect Ratios

| Type | Ratio | Code |
|------|-------|------|
| Square (Profile) | 1:1 | `aspectRatio={1}` |
| Landscape (Background) | 16:9 | `aspectRatio={16/9}` |
| Wide Landscape | 21:9 | `aspectRatio={21/9}` |
| Standard Photo | 4:3 | `aspectRatio={4/3}` |
| Portrait | 3:4 | `aspectRatio={3/4}` |
| Vertical | 9:16 | `aspectRatio={9/16}` |

## Props Reference

```typescript
interface ImageUploaderProps {
  userId: string;          // Required: User ID from useAuth
  category: string;        // Required: 'profile' | 'background' | 'project' | 'certificate'
  aspectRatio?: number;    // Optional: Default 1
  maxSize?: number;        // Optional: Default 5242880 (5MB)
  onUpload: (url) => void; // Required: Callback with URL
  currentImage?: string;   // Optional: Existing image URL
  label?: string;          // Optional: Custom label
  className?: string;      // Optional: CSS classes
}
```

## Common Patterns

### With React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';

interface FormData {
  name: string;
  profileImage: string;
}

export default function Form() {
  const { user } = useAuth();
  const { register, setValue, handleSubmit } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('name')} />

      <ImageUploader
        userId={user.id}
        category="profile"
        onUpload={(url) => setValue('profileImage', url)}
      />

      <button type="submit">Save</button>
    </form>
  );
}
```

### With useState (Simple Form)

```typescript
const [formData, setFormData] = useState({
  name: '',
  profileImage: ''
});

<ImageUploader
  userId={user.id}
  category="profile"
  onUpload={(url) => setFormData({ ...formData, profileImage: url })}
  currentImage={formData.profileImage}
/>
```

### With useManualPortfolio Hook

```typescript
import { useManualPortfolio } from '@/hooks/useManualPortfolio';

export default function PersonalInfoStep() {
  const { user } = useAuth();
  const { data, updateData } = useManualPortfolio();

  return (
    <ImageUploader
      userId={user.id}
      category="profile"
      onUpload={(url) => {
        updateData({
          personalInfo: {
            ...data.personalInfo,
            profileImage: url
          }
        });
      }}
      currentImage={data.personalInfo?.profileImage}
    />
  );
}
```

## Advanced Patterns

### Multiple Images with Remove

```typescript
const [images, setImages] = useState<string[]>([]);

const addImage = (url: string) => {
  setImages([...images, url]);
};

const removeImage = (index: number) => {
  setImages(images.filter((_, i) => i !== index));
};

return (
  <div>
    {/* Display existing images */}
    {images.map((img, idx) => (
      <div key={idx} className="relative">
        <img src={img} alt={`Image ${idx + 1}`} />
        <button onClick={() => removeImage(idx)}>Remove</button>
      </div>
    ))}

    {/* Upload new image */}
    <ImageUploader
      userId={user.id}
      category="project"
      onUpload={addImage}
    />
  </div>
);
```

### With Loading State

```typescript
import { useImageUpload } from '@/hooks/useImageUpload';

const { upload, uploading, progress } = useImageUpload({
  userId: user.id,
  category: 'profile',
  onSuccess: (url) => console.log('Uploaded:', url)
});

// Use in custom component
{uploading && (
  <div>Uploading... {progress}%</div>
)}
```

### With Error Handling

```typescript
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';

const { upload, error } = useImageUpload({
  userId: user.id,
  category: 'profile',
  onSuccess: (url) => {
    console.log('Success:', url);
    toast.success('Image uploaded!');
  },
  onError: (err) => {
    console.error('Error:', err);
    toast.error(`Upload failed: ${err}`);
  }
});

{error && (
  <div className="text-red-600">{error}</div>
)}
```

## Validation

### File Size
Maximum: 5MB (5,242,880 bytes)

```typescript
<ImageUploader
  maxSize={5242880}  // 5MB
  {...props}
/>

// Custom size (2MB)
<ImageUploader
  maxSize={2097152}  // 2MB
  {...props}
/>
```

### Allowed Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

## Storage Paths

All images are stored with the following structure:

```
portfolio-images/
  └── {userId}/
      ├── profile/
      │   └── 1737849600000_avatar.jpg
      ├── background/
      │   └── 1737849700000_bg.png
      ├── project/
      │   └── 1737849800000_screenshot.webp
      └── certificate/
          └── 1737849900000_cert.pdf
```

## Testing

### Test Page URL
```
/dashboard/test-image-upload
```

### Quick Test
1. Log in to your account
2. Go to `/dashboard/test-image-upload`
3. Upload an image in each section
4. Verify images appear correctly
5. Check browser console for any errors

## Utilities

### Validate File Before Upload

```typescript
import { validateImageFile } from '@/lib/storage/image-upload';

const file = // File object
const validation = validateImageFile(file);

if (validation.valid) {
  // Proceed with upload
} else {
  console.error(validation.error);
}
```

### Manual Upload (Advanced)

```typescript
import { uploadImage } from '@/lib/storage/image-upload';

const result = await uploadImage({
  file: file,
  userId: user.id,
  category: 'profile',
  onProgress: (progress) => console.log(`${progress}%`)
});

console.log('URL:', result.publicUrl);
console.log('Path:', result.path);
```

### Crop Image (Advanced)

```typescript
import { cropImage } from '@/lib/storage/image-upload';

const croppedFile = await cropImage(originalFile, {
  x: 100,
  y: 100,
  width: 300,
  height: 300
});
```

### Convert to WebP (Advanced)

```typescript
import { convertToWebP } from '@/lib/storage/image-upload';

const webpFile = await convertToWebP(jpegFile, 0.8); // 80% quality
```

## Common Issues & Fixes

### Issue: Component not found
```typescript
// Wrong
import { ImageUploader } from '@/components/ImageUploader';

// Correct
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
```

### Issue: Missing userId
```typescript
// Wrong
<ImageUploader category="profile" onUpload={...} />

// Correct
const { user } = useAuth();
<ImageUploader userId={user.id} category="profile" onUpload={...} />
```

### Issue: Image not updating
```typescript
// Wrong - not updating state
<ImageUploader onUpload={(url) => console.log(url)} />

// Correct - updating state
<ImageUploader onUpload={(url) => setImageUrl(url)} />
```

### Issue: Aspect ratio not working
```typescript
// Wrong - string instead of number
<ImageUploader aspectRatio="16/9" {...props} />

// Correct - number
<ImageUploader aspectRatio={16/9} {...props} />
```

## Environment Setup

### Required Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Storage Setup

1. Go to Supabase Dashboard
2. Navigate to Storage
3. Create new bucket: `portfolio-images`
4. Set to Public
5. Apply RLS policies (see full docs)

## Complete Example

Here's a complete, working example:

```typescript
'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profileImage: '',
    backgroundImage: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving profile:', formData);
    // Save to database
  };

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Profile Picture
            </label>
            <ImageUploader
              userId={user.id}
              category="profile"
              aspectRatio={1}
              onUpload={(url) => setFormData({ ...formData, profileImage: url })}
              currentImage={formData.profileImage}
              className="max-w-xs"
            />
          </div>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Background Image
            </label>
            <ImageUploader
              userId={user.id}
              category="background"
              aspectRatio={16/9}
              onUpload={(url) => setFormData({ ...formData, backgroundImage: url })}
              currentImage={formData.backgroundImage}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
            />
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full">
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
```

## Resources

- **Full Documentation:** `/docs/IMAGE_UPLOAD_INFRASTRUCTURE.md`
- **Integration Examples:** `/docs/IMAGE_UPLOAD_INTEGRATION_EXAMPLES.md`
- **Component Source:** `/components/portfolio/shared/ImageUploader.tsx`
- **Hook Source:** `/hooks/useImageUpload.ts`
- **Utilities Source:** `/lib/storage/image-upload.ts`
- **Test Page:** `/dashboard/test-image-upload`

## Support

For detailed information:
1. Check this quick reference first
2. Review full documentation
3. Look at integration examples
4. Test on the test page
5. Check browser console for errors

---

**Updated:** 2026-01-25
**Version:** 1.0.0
