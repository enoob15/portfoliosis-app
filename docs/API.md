# Portfoliosis API Documentation

## Overview

Portfoliosis REST API provides endpoints for portfolio creation, AI enhancement, template management, and deployment. All endpoints follow RESTful conventions and return JSON responses.

**Base URL**: `https://portfoliosis.com/api` (production)
**Base URL**: `http://localhost:3000/api` (development)

## Authentication

Most endpoints require authentication via JWT tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Rate Limiting
- Authenticated: 100 requests/minute
- Unauthenticated: 20 requests/minute
- AI endpoints: 10 requests/minute

---

## Authentication Endpoints

### POST /api/auth/signup

Create a new user account.

**Request Body**:
```typescript
{
  email: string;
  password: string;
  name?: string;
}
```

**Response** (201 Created):
```typescript
{
  user: {
    id: string;
    email: string;
    name: string | null;
    created_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
```

**Errors**:
- `400` - Invalid email or password format
- `409` - Email already exists

---

### POST /api/auth/login

Authenticate existing user.

**Request Body**:
```typescript
{
  email: string;
  password: string;
}
```

**Response** (200 OK):
```typescript
{
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
```

**Errors**:
- `401` - Invalid credentials
- `429` - Too many login attempts

---

### POST /api/auth/logout

Invalidate current session.

**Headers**: Requires `Authorization: Bearer <token>`

**Response** (204 No Content)

---

### POST /api/auth/oauth/linkedin

Authenticate with LinkedIn OAuth.

**Request Body**:
```typescript
{
  code: string;
  redirect_uri: string;
}
```

**Response** (200 OK):
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  linkedin_data: {
    headline: string;
    summary: string;
    experience: LinkedInExperience[];
    // ... additional profile data
  };
}
```

---

### POST /api/auth/oauth/github

Authenticate with GitHub OAuth.

**Request Body**:
```typescript
{
  code: string;
  redirect_uri: string;
}
```

**Response** (200 OK):
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  github_data: {
    bio: string;
    repositories: Repository[];
    // ... additional profile data
  };
}
```

---

## Portfolio Endpoints

### GET /api/portfolios

List all portfolios for authenticated user.

**Headers**: Requires `Authorization`

**Query Parameters**:
```typescript
{
  status?: 'draft' | 'published' | 'archived';
  limit?: number; // default 10, max 50
  offset?: number; // default 0
}
```

**Response** (200 OK):
```typescript
{
  portfolios: Array<{
    id: string;
    name: string;
    slug: string;
    template_id: string;
    status: 'draft' | 'published' | 'archived';
    deployment_url: string | null;
    custom_domain: string | null;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

---

### POST /api/portfolios

Create a new portfolio.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  name: string;
  slug?: string; // auto-generated if not provided
}
```

**Response** (201 Created):
```typescript
{
  id: string;
  name: string;
  slug: string;
  template_id: string; // default template
  status: 'draft';
  created_at: string;
  updated_at: string;
}
```

**Errors**:
- `400` - Invalid name or slug
- `409` - Slug already exists
- `429` - Rate limit exceeded

---

### GET /api/portfolios/:id

Get portfolio by ID.

**Headers**: Requires `Authorization`

**Response** (200 OK):
```typescript
{
  id: string;
  user_id: string;
  name: string;
  slug: string;
  template_id: string;
  resume_data: object | null;
  linkedin_data: object | null;
  github_data: object | null;
  manual_data: object | null;
  enhanced_profile: EnhancedProfile;
  customization: object;
  theme: Theme;
  deployment_config: object | null;
  deployment_url: string | null;
  custom_domain: string | null;
  status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

**Errors**:
- `403` - Not authorized to view this portfolio
- `404` - Portfolio not found

---

### PATCH /api/portfolios/:id

Update portfolio.

**Headers**: Requires `Authorization`

**Request Body** (partial update):
```typescript
{
  name?: string;
  slug?: string;
  template_id?: string;
  customization?: object;
  theme?: Theme;
  status?: 'draft' | 'published' | 'archived';
  is_public?: boolean;
}
```

**Response** (200 OK):
```typescript
{
  id: string;
  // ... updated portfolio data
  updated_at: string;
}
```

**Errors**:
- `400` - Invalid update data
- `403` - Not authorized
- `404` - Portfolio not found
- `409` - Slug conflict

---

### DELETE /api/portfolios/:id

Delete portfolio.

**Headers**: Requires `Authorization`

**Response** (204 No Content)

**Errors**:
- `403` - Not authorized
- `404` - Portfolio not found

---

### GET /api/portfolios/:id/versions

Get version history for portfolio.

**Headers**: Requires `Authorization`

**Response** (200 OK):
```typescript
{
  versions: Array<{
    id: string;
    portfolio_id: string;
    version_number: number;
    snapshot: object;
    message: string | null;
    created_at: string;
  }>;
}
```

---

### POST /api/portfolios/:id/versions

Create new version snapshot.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  message?: string;
}
```

**Response** (201 Created):
```typescript
{
  id: string;
  portfolio_id: string;
  version_number: number;
  message: string | null;
  created_at: string;
}
```

---

## Parsing Endpoints

### POST /api/parse/resume

Parse resume file (PDF/DOCX).

**Headers**: Requires `Authorization`, `Content-Type: multipart/form-data`

**Request Body**:
```
file: File (PDF or DOCX, max 10MB)
```

**Response** (200 OK):
```typescript
{
  parsed_data: {
    personal: {
      name: string;
      title: string;
      email: string;
      phone?: string;
      location?: string;
      website?: string;
      social?: SocialLinks;
    };
    summary?: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    projects?: Project[];
    certifications?: Certification[];
    languages?: Language[];
    awards?: Award[];
  };
  confidence: {
    overall: number; // 0-1
    sections: {
      [key: string]: number;
    };
  };
  warnings: string[];
}
```

**Errors**:
- `400` - Invalid file format or size
- `413` - File too large
- `422` - Unable to parse file
- `429` - Rate limit exceeded

---

### POST /api/parse/linkedin

Fetch LinkedIn profile data.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  access_token: string;
}
```

**Response** (200 OK):
```typescript
{
  linkedin_data: {
    headline: string;
    summary: string;
    experience: LinkedInExperience[];
    education: LinkedInEducation[];
    skills: string[];
    endorsements: Endorsement[];
    recommendations: Recommendation[];
  };
  parsed_at: string;
}
```

**Errors**:
- `401` - Invalid LinkedIn access token
- `429` - LinkedIn API rate limit

---

### POST /api/parse/github

Fetch GitHub profile data.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  username: string;
}
```

**Response** (200 OK):
```typescript
{
  github_data: {
    bio: string;
    repositories: Repository[];
    contributions: number;
    stars: number;
    followers: number;
    languages: LanguageStats[];
    pinned_repos: Repository[];
  };
  parsed_at: string;
}
```

**Errors**:
- `404` - GitHub user not found
- `429` - GitHub API rate limit

---

## AI Enhancement Endpoints

### POST /api/ai/enhance

Enhance profile with multi-model AI.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  portfolio_id: string;
  sections?: string[]; // specific sections to enhance, or all if omitted
  options?: {
    tone?: 'professional' | 'casual' | 'creative';
    industry?: string;
    target_role?: string;
  };
}
```

**Response** (200 OK):
```typescript
{
  job_id: string;
  status: 'processing';
  estimated_time_seconds: number;
}
```

**Errors**:
- `400` - Invalid request
- `404` - Portfolio not found
- `429` - AI rate limit exceeded

---

### GET /api/ai/jobs/:jobId

Get AI processing job status.

**Headers**: Requires `Authorization`

**Response** (200 OK):
```typescript
{
  id: string;
  portfolio_id: string;
  job_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output_data?: EnhancedProfile;
  error_message?: string;
  model_used: string;
  tokens_used?: number;
  processing_time_ms?: number;
  created_at: string;
  completed_at?: string;
}
```

---

### POST /api/ai/generate-content

Generate specific content with AI.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  portfolio_id: string;
  content_type: 'summary' | 'project_description' | 'achievement' | 'skill_description';
  context: object; // relevant data for generation
  model?: 'gpt4' | 'claude' | 'gemini'; // optional, auto-selected if omitted
}
```

**Response** (200 OK):
```typescript
{
  generated_content: string;
  model_used: string;
  confidence: number;
  alternatives?: string[];
}
```

---

### POST /api/ai/design-assist

AI design assistant chat.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  portfolio_id: string;
  message: string;
  context?: {
    current_design: object;
    user_preferences: object;
  };
}
```

**Response** (200 OK):
```typescript
{
  response: string;
  actions?: DesignAction[];
  preview_url?: string;
}
```

---

### POST /api/ai/validate

Validate AI-generated content.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  content: string;
  source_data: object;
  validation_type: 'hallucination' | 'accuracy' | 'tone';
}
```

**Response** (200 OK):
```typescript
{
  is_valid: boolean;
  confidence: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion?: string;
  }>;
}
```

---

## Template Endpoints

### GET /api/templates

Get all available templates.

**Response** (200 OK):
```typescript
{
  templates: Array<{
    id: string;
    name: string;
    category: 'tech' | 'creative' | 'business' | 'academic' | 'freelancer';
    preview_url: string;
    description: string;
    best_for: string[];
    industries: string[];
    is_active: boolean;
  }>;
}
```

---

### GET /api/templates/:id

Get template details.

**Response** (200 OK):
```typescript
{
  id: string;
  name: string;
  category: string;
  config: {
    components: Component[];
    theme: Theme;
    layout: Layout;
  };
  preview_url: string;
  description: string;
  metadata: object;
}
```

---

### POST /api/templates/match

Find best templates for a profile.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  portfolio_id: string;
}
```

**Response** (200 OK):
```typescript
{
  recommendations: Array<{
    template_id: string;
    score: number; // 0-1
    reasoning: string;
  }>;
}
```

---

## Deployment Endpoints

### POST /api/portfolios/:id/deploy

Deploy portfolio to hosting platform.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  platform: 'vercel' | 'netlify' | 'github-pages';
  config?: {
    custom_domain?: string;
    environment_variables?: Record<string, string>;
  };
}
```

**Response** (202 Accepted):
```typescript
{
  deployment_id: string;
  status: 'pending';
  platform: string;
  estimated_time_seconds: number;
}
```

---

### GET /api/deployment/:deploymentId/status

Get deployment status.

**Headers**: Requires `Authorization`

**Response** (200 OK):
```typescript
{
  deployment_id: string;
  portfolio_id: string;
  platform: string;
  status: 'pending' | 'building' | 'deploying' | 'ready' | 'failed';
  url?: string;
  error_message?: string;
  build_logs?: string[];
  created_at: string;
  completed_at?: string;
}
```

---

### POST /api/deployment/vercel

Deploy to Vercel.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  portfolio_id: string;
  project_name?: string;
  custom_domain?: string;
}
```

**Response** (200 OK):
```typescript
{
  deployment_url: string;
  project_id: string;
  deployment_id: string;
  status: string;
}
```

---

### POST /api/deployment/netlify

Deploy to Netlify.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  portfolio_id: string;
  site_name?: string;
  custom_domain?: string;
}
```

**Response** (200 OK):
```typescript
{
  deployment_url: string;
  site_id: string;
  deployment_id: string;
  status: string;
}
```

---

### POST /api/deployment/github-pages

Deploy to GitHub Pages.

**Headers**: Requires `Authorization`

**Request Body**:
```typescript
{
  portfolio_id: string;
  repository_name: string;
  branch?: string; // default: gh-pages
}
```

**Response** (200 OK):
```typescript
{
  deployment_url: string;
  repository_url: string;
  deployment_id: string;
  status: string;
}
```

---

## Analytics Endpoints

### GET /api/analytics/:portfolioId

Get analytics for a portfolio.

**Headers**: Requires `Authorization`

**Query Parameters**:
```typescript
{
  start_date: string; // ISO 8601
  end_date: string;   // ISO 8601
}
```

**Response** (200 OK):
```typescript
{
  portfolio_id: string;
  date_range: {
    start: string;
    end: string;
  };
  summary: {
    total_views: number;
    unique_visitors: number;
    avg_time_on_site: number;
    bounce_rate: number;
  };
  daily_stats: Array<{
    date: string;
    views: number;
    unique_visitors: number;
  }>;
  top_pages: Array<{
    path: string;
    views: number;
  }>;
  referrers: Array<{
    source: string;
    visits: number;
  }>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}
```

---

## Error Responses

All error responses follow this format:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: object;
  };
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid request parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (e.g., duplicate slug) |
| 413 | `PAYLOAD_TOO_LARGE` | Request body too large |
| 422 | `UNPROCESSABLE_ENTITY` | Request validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

---

## TypeScript Types

### Core Types

```typescript
interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  template_id: string;
  resume_data: object | null;
  linkedin_data: object | null;
  github_data: object | null;
  manual_data: object | null;
  enhanced_profile: EnhancedProfile;
  customization: object;
  theme: Theme;
  deployment_config: object | null;
  deployment_url: string | null;
  custom_domain: string | null;
  status: 'draft' | 'published' | 'archived';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface Experience {
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string | null;
  current: boolean;
  description?: string;
  achievements?: string[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
  honors?: string[];
}

interface Project {
  name: string;
  description: string;
  url?: string;
  github_url?: string;
  technologies: string[];
  start_date?: string;
  end_date?: string;
  highlights?: string[];
}

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    codeFont?: string;
  };
  spacing: object;
  darkMode: boolean;
}
```

---

## Rate Limiting Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Webhooks (Future)

Webhooks will be available for:
- Portfolio deployment completed
- AI processing completed
- Analytics milestones
- Custom domain verified

---

## Changelog

### v1.0.0 (Initial Release)
- Authentication endpoints
- Portfolio CRUD
- Resume parsing
- AI enhancement
- Template selection
- Deployment to Vercel/Netlify/GitHub Pages
- Basic analytics
