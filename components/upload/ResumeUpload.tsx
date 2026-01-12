'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResumeUploadProps {
  onUpload: (file: File) => void;
  loading?: boolean;
}

export function ResumeUpload({ onUpload, loading = false }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('File is too large. Maximum size is 10MB.');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a PDF or DOCX file.');
        } else {
          setError('File upload failed. Please try again.');
        }
        return;
      }

      const uploadedFile = acceptedFiles[0];
      if (uploadedFile) {
        setFile(uploadedFile);
        onUpload(uploadedFile);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: loading,
  });

  function removeFile() {
    setFile(null);
    setError(null);
  }

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

          {isDragActive ? (
            <p className="text-lg text-blue-600 font-medium">
              Drop your resume here...
            </p>
          ) : (
            <>
              <p className="text-lg text-gray-700 font-medium mb-2">
                Drop your resume here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF and DOCX files (max 10MB)
              </p>
            </>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-green-500 bg-green-50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <p className="font-medium text-gray-900">{file.name}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {loading && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    Processing your resume...
                  </p>
                )}
              </div>
            </div>
            {!loading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
