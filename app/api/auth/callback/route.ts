import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createBrowserClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
