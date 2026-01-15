# Portfoliosis

AI-powered portfolio generation platform that transforms resumes and professional data into stunning, deployable portfolio websites in minutes.

## Vision

Traditional portfolio builders are limited by templates and manual data entry. Portfoliosis leverages cutting-edge AI technology to analyze your professional experience, extract insights, and generate personalized portfolio websites that truly represent your unique value. Our multi-model AI ensemble ensures accuracy and quality beyond what single-model competitors can achieve.

**Core Promise**: Upload your resume, connect your professional profiles, and get a production-ready portfolio website in under 5 minutes.

## Key Features

### 1. Multi-Source Data Ingestion
- **Resume Parser**: Upload PDF, DOCX, or JSON resumes with intelligent extraction
- **LinkedIn Integration**: Import your complete professional profile via OAuth
- **GitHub Integration**: Automatically showcase your repositories, contributions, and activity
- **Manual Input**: Fill in additional details through intuitive forms
- **Conflict Resolution**: Smart merging when data sources disagree

### 2. AI Ensemble Processing
Our competitive advantage: **three AI models working together** to enhance your content.

- **GPT-4o-mini**: Achievement extraction and quantification
- **Claude Haiku**: Natural, professional narrative generation
- **Gemini Flash**: Industry keyword optimization and ATS enhancement
- **Cross-Validation**: Models check each other to reduce hallucinations to <4%
- **Confidence Scoring**: Transparent AI reliability metrics for every suggestion

### 3. Intelligent Template System
- **5 Professional Templates**: Tech Professional, Creative Director, Business Executive, Academic Researcher, Freelancer
- **AI Template Matching**: Automatically recommends templates based on your industry and role
- **Fully Responsive**: Mobile-first design, perfect on all devices
- **Dark Mode Support**: Built-in theme switching
- **Component Library**: Hero, About, Experience, Projects, Skills, Contact, Testimonials, Blog

### 4. AI Design Assistant
- **Natural Language Editing**: "Make it more minimal", "Add more white space", "Show my GitHub projects prominently"
- **Real-Time Preview**: See changes instantly as you customize
- **Smart Suggestions**: AI recommends improvements based on design best practices
- **Undo/Redo**: Full history of design changes

### 5. One-Click Deployment
- **Vercel Integration**: Deploy with custom domain and SSL in 60 seconds
- **Netlify Support**: Alternative hosting with CDN
- **GitHub Pages**: Free hosting for open-source portfolios
- **SEO Optimized**: Meta tags, sitemaps, structured data, Open Graph
- **Performance First**: Lighthouse scores >95, Core Web Vitals optimized

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript 5.3+ (strict mode)
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **UI Components**: Shadcn UI (owned components, full customization)
- **State Management**: Tanstack Query v5 (server state), Zustand (client state)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js 20+ (serverless on Vercel)
- **API**: Next.js API Routes (App Router)
- **Database**: Supabase (PostgreSQL 15)
- **Authentication**: Supabase Auth (JWT + OAuth)
- **File Storage**: Supabase Storage (S3-compatible)
- **Caching**: Redis (Upstash) with 30-day TTL

### AI/ML
- **OpenAI**: GPT-4o-mini for achievement extraction
- **Anthropic**: Claude Haiku for narrative generation
- **Google AI**: Gemini Flash for optimization
- **Observability**: LangSmith for prompt monitoring
- **Validation**: Zod runtime checks + multi-model cross-validation

### Deployment & Infrastructure
- **Hosting**: Vercel (Edge Functions, CDN)
- **DNS**: Vercel Domains / Cloudflare
- **Monitoring**: Sentry (errors), Vercel Analytics (performance), PostHog (product)
- **CI/CD**: GitHub Actions
- **Testing**: Vitest (unit), Playwright (E2E)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/boone51/portfoliosis.git
cd portfoliosis

# Install dependencies
npm install

# Set up environment variables (see SETUP.md for details)
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building portfolios!

## Project Structure

```
Portfoliosis/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── (auth)/            # Authentication pages (login, signup)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API endpoints (auth, portfolios, ai, deployment)
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── editor/            # Portfolio editor components
│   │   ├── templates/         # Portfolio templates (5 variants)
│   │   └── portfolio/         # Rendered portfolio components
│   │
│   ├── lib/
│   │   ├── ai/                # AI orchestration and models
│   │   ├── parsers/           # Resume, LinkedIn, GitHub parsers
│   │   ├── generators/        # Static site generation
│   │   ├── deployment/        # Vercel, Netlify, GitHub Pages
│   │   ├── db/                # Supabase client and queries
│   │   └── utils/             # Shared utilities
│   │
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles
│
├── public/                    # Static assets
├── tests/                     # Unit, integration, E2E tests
├── docs/                      # Additional documentation
└── [config files]             # next.config.js, tailwind.config.ts, etc.
```

## Documentation

- **[SETUP.md](./SETUP.md)**: Detailed setup instructions, environment variables, troubleshooting
- **[TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)**: Complete technical specification with API schemas
- **[CTO_ASSESSMENT.md](./CTO_ASSESSMENT.md)**: Architecture validation and technical vision
- **[PROPOSAL.md](./PROPOSAL.md)**: Original product proposal and business case

## Team Structure

**Leadership**
- **Devon Cross** (CTO): Technical architecture, code reviews, critical decisions
- **Lisa Klein** (CDO): Design system, template design, UX strategy

**Division Leads**
- **Maya Patel** (Web Development Lead): Next.js, templates, editor, deployment
- **James Chen** (AI & Automation Lead): AI orchestration, prompts, validation
- **Sarah Okonkwo** (Technical Consulting Lead): Architecture reviews, security, performance

**Operations**
- **Neo** (GitHub Operations): Git workflows, CI/CD, deployments

## Contributing

We follow a structured development process:

### Development Workflow

1. **Branch Strategy**
   - `main`: Production-ready code
   - `develop`: Integration branch for features
   - `feature/*`: Individual feature branches
   - `fix/*`: Bug fix branches

2. **Code Standards**
   - TypeScript strict mode (no `any` types)
   - ESLint + Prettier configured
   - 80%+ test coverage for critical paths
   - All components must have prop types
   - API routes must have Zod validation

3. **Commit Guidelines**
   ```
   type(scope): short description

   Longer explanation if needed

   Fixes #123
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

4. **Pull Request Process**
   - Create PR from feature branch to `develop`
   - Required: Description, screenshots (for UI), test coverage
   - Reviewers: Division lead + CTO for critical changes
   - CI must pass: Linting, type checking, tests, build
   - Squash and merge after approval

5. **Testing Requirements**
   - Unit tests for utilities and business logic
   - Integration tests for API routes
   - E2E tests for critical user flows
   - Accessibility tests (a11y)
   - Performance tests (Lighthouse CI)

### Getting Started as a Contributor

1. Read [SETUP.md](./SETUP.md) and set up your development environment
2. Review [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) to understand the architecture
3. Pick an issue labeled `good-first-issue` or `help-wanted`
4. Comment on the issue to claim it
5. Create a feature branch and start coding
6. Submit a PR following the guidelines above

### Code Review Standards

All code must meet these criteria:
- **Functionality**: Does it work as intended?
- **Performance**: No unnecessary re-renders, optimized queries
- **Security**: No XSS, SQL injection, or auth bypass vulnerabilities
- **Accessibility**: WCAG 2.1 AA compliant
- **Maintainability**: Clear variable names, comments for complex logic
- **Testing**: Adequate test coverage

## Performance Targets

### Page Load
- Time to Interactive (TTI): < 2s
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Lighthouse Score: > 95

### AI Processing
- Resume parsing: < 5s
- Multi-model enhancement: < 15s
- Template generation: < 3s
- Total time to first preview: < 30s

### Build & Deploy
- Static site generation: < 30s
- Vercel deployment: < 60s

## Security

- **Data Protection**: AES-256 encryption at rest, TLS 1.3 in transit
- **Authentication**: JWT with refresh tokens, OAuth 2.0 for integrations
- **API Security**: Rate limiting, CSRF protection, input validation
- **Privacy**: GDPR compliant, user data export/deletion on request
- **Monitoring**: Sentry error tracking, security audit logs

## Roadmap

### Phase 1: Foundation (Weeks 1-3) - CURRENT
- [x] Architecture documentation
- [x] Type system design
- [ ] Supabase setup
- [ ] Authentication system
- [ ] File upload handling

### Phase 2: AI Engine (Weeks 4-6)
- [ ] Resume parser (PDF/DOCX)
- [ ] Multi-model orchestration
- [ ] Prompt engineering + validation
- [ ] Caching layer (Redis)
- [ ] LangSmith observability

### Phase 3: Template System (Weeks 7-9)
- [ ] Design system implementation
- [ ] 5 professional templates
- [ ] Responsive layouts + dark mode
- [ ] Preview renderer

### Phase 4: Editor (Weeks 10-11)
- [ ] Real-time preview
- [ ] Visual customization
- [ ] AI design assistant
- [ ] Content editing

### Phase 5: Deployment (Weeks 12-13)
- [ ] Static site generator
- [ ] Vercel/Netlify/GitHub Pages integration
- [ ] SEO optimization

### Phase 6: Launch (Weeks 14-16)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Security audit
- [ ] Beta launch

## License

MIT License - See [LICENSE](./LICENSE) for details

## Contact

- **GitHub**: [github.com/boone51/portfoliosis](https://github.com/boone51/portfoliosis)
- **Website**: [portfoliosis.com](https://portfoliosis.com) (coming soon)
- **Email**: team@portfoliosis.com

---

Built with precision by the Boone51 Web Development Division.
