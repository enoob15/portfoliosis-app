'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Trash2, Clock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/format';
import Link from 'next/link';

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  source_type: 'resume' | 'linkedin' | 'github' | 'manual';
  status: 'uploaded' | 'processing' | 'parsed' | 'failed';
  error_message?: string;
  upload_date: string;
  processed_at?: string;
  enhancement_status: 'pending' | 'processing' | 'enhanced' | 'failed';
  portfolios?: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
  }>;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const { getUserDocuments } = await import('@/app/actions/portfolio');
      const result = await getUserDocuments();
      
      if (result.success && result.data) {
        setDocuments(result.data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { uploadDocument } = await import('@/app/actions/portfolio');
      const result = await uploadDocument(file, 'resume');
      
      if (result.success) {
        // Parse the uploaded document
        const { parseResume } = await import('@/app/actions/parse-resume');
        const formData = new FormData();
        formData.append('file', file);
        
        const parseResult = await parseResume(formData);
        
        if (parseResult.success && parseResult.data) {
          const { updateDocument } = await import('@/app/actions/portfolio');
          await updateDocument(result.data.id, {
            extractedText: parseResult.data.text,
            parsedData: parseResult.data.parsed,
            status: 'parsed'
          });
        }
        
        // Reload documents list
        await loadDocuments();
      } else {
        alert(result.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const { deleteDocument } = await import('@/app/actions/portfolio');
      const result = await deleteDocument(id);
      
      if (result.success) {
        setDocuments(documents.filter(doc => doc.id !== id));
      } else {
        alert(result.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'uploaded':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'parsed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  }

  function getEnhancementIcon(status: string) {
    switch (status) {
      case 'enhanced':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2 text-sm text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">
            Upload and manage your resumes and other documents for portfolio creation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="file-upload">
            <Button asChild disabled={uploading}>
              <span>
                <Upload className="mr-2 h-5 w-5" />
                {uploading ? 'Uploading...' : 'Upload Document'}
              </span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Upload your resume to get started with creating your portfolio
            </p>
            <label htmlFor="file-upload-empty">
              <Button asChild disabled={uploading}>
                <span>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Your First Document
                </span>
              </Button>
              <input
                id="file-upload-empty"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">{document.file_name}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>•</span>
                      <span className="capitalize">{document.source_type}</span>
                      <span>•</span>
                      <span>Uploaded {new Date(document.upload_date).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getStatusIcon(document.status)}
                      {document.status}
                    </Badge>
                    {document.status === 'parsed' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getEnhancementIcon(document.enhancement_status)}
                        {document.enhancement_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {document.error_message && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Processing Error</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{document.error_message}</p>
                    </div>
                  )}

                  {document.portfolios && document.portfolios.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Used in portfolios:</h4>
                      <div className="flex flex-wrap gap-2">
                        {document.portfolios.map((portfolio) => (
                          <Link key={portfolio.id} href={`/dashboard/portfolios/${portfolio.id}/edit`}>
                            <Badge variant="secondary" className="hover:bg-gray-200 cursor-pointer">
                              {portfolio.name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {document.processed_at && (
                        <span>Processed {new Date(document.processed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {document.status === 'parsed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const { createPortfolio } = await import('@/app/actions/portfolio');
                              const result = await createPortfolio({
                                name: `${document.file_name.replace(/\.[^/.]+$/, '')} Portfolio`,
                                documentId: document.id
                              });
                              
                              if (result.success) {
                                alert('Portfolio created successfully!');
                                window.location.href = `/dashboard/portfolios/${result.data.id}/edit`;
                              } else {
                                alert(result.error || 'Failed to create portfolio');
                              }
                            } catch (error) {
                              console.error('Portfolio creation error:', error);
                              alert('Failed to create portfolio');
                            }
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Create Portfolio
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}