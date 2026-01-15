# Portfoliosis Testing Strategy

## Overview

Comprehensive testing strategy ensuring Portfoliosis delivers exceptional quality, performance, and reliability.

**Testing Pyramid**:
```
        E2E (10%)
      /          \
    Integration (30%)
   /                  \
  Unit Tests (60%)
```

**Coverage Targets**:
- Overall: >80%
- Critical paths: 100%
- UI components: >70%
- Utilities: >90%

---

## Table of Contents

1. [Unit Testing](#unit-testing)
2. [Integration Testing](#integration-testing)
3. [E2E Testing](#e2e-testing)
4. [Performance Testing](#performance-testing)
5. [AI Testing](#ai-testing)
6. [Visual Regression Testing](#visual-regression-testing)
7. [Security Testing](#security-testing)
8. [Accessibility Testing](#accessibility-testing)
9. [CI Integration](#ci-integration)
10. [Test Utilities](#test-utilities)

---

## Unit Testing

### Framework: Vitest

**Why Vitest**:
- Native ESM support
- Vite-powered (fast)
- Jest-compatible API
- Built-in TypeScript support

### Setup

**Install**:
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

**Config** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### What to Test

**Utilities** (`lib/utils/`):
```typescript
// tests/unit/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validateSlug } from '@/lib/utils/validation';

describe('validateEmail', () => {
  it('validates correct emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
  });
});

describe('validateSlug', () => {
  it('validates URL-safe slugs', () => {
    expect(validateSlug('my-portfolio')).toBe(true);
    expect(validateSlug('john-doe-2024')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(validateSlug('My Portfolio')).toBe(false); // spaces
    expect(validateSlug('user@123')).toBe(false); // special chars
  });
});
```

**Parsers** (`lib/parsers/`):
```typescript
// tests/unit/parsers/resume.test.ts
import { describe, it, expect, vi } from 'vitest';
import { parseResume } from '@/lib/parsers/resume';

describe('parseResume', () => {
  it('extracts contact information', async () => {
    const mockPDF = await fs.readFile('tests/fixtures/sample-resume.pdf');
    const result = await parseResume(mockPDF, 'application/pdf');

    expect(result.personal.name).toBe('John Doe');
    expect(result.personal.email).toBe('john@example.com');
  });

  it('parses work experience correctly', async () => {
    const mockPDF = await fs.readFile('tests/fixtures/sample-resume.pdf');
    const result = await parseResume(mockPDF, 'application/pdf');

    expect(result.experience).toHaveLength(3);
    expect(result.experience[0]).toMatchObject({
      company: 'Tech Corp',
      title: 'Senior Developer',
      current: true,
    });
  });

  it('handles malformed PDFs gracefully', async () => {
    const corruptedPDF = Buffer.from('not a pdf');
    await expect(parseResume(corruptedPDF, 'application/pdf'))
      .rejects.toThrow('Invalid PDF format');
  });
});
```

**AI Validation** (`lib/ai/validation.ts`):
```typescript
// tests/unit/ai/validation.test.ts
import { describe, it, expect } from 'vitest';
import { detectHallucination, validateDates } from '@/lib/ai/validation';

describe('detectHallucination', () => {
  it('detects fabricated dates', () => {
    const source = { start_date: '2020-01', end_date: '2022-06' };
    const generated = 'Worked from 2019 to 2023';

    const result = detectHallucination(generated, source);
    expect(result.hasHallucination).toBe(true);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ type: 'date_mismatch' })
    );
  });

  it('passes accurate content', () => {
    const source = { company: 'Acme Corp', title: 'Engineer' };
    const generated = 'Software Engineer at Acme Corp';

    const result = detectHallucination(generated, source);
    expect(result.hasHallucination).toBe(false);
  });
});
```

**React Components**:
```typescript
// tests/unit/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });

  it('is disabled when loading', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Mock Strategies

**AI Models**:
```typescript
// tests/mocks/ai.ts
import { vi } from 'vitest';

export const mockGPT4 = vi.fn().mockResolvedValue({
  content: 'Mocked AI response',
  tokens: 150,
  model: 'gpt-4o-mini',
});

export const mockClaude = vi.fn().mockResolvedValue({
  content: 'Mocked Claude response',
  tokens: 120,
  model: 'claude-haiku',
});
```

**Database**:
```typescript
// tests/mocks/database.ts
import { vi } from 'vitest';

export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: { id: '123', name: 'Test Portfolio' },
          error: null,
        }),
      })),
    })),
    insert: vi.fn().mockResolvedValue({
      data: { id: '456' },
      error: null,
    }),
  })),
};
```

### Run Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

---

## Integration Testing

### API Route Testing

**Setup** (`tests/integration/api/setup.ts`):
```typescript
import { createMocks } from 'node-mocks-http';
import type { NextRequest } from 'next/server';

export function createMockRequest(options: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}) {
  const { req, res } = createMocks({
    method: options.method || 'GET',
    body: options.body,
    headers: options.headers,
    query: options.query,
  });

  return { req, res };
}
```

**Example Tests**:
```typescript
// tests/integration/api/portfolios.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '@/app/api/portfolios/route';
import { createMockRequest } from './setup';

describe('/api/portfolios', () => {
  beforeEach(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  afterEach(async () => {
    // Cleanup
    await cleanupTestDatabase();
  });

  describe('GET', () => {
    it('returns user portfolios', async () => {
      const { req } = createMockRequest({
        method: 'GET',
        headers: { authorization: 'Bearer test-token' },
      });

      const response = await GET(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.portfolios).toBeInstanceOf(Array);
    });

    it('requires authentication', async () => {
      const { req } = createMockRequest({ method: 'GET' });
      const response = await GET(req as NextRequest);

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('creates new portfolio', async () => {
      const { req } = createMockRequest({
        method: 'POST',
        headers: { authorization: 'Bearer test-token' },
        body: { name: 'My Portfolio' },
      });

      const response = await POST(req as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('My Portfolio');
      expect(data.slug).toBeTruthy();
    });

    it('validates required fields', async () => {
      const { req } = createMockRequest({
        method: 'POST',
        headers: { authorization: 'Bearer test-token' },
        body: {},
      });

      const response = await POST(req as NextRequest);
      expect(response.status).toBe(400);
    });
  });
});
```

### Database Integration

```typescript
// tests/integration/database/portfolios.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Portfolio Database Operations', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test-password',
    });
    testUserId = user.user!.id;
  });

  afterAll(async () => {
    // Cleanup test user
    await supabase.auth.admin.deleteUser(testUserId);
  });

  it('creates portfolio with RLS', async () => {
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: testUserId,
        name: 'Test Portfolio',
        slug: 'test-portfolio-123',
        enhanced_profile: {},
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.name).toBe('Test Portfolio');
  });

  it('enforces unique slug constraint', async () => {
    const { error } = await supabase
      .from('portfolios')
      .insert({
        user_id: testUserId,
        name: 'Another Portfolio',
        slug: 'test-portfolio-123', // duplicate
        enhanced_profile: {},
      });

    expect(error).toBeTruthy();
    expect(error?.code).toBe('23505'); // unique violation
  });
});
```

---

## E2E Testing

### Framework: Playwright

**Setup**:
```bash
npm install -D @playwright/test
npx playwright install
```

**Config** (`playwright.config.ts`):
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Critical User Flows

**Portfolio Creation Flow**:
```typescript
// tests/e2e/portfolio-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Portfolio Creation', () => {
  test('complete portfolio creation flow', async ({ page }) => {
    // 1. Sign up
    await page.goto('/signup');
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // 2. Create new portfolio
    await page.click('text=New Portfolio');
    await page.fill('[name="name"]', 'My Awesome Portfolio');
    await page.click('button:has-text("Create")');

    await expect(page).toHaveURL(/\/portfolios\/.+\/edit/);

    // 3. Upload resume
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/resume.pdf');
    await page.click('button:has-text("Upload")');

    // Wait for AI processing
    await expect(page.locator('text=Processing complete')).toBeVisible({
      timeout: 30000,
    });

    // 4. Verify data populated
    await expect(page.locator('[data-testid="name"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="experience-list"]')).toBeVisible();

    // 5. Select template
    await page.click('text=Templates');
    await page.click('[data-template="tech-professional"]');
    await expect(page.locator('[data-testid="preview"]')).toBeVisible();

    // 6. Customize design
    await page.click('text=Customize');
    await page.click('[data-color="primary"]');
    await page.click('[data-swatch="#3B82F6"]'); // blue
    await expect(page.locator('[data-testid="preview"]')).toHaveCSS(
      'color',
      'rgb(59, 130, 246)'
    );

    // 7. Deploy
    await page.click('button:has-text("Deploy")');
    await page.click('text=Vercel');
    await page.click('button:has-text("Deploy Now")');

    await expect(page.locator('text=Deployment successful')).toBeVisible({
      timeout: 60000,
    });

    // 8. Verify deployment URL
    const deploymentUrl = await page.locator('[data-testid="deployment-url"]').textContent();
    expect(deploymentUrl).toMatch(/https:\/\/.+\.vercel\.app/);
  });
});
```

**AI Enhancement Flow**:
```typescript
// tests/e2e/ai-enhancement.spec.ts
import { test, expect } from '@playwright/test';

test('AI enhancement improves content', async ({ page }) => {
  // Login with test account
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');

  // Navigate to existing portfolio
  await page.click('text=My Portfolio');

  // Get original summary
  const originalSummary = await page.locator('[data-field="summary"]').textContent();

  // Trigger AI enhancement
  await page.click('button:has-text("Enhance with AI")');
  await page.check('[data-section="summary"]');
  await page.click('button:has-text("Enhance")');

  // Wait for AI processing
  await expect(page.locator('text=Enhancement complete')).toBeVisible({
    timeout: 20000,
  });

  // Verify summary improved
  const enhancedSummary = await page.locator('[data-field="summary"]').textContent();
  expect(enhancedSummary).not.toBe(originalSummary);
  expect(enhancedSummary!.length).toBeGreaterThan(originalSummary!.length);
});
```

### Run E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui

# Generate report
npx playwright show-report
```

---

## Performance Testing

### Lighthouse CI

**Config** (`.lighthouserc.json`):
```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/dashboard",
        "http://localhost:3000/templates"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### Load Testing

**k6 Script** (`tests/performance/load.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  // Test portfolio list endpoint
  const res = http.get('https://portfoliosis.com/api/portfolios', {
    headers: { Authorization: `Bearer ${__ENV.TEST_TOKEN}` },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run Load Tests**:
```bash
# Install k6
brew install k6  # macOS
# or
choco install k6  # Windows

# Run load test
k6 run tests/performance/load.js
```

---

## AI Testing

### Hallucination Detection

```typescript
// tests/ai/hallucination.test.ts
import { describe, it, expect } from 'vitest';
import { enhanceProfile } from '@/lib/ai/orchestrator';
import { detectHallucination } from '@/lib/ai/validation';

describe('AI Hallucination Detection', () => {
  it('detects fabricated achievements', async () => {
    const source = {
      experience: [{
        company: 'Tech Corp',
        title: 'Developer',
        achievements: ['Built API'],
      }],
    };

    const enhanced = await enhanceProfile(source);

    // Validate each achievement against source
    for (const exp of enhanced.experience) {
      for (const achievement of exp.achievements) {
        const validation = detectHallucination(achievement, source);
        expect(validation.confidence).toBeGreaterThan(0.8);
      }
    }
  });

  it('maintains <4% hallucination rate', async () => {
    const testCases = 100;
    let hallucinations = 0;

    for (let i = 0; i < testCases; i++) {
      const source = generateRandomProfile();
      const enhanced = await enhanceProfile(source);
      const validation = validateEnhancedProfile(enhanced, source);

      if (validation.hasHallucination) {
        hallucinations++;
      }
    }

    const rate = (hallucinations / testCases) * 100;
    expect(rate).toBeLessThan(4);
  });
});
```

### Prompt Regression Testing

```typescript
// tests/ai/prompts.test.ts
import { describe, it, expect } from 'vitest';
import { buildPrompt } from '@/lib/ai/prompts';

describe('Prompt Templates', () => {
  it('generates consistent outputs', async () => {
    const input = { title: 'Developer', years: 3 };

    const results = await Promise.all([
      buildPrompt('summary', input),
      buildPrompt('summary', input),
      buildPrompt('summary', input),
    ]);

    // All results should be similar (not identical due to AI variation)
    expect(results[0].length).toBeGreaterThan(50);
    expect(results.every(r => r.includes('Developer'))).toBe(true);
  });
});
```

---

## Visual Regression Testing

### Percy (Visual Testing)

```bash
npm install -D @percy/cli @percy/playwright
```

```typescript
// tests/visual/templates.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('template visual regression', async ({ page }) => {
  await page.goto('/templates/tech-professional');

  // Capture screenshot
  await percySnapshot(page, 'Tech Professional Template');

  // Test responsive
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone
  await percySnapshot(page, 'Tech Professional Template - Mobile');
});
```

**Run Visual Tests**:
```bash
npx percy exec -- npx playwright test tests/visual
```

---

## Security Testing

### OWASP ZAP

```bash
# Run security scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://portfoliosis.com
```

### Dependency Scanning

```bash
# npm audit
npm audit --audit-level=moderate

# Snyk
npx snyk test
```

---

## Accessibility Testing

### Axe Core

```typescript
// tests/a11y/pages.test.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

**Run A11y Tests**:
```bash
npx playwright test tests/a11y
```

---

## CI Integration

**GitHub Actions** (`.github/workflows/test.yml`):
```yaml
name: Tests

on: [push, pull_request]

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

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

---

## Test Utilities

**Test Fixtures**:
```typescript
// tests/fixtures/portfolio.ts
export const mockPortfolio = {
  id: '123',
  name: 'Test Portfolio',
  slug: 'test-portfolio',
  template_id: 'tech-professional',
  status: 'draft',
  enhanced_profile: {
    personal: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    experience: [],
    education: [],
    skills: [],
  },
};
```

**Custom Matchers**:
```typescript
// tests/matchers.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidSlug(received: string) {
    const isValid = /^[a-z0-9-]+$/.test(received);
    return {
      pass: isValid,
      message: () => `Expected ${received} to be a valid slug`,
    };
  },
});
```

---

## Test Commands

```bash
# Unit tests
npm run test              # Run all unit tests
npm run test:watch        # Watch mode
npm run test:ui           # UI mode
npm run test:coverage     # With coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e          # All browsers
npm run test:e2e:chrome   # Chrome only
npm run test:e2e:debug    # Debug mode

# Performance
npm run test:perf         # Load tests
npm run lighthouse        # Lighthouse audit

# All tests
npm run test:all          # Run everything
```

---

## Best Practices

1. **Write tests before fixing bugs** (reproduce bug, then fix)
2. **Test user behavior, not implementation**
3. **Keep tests independent** (no shared state)
4. **Use descriptive test names**
5. **Mock external dependencies** (AI APIs, databases)
6. **Test edge cases and error paths**
7. **Maintain test fixtures**
8. **Review test coverage regularly**
9. **Run tests locally before pushing**
10. **Keep tests fast** (<5s for unit, <30s for integration)
