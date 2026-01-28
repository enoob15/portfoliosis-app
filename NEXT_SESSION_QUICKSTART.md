# Next Session Quick Start Guide
**Manual Portfolio Creation Feature - Session 2**

**Last Updated:** January 26, 2026
**Current Progress:** 65% Complete
**Priority:** High - Step components needed

---

## ⚡ Quick Start (5 Minutes)

### 1. Fix the Wizard Bug (30 seconds)
```bash
cd c:\GitHub\Projects\portfoliosis-app
del components\portfolio\ManualCreationWizard.tsx
ren components\portfolio\ManualCreationWizard.fixed.tsx ManualCreationWizard.tsx
```

### 2. Run Database Migration (2 minutes)
```bash
# Option 1: Automated
node scripts/setup-supabase.js

# Option 2: Manual via Supabase Dashboard
# Copy contents of supabase/migrations/20260126_portfolio_images.sql
# Paste into Supabase SQL Editor and run
```

### 3. Verify Environment (1 minute)
```bash
# Check .env.local has:
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

### 4. Test Infrastructure (1 minute)
```bash
npm run dev
# Navigate to: http://localhost:3000/dashboard/test-image-upload
# Test image upload to verify Supabase storage works
```

---

## 🎯 Session 2 Goals

### Primary Objective
**Create all 6 step components to complete the wizard**

### Implementation Order (Suggested)

#### Step 1: PersonalInfoStep (Easiest, 1-2 hours)
```typescript
// components/portfolio/steps/PersonalInfoStep.tsx
// Features needed:
// - Basic form fields (name, title, email, phone, location)
// - Profile photo upload (use ImageUploader component)
// - Professional summary with AI assist
// - Social links (LinkedIn, GitHub, Twitter)
```

**Reference Files:**
- `docs/AI_INTEGRATION_EXAMPLE.tsx` - Summary generator example
- `docs/IMAGE_UPLOAD_INTEGRATION_EXAMPLES.md` - Profile photo example
- `lib/validation/portfolio-schema.ts` - personalInfoSchema

#### Step 2: ExperienceStep (Medium, 2-3 hours)
```typescript
// components/portfolio/steps/ExperienceStep.tsx
// Features needed:
// - Add/remove multiple experiences
// - Company, position, dates, description
// - AI-enhanced descriptions
// - Highlights/achievements list
```

**Reference Files:**
- `docs/AI_INTEGRATION_EXAMPLE.tsx` - Experience enhancer example
- `lib/validation/portfolio-schema.ts` - experienceSchema

#### Step 3: EducationStep (Easiest, 1 hour)
```typescript
// components/portfolio/steps/EducationStep.tsx
// Features needed:
// - Add/remove multiple education entries
// - Institution, degree, field, dates
// - GPA, honors (optional)
```

**Reference Files:**
- `lib/validation/portfolio-schema.ts` - educationSchema

#### Step 4: SkillsStep (Medium, 1-2 hours)
```typescript
// components/portfolio/steps/SkillsStep.tsx
// Features needed:
// - Add/remove skills
// - Category selection (technical, soft, language, tool, framework)
// - Proficiency levels
// - AI skills suggester
```

**Reference Files:**
- `docs/AI_INTEGRATION_EXAMPLE.tsx` - Skills suggester example
- `lib/validation/portfolio-schema.ts` - skillSchema

#### Step 5: ProjectsStep (Complex, 3-4 hours)
```typescript
// components/portfolio/steps/ProjectsStep.tsx
// Features needed:
// - Add/remove multiple projects
// - Name, description, technologies
// - Project images (use ImageUploader)
// - AI-generated descriptions
// - Highlights/achievements
// - Optional: URL, GitHub link
```

**Reference Files:**
- `docs/AI_INTEGRATION_EXAMPLE.tsx` - Project description generator
- `docs/IMAGE_UPLOAD_INTEGRATION_EXAMPLES.md` - Project images example
- `lib/validation/portfolio-schema.ts` - projectSchema

#### Step 6: ReviewStep (Medium, 2-3 hours)
```typescript
// components/portfolio/steps/ReviewStep.tsx
// Features needed:
// - Display all entered data
// - Template selection
// - Edit buttons (go back to specific steps)
// - Submit button
// - Preview modal (optional)
```

**Reference Files:**
- `hooks/useManualPortfolio.ts` - Access to all data
- `app/actions/manual-portfolio.ts` - submitManualPortfolio action

---

## 🔧 Supporting Component

### AIAssistButton Component (1-2 hours)
```typescript
// components/portfolio/shared/AIAssistButton.tsx
// Features needed:
// - Sparkle icon button
// - Loading state
// - Modal with variations
// - Accept/reject workflow
// - Props: type, input, onSelect
```

**Reference Files:**
- `docs/AI_INTEGRATION_EXAMPLE.tsx` - See inline AI assist example
- `hooks/useAIAssist.ts` - Hook to use

---

## 📁 File Structure Created (What Exists)

```
components/portfolio/
├── ManualCreationWizard.tsx          ✅ (needs bug fix)
├── steps/
│   ├── PersonalInfoStep.tsx          🔴 TODO
│   ├── ExperienceStep.tsx            🔴 TODO
│   ├── EducationStep.tsx             🔴 TODO
│   ├── SkillsStep.tsx                🔴 TODO
│   ├── ProjectsStep.tsx              🔴 TODO
│   └── ReviewStep.tsx                🔴 TODO
└── shared/
    ├── ImageUploader.tsx             ✅
    ├── AIAssistButton.tsx            🔴 TODO
    ├── ProgressIndicator.tsx         ✅
    └── FormField.tsx                 ✅

lib/
├── storage/
│   └── image-upload.ts               ✅
├── ai/
│   └── prompts/
│       └── portfolio-prompts.ts      ✅
└── validation/
    └── portfolio-schema.ts           ✅

hooks/
├── useManualPortfolio.ts             ✅
├── useImageUpload.ts                 ✅
└── useAIAssist.ts                    ✅

app/actions/
└── manual-portfolio.ts               ✅

contexts/
└── ManualPortfolioContext.tsx        ✅
```

---

## 📖 Documentation Index

### Implementation Guides
- `HANDOFF_MANUAL_CREATION.md` - Main handoff document (updated)
- `WIZARD_IMPLEMENTATION_SUMMARY.md` - Wizard implementation details
- `IMAGE_UPLOAD_SUMMARY.md` - Upload system summary

### Technical Documentation
- `docs/MANUAL_CREATION_STATE_MANAGEMENT.md` - State management guide
- `docs/AI_INFRASTRUCTURE_USAGE.md` - AI integration guide
- `docs/IMAGE_UPLOAD_INFRASTRUCTURE.md` - Upload system docs

### Code Examples
- `docs/AI_INTEGRATION_EXAMPLE.tsx` - 5 complete component examples
- `docs/IMAGE_UPLOAD_INTEGRATION_EXAMPLES.md` - Real-world integration examples
- `docs/IMAGE_UPLOAD_QUICK_REFERENCE.md` - Copy-paste snippets

### Checklists
- `IMAGE_UPLOAD_CHECKLIST.md` - Testing & deployment checklist

---

## 💡 Implementation Tips

### Pattern to Follow for Step Components

```typescript
'use client';

import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { [schemaName] } from '@/lib/validation/portfolio-schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../shared/FormField';
import { Button } from '@/components/ui/button';

export function [StepName]Step() {
  const {
    data,
    updateData,
    nextStep,
    previousStep,
    canGoBack,
    isSaving,
    lastSaved
  } = useManualPortfolio();

  const form = useForm({
    resolver: zodResolver([schemaName]),
    defaultValues: data.[section] || {}
  });

  const onSubmit = (formData: any) => {
    updateData({ [section]: formData });
    nextStep();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Save indicator */}
      <div className="text-sm text-muted-foreground">
        {isSaving ? 'Saving...' : lastSaved ? `Saved ${formatTime(lastSaved)}` : ''}
      </div>

      {/* Form fields */}
      <FormField
        label="Field Name"
        error={form.formState.errors.fieldName?.message}
        required
      >
        <input {...form.register('fieldName')} />
      </FormField>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        {canGoBack && (
          <Button type="button" variant="outline" onClick={previousStep}>
            Back
          </Button>
        )}
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
```

### Using AI Assistance

```typescript
import { useAIAssist } from '@/hooks/useAIAssist';

const { generate, generating, result } = useAIAssist();

const handleAIGenerate = async () => {
  const content = await generate('summary', {
    name: data.personal.name,
    title: data.personal.title,
    skills: data.skills.map(s => s.name)
  });

  // content has: { professional, conversational, creative }
  form.setValue('summary', content.professional);
};
```

### Using Image Upload

```typescript
import { ImageUploader } from '../shared/ImageUploader';

<ImageUploader
  userId={user.id}
  category="profile"
  aspectRatio={1}
  onUpload={(url) => form.setValue('profileImage', url)}
  currentImage={form.watch('profileImage')}
/>
```

---

## 🧪 Testing Strategy

### As You Build Each Step:

1. **Unit Test the Component**
   ```bash
   npm test -- PersonalInfoStep.test.tsx
   ```

2. **Test in Browser**
   - Navigate through wizard
   - Fill out the step
   - Click "Continue" - verify data persists
   - Go back - verify data still there
   - Wait 30 seconds - verify auto-save works

3. **Test Validation**
   - Leave required fields empty
   - Enter invalid data (bad email, etc.)
   - Verify error messages appear

4. **Test AI Features (if applicable)**
   - Click AI assist button
   - Verify loading state
   - Verify generated content appears
   - Verify you can accept/reject

5. **Test Image Upload (if applicable)**
   - Drag and drop image
   - Test crop interface
   - Verify preview appears
   - Verify image can be removed

---

## ⚠️ Known Issues & Gotchas

1. **Wizard Import Bug** - Must use `.fixed.tsx` version (or fix the import order)
2. **Database Not Migrated** - Must run migration before image uploads work
3. **AI API Keys** - Must be set in `.env.local` for AI features to work
4. **Auto-save Timing** - 30-second delay, test by waiting
5. **localStorage Limits** - May hit quota with large images (monitor console)

---

## 🎯 Success Criteria for Session 2

### Minimum (MVP)
- [ ] All 6 step components created and functional
- [ ] Basic validation working on each step
- [ ] Can navigate through entire wizard
- [ ] Can submit complete portfolio
- [ ] Data persists between steps

### Ideal (Full Featured)
- [ ] AIAssistButton component created
- [ ] AI features working in relevant steps
- [ ] Image upload working in relevant steps
- [ ] Auto-save visual feedback
- [ ] Error handling for all edge cases
- [ ] Loading states for async operations

### Stretch (Polish)
- [ ] Animations between steps
- [ ] Tooltips and help text
- [ ] Mobile responsive
- [ ] Accessibility tested
- [ ] Unit tests for each step

---

## 📞 Need Help?

### Reference Documents
1. **Main Handoff:** `HANDOFF_MANUAL_CREATION.md`
2. **State Management:** `docs/MANUAL_CREATION_STATE_MANAGEMENT.md`
3. **AI Guide:** `docs/AI_INFRASTRUCTURE_USAGE.md`
4. **Image Guide:** `docs/IMAGE_UPLOAD_INFRASTRUCTURE.md`

### Code Examples
- Check `docs/AI_INTEGRATION_EXAMPLE.tsx` for complete examples
- Check `docs/IMAGE_UPLOAD_INTEGRATION_EXAMPLES.md` for upload patterns

### Test Resources
- Image upload test page: `/dashboard/test-image-upload`
- Validation schemas: `lib/validation/portfolio-schema.ts`

---

## ⏱️ Estimated Time to Complete

| Task | Time | Priority |
|------|------|----------|
| Fix wizard bug | 5 min | Critical |
| Run migration | 5 min | Critical |
| PersonalInfoStep | 1-2 hours | High |
| EducationStep | 1 hour | High |
| SkillsStep | 1-2 hours | High |
| ExperienceStep | 2-3 hours | High |
| ProjectsStep | 3-4 hours | High |
| ReviewStep | 2-3 hours | High |
| AIAssistButton | 1-2 hours | Medium |
| Testing & Polish | 2-4 hours | Medium |

**Total Estimated:** 12-20 hours of development work

---

**Ready to start? Begin with the 5-minute quick start steps above, then tackle PersonalInfoStep first!**
