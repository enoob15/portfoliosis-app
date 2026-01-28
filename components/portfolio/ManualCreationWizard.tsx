'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ManualPortfolioProvider, useManualPortfolioContext } from '@/contexts/ManualPortfolioContext';
import { ErrorBoundary } from './ErrorBoundary';
import { ProgressIndicator } from './shared/ProgressIndicator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Save, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Step components (dynamically loaded for code splitting)
const PersonalInfoStep = dynamic(() => import('./steps/PersonalInfoStep'), {
  loading: () => <div className="flex items-center justify-center py-12 text-gray-500">Loading step...</div>
});
const ExperienceStep = dynamic(() => import('./steps/ExperienceStep'), {
  loading: () => <div className="flex items-center justify-center py-12 text-gray-500">Loading step...</div>
});
const EducationStep = dynamic(() => import('./steps/EducationStep'), {
  loading: () => <div className="flex items-center justify-center py-12 text-gray-500">Loading step...</div>
});
const SkillsStep = dynamic(() => import('./steps/SkillsStep'), {
  loading: () => <div className="flex items-center justify-center py-12 text-gray-500">Loading step...</div>
});
const ProjectsStep = dynamic(() => import('./steps/ProjectsStep'), {
  loading: () => <div className="flex items-center justify-center py-12 text-gray-500">Loading step...</div>
});
const ReviewStep = dynamic(() => import('./steps/ReviewStep'), {
  loading: () => <div className="flex items-center justify-center py-12 text-gray-500">Loading step...</div>
});

interface ManualCreationWizardProps {
  onComplete?: (portfolioId: string) => void;
  draftId?: string;
}

const STEPS = [
  {
    id: 'personal',
    label: 'Personal Info',
    description: 'Basic information'
  },
  {
    id: 'experience',
    label: 'Experience',
    description: 'Work history'
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Academic background'
  },
  {
    id: 'skills',
    label: 'Skills',
    description: 'Technical & soft skills'
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Portfolio work'
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Final review'
  }
];

function WizardContent({ onComplete }: { onComplete?: (portfolioId: string) => void }) {
  const {
    state,
    canGoNext,
    canGoBack,
    nextStep,
    previousStep,
    saveDraft,
    loadDraft,
    reset
  } = useManualPortfolioContext();

  const [showDraftRecovery, setShowDraftRecovery] = useState(false);

  // Check for existing draft on mount
  useEffect(() => {
    const checkDraft = () => {
      try {
        const stored = localStorage.getItem('portfoliosis_manual_draft');
        if (stored) {
          const { data, timestamp } = JSON.parse(stored);
          // Only show recovery if there's actual data and it's not empty
          if (data && Object.keys(data).length > 0) {
            setShowDraftRecovery(true);
          }
        }
      } catch (error) {
        console.error('Failed to check for draft:', error);
      }
    };

    checkDraft();
  }, []);

  const handleLoadDraft = () => {
    loadDraft();
    setShowDraftRecovery(false);
    toast.success('Draft loaded successfully');
  };

  const handleStartFresh = () => {
    reset();
    setShowDraftRecovery(false);
    toast.info('Starting fresh portfolio');
  };

  const handleSave = async () => {
    try {
      await saveDraft();
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 'personal':
        return <PersonalInfoStep />;
      case 'experience':
        return <ExperienceStep />;
      case 'education':
        return <EducationStep />;
      case 'skills':
        return <SkillsStep />;
      case 'projects':
        return <ProjectsStep />;
      case 'review':
        return <ReviewStep onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Draft Recovery Dialog */}
      <Dialog open={showDraftRecovery} onOpenChange={setShowDraftRecovery}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <DialogTitle>Resume Previous Work?</DialogTitle>
            </div>
            <DialogDescription>
              We found a draft portfolio you were working on. Would you like to continue where you left off or start fresh?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={handleStartFresh}
            >
              Start Fresh
            </Button>
            <Button
              onClick={handleLoadDraft}
            >
              Continue Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Portfolio</h1>
          <p className="text-gray-600">
            Fill in your information step by step. Your progress is saved automatically.
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          steps={STEPS}
          currentStep={state.currentStep}
          className="mb-12"
        />

        {/* Save Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">
            {state.isSaving && (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                Saving...
              </span>
            )}
            {!state.isSaving && state.lastSaved && (
              <span>
                Last saved {formatDistanceToNow(state.lastSaved, { addSuffix: true })}
              </span>
            )}
            {!state.isSaving && !state.lastSaved && state.isDirty && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={state.isSaving || !state.isDirty}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border p-8 mb-8 min-h-[500px]">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={!canGoBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={nextStep}
            disabled={!canGoNext}
          >
            {state.currentStep === 'review' ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function ManualCreationWizard({ onComplete, draftId }: ManualCreationWizardProps) {
  return (
    <ErrorBoundary>
      <ManualPortfolioProvider>
        <WizardContent onComplete={onComplete} />
      </ManualPortfolioProvider>
    </ErrorBoundary>
  );
}
