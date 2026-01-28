'use client';

import { useState } from 'react';
import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { Button } from '@/components/ui/button';
import { submitManualPortfolio } from '@/app/actions/manual-portfolio';
import { toast } from 'sonner';
import { Check, AlertCircle, Loader2, User, Briefcase, GraduationCap, Code, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewStepProps {
  onComplete?: (portfolioId: string) => void;
}

export default function ReviewStep({ onComplete }: ReviewStepProps) {
  const { data, draftId, hasStepData } = useManualPortfolio();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const completionStatus = {
    personal: hasStepData('personal'),
    experience: hasStepData('experience'),
    education: hasStepData('education'),
    skills: hasStepData('skills'),
    projects: hasStepData('projects')
  };

  const isComplete = Object.values(completionStatus).filter(Boolean).length >= 4; // At least 4 sections

  const handleSubmit = async () => {
    if (!isComplete || !draftId) {
      toast.error('Please complete all required sections');
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitManualPortfolio(data as any, draftId);
      toast.success('Portfolio created successfully!');

      if (onComplete) {
        onComplete(result.portfolioId);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to create portfolio');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
        <p className="text-gray-600">
          Review your portfolio information before submitting.
        </p>
      </div>

      {/* Completion Status */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg mb-4">Completion Status</h3>

        <div className="space-y-3">
          <StatusItem
            icon={<User className="w-5 h-5" />}
            label="Personal Information"
            completed={completionStatus.personal}
            required
          />
          <StatusItem
            icon={<Briefcase className="w-5 h-5" />}
            label="Work Experience"
            completed={completionStatus.experience}
            required
          />
          <StatusItem
            icon={<GraduationCap className="w-5 h-5" />}
            label="Education"
            completed={completionStatus.education}
            required
          />
          <StatusItem
            icon={<Code className="w-5 h-5" />}
            label="Skills"
            completed={completionStatus.skills}
            required
          />
          <StatusItem
            icon={<Folder className="w-5 h-5" />}
            label="Projects"
            completed={completionStatus.projects}
            required={false}
          />
        </div>
      </div>

      {/* Summary Preview */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Portfolio Summary</h3>

        {data.personal && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Personal Info</h4>
            <p className="text-sm">
              {data.personal.name} - {data.personal.title}
            </p>
            <p className="text-sm text-gray-600">{data.personal.email}</p>
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Experience</h4>
            <p className="text-sm">{data.experience.length} position(s)</p>
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Education</h4>
            <p className="text-sm">{data.education.length} degree(s)</p>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Skills</h4>
            <p className="text-sm">{data.skills.length} skill(s)</p>
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Projects</h4>
            <p className="text-sm">{data.projects.length} project(s)</p>
          </div>
        )}
      </div>

      {/* Validation Message */}
      {!isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Incomplete Portfolio</p>
            <p className="text-sm text-amber-700 mt-1">
              Please complete at least Personal Info, Experience, Education, and Skills sections.
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          Save as Draft
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || submitting}
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Portfolio...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Create Portfolio
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function StatusItem({
  icon,
  label,
  completed,
  required
}: {
  icon: React.ReactNode;
  label: string;
  completed: boolean;
  required: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className={completed ? 'text-green-600' : 'text-gray-400'}>
          {icon}
        </div>
        <div>
          <p className="font-medium text-sm">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </p>
        </div>
      </div>
      {completed ? (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          Complete
        </div>
      ) : (
        <div className="text-sm text-gray-500">Incomplete</div>
      )}
    </div>
  );
}
