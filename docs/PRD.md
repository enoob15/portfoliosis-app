# Portfoliosis - Master Product Requirements Document (PRD)

**Version:** 1.0
**Date:** January 16, 2026
**Status:** Active - Phase 2 (AI Engine)

---

## 1. Executive Summary

Portfoliosis is a next-generation AI portfolio builder that transforms resumes and professional data (LinkedIn, GitHub) into stunning, personalized portfolio websites. Unlike simple template wrappers, it uses a multi-model AI ensemble to extract deep context, generate compelling narratives, and optimize for both human readers and ATS systems.

### Core Value Proposition
*   **Deep Context**: "Understand me, don't just copy my resume."
*   **Professional Storytelling**: "Write about me better than I can."
*   **Design Intelligence**: "Make me look like a pro designer made this."
*   **Data Ownership**: "My data, my code, deployed where I want."

---

## 2. Success Metrics

### Technical
-   **Resume Parsing Accuracy**: >95%
-   **AI Hallucination Rate**: <4% (via ensemble validation)
-   **Performance**: Lighthouse score >95, TTI <2s
-   **Build Time**: Static site generation <30s

### User Experience
-   **Time to First Portfolio**: <5 minutes
-   **Completion Rate**: >80% (Upload to Publish)
-   **Satisfaction**: >4.5/5 stars

---

## 3. Product Features & Requirements

### 3.1 Multi-Source Data Ingestion
**Goal**: Create a comprehensive professional profile from scattered digital footprints.

*   **Resume Parsing**: Support PDF/DOCX. Extract Contact, Experience, Education, Skills, Projects.
    *   *Tools*: `pdf-parse`, `mammoth`.
*   **LinkedIn Integration**: Import Headlines, Summaries, Experience, Recommendations.
*   **GitHub Integration**: Import Repositories, Contribution stats, Pinned projects, Languages.
*   **Manual Override**: Allow users to edit extracted data or add custom fields.

### 3.2 AI Ensemble Engine
**Goal**: Use specialized models for specific tasks to maximize quality and accuracy.

| Function | Model | Responsibility |
| :--- | :--- | :--- |
| **Orchestrator** | Logic/Router | Routes requests to appropriate models. |
| **Narrative** | **Claude 3.5 Sonnet** | Generating "About Me" stories, tone polishing (Natural/Professional). |
| **Optimization** | **Gemini 1.5 Pro** | Industry trending keywords, ATS optimization. |
| **Extraction** | **Gemini 1.5 Flash** | Complex unstructured data mining (PDF/DOCX), achievement extraction. |
| **Validation** | Custom Logic | Fact-checking, hallucination reduction (Target <4% error). |

### 3.3 Intelligent Template System
**Goal**: Layouts that adapt to the content, not content forced into layouts.

*   **Dynamic Categories**:
    1.  **Tech Professional**: Clean, code-centric, dark mode default.
    2.  **Creative Director**: Visual-first, gallery layouts.
    3.  **Business Executive**: Minimal typing, trust-based design.
    4.  **Academic**: Publication-heavy, text-dense.
    5.  **Freelancer**: Case study and testimonial focused.
*   **Features**: Dark mode, Responsive (Mobile/Tablet/Desktop), Accessibility (WCAG AAA).

### 3.4 Interactive Editor & AI Assistant
**Goal**: Real-time customization without coding.

*   **Live Preview**: WYSIWYG editing.
*   **AI Chat Assistant**: Natural language design changes (e.g., "Make the header smaller," "Switch to a blue theme").
*   **Smart Suggestions**: "Your pending section is empty, hide it?"

### 3.5 Deployment Strategy
**Goal**: One-click publishing with complete ownership.

*   **Platforms**: Vercel (primary), Netlify, GitHub Pages.
*   **Features**: Custom domains, SSL, Automatic SEO tags, Sitemap generation.

---

## 4. Technical Architecture

### 4.1 Tech Stack
*   **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion.
*   **Backend**: Next.js Server Actions, Supabase (PostgreSQL + Auth + Storage), Redis (Caching).
*   **AI**: Anthropic API (Claude), Google Gemini API, LangChain.
*   **Infrastructure**: Vercel (Hosting), Cloudflare (CDN).

### 4.2 Data Flow
1.  **Ingestion**: Upload -> Storage bucket -> Parse Text.
2.  **Processing**: Parser Output -> AI Orchestrator -> Parallel Model Execution -> Validation -> Structured Profile.
3.  **Generation**: Profile + Template -> React Components -> Static HTML.
4.  **Deployment**: Static Assets -> Hosting Provider.

### 4.3 Database Schema (Supabase)

#### Users & Portfolios
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  -- ...
);

CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  slug TEXT UNIQUE NOT NULL,
  -- Data Blobs
  resume_data JSONB,
  enhanced_profile JSONB, -- The AI output
  customization JSONB,    -- User edits
  status TEXT DEFAULT 'draft'
);
```

#### AI Jobs & History
```sql
CREATE TABLE ai_jobs (
  id UUID PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id),
  job_type TEXT, -- 'parse', 'enhance', 'generate'
  status TEXT, -- 'pending', 'completed', 'failed'
  input_data JSONB,
  output_data JSONB
);
```

---

## 5. Development Roadmap & Status

### ✅ Phase 1: Foundation (Completed Jan 15, 2026)
*   [x] Project Setup (Next.js 15, TS, Tailwind)
*   [x] Authentication (Supabase Auth: Email + Google)
*   [x] Database Schema & RLS Policies
*   [x] Dashboard UI (Create, List, Delete Portfolios)
*   [x] File Upload System (Drag & Drop to Supabase Storage)

### 🚧 Phase 2: Core AI Engine (Current Focus)
*   [ ] **Resume Parser**: Implement `pdf-parse` / `mammoth` integration.
*   [ ] **AI Orchestrator**: LangChain setup for multi-model routing.
*   [ ] **Prompt Engineering**: Define prompts for extraction vs generation.
*   [ ] **Profile Generation**: End-to-end flow from Text -> JSON Profile.

### Phase 3: Template System
*   [ ] Design System Implementation (Tokens, Typos).
*   [ ] Create "Tech Professional" Template.
*   [ ] Create "Creative" Template.
*   [ ] Template Registry & Switcher Logic.

### Phase 4: Editor & Customization
*   [ ] Real-time Preview Engine.
*   [ ] AI Assistant Chat UI.
*   [ ] Style Customizer (Colors, Fonts).

### Phase 5: Deployment & Launch
*   [ ] Vercel API Integration for Deployments.
*   [ ] SEO Optimization Layer.
*   [ ] Beta Launch.

---

## 6. Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **AI Costs** | High | Use smaller models (Flash/Mini) for drafting. Aggressive caching. |
| **Accuracy** | med | Human-in-the-loop: Users verify AI data before generating site. |
| **API Latency** | Med | Async processing jobs, optimistic UI updates, progress bars. |
