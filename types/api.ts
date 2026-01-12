// API types and responses

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
  metadata?: ResponseMetadata
}

export interface APIError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export interface ResponseMetadata {
  timestamp: string
  requestId: string
  processingTime: number
}

// Portfolio API types

export interface CreatePortfolioRequest {
  name: string
  resumeFile?: File
  linkedinUrl?: string
  githubUsername?: string
  manualData?: Partial<ParsedResume>
}

export interface UpdatePortfolioRequest {
  name?: string
  templateId?: string
  customization?: Customization
  enhancedProfile?: EnhancedProfile
  deploymentConfig?: DeploymentConfig
}

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'github-pages'
  config: VercelConfig | NetlifyConfig | GitHubConfig
  customDomain?: string
}

export interface Portfolio {
  id: string
  userId: string
  name: string
  slug: string
  templateId: string

  // Source data
  resumeData?: ParsedResume
  linkedinData?: LinkedInProfile
  githubData?: GitHubProfile
  manualData?: Partial<ParsedResume>

  // Processed data
  enhancedProfile: EnhancedProfile

  // Design
  customization?: Customization
  theme?: Theme

  // Deployment
  deploymentConfig?: DeploymentConfig
  deploymentUrl?: string
  customDomain?: string

  // Metadata
  status: PortfolioStatus
  isPublic: boolean

  createdAt: string
  updatedAt: string
}

export type PortfolioStatus = 'draft' | 'processing' | 'ready' | 'published' | 'archived' | 'error'

export interface PortfolioVersion {
  id: string
  portfolioId: string
  versionNumber: number
  snapshot: Portfolio
  message?: string
  createdAt: string
}

// AI API types

export interface EnhanceProfileRequest {
  resumeData: ParsedResume
  options?: EnhanceOptions
}

export interface EnhanceOptions {
  models?: ('gpt4' | 'claude' | 'gemini')[]
  targetIndustry?: string
  targetRole?: string
  tone?: 'professional' | 'casual' | 'academic' | 'creative'
  includeValidation?: boolean
}

export interface EnhanceProfileResponse {
  enhancedProfile: EnhancedProfile
  validationReport?: ValidationReport
  metadata: {
    modelsUsed: string[]
    totalTokens: number
    processingTime: number
    cost: number
  }
}

export interface GenerateContentRequest {
  type: 'summary' | 'experience' | 'project' | 'skill'
  context: any
  model?: 'gpt4' | 'claude' | 'gemini'
}

export interface DesignAssistRequest {
  message: string
  currentDesign: Design
  profileContext: EnhancedProfile
}

export interface DesignAssistResponse {
  intent: Intent
  actions: DesignAction[]
  message: string
  preview?: PreviewData
}

export interface ValidateRequest {
  aiOutput: any
  sourceData: any
  validationType: 'factCheck' | 'hallucination' | 'consistency'
}

// Parsing API types

export interface ParseResumeRequest {
  file: File
}

export interface ParseResumeResponse {
  parsedResume: ParsedResume
  confidence: number
  warnings: string[]
}

export interface FetchLinkedInRequest {
  accessToken: string
}

export interface FetchGitHubRequest {
  username: string
  accessToken?: string
}

// Authentication types

export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface OAuthRequest {
  provider: 'linkedin' | 'github'
  code: string
  redirectUri: string
}

// Job processing types

export interface AIJob {
  id: string
  portfolioId: string
  jobType: 'parse' | 'enhance' | 'generate' | 'validate'
  inputData: any
  outputData?: any
  status: JobStatus
  errorMessage?: string
  modelUsed?: string
  tokensUsed?: number
  processingTimeMs?: number
  createdAt: string
  completedAt?: string
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface JobStatusResponse {
  job: AIJob
  progress?: number
}

// Template API types

export interface TemplateListResponse {
  templates: Template[]
  categories: TemplateCategory[]
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  templateCount: number
}

export interface TemplateMatchRequest {
  profile: EnhancedProfile
  preferences?: TemplatePreferences
}

export interface TemplatePreferences {
  category?: Template['category']
  style?: 'minimal' | 'bold' | 'classic' | 'modern'
  colorScheme?: 'light' | 'dark' | 'auto'
}

export interface TemplateMatchResponse {
  matches: TemplateMatch[]
}

export interface TemplateMatch {
  template: Template
  score: number
  reasons: string[]
}

// Rate limiting types

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: string
}

export interface RateLimitError extends APIError {
  retryAfter: number
  limit: RateLimitInfo
}

// Webhook types

export interface WebhookEvent {
  id: string
  type: WebhookEventType
  payload: any
  timestamp: string
  signature: string
}

export type WebhookEventType =
  | 'portfolio.created'
  | 'portfolio.updated'
  | 'portfolio.published'
  | 'deployment.started'
  | 'deployment.completed'
  | 'deployment.failed'

// Import shared types
import type {
  ParsedResume,
  EnhancedProfile,
  LinkedInProfile,
  GitHubProfile,
  ValidationReport
} from './profile'

import type {
  Template,
  Design,
  Customization,
  Theme,
  Intent,
  DesignAction,
  PreviewData
} from './template'

import type {
  VercelConfig,
  NetlifyConfig,
  GitHubConfig
} from './deployment'
