import { createSessionClient } from '@/lib/db/supabase-server';
import { redirect, notFound } from 'next/navigation';
import { ResumeProfile } from '@/lib/ai/gemini';
import EditorClient from './client';

export default async function EditorPage({ params }: { params: { id: string } }) {
    const supabase = await createSessionClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!portfolio) notFound();

    // Ensure we have valid resume data, otherwise provide defaults
    const resumeData = (portfolio.resume_data as ResumeProfile) || {
        contact: { name: 'Your Name', email: 'email@example.com', phone: '' },
        summary: 'Write a professional summary here...',
        experience: [],
        education: [],
        skills: [],
        projects: []
    };

    return <EditorClient portfolio={portfolio} initialData={resumeData} />;
}
