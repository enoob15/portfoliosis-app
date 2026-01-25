import React from 'react';
import { PortfolioTemplate } from '@/lib/templates/registry';
import { ResumeProfile } from '@/lib/ai/gemini';

interface LivePreviewProps {
    template: PortfolioTemplate;
    data: ResumeProfile;
}

export default function LivePreview({ template, data }: LivePreviewProps) {
    const Component = template.component;

    // In the future, we might wrap this in an ErrorBoundary
    return <Component data={data} />;
}
