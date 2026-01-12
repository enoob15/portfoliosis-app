// Deployment and infrastructure types

export interface StaticSite {
  files: SiteFile[]
  assets: OptimizedAsset[]
  metadata: DeploymentMetadata
  config: SiteConfig
}

export interface SiteFile {
  path: string
  content: string
  type: 'html' | 'css' | 'js' | 'json'
  size: number
}

export interface OptimizedAsset {
  original: string
  optimized: string
  type: 'image' | 'font' | 'icon'
  format: string
  size: number
  optimizedSize: number
  compressionRatio: number
}

export interface DeploymentMetadata {
  buildTime: number
  totalSize: number
  fileCount: number
  generatedAt: string
  version: string
}

export interface SiteConfig {
  title: string
  description: string
  domain?: string
  basePath: string
  seo: SEOConfig
  analytics?: AnalyticsConfig
  pwa?: PWAConfig
}

export interface SEOConfig {
  metaTags: MetaTags
  sitemap: boolean
  robotsTxt: boolean
  structuredData: boolean
  canonicalUrl?: string
}

export interface MetaTags {
  title: string
  description: string
  keywords: string[]
  author: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: 'summary' | 'summary_large_image'
  twitterCreator?: string
}

export interface AnalyticsConfig {
  provider: 'google' | 'plausible' | 'posthog' | 'none'
  trackingId: string
  anonymizeIp?: boolean
  cookieConsent?: boolean
}

export interface PWAConfig {
  enabled: boolean
  name: string
  shortName: string
  description: string
  backgroundColor: string
  themeColor: string
  icons: PWAIcon[]
}

export interface PWAIcon {
  src: string
  sizes: string
  type: string
  purpose?: 'maskable' | 'any'
}

export interface StructuredData {
  '@context': string
  '@type': string
  name: string
  url?: string
  image?: string
  sameAs?: string[]
  jobTitle?: string
  worksFor?: Organization
  alumniOf?: Organization[]
  award?: string[]
  knowsAbout?: string[]
}

export interface Organization {
  '@type': 'Organization'
  name: string
  url?: string
}

export interface MinifiedCode {
  html: string
  css: string
  js: string
  sourceMaps?: SourceMaps
}

export interface SourceMaps {
  css?: string
  js?: string
}

export interface CodeSplitResult {
  chunks: CodeChunk[]
  entryPoint: string
  totalSize: number
}

export interface CodeChunk {
  name: string
  content: string
  size: number
  dependencies: string[]
}

export interface OptimizedSite extends StaticSite {
  optimizations: OptimizationReport
}

export interface OptimizationReport {
  imagesOptimized: number
  codeMinified: boolean
  codeSplit: boolean
  compressionRatio: number
  lighthouseScore?: LighthouseScore
}

export interface LighthouseScore {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa?: number
}

// Deployment Platform Configurations

export interface VercelConfig {
  projectName: string
  framework: 'nextjs'
  buildCommand?: string
  outputDirectory?: string
  environmentVariables?: Record<string, string>
  customDomain?: string
}

export interface NetlifyConfig {
  siteName: string
  buildCommand?: string
  publishDirectory: string
  environmentVariables?: Record<string, string>
  redirects?: NetlifyRedirect[]
  headers?: NetlifyHeader[]
}

export interface NetlifyRedirect {
  from: string
  to: string
  status: number
  force?: boolean
}

export interface NetlifyHeader {
  for: string
  values: Record<string, string>
}

export interface GitHubConfig {
  repository: string
  branch: string
  customDomain?: string
  cname?: boolean
}

export interface Deployment {
  id: string
  platform: 'vercel' | 'netlify' | 'github-pages'
  url: string
  status: DeploymentStatus
  createdAt: string
  completedAt?: string
  error?: DeploymentError
  config: VercelConfig | NetlifyConfig | GitHubConfig
}

export type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'ready' | 'failed' | 'canceled'

export interface DeploymentError {
  code: string
  message: string
  details?: any
}

export interface DomainConfig {
  domain: string
  verified: boolean
  ssl: SSLCertificate
  dns: DNSRecord[]
}

export interface SSLCertificate {
  issuer: string
  validFrom: string
  validTo: string
  status: 'active' | 'pending' | 'expired'
}

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT'
  name: string
  value: string
  ttl: number
}

export interface Analytics {
  pageViews: number
  uniqueVisitors: number
  avgTimeOnSite: number
  bounceRate: number
  topPages: PageStats[]
  referrers: ReferrerStats[]
  devices: DeviceStats
  locations: LocationStats[]
}

export interface PageStats {
  path: string
  views: number
  uniqueViews: number
  avgTime: number
}

export interface ReferrerStats {
  source: string
  visits: number
  percentage: number
}

export interface DeviceStats {
  desktop: number
  mobile: number
  tablet: number
}

export interface LocationStats {
  country: string
  visits: number
  percentage: number
}

export interface DateRange {
  startDate: string
  endDate: string
}
