# Portfoliosis Technical Specification

## Core Features Detailed Breakdown

### Feature 1: Multi-Source Data Ingestion

#### Resume Parser
```typescript
interface ResumeParser {
  // Supported formats
  parsePDF(file: File): Promise<ParsedResume>
  parseDOCX(file: File): Promise<ParsedResume>
  parseJSON(data: string): Promise<ParsedResume>

  // Extraction methods
  extractContactInfo(text: string): ContactInfo
  extractExperience(text: string): Experience[]
  extractEducation(text: string): Education[]
  extractSkills(text: string): string[]
  extractProjects(text: string): Project[]
}

interface ParsedResume {
  personal: {
    name: string
    title: string
    email: string
    phone?: string
    location?: string
    website?: string
    social?: SocialLinks
  }
  summary?: string
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  projects?: Project[]
  certifications?: Certification[]
  languages?: Language[]
  awards?: Award[]
}
```

#### Multi-Source Aggregator
```typescript
interface SourceAggregator {
  // Data sources
  fetchLinkedIn(accessToken: string): Promise<LinkedInProfile>
  fetchGitHub(username: string): Promise<GitHubProfile>
  fetchMedium(username: string): Promise<Article[]>
  fetchDevTo(username: string): Promise<Article[]>

  // Aggregation logic
  mergeProfiles(sources: DataSource[]): Promise<AggregatedProfile>
  detectConflicts(data: AggregatedProfile): Conflict[]
  resolveConflicts(conflicts: Conflict[], userChoices: Resolution[]): AggregatedProfile
}

interface LinkedInProfile {
  headline: string
  summary: string
  experience: LinkedInExperience[]
  education: LinkedInEducation[]
  skills: string[]
  endorsements: Endorsement[]
  recommendations: Recommendation[]
}

interface GitHubProfile {
  bio: string
  repositories: Repository[]
  contributions: number
  stars: number
  followers: number
  languages: LanguageStats[]
  pinnedRepos: Repository[]
}
```

### Feature 2: AI Ensemble Processing

#### Model Orchestrator
```typescript
interface AIOrchestrator {
  // Model routing
  processWithGPT4(prompt: string, context: any): Promise<GPT4Response>
  processWithClaude(prompt: string, context: any): Promise<ClaudeResponse>
  processWithGemini(prompt: string, context: any): Promise<GeminiResponse>

  // Ensemble logic
  ensembleProcess(data: ParsedResume): Promise<EnhancedProfile>
  validateResults(results: AIResult[]): ValidationReport
  reduceHallucinations(results: AIResult[]): AIResult[]
}

interface EnhancedProfile {
  original: ParsedResume
  enhanced: {
    summary: {
      original: string
      claudeVersion: string    // Natural, professional tone
      geminiVersion: string    // Industry-optimized
      gpt4Version: string      // Achievement-focused
      recommended: string      // Best of ensemble
    }
    experience: EnhancedExperience[]
    skills: CategorizedSkills
    projects: EnhancedProject[]
    metadata: {
      industry: string
      seniority: 'junior' | 'mid' | 'senior' | 'executive'
      targetRole?: string
    }
  }
  confidence: ConfidenceScores
}
```

#### Prompt Engineering System
```typescript
interface PromptSystem {
  // Prompt templates
  templates: {
    gpt4: {
      achievementExtraction: string
      careerTimeline: string
      skillsOrganization: string
    }
    claude: {
      summaryGeneration: string
      narrativeCreation: string
      tonePolishing: string
    }
    gemini: {
      industryKeywords: string
      atsOptimization: string
      trendAnalysis: string
    }
  }

  // Dynamic prompt building
  buildPrompt(template: string, context: any): string
  optimizeForModel(prompt: string, model: 'gpt4' | 'claude' | 'gemini'): string

  // Validation prompts
  factCheckPrompt(claim: string, context: any): string
  hallucinationDetectionPrompt(generated: string, source: any): string
}
```

### Feature 3: Intelligent Template System

#### Template Engine
```typescript
interface TemplateEngine {
  // Template management
  templates: Template[]
  getTemplate(id: string): Template
  matchTemplate(profile: EnhancedProfile): Template[]

  // Rendering
  renderTemplate(template: Template, data: EnhancedProfile): RenderedSite
  customizeTemplate(template: Template, customization: Customization): Template

  // Preview
  generatePreview(template: Template, data: EnhancedProfile, viewport: Viewport): PreviewData
}

interface Template {
  id: string
  name: string
  category: 'tech' | 'creative' | 'business' | 'academic' | 'freelancer'
  components: Component[]
  theme: Theme
  layout: Layout
  metadata: {
    preview: string
    description: string
    bestFor: string[]
    industries: string[]
  }
}

interface Component {
  id: string
  type: 'hero' | 'about' | 'experience' | 'projects' | 'skills' | 'contact' | 'testimonials' | 'blog'
  required: boolean
  customizable: boolean
  variants: ComponentVariant[]
  defaultVariant: string
}

interface Theme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    muted: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    codeFont?: string
    scale: TypographyScale
  }
  spacing: SpacingSystem
  darkMode: boolean
  animations: AnimationPreferences
}
```

### Feature 4: AI Design Assistant

#### Conversational Editor
```typescript
interface DesignAssistant {
  // Chat interface
  processCommand(command: string, context: DesignContext): Promise<DesignAction>
  suggestImprovements(currentDesign: Design): Suggestion[]

  // Natural language processing
  parseIntent(message: string): Intent
  executeIntent(intent: Intent): DesignChange[]

  // Examples:
  // "make the header more minimal" → reduce padding, simplify nav, lighter colors
  // "add more white space" → increase margins, line height, section spacing
  // "make it more professional" → subdued colors, traditional fonts, formal language
  // "show my GitHub projects prominently" → add projects section, feature repos
}

interface Intent {
  action: 'modify' | 'add' | 'remove' | 'rearrange' | 'suggest'
  target: 'layout' | 'color' | 'typography' | 'spacing' | 'content' | 'component'
  modifier?: string
  confidence: number
}

interface DesignAction {
  type: 'css_change' | 'component_update' | 'layout_shift' | 'content_edit'
  changes: Change[]
  preview: string
  canUndo: boolean
}
```

### Feature 5: Deployment Pipeline

#### Static Site Generator
```typescript
interface StaticSiteGenerator {
  // Generation
  generateSite(design: Design, data: EnhancedProfile): Promise<StaticSite>
  optimizeAssets(site: StaticSite): Promise<OptimizedSite>

  // SEO
  generateMetaTags(data: EnhancedProfile): MetaTags
  generateSitemap(pages: Page[]): string
  generateRobotsTxt(config: SEOConfig): string
  generateStructuredData(data: EnhancedProfile): StructuredData

  // Performance
  optimizeImages(images: Image[]): Promise<OptimizedImage[]>
  minifyCode(html: string, css: string, js: string): MinifiedCode
  splitCode(components: Component[]): CodeSplitResult
  generateServiceWorker(config: PWAConfig): string
}

interface DeploymentManager {
  // Platform integrations
  deployToVercel(site: StaticSite, config: VercelConfig): Promise<Deployment>
  deployToNetlify(site: StaticSite, config: NetlifyConfig): Promise<Deployment>
  deployToGitHubPages(site: StaticSite, config: GitHubConfig): Promise<Deployment>

  // Domain management
  configureDomain(domain: string, deployment: Deployment): Promise<DomainConfig>
  setupSSL(domain: string): Promise<SSLCertificate>

  // Monitoring
  getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>
  getAnalytics(deploymentId: string, dateRange: DateRange): Promise<Analytics>
}
```

## Database Schema

### Supabase Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  template_id TEXT NOT NULL,

  -- Source data
  resume_data JSONB,
  linkedin_data JSONB,
  github_data JSONB,
  manual_data JSONB,

  -- Processed data
  enhanced_profile JSONB NOT NULL,

  -- Design
  customization JSONB,
  theme JSONB,

  -- Deployment
  deployment_config JSONB,
  deployment_url TEXT,
  custom_domain TEXT,

  -- Metadata
  status TEXT DEFAULT 'draft', -- draft, published, archived
  is_public BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio versions (for history)
CREATE TABLE portfolio_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI processing jobs
CREATE TABLE ai_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- parse, enhance, generate
  input_data JSONB,
  output_data JSONB,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
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
  category TEXT NOT NULL,
  config JSONB NOT NULL,
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics
CREATE TABLE portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_site INTEGER,
  bounce_rate DECIMAL,
  top_pages JSONB,
  referrers JSONB,
  devices JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Routes

### Next.js API Structure

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── signup/route.ts
│   ├── logout/route.ts
│   └── oauth/
│       ├── linkedin/route.ts
│       └── github/route.ts
│
├── portfolios/
│   ├── route.ts                    # GET (list), POST (create)
│   ├── [id]/
│   │   ├── route.ts               # GET, PATCH, DELETE
│   │   ├── versions/route.ts      # GET versions, POST new version
│   │   └── deploy/route.ts        # POST deploy
│
├── parse/
│   ├── resume/route.ts            # POST file upload
│   ├── linkedin/route.ts          # POST fetch LinkedIn
│   └── github/route.ts            # POST fetch GitHub
│
├── ai/
│   ├── enhance/route.ts           # POST enhance profile
│   ├── generate-content/route.ts # POST generate specific content
│   ├── design-assist/route.ts    # POST design assistant chat
│   └── validate/route.ts         # POST validate AI output
│
├── templates/
│   ├── route.ts                   # GET all templates
│   ├── [id]/route.ts             # GET template details
│   └── match/route.ts            # POST match templates to profile
│
├── deployment/
│   ├── vercel/route.ts
│   ├── netlify/route.ts
│   └── github-pages/route.ts
│
└── analytics/
    └── [portfolioId]/route.ts    # GET analytics data
```

## File Structure

```
Portfoliosis/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── portfolios/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   └── [...api routes...]
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                    # Shadcn components
│   │   ├── editor/
│   │   │   ├── DesignPanel.tsx
│   │   │   ├── LivePreview.tsx
│   │   │   ├── ComponentPalette.tsx
│   │   │   └── AIAssistant.tsx
│   │   ├── templates/
│   │   │   ├── TechProfessional/
│   │   │   ├── CreativeDirector/
│   │   │   ├── BusinessExecutive/
│   │   │   ├── AcademicResearcher/
│   │   │   └── Freelancer/
│   │   └── portfolio/             # Rendered components
│   │       ├── Hero.tsx
│   │       ├── About.tsx
│   │       ├── Experience.tsx
│   │       ├── Projects.tsx
│   │       └── Contact.tsx
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── orchestrator.ts
│   │   │   ├── models/
│   │   │   │   ├── gpt4.ts
│   │   │   │   ├── claude.ts
│   │   │   │   └── gemini.ts
│   │   │   ├── prompts/
│   │   │   │   └── index.ts
│   │   │   └── validation.ts
│   │   ├── parsers/
│   │   │   ├── resume.ts
│   │   │   ├── linkedin.ts
│   │   │   └── github.ts
│   │   ├── generators/
│   │   │   ├── static-site.ts
│   │   │   └── seo.ts
│   │   ├── deployment/
│   │   │   ├── vercel.ts
│   │   │   ├── netlify.ts
│   │   │   └── github-pages.ts
│   │   ├── db/
│   │   │   ├── supabase.ts
│   │   │   └── queries.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── helpers.ts
│   │
│   ├── types/
│   │   ├── profile.ts
│   │   ├── template.ts
│   │   ├── deployment.ts
│   │   └── api.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── templates/                 # Template previews
│   └── assets/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Models
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

# OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Deployment
VERCEL_TOKEN=
NETLIFY_TOKEN=
GITHUB_TOKEN=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Analytics
POSTHOG_KEY=
SENTRY_DSN=

# Redis
REDIS_URL=
```

## Performance Targets

### Page Load
- Time to Interactive (TTI): < 2s
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

### AI Processing
- Resume parsing: < 5s
- Multi-model enhancement: < 15s
- Template generation: < 3s
- Total time to first preview: < 30s

### Build & Deploy
- Static site generation: < 30s
- Vercel deployment: < 60s
- CDN propagation: < 120s

## Security Considerations

### Data Protection
- All sensitive data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- API keys stored in secure vaults (Vercel env vars)
- Regular security audits

### Authentication
- JWT-based auth with refresh tokens
- OAuth 2.0 for third-party integrations
- Rate limiting on all API endpoints
- CSRF protection

### Privacy
- GDPR compliance (data export, deletion)
- User consent for AI processing
- Anonymous analytics option
- Clear privacy policy

### Input Validation
- File type and size validation
- Sanitize all user inputs
- SQL injection prevention
- XSS protection

## Testing Strategy

### Unit Tests
- All utility functions
- AI prompt building
- Data validation
- Component rendering

### Integration Tests
- API endpoints
- Database operations
- AI model integration
- Third-party services

### E2E Tests
- User registration flow
- Portfolio creation flow
- Design customization
- Deployment process

### Performance Tests
- Load testing (Apache JMeter)
- Stress testing
- API response times
- Database query optimization

## Monitoring & Observability

### Error Tracking
- Sentry for runtime errors
- Source maps for debugging
- User session replay
- Error alerts

### Performance Monitoring
- Vercel Analytics
- Core Web Vitals tracking
- API endpoint performance
- Database query performance

### Product Analytics
- PostHog for user behavior
- Feature usage tracking
- Conversion funnels
- A/B testing

### Logging
- Structured logging (Winston)
- Log aggregation (Datadog)
- Search and analysis
- Retention policy (30 days)
