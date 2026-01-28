# Test Suite Documentation

## Overview

Comprehensive test suite for the Manual Portfolio Creation wizard feature, covering unit tests, integration tests, and component tests.

## Test Coverage

### Components Tested

**Priority 1 - Core Components:**
- ✅ `contexts/ManualPortfolioContext.tsx` - State management
- ✅ `hooks/useManualPortfolio.ts` - Portfolio hook
- ✅ `hooks/useImageUpload.ts` - Image upload hook
- ✅ `hooks/useAIAssist.ts` - AI generation hook
- ✅ `components/portfolio/ManualCreationWizard.tsx` - Main wizard
- ✅ `components/portfolio/steps/PersonalInfoStep.tsx` - Personal info step

**Test Structure:**
```
project-root/
├── contexts/__tests__/
│   └── ManualPortfolioContext.test.tsx
├── hooks/__tests__/
│   ├── useManualPortfolio.test.ts
│   ├── useImageUpload.test.ts
│   └── useAIAssist.test.ts
├── components/portfolio/__tests__/
│   └── ManualCreationWizard.test.tsx
├── components/portfolio/steps/__tests__/
│   └── PersonalInfoStep.test.tsx
└── lib/__tests__/
    └── test-utils.tsx
```

## Setup

### Installation

Install test dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest-environment-jsdom
```

Dependencies are already added to `package.json`.

### Configuration Files

- **jest.config.js** - Jest configuration with Next.js support
- **jest.setup.js** - Global test setup and mocks
- **lib/__tests__/test-utils.tsx** - Reusable test utilities and mock data

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (recommended for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test ManualPortfolioContext
npm test useManualPortfolio
npm test useImageUpload
```

### Specific Test Suite
```bash
npm test -- --testNamePattern="Navigation"
npm test -- --testNamePattern="Draft Management"
```

## Test Categories

### 1. Context Tests (`ManualPortfolioContext.test.tsx`)

**Coverage: State Management**
- ✅ Initial state initialization
- ✅ Step navigation (next, previous, go to)
- ✅ Field updates (single and batch)
- ✅ Draft save/load/recovery
- ✅ Auto-save functionality
- ✅ LocalStorage integration
- ✅ State reset

**Key Test Cases:**
```typescript
describe('ManualPortfolioContext', () => {
  it('should initialize with default state')
  it('should navigate to next step')
  it('should update single field')
  it('should save to localStorage')
  it('should load draft from localStorage')
  it('should auto-save after 30 seconds')
})
```

### 2. Hook Tests

#### `useManualPortfolio.test.ts`
**Coverage: Portfolio Management**
- ✅ State access and helpers
- ✅ Progress calculation
- ✅ Step data validation
- ✅ Navigation helpers
- ✅ Draft operations

#### `useImageUpload.test.ts`
**Coverage: Image Upload**
- ✅ Upload functionality
- ✅ Progress tracking
- ✅ Error handling
- ✅ File validation
- ✅ Remove/update operations
- ✅ Callbacks (onSuccess, onError)

#### `useAIAssist.test.ts`
**Coverage: AI Content Generation**
- ✅ Content generation (summary, experience, project, skills)
- ✅ Loading states
- ✅ Error handling
- ✅ Callbacks
- ✅ Multiple generations

### 3. Component Tests

#### `ManualCreationWizard.test.tsx`
**Coverage: Main Wizard**
- ✅ Initial render
- ✅ Step navigation
- ✅ Draft recovery dialog
- ✅ Save functionality
- ✅ Progress indicator
- ✅ Completion flow

#### `PersonalInfoStep.test.tsx`
**Coverage: Form Step**
- ✅ Field rendering
- ✅ Form validation
- ✅ User interactions
- ✅ AI assist integration
- ✅ Image upload integration
- ✅ Accessibility

## Test Utilities

### Mock Data (`lib/__tests__/test-utils.tsx`)

Pre-built mock data for tests:
```typescript
import { mockPersonalInfo, mockExperience, mockProjects } from '@/lib/__tests__/test-utils'
```

Available mocks:
- `mockPersonalInfo` - Personal information
- `mockExperience` - Work experience array
- `mockEducation` - Education array
- `mockSkills` - Skills array
- `mockProjects` - Projects array
- `mockPortfolioData` - Complete portfolio data
- `mockUser` - User object
- `mockToast` - Toast notifications
- `mockSupabaseClient` - Supabase client

### Custom Render

Use custom render with providers:
```typescript
import { render } from '@/lib/__tests__/test-utils'

render(<YourComponent />)
// Component is wrapped with ManualPortfolioProvider
```

### Test Helpers

```typescript
import {
  waitForLoadingToFinish,
  createMockFile
} from '@/lib/__tests__/test-utils'

// Wait for async operations
await waitForLoadingToFinish()

// Create mock file for upload tests
const file = createMockFile('test.jpg', 1024, 'image/jpeg')
```

## Coverage Goals

Current coverage targets:

```
Global Coverage Thresholds:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%
```

### Coverage by Module

| Module | Coverage | Status |
|--------|----------|--------|
| ManualPortfolioContext | 95%+ | ✅ Excellent |
| useManualPortfolio | 90%+ | ✅ Excellent |
| useImageUpload | 90%+ | ✅ Excellent |
| useAIAssist | 90%+ | ✅ Excellent |
| ManualCreationWizard | 85%+ | ✅ Good |
| PersonalInfoStep | 80%+ | ✅ Good |

## Writing New Tests

### Best Practices

1. **Use Descriptive Test Names**
   ```typescript
   it('should validate email format and show error message')
   // NOT: it('test email validation')
   ```

2. **Follow AAA Pattern**
   ```typescript
   it('should update field', () => {
     // Arrange
     const { result } = renderHook(() => useManualPortfolio())

     // Act
     act(() => {
       result.current.updateField('summary', 'Test')
     })

     // Assert
     expect(result.current.data.summary).toBe('Test')
   })
   ```

3. **Test User Behavior, Not Implementation**
   ```typescript
   // Good: Test what user sees/does
   await user.type(screen.getByLabelText('Email'), 'test@example.com')
   expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()

   // Bad: Test internal implementation
   expect(component.state.email).toBe('test@example.com')
   ```

4. **Use Testing Library Queries Correctly**
   ```typescript
   // Preferred queries (in order):
   getByRole('button', { name: 'Submit' })
   getByLabelText('Email')
   getByPlaceholderText('Enter email')
   getByText('Submit')
   getByTestId('submit-button') // Last resort
   ```

5. **Clean Up After Tests**
   ```typescript
   beforeEach(() => {
     localStorage.clear()
     jest.clearAllMocks()
   })
   ```

### Test Template

```typescript
import React from 'react'
import { render, screen, waitFor } from '@/lib/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import YourComponent from '../YourComponent'

describe('YourComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<YourComponent />)
      expect(screen.getByText('Expected Text')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should handle user input', async () => {
      const user = userEvent.setup()
      render(<YourComponent />)

      const input = screen.getByLabelText('Field')
      await user.type(input, 'test value')

      expect(input).toHaveValue('test value')
    })
  })
})
```

## Debugging Tests

### Run Single Test
```bash
npm test -- --testNamePattern="should navigate to next step"
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Verbose Output
```bash
npm test -- --verbose
```

### Watch Specific File
```bash
npm run test:watch ManualPortfolioContext
```

## Common Issues

### Issue: Tests timeout
**Solution:** Increase timeout or check for async operations
```typescript
it('should save', async () => {
  // Use waitFor for async operations
  await waitFor(() => {
    expect(result.current.isSaving).toBe(false)
  }, { timeout: 5000 })
})
```

### Issue: Act warnings
**Solution:** Wrap state updates in act()
```typescript
await act(async () => {
  await result.current.saveDraft()
})
```

### Issue: localStorage is not defined
**Solution:** Already mocked in jest.setup.js

### Issue: Next.js router not working
**Solution:** Already mocked in jest.setup.js

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:coverage
```

## Continuous Testing

### Pre-commit Hook

Add to `.husky/pre-commit`:
```bash
npm test -- --bail --findRelatedTests
```

### Watch Mode for Development

```bash
npm run test:watch
```

This runs tests automatically when files change.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Support

For questions or issues:
1. Check existing test files for examples
2. Review test-utils.tsx for available helpers
3. Consult Jest/Testing Library documentation
4. Ask team for code review

## Next Steps

To expand test coverage:

1. **Add tests for remaining step components:**
   - ExperienceStep.test.tsx
   - EducationStep.test.tsx
   - SkillsStep.test.tsx
   - ProjectsStep.test.tsx
   - ReviewStep.test.tsx

2. **Add tests for shared components:**
   - ImageUploader.test.tsx
   - AIAssistButton.test.tsx
   - FormField.test.tsx
   - ProgressIndicator.test.tsx

3. **Add integration tests:**
   - Full wizard flow tests
   - API integration tests
   - Image upload to Supabase tests

4. **Add E2E tests with Playwright:**
   - Complete user journey
   - Cross-browser testing
   - Visual regression testing
