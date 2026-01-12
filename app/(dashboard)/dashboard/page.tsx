'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FileText, Eye, Settings, Trash2 } from 'lucide-react';

interface Portfolio {
  id: string;
  name: string;
  slug: string;
  template_id: string;
  status: 'draft' | 'published' | 'archived';
  is_public: boolean;
  deployment_url?: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, []);

  async function loadPortfolios() {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setPortfolios(data);
    }
    setLoading(false);
  }

  async function deletePortfolio(id: string) {
    if (!confirm('Are you sure you want to delete this portfolio?')) {
      return;
    }

    const supabase = createBrowserClient();
    const { error } = await supabase.from('portfolios').delete().eq('id', id);

    if (!error) {
      setPortfolios(portfolios.filter((p) => p.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2 text-sm text-gray-600">Loading portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Portfolios</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your professional portfolio websites
          </p>
        </div>
        <Link href="/dashboard/portfolios/new">
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Portfolio
          </Button>
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No portfolios yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first portfolio from your resume
            </p>
            <Link href="/dashboard/portfolios/new">
              <Button>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Your First Portfolio
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{portfolio.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {portfolio.slug}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      portfolio.status === 'published'
                        ? 'default'
                        : portfolio.status === 'draft'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {portfolio.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Template:</span>
                    <span className="capitalize">
                      {portfolio.template_id.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Visibility:</span>
                    <span>{portfolio.is_public ? 'Public' : 'Private'}</span>
                  </div>
                  {portfolio.deployment_url && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">URL:</span>
                      <a
                        href={portfolio.deployment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {portfolio.deployment_url}
                      </a>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 pt-2">
                    Updated {new Date(portfolio.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Link
                  href={`/dashboard/portfolios/${portfolio.id}/edit`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                {portfolio.deployment_url && (
                  <a
                    href={portfolio.deployment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </a>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletePortfolio(portfolio.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
