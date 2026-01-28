'use client';

import { useRouter } from 'next/navigation';
import { ManualCreationWizard } from '@/components/portfolio/ManualCreationWizard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewPortfolioPage() {
  const router = useRouter();

  const handleComplete = async (portfolioId: string) => {
    toast.success('Portfolio created successfully!');
    router.push(`/dashboard/portfolios/${portfolioId}`);
  };

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <ManualCreationWizard onComplete={handleComplete} />
    </div>
  );
}
