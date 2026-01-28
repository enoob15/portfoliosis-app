import { useState, useCallback } from 'react';
import { uploadImage, deleteImage, updateImage, validateImageFile } from '@/lib/storage/image-upload';
import { toast } from 'sonner';

export interface UseImageUploadOptions {
  userId: string;
  category: 'profile' | 'background' | 'project' | 'certificate';
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions) {
  const { userId, category, onSuccess, onError } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Upload with progress
        const result = await uploadImage({
          file,
          userId,
          category,
          onProgress: setProgress
        });

        setImageUrl(result.publicUrl);
        setImagePath(result.path);
        toast.success('Image uploaded successfully');

        if (onSuccess) {
          onSuccess(result.publicUrl);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
        setError(errorMessage);
        toast.error(errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        throw err;
      } finally {
        setUploading(false);
      }
    },
    [userId, category, onSuccess, onError]
  );

  const remove = useCallback(async () => {
    if (!imagePath) return;

    try {
      await deleteImage(imagePath);
      setImageUrl(null);
      setImagePath(null);
      toast.success('Image removed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove image';
      toast.error(errorMessage);
      throw err;
    }
  }, [imagePath]);

  const update = useCallback(
    async (newFile: File) => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const validation = validateImageFile(newFile);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const result = await updateImage(
          imagePath || '',
          newFile,
          userId,
          category
        );

        setImageUrl(result.publicUrl);
        setImagePath(result.path);
        toast.success('Image updated successfully');

        if (onSuccess) {
          onSuccess(result.publicUrl);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update image';
        setError(errorMessage);
        toast.error(errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        throw err;
      } finally {
        setUploading(false);
      }
    },
    [imagePath, userId, category, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setImageUrl(null);
    setImagePath(null);
    setProgress(0);
    setError(null);
  }, []);

  return {
    upload,
    remove,
    update,
    reset,
    uploading,
    progress,
    imageUrl,
    imagePath,
    error
  };
}
