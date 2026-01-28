import { createClient } from '@/lib/supabase/client';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface ImageUploadOptions {
  file: File;
  userId: string;
  category: 'profile' | 'background' | 'project' | 'certificate';
  onProgress?: (progress: number) => void;
}

export interface ImageUploadResult {
  url: string;
  path: string;
  publicUrl: string;
}

/**
 * Validates image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be JPEG, PNG, WebP, or GIF'
    };
  }

  return { valid: true };
}

/**
 * Generates unique file path for storage
 */
export function generateImagePath(userId: string, category: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${category}/${timestamp}_${sanitizedFileName}`;
}

/**
 * Uploads image to Supabase Storage
 */
export async function uploadImage(options: ImageUploadOptions): Promise<ImageUploadResult> {
  const { file, userId, category, onProgress } = options;

  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const supabase = createClient();

  // Generate file path
  const filePath = generateImagePath(userId, category, file.name);

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(filePath);

  if (onProgress) {
    onProgress(100);
  }

  return {
    url: publicUrlData.publicUrl,
    path: filePath,
    publicUrl: publicUrlData.publicUrl
  };
}

/**
 * Deletes image from Supabase Storage
 */
export async function deleteImage(path: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from('portfolio-images')
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Updates image (replaces existing)
 */
export async function updateImage(
  oldPath: string,
  newFile: File,
  userId: string,
  category: 'profile' | 'background' | 'project' | 'certificate'
): Promise<ImageUploadResult> {
  // Delete old image
  if (oldPath) {
    try {
      await deleteImage(oldPath);
    } catch (error) {
      console.warn('Failed to delete old image:', error);
    }
  }

  // Upload new image
  return uploadImage({ file: newFile, userId, category });
}

/**
 * Crops and resizes image on client side before upload
 */
export async function cropImage(
  file: File,
  crop: { x: number; y: number; width: number; height: number }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas size to crop dimensions
        canvas.width = crop.width;
        canvas.height = crop.height;

        // Draw cropped image
        ctx.drawImage(
          img,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          // Create new file from blob
          const croppedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });

          resolve(croppedFile);
        }, file.type);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

/**
 * Converts image to WebP format for better compression
 */
export async function convertToWebP(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webp'),
              {
                type: 'image/webp',
                lastModified: Date.now()
              }
            );

            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
