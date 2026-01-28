# Manual Portfolio Creation - Quick Start Guide

## 🚀 Getting Started

This guide provides a quick reference for implementing the manual portfolio creation feature.

---

## 📋 Pre-Implementation Checklist

- [ ] Review `docs/MANUAL_CREATION_PLAN.md`
- [ ] Review `.agent/workflows/manual-portfolio-creation.md`
- [ ] Install required dependencies
- [ ] Run database migrations
- [ ] Set up AI API keys (if not already configured)
- [ ] Review design mockups

---

## 📦 Install Dependencies

```bash
cd c:\GitHub\Projects\portfoliosis-app

# Install form handling and validation
npm install react-hook-form zod @hookform/resolvers

# Install image handling
npm install react-image-crop react-dropzone

# Install utilities
npm install date-fns react-hot-toast framer-motion
```

---

## 🗄️ Database Setup

### 1. Create Migration File

Create: `supabase/migrations/20260126_portfolio_images.sql`

```sql
-- Add image fields to portfolios table
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_portfolios_images 
ON portfolios(profile_image_url, background_image_url) 
WHERE profile_image_url IS NOT NULL OR background_image_url IS NOT NULL;

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

-- Storage policies
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

### 2. Run Migration

```bash
# If using Supabase CLI locally
npx supabase db push

# Or apply directly in Supabase Dashboard
# SQL Editor → New Query → Paste migration → Run
```

---

## 📁 File Structure to Create

```
components/portfolio/
├── ManualCreationWizard.tsx          # Main wizard container
├── steps/
│   ├── PersonalInfoStep.tsx          # Step 1: Personal info
│   ├── ExperienceStep.tsx            # Step 2: Work experience
│   ├── EducationStep.tsx             # Step 3: Education
│   ├── SkillsStep.tsx                # Step 4: Skills
│   ├── ProjectsStep.tsx              # Step 5: Projects
│   └── ReviewStep.tsx                # Step 6: Review & submit
└── shared/
    ├── ImageUploader.tsx             # Image upload component
    ├── AIAssistButton.tsx            # AI assist trigger
    ├── RichTextEditor.tsx            # Rich text input
    ├── FormField.tsx                 # Form field wrapper
    └── ProgressIndicator.tsx         # Progress bar

lib/
├── storage/
│   └── image-upload.ts               # Image upload utilities
├── ai/
│   └── prompts/
│       └── portfolio-prompts.ts      # Portfolio-specific prompts
└── validation/
    └── portfolio-schema.ts           # Zod validation schemas

hooks/
├── useManualPortfolio.ts             # Portfolio state management
├── useImageUpload.ts                 # Image upload hook
└── useAIAssist.ts                    # AI assistance hook

app/actions/
└── manual-portfolio.ts               # Server actions

contexts/
└── ManualPortfolioContext.tsx        # React context for state
```

---

## 🎨 Component Implementation Order

### Phase 1: Foundation (Day 1-2)

1. **Create Context & Hooks**
   ```typescript
   // contexts/ManualPortfolioContext.tsx
   // hooks/useManualPortfolio.ts
   ```

2. **Create Main Wizard**
   ```typescript
   // components/portfolio/ManualCreationWizard.tsx
   ```

3. **Create Progress Indicator**
   ```typescript
   // components/portfolio/shared/ProgressIndicator.tsx
   ```

4. **Create Form Field Wrapper**
   ```typescript
   // components/portfolio/shared/FormField.tsx
   ```

### Phase 2: Form Steps (Day 3-5)

5. **Personal Info Step**
   ```typescript
   // components/portfolio/steps/PersonalInfoStep.tsx
   ```

6. **Experience Step**
   ```typescript
   // components/portfolio/steps/ExperienceStep.tsx
   ```

7. **Education Step**
   ```typescript
   // components/portfolio/steps/EducationStep.tsx
   ```

8. **Skills Step**
   ```typescript
   // components/portfolio/steps/SkillsStep.tsx
   ```

9. **Projects Step**
   ```typescript
   // components/portfolio/steps/ProjectsStep.tsx
   ```

10. **Review Step**
    ```typescript
    // components/portfolio/steps/ReviewStep.tsx
    ```

### Phase 3: Image Upload (Day 6-7)

11. **Image Upload Utilities**
    ```typescript
    // lib/storage/image-upload.ts
    // hooks/useImageUpload.ts
    ```

12. **Image Uploader Component**
    ```typescript
    // components/portfolio/shared/ImageUploader.tsx
    ```

### Phase 4: AI Integration (Day 8-10)

13. **AI Prompts**
    ```typescript
    // lib/ai/prompts/portfolio-prompts.ts
    ```

14. **AI Assist Hook**
    ```typescript
    // hooks/useAIAssist.ts
    ```

15. **AI Assist Button Component**
    ```typescript
    // components/portfolio/shared/AIAssistButton.tsx
    ```

### Phase 5: Validation & Server Actions (Day 11-12)

16. **Validation Schemas**
    ```typescript
    // lib/validation/portfolio-schema.ts
    ```

17. **Server Actions**
    ```typescript
    // app/actions/manual-portfolio.ts
    ```

### Phase 6: Integration (Day 13-14)

18. **Update OnboardingWizard**
    ```typescript
    // components/dashboard/OnboardingWizard.tsx
    // Replace placeholder with ManualCreationWizard
    ```

---

## 🔑 Key Code Snippets

### Example: ManualPortfolio Context

```typescript
// contexts/ManualPortfolioContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ParsedResume } from '@/types/profile';

interface ManualPortfolioState {
  currentStep: number;
  data: Partial<ParsedResume>;
  isDirty: boolean;
  lastSaved: Date | null;
}

type Action =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FIELD'; payload: { field: string; value: any } }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET' };

const ManualPortfolioContext = createContext<{
  state: ManualPortfolioState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function ManualPortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <ManualPortfolioContext.Provider value={{ state, dispatch }}>
      {children}
    </ManualPortfolioContext.Provider>
  );
}

export function useManualPortfolioContext() {
  const context = useContext(ManualPortfolioContext);
  if (!context) throw new Error('useManualPortfolioContext must be used within ManualPortfolioProvider');
  return context;
}
```

### Example: Image Upload Hook

```typescript
// hooks/useImageUpload.ts
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const supabase = createClient();

  const uploadImage = async (file: File, folder: string) => {
    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);

      setProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, progress };
}
```

### Example: AI Assist Hook

```typescript
// hooks/useAIAssist.ts
import { useState } from 'react';
import { generatePortfolioContent } from '@/app/actions/manual-portfolio';

export function useAIAssist() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (type: string, input: any) => {
    setGenerating(true);
    setError(null);

    try {
      const result = await generatePortfolioContent(type, input);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  return { generate, generating, error };
}
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Form validation schemas
- [ ] Image upload utilities
- [ ] AI prompt generation
- [ ] State management reducer

### Integration Tests
- [ ] Complete wizard flow
- [ ] Image upload and crop
- [ ] AI content generation
- [ ] Auto-save functionality
- [ ] Draft recovery

### E2E Tests
- [ ] User can complete entire wizard
- [ ] Portfolio is created successfully
- [ ] Images are uploaded and displayed
- [ ] AI assistance works for all fields

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] ARIA labels present
- [ ] Focus management correct
- [ ] Color contrast sufficient

---

## 🐛 Common Issues & Solutions

### Issue: Image upload fails
**Solution:** Check Supabase storage bucket exists and policies are correct

### Issue: AI generation times out
**Solution:** Implement timeout handling and retry logic

### Issue: Form data lost on refresh
**Solution:** Ensure localStorage persistence is working

### Issue: Validation errors not showing
**Solution:** Check Zod schema and error display logic

---

## 📚 Additional Resources

- **Design Mockups:** See artifacts in this conversation
- **Full Implementation Plan:** `.agent/workflows/manual-portfolio-creation.md`
- **Planning Document:** `docs/MANUAL_CREATION_PLAN.md`
- **Existing Types:** `types/profile.ts`
- **AI Orchestrator:** `lib/ai/orchestrator.ts`
- **Supabase Docs:** https://supabase.com/docs

---

## 🎯 Success Criteria

Before marking this feature as complete, ensure:

- [ ] All 6 steps are functional
- [ ] Image upload works with crop/resize
- [ ] AI assistance works for all content types
- [ ] Auto-save prevents data loss
- [ ] Validation prevents invalid submissions
- [ ] Mobile experience is smooth
- [ ] Accessibility score 95+ on Lighthouse
- [ ] No console errors or warnings
- [ ] Documentation is complete
- [ ] Tests are passing

---

**Ready to start? Begin with Phase 1: Foundation!**
