'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { personalInfoSchema, type PersonalInfoFormData } from '@/lib/validation/portfolio-schema';
import { FormField } from '../shared/FormField';
import { ImageUploader } from '../shared/ImageUploader';
import { AIAssistButton } from '../shared/AIAssistButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';

export default function PersonalInfoStep() {
  const { data, updateField, updateData } = useManualPortfolio();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data.personal || {
      name: '',
      title: '',
      email: user?.email || '',
      phone: '',
      location: '',
      website: '',
      social: {
        linkedin: '',
        github: '',
        twitter: '',
        medium: '',
        devto: '',
        portfolio: ''
      }
    }
  });

  // Watch for changes and update context
  const formValues = watch();
  useEffect(() => {
    updateData({ personal: formValues });
  }, [formValues, updateData]);

  const handleAISummary = (content: string) => {
    // Update summary in parent data
    updateField('summary', content);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
        <p className="text-gray-600">
          Let's start with your basic information and professional summary.
        </p>
      </div>

      {/* Profile Photo */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
        {user && (
          <ImageUploader
            userId={user.id}
            category="profile"
            aspectRatio={1}
            onUpload={(url) => updateField('profileImageUrl', url)}
            currentImage={data.personal?.profileImageUrl}
            label="Upload Profile Photo"
            className="max-w-xs"
          />
        )}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Full Name"
          required
          error={errors.name?.message}
        >
          <Input
            {...register('name')}
            placeholder="John Doe"
          />
        </FormField>

        <FormField
          label="Professional Title"
          required
          error={errors.title?.message}
        >
          <Input
            {...register('title')}
            placeholder="Software Engineer"
          />
        </FormField>

        <FormField
          label="Email"
          required
          error={errors.email?.message}
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="john@example.com"
          />
        </FormField>

        <FormField
          label="Phone"
          error={errors.phone?.message}
        >
          <Input
            {...register('phone')}
            type="tel"
            placeholder="+1 (555) 123-4567"
          />
        </FormField>

        <FormField
          label="Location"
          error={errors.location?.message}
        >
          <Input
            {...register('location')}
            placeholder="San Francisco, CA"
          />
        </FormField>

        <FormField
          label="Website"
          error={errors.website?.message}
        >
          <Input
            {...register('website')}
            type="url"
            placeholder="https://example.com"
          />
        </FormField>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="LinkedIn"
            error={errors.social?.linkedin?.message}
          >
            <Input
              {...register('social.linkedin')}
              type="url"
              placeholder="https://linkedin.com/in/username"
            />
          </FormField>

          <FormField
            label="GitHub"
            error={errors.social?.github?.message}
          >
            <Input
              {...register('social.github')}
              type="url"
              placeholder="https://github.com/username"
            />
          </FormField>

          <FormField
            label="Twitter"
            error={errors.social?.twitter?.message}
          >
            <Input
              {...register('social.twitter')}
              type="url"
              placeholder="https://twitter.com/username"
            />
          </FormField>

          <FormField
            label="Portfolio"
            error={errors.social?.portfolio?.message}
          >
            <Input
              {...register('social.portfolio')}
              type="url"
              placeholder="https://portfolio.com"
            />
          </FormField>
        </div>
      </div>

      {/* Professional Summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Professional Summary</h3>
          <AIAssistButton
            type="summary"
            input={{
              name: formValues.name || 'User',
              title: formValues.title || 'Professional',
              skills: [],
              yearsExperience: 5
            }}
            onSelect={handleAISummary}
            label="Generate with AI"
          />
        </div>

        <FormField
          label="Summary"
          hint="Write a brief professional summary (2-3 sentences)"
        >
          <Textarea
            value={data.summary || ''}
            onChange={(e) => updateField('summary', e.target.value)}
            rows={4}
            placeholder="I am a passionate software engineer with expertise in..."
          />
        </FormField>
      </div>
    </div>
  );
}
