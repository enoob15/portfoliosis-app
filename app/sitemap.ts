import { createSessionClient } from '@/lib/db/supabase-server';

export default async function sitemap() {
    const supabase = await createSessionClient();

    const { data: portfolios } = await supabase
        .from('portfolios')
        .select('slug, updated_at')
        .eq('status', 'published');

    const baseUrl = 'https://portfoliosis.com'; // In real app, env var

    const portfolioUrls = (portfolios || []).map((portfolio) => ({
        url: `${baseUrl}/p/${portfolio.slug}`,
        lastModified: new Date(portfolio.updated_at),
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        ...portfolioUrls,
    ];
}
