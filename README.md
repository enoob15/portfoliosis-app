# Portfoliosys

**Next-Generation AI Portfolio Builder**

Transform resumes and professional data into stunning, personalized portfolio websites in minutes using multi-model AI intelligence.

---

## 🚀 Quick Start (Automated Setup)

**Get running in 5 minutes!**

### Option 1: One-Command (Windows)
```bash
setup.bat
```

### Option 2: Interactive Setup
```bash
npm install
npm run setup
npm run dev
```

**Read full guide:** [QUICKSTART.md](./QUICKSTART.md)

---

## Project Status: Week 2 & 3 Complete ✅

### Completed (Weeks 1-3)
- ✅ Next.js 15 + TypeScript + App Router
- ✅ Tailwind CSS + Shadcn UI components
- ✅ **Authentication system (email + OAuth)**
- ✅ **Database schema with RLS policies**
- ✅ **Dashboard with portfolio management**
- ✅ **File upload (PDF/DOCX resumes)**
- ✅ **3-step portfolio creation wizard**
- ✅ **Automated setup scripts**
- ✅ Supabase integration complete
- ✅ Type definitions (profile, template, deployment, API)
- ✅ Architecture documentation

### Next Up (Phase 2 - Weeks 4-6)
- ⏭️ Resume parser (PDF/DOCX text extraction)
- ⏭️ Multi-model AI orchestration (GPT-4, Claude, Gemini)
- ⏭️ Profile enhancement with AI
- ⏭️ LinkedIn/GitHub integration

---

## Manual Installation (If You Prefer)

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd portfoliosys-app

# Install dependencies
npm install

# Run automated setup
npm run setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router and Server Components
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Accessible component library
- **Framer Motion** - Smooth animations
- **Tanstack Query** - Server state management

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL database, auth, storage
- **Zod** - Runtime validation

### AI Integration
- **OpenAI GPT-4o-mini** - Achievement extraction
- **Anthropic Claude Haiku** - Narrative generation
- **Google Gemini Flash** - Industry optimization
- **LangChain** - AI orchestration (planned)

### Deployment
- **Vercel** - Primary hosting
- **Netlify** - Secondary deployment option
- **GitHub Pages** - Static site hosting option

### Development
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Git** - Version control

---

## Project Structure

```
portfoliosys-app/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/           # Dashboard routes
│   │   ├── portfolios/
│   │   │   ├── new/
│   │   │   └── [id]/edit/
│   │   └── settings/
│   ├── api/                   # API routes
│   │   ├── auth/
│   │   ├── portfolios/
│   │   ├── ai/
│   │   └── deployment/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                 # React components
│   ├── ui/                    # Shadcn UI components
│   ├── editor/                # Portfolio editor
│   ├── templates/             # Portfolio templates
│   │   ├── TechProfessional/
│   │   ├── CreativeDirector/
│   │   ├── BusinessExecutive/
│   │   ├── AcademicResearcher/
│   │   └── Freelancer/
│   └── portfolio/             # Portfolio page components
│
├── lib/                       # Utility libraries
│   ├── ai/                    # AI orchestration
│   │   ├── orchestrator.ts
│   │   ├── models/
│   │   └── prompts/
│   ├── parsers/               # Resume/data parsers
│   ├── generators/            # Static site generation
│   ├── deployment/            # Deployment integrations
│   ├── db/                    # Database utilities
│   └── utils/                 # Helper functions
│
├── types/                     # TypeScript definitions
│   ├── profile.ts             # User profile types
│   ├── template.ts            # Template types
│   ├── deployment.ts          # Deployment types
│   └── api.ts                 # API types
│
├── tests/                     # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md        # Architecture decisions
│   ├── PROPOSAL.md            # Project proposal
│   └── TECHNICAL_SPEC.md      # Technical specifications
│
├── public/                    # Static assets
│   ├── templates/             # Template previews
│   └── assets/
│
├── .env.example               # Environment variables template
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

---

## Core Features

### 🎯 Multi-Model AI Ensemble
- **Claude (Anthropic)**: Natural writing, professional narratives
- **Gemini (Google)**: Industry-specific phrasing, ATS optimization
- **GPT-4 (OpenAI)**: Achievement extraction, career organization
- **Validation**: Hallucination detection, fact-checking (target: <4% error rate)

### 🚀 Contextual Intelligence Engine
- Multi-source ingestion: Resume, LinkedIn, GitHub, personal websites
- Cross-reference validation: Verify dates, titles, achievements
- Gap analysis: AI identifies missing information
- Skill inference: Detect implicit skills from project descriptions

### 🎨 Design Intelligence System
- Industry-aware templates: Tech, Creative, Business, Academic, Freelancer
- AI style recommendations: Analyze content for optimal design
- Smart component selection: Show/hide sections based on career stage
- Accessibility-first: WCAG AAA compliance

### ✏️ Real-Time Collaborative Studio
- Live preview: Desktop/tablet/mobile views
- AI design assistant: Natural language customization
- Smart suggestions: "Your skills section is crowded—should we create a separate page?"
- Version history: Git-like branching (planned)

### 🌐 Professional Deployment Pipeline
- One-click deploy: Vercel, Netlify, GitHub Pages
- Custom domain: SSL certificates included
- SEO optimization: Meta tags, structured data, sitemaps
- Performance: Lighthouse score >95, Core Web Vitals optimized

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-3) [CURRENT]
- [x] Project setup and architecture
- [x] Next.js app with TypeScript
- [ ] Database schema design (Supabase)
- [ ] Authentication system (email + OAuth)
- [ ] File upload infrastructure
- [ ] Basic UI components (Shadcn)

### Phase 2: Core AI Engine (Weeks 4-6)
- [ ] Resume parser (PDF/DOCX)
- [ ] Multi-model AI orchestration
- [ ] Prompt engineering and optimization
- [ ] Validation and hallucination reduction
- [ ] LinkedIn/GitHub API integration

### Phase 3: Template System (Weeks 7-9)
- [ ] Design system implementation
- [ ] 5 professional templates
- [ ] Responsive layout system
- [ ] Dark mode implementation
- [ ] Preview renderer

### Phase 4: Editor & Customization (Weeks 10-11)
- [ ] Real-time preview
- [ ] Visual editor interface
- [ ] AI chat assistant
- [ ] Style customization panel
- [ ] Content editing with AI suggestions

### Phase 5: Deployment Pipeline (Weeks 12-13)
- [ ] Static site generator
- [ ] Vercel integration
- [ ] Netlify integration
- [ ] GitHub Pages integration
- [ ] SEO optimization layer

### Phase 6: Polish & Launch (Weeks 14-16)
- [ ] Performance optimization
- [ ] Accessibility audit and fixes
- [ ] Cross-browser testing
- [ ] User testing and feedback
- [ ] Beta launch

---

## Environment Variables

See `.env.example` for a complete list. Key variables:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Models
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key

# OAuth
LINKEDIN_CLIENT_ID=your_linkedin_id
GITHUB_CLIENT_ID=your_github_id
```

---

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler

# Deployment
npm run deploy       # Deploy to Vercel
```

---

## Architecture Highlights

### Multi-Model AI Orchestration
```typescript
// lib/ai/orchestrator.ts
const enhancedProfile = await processWithEnsemble({
  resume: parsedResume,
  models: {
    gpt4: { task: 'achievement_extraction', model: 'gpt-4o-mini' },
    claude: { task: 'narrative_generation', model: 'claude-3-haiku' },
    gemini: { task: 'industry_optimization', model: 'gemini-1.5-flash' }
  },
  validation: { hallucinationThreshold: 0.8, factCheck: true }
})
```

### Type-Safe API Routes
```typescript
// app/api/portfolios/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  const validated = CreatePortfolioRequest.parse(body) // Zod validation

  const portfolio = await createPortfolio(validated)
  return NextResponse.json({ success: true, data: portfolio })
}
```

### Real-Time Preview
```typescript
// components/editor/LivePreview.tsx
<iframe
  srcDoc={generatedHTML}
  sandbox="allow-scripts allow-same-origin"
  className="w-full h-full"
/>
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Time to Interactive (TTI) | <2s | TBD |
| First Contentful Paint (FCP) | <1s | TBD |
| Largest Contentful Paint (LCP) | <2.5s | TBD |
| Lighthouse Score | >95 | TBD |
| Resume Parsing | <5s | TBD |
| AI Enhancement | <15s | TBD |
| Static Site Generation | <30s | TBD |

---

## Contributing

This project is currently in active development by the Boone51 team. External contributions are not yet accepted.

### Team
- **Devon Cross** - CTO, Technical Architecture
- **Maya Patel** - Web Development Lead
- **James Chen** - AI & Automation Lead
- **Sarah Okonkwo** - Technical Consulting Lead
- **Lisa Klein** - Chief Design Officer

---

## Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md) - ADRs and technical decisions
- [Project Proposal](./docs/PROPOSAL.md) - Vision and market analysis
- [Technical Specification](./docs/TECHNICAL_SPEC.md) - Detailed feature breakdown

---

## License

Proprietary - Boone51 2025

---

## Contact

For inquiries, contact: [Your contact information]

---

**Built with ❤️ by Boone51**
