'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { parseResume } from '@/app/actions/parse-resume';
import { ResumeData } from '@/lib/parsers/types';

export function ResumeUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ResumeData | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx'))) {
            setFile(droppedFile);
            setError(null);
        } else {
            setError('Please upload a PDF or DOCX file.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsParsing(true);
        setError(null);
        setData(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await parseResume(formData);

            if (result.success && result.data) {
                setData(result.data);
            } else {
                setError(result.error || 'Failed to parse resume');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Your Resume</CardTitle>
                    <CardDescription>
                        We support PDF and DOCX formats. Our AI will extract your details automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium">{file.name}</p>
                                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setData(null); }} className="text-destructive hover:text-destructive">
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium">Drag and drop your resume here</p>
                                    <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                                </div>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".pdf,.docx"
                                    onChange={handleFileChange}
                                />
                                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                                    Select File
                                </Button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {data && (
                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Resume Parsed Successfully!</span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-3 text-sm">
                                {data.parsed && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Name</label>
                                                <p className="font-medium">{data.parsed.personalInfo?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                                                <p className="font-medium">{data.parsed.personalInfo?.email || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Skills Found</label>
                                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300">
                                                {(data.parsed.skills || []).slice(0, 5).map((skill: string, i: number) => (
                                                    <li key={i}>{skill}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">Experience</label>
                                            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300">
                                                {(data.parsed.experience || []).slice(0, 2).map((exp: any, i: number) => (
                                                    <li key={i}>{exp.position} at {exp.company}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end">
                    {file && !data && (
                        <Button onClick={handleUpload} disabled={isParsing} className="w-full sm:w-auto">
                            {isParsing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing with AI...
                                </>
                            ) : (
                                'Analyze Resume'
                            )}
                        </Button>
                    )}
                    {data && (
                        <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                            Continue to Portfolio Builder
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
