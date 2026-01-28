# Manual Portfolio Creation - State Management Documentation

## Overview

This document describes the state management infrastructure for the Manual Portfolio Creation feature. The implementation includes three core files that work together to provide a robust, production-ready solution.

## Files Created

### 1. `contexts/ManualPortfolioContext.tsx`
**Status:** ✅ Implemented
**Location:** `C:\GitHub\Projects\portfoliosis-app\contexts\ManualPortfolioContext.tsx`

**Features Implemented:**
- ✅ React Context with useReducer for state management
- ✅ Auto-save functionality (30-second interval)
- ✅ localStorage persistence for draft data
- ✅ Step navigation (6 steps: personal → experience → education → skills → projects → review)
- ✅ Draft ID tracking for server synchronization
- ✅ Save status tracking (isDirty, isSaving, lastSaved)

**Recommended Enhancements:**
1. **Enhanced Save Status Tracking**
   - Add `SaveStatus` type: 'idle' | 'saving' | 'saved' | 'error'
   - Add `saveError` field for error messages
   - Add visual feedback for save states

2. **Draft Age Tracking**
   - Add timestamp tracking in localStorage
   - Implement `getDraftAge()` helper
   - Auto-delete drafts older than 30 days

3. **Conflict Resolution**
   - Add `STORAGE_TIMESTAMP_KEY` for multi-tab detection
   - Warn users if draft is modified in another tab
   - Implement last-write-wins strategy

4. **Error Handling**
   - Add `CLEAR_ERROR` action
   - Handle QuotaExceededError for localStorage
   - Add `clearError()` method to context

5. **Lifecycle Management**
   - Add beforeunload handler to warn about unsaved changes
   - Save to localStorage before page close
   - Add `clearDraft()` method

### 2. `hooks/useManualPortfolio.ts`
**Status:** ✅ Implemented
**Location:** `C:\GitHub\Projects\portfoliosis-app\hooks\useManualPortfolio.ts`

**Features Implemented:**
- ✅ Simplified API for components
- ✅ Progress calculation (`getProgress()`)
- ✅ Step data validation (`hasStepData()`)
- ✅ Navigation helpers
- ✅ State access with TypeScript types

**Recommended Enhancements:**
1. **Validation Integration**
   ```typescript
   import { validateStep } from '@/lib/validation/portfolio-schema';

   const validateCurrentStep = useCallback(() => {
     const stepData = state.data[state.currentStep];
     return validateStep(state.currentStep, stepData);
   }, [state.currentStep, state.data]);

   const canProceedToNextStep = useCallback(() => {
     const validation = validateCurrentStep();
     return validation.success;
   }, [validateCurrentStep]);
   ```

2. **Step Completion Tracking**
   ```typescript
   const getCompletedSteps = useCallback(() => {
     const completed: ManualPortfolioStep[] = [];
     if (hasStepData('personal')) completed.push('personal');
     if (hasStepData('experience')) completed.push('experience');
     if (hasStepData('education')) completed.push('education');
     if (hasStepData('skills')) completed.push('skills');
     if (hasStepData('projects')) completed.push('projects');
     return completed;
   }, [hasStepData]);

   const isStepComplete = useCallback((step: ManualPortfolioStep) => {
     const validation = validateStep(step, state.data[step]);
     return validation.success;
   }, [state.data]);
   ```

3. **Auto-Save Status Helpers**
   ```typescript
   const getSaveStatusMessage = useCallback(() => {
     if (state.isSaving) return 'Saving...';
     if (state.saveError) return `Error: ${state.saveError}`;
     if (state.lastSaved) {
       const seconds = Math.floor((Date.now() - state.lastSaved.getTime()) / 1000);
       if (seconds < 60) return 'Saved just now';
       if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)} minutes ago`;
       return `Saved ${Math.floor(seconds / 3600)} hours ago`;
     }
     return 'Not saved';
   }, [state.isSaving, state.saveError, state.lastSaved]);
   ```

4. **Array Item Helpers**
   ```typescript
   const addExperience = useCallback(() => {
     const newExp: Experience = {
       id: `exp_${Date.now()}`,
       company: '',
       position: '',
       startDate: '',
       description: '',
       highlights: []
     };
     updateData({
       experience: [...(state.data.experience || []), newExp]
     });
   }, [state.data.experience, updateData]);

   const removeExperience = useCallback((id: string) => {
     updateData({
       experience: state.data.experience?.filter(exp => exp.id !== id)
     });
   }, [state.data.experience, updateData]);

   const updateExperience = useCallback((id: string, updates: Partial<Experience>) => {
     updateData({
       experience: state.data.experience?.map(exp =>
         exp.id === id ? { ...exp, ...updates } : exp
       )
     });
   }, [state.data.experience, updateData]);
   ```

### 3. `lib/validation/portfolio-schema.ts`
**Status:** ✅ Implemented
**Location:** `C:\GitHub\Projects\portfoliosis-app\lib\validation\portfolio-schema.ts`

**Features Implemented:**
- ✅ Zod schemas for all form sections
- ✅ Personal information validation
- ✅ Experience validation
- ✅ Education validation
- ✅ Skills validation (minimum 3 skills)
- ✅ Projects validation
- ✅ Complete resume schema
- ✅ TypeScript type exports
- ✅ `validateStep()` helper function

**Recommended Enhancements:**
1. **Date Validation**
   ```typescript
   const dateStringSchema = z.string()
     .refine((date) => {
       const parsed = new Date(date);
       return !isNaN(parsed.getTime());
     }, 'Invalid date format')
     .refine((date) => {
       const parsed = new Date(date);
       return parsed <= new Date();
     }, 'Date cannot be in the future');

   const experienceSchema = z.object({
     // ... other fields
     startDate: dateStringSchema,
     endDate: z.union([dateStringSchema, z.literal('')]).optional(),
   }).refine((data) => {
     if (data.endDate && data.endDate !== '') {
       return new Date(data.endDate) >= new Date(data.startDate);
     }
     return true;
   }, {
     message: 'End date must be after start date',
     path: ['endDate']
   });
   ```

2. **Refined Validation Messages**
   ```typescript
   export const personalInfoSchema = z.object({
     name: z.string()
       .min(2, 'Name must be at least 2 characters')
       .max(100, 'Name must not exceed 100 characters')
       .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
     email: z.string()
       .email('Please enter a valid email address')
       .toLowerCase(),
     phone: z.string()
       .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
       .optional()
       .or(z.literal('')),
     website: z.string()
       .url('Please enter a valid URL (e.g., https://example.com)')
       .optional()
       .or(z.literal('')),
   });
   ```

3. **Step-by-Step Validation**
   ```typescript
   export function validateStepWithDetails(step: string, data: any) {
     try {
       let schema;
       switch (step) {
         case 'personal':
           schema = personalInfoSchema;
           break;
         case 'experience':
           schema = experienceListSchema;
           break;
         case 'education':
           schema = educationListSchema;
           break;
         case 'skills':
           schema = skillsListSchema;
           break;
         case 'projects':
           schema = projectsListSchema;
           break;
         case 'review':
           schema = completeResumeSchema;
           break;
         default:
           throw new Error(`Invalid step: ${step}`);
       }

       const result = schema.safeParse(data);

       if (result.success) {
         return {
           success: true,
           data: result.data,
           errors: []
         };
       } else {
         return {
           success: false,
           data: null,
           errors: result.error.errors.map(err => ({
             field: err.path.join('.'),
             message: err.message,
             code: err.code
           }))
         };
       }
     } catch (error) {
       return {
         success: false,
         data: null,
         errors: [{
           field: 'general',
           message: error instanceof Error ? error.message : 'Validation failed',
           code: 'unknown_error'
         }]
       };
     }
   }
   ```

4. **Partial Validation (for in-progress forms)**
   ```typescript
   export const partialPersonalInfoSchema = personalInfoSchema.partial();
   export const partialExperienceSchema = experienceSchema.partial();
   export const partialEducationSchema = educationSchema.partial();
   export const partialSkillSchema = skillSchema.partial();
   export const partialProjectSchema = projectSchema.partial();

   // For showing warnings instead of errors on incomplete forms
   export function validatePartialStep(step: string, data: any) {
     const partialSchemas: Record<string, z.ZodSchema> = {
       personal: partialPersonalInfoSchema,
       experience: z.array(partialExperienceSchema).optional(),
       education: z.array(partialEducationSchema).optional(),
       skills: z.array(partialSkillSchema).optional(),
       projects: z.array(partialProjectSchema).optional(),
     };

     const schema = partialSchemas[step];
     if (!schema) return { success: true, warnings: [] };

     const result = schema.safeParse(data);
     return {
       success: result.success,
       warnings: result.success ? [] : result.error.errors
     };
   }
   ```

## Integration Example

### In a Step Component

```typescript
// components/portfolio/steps/PersonalInfoStep.tsx
'use client';

import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { personalInfoSchema } from '@/lib/validation/portfolio-schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export function PersonalInfoStep() {
  const {
    data,
    updateData,
    nextStep,
    isSaving,
    lastSaved,
    saveError,
    clearError
  } = useManualPortfolio();

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data.personal || {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      social: {}
    }
  });

  const onSubmit = (formData: PersonalInfoFormData) => {
    updateData({ personal: formData });
    nextStep();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Save Status Indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <div className="text-sm text-gray-500">
          {isSaving && 'Saving...'}
          {!isSaving && lastSaved && `Saved ${formatTimeAgo(lastSaved)}`}
          {saveError && (
            <span className="text-red-600">
              Error: {saveError}
              <button onClick={clearError} className="ml-2 underline">
                Dismiss
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Form fields */}
      <div>
        <label>Name *</label>
        <input
          {...form.register('name')}
          className="w-full border rounded p-2"
        />
        {form.formState.errors.name && (
          <p className="text-red-600 text-sm mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* More fields... */}

      <button
        type="submit"
        disabled={isSaving}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Continue
      </button>
    </form>
  );
}
```

### In the Main Wizard

```typescript
// components/portfolio/ManualCreationWizard.tsx
'use client';

import { useEffect } from 'react';
import { ManualPortfolioProvider } from '@/contexts/ManualPortfolioContext';
import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
// ... other imports

function WizardContent() {
  const {
    currentStep,
    loadDraft,
    getDraftAge,
    getProgress,
    data
  } = useManualPortfolio();

  // Load draft on mount
  useEffect(() => {
    const age = getDraftAge();
    if (age !== null && age < 30 * 24 * 60 * 60 * 1000) {
      // Draft exists and is less than 30 days old
      if (confirm('We found a draft from your previous session. Would you like to continue where you left off?')) {
        loadDraft();
      }
    }
  }, []);

  const progress = getProgress();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Step {Math.floor(progress / (100 / 6))} of 6
        </p>
      </div>

      {/* Step Content */}
      {currentStep === 'personal' && <PersonalInfoStep />}
      {currentStep === 'experience' && <ExperienceStep />}
      {/* ... other steps */}
    </div>
  );
}

export function ManualCreationWizard() {
  return (
    <ManualPortfolioProvider>
      <WizardContent />
    </ManualPortfolioProvider>
  );
}
```

## Testing Checklist

### State Management Tests
- [ ] Auto-save triggers after 30 seconds of inactivity
- [ ] Draft is saved to localStorage on data change
- [ ] Draft is loaded correctly on page reload
- [ ] Old drafts (>30 days) are ignored/deleted
- [ ] beforeunload warning shows when there are unsaved changes
- [ ] Step navigation works correctly
- [ ] canGoNext/canGoBack logic is correct

### Hook Tests
- [ ] `getProgress()` returns correct percentage
- [ ] `hasStepData()` correctly identifies filled steps
- [ ] `validateCurrentStep()` integrates with Zod schemas
- [ ] Array helpers (add/remove/update) work correctly
- [ ] Save status message updates correctly

### Validation Tests
- [ ] Personal info schema validates all fields
- [ ] Email format is validated
- [ ] URLs are validated (optional fields accept empty string)
- [ ] Date validation works (start date < end date)
- [ ] Array minimums are enforced (3 skills, 1 experience, etc.)
- [ ] Error messages are user-friendly
- [ ] Partial validation allows incomplete drafts

## Performance Considerations

1. **Debouncing**
   - Auto-save uses 30-second debounce to prevent excessive saves
   - localStorage saves are immediate but lightweight

2. **Memory Management**
   - Use `useCallback` for all context methods
   - Cleanup timers in useEffect
   - Remove event listeners on unmount

3. **Storage Optimization**
   - Store only necessary data in localStorage
   - Compress large text fields if needed
   - Handle QuotaExceededError gracefully

## Security Considerations

1. **XSS Prevention**
   - Sanitize user input before rendering
   - Use React's built-in XSS protection
   - Validate all URLs before allowing navigation

2. **Data Privacy**
   - localStorage is client-side only
   - Server-side draft storage should be user-scoped
   - Clear sensitive data on logout

3. **Validation**
   - Never trust client-side validation alone
   - Validate on server before saving to database
   - Use type-safe schemas (Zod) on both client and server

## Future Enhancements

1. **Conflict Resolution**
   - Detect when draft is modified in another tab
   - Implement merge strategy for conflicts
   - Show diff UI for conflicting changes

2. **Version History**
   - Save draft versions with timestamps
   - Allow users to restore previous versions
   - Implement undo/redo functionality

3. **Collaboration**
   - Real-time sync for multiple users editing same portfolio
   - Show presence indicators
   - Implement operational transformation for conflict-free editing

4. **Analytics**
   - Track which steps users spend most time on
   - Monitor validation error rates
   - Measure auto-save success rate

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

## File Locations

```
portfoliosis-app/
├── contexts/
│   └── ManualPortfolioContext.tsx     ✅ Core state management
├── hooks/
│   └── useManualPortfolio.ts           ✅ Consumer hook with helpers
├── lib/
│   └── validation/
│       └── portfolio-schema.ts          ✅ Zod schemas and validation
└── types/
    └── profile.ts                       ✅ TypeScript interfaces (existing)
```

## Status Summary

| File | Status | Features | Enhancements Needed |
|------|--------|----------|-------------------|
| ManualPortfolioContext.tsx | ✅ Implemented | Auto-save, localStorage, navigation | Error handling, conflict resolution, draft age |
| useManualPortfolio.ts | ✅ Implemented | Progress, validation helpers | Step completion, array helpers, save status |
| portfolio-schema.ts | ✅ Implemented | All field validation | Date validation, partial schemas, detailed errors |

## Next Steps

1. **Implement recommended enhancements** (see sections above)
2. **Create step components** using these foundations
3. **Add server actions** for persistent draft storage
4. **Write comprehensive tests** for all scenarios
5. **Add error boundaries** for graceful error handling
6. **Implement analytics** for monitoring usage

---

**Last Updated:** 2026-01-25
**Version:** 1.0
**Author:** Backend Architect Agent
