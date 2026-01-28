# Image Upload Integration Examples

Real-world examples of integrating the ImageUploader component into portfolio creation steps.

## Step 1: Personal Info with Profile Picture

```typescript
'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { FormField } from '@/components/portfolio/shared/FormField';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useManualPortfolio } from '@/hooks/useManualPortfolio';

export function PersonalInfoStep() {
  const { user } = useAuth();
  const { data, updateData, nextStep } = useManualPortfolio();

  const [formData, setFormData] = useState({
    name: data.personalInfo?.name || '',
    title: data.personalInfo?.title || '',
    email: data.personalInfo?.email || '',
    phone: data.personalInfo?.phone || '',
    location: data.personalInfo?.location || '',
    profileImage: data.personalInfo?.profileImage || '',
    bio: data.personalInfo?.bio || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ personalInfo: formData });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Upload */}
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
          label="Upload your profile picture"
          className="max-w-xs"
        />
      </div>

      {/* Other form fields */}
      <FormField
        label="Full Name"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        required
      />

      <FormField
        label="Professional Title"
        value={formData.title}
        onChange={(value) => setFormData({ ...formData, title: value })}
        placeholder="e.g., Senior Frontend Developer"
      />

      {/* More fields... */}

      <div className="flex justify-end gap-2">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
```

## Step 2: Background Image with Preview

```typescript
'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { useAuth } from '@/hooks/useAuth';
import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { Button } from '@/components/ui/button';

export function BackgroundStep() {
  const { user } = useAuth();
  const { data, updateData, nextStep, prevStep } = useManualPortfolio();

  const [backgroundImage, setBackgroundImage] = useState(
    data.theme?.backgroundImage || ''
  );

  const handleContinue = () => {
    updateData({
      theme: {
        ...data.theme,
        backgroundImage
      }
    });
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Add a Background Image</h2>
        <p className="text-muted-foreground">
          Choose a professional background image that represents your brand
        </p>
      </div>

      {/* Background Image Upload */}
      <ImageUploader
        userId={user.id}
        category="background"
        aspectRatio={16 / 9}
        onUpload={setBackgroundImage}
        currentImage={backgroundImage}
        label="Upload background image"
      />

      {/* Preview */}
      {backgroundImage && (
        <div className="relative h-48 rounded-lg overflow-hidden">
          <img
            src={backgroundImage}
            alt="Background preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 flex items-end p-6">
            <div className="text-white">
              <h3 className="text-2xl font-bold">{data.personalInfo?.name}</h3>
              <p className="text-lg">{data.personalInfo?.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!backgroundImage}>
          Continue
        </Button>
      </div>
    </div>
  );
}
```

## Step 3: Project with Multiple Images

```typescript
'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { FormField } from '@/components/portfolio/shared/FormField';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProjectImage {
  url: string;
  caption?: string;
}

export function AddProjectForm() {
  const { user } = useAuth();

  const [project, setProject] = useState({
    title: '',
    description: '',
    role: '',
    technologies: [] as string[],
    images: [] as ProjectImage[],
    link: '',
    github: ''
  });

  const addImage = (url: string) => {
    setProject({
      ...project,
      images: [...project.images, { url }]
    });
  };

  const removeImage = (index: number) => {
    setProject({
      ...project,
      images: project.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Project data:', project);
    // Save project
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Project Title"
        value={project.title}
        onChange={(value) => setProject({ ...project, title: value })}
        required
      />

      <FormField
        label="Description"
        value={project.description}
        onChange={(value) => setProject({ ...project, description: value })}
        multiline
        rows={4}
      />

      {/* Project Images */}
      <div>
        <label className="block text-sm font-medium mb-4">
          Project Images
        </label>

        {/* Existing images */}
        {project.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {project.images.map((img, idx) => (
              <Card key={idx} className="relative group">
                <CardContent className="p-2">
                  <img
                    src={img.url}
                    alt={`Project ${idx + 1}`}
                    className="w-full aspect-video object-cover rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add new image */}
        {project.images.length < 5 && (
          <ImageUploader
            userId={user.id}
            category="project"
            aspectRatio={16 / 9}
            onUpload={addImage}
            label={`Add image ${project.images.length + 1}/5`}
          />
        )}

        {project.images.length >= 5 && (
          <p className="text-sm text-muted-foreground">
            Maximum 5 images per project
          </p>
        )}
      </div>

      {/* Other fields... */}

      <Button type="submit" className="w-full">
        Add Project
      </Button>
    </form>
  );
}
```

## Step 4: Certificates/Achievements Gallery

```typescript
'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { X, ZoomIn } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
}

export function CertificatesStep() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    date: '',
    imageUrl: ''
  });

  const handleAdd = () => {
    if (newCert.title && newCert.issuer && newCert.imageUrl) {
      setCertificates([
        ...certificates,
        { ...newCert, id: Date.now().toString() }
      ]);
      setNewCert({ title: '', issuer: '', date: '', imageUrl: '' });
      setIsAdding(false);
    }
  };

  const handleRemove = (id: string) => {
    setCertificates(certificates.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Certificates & Achievements</h2>
        <Button onClick={() => setIsAdding(true)}>
          Add Certificate
        </Button>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert) => (
          <Card key={cert.id} className="group relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">{cert.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{cert.issuer}</p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <img
                  src={cert.imageUrl}
                  alt={cert.title}
                  className="w-full aspect-[3/4] object-cover rounded cursor-pointer"
                  onClick={() => setSelectedImage(cert.imageUrl)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedImage(cert.imageUrl)}
                  >
                    <ZoomIn className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(cert.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
              {cert.date && (
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(cert.date).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Certificate Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certificate</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Certificate Title
              </label>
              <input
                type="text"
                value={newCert.title}
                onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="AWS Certified Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Issuing Organization
              </label>
              <input
                type="text"
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Amazon Web Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={newCert.date}
                onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Certificate Image
              </label>
              <ImageUploader
                userId={user.id}
                category="certificate"
                aspectRatio={3 / 4}
                onUpload={(url) => setNewCert({ ...newCert, imageUrl: url })}
                currentImage={newCert.imageUrl}
                label="Upload certificate image"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!newCert.title || !newCert.issuer || !newCert.imageUrl}
              >
                Add Certificate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Certificate"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## Advanced: Drag-to-Reorder Image Gallery

```typescript
'use client';

import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

function SortableImage({ image, onRemove }: { image: GalleryImage; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: image.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative group">
      <CardContent className="p-2">
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="absolute top-2 left-2 w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10" />
          <img
            src={image.url}
            alt={image.caption || 'Gallery image'}
            className="w-full aspect-video object-cover rounded"
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function ImageGalleryManager() {
  const { user } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);

  const addImage = (url: string) => {
    setImages([...images, { id: Date.now().toString(), url }]);
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Project Gallery</h2>

      {images.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  onRemove={() => removeImage(image.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {images.length < 10 && (
        <ImageUploader
          userId={user.id}
          category="project"
          aspectRatio={16 / 9}
          onUpload={addImage}
          label={`Add image ${images.length + 1}/10`}
        />
      )}
    </div>
  );
}
```

## Integration with Server Actions

```typescript
// app/actions/save-portfolio.ts
'use server';

import { createServerClient } from '@/lib/db/supabase-server';
import { revalidatePath } from 'next/cache';

interface PortfolioData {
  personalInfo: {
    name: string;
    title: string;
    profileImage: string;
    // ...
  };
  theme: {
    backgroundImage: string;
    // ...
  };
  projects: Array<{
    title: string;
    images: string[];
    // ...
  }>;
}

export async function savePortfolio(userId: string, data: PortfolioData) {
  const supabase = createServerClient();

  // Save to database
  const { error } = await supabase
    .from('portfolios')
    .upsert({
      user_id: userId,
      personal_info: data.personalInfo,
      theme: data.theme,
      projects: data.projects,
      updated_at: new Date().toISOString()
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/portfolios');
  return { success: true };
}
```

```typescript
// Component using server action
'use client';

import { useTransition } from 'react';
import { savePortfolio } from '@/app/actions/save-portfolio';
import { toast } from 'sonner';

export function PortfolioForm() {
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { data } = useManualPortfolio();

  const handleSave = () => {
    startTransition(async () => {
      const result = await savePortfolio(user.id, data);

      if (result.success) {
        toast.success('Portfolio saved successfully!');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button onClick={handleSave} disabled={isPending}>
      {isPending ? 'Saving...' : 'Save Portfolio'}
    </Button>
  );
}
```

## Best Practices

### 1. Always validate user authentication

```typescript
const { user } = useAuth();

if (!user) {
  return <div>Please log in to upload images</div>;
}

<ImageUploader userId={user.id} {...props} />
```

### 2. Show loading states

```typescript
const { uploading, progress } = useImageUpload({...});

{uploading && (
  <div>Uploading... {progress}%</div>
)}
```

### 3. Handle errors gracefully

```typescript
const { error } = useImageUpload({
  userId: user.id,
  category: 'profile',
  onError: (err) => {
    console.error('Upload error:', err);
    // Show user-friendly error message
  }
});

{error && (
  <Alert variant="destructive">
    <AlertTitle>Upload Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

### 4. Provide clear feedback

```typescript
<ImageUploader
  onUpload={(url) => {
    toast.success('Image uploaded successfully!');
    // Update form state
  }}
/>
```

### 5. Cleanup resources

```typescript
useEffect(() => {
  return () => {
    // Cleanup object URLs
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);
```

## Testing Your Integration

1. Navigate to `/dashboard/test-image-upload`
2. Test all three upload types (profile, background, project)
3. Verify cropping works correctly
4. Check that images are stored in correct folders
5. Confirm public URLs are accessible
6. Test error cases (oversized files, wrong formats)

## Troubleshooting

### Images not uploading
- Check user is authenticated
- Verify Supabase credentials in `.env.local`
- Check browser console for errors
- Ensure storage bucket exists

### Cropping not working
- Verify `react-image-crop` CSS is imported
- Check aspect ratio is valid number
- Ensure browser supports Canvas API

### Type errors
- Ensure all TypeScript types are imported
- Check component props match interface
- Verify Supabase types are up to date

## Resources

- Full Documentation: `/docs/IMAGE_UPLOAD_INFRASTRUCTURE.md`
- Component README: `/components/portfolio/shared/README.md`
- Test Page: `/app/(dashboard)/dashboard/test-image-upload/page.tsx`
- Hook Source: `/hooks/useImageUpload.ts`
- Utilities: `/lib/storage/image-upload.ts`
