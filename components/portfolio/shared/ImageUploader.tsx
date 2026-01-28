'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cropImage } from '@/lib/storage/image-upload';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  userId: string;
  category: 'profile' | 'background' | 'project' | 'certificate';
  aspectRatio?: number; // e.g., 1 for square, 16/9 for landscape
  maxSize?: number;
  onUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
  className?: string;
}

export function ImageUploader({
  userId,
  category,
  aspectRatio = 1,
  maxSize = 5242880, // 5MB
  onUpload,
  currentImage,
  label = 'Upload Image',
  className
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const { upload, uploading, progress, error: uploadHookError } = useImageUpload({
    userId,
    category,
    onSuccess: (url) => {
      setPreviewUrl(url);
      onUpload(url);
      setUploadError(null);
    },
    onError: (error) => {
      setUploadError(error);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setUploadError(`File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setUploadError('Invalid file type. Please upload JPG, PNG, WebP, or GIF.');
      } else {
        setUploadError('Failed to upload file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(file);
      setCropDialogOpen(true);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    maxSize,
    multiple: false
  });

  const handleCropComplete = async () => {
    if (!imageToCrop || !completedCrop || !imgRef.current) return;

    try {
      setUploadError(null);
      const croppedFile = await cropImage(imageToCrop, {
        x: completedCrop.x,
        y: completedCrop.y,
        width: completedCrop.width,
        height: completedCrop.height
      });

      await upload(croppedFile);
      setCropDialogOpen(false);
      setImageToCrop(null);
    } catch (error) {
      console.error('Crop error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to crop and upload image';
      setUploadError(errorMessage);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUpload('');
  };

  return (
    <div className={className}>
      {!previewUrl ? (
        <>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary',
              uploadError && 'border-red-300 bg-red-50/50'
            )}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                <p className="text-sm text-gray-600">Uploading... {progress}%</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive ? 'Drop image here' : 'Drag & drop an image, or click to browse'}
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WebP, or GIF (max {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {uploadError && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Upload Failed</p>
                <p className="text-sm text-red-700 mt-1">{uploadError}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadError(null)}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Preview"
            className={cn(
              'w-full rounded-lg object-cover',
              aspectRatio === 1 ? 'aspect-square' : 'aspect-video'
            )}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
            <Check className="w-3 h-3" />
            Uploaded
          </div>
        </div>
      )}

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>

          {imageToCrop && (
            <div className="space-y-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
              >
                <img
                  ref={imgRef}
                  src={URL.createObjectURL(imageToCrop)}
                  alt="Crop preview"
                  className="max-h-[500px]"
                />
              </ReactCrop>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCropDialogOpen(false);
                    setImageToCrop(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCropComplete} disabled={!completedCrop}>
                  Apply Crop
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
