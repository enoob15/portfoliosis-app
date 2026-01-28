# Manual Portfolio Creation - Feature Plan

**Created:** January 25, 2026  
**Status:** Planning Phase  
**Priority:** High  
**Estimated Timeline:** 4 weeks

---

## Executive Summary

This document outlines the plan to implement a comprehensive manual portfolio creation feature for Portfoliosis. This feature will allow users to build their portfolio from scratch without needing to upload a resume, providing a guided, AI-assisted form experience with image upload capabilities.

---

## Problem Statement

Currently, the "Start from Scratch" option in the onboarding flow shows only a placeholder message. Users who don't have a resume ready or prefer to manually enter their information have no way to create a portfolio. This limits our user base and reduces conversion rates.

---

## Solution Overview

We will implement a **6-step wizard interface** that guides users through creating a complete portfolio with:

1. **Personal Information** - Basic details, profile photo, professional summary
2. **Work Experience** - Job history with AI-enhanced descriptions
3. **Education** - Academic background
4. **Skills** - Technical and soft skills with categorization
5. **Projects** - Portfolio projects with images and descriptions
6. **Review & Submit** - Final review and template selection

### Key Features

✨ **AI-Assisted Content Generation**
- Generate professional summaries from basic info
- Enhance job descriptions with action verbs and impact
- Rewrite content in different tones (professional, conversational, creative)
- Suggest skills based on experience
- Generate compelling project descriptions

📸 **Image Upload & Management**
- Profile photo upload with crop and resize
- Project image uploads (multiple per project)
- Drag-and-drop interface
- Image optimization and compression
- Preview before upload
- Format and size validation

💾 **Auto-Save & Draft Management**
- Automatic draft saving every 30 seconds
- Save on step navigation
- Resume incomplete portfolios
- Conflict resolution for multiple tabs

✅ **Validation & Error Handling**
- Real-time field validation
- Step-level validation before proceeding
- User-friendly error messages
- Required field indicators

📱 **Responsive Design**
- Mobile-optimized interface
- Touch-friendly controls
- Adaptive layouts

---

## Technical Architecture

### Frontend Components

```
components/portfolio/
├── ManualCreationWizard.tsx          # Main wizard container
├── steps/
│   ├── PersonalInfoStep.tsx          # Step 1
│   ├── ExperienceStep.tsx            # Step 2
│   ├── EducationStep.tsx             # Step 3
│   ├── SkillsStep.tsx                # Step 4
│   ├── ProjectsStep.tsx              # Step 5
│   └── ReviewStep.tsx                # Step 6
└── shared/
    ├── ImageUploader.tsx             # Reusable image upload
    ├── AIAssistButton.tsx            # AI enhancement trigger
    ├── RichTextEditor.tsx            # Rich text input
    ├── FormField.tsx                 # Form field wrapper
    └── ProgressIndicator.tsx         # Progress bar
```

### Backend & Storage

- **Database:** Supabase PostgreSQL
  - Use existing `portfolios.manual_data` JSONB field
  - Add `profile_image_url` and `background_image_url` columns
  
- **Storage:** Supabase Storage
  - New bucket: `portfolio-images`
  - 5MB file size limit
  - Supported formats: JPEG, PNG, WebP, GIF
  - User-specific folders for organization

- **AI Integration:** 
  - Leverage existing AI orchestrator (`lib/ai/orchestrator.ts`)
  - New prompts for portfolio content generation
  - Support for GPT-4, Claude, and Gemini

### State Management

- React Context + useReducer for wizard state
- localStorage for draft persistence
- Custom hooks:
  - `useManualPortfolio` - Portfolio state management
  - `useImageUpload` - Image upload logic
  - `useAIAssist` - AI assistance

---

## User Flow

```
1. User clicks "Start from Scratch" on onboarding
   ↓
2. ManualCreationWizard loads with Step 1 (Personal Info)
   ↓
3. User fills in basic information
   ↓
4. User clicks "AI Assist" for professional summary
   ↓
5. AI generates 3 variations, user selects one
   ↓
6. User uploads profile photo
   ↓
7. User clicks "Continue" → Step 2 (Experience)
   ↓
8. User adds work experiences (can add multiple)
   ↓
9. For each experience, user can use AI to enhance descriptions
   ↓
10. Continue through remaining steps (Education, Skills, Projects)
    ↓
11. Step 6: Review all information
    ↓
12. Select template
    ↓
13. Submit → Portfolio created!
```

---

## Database Schema Changes

### New Migration: `20260126_portfolio_images.sql`

```sql
-- Add image fields to portfolios table
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies (user-specific access)
-- [See full migration in implementation plan]
```

---

## AI Prompts Strategy

### 1. Professional Summary Generator

**Input:**
- Name
- Professional title
- Years of experience
- Key skills (3-5)
- Industry/domain

**Output:** 3 variations
- Professional (formal, corporate)
- Conversational (friendly, approachable)
- Creative (unique, memorable)

**Example Prompt:**
```
Generate a professional summary for a portfolio. 

Name: Sarah Johnson
Title: Senior Product Designer
Experience: 8 years
Skills: UX Design, Product Strategy, User Research, Design Systems, Prototyping
Industry: SaaS/Technology

Create 3 variations:
1. Professional tone (formal, corporate)
2. Conversational tone (friendly, approachable)
3. Creative tone (unique, memorable)

Each should be 2-3 sentences, highlight key strengths, and be compelling.
```

### 2. Experience Description Enhancer

**Input:**
- Company name
- Position
- Basic description (user's draft)
- Technologies used

**Output:**
- Enhanced description with action verbs
- 3-5 key achievements/highlights
- Quantified impact where possible

### 3. Project Description Generator

**Input:**
- Project name
- Technologies
- Basic description
- Project type (personal, professional, open-source)

**Output:**
- Compelling project description
- Technical highlights
- Impact/results

---

## Dependencies

### New NPM Packages

```bash
npm install react-hook-form zod @hookform/resolvers
npm install react-image-crop
npm install react-dropzone
npm install date-fns
npm install react-hot-toast
npm install framer-motion
```

### Existing Dependencies (Already Installed)
- Next.js 15
- React 19
- Supabase Client
- TailwindCSS
- shadcn/ui components

---

## Implementation Timeline

### Week 1: Foundation (Jan 26 - Feb 1)
- [ ] Create component structure
- [ ] Set up database migrations
- [ ] Implement basic wizard navigation
- [ ] Create form field components
- [ ] Set up state management

### Week 2: Core Features (Feb 2 - Feb 8)
- [ ] Implement all 6 form steps
- [ ] Add form validation (Zod schemas)
- [ ] Create image upload functionality
- [ ] Implement auto-save
- [ ] Create server actions

### Week 3: AI Integration (Feb 9 - Feb 15)
- [ ] Create AI prompts for all content types
- [ ] Implement AI assist buttons
- [ ] Add content generation UI/modals
- [ ] Test AI features with all providers
- [ ] Add error handling for AI failures

### Week 4: Polish & Testing (Feb 16 - Feb 22)
- [ ] UI/UX refinements
- [ ] Mobile optimization
- [ ] Accessibility improvements
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deploy to production

---

## Success Metrics

### Quantitative
- **Completion Rate:** >60% of users who start complete the wizard
- **Average Time:** <15 minutes to complete
- **AI Usage:** >70% of users use at least one AI feature
- **Image Upload:** >80% of users upload a profile photo
- **Draft Recovery:** <5% data loss from browser crashes

### Qualitative
- User satisfaction rating: 4.5/5 or higher
- Accessibility score: 95+ on Lighthouse
- Mobile experience rating: 4/5 or higher
- Positive feedback on AI assistance quality

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI API rate limits | High | Medium | Implement queuing, caching, fallbacks |
| Image upload failures | Medium | Low | Robust error handling, retry logic |
| Browser compatibility | Medium | Low | Progressive enhancement, polyfills |
| Performance issues | Medium | Medium | Code splitting, lazy loading, optimization |
| Data loss (crashes) | High | Low | Auto-save, localStorage backup |

---

## Future Enhancements

- **LinkedIn Import:** Direct import from LinkedIn API
- **GitHub Integration:** Auto-populate projects from GitHub repos
- **Bulk Import:** CSV import for experience/education
- **Template Preview:** Live template switching in review step
- **Collaboration:** Share draft for feedback
- **Version History:** Track changes and rollback
- **Analytics:** Track which fields users struggle with
- **A/B Testing:** Test different AI prompt variations

---

## Resources

- **Design Mockups:** See generated images in artifacts
- **Detailed Implementation Plan:** `.agent/workflows/manual-portfolio-creation.md`
- **Existing Codebase:**
  - AI Orchestrator: `lib/ai/orchestrator.ts`
  - Resume Parser: `lib/parsers/`
  - Profile Types: `types/profile.ts`
  - Database Schema: `supabase/migrations/`

---

## Next Steps

1. **Review & Approve** this plan with stakeholders
2. **Install dependencies** listed above
3. **Create database migrations** for image storage
4. **Begin Week 1 implementation** - component structure
5. **Set up development environment** for testing

---

## Questions to Resolve

- [ ] Which AI provider should be the default for content generation?
- [ ] Should we limit the number of AI generations per user?
- [ ] What's the maximum number of projects/experiences allowed?
- [ ] Should we allow video uploads for projects?
- [ ] Do we need a "Skip" option for any steps?

---

**Document Owner:** Devon Cross (CTO)  
**Last Updated:** January 25, 2026  
**Status:** Awaiting Approval
