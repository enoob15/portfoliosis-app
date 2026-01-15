# Portfoliosis Setup Guide

Complete development environment setup for Portfoliosis. Follow these steps to get your local environment running.

## Prerequisites

### Required Software

1. **Node.js 20.x or higher**
   ```bash
   # Check version
   node --version  # Should be v20.0.0 or higher
   npm --version   # Should be 10.0.0 or higher
   ```

   **Installation**:
   - Windows: Download from [nodejs.org](https://nodejs.org/) or use `winget install OpenJS.NodeJS`
   - macOS: `brew install node@20`
   - Linux: `nvm install 20` (recommended) or use your package manager

2. **Git**
   ```bash
   git --version  # Should be 2.40.0 or higher
   ```

3. **Code Editor**
   - Recommended: VS Code with extensions:
     - ESLint
     - Prettier
     - Tailwind CSS IntelliSense
     - TypeScript and JavaScript Language Features
     - GitLens

### Recommended Tools

- **Postman** or **Insomnia**: For API testing
- **Redis Desktop Manager**: For viewing cache data
- **TablePlus** or **DBeaver**: For database inspection

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/boone51/portfoliosis.git
cd portfoliosis
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Tailwind CSS, Shadcn UI
- Supabase client
- AI SDK libraries (OpenAI, Anthropic, Google AI)
- Tanstack Query, Zustand
- Development tools (ESLint, Prettier, Vitest, Playwright)

### 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Now edit `.env.local` with your actual API keys and configuration. See the **Required API Keys** section below for details on obtaining each key.

---

## Required API Keys and Services

### 1. Supabase (Database & Authentication)

**What it's for**: PostgreSQL database, authentication, file storage

**Setup Steps**:

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project:
   - Project name: `portfoliosis-dev`
   - Database password: Generate a strong password (save it!)
   - Region: Choose closest to your location
   - Wait 2-3 minutes for project initialization

3. Get your API keys:
   - Go to Project Settings > API
   - Copy `URL` → This is your `SUPABASE_URL`
   - Copy `anon public` key → This is your `SUPABASE_ANON_KEY`
   - Copy `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY` (KEEP SECRET!)

4. Add to `.env.local`:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**Cost**: Free tier includes 500MB database, 1GB file storage, 50,000 monthly active users

### 2. OpenAI API (GPT-4o-mini)

**What it's for**: Achievement extraction, content quantification

**Setup Steps**:

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Add payment method (required for API access)
   - Billing > Payment methods > Add card
4. Create API key:
   - API keys > Create new secret key
   - Name it `portfoliosis-dev`
   - Copy the key (you won't see it again!)

5. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-proj-...
   ```

**Cost**: ~$0.03 per portfolio (GPT-4o-mini pricing)

**Budget Safety**:
- Set usage limits: Billing > Usage limits
- Recommended: $20/month for development

### 3. Anthropic API (Claude Haiku)

**What it's for**: Natural narrative generation, professional tone

**Setup Steps**:

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Add payment method:
   - Settings > Billing > Add payment method
4. Create API key:
   - Settings > API Keys > Create Key
   - Name it `portfoliosis-dev`
   - Copy the key

5. Add to `.env.local`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

**Cost**: ~$0.07 per portfolio (Claude Haiku pricing)

**Budget Safety**:
- Set monthly spending limit: Settings > Billing > Spending limits
- Recommended: $20/month for development

### 4. Google AI API (Gemini Flash)

**What it's for**: Industry keyword optimization, ATS enhancement

**Setup Steps**:

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Get API key"
4. Create API key in existing Google Cloud project or create new one
5. Copy the API key

6. Add to `.env.local`:
   ```bash
   GOOGLE_AI_API_KEY=AIzaSy...
   ```

**Cost**: ~$0.10 per portfolio (Gemini Flash 2.0 pricing)

**Budget Safety**:
- Free tier: 1,500 requests per day
- After free tier: Enable billing in Google Cloud Console

### 5. Redis (Upstash) - Optional but Recommended

**What it's for**: Caching AI results to reduce costs

**Setup Steps**:

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Create database:
   - Click "Create Database"
   - Name: `portfoliosis-cache`
   - Type: Regional
   - Region: Choose closest to your Vercel region
   - TLS: Enabled

4. Copy connection details:
   - Click on your database
   - Copy "UPSTASH_REDIS_REST_URL"

5. Add to `.env.local`:
   ```bash
   REDIS_URL=https://your-redis.upstash.io
   REDIS_TOKEN=your-token-here
   ```

**Cost**: Free tier includes 10,000 commands/day

### 6. OAuth Providers (Optional for MVP)

#### LinkedIn OAuth

**What it's for**: Import LinkedIn profile data

**Setup Steps**:

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers)
2. Create app:
   - App name: `Portfoliosis Dev`
   - LinkedIn Page: Your company page or personal
   - App logo: Upload any 300x300 image
3. Get credentials:
   - Auth > Application credentials
   - Copy `Client ID` and `Client Secret`
4. Configure OAuth:
   - Auth > OAuth 2.0 settings
   - Redirect URLs: `http://localhost:3000/api/auth/oauth/linkedin`
5. Request permissions:
   - Products > Request access to "Sign In with LinkedIn using OpenID Connect"
   - Scopes: `openid`, `profile`, `email`

6. Add to `.env.local`:
   ```bash
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   ```

**Note**: Production LinkedIn API requires company verification. For MVP, we'll use manual import.

#### GitHub OAuth

**What it's for**: Import GitHub repositories and activity

**Setup Steps**:

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - Application name: `Portfoliosis Dev`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/oauth/github`
4. Click "Register application"
5. Copy `Client ID`
6. Generate `Client Secret` and copy it

7. Add to `.env.local`:
   ```bash
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   GITHUB_TOKEN=ghp_your-personal-access-token
   ```

**Note**: For GitHub API, also create a personal access token:
- Settings > Developer settings > Personal access tokens > Tokens (classic)
- Generate new token with `repo`, `read:user` scopes

### 7. Deployment Platforms (For Phase 5)

#### Vercel Token

**Setup Steps**:

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create token:
   - Name: `portfoliosis-deployments`
   - Scope: Full Account
   - Expiration: No expiration (or 1 year)
3. Copy token

4. Add to `.env.local`:
   ```bash
   VERCEL_TOKEN=your-token-here
   ```

#### Netlify Token

**Setup Steps**:

1. Go to [app.netlify.com/user/applications/personal](https://app.netlify.com/user/applications/personal)
2. Create new access token
3. Name: `portfoliosis-deployments`
4. Copy token

5. Add to `.env.local`:
   ```bash
   NETLIFY_TOKEN=your-token-here
   ```

### 8. Monitoring & Analytics (Optional for MVP)

#### Sentry (Error Tracking)

1. Go to [sentry.io](https://sentry.io)
2. Create project:
   - Platform: Next.js
   - Alert frequency: Default
3. Copy DSN

4. Add to `.env.local`:
   ```bash
   SENTRY_DSN=https://...@sentry.io/...
   ```

#### PostHog (Product Analytics)

1. Go to [posthog.com](https://posthog.com)
2. Create account and project
3. Copy API key from Project Settings

4. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

---

## Database Setup

### Run Migrations

Once Supabase is configured, run the database migrations:

```bash
npm run db:migrate
```

This will create all required tables:
- `users`
- `portfolios`
- `portfolio_versions`
- `ai_jobs`
- `templates`
- `portfolio_analytics`

### Seed Initial Data

Populate the database with template data:

```bash
npm run db:seed
```

This creates the 5 default templates:
- Tech Professional
- Creative Director
- Business Executive
- Academic Researcher
- Freelancer

### Verify Database

Check that tables were created:

1. Open Supabase Dashboard
2. Go to Table Editor
3. Verify all 6 tables exist with correct schema

---

## Local Development Configuration

### 1. Configure Next.js

The `next.config.js` is already configured, but verify these settings:

```javascript
// next.config.js
module.exports = {
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  images: {
    domains: ['your-project.supabase.co'], // Add your Supabase URL
  },
}
```

### 2. Configure Tailwind CSS

Tailwind is pre-configured with our design system. Colors, fonts, and spacing are in `tailwind.config.ts`.

### 3. Configure TypeScript

TypeScript strict mode is enabled. Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true
  }
}
```

---

## Running the Development Server

### Start the Server

```bash
npm run dev
```

The app will be available at: [http://localhost:3000](http://localhost:3000)

### Verify Everything Works

1. **Frontend**: Navigate to `http://localhost:3000` - you should see the landing page
2. **Database**: Create an account - this tests Supabase auth
3. **API**: Upload a resume - this tests file upload and API routes
4. **AI**: Run enhancement - this tests AI orchestration (requires API keys)

### Development Commands

```bash
# Development server (with hot reload)
npm run dev

# Production build (test before deploying)
npm run build
npm run start

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Formatting
npm run format
npm run format:check

# Testing
npm run test              # Run unit tests
npm run test:watch        # Watch mode
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report

# Database
npm run db:migrate        # Run migrations
npm run db:seed           # Seed data
npm run db:reset          # Reset database (WARNING: deletes data)
npm run db:studio         # Open Supabase Studio
```

---

## Common Issues and Troubleshooting

### Issue: "Module not found" errors

**Cause**: Dependencies not installed or corrupted node_modules

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "SUPABASE_URL is not defined"

**Cause**: Environment variables not loaded

**Solution**:
1. Verify `.env.local` exists in project root (not src/)
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Check file is named `.env.local` not `.env` or `.env.development`

### Issue: "Failed to fetch" when calling API

**Cause**: API route not found or CORS issue

**Solution**:
1. Check API route file exists: `src/app/api/your-route/route.ts`
2. Verify route export: `export async function POST(req: Request) { ... }`
3. Check network tab in browser DevTools for actual error

### Issue: AI models returning errors

**Cause**: Invalid API keys or rate limits

**Solution**:
1. Verify API keys in `.env.local` (no extra spaces)
2. Check OpenAI/Anthropic/Google AI dashboards for usage limits
3. Test each API separately:
   ```bash
   # Test OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"

   # Test Anthropic
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01"
   ```

### Issue: Database migration fails

**Cause**: Supabase connection issue or syntax error

**Solution**:
1. Check Supabase project is running (Dashboard > Project Settings)
2. Verify connection string in `.env.local`
3. Run migrations manually in Supabase SQL Editor
4. Check migration file syntax in `supabase/migrations/`

### Issue: "Redis connection refused"

**Cause**: Redis not running or wrong connection URL

**Solution**:
1. Verify Redis URL in `.env.local`
2. Test connection in Upstash dashboard
3. For local development, Redis is optional - remove `REDIS_URL` to disable caching

### Issue: TypeScript errors on build

**Cause**: Type mismatches or missing type definitions

**Solution**:
```bash
# Check types
npm run type-check

# Common fixes:
# 1. Update imports to include types
# 2. Add "types" to component props
# 3. Use Zod schemas for runtime validation
```

### Issue: Tailwind styles not applying

**Cause**: Tailwind not detecting files or purge issue

**Solution**:
1. Verify `tailwind.config.ts` includes all source paths
2. Restart dev server
3. Check browser DevTools for CSS class names

### Issue: File upload fails

**Cause**: Supabase storage not configured

**Solution**:
1. Go to Supabase Dashboard > Storage
2. Create bucket: `portfolios` (public)
3. Set policies for authenticated users:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Users can upload files"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'portfolios');
   ```

---

## Development Workflow

### 1. Before Starting Work

```bash
# Pull latest changes
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Install any new dependencies
npm install

# Run tests to ensure baseline
npm run test
```

### 2. During Development

```bash
# Run dev server
npm run dev

# In another terminal, watch tests
npm run test:watch

# Check types periodically
npm run type-check

# Format code before committing
npm run format
```

### 3. Before Committing

```bash
# Run all checks
npm run lint
npm run type-check
npm run test
npm run build

# If all pass, commit
git add .
git commit -m "feat(scope): your descriptive message"
```

### 4. Push and Create PR

```bash
# Push feature branch
git push origin feature/your-feature-name

# Create PR on GitHub
# - Target: develop
# - Reviewers: Division lead + CTO for critical changes
# - Labels: feature, needs-review
```

---

## Performance Optimization Tips

### 1. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
/>
```

### 2. Code Splitting

```typescript
// Use dynamic imports for large components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false, // Disable SSR if not needed
})
```

### 3. Database Query Optimization

```typescript
// Use select to limit columns
const { data } = await supabase
  .from('portfolios')
  .select('id, name, slug') // Only fetch needed columns
  .eq('user_id', userId)
  .limit(10)
```

### 4. AI Cost Optimization

```typescript
// Check cache before calling AI
const cacheKey = `resume:${hash(resumeText)}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

// Call AI
const result = await aiOrchestrator.process(resumeText)

// Cache for 30 days
await redis.setex(cacheKey, 60 * 60 * 24 * 30, JSON.stringify(result))
```

---

## Security Best Practices

### 1. Environment Variables

- NEVER commit `.env.local` to Git (it's in `.gitignore`)
- Use different API keys for development and production
- Rotate keys every 90 days
- Use Vercel's encrypted environment variables for production

### 2. Input Validation

```typescript
// Always validate with Zod
import { z } from 'zod'

const portfolioSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
})

const validated = portfolioSchema.parse(input)
```

### 3. Authentication

```typescript
// Always check auth on API routes
import { createClient } from '@/lib/db/supabase'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Proceed with authenticated request
}
```

### 4. SQL Injection Prevention

```typescript
// Use parameterized queries (Supabase handles this)
// GOOD:
await supabase.from('portfolios').select('*').eq('user_id', userId)

// BAD (don't do this):
await supabase.rpc('raw_sql', { query: `SELECT * FROM portfolios WHERE user_id = '${userId}'` })
```

---

## Getting Help

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Project-Specific
- Check [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) for architecture details
- Review [CTO_ASSESSMENT.md](./CTO_ASSESSMENT.md) for technical decisions
- Ask in GitHub Discussions for Q&A
- Create issue for bugs

### Community
- Next.js Discord
- Supabase Discord
- OpenAI Community Forum

---

## Next Steps

Once your environment is set up:

1. Read [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) to understand the architecture
2. Review existing code in `src/` directory
3. Check current phase tasks in [README.md](./README.md#roadmap)
4. Pick an issue from GitHub Issues labeled `good-first-issue`
5. Start building!

---

**Setup complete!** You're ready to build the future of portfolio generation.
