import { renderHook, act } from '@testing-library/react'
import { useAIAssist } from '../useAIAssist'
import * as manualPortfolioActions from '@/app/actions/manual-portfolio'
import { toast } from 'sonner'

jest.mock('@/app/actions/manual-portfolio')
jest.mock('sonner')

describe('useAIAssist', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAIAssist())

      expect(result.current.generating).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.result).toBeNull()
    })
  })

  describe('Generate Content', () => {
    it('should generate summary successfully', async () => {
      const mockContent = 'Generated professional summary'
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockResolvedValue(mockContent)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        await result.current.generate('summary', { experience: '5 years' })
      })

      expect(result.current.generating).toBe(false)
      expect(result.current.result).toBe(mockContent)
      expect(result.current.error).toBeNull()
    })

    it('should generate experience description', async () => {
      const mockContent = 'Generated experience description'
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockResolvedValue(mockContent)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        await result.current.generate('experience', {
          company: 'Tech Corp',
          position: 'Senior Engineer',
        })
      })

      expect(result.current.result).toBe(mockContent)
    })

    it('should generate project description', async () => {
      const mockContent = 'Generated project description'
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockResolvedValue(mockContent)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        await result.current.generate('project', {
          name: 'E-commerce Platform',
          technologies: ['React', 'Node.js'],
        })
      })

      expect(result.current.result).toBe(mockContent)
    })

    it('should generate skills suggestions', async () => {
      const mockContent = ['JavaScript', 'TypeScript', 'React', 'Node.js']
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockResolvedValue(mockContent)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        await result.current.generate('skills', {
          role: 'Full Stack Developer',
        })
      })

      expect(result.current.result).toEqual(mockContent)
    })

    it('should rewrite content', async () => {
      const mockContent = 'Improved content with better wording'
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockResolvedValue(mockContent)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        await result.current.generate('rewrite', {
          originalContent: 'Original text',
          tone: 'professional',
        })
      })

      expect(result.current.result).toBe(mockContent)
    })

    it('should set generating state during generation', async () => {
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

      const { result } = renderHook(() => useAIAssist())

      act(() => {
        result.current.generate('summary', {})
      })

      expect(result.current.generating).toBe(true)
    })

    it('should handle generation error', async () => {
      const mockError = new Error('AI service unavailable')
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockRejectedValue(mockError)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        try {
          await result.current.generate('summary', {})
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.generating).toBe(false)
      expect(result.current.error).toBe('AI service unavailable')
      expect(result.current.result).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('AI service unavailable')
    })

    it('should handle generic error message', async () => {
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockRejectedValue('Unknown error')

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        try {
          await result.current.generate('summary', {})
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Failed to generate content')
      expect(toast.error).toHaveBeenCalledWith('Failed to generate content')
    })

    it('should call onSuccess callback', async () => {
      const mockContent = 'Generated content'
      const onSuccess = jest.fn()

      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockResolvedValue(mockContent)

      const { result } = renderHook(() => useAIAssist({ onSuccess }))

      await act(async () => {
        await result.current.generate('summary', {})
      })

      expect(onSuccess).toHaveBeenCalledWith(mockContent)
    })

    it('should call onError callback', async () => {
      const mockError = new Error('Generation failed')
      const onError = jest.fn()

      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockRejectedValue(mockError)

      const { result } = renderHook(() => useAIAssist({ onError }))

      await act(async () => {
        try {
          await result.current.generate('summary', {})
        } catch (error) {
          // Expected to throw
        }
      })

      expect(onError).toHaveBeenCalledWith('Generation failed')
    })

    it('should return generated content', async () => {
      const mockContent = 'Generated content'
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockResolvedValue(mockContent)

      const { result } = renderHook(() => useAIAssist())

      let returnValue: any

      await act(async () => {
        returnValue = await result.current.generate('summary', {})
      })

      expect(returnValue).toBe(mockContent)
    })
  })

  describe('Reset', () => {
    it('should reset result and error', async () => {
      const mockContent = 'Generated content'
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockResolvedValue(mockContent)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        await result.current.generate('summary', {})
      })

      expect(result.current.result).toBe(mockContent)

      act(() => {
        result.current.reset()
      })

      expect(result.current.result).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should reset error after failed generation', async () => {
      const mockError = new Error('Generation failed')
      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockRejectedValue(mockError)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        try {
          await result.current.generate('summary', {})
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Generation failed')

      act(() => {
        result.current.reset()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Multiple Generations', () => {
    it('should clear previous result before new generation', async () => {
      const mockContent1 = 'First generation'
      const mockContent2 = 'Second generation'

      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockResolvedValueOnce(mockContent1)
        .mockResolvedValueOnce(mockContent2)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        await result.current.generate('summary', { input: 'first' })
      })

      expect(result.current.result).toBe(mockContent1)

      await act(async () => {
        await result.current.generate('summary', { input: 'second' })
      })

      expect(result.current.result).toBe(mockContent2)
    })

    it('should clear previous error before new generation', async () => {
      const mockError = new Error('First error')
      const mockContent = 'Success content'

      jest
        .spyOn(manualPortfolioActions, 'generatePortfolioContent')
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockContent)

      const { result } = renderHook(() => useAIAssist())

      await act(async () => {
        try {
          await result.current.generate('summary', {})
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('First error')

      await act(async () => {
        await result.current.generate('summary', {})
      })

      expect(result.current.error).toBeNull()
      expect(result.current.result).toBe(mockContent)
    })
  })
})
