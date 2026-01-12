// Core data types for Portfoliosis

export interface ContactInfo {
  name: string
  title: string
  email: string
  phone?: string
  location?: string
  website?: string
  social?: SocialLinks
}

export interface SocialLinks {
  linkedin?: string
  github?: string
  twitter?: string
  medium?: string
  devto?: string
  portfolio?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  location?: string
  startDate: string
  endDate?: string // undefined = current
  description: string
  highlights: string[]
  technologies?: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa?: string
  honors?: string[]
  description?: string
}

export interface Skill {
  id: string
  name: string
  category: 'technical' | 'soft' | 'language' | 'tool' | 'framework'
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string
  github?: string
  image?: string
  highlights: string[]
  startDate?: string
  endDate?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  url?: string
}

export interface Language {
  name: string
  proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic'
}

export interface Award {
  id: string
  name: string
  issuer: string
  date: string
  description?: string
}

export interface ParsedResume {
  personal: ContactInfo
  summary?: string
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  projects?: Project[]
  certifications?: Certification[]
  languages?: Language[]
  awards?: Award[]
}

export interface LinkedInProfile {
  headline: string
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  endorsements: Endorsement[]
  recommendations: Recommendation[]
}

export interface Endorsement {
  skill: string
  count: number
}

export interface Recommendation {
  author: string
  position: string
  text: string
  date: string
}

export interface GitHubProfile {
  bio: string
  repositories: Repository[]
  contributions: number
  stars: number
  followers: number
  languages: LanguageStats[]
  pinnedRepos: Repository[]
}

export interface Repository {
  name: string
  description: string
  url: string
  language: string
  stars: number
  forks: number
  topics: string[]
  readme?: string
}

export interface LanguageStats {
  name: string
  percentage: number
}

export interface EnhancedProfile {
  original: ParsedResume
  enhanced: {
    summary: {
      original?: string
      claudeVersion?: string
      geminiVersion?: string
      gpt4Version?: string
      recommended: string
    }
    experience: EnhancedExperience[]
    skills: CategorizedSkills
    projects: EnhancedProject[]
    metadata: ProfileMetadata
  }
  confidence: ConfidenceScores
}

export interface EnhancedExperience extends Experience {
  aiEnhanced: {
    description: string
    highlights: string[]
    impactMetrics: string[]
  }
  confidence: number
}

export interface EnhancedProject extends Project {
  aiEnhanced: {
    description: string
    highlights: string[]
    technicalDepth: string
  }
  confidence: number
}

export interface CategorizedSkills {
  technical: Skill[]
  soft: Skill[]
  languages: Language[]
  tools: Skill[]
  frameworks: Skill[]
}

export interface ProfileMetadata {
  industry: string
  seniority: 'junior' | 'mid' | 'senior' | 'executive' | 'student'
  targetRole?: string
  yearsOfExperience: number
  specializations: string[]
}

export interface ConfidenceScores {
  overall: number
  summary: number
  experience: number
  skills: number
  projects: number
}

export interface AIResult {
  model: 'gpt4' | 'claude' | 'gemini'
  content: string
  confidence: number
  metadata: {
    tokensUsed: number
    processingTime: number
    timestamp: string
  }
}

export interface ValidationReport {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  hallucinationFlags: HallucinationFlag[]
}

export interface ValidationError {
  field: string
  message: string
  severity: 'critical' | 'error'
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

export interface HallucinationFlag {
  field: string
  originalValue: string
  aiGeneratedValue: string
  confidence: number
  reason: string
}
