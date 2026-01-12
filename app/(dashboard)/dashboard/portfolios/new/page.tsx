'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/db/supabase';
import { ResumeUpload } from '@/components/upload/ResumeUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const templates = [
  { id: 'tech-professional', name: 'Tech Professional', description: 'Clean, modern design for software engineers' },
  { id: 'creative-director', name: 'Creative Director', description: 'Bold, visual portfolio for designers' },
  { id: 'business-executive', name: 'Business Executive', description: 'Professional design for executives' },
  { id: 'academic-researcher', name: 'Academic Researcher', description: 'Scholarly design for researchers' },
  { id: 'freelancer', name: 'Freelancer', description: 'Versatile portfolio for freelancers' },
];

export default function NewPortfolioPage() {
  const router = useRouter();
  const [portfolioName, setPortfolioName] = useState('');
  const [templateId, setTemplateId] = useState('tech-professional');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Details, 2: Upload, 3: Processing

  async function handleCreatePortfolio() {
    if (!portfolioName.trim()) {
      setError('Please enter a portfolio name');
      return;
    }

    if (!file) {
      setError('Please upload your resume');
      return;
    }

    setLoading(true);
    setError(null);
    setStep(3);

    try {
      const supabase = createBrowserClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Generate slug from name
      const slug = portfolioName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Upload resume to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create portfolio record
      const { data: portfolio, error: createError } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: portfolioName,
          slug: slug,
          template_id: templateId,
          resume_data: {
            file_path: fileName,
            file_name: file.name,
            uploaded_at: new Date().toISOString(),
          },
          status: 'draft',
          is_public: false,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // TODO: Trigger AI processing job
      // For now, just redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create portfolio');
      setLoading(false);
      setStep(2);
    }
  }

  function handleFileUpload(uploadedFile: File) {
    setFile(uploadedFile);
    setError(null);
  }

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Portfolio</h1>
          <p className="text-gray-600 mt-2">
            Upload your resume and let AI create a stunning portfolio for you
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Details</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300" />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Upload</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300" />
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Processing</span>
            </div>
          </div>
        </div>

        {/* Step 1: Portfolio Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Details</CardTitle>
              <CardDescription>Choose a name and template for your portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Portfolio Name</Label>
                <Input
                  id="name"
                  placeholder="My Professional Portfolio"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  This will be used as the title of your portfolio
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Continue to Upload
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Resume Upload */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload your resume in PDF or DOCX format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResumeUpload onUpload={handleFileUpload} loading={loading} />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleCreatePortfolio}
                  disabled={!file || loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? 'Creating...' : 'Create Portfolio'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Creating Your Portfolio</CardTitle>
              <CardDescription>This may take a few moments...</CardDescription>
            </CardHeader>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4" />
                <p className="text-gray-600">Processing your resume and creating your portfolio...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
