import { z } from 'zod';

// Personal Information Schema
export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  title: z.string().min(2, 'Title is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  social: z.object({
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    medium: z.string().url('Invalid Medium URL').optional().or(z.literal('')),
    devto: z.string().url('Invalid Dev.to URL').optional().or(z.literal('')),
    portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal(''))
  }).optional()
});

// Experience Schema
export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(2, 'Company name is required'),
  position: z.string().min(2, 'Position is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  highlights: z.array(z.string()).min(1, 'At least one highlight is required'),
  technologies: z.array(z.string()).optional()
});

export const experienceListSchema = z.array(experienceSchema).min(1, 'At least one experience is required');

// Education Schema
export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(2, 'Institution name is required'),
  degree: z.string().min(2, 'Degree is required'),
  field: z.string().min(2, 'Field of study is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  gpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
  description: z.string().optional()
});

export const educationListSchema = z.array(educationSchema).min(1, 'At least one education entry is required');

// Skills Schema
export const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Skill name is required'),
  category: z.enum(['technical', 'soft', 'language', 'tool', 'framework']),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional()
});

export const skillsListSchema = z.array(skillSchema).min(3, 'At least 3 skills are required');

// Projects Schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Project name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  image: z.string().optional(),
  highlights: z.array(z.string()).min(1, 'At least one highlight is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const projectsListSchema = z.array(projectSchema);

// Complete Resume Schema
export const completeResumeSchema = z.object({
  personal: personalInfoSchema,
  summary: z.string().min(50, 'Summary must be at least 50 characters').optional(),
  experience: experienceListSchema,
  education: educationListSchema,
  skills: skillsListSchema,
  projects: projectsListSchema.optional(),
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string(),
    expiryDate: z.string().optional(),
    credentialId: z.string().optional(),
    url: z.string().url().optional().or(z.literal(''))
  })).optional(),
  languages: z.array(z.object({
    name: z.string(),
    proficiency: z.enum(['native', 'fluent', 'professional', 'conversational', 'basic'])
  })).optional(),
  awards: z.array(z.object({
    id: z.string(),
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    description: z.string().optional()
  })).optional()
});

// Type exports
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type ExperienceFormData = z.infer<typeof experienceSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type SkillFormData = z.infer<typeof skillSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type CompleteResumeFormData = z.infer<typeof completeResumeSchema>;

// Helper function to validate step data
export function validateStep(step: string, data: any) {
  try {
    switch (step) {
      case 'personal':
        return personalInfoSchema.parse(data);
      case 'experience':
        return experienceListSchema.parse(data);
      case 'education':
        return educationListSchema.parse(data);
      case 'skills':
        return skillsListSchema.parse(data);
      case 'projects':
        return projectsListSchema.parse(data);
      case 'review':
        return completeResumeSchema.parse(data);
      default:
        throw new Error('Invalid step');
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues };
    }
    throw error;
  }
}
