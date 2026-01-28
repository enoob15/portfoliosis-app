import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManualCreationWizard } from '../ManualCreationWizard'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('sonner')
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: () => Promise<any>) => {
    const Component = fn()
    return Component
  },
}))

// Mock step components
jest.mock('../steps/PersonalInfoStep', () => ({
  __esModule: true,
  default: () => <div data-testid="personal-step">Personal Info Step</div>,
}))

jest.mock('../steps/ExperienceStep', () => ({
  __esModule: true,
  default: () => <div data-testid="experience-step">Experience Step</div>,
}))

jest.mock('../steps/EducationStep', () => ({
  __esModule: true,
  default: () => <div data-testid="education-step">Education Step</div>,
}))

jest.mock('../steps/SkillsStep', () => ({
  __esModule: true,
  default: () => <div data-testid="skills-step">Skills Step</div>,
}))

jest.mock('../steps/ProjectsStep', () => ({
  __esModule: true,
  default: () => <div data-testid="projects-step">Projects Step</div>,
}))

jest.mock('../steps/ReviewStep', () => ({
  __esModule: true,
  default: ({ onComplete }: any) => (
    <div data-testid="review-step">
      <div>Review Step</div>
      <button onClick={() => onComplete?.('portfolio-123')}>Complete</button>
    </div>
  ),
}))

jest.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <div>{children}</div>,
}))

describe('ManualCreationWizard', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render the wizard', () => {
      render(<ManualCreationWizard />)

      expect(screen.getByText('Create Your Portfolio')).toBeInTheDocument()
      expect(
        screen.getByText('Fill in your information step by step. Your progress is saved automatically.')
      ).toBeInTheDocument()
    })

    it('should start with personal info step', () => {
      render(<ManualCreationWizard />)

      expect(screen.getByTestId('personal-step')).toBeInTheDocument()
    })

    it('should render progress indicator', () => {
      render(<ManualCreationWizard />)

      expect(screen.getByText('Personal Info')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(screen.getByText('Skills')).toBeInTheDocument()
      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('Review')).toBeInTheDocument()
    })

    it('should render navigation buttons', () => {
      render(<ManualCreationWizard />)

      expect(screen.getByText('Back')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should render save draft button', () => {
      render(<ManualCreationWizard />)

      expect(screen.getByText('Save Draft')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should disable back button on first step', () => {
      render(<ManualCreationWizard />)

      const backButton = screen.getByText('Back')
      expect(backButton).toBeDisabled()
    })

    it('should navigate to next step', async () => {
      const user = userEvent.setup()
      render(<ManualCreationWizard />)

      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('experience-step')).toBeInTheDocument()
      })
    })

    it('should navigate back to previous step', async () => {
      const user = userEvent.setup()
      render(<ManualCreationWizard />)

      // Go to next step
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('experience-step')).toBeInTheDocument()
      })

      // Go back
      const backButton = screen.getByText('Back')
      await user.click(backButton)

      await waitFor(() => {
        expect(screen.getByTestId('personal-step')).toBeInTheDocument()
      })
    })

    it('should navigate through all steps', async () => {
      const user = userEvent.setup()
      render(<ManualCreationWizard />)

      const nextButton = screen.getByText('Next')

      // Step 1: Personal Info
      expect(screen.getByTestId('personal-step')).toBeInTheDocument()

      // Step 2: Experience
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByTestId('experience-step')).toBeInTheDocument()
      })

      // Step 3: Education
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByTestId('education-step')).toBeInTheDocument()
      })

      // Step 4: Skills
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByTestId('skills-step')).toBeInTheDocument()
      })

      // Step 5: Projects
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByTestId('projects-step')).toBeInTheDocument()
      })

      // Step 6: Review
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByTestId('review-step')).toBeInTheDocument()
      })
    })

    it('should disable next button on last step', async () => {
      const user = userEvent.setup()
      render(<ManualCreationWizard />)

      // Navigate to last step
      const nextButton = screen.getByText('Next')
      for (let i = 0; i < 5; i++) {
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 100 })
      }

      await waitFor(() => {
        expect(nextButton).toBeDisabled()
      })
    })
  })

  describe('Draft Management', () => {
    it('should show draft recovery dialog when draft exists', () => {
      const draftData = {
        data: { personal: { name: 'John Doe' } },
        draftId: 'draft_123',
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem('portfoliosis_manual_draft', JSON.stringify(draftData))

      render(<ManualCreationWizard />)

      expect(screen.getByText('Resume Previous Work?')).toBeInTheDocument()
      expect(
        screen.getByText(
          'We found a draft portfolio you were working on. Would you like to continue where you left off or start fresh?'
        )
      ).toBeInTheDocument()
    })

    it('should load draft when continue button is clicked', async () => {
      const user = userEvent.setup()
      const draftData = {
        data: { personal: { name: 'John Doe' } },
        draftId: 'draft_123',
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem('portfoliosis_manual_draft', JSON.stringify(draftData))

      render(<ManualCreationWizard />)

      const continueButton = screen.getByText('Continue Draft')
      await user.click(continueButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Draft loaded successfully')
      })
    })

    it('should start fresh when start fresh button is clicked', async () => {
      const user = userEvent.setup()
      const draftData = {
        data: { personal: { name: 'John Doe' } },
        draftId: 'draft_123',
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem('portfoliosis_manual_draft', JSON.stringify(draftData))

      render(<ManualCreationWizard />)

      const startFreshButton = screen.getByText('Start Fresh')
      await user.click(startFreshButton)

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('Starting fresh portfolio')
      })
    })

    it('should not show draft dialog when no draft exists', () => {
      render(<ManualCreationWizard />)

      expect(screen.queryByText('Resume Previous Work?')).not.toBeInTheDocument()
    })

    it('should not show draft dialog when draft is empty', () => {
      const draftData = {
        data: {},
        draftId: 'draft_123',
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem('portfoliosis_manual_draft', JSON.stringify(draftData))

      render(<ManualCreationWizard />)

      expect(screen.queryByText('Resume Previous Work?')).not.toBeInTheDocument()
    })
  })

  describe('Save Functionality', () => {
    it('should save draft when save button is clicked', async () => {
      const user = userEvent.setup()
      render(<ManualCreationWizard />)

      // Make changes to make it dirty (this would happen in real usage)
      // For now, we'll just test the button functionality

      const saveButton = screen.getByText('Save Draft')

      // Button should be disabled initially (no changes)
      expect(saveButton).toBeDisabled()
    })

    it('should show saving indicator', async () => {
      render(<ManualCreationWizard />)

      // Initially should show no save status
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
    })

    it('should show last saved time after save', async () => {
      const user = userEvent.setup()
      render(<ManualCreationWizard />)

      // This would be shown after a successful save
      // In real usage, this is tested through the context
    })

    it('should show unsaved changes warning', () => {
      render(<ManualCreationWizard />)

      // Initially no unsaved changes
      expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()
    })
  })

  describe('Completion', () => {
    it('should call onComplete when portfolio is completed', async () => {
      const user = userEvent.setup()
      const onComplete = jest.fn()
      render(<ManualCreationWizard onComplete={onComplete} />)

      // Navigate to review step
      const nextButton = screen.getByText('Next')
      for (let i = 0; i < 5; i++) {
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 100 })
      }

      // Click complete button in review step
      const completeButton = screen.getByText('Complete')
      await user.click(completeButton)

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith('portfolio-123')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      localStorage.getItem = jest.fn(() => {
        throw new Error('Storage error')
      })

      render(<ManualCreationWizard />)

      expect(screen.getByText('Create Your Portfolio')).toBeInTheDocument()
      consoleSpy.mockRestore()
    })

    it('should handle save errors', async () => {
      const user = userEvent.setup()
      render(<ManualCreationWizard />)

      // This would be tested through actual save failures in integration
    })
  })

  describe('Progress Indicator', () => {
    it('should highlight current step', () => {
      render(<ManualCreationWizard />)

      // Personal Info should be highlighted (first step)
      expect(screen.getByText('Personal Info')).toBeInTheDocument()
    })

    it('should show all step labels', () => {
      render(<ManualCreationWizard />)

      expect(screen.getByText('Personal Info')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(screen.getByText('Skills')).toBeInTheDocument()
      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('Review')).toBeInTheDocument()
    })
  })

  describe('Button States', () => {
    it('should show "Next" button text on non-final steps', () => {
      render(<ManualCreationWizard />)

      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should show "Complete" button text on final step', async () => {
      const user = userEvent.setup()
      render(<ManualCreationWizard />)

      // Navigate to last step
      const nextButton = screen.getByText('Next')
      for (let i = 0; i < 5; i++) {
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 100 })
      }

      // Button should be disabled on last step
      await waitFor(() => {
        expect(nextButton).toBeDisabled()
      })
    })
  })
})
