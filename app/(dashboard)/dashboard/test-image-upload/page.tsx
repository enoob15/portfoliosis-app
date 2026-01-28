'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/portfolio/shared/ImageUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Test page for Image Upload Infrastructure
 * This page demonstrates all features of the ImageUploader component
 */
export default function TestImageUploadPage() {
  const { user, loading } = useAuth();
  const [profileImage, setProfileImage] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [projectImage, setProjectImage] = useState<string>('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to test image uploads.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Image Upload Infrastructure Test</h1>
        <p className="text-muted-foreground">
          Test the image upload system with different aspect ratios and categories.
        </p>
      </div>

      {/* Profile Image - Square (1:1) */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Image Upload</CardTitle>
          <CardDescription>
            Square aspect ratio (1:1) - Perfect for profile pictures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader
            userId={user.id}
            category="profile"
            aspectRatio={1}
            onUpload={(url) => {
              console.log('Profile image uploaded:', url);
              setProfileImage(url);
            }}
            currentImage={profileImage}
            label="Upload Profile Picture"
          />
          {profileImage && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Uploaded URL: {profileImage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Background Image - Landscape (16:9) */}
      <Card>
        <CardHeader>
          <CardTitle>Background Image Upload</CardTitle>
          <CardDescription>
            Landscape aspect ratio (16:9) - Perfect for banner backgrounds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader
            userId={user.id}
            category="background"
            aspectRatio={16 / 9}
            onUpload={(url) => {
              console.log('Background image uploaded:', url);
              setBackgroundImage(url);
            }}
            currentImage={backgroundImage}
            label="Upload Background Image"
          />
          {backgroundImage && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Uploaded URL: {backgroundImage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Image - Custom (4:3) */}
      <Card>
        <CardHeader>
          <CardTitle>Project Image Upload</CardTitle>
          <CardDescription>
            Custom aspect ratio (4:3) - Perfect for project screenshots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader
            userId={user.id}
            category="project"
            aspectRatio={4 / 3}
            onUpload={(url) => {
              console.log('Project image uploaded:', url);
              setProjectImage(url);
            }}
            currentImage={projectImage}
            label="Upload Project Image"
          />
          {projectImage && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Uploaded URL: {projectImage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Tested Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Drag-and-drop file upload
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Click to browse file selection
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Image cropping with adjustable aspect ratio
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              File validation (size and format)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Progress indicator during upload
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Image preview display
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Remove/replace functionality
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Supabase Storage integration
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              User-scoped file paths
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Error handling and toast notifications
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
