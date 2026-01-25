# Portfoliosis Architecture & Setup Guide

## System Overview
Portfoliosis is a web application that generates professional portfolios from resume files using AI. It is built with Next.js 14+, Supabase, and Tailwind CSS.

### Core Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Shadcn UI
- **AI/LLM**: Google Gemini 1.5 Flash (Resume Parsing) & Anthropic Claude 3.5 Sonnet (Content Enhancement)
- **File Parsing**: `pdf-parse` (PDF) and `mammoth` (DOCX)

## Architecture Components

### 1. Resume Parser (Phase 2)
- **Entry**: `ResumeUploader` component (`components/dashboard/ResumeUploader.tsx`).
- **Action**: `parseResumeAction` (`app/actions/parse-resume.ts`).
- **Process**:
    1.  User uploads file.
    2.  Server action determines file type.
    3.  Text is extracted using `pdf-parse` or `mammoth`.
    4.  Raw text is sent to Gemini 1.5 Flash with a structured schema prompt (`lib/ai/gemini.ts`).
    5.  Returns a structured `ResumeProfile` object.

### 2. Portfolio Builder (Phase 3)
- **Data Storage**: Resume data is stored in the `portfolios` table in Supabase as a JSONB column (`resume_data`).
- **Editor**: Located at `/dashboard/portfolios/[id]/edit`.
    - Uses a split-pane layout: `DataForm` (Left) vs `LivePreview` (Right).
    - **Templates**: React components stored in `lib/templates/`.  
        - Current Template: `TechProfessional` (`lib/templates/modern/TechProfessional.tsx`).
        - Registry: `lib/templates/registry.ts` maps DB IDs to components.

### 3. Publishing Engine (Phase 4)
- **Public Route**: `/p/[slug]` (`app/p/[slug]/page.tsx`).
    - Dynamic route that fetches portfolio by slug.
    - Checks `status === 'published'`.
- **SEO**:
    - `generateMetadata` function dynamically builds OpenGraph tags from the resume content.
    - `sitemap.ts` and `robots.ts` generate strict indexing rules.

## Local Development & Configuration

### Environment Variables
Required keys in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_AI_API_KEY` (Gemini)
- `ANTHROPIC_API_KEY` (Claude)

### Port Configuration
**IMPORTANT**: By default, Next.js attempts to run on **Port 3000**.
If Port 3000 is in use (e.g., by OpenWebUI), Next.js will automatically try 3001, 3002, etc.

To **force** a specific port safely (recommended to avoid conflicts):
```bash
# Run on Port 3005
npm run dev -- -p 3005
```

### Database Schema
- **Table**: `portfolios`
    - `id`: UUID (Primary Key)
    - `user_id`: UUID (FK to auth.users)
    - `slug`: Text (Unique, Public URL key)
    - `status`: 'draft' | 'published'
    - `resume_data`: JSONB (Stores the entire resume profile)
    - `template_id`: Text (ID of the chosen design template)

## Current Implementation Status
- **Completed**: Phase 1-4 (Setup, Parser, Builder, Publishing).
- **Verified**: Production build passes. Resume parsing and templating are functional.

