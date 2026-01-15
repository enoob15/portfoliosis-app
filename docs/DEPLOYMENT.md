# Portfoliosis Deployment Guide

## Table of Contents

1. [Development Environment](#development-environment)
2. [Staging Deployment](#staging-deployment)
3. [Production Deployment](#production-deployment)
4. [Database Migrations](#database-migrations)
5. [Environment Variables](#environment-variables)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Rollback Procedures](#rollback-procedures)
8. [Monitoring & Alerts](#monitoring--alerts)
9. [Portfolio Deployment Pipeline](#portfolio-deployment-pipeline)
10. [Troubleshooting](#troubleshooting)

---

## Development Environment

### Prerequisites
- Node.js 20+
- Git
- Vercel CLI (optional, for local preview)

### Setup
```bash
# Clone repository
git clone https://github.com/your-org/portfoliosis.git
cd portfoliosis

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure environment variables (see SETUP.md)

# Run development server
npm run dev
```

Development server runs on `http://localhost:3000`

### Hot Module Replacement (HMR)
Next.js provides automatic HMR for:
- React components
- API routes
- CSS/Tailwind changes
- TypeScript files

---

## Staging Deployment

### Vercel Preview Deployments

Every pull request automatically creates a preview deployment.

**Automatic Previews**:
```bash
# Push to any branch
git push origin feature/new-feature

# GitHub Actions triggers Vercel preview build
# Preview URL: https://portfoliosis-git-feature-new-feature.vercel.app
```

**Manual Preview**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Follow prompts to link project
```

**Preview Environment Variables**:
- Use Vercel dashboard to set preview-specific env vars
- Preview deployments use Supabase staging database
- AI API keys should use development quotas

---

## Production Deployment

### Vercel Production Deployment

**Prerequisites**:
1. Vercel account connected to GitHub
2. Production environment variables configured
3. Custom domain configured (portfoliosis.com)
4. All tests passing

**Deployment Process**:

```bash
# Ensure you're on main branch
git checkout main

# Pull latest
git pull origin main

# Run tests
npm run test
npm run build  # Ensure build succeeds

# Merge feature branch (via PR)
# GitHub Actions automatically deploys to production

# Or manual deployment
vercel --prod
```

**Production Checklist**:
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Feature flags reviewed
- [ ] Performance audit (Lighthouse >95)
- [ ] Security scan complete
- [ ] Monitoring configured

**Production URL**: `https://portfoliosis.com`

---

## Database Migrations

### Supabase Migrations

**Create Migration**:
```bash
# Using Supabase CLI
supabase migration new add_new_feature

# Edit migration file in supabase/migrations/
# Example: 20240101000000_add_new_feature.sql
```

**Apply Migration (Local)**:
```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push
```

**Apply Migration (Staging)**:
```bash
# Connect to staging
supabase link --project-ref <staging-project-ref>

# Apply migrations
supabase db push
```

**Apply Migration (Production)**:
```bash
# Connect to production
supabase link --project-ref <prod-project-ref>

# Create backup first!
# In Supabase dashboard: Database > Backups > Create Backup

# Apply migrations
supabase db push

# Verify migration
supabase db reset --dry-run
```

**Migration Best Practices**:
- Always create backups before production migrations
- Test migrations on staging first
- Use transactions for multi-step migrations
- Include rollback SQL in comments
- Avoid destructive changes (DROP TABLE)

**Example Migration**:
```sql
-- Migration: Add portfolio analytics table
-- Created: 2024-01-01
-- Rollback: DROP TABLE portfolio_analytics;

BEGIN;

CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_site INTEGER,
  bounce_rate DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX idx_portfolio_analytics_date ON portfolio_analytics(date);

-- Row Level Security
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON portfolio_analytics FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()
    )
  );

COMMIT;
```

---

## Environment Variables

### Development (.env.local)
```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Supabase (local)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<local-anon-key>

# AI (dev keys with lower quotas)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

### Staging (Vercel Preview)
```bash
# Vercel Dashboard > Settings > Environment Variables
# Scope: Preview

NEXT_PUBLIC_APP_URL=https://portfoliosis-staging.vercel.app
NODE_ENV=staging
SUPABASE_URL=https://staging-project.supabase.co
# ... other staging credentials
```

### Production (Vercel)
```bash
# Vercel Dashboard > Settings > Environment Variables
# Scope: Production

NEXT_PUBLIC_APP_URL=https://portfoliosis.com
NODE_ENV=production
SUPABASE_URL=https://prod-project.supabase.co
# ... other production credentials
```

**Managing Secrets**:
```bash
# Using Vercel CLI
vercel env add OPENAI_API_KEY production
vercel env pull .env.production.local  # Download for testing
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true

  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

**Pipeline Stages**:
1. **Lint** - ESLint checks
2. **Type Check** - TypeScript compilation
3. **Test** - Unit + integration tests
4. **Build** - Next.js production build
5. **Deploy** - Vercel deployment
6. **Lighthouse** - Performance audit (production only)

**Required Secrets** (GitHub Settings > Secrets):
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `LHCI_GITHUB_APP_TOKEN` - Lighthouse CI token

---

## Rollback Procedures

### Vercel Rollback

**Via Dashboard**:
1. Go to Vercel dashboard > Deployments
2. Find previous successful deployment
3. Click "..." > "Promote to Production"
4. Confirm rollback

**Via CLI**:
```bash
# List recent deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url> --scope=<team-name>
```

### Database Rollback

**Supabase Rollback**:
```bash
# Restore from backup
# 1. Go to Supabase dashboard > Database > Backups
# 2. Select backup before migration
# 3. Click "Restore"

# Or using SQL
-- Find backup
SELECT * FROM pg_available_backups ORDER BY backup_time DESC LIMIT 5;

-- Restore (requires superuser)
SELECT pg_restore_backup('<backup_id>');
```

**Manual Rollback Migration**:
```sql
-- Create rollback migration
supabase migration new rollback_feature_name

-- Add rollback SQL
-- Example: Undo add_analytics_table
DROP TABLE IF EXISTS portfolio_analytics;
```

---

## Monitoring & Alerts

### Vercel Analytics

Automatically enabled for all deployments:
- Real User Monitoring (RUM)
- Core Web Vitals
- Page performance
- Edge function metrics

**View**: Vercel Dashboard > Analytics

### Sentry Error Tracking

**Setup**:
```typescript
// src/app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Alerts**:
- Configure in Sentry dashboard
- Slack integration for critical errors
- Email alerts for performance regressions

### Uptime Monitoring

**UptimeRobot** (free tier):
- Monitor https://portfoliosis.com every 5 minutes
- Alert if down for >2 minutes
- Slack/email notifications

**Setup**:
1. Create account at uptimerobot.com
2. Add HTTPS monitor
3. Configure alert contacts

### Database Monitoring

**Supabase Dashboard**:
- Database health
- Connection pool usage
- Slow queries
- Storage usage

**Alerts**:
- Set alerts for >80% connection pool usage
- Monitor table sizes (alert at >80% free tier limit)
- Slow query alerts (>1s query time)

---

## Portfolio Deployment Pipeline

### User Portfolio Static Site Generation

When a user deploys their portfolio, Portfoliosis:

1. **Generate Static Site** (30s)
2. **Optimize Assets** (10s)
3. **Deploy to Platform** (20-60s)

**Supported Platforms**:
- Vercel
- Netlify
- GitHub Pages

### Deploy to Vercel (User Portfolio)

```typescript
// lib/deployment/vercel.ts
async function deployToVercel(portfolio: Portfolio) {
  // 1. Generate static site
  const staticSite = await generateStaticSite(portfolio);

  // 2. Create Vercel project (if doesn't exist)
  const project = await vercel.createProject({
    name: portfolio.slug,
    framework: 'nextjs',
  });

  // 3. Deploy
  const deployment = await vercel.deploy({
    projectId: project.id,
    files: staticSite.files,
    target: 'production',
  });

  // 4. Configure custom domain (if provided)
  if (portfolio.custom_domain) {
    await vercel.addDomain({
      projectId: project.id,
      domain: portfolio.custom_domain,
    });
  }

  return deployment;
}
```

**Environment Variables for User Deployments**:
```bash
# Vercel project for user portfolios
VERCEL_TOKEN=<service-account-token>
VERCEL_TEAM_ID=<team-id>
```

### Deploy to Netlify (User Portfolio)

```typescript
// lib/deployment/netlify.ts
async function deployToNetlify(portfolio: Portfolio) {
  // 1. Generate static site
  const staticSite = await generateStaticSite(portfolio);

  // 2. Create Netlify site (if doesn't exist)
  const site = await netlify.createSite({
    name: portfolio.slug,
  });

  // 3. Deploy
  const deployment = await netlify.deploy({
    siteId: site.id,
    dir: staticSite.directory,
  });

  // 4. Configure custom domain
  if (portfolio.custom_domain) {
    await netlify.addDomain({
      siteId: site.id,
      domain: portfolio.custom_domain,
    });
  }

  return deployment;
}
```

### Deploy to GitHub Pages (User Portfolio)

```typescript
// lib/deployment/github-pages.ts
async function deployToGitHubPages(portfolio: Portfolio, githubToken: string) {
  // 1. Generate static site
  const staticSite = await generateStaticSite(portfolio);

  // 2. Create GitHub repo (if doesn't exist)
  const repo = await github.createRepo({
    name: portfolio.slug,
    private: false,
  });

  // 3. Push to gh-pages branch
  await github.pushToRepo({
    repo: repo.name,
    branch: 'gh-pages',
    files: staticSite.files,
    token: githubToken,
  });

  // 4. Enable GitHub Pages
  await github.enablePages({
    repo: repo.name,
    branch: 'gh-pages',
  });

  // GitHub Pages URL: https://<username>.github.io/<repo-name>
  return {
    url: `https://${github.username}.github.io/${repo.name}`,
  };
}
```

### Custom Domain Configuration

**Vercel**:
```bash
# Add domain
vercel domains add example.com --scope=<team>

# Verify ownership (TXT record)
# Add to DNS: _vercel.<domain> TXT <verification-code>

# Configure DNS (A record)
# A: 76.76.21.21
# CNAME: cname.vercel-dns.com
```

**Netlify**:
```bash
# Add custom domain in Netlify dashboard
# Settings > Domain management > Add custom domain

# Configure DNS
# CNAME: <site-name>.netlify.app
```

**SSL Certificates**:
- Vercel: Automatic SSL via Let's Encrypt
- Netlify: Automatic SSL via Let's Encrypt
- GitHub Pages: Automatic SSL (after 24h propagation)

---

## Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm ci
npm run build
```

**Error: "Type error in [file]"**
```bash
# Run type check
npm run type-check

# Fix types, then rebuild
npm run build
```

**Error: "Environment variable missing"**
```bash
# Check .env.local
cat .env.local

# Verify all required variables present
# See .env.example for complete list
```

### Deployment Failures

**Vercel deployment stuck**:
```bash
# Cancel deployment
vercel remove <deployment-url> --yes

# Redeploy
vercel --prod
```

**Database connection timeout**:
- Check Supabase status
- Verify SUPABASE_URL and keys
- Check connection pool (max 60 connections on free tier)

### Database Issues

**Migration failed**:
```bash
# Check migration logs
supabase db logs

# Rollback migration (if safe)
# Edit migration file and re-run
supabase db push
```

**Connection pool exhausted**:
```sql
-- Check active connections
SELECT COUNT(*) FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '5 minutes';
```

### Performance Issues

**Slow API responses**:
1. Check Vercel function logs
2. Review Sentry performance traces
3. Check database query performance
4. Review AI API latency

**High AI costs**:
1. Check Redis cache hit rate
2. Review prompt lengths
3. Optimize model selection
4. Implement request queuing

---

## Emergency Contacts

**Critical Issues**:
- Devon Cross (CTO): devon@portfoliosis.com
- Maya Patel (Web Dev Lead): maya@portfoliosis.com

**Service Status**:
- Vercel: status.vercel.com
- Supabase: status.supabase.com
- OpenAI: status.openai.com

---

## Deployment Checklist

**Pre-Deployment**:
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Performance audit passed
- [ ] Security scan completed

**Deployment**:
- [ ] Merge to main branch
- [ ] Monitor CI/CD pipeline
- [ ] Verify deployment URL
- [ ] Check error tracking (Sentry)
- [ ] Monitor metrics (Vercel Analytics)

**Post-Deployment**:
- [ ] Smoke test critical flows
- [ ] Check database migrations applied
- [ ] Verify integrations (AI, OAuth)
- [ ] Monitor for 30 minutes
- [ ] Update team in Slack

**Rollback If**:
- Critical bugs in production
- >10% error rate
- Performance degradation >50%
- Database corruption
- Security vulnerability

---

## Best Practices

1. **Always deploy to staging first**
2. **Run full test suite before production**
3. **Create database backups before migrations**
4. **Monitor deployments for 30 minutes**
5. **Document all manual changes**
6. **Use feature flags for gradual rollout**
7. **Keep deployment small and frequent**
8. **Communicate with team before/after deploy**
