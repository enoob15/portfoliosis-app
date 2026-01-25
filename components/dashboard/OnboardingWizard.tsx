
'use client';

import { useState } from 'react';
import { OnboardingCards } from './OnboardingCards';
import { ResumeUploader } from './ResumeUploader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function OnboardingWizard() {
    const [step, setStep] = useState<'selection' | 'resume' | 'linkedin' | 'manual' | 'links'>('selection');

    const handleBack = () => {
        setStep('selection');
    };

    return (
        <div className="w-full py-8">
            {step !== 'selection' && (
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="mb-6 hover:bg-transparent hover:text-primary pl-0"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to options
                </Button>
            )}

            {step === 'selection' && (
                <OnboardingCards onSelect={setStep} />
            )}

            {step === 'resume' && (
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-semibold">Upload your Resume</h2>
                        <p className="text-gray-500">Supported formats: PDF, DOCX</p>
                    </div>
                    <ResumeUploader />
                </div>
            )}

            {step === 'linkedin' && (
                <div className="max-w-md mx-auto text-center py-12">
                    <p className="text-lg font-medium">LinkedIn Import coming soon</p>
                    <p className="text-gray-500">We are working on this feature.</p>
                </div>
            )}

            {step === 'manual' && (
                <div className="max-w-md mx-auto text-center py-12">
                    <p className="text-lg font-medium">Manual Entry coming soon</p>
                    <p className="text-gray-500">For now, try uploading a resume to get started.</p>
                </div>
            )}

            {step === 'links' && (
                <div className="max-w-md mx-auto text-center py-12">
                    <p className="text-lg font-medium">Link Collection coming soon</p>
                </div>
            )}
        </div>
    );
}
