# Portfoliosis Implementation Guide

**CTO Technical Brief - Devon Cross**
**Date**: December 25, 2025
**Project**: Portfoliosis AI Portfolio Builder
**Timeline**: 16 weeks to MVP launch

---

## Executive Summary

This guide provides concrete implementation instructions for the Portfoliosis development team. It breaks down the 16-week roadmap into weekly sprints with specific deliverables, technical decisions, and team assignments.

**Current Status**: Phase 1 foundation complete (Day 1)
**Next Steps**: Supabase setup, authentication, database schema

---

## Team Assignments by Phase

### Phase 1: Foundation (Weeks 1-3)
**Lead**: Maya Patel (Web Development Lead)
**Support**: Sarah Okonkwo (Architecture Review), Lisa Klein (Design System)

### Phase 2: AI Engine (Weeks 4-6)
**Lead**: James Chen (AI & Automation Lead)
**Support**: Sarah Okonkwo (Cost Optimization), Devon Cross (Orchestration Architecture)

### Phase 3: Template System (Weeks 7-9)
**Lead**: Lisa Klein (Design) + Maya Patel (Implementation)
**Support**: Sarah Okonkwo (Accessibility Audit)

### Phase 4: Editor & Customization (Weeks 10-11)
**Lead**: Maya Patel (Frontend) + James Chen (AI Assistant)
**Support**: Lisa Klein (UX Review)

### Phase 5: Deployment Pipeline (Weeks 12-13)
**Lead**: Sarah Okonkwo (Deployment Strategy) + Maya Patel (Implementation)
**Support**: Neo (CI/CD Setup)

### Phase 6: Polish & Launch (Weeks 14-16)
**Lead**: Devon Cross (Overall Quality) + All Team Members
**Support**: Security Specialist (External Audit)

---

## Week-by-Week Implementation Plan

### Week 1 (Dec 25 - Dec 31): Project Setup [COMPLETED]

**Status**: ✅ COMPLETE

**Completed Tasks**:
- ✅ Next.js 15 + TypeScript + App Router
- ✅ Tailwind CSS + Shadcn UI
- ✅ Folder structure
- ✅ TypeScript type definitions
- ✅ Environment variables template
- ✅ Architecture documentation (ADRs)
- ✅ Git repository initialized

**Next Steps for Week 2**:
- Set up Supabase project
- Implement database schema
- Create authentication flows

---

### Week 2 (Jan 1 - Jan 7): Database & Authentication

**Owner**: Maya Patel
**Goal**: Users can sign up, log in, and access a protected dashboard

#### Tasks

**1. Supabase Project Setup**
```bash
# Create Supabase project at https://app.supabase.com
# Copy credentials to .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. Database Schema Implementation**

Create file: `lib/db/schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth, but we can extend)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'tech-professional',

  -- Source data (JSONB for flexibility)
  resume_data JSONB,
  linkedin_data JSONB,
  github_data JSONB,
  manual_data JSONB,

  -- Processed data
  enhanced_profile JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- Design
  customization JSONB,
  theme JSONB,

  -- Deployment
  deployment_config JSONB,
  deployment_url TEXT,
  custom_domain TEXT,

  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'published', 'archived', 'error')),
  is_public BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  CONSTRAINT portfolios_user_id_slug_key UNIQUE (user_id, slug)
);

-- Portfolio versions (for history)
CREATE TABLE portfolio_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT portfolio_versions_unique UNIQUE (portfolio_id, version_number)
);

-- AI processing jobs
CREATE TABLE ai_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('parse', 'enhance', 'generate', 'validate')),
  input_data JSONB,
  output_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Templates
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tech', 'creative', 'business', 'academic', 'freelancer')),
  config JSONB NOT NULL,
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_status ON portfolios(status);
CREATE INDEX idx_ai_jobs_portfolio_id ON ai_jobs(portfolio_id);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status);

-- Row-Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for portfolio_versions and ai_jobs
CREATE POLICY "Users can view own portfolio versions"
  ON portfolio_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM portfolios WHERE id = portfolio_id AND user_id = auth.uid()));

CREATE POLICY "Users can view own AI jobs"
  ON ai_jobs FOR SELECT
  USING (EXISTS (SELECT 1 FROM portfolios WHERE id = portfolio_id AND user_id = auth.uid()));

-- Templates are public
CREATE POLICY "Templates are viewable by everyone"
  ON templates FOR SELECT
  TO public
  USING (is_active = true);

-- Functions for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

Run this in Supabase SQL Editor.

**3. Supabase Client Setup**

Create file: `lib/db/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

**4. Authentication Implementation**

Create file: `app/(auth)/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/portfolios')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Portfoliosis</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**5. Protected Route Middleware**

Create file: `middleware.ts` (root level)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/portfolios') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect logged-in users away from auth pages
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/portfolios', req.url))
  }

  return res
}

export const config = {
  matcher: ['/portfolios/:path*', '/login', '/signup'],
}
```

**Deliverable**: Users can sign up, log in, and access a protected dashboard.

**Testing Checklist**:
- [ ] User can sign up with email/password
- [ ] User receives confirmation email
- [ ] User can log in
- [ ] Dashboard route is protected (redirects to /login if not authenticated)
- [ ] Logged-in users are redirected away from /login

---

### Week 3 (Jan 8 - Jan 14): File Upload & Basic UI

**Owner**: Maya Patel
**Goal**: Users can upload resumes and see basic parsed data

#### Tasks

**1. File Upload Component**

Create file: `components/upload/ResumeUpload.tsx`

```typescript
'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ResumeUploadProps {
  onUpload: (file: File) => Promise<void>
}

export function ResumeUpload({ onUpload }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setProgress(0)

    try {
      // Simulate progress (replace with actual upload progress)
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      await onUpload(file)

      clearInterval(interval)
      setProgress(100)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 1000)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <Card className="p-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Uploading...</p>
            <Progress value={progress} className="w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
            </p>
            <p className="text-sm text-gray-500">or click to browse</p>
            <p className="text-xs text-gray-400">PDF or DOCX (max 5MB)</p>
          </div>
        )}
      </div>
    </Card>
  )
}
```

**2. Dashboard Page**

Create file: `app/(dashboard)/portfolios/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function PortfoliosPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch user's portfolios
  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Portfolios</h1>
        <Link href="/portfolios/new">
          <Button>Create New Portfolio</Button>
        </Link>
      </div>

      {portfolios && portfolios.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id}>
              <CardHeader>
                <CardTitle>{portfolio.name}</CardTitle>
                <CardDescription>
                  Status: {portfolio.status}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/portfolios/${portfolio.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    Edit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No portfolios yet</p>
          <Link href="/portfolios/new">
            <Button>Create Your First Portfolio</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
```

**Deliverable**: Basic dashboard showing user's portfolios, with upload capability.

---

### Week 4-6: AI Engine (Details in separate document)

**Lead**: James Chen

Key components:
- Resume parser (pdf-parse, mammoth)
- AI orchestration layer
- Prompt templates
- Validation system

---

### Week 7-9: Template System (Details in separate document)

**Lead**: Lisa Klein + Maya Patel

Key components:
- 5 professional templates
- Responsive layouts
- Theme system
- Preview renderer

---

## Critical Technical Decisions

### 1. AI Cost Management

**Problem**: Multi-model AI can cost $2/portfolio

**Solution**:
- Use cheaper models: GPT-4o-mini ($0.15/1M tokens), Claude Haiku, Gemini Flash
- Implement Redis caching with 30-day TTL
- Target cost: <$0.20/portfolio

**Implementation**:
```typescript
// lib/ai/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

export async function getCachedAIResult(cacheKey: string) {
  return await redis.get(cacheKey)
}

export async function setCachedAIResult(cacheKey: string, result: any, ttl = 2592000) { // 30 days
  await redis.setex(cacheKey, ttl, JSON.stringify(result))
}
```

### 2. Hallucination Detection

**Problem**: AI can generate fake information

**Solution**:
- Cross-reference AI outputs with source data
- Confidence scoring on all generated content
- Flag low-confidence content for user review

**Implementation**:
```typescript
// lib/ai/validation.ts
export function detectHallucination(
  aiOutput: string,
  sourceData: string[],
  threshold = 0.8
): HallucinationFlag[] {
  // Compare AI output with source data using cosine similarity
  // Flag content below threshold
}
```

### 3. Real-Time Preview Security

**Problem**: Rendering user content safely (XSS risk)

**Solution**:
- Use Shadow DOM isolation
- Implement strict CSP headers
- Sanitize all user inputs with DOMPurify

---

## Next Actions (Week 2 Handoff to Maya Patel)

**Immediate Priority**:
1. Set up Supabase project
2. Run schema.sql in Supabase SQL Editor
3. Implement authentication pages (login, signup)
4. Create protected dashboard route
5. Test authentication flow end-to-end

**Blocked By**: None

**Questions for Devon Cross**:
- Confirm Supabase project region (us-east-1 recommended)
- Verify OAuth providers priority (LinkedIn > GitHub?)

---

**Document Maintained By**: Devon Cross (CTO)
**Last Updated**: December 25, 2025
**Next Review**: January 1, 2026
