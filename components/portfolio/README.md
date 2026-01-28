# Manual Portfolio Creation Wizard

A complete 6-step wizard interface for creating portfolios manually, with AI assistance, auto-save, and draft recovery.

## Quick Fix Required

**Before using, fix the import order bug:**

```bash
# Windows Command Prompt or PowerShell
del ManualCreationWizard.tsx
rename ManualCreationWizard.fixed.tsx ManualCreationWizard.tsx
```

Or manually:
1. Delete `ManualCreationWizard.tsx`
2. Rename `ManualCreationWizard.fixed.tsx` to `ManualCreationWizard.tsx`

## Usage

### Basic Implementation

```typescript
import { ManualCreationWizard } from '@/components/portfolio/ManualCreationWizard';

export default function CreatePortfolioPage() {
  const handleComplete = (portfolioId: string) => {
    // Redirect to portfolio view or dashboard
    router.push(`/portfolios/${portfolioId}`);
  };

  return (
    <div className="container">
      <ManualCreationWizard onComplete={handleComplete} />
    </div>
  );
}
```

### With Draft ID (Resume Editing)

```typescript
<ManualCreationWizard
  draftId="existing-draft-123"
  onComplete={handleComplete}
/>
```

## Features

### 1. Draft Recovery
- Automatically detects saved drafts in localStorage
- Shows recovery dialog on mount if draft exists
- Options to continue or start fresh

### 2. Auto-Save
- Saves every 30 seconds when changes detected
- Saves on step navigation
- Visual indicator shows save status
- Manual save button available

### 3. Progress Tracking
- Visual progress bar
- Step completion indicators
- 6 distinct steps with descriptions

### 4. Step Navigation
- Back/Next buttons
- Keyboard navigation support
- Disabled states when appropriate
- Validation before proceeding

## Architecture

### Components

```
ManualCreationWizard (Main Container)
├── ProgressIndicator (Visual Progress)
├── Dialog (Draft Recovery)
└── WizardContent
    ├── Step 1: PersonalInfoStep
    ├── Step 2: ExperienceStep
    ├── Step 3: EducationStep
    ├── Step 4: SkillsStep
    ├── Step 5: ProjectsStep
    └── Step 6: ReviewStep
```

### State Management

Uses `ManualPortfolioContext` which provides:

```typescript
{
  // State
  state: {
    currentStep: 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'review',
    data: Partial<ParsedResume>,
    isDirty: boolean,
    lastSaved: Date | null,
    isSaving: boolean,
    draftId: string | null
  },

  // Navigation
  goToStep: (step: ManualPortfolioStep) => void,
  nextStep: () => void,
  previousStep: () => void,
  canGoNext: boolean,
  canGoBack: boolean,

  // Data Management
  updateField: (field: string, value: any) => void,
  updateData: (data: Partial<ParsedResume>) => void,
  saveDraft: () => Promise<void>,
  loadDraft: () => void,
  reset: () => void
}
```

## Shared Components

### FormField

Reusable form field wrapper with label, error, and hint display.

```typescript
import { FormField } from './shared/FormField';

<FormField
  label="Email Address"
  required
  error={errors.email?.message}
  hint="We'll never share your email"
>
  <Input type="email" {...register('email')} />
</FormField>
```

### ProgressIndicator

Visual progress bar showing all steps.

```typescript
import { ProgressIndicator } from './shared/ProgressIndicator';

<ProgressIndicator
  steps={STEPS}
  currentStep={currentStep}
  className="mb-12"
/>
```

### ImageUploader

Image upload with crop, preview, and drag-drop.

```typescript
import { ImageUploader } from './shared/ImageUploader';

<ImageUploader
  aspectRatio={1} // Square
  maxSize={5 * 1024 * 1024} // 5MB
  onUpload={(url) => setValue('avatar', url)}
  currentImage={currentAvatar}
/>
```

### AIAssistButton

AI-powered content generation trigger.

```typescript
import { AIAssistButton } from './shared/AIAssistButton';

<AIAssistButton
  type="summary"
  input={{ name, title, experience }}
  onSelect={(content) => setValue('summary', content)}
/>
```

## Styling

All components use:
- Tailwind CSS for styling
- shadcn/ui components for consistency
- Responsive design (mobile-first)
- Dark mode ready
- WCAG AA accessibility compliance

## Data Structure

The wizard works with the `ParsedResume` type:

```typescript
interface ParsedResume {
  personal: ContactInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  awards?: Award[];
}
```

## Validation

Each step uses Zod schemas for validation:

```typescript
// Example: Personal Info Schema
const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  title: z.string().min(2, 'Title is required'),
  // ... more fields
});
```

## Auto-Save Configuration

Configure in `contexts/ManualPortfolioContext.tsx`:

```typescript
// Auto-save interval (30 seconds)
const AUTO_SAVE_INTERVAL = 30000;

// localStorage key
const STORAGE_KEY = 'portfoliosis_manual_draft';
```

## Events

### onComplete

Called when wizard is completed successfully:

```typescript
const handleComplete = (portfolioId: string) => {
  console.log('Portfolio created:', portfolioId);
  // Navigate to portfolio view
  router.push(`/portfolios/${portfolioId}`);
};
```

## Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManualCreationWizard } from './ManualCreationWizard';

describe('ManualCreationWizard', () => {
  it('shows draft recovery dialog if draft exists', async () => {
    localStorage.setItem('portfoliosis_manual_draft', JSON.stringify({
      data: { personal: { name: 'John' } },
      timestamp: new Date().toISOString()
    }));

    render(<ManualCreationWizard />);

    expect(await screen.findByText('Resume Previous Work?')).toBeInTheDocument();
  });

  it('navigates through steps', async () => {
    const user = userEvent.setup();
    render(<ManualCreationWizard />);

    // Start on step 1
    expect(screen.getByText('Personal Info')).toHaveClass('text-primary');

    // Click next
    await user.click(screen.getByText('Next'));

    // Now on step 2
    expect(screen.getByText('Experience')).toHaveClass('text-primary');
  });
});
```

## Troubleshooting

### Draft not recovering
- Check browser localStorage for `portfoliosis_manual_draft`
- Ensure data object is not empty
- Check console for JSON parse errors

### Auto-save not working
- Verify `isDirty` state is true after changes
- Check console for save errors
- Ensure localStorage is not full

### Navigation disabled
- Check `canGoNext` / `canGoBack` state
- Verify current step validation
- Ensure not on first/last step

## Performance

- Dynamic imports reduce initial bundle size
- Code splitting per step
- Debounced auto-save (30s)
- Memoized event handlers
- Optimistic UI updates

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Fully responsive

## License

Part of the Portfoliosis application.
