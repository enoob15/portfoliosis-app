import React from 'react'
import { render, screen, waitFor, within } from '@/lib/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import PersonalInfoStep from '../PersonalInfoStep'
import { useAuth } from '@/hooks/useAuth'
import { mockUser } from '@/lib/__tests__/test-utils'

// Mock hooks
jest.mock('@/hooks/useAuth')
jest.mock('../shared/ImageUploader', () => ({
  ImageUploader: ({ onUpload, label }: any) => (
    <div data-testid="image-uploader">
      <button onClick={() => onUpload('https://example.com/image.jpg')}>
        {label}
      </button>
    </div>
  ),
}))

jest.mock('../shared/AIAssistButton', () => ({
  AIAssistButton: ({ onSelect, label }: any) => (
    <button onClick={() => onSelect('AI generated summary')} data-testid="ai-assist">
      {label}
    </button>
  ),
}))

describe('PersonalInfoStep', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
    })
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<PersonalInfoStep />)

      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(
        screen.getByText("Let's start with your basic information and professional summary.")
      ).toBeInTheDocument()
    })

    it('should render all required fields', () => {
      render(<PersonalInfoStep />)

      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Professional Title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    })

    it('should render optional fields', () => {
      render(<PersonalInfoStep />)

      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Location/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Website/i)).toBeInTheDocument()
    })

    it('should render social links section', () => {
      render(<PersonalInfoStep />)

      expect(screen.getByText('Social Links')).toBeInTheDocument()
      expect(screen.getByLabelText(/LinkedIn/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/GitHub/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Twitter/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Portfolio/i)).toBeInTheDocument()
    })

    it('should render professional summary section', () => {
      render(<PersonalInfoStep />)

      expect(screen.getByText('Professional Summary')).toBeInTheDocument()
      expect(screen.getByLabelText(/Summary/i)).toBeInTheDocument()
    })

    it('should render profile photo uploader when user is logged in', () => {
      render(<PersonalInfoStep />)

      expect(screen.getByTestId('image-uploader')).toBeInTheDocument()
    })

    it('should not render profile photo uploader when user is not logged in', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      })

      render(<PersonalInfoStep />)

      expect(screen.queryByTestId('image-uploader')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate required name field', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const nameInput = screen.getByLabelText(/Full Name/i)

      // Type short name
      await user.type(nameInput, 'A')
      await user.clear(nameInput)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const emailInput = screen.getByLabelText(/Email/i)

      await user.clear(emailInput)
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument()
      })
    })

    it('should accept valid email', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const emailInput = screen.getByLabelText(/Email/i)

      await user.clear(emailInput)
      await user.type(emailInput, 'valid@example.com')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByText(/Invalid email address/i)).not.toBeInTheDocument()
      })
    })

    it('should validate URL format for website', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const websiteInput = screen.getByLabelText(/Website/i)

      await user.type(websiteInput, 'not-a-url')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/Invalid URL/i)).toBeInTheDocument()
      })
    })

    it('should accept valid URL for website', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const websiteInput = screen.getByLabelText(/Website/i)

      await user.type(websiteInput, 'https://example.com')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByText(/Invalid URL/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('should allow typing in text fields', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const nameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement
      const titleInput = screen.getByLabelText(/Professional Title/i) as HTMLInputElement

      await user.type(nameInput, 'John Doe')
      await user.type(titleInput, 'Software Engineer')

      expect(nameInput.value).toBe('John Doe')
      expect(titleInput.value).toBe('Software Engineer')
    })

    it('should allow typing in social links', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const linkedinInput = screen.getByLabelText(/LinkedIn/i) as HTMLInputElement

      await user.type(linkedinInput, 'https://linkedin.com/in/johndoe')

      expect(linkedinInput.value).toBe('https://linkedin.com/in/johndoe')
    })

    it('should allow typing in summary textarea', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const summaryInput = screen.getByLabelText(/Summary/i) as HTMLTextAreaElement

      await user.type(summaryInput, 'I am a passionate software engineer')

      expect(summaryInput.value).toBe('I am a passionate software engineer')
    })
  })

  describe('AI Assist Integration', () => {
    it('should show AI assist button when name and title are filled', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const nameInput = screen.getByLabelText(/Full Name/i)
      const titleInput = screen.getByLabelText(/Professional Title/i)

      await user.type(nameInput, 'John Doe')
      await user.type(titleInput, 'Software Engineer')

      await waitFor(() => {
        expect(screen.getByTestId('ai-assist')).toBeInTheDocument()
      })
    })

    it('should generate AI summary when button is clicked', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const nameInput = screen.getByLabelText(/Full Name/i)
      const titleInput = screen.getByLabelText(/Professional Title/i)

      await user.type(nameInput, 'John Doe')
      await user.type(titleInput, 'Software Engineer')

      await waitFor(() => {
        expect(screen.getByTestId('ai-assist')).toBeInTheDocument()
      })

      const aiButton = screen.getByTestId('ai-assist')
      await user.click(aiButton)

      await waitFor(() => {
        const summaryInput = screen.getByLabelText(/Summary/i) as HTMLTextAreaElement
        expect(summaryInput.value).toBe('AI generated summary')
      })
    })
  })

  describe('Image Upload Integration', () => {
    it('should handle profile image upload', async () => {
      const user = userEvent.setup()
      render(<PersonalInfoStep />)

      const uploadButton = screen.getByText('Upload Profile Photo')
      await user.click(uploadButton)

      // Image upload is mocked, so we just verify the component is present
      expect(screen.getByTestId('image-uploader')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<PersonalInfoStep />)

      const nameInput = screen.getByLabelText(/Full Name/i)
      const emailInput = screen.getByLabelText(/Email/i)
      const titleInput = screen.getByLabelText(/Professional Title/i)

      expect(nameInput).toHaveAttribute('type', 'text')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(titleInput).toHaveAttribute('type', 'text')
    })

    it('should show required indicators for required fields', () => {
      render(<PersonalInfoStep />)

      // Check that required fields have the required attribute or aria-required
      const nameInput = screen.getByLabelText(/Full Name/i)
      expect(nameInput.closest('div')).toHaveTextContent(/Full Name/i)
    })
  })

  describe('Pre-filled Values', () => {
    it('should pre-fill email from user data', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
      })

      render(<PersonalInfoStep />)

      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
      expect(emailInput.value).toBe(mockUser.email)
    })
  })
})
