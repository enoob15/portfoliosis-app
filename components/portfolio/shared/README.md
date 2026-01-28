# Portfolio Shared Components

Reusable components for the Manual Portfolio Creation feature.

## ImageUploader

Complete image upload component with drag-and-drop, cropping, and Supabase Storage integration.

### Quick Start

```typescript
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUploader
      userId={user.id}
      category="profile"
      aspectRatio={1}
      onUpload={setImageUrl}
      currentImage={imageUrl}
    />
  );
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userId` | `string` | Yes | - | User ID for scoped storage |
| `category` | `'profile' \| 'background' \| 'project' \| 'certificate'` | Yes | - | Image category/folder |
| `aspectRatio` | `number` | No | `1` | Crop aspect ratio (1 = square, 16/9 = landscape) |
| `maxSize` | `number` | No | `5242880` | Max file size in bytes (default: 5MB) |
| `onUpload` | `(url: string) => void` | Yes | - | Callback with uploaded image URL |
| `currentImage` | `string` | No | `undefined` | URL of existing image to display |
| `label` | `string` | No | `'Upload Image'` | Custom label text |
| `className` | `string` | No | `undefined` | Additional CSS classes |

### Common Aspect Ratios

```typescript
// Square (Profile Pictures)
<ImageUploader aspectRatio={1} {...props} />

// Landscape 16:9 (Backgrounds)
<ImageUploader aspectRatio={16/9} {...props} />

// Landscape 4:3 (Projects)
<ImageUploader aspectRatio={4/3} {...props} />

// Portrait 3:4
<ImageUploader aspectRatio={3/4} {...props} />
```

### Features

- Drag-and-drop file upload
- Click to browse file selection
- Image cropping with customizable aspect ratio
- Real-time preview
- Upload progress indicator
- File validation (size & format)
- Error handling with toast notifications
- Remove/replace functionality

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

Max size: 5MB (configurable)

### Example: Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';

interface ProfileForm {
  name: string;
  profileImage: string;
}

export default function ProfileEditor() {
  const { user } = useAuth();
  const { register, setValue, handleSubmit } = useForm<ProfileForm>();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('name')} placeholder="Name" />

      <ImageUploader
        userId={user.id}
        category="profile"
        aspectRatio={1}
        onUpload={(url) => setValue('profileImage', url)}
      />

      <button type="submit">Save</button>
    </form>
  );
}
```

### Storage Structure

Images are stored in Supabase Storage with the following structure:

```
portfolio-images/
  └── {userId}/
      ├── profile/
      │   └── {timestamp}_{filename}
      ├── background/
      │   └── {timestamp}_{filename}
      ├── project/
      │   └── {timestamp}_{filename}
      └── certificate/
          └── {timestamp}_{filename}
```

### Error Handling

The component automatically handles and displays errors via toast notifications:

- File size exceeds limit
- Invalid file format
- Upload failure
- Network errors

### Testing

Test page available at: `/dashboard/test-image-upload` (requires authentication)

### Documentation

Full documentation: `C:\GitHub\Projects\portfoliosis-app\docs\IMAGE_UPLOAD_INFRASTRUCTURE.md`

## Other Components

- **AIAssistButton** - AI content generation trigger
- **FormField** - Form field wrapper with validation
- **ProgressIndicator** - Step progress bar
- **RichTextEditor** - Rich text input (coming soon)

## Dependencies

- `react-dropzone` - Drag-and-drop functionality
- `react-image-crop` - Image cropping UI
- `@supabase/ssr` - Supabase client
- `sonner` - Toast notifications
