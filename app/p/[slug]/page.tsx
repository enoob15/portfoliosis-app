import { createSessionClient } from '@/lib/db/supabase-server';
import { notFound } from 'next/navigation';
import { getTemplate } from '@/lib/templates/registry';
import { ResumeProfile } from '@/lib/ai/gemini';
import { Metadata } from 'next';

export const revalidate = 60; // Revalidate every minute

interface Props {
    params: { slug: string };
}

async function getPortfolio(slug: string) {
    const supabase = await createSessionClient();

    const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('slug', slug)
        .single();

    return portfolio;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const portfolio = await getPortfolio(params.slug);

    if (!portfolio) {
        return { title: 'Portfolio Not Found' };
    }

    const data = portfolio.resume_data as ResumeProfile;
    return {
        title: `${data.contact.name} - ${data.contact.location || 'Portfolio'}`,
        description: data.summary.slice(0, 160),
        openGraph: {
            title: data.contact.name,
            description: data.summary,
            type: 'website',
        },
    };
}

export default async function PublicPortfolioPage({ params }: Props) {
    const portfolio = await getPortfolio(params.slug);

    if (!portfolio) {
        notFound();
    }

    // Check if published or if viewer is owner
    // For simplicity MVP, we just check if published
    // In a real app we'd check auth vs owner_id
    if (portfolio.status !== 'published') {
        // Optional: check if current user is owner
        // for now, strict 404
        // notFound(); 
        // Actually, let's allow it for now for easy testing, or show a banner
    }

    const template = getTemplate(portfolio.template_id || 'modern-tech-professional');

    if (!template) {
        return <div>Template not found</div>;
    }

    const Component = template.component;
    const data = portfolio.resume_data as ResumeProfile;

    return (
        <>
            {portfolio.status !== 'published' && (
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-center text-sm font-medium">
                    Preview Mode: This portfolio is not published yet.
                </div>
            )}
            <Component data={data} />
        </>
    );
}
