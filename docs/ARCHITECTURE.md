# Portfoliosis Architecture Documentation

## Architectural Decision Records (ADRs)

### ADR-001: Next.js 15 with App Router and React Server Components

**Status**: APPROVED

**Context**:
We need a modern, performant framework for building a complex AI-powered portfolio generation platform with real-time previews, multi-model AI orchestration, and static site export capabilities.

**Decision**:
Use Next.js 15 with App Router and React Server Components as the primary framework.

**Rationale**:
- **Performance**: RSC reduces client-side JavaScript, critical for portfolio previews
- **SEO**: Built-in SSR/SSG for marketing pages and public portfolios
- **API Routes**: Serverless functions for AI model calls and third-party integrations
- **Static Export**: Native support for generating static HTML/CSS/JS for deployment
- **Developer Experience**: TypeScript-first, excellent tooling, active ecosystem
- **Vercel Integration**: Seamless deployment (one of our target platforms)

**Alternatives Considered**:
- **Remix**: Great DX, but less mature static export story
- **SvelteKit**: Excellent performance, but smaller ecosystem for AI libraries
- **Vite + React**: More configuration required, lacks integrated API routes

**Consequences**:
- Team must learn App Router patterns (different from Pages Router)
- RSC requires careful boundary management between server/client components
- Build times may increase with large component trees

---

### ADR-002: Multi-Model AI Ensemble (GPT-4, Claude, Gemini)

**Status**: APPROVED with COST MITIGATION

**Context**:
Single AI models have limitations: hallucinations, inconsistent quality, industry-specific knowledge gaps. We need the highest quality content generation.

**Decision**:
Use a multi-model AI ensemble orchestrated via LangChain, with model-specific routing:
- **GPT-4o-mini**: Achievement extraction, career timeline organization
- **Claude Haiku**: Natural writing, tone control, narrative generation
- **Gemini Flash**: Industry keywords, ATS optimization, trend analysis

**Rationale**:
- **Quality**: Ensemble reduces hallucinations from 18% to <4% (proven in production systems)
- **Specialization**: Each model excels at different tasks
- **Validation**: Cross-model verification improves accuracy
- **Flexibility**: Can swap models based on cost/performance

**Cost Mitigation Strategies**:
1. **Use cheaper model variants**: GPT-4o-mini ($0.15/1M tokens vs $3.00/1M for GPT-4)
2. **Aggressive caching**: Redis with 30-day TTL for identical resumes
3. **Smart routing**: Only use premium models for final polish or paid tier
4. **Batch processing**: Combine API calls where possible
5. **Target cost**: <$0.20 per portfolio (vs $2.00 with premium models)

**Alternatives Considered**:
- **Single model (GPT-4 only)**: Simpler but higher hallucination rate
- **Open-source models (Llama, Mistral)**: Lower cost but quality concerns, infrastructure overhead
- **No AI**: Manual portfolio creation defeats the product vision

**Consequences**:
- Complex orchestration logic required
- API costs are variable (spikes during high usage)
- Need robust error handling for 3 different APIs
- LangSmith observability critical for debugging

---

### ADR-003: Supabase for Database, Auth, and Storage

**Status**: APPROVED

**Context**:
We need a robust backend with PostgreSQL, authentication, file storage, and real-time capabilities.

**Decision**:
Use Supabase as our primary backend infrastructure.

**Rationale**:
- **PostgreSQL**: Production-ready relational database with JSONB for flexible schemas
- **Built-in Auth**: Email, OAuth (LinkedIn, GitHub), JWT-based
- **File Storage**: S3-compatible for resume uploads and generated sites
- **Real-time**: WebSocket support for collaborative editing (future feature)
- **Row-level Security**: Fine-grained permissions for multi-tenant data
- **Developer Experience**: Excellent TypeScript SDK, auto-generated types
- **Cost**: Free tier generous for MVP, scales predictably

**Alternatives Considered**:
- **Firebase**: Good auth/storage, but Firestore less suitable for complex queries
- **Custom PostgreSQL + AWS S3**: More control, but significant DevOps overhead
- **PlanetScale**: Excellent MySQL, but lacks integrated auth/storage

**Consequences**:
- Vendor lock-in (mitigated by PostgreSQL being standard)
- Must design schema carefully (migrations more complex than NoSQL)
- Real-time features require WebSocket infrastructure

---

### ADR-004: TypeScript + Zod for Type Safety and Validation

**Status**: APPROVED

**Context**:
AI-generated content is unpredictable. We need runtime validation to prevent bad data from reaching users.

**Decision**:
Use TypeScript for compile-time safety and Zod for runtime validation of all AI outputs, user inputs, and API responses.

**Rationale**:
- **Type Safety**: Catch errors at build time
- **Runtime Validation**: Zod validates AI outputs match expected schemas
- **Shared Types**: Define once, use in frontend/backend/validation
- **Error Messages**: Zod provides clear validation errors
- **Integration**: Works seamlessly with React Hook Form, tRPC

**Example**:
```typescript
const ResumeSchema = z.object({
  personal: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    title: z.string()
  }),
  experience: z.array(ExperienceSchema)
})

// Validate AI output
const validated = ResumeSchema.safeParse(aiOutput)
if (!validated.success) {
  // Handle hallucination/malformed data
}
```

**Consequences**:
- Slight performance overhead from runtime validation (acceptable for data quality)
- Developers must maintain both TypeScript types and Zod schemas
- Learning curve for Zod syntax

---

### ADR-005: Tailwind CSS + Shadcn UI for Design System

**Status**: APPROVED

**Context**:
We need a flexible, customizable design system that supports theming, dark mode, and responsive design.

**Decision**:
Use Tailwind CSS for utility-first styling and Shadcn UI for pre-built, accessible components.

**Rationale**:
- **Flexibility**: Tailwind allows rapid customization (critical for template system)
- **Dark Mode**: Built-in dark mode support
- **Component Quality**: Shadcn components are accessible, well-tested
- **Ownership**: Shadcn copies components into codebase (full control, no black box)
- **Performance**: PurgeCSS removes unused styles
- **Designer Collaboration**: Lisa Klein (CDO) can customize via Tailwind config

**Alternatives Considered**:
- **Material UI**: Too opinionated, harder to customize
- **Chakra UI**: Good DX, but more runtime overhead
- **Pure CSS Modules**: More control, but slower development

**Consequences**:
- Large HTML class strings (mitigated by component abstraction)
- Requires Tailwind knowledge across team
- Need to configure theme tokens carefully for template system

---

### ADR-006: Tanstack Query for Server State Management

**Status**: APPROVED

**Context**:
We have complex server state (portfolios, AI jobs, templates) that needs caching, optimistic updates, and background refetching.

**Decision**:
Use Tanstack Query (formerly React Query) for all server state management.

**Rationale**:
- **Caching**: Automatic request deduplication and caching
- **Optimistic Updates**: Instant UI feedback while API calls complete
- **Background Sync**: Keep data fresh without user action
- **DevTools**: Excellent debugging experience
- **TypeScript**: First-class TypeScript support
- **Framework Agnostic**: Could migrate from Next.js if needed

**Example**:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['portfolio', portfolioId],
  queryFn: () => fetchPortfolio(portfolioId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

**Consequences**:
- Another state management paradigm (alongside React state)
- Need to design query keys carefully
- Must handle loading/error states throughout app

---

### ADR-007: Framer Motion for Animations

**Status**: APPROVED

**Context**:
Modern portfolio templates require smooth animations and micro-interactions.

**Decision**:
Use Framer Motion for all animations in templates and the editor interface.

**Rationale**:
- **Declarative**: Animations defined in JSX, easy to understand
- **Performance**: Uses CSS transforms and GPU acceleration
- **Gestures**: Built-in drag, hover, tap gestures for editor
- **Layout Animations**: Automatic layout transitions (critical for real-time preview)
- **Accessibility**: Respects `prefers-reduced-motion`

**Alternatives Considered**:
- **CSS Animations**: Less dynamic, harder to coordinate complex sequences
- **GSAP**: More powerful, but larger bundle size and steeper learning curve
- **React Spring**: Good physics-based animations, but less suited for UI transitions

**Consequences**:
- Bundle size increase (~30kb gzipped)
- Animations must be performant (60fps target)
- Need to provide animation on/off toggle for accessibility

---

### ADR-008: Playwright for E2E Testing

**Status**: APPROVED

**Context**:
Portfolio generation involves complex user flows (upload → AI processing → customization → deployment). We need reliable E2E testing.

**Decision**:
Use Playwright for end-to-end testing.

**Rationale**:
- **Reliability**: Auto-waits, reduces flaky tests
- **Multi-browser**: Test in Chromium, Firefox, WebKit
- **Codegen**: Record tests from browser interactions
- **Debugging**: Time-travel debugging, trace viewer
- **CI/CD**: Excellent GitHub Actions integration

**Test Coverage Strategy**:
1. **Critical Path**: Resume upload → AI enhancement → template selection → export
2. **Payment Flow**: Free tier → upgrade → subscription management
3. **Deployment**: Deploy to Vercel/Netlify, verify live URL
4. **Accessibility**: WCAG compliance checks

**Consequences**:
- Slower test execution than unit tests
- Requires Docker/headless browsers in CI
- Must maintain test data (sample resumes)

---

### ADR-009: Static Site Export Strategy

**Status**: APPROVED

**Context**:
Users need to export portfolios as static HTML/CSS/JS for hosting on Vercel, Netlify, GitHub Pages.

**Decision**:
Use Next.js `output: 'export'` to generate static sites, with custom post-processing for optimization.

**Pipeline**:
1. **Render**: Generate HTML from user's template + data
2. **Optimize**: Minify HTML/CSS/JS, compress images, inline critical CSS
3. **SEO**: Inject meta tags, structured data, sitemap
4. **Package**: Bundle into deployable artifact
5. **Deploy**: Push to hosting platform via API

**Rationale**:
- **Performance**: Static sites are fast (no server-side rendering)
- **Cost**: Free/cheap hosting on Netlify, Vercel, GitHub Pages
- **Portability**: Users own the code, no vendor lock-in
- **SEO**: Pre-rendered HTML is SEO-friendly

**Challenges**:
- Next.js export limitations (no dynamic routes without `generateStaticParams`)
- Must handle client-side routing for multi-page portfolios
- Image optimization requires build-time processing

**Mitigation**:
- Generate all possible routes at build time
- Use Next.js Image component with `unoptimized` flag for export
- Provide progressive enhancement (works without JS)

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│  Next.js 15 App Router + React 19 + Tailwind + Shadcn      │
└──────────────────┬──────────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────┐      ┌────────▼─────────┐
│   Browser   │      │  Next.js API     │
│   State     │      │    Routes        │
│  (Tanstack  │      │  (Serverless)    │
│   Query)    │      └────────┬─────────┘
└─────────────┘               │
                    ┌─────────┴──────────┐
                    │                    │
         ┌──────────▼────────┐  ┌───────▼────────┐
         │   AI Ensemble     │  │   Supabase     │
         │  Orchestrator     │  │  PostgreSQL +  │
         │  (LangChain)      │  │  Auth + Storage│
         └──────────┬────────┘  └────────────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
┌─────▼─────┐ ┌────▼─────┐ ┌────▼─────┐
│  GPT-4o   │ │  Claude  │ │  Gemini  │
│   -mini   │ │   Haiku  │ │   Flash  │
└───────────┘ └──────────┘ └──────────┘
                    │
         ┌──────────▼────────┐
         │  Validation &     │
         │  Hallucination    │
         │    Detection      │
         └──────────┬────────┘
                    │
         ┌──────────▼────────┐
         │  Enhanced Profile │
         │    Generation     │
         └──────────┬────────┘
                    │
         ┌──────────▼────────┐
         │  Template Render  │
         │  + Customization  │
         └──────────┬────────┘
                    │
         ┌──────────▼────────┐
         │  Static Site Gen  │
         │  + Optimization   │
         └──────────┬────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
┌─────▼─────┐ ┌────▼─────┐ ┌────▼─────┐
│  Vercel   │ │ Netlify  │ │  GitHub  │
│  Deploy   │ │  Deploy  │ │   Pages  │
└───────────┘ └──────────┘ └──────────┘
```

---

## Data Flow Architecture

### 1. Ingestion Phase
```
User Upload (Resume PDF/DOCX)
    │
    ├─→ PDF Parser (pdf-parse) → Extract raw text
    ├─→ DOCX Parser (mammoth) → Extract formatted text
    └─→ LinkedIn/GitHub OAuth → Fetch structured data
             │
             └─→ Data Normalization → Unified ParsedResume schema
                      │
                      └─→ Supabase (portfolios.resume_data)
```

### 2. AI Processing Phase
```
ParsedResume
    │
    ├─→ LangChain Orchestrator
    │       │
    │       ├─→ GPT-4o-mini: Achievement extraction
    │       │       └─→ Prompt: "Extract quantifiable achievements..."
    │       │
    │       ├─→ Claude Haiku: Narrative generation
    │       │       └─→ Prompt: "Write professional summary in [tone]..."
    │       │
    │       └─→ Gemini Flash: Industry optimization
    │               └─→ Prompt: "Add [industry] keywords for ATS..."
    │
    ├─→ Parallel Execution (Promise.all)
    │       └─→ Response: { gpt4Result, claudeResult, geminiResult }
    │
    ├─→ Validation Layer
    │       ├─→ Fact-check dates/titles against source data
    │       ├─→ Detect hallucinations (cosine similarity)
    │       └─→ Confidence scoring (0-1 scale)
    │
    └─→ Enhanced Profile Generation
            ├─→ Best-of-ensemble selection
            ├─→ Merge complementary insights
            └─→ Supabase (portfolios.enhanced_profile)
```

### 3. Rendering Phase
```
EnhancedProfile + TemplateSelection
    │
    ├─→ Template Matching Algorithm
    │       ├─→ Industry → Template category
    │       ├─→ Seniority → Component selection
    │       └─→ Content richness → Layout complexity
    │
    ├─→ Theme Application
    │       ├─→ Color scheme (industry-appropriate)
    │       ├─→ Typography (professional/creative)
    │       └─→ Dark mode support
    │
    └─→ Real-time Preview Renderer
            ├─→ Server Component: Initial render
            ├─→ Client Component: Interactive editor
            └─→ Shadow DOM: Isolated preview styling
```

### 4. Export Phase
```
FinalDesign + EnhancedProfile
    │
    ├─→ Static Site Generator
    │       ├─→ Next.js export (output: 'export')
    │       ├─→ HTML minification (html-minifier)
    │       ├─→ CSS extraction + minification
    │       └─→ Image optimization (sharp)
    │
    ├─→ SEO Optimization
    │       ├─→ Meta tags injection
    │       ├─→ Sitemap generation
    │       ├─→ Structured data (JSON-LD)
    │       └─→ robots.txt
    │
    └─→ Deployment
            ├─→ Vercel API: Push to Vercel
            ├─→ Netlify API: Deploy via zip upload
            └─→ GitHub API: Commit to gh-pages branch
```

---

## Security Architecture

### Authentication
- **Supabase Auth**: Email/password + OAuth (LinkedIn, GitHub)
- **JWT Tokens**: Short-lived access tokens (15min), long-lived refresh tokens (7 days)
- **Row-level Security**: Users can only access their own portfolios
- **HTTPS Only**: Enforce TLS 1.3

### Data Protection
- **Encryption at Rest**: AES-256 for sensitive data (Supabase built-in)
- **Encryption in Transit**: TLS 1.3 for all API calls
- **PII Handling**: Resume data stored encrypted, deleted on user request
- **GDPR Compliance**: Data export/deletion endpoints

### API Security
- **Rate Limiting**: 100 req/min per user (Redis-backed)
- **Input Validation**: Zod schemas on all API routes
- **CSRF Protection**: Next.js built-in CSRF tokens
- **Content Security Policy**: Strict CSP headers for XSS prevention

### AI Security
- **Prompt Injection Prevention**: Validate user inputs, escape special chars
- **Output Sanitization**: DOMPurify for all AI-generated HTML
- **Cost Limits**: Cap AI spending per user (prevent abuse)
- **Content Moderation**: OpenAI Moderation API for inappropriate content

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Interactive (TTI) | <2s | Lighthouse |
| First Contentful Paint (FCP) | <1s | Lighthouse |
| Largest Contentful Paint (LCP) | <2.5s | Core Web Vitals |
| Cumulative Layout Shift (CLS) | <0.1 | Core Web Vitals |
| Resume Parsing | <5s | Backend monitoring |
| AI Enhancement | <15s | Backend monitoring |
| Static Site Generation | <30s | Deployment logs |
| Lighthouse Score | >95 | CI/CD pipeline |

---

## Scalability Considerations

### Horizontal Scaling
- **Vercel Serverless**: Auto-scales API routes
- **Supabase**: Connection pooling for PostgreSQL
- **Redis**: Clustering for cache layer
- **CDN**: Cloudflare for static assets

### Cost Optimization
- **AI Caching**: Redis with 30-day TTL (reduce duplicate API calls by 60%)
- **Image Optimization**: Sharp + WebP (reduce file sizes by 40%)
- **Code Splitting**: Dynamic imports (reduce initial bundle by 30%)
- **Database Indexing**: Optimize query performance

### Monitoring
- **Sentry**: Error tracking + performance monitoring
- **PostHog**: User behavior analytics
- **Vercel Analytics**: Core Web Vitals tracking
- **LangSmith**: AI model performance + cost tracking

---

This architecture is designed for:
1. **Quality**: Multi-model AI ensemble for best-in-class content
2. **Performance**: <2s TTI, >95 Lighthouse score
3. **Scalability**: Serverless architecture handles traffic spikes
4. **Cost Efficiency**: <$0.20 per portfolio AI cost
5. **Developer Experience**: TypeScript, type-safe APIs, excellent tooling
6. **User Ownership**: Export static sites, no vendor lock-in
