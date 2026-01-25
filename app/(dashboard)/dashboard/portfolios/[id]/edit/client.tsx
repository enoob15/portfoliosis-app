'use client';

import { useState, useEffect } from 'react';
import { PortfolioTemplate, getTemplate } from '@/lib/templates/registry';
import { ResumeProfile } from '@/lib/ai/gemini';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/db/supabase';
import { toast } from 'sonner';

// Components
import { publishPortfolio, unpublishPortfolio } from '@/app/actions/portfolio';
import LivePreview from '@/components/editor/LivePreview';
import DataForm from '@/components/editor/DataForm';

interface EditorClientProps {
    portfolio: any;
    initialData: ResumeProfile;
}

export default function EditorClient({ portfolio, initialData }: EditorClientProps) {
    const [data, setData] = useState<ResumeProfile>(initialData);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [status, setStatus] = useState<'draft' | 'published'>(portfolio.status);

    // Default to our main template for now
    const templateId = 'modern-tech-professional';
    const template = getTemplate(templateId);

    const handleSave = async () => {
        setSaving(true);
        const supabase = createBrowserClient();

        // Save both resume_data (source of truth) and optionally refined data
        const { error } = await supabase
            .from('portfolios')
            .update({
                resume_data: data,
                updated_at: new Date().toISOString()
            })
            .eq('id', portfolio.id);

        if (error) {
            toast.error('Failed to save changes');
        } else {
            toast.success('Changes saved successfully');
        }
        setSaving(false);
    };

    const handlePublish = async () => {
        setPublishing(true);
        if (status === 'draft') {
            const result = await publishPortfolio(portfolio.id);
            if (result.success) {
                setStatus('published');
                toast.success('Portfolio published successfully!');
            } else {
                toast.error(result.error);
            }
        } else {
            const result = await unpublishPortfolio(portfolio.id);
            if (result.success) {
                setStatus('draft');
                toast.success('Portfolio unpublished.');
            } else {
                toast.error(result.error);
            }
        }
        setPublishing(false);
    };

    if (!template) return <div>Template not found or registry error.</div>;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-10 shadow-sm">
                <div className="flex items-center">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 mr-4">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">{portfolio.name}</h1>
                        <p className="text-xs text-gray-500">Editing with {template.name} Template</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {status === 'published' && (
                        <a
                            href={`/p/${portfolio.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline mr-4"
                        >
                            View Live Site
                        </a>
                    )}
                    <Button size="sm" variant={status === 'published' ? "outline" : "default"} onClick={handlePublish} disabled={publishing || saving}>
                        {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (status === 'published' ? 'Unpublish' : 'Publish')}
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            {/* Main Workspace - Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Editor Form */}
                <div className="w-1/2 md:w-[450px] lg:w-[500px] border-r border-gray-200 bg-white overflow-y-auto">
                    <DataForm data={data} onChange={setData} />
                </div>

                {/* Right: Live Preview */}
                <div className="flex-1 bg-gray-100 overflow-y-auto p-8 flex justify-center">
                    {/* We wrap preview in a container to simulate a 'window' or just center it */}
                    <div className="w-full max-w-[1200px] bg-white shadow-2xl rounded-lg overflow-hidden min-h-[800px] origin-top transform scale-95">
                        <LivePreview template={template} data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
}
