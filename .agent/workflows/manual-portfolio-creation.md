---
description: Manual Portfolio Creation Implementation Plan
---

# Manual Portfolio Creation Feature - Implementation Plan

## Overview
This plan outlines the implementation of a comprehensive manual portfolio creation interface that allows users to build their portfolio from scratch with:
- Multi-step form wizard
- Image upload capability (profile photo, project images)
- AI-assisted content generation and enhancement
- Real-time validation and preview
- Auto-save functionality

---

## Phase 1: Component Architecture

### 1.1 Create Base Components

**Files to Create:**
- `components/portfolio/ManualCreationWizard.tsx` - Main wizard container
- `components/portfolio/steps/PersonalInfoStep.tsx` - Step 1: Personal information
- `components/portfolio/steps/ExperienceStep.tsx` - Step 2: Work experience
- `components/portfolio/steps/EducationStep.tsx` - Step 3: Education
- `components/portfolio/steps/SkillsStep.tsx` - Step 4: Skills
- `components/portfolio/steps/ProjectsStep.tsx` - Step 5: Projects
- `components/portfolio/steps/ReviewStep.tsx` - Step 6: Review & Submit

**Shared Components:**
- `components/portfolio/shared/ImageUploader.tsx` - Reusable image upload component
- `components/portfolio/shared/AIAssistButton.tsx` - AI enhancement trigger
- `components/portfolio/shared/RichTextEditor.tsx` - Rich text input with AI suggestions
- `components/portfolio/shared/FormField.tsx` - Consistent form field wrapper
- `components/portfolio/shared/ProgressIndicator.tsx` - Multi-step progress bar

### 1.2 Create Supporting Utilities

**Files to Create:**
- `lib/storage/image-upload.ts` - Image upload to Supabase Storage
- `lib/ai/content-generator.ts` - AI content generation for portfolio fields
- `lib/ai/prompts/portfolio-prompts.ts` - Specific prompts for portfolio content
- `lib/validation/portfolio-schema.ts` - Zod schemas for form validation
- `hooks/useManualPortfolio.ts` - Custom hook for portfolio state management
- `hooks/useImageUpload.ts` - Custom hook for image upload logic
- `hooks/useAIAssist.ts` - Custom hook for AI assistance

---

## Phase 2: Database & Storage Setup

### 2.1 Storage Bucket Configuration

**Migration File:** `supabase/migrations/20260126_portfolio_images.sql`

```sql
-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio images
CREATE POLICY "Users can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Portfolio images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');
```

### 2.2 Add Image Metadata to Portfolios

**Migration File:** `supabase/migrations/20260126_portfolio_image_fields.sql`

```sql
-- Add image fields to portfolios table
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- Create index for image URLs
CREATE INDEX IF NOT EXISTS idx_portfolios_images 
ON portfolios(profile_image_url, background_image_url) 
WHERE profile_image_url IS NOT NULL OR background_image_url IS NOT NULL;
```

---

## Phase 3: Core Features Implementation

### 3.1 Multi-Step Wizard Flow

**Step 1: Personal Information**
- Full name (required)
- Professional title (required)
- Profile photo upload
- Email, phone, location
- Social links (LinkedIn, GitHub, Twitter, etc.)
- Professional summary (with AI assist)

**Step 2: Work Experience**
- Company name
- Position/title
- Date range (start/end, current position checkbox)
- Location
- Description (with AI assist)
- Key achievements/highlights (bullet points with AI assist)
- Technologies used (tag input)
- Add multiple experiences

**Step 3: Education**
- Institution name
- Degree type
- Field of study
- Date range
- GPA (optional)
- Honors/awards (optional)
- Description (optional, with AI assist)
- Add multiple education entries

**Step 4: Skills**
- Skill name
- Category (technical/soft/language/tool/framework)
- Proficiency level
- Grouped display by category
- AI suggestions based on experience

**Step 5: Projects**
- Project name
- Description (with AI assist)
- Technologies used
- Project image upload
- GitHub URL (optional)
- Live demo URL (optional)
- Key highlights (with AI assist)
- Date range (optional)
- Add multiple projects

**Step 6: Review & Submit**
- Preview all entered data
- Edit any section
- Template selection
- Final submission

### 3.2 Image Upload Features

**Capabilities:**
- Drag-and-drop interface
- Click to browse
- Image preview before upload
- Crop/resize functionality (using react-image-crop)
- Format validation (JPEG, PNG, WebP, GIF)
- Size validation (max 5MB)
- Automatic optimization (compression)
- Progress indicator
- Error handling with user-friendly messages

**Image Types:**
- Profile photo (circular crop, 400x400px recommended)
- Project images (16:9 aspect ratio, 1200x675px recommended)
- Background/header image (optional, 1920x400px recommended)

### 3.3 AI-Assisted Content Generation

**AI Features:**

1. **Professional Summary Generator**
   - Input: Name, title, years of experience, key skills
   - Output: 3 variations (concise, detailed, creative)
   - User can select or edit

2. **Experience Description Enhancer**
   - Input: Basic job description
   - Output: Enhanced description with action verbs and impact
   - Highlight generator for achievements

3. **Project Description Generator**
   - Input: Project name, technologies, basic description
   - Output: Compelling project description
   - Highlight key technical challenges and solutions

4. **Skills Suggester**
   - Input: Job titles and experience descriptions
   - Output: Suggested skills to add
   - Categorization assistance

5. **Content Rewriter**
   - Any text field can be rewritten with different tones:
     - Professional
     - Conversational
     - Technical
     - Creative

**UI/UX for AI Features:**
- Sparkle icon (✨) button next to eligible fields
- Modal/popover with AI options
- Loading state during generation
- Side-by-side comparison (original vs AI-generated)
- Easy accept/reject/edit workflow
- Token usage indicator (if applicable)

---

## Phase 4: State Management & Auto-Save

### 4.1 Local State Management

**Using React Context + useReducer:**
- `contexts/ManualPortfolioContext.tsx`
- Actions: UPDATE_FIELD, ADD_ITEM, REMOVE_ITEM, SET_STEP, etc.
- Persist to localStorage for draft recovery

### 4.2 Auto-Save Functionality

**Features:**
- Save draft to database every 30 seconds
- Save on step navigation
- Visual indicator of save status
- Conflict resolution if multiple tabs open
- "Resume draft" option on return

**Database Field:**
- Use `portfolios.manual_data` JSONB field
- Store complete form state
- Track completion percentage

---

## Phase 5: Validation & Error Handling

### 5.1 Form Validation

**Using Zod schemas:**
- Real-time validation on blur
- Step-level validation before proceeding
- Required field indicators
- Format validation (email, URL, dates)
- Custom error messages

### 5.2 Error States

- Field-level errors (inline)
- Step-level errors (summary at top)
- Network error handling
- Image upload errors
- AI generation errors
- Graceful degradation

---

## Phase 6: Integration & Testing

### 6.1 Integration Points

1. **Update OnboardingWizard.tsx**
   - Replace placeholder with ManualCreationWizard
   - Pass necessary props

2. **Create Server Actions**
   - `app/actions/manual-portfolio.ts`
   - saveManualPortfolioDraft()
   - submitManualPortfolio()
   - generateAIContent()

3. **Update Dashboard**
   - Show draft portfolios
   - "Continue editing" option
   - Delete draft option

### 6.2 Testing Checklist

- [ ] All form fields validate correctly
- [ ] Image upload works for all supported formats
- [ ] Image size limits are enforced
- [ ] AI generation works for all field types
- [ ] Auto-save persists data correctly
- [ ] Draft recovery works after browser close
- [ ] Multi-step navigation preserves data
- [ ] Final submission creates portfolio correctly
- [ ] Mobile responsive design
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Phase 7: UI/UX Polish

### 7.1 Design Elements

- Smooth step transitions
- Loading skeletons
- Success animations
- Helpful tooltips
- Example text for guidance
- Character counters for text fields
- Progress percentage indicator
- Estimated time to complete

### 7.2 Accessibility

- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader announcements
- Color contrast compliance
- Error announcements

---

## Implementation Order

1. **Week 1: Foundation**
   - Create component structure
   - Set up database migrations
   - Implement basic wizard navigation
   - Create form field components

2. **Week 2: Core Features**
   - Implement all form steps
   - Add validation
   - Create image upload functionality
   - Implement auto-save

3. **Week 3: AI Integration**
   - Create AI prompts
   - Implement AI assist buttons
   - Add content generation UI
   - Test AI features

4. **Week 4: Polish & Testing**
   - UI/UX refinements
   - Mobile optimization
   - Comprehensive testing
   - Bug fixes
   - Documentation

---

## Dependencies to Install

```bash
npm install react-hook-form zod @hookform/resolvers
npm install react-image-crop
npm install react-dropzone
npm install date-fns
npm install react-hot-toast
npm install framer-motion
```

---

## Success Criteria

- [ ] Users can create a complete portfolio without uploading a resume
- [ ] Image upload works seamlessly with preview and crop
- [ ] AI assistance improves content quality measurably
- [ ] Auto-save prevents data loss
- [ ] Form validation prevents invalid submissions
- [ ] Mobile experience is smooth and intuitive
- [ ] Accessibility score of 95+ on Lighthouse
- [ ] Average completion time under 15 minutes
- [ ] User satisfaction rating of 4.5/5 or higher

---

## Future Enhancements

- Import from LinkedIn API (when available)
- Import from GitHub API
- Bulk import from CSV
- Template-based quick start
- AI-powered portfolio review/suggestions
- Collaboration features (get feedback)
- Version history and rollback
- Portfolio analytics dashboard
