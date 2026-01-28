import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  ManualPortfolioProvider,
  useManualPortfolioContext,
  ManualPortfolioStep,
} from '../ManualPortfolioContext'
import { mockPortfolioData } from '@/lib/__tests__/test-utils'

describe('ManualPortfolioContext', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ManualPortfolioProvider>{children}</ManualPortfolioProvider>
  )

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      expect(result.current.state.currentStep).toBe('personal')
      expect(result.current.state.data).toEqual({})
      expect(result.current.state.isDirty).toBe(false)
      expect(result.current.state.lastSaved).toBeNull()
      expect(result.current.state.isSaving).toBe(false)
      expect(result.current.state.draftId).toBeNull()
    })

    it('should throw error when used outside provider', () => {
      // Suppress console error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useManualPortfolioContext())
      }).toThrow('useManualPortfolioContext must be used within ManualPortfolioProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('Navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.nextStep()
      })

      expect(result.current.state.currentStep).toBe('experience')
    })

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.nextStep()
        result.current.nextStep()
      })

      expect(result.current.state.currentStep).toBe('education')

      act(() => {
        result.current.previousStep()
      })

      expect(result.current.state.currentStep).toBe('experience')
    })

    it('should navigate to specific step', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.goToStep('projects' as ManualPortfolioStep)
      })

      expect(result.current.state.currentStep).toBe('projects')
    })

    it('should not go beyond last step', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.goToStep('review' as ManualPortfolioStep)
      })

      expect(result.current.canGoNext).toBe(false)

      act(() => {
        result.current.nextStep()
      })

      expect(result.current.state.currentStep).toBe('review')
    })

    it('should not go before first step', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      expect(result.current.canGoBack).toBe(false)

      act(() => {
        result.current.previousStep()
      })

      expect(result.current.state.currentStep).toBe('personal')
    })
  })

  describe('Data Management', () => {
    it('should update single field', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.updateField('summary', 'Test summary')
      })

      expect(result.current.state.data.summary).toBe('Test summary')
      expect(result.current.state.isDirty).toBe(true)
    })

    it('should update multiple fields', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.updateData({
          personal: mockPortfolioData.personal,
          summary: mockPortfolioData.summary,
        })
      })

      expect(result.current.state.data.personal).toEqual(mockPortfolioData.personal)
      expect(result.current.state.data.summary).toBe(mockPortfolioData.summary)
      expect(result.current.state.isDirty).toBe(true)
    })

    it('should preserve existing data when updating', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.updateField('summary', 'First update')
      })

      act(() => {
        result.current.updateField('personal', mockPortfolioData.personal)
      })

      expect(result.current.state.data.summary).toBe('First update')
      expect(result.current.state.data.personal).toEqual(mockPortfolioData.personal)
    })
  })

  describe('Draft Management', () => {
    it('should save to localStorage', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.updateData(mockPortfolioData)
      })

      expect(localStorage.setItem).toHaveBeenCalled()
      const savedData = localStorage.setItem.mock.calls[0][1]
      expect(JSON.parse(savedData).data).toEqual(mockPortfolioData)
    })

    it('should load draft from localStorage', () => {
      const draftData = {
        data: mockPortfolioData,
        draftId: 'draft_123',
        timestamp: new Date().toISOString(),
      }

      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(draftData))

      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.loadDraft()
      })

      expect(result.current.state.data).toEqual(mockPortfolioData)
      expect(result.current.state.draftId).toBe('draft_123')
      expect(result.current.state.isDirty).toBe(false)
    })

    it('should handle load error gracefully', () => {
      localStorage.getItem = jest.fn().mockReturnValue('invalid json')
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.loadDraft()
      })

      expect(result.current.state.data).toEqual({})
      consoleSpy.mockRestore()
    })

    it('should save draft with auto-save', async () => {
      jest.useFakeTimers()
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.updateField('summary', 'Auto-save test')
      })

      expect(result.current.state.isDirty).toBe(true)

      // Fast-forward time to trigger auto-save
      act(() => {
        jest.advanceTimersByTime(30000)
      })

      await waitFor(() => {
        expect(result.current.state.isDirty).toBe(false)
      })

      jest.useRealTimers()
    })

    it('should save draft manually', async () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.updateField('summary', 'Manual save test')
      })

      expect(result.current.state.isDirty).toBe(true)

      await act(async () => {
        await result.current.saveDraft()
      })

      expect(result.current.state.isDirty).toBe(false)
      expect(result.current.state.lastSaved).not.toBeNull()
      expect(result.current.state.draftId).not.toBeNull()
    })

    it('should not save if not dirty', async () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      const initialLastSaved = result.current.state.lastSaved

      await act(async () => {
        await result.current.saveDraft()
      })

      expect(result.current.state.lastSaved).toBe(initialLastSaved)
    })
  })

  describe('Reset', () => {
    it('should reset state to initial values', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.updateData(mockPortfolioData)
        result.current.nextStep()
      })

      expect(result.current.state.data).toEqual(mockPortfolioData)
      expect(result.current.state.currentStep).toBe('experience')

      act(() => {
        result.current.reset()
      })

      expect(result.current.state.currentStep).toBe('personal')
      expect(result.current.state.data).toEqual({})
      expect(result.current.state.isDirty).toBe(false)
      expect(result.current.state.lastSaved).toBeNull()
      expect(result.current.state.draftId).toBeNull()
    })

    it('should clear localStorage on reset', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      act(() => {
        result.current.updateField('summary', 'Test')
        result.current.reset()
      })

      expect(localStorage.removeItem).toHaveBeenCalledWith('portfoliosis_manual_draft')
    })
  })

  describe('canGoNext and canGoBack', () => {
    it('should correctly report navigation abilities', () => {
      const { result } = renderHook(() => useManualPortfolioContext(), { wrapper })

      // First step
      expect(result.current.canGoBack).toBe(false)
      expect(result.current.canGoNext).toBe(true)

      // Middle step
      act(() => {
        result.current.goToStep('skills' as ManualPortfolioStep)
      })

      expect(result.current.canGoBack).toBe(true)
      expect(result.current.canGoNext).toBe(true)

      // Last step
      act(() => {
        result.current.goToStep('review' as ManualPortfolioStep)
      })

      expect(result.current.canGoBack).toBe(true)
      expect(result.current.canGoNext).toBe(false)
    })
  })
})
