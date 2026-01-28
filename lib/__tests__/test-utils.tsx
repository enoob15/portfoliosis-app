import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ManualPortfolioProvider } from '@/contexts/ManualPortfolioContext'
import { ParsedResume } from '@/types/profile'

// Mock data for tests
export const mockPersonalInfo = {
  name: 'John Doe',
  title: 'Software Engineer',
  email: 'john@example.com',
  phone: '+1234567890',
  location: 'San Francisco, CA',
  website: 'https://johndoe.com',
  social: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
  },
}

export const mockExperience = [
  {
    id: '1',
    company: 'Tech Corp',
    position: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    startDate: '2020-01',
    endDate: '2023-12',
    current: false,
    description: 'Led development of core features',
    achievements: ['Increased performance by 40%', 'Mentored 5 junior developers'],
  },
  {
    id: '2',
    company: 'Startup Inc',
    position: 'Software Engineer',
    location: 'Remote',
    startDate: '2018-06',
    endDate: '2020-01',
    current: false,
    description: 'Built scalable web applications',
    achievements: ['Reduced load time by 50%'],
  },
]

export const mockEducation = [
  {
    id: '1',
    institution: 'University of California',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    location: 'Berkeley, CA',
    startDate: '2014-09',
    endDate: '2018-05',
    gpa: '3.8',
    achievements: ['Dean\'s List', 'CS Department Award'],
  },
]

export const mockSkills = [
  {
    category: 'Programming Languages',
    items: ['JavaScript', 'TypeScript', 'Python', 'Go'],
  },
  {
    category: 'Frameworks',
    items: ['React', 'Next.js', 'Node.js', 'Django'],
  },
  {
    category: 'Tools',
    items: ['Git', 'Docker', 'AWS', 'PostgreSQL'],
  },
]

export const mockProjects = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Full-stack e-commerce solution with payment integration',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    role: 'Lead Developer',
    startDate: '2022-01',
    endDate: '2022-06',
    url: 'https://github.com/johndoe/ecommerce',
    imageUrl: 'https://example.com/project1.jpg',
    achievements: ['Processed $1M in transactions', 'Served 10K users'],
  },
  {
    id: '2',
    name: 'Task Management App',
    description: 'Real-time collaborative task manager',
    technologies: ['Next.js', 'TypeScript', 'WebSocket'],
    role: 'Full Stack Developer',
    startDate: '2021-06',
    endDate: '2021-12',
    url: 'https://github.com/johndoe/tasks',
    achievements: ['1000+ daily active users'],
  },
]

export const mockPortfolioData: Partial<ParsedResume> = {
  personal: mockPersonalInfo,
  summary: 'Experienced software engineer with 5+ years building scalable web applications.',
  experience: mockExperience,
  education: mockEducation,
  skills: mockSkills,
  projects: mockProjects,
}

export const mockUser = {
  id: 'user-123',
  email: 'john@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Custom render with providers
interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return <ManualPortfolioProvider>{children}</ManualPortfolioProvider>
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock functions
export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  promise: jest.fn(),
}

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
    })),
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    update: jest.fn().mockResolvedValue({ data: {}, error: null }),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {}, error: null }),
  })),
}

// Mock AI service
export const mockAIService = {
  generateContent: jest.fn().mockResolvedValue({
    content: 'Generated content from AI',
    success: true,
  }),
}

// Helper to wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

// Helper to mock file upload
export const createMockFile = (
  name = 'test.jpg',
  size = 1024,
  type = 'image/jpeg'
): File => {
  const blob = new Blob(['test'], { type })
  return new File([blob], name, { type, lastModified: Date.now() })
}
